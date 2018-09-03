import { TypeResolver, TypeNode, Edge, LiteralTypeResolver } from './TypeGraph';
import { TypeResolutionContext, resolveReturnType } from './TypePropagator';
import {
  VoidType,
  UnionType,
  FunctionType,
  Type,
  IntersectionType,
  toConcreteType,
  InvalidType,
  StructType,
  bool,
  UnknownType
} from '../types';
import { annotations } from '../annotations';
import { Nodes } from '../nodes';
import { last } from '../helpers';
import { TypeMismatch, InvalidOverload, NotAFunction, InvalidCall, UnreachableCode } from '../NodeError';

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
  STATEMENTS: 'STATEMENTS',
  PATTERN_MATCHING_VALUE: 'PATTERN_MATCHING_VALUE',
  SUPER_TYPE: 'SUPER_TYPE',
  RETURN_TYPE: '#RETURN_TYPE',
  DEFAULT_VALUE: 'DEFAULT_VALUE',
  NAME: 'NAME'
};

export function getTypeResolver(astNode: Nodes.Node): TypeResolver {
  if (astNode instanceof Nodes.IntegerLiteral) {
    return new PassThroughTypeResolver();
  } else if (astNode instanceof Nodes.FloatLiteral) {
    return new PassThroughTypeResolver();
  } else if (astNode instanceof Nodes.BooleanLiteral) {
    return new PassThroughTypeResolver();
  } else if (astNode instanceof Nodes.IfNode) {
    return new IfElseTypeResolver();
  } else if (astNode instanceof Nodes.DocumentNode) {
    return new UnhandledTypeResolver();
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
  } else if (astNode instanceof Nodes.StructDeclarationNode) {
    return new StructTypeResolver();
  } else if (astNode instanceof Nodes.TypeReferenceNode) {
    return new TypeReferenceResolver();
  } else if (astNode instanceof Nodes.UnionTypeNode) {
    return new UnionTypeResolver();
  } else if (astNode instanceof Nodes.IntersectionTypeNode) {
    return new IntersectionTypeResolver();
  } else if (astNode instanceof Nodes.BinaryExpressionNode) {
    return new BinaryOpTypeResolver();
  } else if (astNode instanceof Nodes.UnaryExpressionNode) {
    return new UnaryOpTypeResolver();
  } else if (astNode instanceof Nodes.BlockNode) {
    return new BlockTypeResolver();
  } else if (astNode instanceof Nodes.FunctionCallNode) {
    return new FunctionCallResolver();
  } else if (astNode instanceof Nodes.PatternMatcherNode) {
    return new PatternMatcherTypeResolver();
  } else if (astNode instanceof Nodes.MatchDefaultNode) {
    return new MatchDefaultTypeResolver();
  } else if (astNode instanceof Nodes.MatchLiteralNode) {
    return new MatchLiteralTypeResolver();
  } else if (astNode instanceof Nodes.MatchCaseIsNode) {
    return new MatchCaseIsTypeResolver();
  } else if (astNode instanceof Nodes.AssignmentNode) {
    return new AssignmentNodeTypeResolver();
  } else if (astNode instanceof Nodes.WasmExpressionNode) {
    return new UnknownTypeResolver();
  }

  // if (astNode instanceof Nodes.TypeNode) {
  //   return new TypeTypeResolver();
  // }

  console.log(`Node ${astNode.nodeName} has no type resolver`);

  return new UnhandledTypeResolver();
}

export class TypeTypeResolver extends TypeResolver {
  execute(_node: TypeNode, _ctx: TypeResolutionContext): Type {
    debugger;
    return INVALID_TYPE;
  }
}

export class UnhandledTypeResolver extends TypeResolver {
  execute(_node: TypeNode, _ctx: TypeResolutionContext) {
    return INVALID_TYPE;
  }
}

export class UnknownTypeResolver extends TypeResolver {
  execute(_node: TypeNode, _ctx: TypeResolutionContext) {
    return UnknownType.instance;
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

export class FunctionArgumentTypeResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext) {
    const [defaultValue] = node.incomingEdgesByName(EdgeLabels.DEFAULT_VALUE);
    const [parameterType] = node.incomingEdges().filter($ => $ != defaultValue);

