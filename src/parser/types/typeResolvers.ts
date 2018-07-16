import { TypeResolver, TypeNode, Edge, LiteralTypeResolver } from './TypeGraph';
import { TypeResolutionContext } from './TypePropagator';
import { VoidType, UnionType, i32, f32, FunctionType, Type, IntersectionType, bool } from '../types';
import { annotations } from '../annotations';
import { Nodes } from '../nodes';
import { fromTypeNode } from './TypeGraphBuilder';
import { findBuiltInTypedBinaryOperation } from '../../compiler/languageOperations';

declare var console;

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
  FUNCTION_BODY: 'FUNCTION_BODY'
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
  } else if (astNode instanceof Nodes.OverloadedFunctionNode) {
    return new OverloadedFunctionTypeResolver();
  } else if (astNode instanceof Nodes.FunctionNode) {
    return new FunctionTypeResolver();
  } else if (astNode instanceof Nodes.VariableReferenceNode) {
    return new PassThroughTypeResolver();
  } else if (astNode instanceof Nodes.FunDirectiveNode) {
    return new PassThroughTypeResolver();
  } else if (astNode instanceof Nodes.BinaryExpressionNode) {
    return new BinaryOpTypeResolver();
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

export class IfElseTypeResolver extends TypeResolver {
  execute(node: TypeNode, _ctx: TypeResolutionContext) {
    const conditionEdge: Edge = node.incomingEdgesByName(EdgeLabels.CONDITION)[0];
    const ifEdge: Edge = node.incomingEdgesByName(EdgeLabels.TRUE_PART)[0];
    const elseEdge: Edge = node.incomingEdgesByName(EdgeLabels.FALSE_PART)[0];
    if (ifEdge.incomingTypeDefined() || elseEdge.incomingTypeDefined()) {
      const condition = conditionEdge.mayBeIncomingType();

      if (!condition) {
        return null;
      } else {
        // validate condition is boolean-ish
      }

      if (node.astNode.hasAnnotation(annotations.IsValueNode)) {
        const ifExpr = ifEdge.incomingTypeDefined() ? ifEdge.incomingType() : VoidType.instance;
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
    for (let incomingType of incomingTypes) {
      if (incomingType instanceof FunctionType) {
        incomingFunctionTypes.push(incomingType);
      } else {
        ctx.error(`All members of an overloaded function should be functions, but found ${incomingType}`, node);
      }
    }

    const ret = new IntersectionType();

    ret.of = incomingFunctionTypes;

    return ret;
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
      ctx.error(e.toString(), node);
    }

    return null;
  }
}

export class FunctionTypeResolver extends TypeResolver {
  execute(node: TypeNode, _ctx: TypeResolutionContext): Type {
    const functionNode: Nodes.FunctionNode = node.astNode as Nodes.FunctionNode;
    const fnType = new FunctionType(functionNode.internalIdentifier);

    fnType.parameterTypes = new Array(functionNode.parameters.length).fill(null);

    functionNode.parameters.forEach(($, $$) => {
      const paramType = node.incomingEdgesByName($.parameterName.name)[0].incomingType();
      functionNode.localsByIndex[$$].type = fnType.parameterTypes[$$] = paramType;
    });

    const inferedReturnType = node.incomingEdgesByName(EdgeLabels.FUNCTION_BODY)[0].incomingType();

    if (functionNode.functionReturnType) {
      fnType.returnType = fromTypeNode(functionNode.functionReturnType);
      // TODO: Check type against inferedReturnType
    }

    fnType.returnType = inferedReturnType;

    return fnType;
  }
}
