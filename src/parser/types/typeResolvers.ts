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
  UnknownType,
  TypeType,
  f32,
  i32,
  PolimorphicType,
  RefType,
  NeverType,
  TypeAlias
} from '../types';
import { annotations } from '../annotations';
import { Nodes } from '../nodes';
import { last } from '../helpers';
import {
  TypeMismatch,
  InvalidOverload,
  NotAFunction,
  InvalidCall,
  UnreachableCode,
  NotAValidType,
  AstNodeError,
  UnexpectedType,
  CannotInferReturnType
} from '../NodeError';
import { MessageCollector } from '../closure';

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
  NAME: 'NAME',
  REMOVED_TYPE: 'REMOVED_TYPE',
  REST_TYPE: 'REST_TYPE'
};

export function getTypeResolver(astNode: Nodes.Node): TypeResolver {
  if (astNode instanceof Nodes.IntegerLiteral) {
    return new LiteralTypeResolver(i32.instance);
  } else if (astNode instanceof Nodes.FloatLiteral) {
    return new LiteralTypeResolver(f32.instance);
  } else if (astNode instanceof Nodes.BooleanLiteral) {
    return new LiteralTypeResolver(bool.instance);
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
  } else if (astNode instanceof Nodes.ReferenceNode) {
    return new ReferenceResolver();
  } else if (astNode instanceof Nodes.StructDeclarationNode) {
    return new StructTypeResolver();
  } else if (astNode instanceof Nodes.UnionTypeNode) {
    return new UnionTypeResolver();
  } else if (astNode instanceof Nodes.IntersectionTypeNode) {
    return new IntersectionTypeResolver();
  } else if (astNode instanceof Nodes.BinaryExpressionNode) {
    return new BinaryOpTypeResolver();
  } else if (astNode instanceof Nodes.AsExpressionNode) {
    return new AsOpTypeResolver();
  } else if (astNode instanceof Nodes.IsExpressionNode) {
    return new IsOpTypeResolver();
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
  } else if (astNode instanceof Nodes.UnknownExpressionNode) {
    return new UnknownTypeResolver();
  } else if (astNode instanceof Nodes.TypeReducerNode) {
    return new TypeReducerResolver();
  } else if (astNode instanceof Nodes.MemberNode) {
    return new MemberTypeResolver();
  }

  console.log(`Node ${astNode.nodeName} has no type resolver`);

  return new UnhandledTypeResolver();
}

function getTypeTypeType(node: Nodes.Node, type: Type, ctx: TypeResolutionContext) {
  if (type instanceof TypeType) {
    return toConcreteType(type.of, ctx);
  } else {
    ctx.parsingContext.messageCollector.error(new NotAValidType(node.toString(), node));
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

    const [parameterType] = node
      .incomingEdges()
      .filter($ => $ != defaultValue)
      .map($ => getTypeTypeType($.source.astNode, $.incomingType(), ctx));

    if (parameterType) {
      if (!defaultValue.incomingType().canBeAssignedTo(parameterType)) {
        ctx.parsingContext.messageCollector.error(
          new TypeMismatch(defaultValue.incomingType(), parameterType, defaultValue.source.astNode)
        );
      }
      return parameterType;
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

    if (rhs.incomingType() == VoidType.instance) {
      ctx.parsingContext.messageCollector.error(
        'The expression returns a void value, which cannot be assigned to any variable',
        assignmentNode.value
      );
    }

    return lhs.incomingType();
  }
}

export class IfElseTypeResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext) {
    const conditionEdge: Edge = node.incomingEdgesByName(EdgeLabels.CONDITION)[0];
    const ifEdge: Edge = node.incomingEdgesByName(EdgeLabels.TRUE_PART)[0];
    const elseEdge: Edge = node.incomingEdgesByName(EdgeLabels.FALSE_PART)[0];
    if (ifEdge.incomingTypeDefined() || elseEdge.incomingTypeDefined()) {
      const ifNode = node.astNode as Nodes.IfNode;

      const condition = conditionEdge.incomingType();

      if (!condition.canBeAssignedTo(bool.instance)) {
        ctx.parsingContext.messageCollector.error(new TypeMismatch(condition, bool.instance, ifNode.condition));
      }

      if (node.astNode.hasAnnotation(annotations.IsValueNode)) {
        const ifExpr = ifEdge.incomingTypeDefined() ? ifEdge.incomingType() : VoidType.instance;

        if (!elseEdge) {
          ctx.parsingContext.messageCollector.error('A ternary operation requires an else branch', node.astNode);

          return new UnionType([ifExpr, INVALID_TYPE]).simplify();
        }

        const elseExpr = elseEdge.incomingTypeDefined() ? elseEdge.incomingType() : VoidType.instance;

        return new UnionType([ifExpr, elseExpr]).simplify();
      } else {
        return VoidType.instance;
      }
    }
    return INVALID_TYPE;
  }
}