    if (defaultValue) {
      if (!defaultValue.incomingType().canBeAssignedTo(parameterType.incomingType())) {
        ctx.parsingContext.messageCollector.error(
          new TypeMismatch(defaultValue.incomingType(), parameterType.incomingType(), defaultValue.source.astNode)
        );
      }
    }

    return parameterType.incomingType();
  }
}

export class VarDeclarationTypeResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext) {
    const [defaultValue] = node.incomingEdgesByName(EdgeLabels.DEFAULT_VALUE);
    const [parameterType] = node.incomingEdges().filter($ => $ != defaultValue);

    if (parameterType) {
      if (!defaultValue.incomingType().canBeAssignedTo(parameterType.incomingType())) {
        ctx.parsingContext.messageCollector.error(
          new TypeMismatch(defaultValue.incomingType(), parameterType.incomingType(), defaultValue.source.astNode)
        );
      }
      return parameterType.incomingType();
    }

    return defaultValue.incomingType();
  }
}

export class AssignmentNodeTypeResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext) {
    const assignmentNode = node.astNode as Nodes.AssignmentNode;

    const lhs = node.incomingEdgesByName(EdgeLabels.LHS)[0];
    const rhs = node.incomingEdgesByName(EdgeLabels.RHS)[0];

    if (!rhs.incomingType().canBeAssignedTo(lhs.incomingType())) {
      ctx.parsingContext.messageCollector.error(
        new TypeMismatch(rhs.incomingType(), lhs.incomingType(), assignmentNode.value)
      );
    }

    if (rhs.incomingType().equals(VoidType.instance)) {
      ctx.parsingContext.messageCollector.error(
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
        _ctx.parsingContext.messageCollector.error(new TypeMismatch(condition, bool.instance, ifNode.condition));
      }

      if (node.astNode.hasAnnotation(annotations.IsValueNode)) {
        const ifExpr = ifEdge.incomingTypeDefined() ? ifEdge.incomingType() : VoidType.instance;

        if (!elseEdge) {
          _ctx.parsingContext.messageCollector.error('A ternary operation requires an else branch', node.astNode);
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
    return INVALID_TYPE;
  }
}

export class UnionTypeResolver extends TypeResolver {
  execute(node: TypeNode, _ctx: TypeResolutionContext) {
    const type = new UnionType();
    type.of = node.incomingEdges().map($ => $.incomingType());
    return type.simplify();
  }
}

export class IntersectionTypeResolver extends TypeResolver {
  execute(node: TypeNode, _ctx: TypeResolutionContext) {
    const type = new IntersectionType();
    type.of = node.incomingEdges().map($ => $.incomingType());
    return type.simplify();
  }
}

export class PatternMatcherTypeResolver extends TypeResolver {
  execute(node: TypeNode, _ctx: TypeResolutionContext) {
    const type = new UnionType();
    type.of = node
      .incomingEdges()
      .filter($ => $.incomingTypeDefined() && $.source.astNode instanceof Nodes.MatcherNode)
      .map($ => $.incomingType());
    return type.simplify();
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
        ctx.parsingContext.messageCollector.error(
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

    const incommingType = node.incomingEdgesByName(EdgeLabels.NAME)[0].incomingType();

    const argTypes = [
      node.incomingEdgesByName(EdgeLabels.LHS)[0].incomingType(),
      node.incomingEdgesByName(EdgeLabels.RHS)[0].incomingType()
    ];
    try {
      const fun = findFunctionOverload(incommingType, argTypes, opNode);

      if (fun instanceof FunctionType) {
        opNode.resolvedFunctionType = fun;
        return fun.returnType;
      } else if (fun instanceof StructType) {
        ctx.parsingContext.messageCollector.error(`Cannot use a type as operator ${opNode.operator.text}`, opNode);
      }
    } catch (e) {
      ctx.parsingContext.messageCollector.error(e);
    }

    return INVALID_TYPE;
  }
}

export class UnaryOpTypeResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext): Type {
    const opNode = node.astNode as Nodes.UnaryExpressionNode;

    const incommingType = node.incomingEdgesByName(EdgeLabels.NAME)[0].incomingType();

    const argTypes = [node.incomingEdgesByName(EdgeLabels.RHS)[0].incomingType()];

    try {
      const fun = findFunctionOverload(incommingType, argTypes, opNode);

      if (fun instanceof FunctionType) {
        opNode.resolvedFunctionType = fun;
        return fun.returnType;
      } else if (fun instanceof StructType) {
        ctx.parsingContext.messageCollector.error(`Cannot use a type as operator ${opNode.operator.text}`, opNode);
      }
    } catch (e) {
      ctx.parsingContext.messageCollector.error(e);
    }

    return INVALID_TYPE;
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
    }

    return VoidType.instance;
  }
}

