import { TypeResolver, TypeNode, Edge, LiteralTypeResolver } from './TypeGraph';
import { TypeResolutionContext, resolveReturnType } from './TypePropagator';
import {
  VoidType,
  UnionType,
  i32,
  f32,
  FunctionType,
  Type,
  IntersectionType,
  bool,
  toConcreteType,
  InvalidType
} from '../types';
import { annotations } from '../annotations';
import { Nodes } from '../nodes';
import { fromTypeNode } from './TypeGraphBuilder';
import { findBuiltInTypedBinaryOperation } from '../../compiler/languageOperations';
import { last } from '../helpers';
import { TypeMismatch, InvalidOverload, NotAFunction } from '../NodeError';

declare var console;

const INVALID_TYPE = InvalidType.instance;

export const EdgeLabels = {
  CONDITION: 'CONDITION',
  TRUE_PART: 'TRUE_PART',
  FALSE_PART: 'FALSE_PART',
  BLOCK: 'BLOCK',
  PARAMETER: 'PARAMETER',
  PATTERN_EXPRESSION: 'PATTERN_EXPRESSION',
  MATCH_EXPRESSION: 'MATCH_EXPRESSION',
  CASE_EXPRESSION: 'CASE_EXPRESSION',
  LHS: 'LHS',
  RHS: 'RHS',
  STATEMENTS: 'STATEMENTS'
};

export function getTypeResolver(astNode: Nodes.Node): TypeResolver {
  if (astNode instanceof Nodes.IntegerLiteral) {
    return new LiteralTypeResolver(new i32());
  } else if (astNode instanceof Nodes.FloatLiteral) {
    return new LiteralTypeResolver(new f32());
  } else if (astNode instanceof Nodes.BooleanLiteral) {
    return new LiteralTypeResolver(new bool());
  } else if (astNode instanceof Nodes.IfNode) {
    return new IfElseTypeResolver();
  } else if (astNode instanceof Nodes.DocumentNode) {
    return new UnknownTypeResolver();
  } else if (astNode instanceof Nodes.NameIdentifierNode) {
    return new PassThroughTypeResolver();
  } else if (astNode instanceof Nodes.FunDirectiveNode) {
    return new PassThroughTypeResolver();
  } else if (astNode instanceof Nodes.VarDeclarationNode) {
    return new LiteralTypeResolver(VoidType.instance);
  } else if (astNode instanceof Nodes.OverloadedFunctionNode) {
    return new OverloadedFunctionTypeResolver();
  } else if (astNode instanceof Nodes.FunctionNode) {
    return new FunctionTypeResolver();
  } else if (astNode instanceof Nodes.VariableReferenceNode) {
    return new VariableReferenceResolver();
  } else if (astNode instanceof Nodes.TypeReferenceNode) {
    return new TypeReferenceResolver();
  } else if (astNode instanceof Nodes.BinaryExpressionNode) {
    return new BinaryOpTypeResolver();
  } else if (astNode instanceof Nodes.BlockNode) {
    return new BlockTypeResolver();
  } else if (astNode instanceof Nodes.FunctionCallNode) {
    return new FunctionCallResolver();
  } else if (astNode instanceof Nodes.PatternMatcherNode) {
    return new PatternMatcherTypeResolver();
  } else if (astNode instanceof Nodes.MatchDefaultNode) {
    return new PassThroughTypeResolver();
  } else if (astNode instanceof Nodes.MatchLiteralNode) {
    return new PassThroughTypeResolver();
  } else if (astNode instanceof Nodes.AssignmentNode) {
    return new AssignmentNodeTypeResolver();
  }

  console.log(`Node ${astNode.nodeName} has no type resolver`);

  return new UnknownTypeResolver();
}

export class UnknownTypeResolver extends TypeResolver {
  execute(_node: TypeNode, _ctx: TypeResolutionContext) {
    return null;
  }
}

export class PassThroughTypeResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext) {
    const x = node.incomingEdges();