export class AliasTypeResolver extends TypeResolver {
  constructor(public typeName: string) {
    super();
  }

  execute(node: TypeNode, _ctx: TypeResolutionContext) {
    const type = new TypeAlias(this.typeName);

    const edges = node.incomingEdges();

    if (edges.length) {
      type.of = node.incomingEdges()[0].incomingType();
    } else {
      type.of = INVALID_TYPE;
    }

    return TypeType.of(type);
  }
}

export class UnionTypeResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext) {
    const astNode = node.astNode as Nodes.UnionTypeNode;

    const types = node.incomingEdges().map(($, ix) => getTypeTypeType(astNode[ix], $.incomingType(), ctx));

    const ret = new UnionType(types);

    return TypeType.of(ret);
  }
}

export class IntersectionTypeResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext) {
    const astNode = node.astNode as Nodes.IntersectionTypeNode;

    const types = node.incomingEdges().map(($, ix) => getTypeTypeType(astNode[ix], $.incomingType(), ctx));

    const ret = new IntersectionType(types).simplify();

    return TypeType.of(ret);
  }
}

export class PatternMatcherTypeResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext) {
    const type = new UnionType();
    type.of = node
      .incomingEdges()
      .filter($ => $.incomingTypeDefined() && $.source.astNode instanceof Nodes.MatcherNode)
      .map($ => $.incomingType());

    const patternMatcherNode = node.astNode as Nodes.PatternMatcherNode;

    if (patternMatcherNode.hasAnnotation(annotations.IsValueNode)) {
      const restEdge = node.incomingEdgesByName(EdgeLabels.REST_TYPE);
      if (restEdge.length) {
        const restType = restEdge[0].incomingType();
        if (!NeverType.instance.equals(restType)) {
          ctx.parsingContext.messageCollector.error(
            `Match is not exhaustive, not covered types: ${restType}`,
            patternMatcherNode
          );
        }
      }

      return type.simplify();
    }

    return VoidType.instance;
  }
}

export class OverloadedFunctionTypeResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext): Type | null {
    const incomingTypes = node.incomingEdges().map(_ => _.incomingType());
    const incomingFunctionTypes = new Array<FunctionType>();

    // TODO: verify similar overloads
    // TODO: in fun(a: ref) & fun(a: object) select overload by operator importance

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

export class MemberTypeResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext): Type {
    const opNode = node.astNode as Nodes.MemberNode;

    const RHSTypes = node.incomingEdgesByName(EdgeLabels.RHS);

    if (RHSTypes.length) {
      return RHSTypes[0].incomingType();
    }

    if (opNode.operator === '#') {
      const LHSType = node.incomingEdgesByName(EdgeLabels.LHS)[0].incomingType();
      if (LHSType instanceof TypeType && (LHSType.of instanceof PolimorphicType || LHSType.of instanceof StructType)) {
        const ofType = LHSType.of as PolimorphicType | StructType;

        if (
          !ofType.reference.referencedNode.namespaceNames ||
          ofType.reference.referencedNode.namespaceNames.size === 0
        ) {
          ctx.parsingContext.messageCollector.error(
            `The namespace "${ofType.reference.referencedNode.name}" has no exported members.`,
            opNode.lhs
          );
          return INVALID_TYPE;
        }

        if (!ofType.reference.referencedNode.namespaceNames.has(opNode.memberName.name)) {
          ctx.parsingContext.messageCollector.error(
            `The namespace "${ofType.reference.referencedNode.name}" has no exported member "${
              opNode.memberName.name
            }".`,
            opNode.memberName
          );
          return INVALID_TYPE;
        } else {
          const resolvedName = ofType.reference.referencedNode.namespaceNames.get(opNode.memberName.name);

          // node.addIncomingEdge(new Edge(resolvedNode, node, EdgeLabels.RHS));

          console.log(resolvedName);

          return resolvedName.ofType; // AKA TRY NEXT ITERATION
        }
      } else {
        ctx.parsingContext.messageCollector.error(`A type namespace was expected. Instead got ${LHSType}`, opNode.lhs);
        return INVALID_TYPE;
      }
    }