export class MatchLiteralTypeResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext): Type {
    const result = node.incomingEdgesByName(EdgeLabels.RHS)[0];

    {
      // Find the operator ==
      const opNode = node.astNode as Nodes.MatchLiteralNode;

      const incommingType = node.incomingEdgesByName(EdgeLabels.NAME)[0].incomingType();

      const argTypes = [
        node.incomingEdgesByName(EdgeLabels.PATTERN_MATCHING_VALUE)[0].incomingType(),
        node.incomingEdgesByName(EdgeLabels.LHS)[0].incomingType()
      ];

      try {
        const fun = findFunctionOverload(incommingType, argTypes, opNode);

        if (fun instanceof FunctionType) {
          opNode.resolvedFunctionType = fun;
          // TODO: can fun.returnType beAssignedTo boolean?
        } else if (fun instanceof StructType) {
          ctx.parsingContext.messageCollector.error(`Cannot use a type as operator '=='`, opNode);
        }
      } catch (e) {
        ctx.parsingContext.messageCollector.error(new TypeMismatch(argTypes[1], argTypes[0], opNode.literal));
        ctx.parsingContext.messageCollector.error(new UnreachableCode(opNode.rhs));
      }
    }

    if (node.astNode.hasAnnotation(annotations.IsValueNode)) {
      return result.incomingType();
    }

    return VoidType.instance;
  }
}

export class StructDeconstructorTypeResolver extends TypeResolver {
  constructor(public parameterIndex: number) {
    super();
  }
  execute(node: TypeNode, ctx: TypeResolutionContext): Type {
    const structType = node.incomingEdges()[0].incomingType() as StructType;

    if (
      !structType.parameterTypes ||
      structType.parameterTypes.length == 0 ||
      this.parameterIndex >= structType.parameterTypes.length
    ) {
      ctx.currentParsingContext.messageCollector.error(
        `Invalid number of arguments. The type ${structType} only accpets ${structType.parameterTypes.length} `,
        node.astNode
      );
      return INVALID_TYPE;
    }

    return structType.parameterTypes[this.parameterIndex];
  }
}

export class MatchCaseIsTypeResolver extends TypeResolver {
  execute(node: TypeNode, _ctx: TypeResolutionContext): Type {
    // const matched = node.incomingEdgesByName(EdgeLabels.PATTERN_MATCHING_VALUE)[0];
    // const literal = node.incomingEdgesByName(EdgeLabels.LHS)[0];
    const result = node.incomingEdgesByName(EdgeLabels.RHS)[0];

    // if (!literal.incomingType().canBeAssignedTo(matched.incomingType())) {
    //   const astNode = node.astNode as Nodes.MatchLiteralNode;
    //   ctx.currentParsingContext.error(
    //     new TypeMismatch(literal.incomingType(), matched.incomingType(), astNode.literal)
    //   );
    // }

    if (node.astNode.hasAnnotation(annotations.IsValueNode)) {
      return result.incomingType();
    }

    return VoidType.instance;
  }
}