    if (x.length != 1) {
      if (ctx.currentParsingContext) {
        throw new Error(
          `PassThrough resolver only works with nodes with one edge but found '${
            node.incomingEdges().length
          }' with node ${node.astNode.nodeName}`
        );
      } else {
        return null;
      }
    }

    return x[0].incomingType();
  }
}

export class AssignmentNodeTypeResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext) {
    const assignmentNode = node.astNode as Nodes.AssignmentNode;

    const lhs = node.incomingEdgesByName(EdgeLabels.LHS)[0];
    const rhs = node.incomingEdgesByName(EdgeLabels.RHS)[0];

    if (!rhs.incomingType().canBeAssignedTo(lhs.incomingType())) {
      ctx.parsingContext.error(new TypeMismatch(rhs.incomingType(), lhs.incomingType(), assignmentNode.value));
    }

    if (rhs.incomingType().equals(VoidType.instance)) {
      ctx.parsingContext.error(
        'The expression returns a void value, which cannot be assigned to any variable',
        assignmentNode.value
      );
    }

    return lhs.incomingType();
  }
}

export class IfElseTypeResolver extends TypeResolver {
  execute(node: TypeNode, _ctx: TypeResolutionContext) {
    const conditionEdge: Edge = node.incomingEdgesByName(EdgeLabels.CONDITION)[0];
    const ifEdge: Edge = node.incomingEdgesByName(EdgeLabels.TRUE_PART)[0];
    const elseEdge: Edge = node.incomingEdgesByName(EdgeLabels.FALSE_PART)[0];
    if (ifEdge.incomingTypeDefined() || elseEdge.incomingTypeDefined()) {
      const ifNode = node.astNode as Nodes.IfNode;

      const condition = conditionEdge.incomingType();

      if (!condition.canBeAssignedTo(bool.instance)) {
        _ctx.parsingContext.error(new TypeMismatch(condition, bool.instance, ifNode.condition));
      }

      if (node.astNode.hasAnnotation(annotations.IsValueNode)) {
        const ifExpr = ifEdge.incomingTypeDefined() ? ifEdge.incomingType() : VoidType.instance;

        if (!elseEdge) {
          _ctx.parsingContext.error('A ternary operation requires an else branch', node.astNode);
          return INVALID_TYPE;
        }

        const elseExpr = elseEdge.incomingTypeDefined() ? elseEdge.incomingType() : VoidType.instance;
        const type = new UnionType();
        type.of = [ifExpr, elseExpr];
        return type.simplify();
      } else {
        return VoidType.instance;
      }
    }
  }
}

export class UnifiedTypeResolver extends TypeResolver {
  execute(node: TypeNode, _ctx: TypeResolutionContext) {
    const type = new UnionType();
    type.of = node.incomingEdges().map($ => $.incomingType());
    return type.simplify();
  }
}

export class PatternMatcherTypeResolver extends TypeResolver {
  execute(node: TypeNode, _ctx: TypeResolutionContext) {
    const type = new UnionType();
    type.of = node
      .incomingEdges()
      .filter($ => $.incomingTypeDefined())
      .map($ => $.incomingType());
    return type.simplify();
  }

  supportsPartialResolution() {
    return true;
  }
}

export class OverloadedFunctionTypeResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext): Type | null {
    const incomingTypes = node.incomingEdges().map(_ => _.incomingType());
    const incomingFunctionTypes = new Array<FunctionType>();

    // TODO: verify similar overloads

    for (let incomingType of incomingTypes) {
      if (incomingType instanceof FunctionType) {
        incomingFunctionTypes.push(incomingType);
      } else {
        ctx.parsingContext.error(
          `All members of an overloaded function should be functions, but found ${incomingType}`,
          node.astNode
        );
      }
    }

    const ret = new IntersectionType();

    ret.of = incomingFunctionTypes;

    return ret.simplify();
  }
}

export class BinaryOpTypeResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext): Type {
    const opNode = node.astNode as Nodes.BinaryExpressionNode;