    return INVALID_TYPE;
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
      const fun = findFunctionOverload(incommingType, argTypes, opNode, ctx.parsingContext.messageCollector);

      if (fun instanceof FunctionType) {
        opNode.resolvedFunctionType = fun;
        return fun.returnType;
      }
    } catch (e) {
      if (!ctx.parsingContext.messageCollector.hasErrorFor(e.node)) {
        ctx.parsingContext.messageCollector.error(e);
      }
    }

    return INVALID_TYPE;
  }
}

export class AsOpTypeResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext): Type {
    const opNode = node.astNode as Nodes.AsExpressionNode;

    const incommingType = node.incomingEdgesByName(EdgeLabels.NAME)[0].incomingType();

    const lhsType = node.incomingEdgesByName(EdgeLabels.LHS)[0].incomingType();
    let rhsType = getTypeTypeType(opNode.rhs, node.incomingEdgesByName(EdgeLabels.RHS)[0].incomingType(), ctx);

    if (rhsType != INVALID_TYPE) {
      const argTypes = [lhsType];

      if (lhsType.equals(rhsType) && rhsType.equals(lhsType)) {
        ctx.parsingContext.messageCollector.error(
          new AstNodeError(`This cast is useless ${lhsType} as ${rhsType}`, opNode)
        );
        return rhsType;
      }

      try {
        const fun = findFunctionOverload(
          incommingType,
          argTypes,
          opNode,
          ctx.parsingContext.messageCollector,
          rhsType,
          true
        );

        if (fun instanceof FunctionType) {
          opNode.resolvedFunctionType = fun;
          return fun.returnType;
        }

        throw new AstNodeError(`Cannot convert type ${lhsType} into ${rhsType}`, opNode);
      } catch (e) {
        const previousError = ctx.parsingContext.messageCollector.errors.findIndex($ => $.node === opNode);

        if (previousError != -1) {
          ctx.parsingContext.messageCollector.errors.splice(previousError, 1);
        }

        ctx.parsingContext.messageCollector.error(e);
      }

      return rhsType;
    } else {
      return INVALID_TYPE;
    }
  }
}

export class IsOpTypeResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext): Type {
    const opNode = node.astNode as Nodes.IsExpressionNode;

    const incommingType = node.incomingEdgesByName(EdgeLabels.NAME)[0].incomingType();

    let rhsType = getTypeTypeType(opNode.rhs, node.incomingEdgesByName(EdgeLabels.RHS)[0].incomingType(), ctx);

    if (rhsType != INVALID_TYPE) {
      try {
        const LHSType = node.incomingEdgesByName(EdgeLabels.LHS)[0].incomingType();

        if (!LHSType.canBeAssignedTo(RefType.instance)) {
          ctx.parsingContext.messageCollector.error(
            `"is" expression can only be used with reference types, used with: ${LHSType}`,
            opNode
          );
          return bool.instance;
        }

        if (!rhsType.canBeAssignedTo(LHSType) && !LHSType.canBeAssignedTo(rhsType)) {
          ctx.parsingContext.messageCollector.error(
            `This statement is always false, type ${LHSType} can never be ${rhsType}`,
            opNode
          );
          return bool.instance;
        }

        const fun = findFunctionOverload(incommingType, [rhsType], opNode, ctx.parsingContext.messageCollector, null);

        if (fun instanceof FunctionType) {
          opNode.resolvedFunctionType = fun;
          return fun.returnType;
        }

        ctx.parsingContext.messageCollector.error(`Error with "is"`, opNode);
      } catch (e) {
        ctx.parsingContext.messageCollector.error(e);
      }
    }

    return bool.instance;
  }
}

export class UnaryOpTypeResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext): Type {
    const opNode = node.astNode as Nodes.UnaryExpressionNode;

    const incommingType = node.incomingEdgesByName(EdgeLabels.NAME)[0].incomingType();

    const argTypes = [node.incomingEdgesByName(EdgeLabels.RHS)[0].incomingType()];