export class MatchDefaultTypeResolver extends TypeResolver {
  execute(node: TypeNode, _: TypeResolutionContext): Type {
    const result = node.incomingEdgesByName(EdgeLabels.RHS)[0];

    if (node.astNode.hasAnnotation(annotations.IsValueNode)) {
      return result.incomingType();
    }

    return VoidType.instance;
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
      const returnType = node.incomingEdgesByName(EdgeLabels.RETURN_TYPE)[0].incomingType();
      fnType.returnType = returnType;
    }

    const inferedReturnType = resolveReturnType(node.parentGraph, functionNode, fnType.parameterTypes, ctx);

    if (!inferedReturnType) {
      if (!fnType.returnType) {
        ctx.parsingContext.messageCollector.error(`Cannot infer return type`, functionNode.body);
        fnType.returnType = INVALID_TYPE;
      }

      debugger;

      resolveReturnType(node.parentGraph, functionNode, fnType.parameterTypes, ctx);

      return fnType;
    } else {
      if (!fnType.returnType) {
        fnType.returnType = inferedReturnType;
      } else {
        if (!inferedReturnType.canBeAssignedTo(fnType.returnType)) {
          ctx.parsingContext.messageCollector.error(
            new TypeMismatch(inferedReturnType, fnType.returnType, functionNode.functionReturnType)
          );
        }
      }
    }

    return fnType;
  }
}

export class StructTypeResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext): Type {
    const structNode: Nodes.StructDeclarationNode = node.astNode as Nodes.StructDeclarationNode;

    const superType = node.incomingEdgesByName(EdgeLabels.SUPER_TYPE)[0].incomingType();

    const fnType = new StructType(structNode.internalIdentifier, structNode.declaredName.name, superType);

    fnType.parameterTypes = structNode.parameters
      .map($ => {
        return node.incomingEdgesByName($.parameterName.name)[0].incomingType();
      })
      .map($ => toConcreteType($, ctx));

    fnType.parameterNames = structNode.parameters.map($ => $.parameterName.name);

    return fnType;
  }
}

export class VariableReferenceResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext): Type {
    const type = node.incomingEdges()[0].incomingType();

    const ret = toConcreteType(type, ctx);

    return ret || INVALID_TYPE;
  }
}

export class TypeReferenceResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext): Type {
    const type = node.incomingEdges()[0].incomingType();

    const ret = toConcreteType(type, ctx);

    return ret || INVALID_TYPE;
  }
}

export class FunctionCallResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext): Type {
    const functionCallNode = node.astNode as Nodes.FunctionCallNode;
    const incommingType = node.incomingEdges()[0].incomingType();
    const argTypes = node.incomingEdgesByName(EdgeLabels.PARAMETER).map($ => $.incomingType());

    try {
      const fun = findFunctionOverload(incommingType, argTypes, functionCallNode.functionNode);

      if (fun instanceof FunctionType) {
        functionCallNode.resolvedFunctionType = fun;
        return fun.returnType;
      } else if (fun instanceof StructType) {
        functionCallNode.resolvedFunctionType = fun;
        return fun;
      }
    } catch (e) {
      ctx.parsingContext.messageCollector.error(e);
    }

    return INVALID_TYPE;
  }
}

function findFunctionOverload(incommingType: Type, argTypes: Type[], errorNode: Nodes.Node) {
  if (incommingType instanceof IntersectionType) {
    for (let fun of incommingType.of) {
      if (fun instanceof FunctionType) {
        if (fun.acceptsTypes(argTypes)) {
          return fun;
        }
      } else {
        throw new NotAFunction(fun, errorNode);
      }
    }

    throw new InvalidOverload(incommingType, argTypes, errorNode);
  } else if (incommingType instanceof FunctionType) {
    if (incommingType.acceptsTypes(argTypes)) {
      return incommingType;
    } else {
      throw new InvalidCall(incommingType.parameterTypes, argTypes, errorNode);
    }
  } else if (incommingType instanceof StructType) {
    if (incommingType.acceptsTypes(argTypes)) {
      return incommingType;
    } else {
      throw new InvalidCall(incommingType.parameterTypes, argTypes, errorNode);
    }
  } else {
    throw new NotAFunction(incommingType, errorNode);
  }
}