    try {
      const ret = findBuiltInTypedBinaryOperation(
        opNode.operator,
        node.incomingEdgesByName(EdgeLabels.LHS)[0].incomingType(),
        node.incomingEdgesByName(EdgeLabels.RHS)[0].incomingType()
      );

      return ret.outputType;
    } catch (e) {
      ctx.currentParsingContext.error(e.toString(), node.astNode);
    }

    return null;
  }
}

export class BlockTypeResolver extends TypeResolver {
  execute(node: TypeNode, _: TypeResolutionContext): Type {
    if (node.astNode.hasAnnotation(annotations.IsValueNode)) {
      const edges = node.incomingEdgesByName(EdgeLabels.STATEMENTS);
      if (edges.length == 0) {
        return VoidType.instance;
      }

      return last(edges).incomingType();
    } else {
      return VoidType.instance;
    }
  }
}

export class FunctionTypeResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext): Type {
    const functionNode: Nodes.FunctionNode = node.astNode as Nodes.FunctionNode;
    const fnType = new FunctionType(functionNode.internalIdentifier);

    fnType.parameterTypes = functionNode.parameters
      .map($ => {
        return node.incomingEdgesByName($.parameterName.name)[0].incomingType();
      })
      .map($ => toConcreteType($, ctx));
    fnType.parameterNames = functionNode.parameters.map($ => $.parameterName.name);

    fnType.parameterTypes.forEach(($, $$) => {
      functionNode.localsByIndex[$$].type = $;
    });

    if (functionNode.functionReturnType) {
      fnType.returnType = toConcreteType(fromTypeNode(functionNode.functionReturnType), ctx);
    }

    const inferedReturnType = resolveReturnType(
      node.parentGraph,
      functionNode,
      fnType.parameterTypes,
      fnType.returnType,
      ctx
    );

    if (!inferedReturnType) {
      ctx.parsingContext.error(`Cannot infer return type`, node.astNode);

      if (!fnType.returnType) {
        fnType.returnType = INVALID_TYPE;
      }
    } else {
      if (!fnType.returnType) {
        fnType.returnType = inferedReturnType;
      } else {
        if (!inferedReturnType.canBeAssignedTo(fnType.returnType)) {
          ctx.parsingContext.error(
            new TypeMismatch(inferedReturnType, fnType.returnType, functionNode.functionReturnType)
          );
        }
      }
    }

    return fnType;
  }
}

export class VariableReferenceResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext): Type {
    const varReference = node.astNode as Nodes.VariableReferenceNode;
    const reference = varReference.closure.get(varReference.variable.name);
    if (!reference) {
      throw new Error('This should never happen');
    }
    const typeNode = ctx.currentGraph.findNode(reference.referencedNode);
    return typeNode.resultType();
  }
}

export class TypeReferenceResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext): Type {
    const type = node.resultType();
    return toConcreteType(type, ctx);
  }
}

export class FunctionCallResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext): Type {
    const functionCallNode = node.astNode as Nodes.FunctionCallNode;
    const incommingType = node.incomingEdges()[0].incomingType();
    const argTypes = node.incomingEdgesByName(EdgeLabels.PARAMETER).map($ => $.incomingType());

    if (incommingType instanceof IntersectionType) {
      for (let fun of incommingType.of) {
        if (fun instanceof FunctionType) {
          if (fun.acceptsTypes(argTypes)) {
            return fun.returnType;
          }
        } else {
          ctx.parsingContext.error(new NotAFunction(fun, functionCallNode.functionNode));
          return INVALID_TYPE;
        }
      }

      ctx.parsingContext.error(new InvalidOverload(incommingType, argTypes, functionCallNode.functionNode));
      return null;
    } else if (incommingType instanceof FunctionType) {
      if (incommingType.acceptsTypes(argTypes)) {
        return incommingType.returnType;
      }
    } else {
      ctx.parsingContext.error(new NotAFunction(incommingType, functionCallNode.functionNode));
      return INVALID_TYPE;
    }

    return INVALID_TYPE;
  }
}