    try {
      const fun = findFunctionOverload(incommingType, argTypes, opNode, ctx.parsingContext.messageCollector);

      if (fun instanceof FunctionType) {
        opNode.resolvedFunctionType = fun;
        return fun.returnType;
      } else if (fun instanceof StructType) {
        ctx.parsingContext.messageCollector.error(`Cannot use a type as operator ${opNode.operator.text}`, opNode);
      }
    } catch (e) {
      if (!ctx.parsingContext.messageCollector.hasErrorFor(e.node)) {
        ctx.parsingContext.messageCollector.error(e);
      }
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

      let matchingValueType = node.incomingEdgesByName(EdgeLabels.PATTERN_MATCHING_VALUE)[0].incomingType();

      if (NeverType.instance.equals(matchingValueType)) {
        const opNode = node.astNode as Nodes.MatchLiteralNode;
        ctx.parsingContext.messageCollector.error(new UnreachableCode(opNode.rhs));
        return UnknownType.instance;
      }

      const argTypes = [matchingValueType, node.incomingEdgesByName(EdgeLabels.LHS)[0].incomingType()];

      try {
        const collector = new MessageCollector();

        const fun = findFunctionOverload(incommingType, argTypes, opNode, collector);

        if (fun instanceof FunctionType) {
          opNode.resolvedFunctionType = fun;

          if (!fun.returnType.canBeAssignedTo(bool.instance)) {
            ctx.parsingContext.messageCollector.error(new TypeMismatch(fun.returnType, bool.instance, opNode));
          }
        } else {
          throw 'this is only to fall into the catch hanler';
        }
      } catch {
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
    const edge = node.incomingEdges()[0];

    const structType = getTypeTypeType(edge.source.astNode, edge.incomingType(), ctx) as StructType;

    if (structType instanceof StructType) {
      if (
        !structType.parameterTypes ||
        structType.parameterTypes.length == 0 ||
        this.parameterIndex >= structType.parameterTypes.length
      ) {
        if (!structType.parameterTypes) {
          ctx.currentParsingContext.messageCollector.error(`Invalid number of arguments. ${structType}`, node.astNode);
        } else {
          ctx.currentParsingContext.messageCollector.error(
            `Invalid number of arguments. The type ${structType} only accepts ${structType.parameterTypes.length} `,
            node.astNode
          );
        }

        return INVALID_TYPE;
      }

      return structType.parameterTypes[this.parameterIndex];
    } else {
      ctx.currentParsingContext.messageCollector.error(`Type ${structType} is not a struct`, node.astNode);
      return INVALID_TYPE;
    }
  }
}

export class MatchCaseIsTypeResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext): Type {
    const result = node.incomingEdgesByName(EdgeLabels.RHS)[0];

    {
      // Find the operator ==
      const opNode = node.astNode as Nodes.MatchCaseIsNode;
      const matchingValueType = node.incomingEdgesByName(EdgeLabels.PATTERN_MATCHING_VALUE)[0].incomingType();

      if (NeverType.instance.equals(matchingValueType)) {
        ctx.parsingContext.messageCollector.error(new UnreachableCode(opNode.rhs));
        return UnknownType.instance;
      } else if (!matchingValueType.canBeAssignedTo(RefType.instance)) {
        ctx.parsingContext.messageCollector.error(
          `"is" expression can only be used with reference types, used with: ${matchingValueType}`,
          opNode
        );
      } else {
        let argType = getTypeTypeType(
          opNode.typeReference,
          node.incomingEdgesByName(EdgeLabels.LHS)[0].incomingType(),
          ctx
        );

        if (argType != INVALID_TYPE) {
          const incommingType = node.incomingEdgesByName(EdgeLabels.NAME)[0].incomingType();

          try {
            if (!argType.canBeAssignedTo(matchingValueType) && !matchingValueType.canBeAssignedTo(argType)) {
              throw 'this is only to fall into the catch hanler';
            }

            const collector = new MessageCollector();

            const fun = findFunctionOverload(incommingType, [argType], opNode, collector);

            if (fun instanceof FunctionType) {
              opNode.resolvedFunctionType = fun;

              if (!fun.returnType.canBeAssignedTo(bool.instance)) {
                ctx.parsingContext.messageCollector.error(new TypeMismatch(fun.returnType, bool.instance, opNode));
              }
            } else {
              throw 'this is only to fall into the catch hanler';
            }
          } catch {
            ctx.parsingContext.messageCollector.error(
              new TypeMismatch(matchingValueType, argType, opNode.typeReference)
            );
            ctx.parsingContext.messageCollector.error(new UnreachableCode(opNode.rhs));
          }
        }
      }
    }

    if (node.astNode.hasAnnotation(annotations.IsValueNode)) {
      return result.incomingType();
    }

    return VoidType.instance;
  }
}

export class TypeReducerResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext): Type {
    let matchingValueType = UnionType.of(
      node.incomingEdgesByName(EdgeLabels.PATTERN_MATCHING_VALUE)[0].incomingType()
    ).expand();

    const removedTypes = node.incomingEdgesByName(EdgeLabels.REMOVED_TYPE);

    if (removedTypes.length) {
      removedTypes.forEach($ => {
        const type = getTypeTypeType($.source.astNode, $.incomingType(), ctx);
        const newType = matchingValueType.subtract(type);
        matchingValueType = UnionType.of(newType);
      });
    }

    return matchingValueType;
  }
}

export class MatchDefaultTypeResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext): Type {
    let matchingValueType = node.incomingEdgesByName(EdgeLabels.PATTERN_MATCHING_VALUE)[0].incomingType();

    if (NeverType.instance.equals(matchingValueType)) {
      const opNode = node.astNode as Nodes.MatchDefaultNode;
      ctx.parsingContext.messageCollector.error(new UnreachableCode(opNode.rhs));
      return UnknownType.instance;
    }

    const result = node.incomingEdgesByName(EdgeLabels.RHS)[0];

    if (node.astNode.hasAnnotation(annotations.IsValueNode)) {
      return result.incomingType();
    }

    return VoidType.instance;
  }
}

function readParameterTypes(list: Nodes.ParameterNode[], node: TypeNode, ctx: TypeResolutionContext) {
  return list.map($ => getTypeTypeType($, node.incomingEdgesByName($.parameterName.name)[0].incomingType(), ctx));
}

export class FunctionTypeResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext): Type {
    const functionNode: Nodes.FunctionNode = node.astNode as Nodes.FunctionNode;
    const fnType = new FunctionType(functionNode.internalIdentifier);

    fnType.parameterTypes = readParameterTypes(functionNode.parameters, node, ctx);

    fnType.parameterNames = functionNode.parameters.map($ => $.parameterName.name);

    fnType.parameterTypes.forEach(($, $$) => {
      functionNode.localsByIndex[$$].type = $;
    });

    if (functionNode.functionReturnType) {
      fnType.returnType = getTypeTypeType(
        functionNode.functionReturnType,
        node.incomingEdgesByName(EdgeLabels.RETURN_TYPE)[0].incomingType(),
        ctx
      );
    }

    const inferedReturnType = resolveReturnType(node.parentGraph, functionNode, fnType.parameterTypes, ctx);

    if (inferedReturnType) {
      const previousError = ctx.parsingContext.messageCollector.errors.findIndex(
        $ => $.node === functionNode.body && $ instanceof CannotInferReturnType
      );

      if (previousError != -1) {
        ctx.parsingContext.messageCollector.errors.splice(previousError, 1);
      }

      if (inferedReturnType instanceof TypeType) {
        ctx.parsingContext.messageCollector.error(new UnexpectedType(inferedReturnType, functionNode.body));
      }

      if (!inferedReturnType.canBeAssignedTo(fnType.returnType)) {
        ctx.parsingContext.messageCollector.error(
          new TypeMismatch(inferedReturnType, fnType.returnType, functionNode.functionReturnType)
        );
      }
    } else {
      if (!ctx.parsingContext.messageCollector.hasErrorForBranch(functionNode.body)) {
        ctx.parsingContext.messageCollector.error(new CannotInferReturnType(functionNode.body));
      }
    }

    return fnType;
  }
}

export class StructTypeResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext): Type {
    const structNode: Nodes.StructDeclarationNode = node.astNode as Nodes.StructDeclarationNode;

    const superTypeEdge = node.incomingEdgesByName(EdgeLabels.SUPER_TYPE);

    const superType =
      ((superTypeEdge.length && (superTypeEdge[0].incomingType() as TypeType).of) as PolimorphicType) || null;

    const fnType = StructType.fromSuperType(
      structNode.internalIdentifier,
      structNode.declaredName.getSelfReference(),
      superType
    );

    fnType.parameterTypes = readParameterTypes(structNode.parameters, node, ctx);
    fnType.parameterNames = structNode.parameters.map($ => $.parameterName.name);

    return TypeType.of(fnType);
  }
}

export class ReferenceResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext): Type {
    const referencedEdge = node.incomingEdges()[0];
    const type = referencedEdge.incomingType();

    const ret = toConcreteType(type, ctx);

    if (ret instanceof TypeType && node.astNode.hasAnnotation(annotations.IsValueNode)) {
      if (ret.of instanceof StructType) {
        if (ret.of.parameterTypes.length == 0) {
          if (!node.astNode.hasAnnotation(annotations.ImplicitCall)) {
            node.astNode.annotate(new annotations.ImplicitCall());
          }
          return ret.of;
        }

        return ret;
      }
      ctx.parsingContext.messageCollector.error(new UnexpectedType(ret, node.astNode));
      // return UnknownType.instance;
      // return null;
    }

    return ret || INVALID_TYPE;
  }
}

export class FunctionCallResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext): Type {
    const functionCallNode = node.astNode as Nodes.FunctionCallNode;
    const incommingType = node.incomingEdges()[0].incomingType();
    const argTypes = node.incomingEdgesByName(EdgeLabels.PARAMETER).map($ => $.incomingType());

    try {
      const fun = findFunctionOverload(
        incommingType,
        argTypes,
        functionCallNode.functionNode,
        ctx.parsingContext.messageCollector
      );

      if (fun instanceof FunctionType) {
        functionCallNode.resolvedFunctionType = fun;
        return fun.returnType;
      } else if (fun instanceof StructType) {
        functionCallNode.resolvedFunctionType = fun;
        return fun;
      } else if (fun instanceof UnionType) {
        // return type
        return fun.simplify();
      }
    } catch (e) {
      if (!ctx.parsingContext.messageCollector.hasErrorFor(e.node)) {
        ctx.parsingContext.messageCollector.error(e);
      }
    }

    return INVALID_TYPE;
  }
}

function findFunctionOverload(
  incommingType: Type,
  argTypes: Type[],
  errorNode: Nodes.Node,
  messageCollector: MessageCollector,
  returnType: Type | null = null,
  strict = false
) {
  if (incommingType instanceof TypeType) {
    return findFunctionOverload(incommingType.of, argTypes, errorNode, messageCollector);
  }

  if (incommingType instanceof IntersectionType) {
    const matchList: { fun: FunctionType; score: number }[] = [];

    for (let fun of incommingType.of) {
      if (fun instanceof FunctionType) {
        if (strict) {
          if (fun.acceptsTypes(argTypes, strict)) {
            if (fun.returnType.equals(returnType)) {
              return fun;
            }
          }
        } else {
          const score = fun.acceptsTypes(argTypes, strict);
          if (score) {
            if (!returnType || fun.returnType.canBeAssignedTo(returnType)) {
              matchList.push({ fun, score });
            }
          }
        }
      } else {
        throw new NotAFunction(fun, errorNode);
      }
    }

    if (matchList.length == 1) {
      return matchList[0].fun;
    } else if (matchList.length > 0) {
      matchList.sort((a, b) => {
        if (a.score < b.score) {
          return 1;
        } else {
          return 0;
        }
      });

      if (matchList[0].score > matchList[1].score) {
        return matchList[0].fun;
      }
    }

    messageCollector.error(new InvalidOverload(incommingType, argTypes, errorNode));

    return new UnionType(incommingType.of.map(($: FunctionType) => $.returnType));
  } else if (incommingType instanceof FunctionType) {
    if (!incommingType.acceptsTypes(argTypes, strict)) {
      messageCollector.error(new InvalidCall(incommingType.parameterTypes, argTypes, errorNode));
    }
    return incommingType;
  } else if (incommingType instanceof StructType) {
    if (!incommingType.acceptsTypes(argTypes, strict)) {
      messageCollector.error(new InvalidCall(incommingType.parameterTypes, argTypes, errorNode));
    }
    return incommingType;
  } else {
    throw new NotAFunction(incommingType, errorNode);
  }
}
