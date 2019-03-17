import { TypeResolver, TypeNode, Edge, LiteralTypeResolver } from './TypeGraph';
import { TypeResolutionContext, resolveReturnType, resolveNode } from './TypePropagator';
import {
  UnionType,
  FunctionType,
  Type,
  IntersectionType,
  TypeType,
  RefType,
  TypeAlias,
  InjectableTypes,
  NeverType,
  NativeTypes,
  StructType
} from '../types';
import { annotations } from '../annotations';
import { Nodes } from '../nodes';
import { last, flatten } from '../helpers';
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
import { MessageCollector } from '../MessageCollector';

declare var console;

const INVALID_TYPE = InjectableTypes.never;

export const EdgeLabels = {
  CONDITION: 'CONDITION',
  EXPECTED_TYPE: 'EXPECTED_TYPE',
  FUNCTION: 'FUNCTION',
  TRUE_PART: 'TRUE_PART',
  FALSE_PART: 'FALSE_PART',
  BLOCK: 'BLOCK',
  PARAMETER: 'PARAMETER',
  PATTERN_EXPRESSION: 'PATTERN_EXPRESSION',
  MATCH_EXPRESSION: 'MATCH_EXPRESSION',
  CASE_EXPRESSION: 'CASE_EXPRESSION',
  LHS: 'LHS',
  RHS: 'RHS',
  BOOLEAN: 'BOOLEAN',
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
    return new PassThroughTypeTypeResolver();
  } else if (astNode instanceof Nodes.FloatLiteral) {
    return new PassThroughTypeTypeResolver();
  } else if (astNode instanceof Nodes.BooleanLiteral) {
    return new PassThroughTypeTypeResolver();
  } else if (astNode instanceof Nodes.StringLiteral) {
    return new PassThroughTypeTypeResolver();
  } else if (astNode instanceof Nodes.IfNode) {
    return new IfElseTypeResolver();
  } else if (astNode instanceof Nodes.NameIdentifierNode) {
    return new PassThroughTypeResolver();
  } else if (astNode instanceof Nodes.VarDeclarationNode) {
    return new LiteralTypeResolver(InjectableTypes.void);
  } else if (astNode instanceof Nodes.LoopNode) {
    return new LiteralTypeResolver(InjectableTypes.void);
  } else if (astNode instanceof Nodes.ContinueNode) {
    return new LiteralTypeResolver(InjectableTypes.void);
  } else if (astNode instanceof Nodes.BreakNode) {
    return new LiteralTypeResolver(InjectableTypes.void);
  } else if (astNode instanceof Nodes.OverloadedFunctionNode) {
    return new OverloadedFunctionTypeResolver();
  } else if (astNode instanceof Nodes.FunctionNode) {
    return new FunctionTypeResolver();
  } else if (astNode instanceof Nodes.ReferenceNode) {
    return new ReferenceResolver();
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

function getTypeTypeType(node: Nodes.Node, type: Type, ctx: TypeResolutionContext): Type {
  if (type instanceof TypeType) {
    return type.of;
  } else {
    ctx.parsingContext.messageCollector.error(new NotAValidType(node));
    return INVALID_TYPE;
  }
}

class UnhandledTypeResolver extends TypeResolver {
  execute(_node: TypeNode, ctx: TypeResolutionContext) {
    ctx.parsingContext.messageCollector.error(
      new AstNodeError(`No type resolver for node ${_node.astNode.nodeName}`, _node.astNode)
    );
    return INVALID_TYPE;
  }
}

export class TypeFromTypeResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext) {
    const x = node.incomingEdges();

    if (x.length != 1) {
      if (ctx.currentParsingContext) {
        throw new Error(
          `TypeFromType resolver only works with nodes with one edge but found '${
            node.incomingEdges().length
          }' with node ${node.astNode.nodeName}`
        );
      } else {
        return null;
      }
    }

    const type = getTypeTypeType(x[0].source.astNode, x[0].incomingType(), ctx);

    if (type) return type;

    ctx.parsingContext.messageCollector.error(new AstNodeError(`Cannot resolve Type<?>`, node.astNode));

    return INVALID_TYPE;
  }
}

class UnknownTypeResolver extends TypeResolver {
  execute(_node: TypeNode, _ctx: TypeResolutionContext) {
    return INVALID_TYPE;
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

class PassThroughTypeTypeResolver extends TypeResolver {
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

    const ret = getTypeTypeType(x[0].source.astNode, x[0].incomingType(), ctx);

    return ret;
  }
}

export class ParameterTypeResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext) {
    const parameterType = node.incomingEdgesByName(EdgeLabels.EXPECTED_TYPE)[0];

    // TODO: implement default value
    // const _defaultValue = node.incomingEdgesByName(EdgeLabels.DEFAULT_VALUE);

    const ret = getTypeTypeType(parameterType.source.astNode, parameterType.incomingType(), ctx);

    return ret;
  }
}

export class TypeDirectiveResolver extends TypeResolver {
  constructor(public originalType: TypeType) {
    super();
  }

  execute(node: TypeNode, _ctx: TypeResolutionContext) {
    const [incommingType] = node.incomingEdges().map($ => $.incomingType() as TypeType);

    if (incommingType) {
      const typeAlias = this.originalType.of as TypeAlias;

      if (typeAlias instanceof TypeAlias) {
        const aliasedType = typeAlias.of;

        if (incommingType.of instanceof UnionType) {
          if (aliasedType instanceof UnionType) {
            if (!aliasedType.of.length) {
              incommingType.of.of.forEach($ => aliasedType.of.push($));
              const simplification = aliasedType.simplify();
              if (simplification instanceof UnionType) {
                aliasedType.of.length = 0;
                aliasedType.of.push(...simplification.of);
              } else {
                aliasedType.of.length = 0;
                aliasedType.of.push(simplification);
              }
            }
          } else {
            throw new Error('aliased type is not union');
          }
        } else if (incommingType.of instanceof IntersectionType) {
          if (aliasedType instanceof IntersectionType) {
            if (!aliasedType.of.length) {
              incommingType.of.of.forEach($ => aliasedType.of.push($));
              const simplification = aliasedType.simplify();
              if (simplification instanceof IntersectionType) {
                aliasedType.of = simplification.of;
              } else {
                aliasedType.of = [simplification];
              }
            }
          } else {
            throw new Error('aliased type is not intersection');
          }
        }
      } else {
        throw new Error('type is not an alias');
      }
    }

    return this.originalType;
  }
}

export class VarDeclarationTypeResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext) {
    const [defaultValue] = node.incomingEdgesByName(EdgeLabels.DEFAULT_VALUE);
    const valueType = defaultValue.incomingType();
    const [typeDecl] = node.incomingEdgesByName(EdgeLabels.EXPECTED_TYPE);

    if (typeDecl) {
      const parameterType = typeDecl.incomingType();

      const expectedType = getTypeTypeType(typeDecl.source.astNode, parameterType, ctx);

      if (NeverType.isNeverType(expectedType)) {
        if (!ctx.parsingContext.messageCollector.hasErrorForBranch(typeDecl.source.astNode)) {
          ctx.parsingContext.messageCollector.error('Cannot resolve type', typeDecl.source.astNode);
        }
        // there was an error resolving the type
        return valueType;
      } else {
        const opNode = defaultValue.source.astNode.parent as Nodes.VarDeclarationNode;

        const ret = ensureCanBeAssignedWithImplicitConversion(valueType, expectedType, opNode.value, ctx);

        opNode.value = ret.node;

        return ret.type;
      }
    }

    return defaultValue.incomingType();
  }
}

class AssignmentNodeTypeResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext) {
    const assignmentNode = node.astNode as Nodes.AssignmentNode;

    const lhs = node.incomingEdgesByName(EdgeLabels.LHS)[0];
    const rhs = node.incomingEdgesByName(EdgeLabels.RHS)[0];
    const lhsType = lhs.incomingType();
    const rhsType = rhs.incomingType();

    // TODO: unhack my heart
    if (assignmentNode.lhs instanceof Nodes.MemberNode) {
      if (assignmentNode.lhs.hasAnnotation(annotations.ImplicitCall)) {
        ctx.parsingContext.messageCollector.error('!!! This node already has a ImplicitCall', assignmentNode.lhs);
        return INVALID_TYPE;
      }

      const fun = findFunctionOverload(
        lhsType,
        [assignmentNode.lhs.lhs.ofType, rhsType],
        assignmentNode.lhs,
        ctx,
        null,
        false,
        ctx.parsingContext.messageCollector,
        true
      );

      if (fun && fun instanceof FunctionType) {
        annotateImplicitCall(node.astNode, fun, [assignmentNode.lhs.lhs, assignmentNode.rhs], ctx);

        return fun.returnType;
      } else {
        ctx.parsingContext.messageCollector.error('Overload not found', assignmentNode.rhs);
        return INVALID_TYPE;
      }
    } else {
      const rhsType = rhs.incomingType();

      const result = ensureCanBeAssignedWithImplicitConversion(rhsType, lhsType, assignmentNode.rhs, ctx);

      if (rhsType.nativeType == NativeTypes.void) {
        ctx.parsingContext.messageCollector.error(
          'The expression returns a void value, which cannot be assigned to any value',
          assignmentNode.rhs
        );
      }

      if (assignmentNode.hasAnnotation(annotations.IsValueNode)) {
        return result.type;
      } else {
        return InjectableTypes.void;
      }
    }
  }
}

class IfElseTypeResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext) {
    const conditionEdge: Edge = node.incomingEdgesByName(EdgeLabels.CONDITION)[0];
    const ifEdge: Edge = node.incomingEdgesByName(EdgeLabels.TRUE_PART)[0];
    const elseEdge: Edge = node.incomingEdgesByName(EdgeLabels.FALSE_PART)[0];
    const booleanType = getTypeTypeType(
      node.astNode,
      node.incomingEdgesByName(EdgeLabels.BOOLEAN)[0].incomingType(),
      ctx
    );
    if (ifEdge.incomingTypeDefined() || elseEdge.incomingTypeDefined()) {
      const ifNode = node.astNode as Nodes.IfNode;

      const condition = conditionEdge.incomingType();

      ensureCanBeAssignedWithImplicitConversion(condition, booleanType, ifNode.condition, ctx);

      if (node.astNode.hasAnnotation(annotations.IsValueNode)) {
        const ifExpr = ifEdge.incomingTypeDefined() ? ifEdge.incomingType() : InjectableTypes.void;

        if (!elseEdge) {
          ctx.parsingContext.messageCollector.error('A ternary operation requires an else branch', node.astNode);
          return ifExpr;
        }

        const elseExpr = elseEdge.incomingTypeDefined() ? elseEdge.incomingType() : InjectableTypes.void;

        return new UnionType([ifExpr, elseExpr]).simplify();
      } else {
        return InjectableTypes.void;
      }
    }
    ctx.parsingContext.messageCollector.error(
      new AstNodeError(`Neither truePart or falsePart were resolved`, node.astNode)
    );
    return INVALID_TYPE;
  }
}

class UnionTypeResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext) {
    const astNode = node.astNode as Nodes.UnionTypeNode;

    const types = node.incomingEdges().map(($, ix) => getTypeTypeType(astNode[ix], $.incomingType(), ctx));

    const ret = new UnionType(types);

    return TypeType.of(ret);
  }
}

class IntersectionTypeResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext) {
    const astNode = node.astNode as Nodes.IntersectionTypeNode;

    const types = node.incomingEdges().map(($, ix) => getTypeTypeType(astNode[ix], $.incomingType(), ctx));

    const ret = new IntersectionType(types).simplify();

    return TypeType.of(ret);
  }
}

class PatternMatcherTypeResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext) {
    const type = new UnionType(
      node
        .incomingEdges()
        .filter($ => $.incomingTypeDefined() && $.source.astNode instanceof Nodes.MatcherNode)
        .map($ => $.incomingType())
    );

    const patternMatcherNode = node.astNode as Nodes.PatternMatcherNode;

    if (patternMatcherNode.hasAnnotation(annotations.IsValueNode)) {
      const restEdge = node.incomingEdgesByName(EdgeLabels.REST_TYPE);
      if (restEdge.length) {
        const restType = restEdge[0].incomingType();
        if (!NeverType.isNeverType(restType)) {
          ctx.parsingContext.messageCollector.error(
            `Match is not exhaustive, not covered types: ${restType}`,
            patternMatcherNode
          );
        }
      }

      return type.simplify();
    }

    return InjectableTypes.void;
  }
}

class OverloadedFunctionTypeResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext): Type | null {
    const incomingTypes = node.incomingEdgesByName(EdgeLabels.FUNCTION).map(_ => _.incomingType());
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

function safeResolveTypeMember(
  errorNode: Nodes.Node,
  type: Type,
  memberName: string,
  ctx: TypeResolutionContext
): Type | null {
  try {
    return resolveTypeMember(type, memberName, ctx);
  } catch (e) {
    ctx.parsingContext.messageCollector.error(e, errorNode);
  }
  return INVALID_TYPE;
}

function resolveTypeMember(type: Type, memberName: string, ctx: TypeResolutionContext): Type {
  if (type instanceof TypeAlias) {
    const resolvedName = type.name.namespaceNames && type.name.namespaceNames.get(memberName);

    if (resolvedName) {
      const resolvedType = resolveNode(resolvedName, ctx);
      if (resolvedType) {
        return resolvedType;
      } else {
        throw new Error(`Cannot resolve type of member "${memberName}" in ${type}`);
      }
    } else {
      throw new Error(`Cannot find member "${memberName}" in ${type.inspect(0)}`);
    }
  } else if (NeverType.isNeverType(type)) {
    return type;
  } else {
    throw new Error(`Type "${type}" has no members`);
  }
}

class MemberTypeResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext): Type {
    const opNode = node.astNode as Nodes.MemberNode;

    const LHSType = node.incomingEdgesByName(EdgeLabels.LHS)[0].incomingType();

    if (opNode.operator == '.^') {
      if (LHSType instanceof TypeType) {
        const allowedTypeSchemas = LHSType.schema();

        if (opNode.memberName.name in allowedTypeSchemas) {
          return allowedTypeSchemas[opNode.memberName.name];
        } else {
          const keys = Object.keys(allowedTypeSchemas);

          if (keys.length) {
            ctx.parsingContext.messageCollector.error(
              new AstNodeError(`Invalid schema property. Available options: ${keys.join(', ')}`, opNode.memberName)
            );
          } else {
            ctx.parsingContext.messageCollector.error(
              new AstNodeError(`The type ${LHSType.inspect(100)} has no schema`, opNode.lhs)
            );
          }
          return INVALID_TYPE;
        }
      } else {
        ctx.parsingContext.messageCollector.error(new NotAValidType(opNode.lhs));
        return INVALID_TYPE;
      }
    }

    try {
      if (LHSType instanceof TypeType) {
        return safeResolveTypeMember(opNode.lhs, LHSType.of, opNode.memberName.name, ctx);
      } else if (LHSType instanceof TypeAlias) {
        const resolvedProperty = safeResolveTypeMember(opNode.lhs, LHSType, 'property_' + opNode.memberName.name, ctx);

        if (resolvedProperty) {
          const isGetter = opNode.hasAnnotation(annotations.IsValueNode);
          if (isGetter) {
            const fun = findFunctionOverload(
              resolvedProperty,
              [LHSType],
              opNode,
              ctx,
              null,
              false,
              ctx.parsingContext.messageCollector,
              false
            );

            if (fun && fun instanceof FunctionType) {
              annotateImplicitCall(opNode, fun, [opNode.lhs], ctx);

              return fun.returnType;
            } else {
              ctx.parsingContext.messageCollector.error(
                new AstNodeError(
                  `${LHSType}.property_${opNode.memberName.name} is not a valid property getter`,
                  opNode.memberName
                )
              );
              return INVALID_TYPE;
            }
          } else {
            return resolvedProperty;
          }
        } else {
          ctx.parsingContext.messageCollector.error(
            new AstNodeError(`Property ${opNode.memberName.name} doesn't exist in type ${LHSType}`, opNode.memberName)
          );
          return INVALID_TYPE;
        }
      }
      // } else if (LHSType instanceof IntersectionType || LHSType instanceof FunctionType) {
      //   return LHSType;
      // }
      ctx.parsingContext.messageCollector.error(
        new AstNodeError(`The type ${LHSType.inspect(2)} has no members`, opNode.lhs)
      );
      return INVALID_TYPE;
    } catch (e) {
      if (!ctx.parsingContext.messageCollector.hasErrorFor(opNode)) {
        if (e instanceof AstNodeError) {
          ctx.parsingContext.messageCollector.error(e);
        } else {
          ctx.parsingContext.messageCollector.error(e.toString(), opNode);
        }
      }
    }
    return INVALID_TYPE;
  }
}

class BinaryOpTypeResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext): Type {
    const opNode = node.astNode as Nodes.BinaryExpressionNode;

    const lhsType = node.incomingEdgesByName(EdgeLabels.LHS)[0].incomingType();
    const rhsType = node.incomingEdgesByName(EdgeLabels.RHS)[0].incomingType();

    const valueType = safeResolveTypeMember(opNode, lhsType, opNode.operator.name, ctx);
    const argTypes = [lhsType, rhsType];

    return processFunctionCall(opNode, valueType, argTypes, ctx);
  }
}

class AsOpTypeResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext): Type {
    const opNode = node.astNode as Nodes.AsExpressionNode;

    const lhsType = node.incomingEdgesByName(EdgeLabels.LHS)[0].incomingType();
    const rhsType = getTypeTypeType(opNode.rhs, node.incomingEdgesByName(EdgeLabels.RHS)[0].incomingType(), ctx);

    if (rhsType != INVALID_TYPE) {
      if (lhsType.equals(rhsType) && rhsType.equals(lhsType)) {
        ctx.parsingContext.messageCollector.warning(`This cast is useless ${lhsType} as ${rhsType}`, opNode);
        return rhsType;
      }

      try {
        const valueType = safeResolveTypeMember(opNode.lhs, lhsType, 'as', ctx);

        const fun = findFunctionOverload(
          valueType,
          [lhsType],
          opNode,
          ctx,
          rhsType,
          false,
          ctx.parsingContext.messageCollector,
          false
        );

        if (fun instanceof FunctionType) {
          opNode.resolvedFunctionType = fun;

          return fun.returnType;
        }

        if (!NeverType.isNeverType(lhsType)) {
          ctx.parsingContext.messageCollector.error(
            new AstNodeError(`Cannot convert type ${lhsType} into ${rhsType}`, opNode.lhs)
          );
        }

        return INVALID_TYPE;
      } catch (e) {
        const previousError = ctx.parsingContext.messageCollector.errors.findIndex($ => $.node === opNode);

        if (previousError != -1) {
          ctx.parsingContext.messageCollector.errors.splice(previousError, 1);
        }

        ctx.parsingContext.messageCollector.error(e, opNode);
      }

      return rhsType;
    } else {
      ctx.parsingContext.messageCollector.error(new AstNodeError(`cannot resolve type`, opNode.rhs));
      return INVALID_TYPE;
    }
  }
}

class IsOpTypeResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext): Type {
    const opNode = node.astNode as Nodes.IsExpressionNode;

    let rhsType = getTypeTypeType(opNode.rhs, node.incomingEdgesByName(EdgeLabels.RHS)[0].incomingType(), ctx);
    let booleanType = getTypeTypeType(opNode, node.incomingEdgesByName(EdgeLabels.BOOLEAN)[0].incomingType(), ctx);

    if (rhsType != INVALID_TYPE) {
      try {
        const lhsType = node.incomingEdgesByName(EdgeLabels.LHS)[0].incomingType();

        if (!canBeAssigned(lhsType, RefType.instance)) {
          ctx.parsingContext.messageCollector.error(
            `"is" expression can only be used with reference types, used with: ${lhsType}`,
            opNode
          );
          return booleanType;
        }

        if (!canBeAssigned(rhsType, lhsType) && !canBeAssigned(lhsType, rhsType)) {
          ctx.parsingContext.messageCollector.error(
            `This statement is always false, type ${lhsType} can never be ${rhsType}`,
            opNode
          );
          return booleanType;
        }

        const valueType = safeResolveTypeMember(opNode.rhs, rhsType, 'is', ctx);

        const fun = findFunctionOverload(
          valueType,
          [rhsType],
          opNode,
          ctx,
          null,
          false,
          ctx.parsingContext.messageCollector,
          false
        );

        if (fun instanceof FunctionType) {
          opNode.resolvedFunctionType = fun;
          return fun.returnType;
        }

        ctx.parsingContext.messageCollector.error(`Error with "is"`, opNode);
      } catch (e) {
        ctx.parsingContext.messageCollector.error(e, opNode);
      }
    }

    return booleanType;
  }
}

class UnaryOpTypeResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext): Type {
    const opNode = node.astNode as Nodes.UnaryExpressionNode;

    const rhsType = node.incomingEdgesByName(EdgeLabels.RHS)[0].incomingType();
    const valueType = safeResolveTypeMember(opNode, rhsType, opNode.operator.name, ctx);

    const argTypes = [rhsType];

    return processFunctionCall(opNode, valueType, argTypes, ctx);
  }
}

class BlockTypeResolver extends TypeResolver {
  execute(node: TypeNode, _: TypeResolutionContext): Type {
    if (node.astNode.hasAnnotation(annotations.IsValueNode)) {
      const edges = node.incomingEdgesByName(EdgeLabels.STATEMENTS);
      if (edges.length == 0) {
        return InjectableTypes.void;
      }

      return last(edges).incomingType();
    }

    return InjectableTypes.void;
  }
}

class MatchLiteralTypeResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext): Type {
    const result = node.incomingEdgesByName(EdgeLabels.RHS)[0];

    {
      const opNode = node.astNode as Nodes.MatchLiteralNode;
      const matchingValueType = node.incomingEdgesByName(EdgeLabels.PATTERN_MATCHING_VALUE)[0].incomingType();
      const booleanType = getTypeTypeType(
        node.astNode,
        node.incomingEdgesByName(EdgeLabels.BOOLEAN)[0].incomingType(),
        ctx
      );
      const argTypes = [matchingValueType, node.incomingEdgesByName(EdgeLabels.LHS)[0].incomingType()];
      try {
        // Find the operator ==

        const valueType = safeResolveTypeMember(opNode.literal, matchingValueType, '==', ctx);

        if (NeverType.isNeverType(matchingValueType)) {
          const opNode = node.astNode as Nodes.MatchLiteralNode;
          opNode.rhs.annotate(new annotations.IsUnreachable());
          ctx.parsingContext.messageCollector.error(new UnreachableCode(opNode.rhs));
          return INVALID_TYPE;
        }

        const fun = findFunctionOverload(valueType, argTypes, opNode, ctx, null, false, new MessageCollector(), false);

        if (fun instanceof FunctionType) {
          opNode.resolvedFunctionType = fun;

          if (!fun.returnType.canBeAssignedTo(booleanType)) {
            ctx.parsingContext.messageCollector.error(new TypeMismatch(fun.returnType, booleanType, opNode));
          }
        } else {
          throw 'this is only to fall into the catch hanler';
        }
      } catch {
        ctx.parsingContext.messageCollector.error(new TypeMismatch(argTypes[1], argTypes[0], opNode.literal));
        ctx.parsingContext.messageCollector.error(new UnreachableCode(opNode.rhs));
        opNode.rhs.annotate(new annotations.IsUnreachable());
      }
    }

    if (node.astNode.hasAnnotation(annotations.IsValueNode)) {
      return result.incomingType();
    }

    return InjectableTypes.void;
  }
}

class MatchCaseIsTypeResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext): Type {
    const result = node.incomingEdgesByName(EdgeLabels.RHS)[0];

    {
      // Find the operator ==
      const opNode = node.astNode as Nodes.MatchCaseIsNode;

      const matchingValueType = node.incomingEdgesByName(EdgeLabels.PATTERN_MATCHING_VALUE)[0].incomingType();
      const booleanType = getTypeTypeType(
        node.astNode,
        node.incomingEdgesByName(EdgeLabels.BOOLEAN)[0].incomingType(),
        ctx
      );

      if (NeverType.isNeverType(matchingValueType)) {
        ctx.parsingContext.messageCollector.error(new UnreachableCode(opNode.rhs));
        opNode.rhs.annotate(new annotations.IsUnreachable());
        return INVALID_TYPE;
      } else if (!canBeAssigned(matchingValueType, RefType.instance)) {
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
          const incommingType = safeResolveTypeMember(opNode.typeReference, argType, 'is', ctx);

          try {
            if (!canBeAssigned(argType, matchingValueType) && !canBeAssigned(matchingValueType, argType)) {
              throw 'this is only to fall into the catch hanler';
            }

            const fun = findFunctionOverload(
              incommingType,
              [argType],
              opNode,
              ctx,
              null,
              false,
              new MessageCollector(),
              false
            );

            if (fun instanceof FunctionType) {
              opNode.resolvedFunctionType = fun;

              if (!fun.returnType.canBeAssignedTo(booleanType)) {
                ctx.parsingContext.messageCollector.error(new TypeMismatch(fun.returnType, booleanType, opNode));
              }
            } else {
              throw 'this is only to fall into the catch hanler';
            }
          } catch {
            ctx.parsingContext.messageCollector.error(
              new TypeMismatch(matchingValueType, argType, opNode.typeReference)
            );
            ctx.parsingContext.messageCollector.error(new UnreachableCode(opNode.rhs));
            opNode.rhs.annotate(new annotations.IsUnreachable());
          }
        }
      }
    }

    if (node.astNode.hasAnnotation(annotations.IsValueNode)) {
      return result.incomingType();
    }

    return InjectableTypes.void;
  }
}

class TypeReducerResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext): Type {
    let incomming = node.incomingEdgesByName(EdgeLabels.PATTERN_MATCHING_VALUE)[0].incomingType();

    if (incomming instanceof UnionType) {
      incomming = incomming.expand();
    } else {
      incomming = UnionType.of(incomming).expand();
    }

    let matchingValueType = incomming instanceof UnionType ? incomming : UnionType.of(incomming);

    const removedTypes = node.incomingEdgesByName(EdgeLabels.REMOVED_TYPE);

    if (removedTypes.length) {
      removedTypes.forEach($ => {
        const type = getTypeTypeType($.source.astNode, $.incomingType(), ctx);
        const newType = matchingValueType.subtract(type);
        matchingValueType = UnionType.of(newType);
      });
    }

    return matchingValueType.simplify();
  }
}

class MatchDefaultTypeResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext): Type {
    let matchingValueType = node.incomingEdgesByName(EdgeLabels.PATTERN_MATCHING_VALUE)[0].incomingType();

    if (NeverType.isNeverType(matchingValueType)) {
      const opNode = node.astNode as Nodes.MatchDefaultNode;
      ctx.parsingContext.messageCollector.error(new UnreachableCode(opNode.rhs));
      opNode.rhs.annotate(new annotations.IsUnreachable());
      return INVALID_TYPE;
    }

    const result = node.incomingEdgesByName(EdgeLabels.RHS)[0];

    if (node.astNode.hasAnnotation(annotations.IsValueNode)) {
      return result.incomingType();
    }

    return InjectableTypes.void;
  }
}

function readParameterTypes(list: Nodes.ParameterNode[], node: TypeNode) {
  return list.map($ => node.incomingEdgesByName($.parameterName.name)[0].incomingType());
}

class FunctionTypeResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext): Type {
    const functionNode: Nodes.FunctionNode = node.astNode as Nodes.FunctionNode;
    const fnType = new FunctionType(functionNode.functionName);

    try {
      fnType.parameterTypes = readParameterTypes(functionNode.parameters, node);

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
        } else {
          ensureCanBeAssignedWithImplicitConversion(inferedReturnType, fnType.returnType, functionNode.body, ctx);
        }
      } else {
        if (!ctx.parsingContext.messageCollector.hasErrorForBranch(functionNode.body)) {
          ctx.parsingContext.messageCollector.error(new CannotInferReturnType(functionNode.body));
        }
      }
    } catch (e) {
      if (!ctx.parsingContext.messageCollector.hasErrorFor(functionNode)) {
        ctx.parsingContext.messageCollector.error(e, functionNode);
      }
    }

    return fnType;
  }
}

class ReferenceResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext): Type {
    const referencedEdge = node.incomingEdges()[0];
    const type = referencedEdge.incomingType();

    if (type instanceof TypeType && node.astNode.hasAnnotation(annotations.IsValueNode)) {
      if (type.of instanceof TypeAlias) {
        try {
          const fnType = safeResolveTypeMember(node.astNode, type.of, 'apply', ctx);

          const fun = findFunctionOverload(
            fnType,
            [],
            node.astNode,
            ctx,
            null,
            false,
            ctx.parsingContext.messageCollector,
            true
          );

          if (fun instanceof FunctionType) {
            annotateImplicitCall(node.astNode, fun, [], ctx);

            return fun.returnType;
          }

          if (!ctx.parsingContext.messageCollector.hasErrorForBranch(node.astNode)) {
            ctx.parsingContext.messageCollector.error(type.inspect(100), node.astNode);
          }

          return fun || INVALID_TYPE;
        } catch (e) {
          ctx.parsingContext.messageCollector.error(e, node.astNode);
          return INVALID_TYPE;
        }
      }
      ctx.parsingContext.messageCollector.error(new UnexpectedType(type, node.astNode));
    }

    if (type) {
      return type;
    }

    ctx.parsingContext.messageCollector.error(new AstNodeError(`Unable to resolve reference`, node.astNode));
    return INVALID_TYPE;
  }
}

class FunctionCallResolver extends TypeResolver {
  execute(node: TypeNode, ctx: TypeResolutionContext): Type {
    const functionCallNode = node.astNode as Nodes.FunctionCallNode;
    const incommingType = node.incomingEdges()[0].incomingType();
    const argTypes = node.incomingEdgesByName(EdgeLabels.PARAMETER).map($ => $.incomingType());

    return processFunctionCall(functionCallNode, incommingType, argTypes, ctx);
  }
}

function processFunctionCall(
  node: Nodes.AbstractFunctionCallNode,
  functionType: Type,
  argTypes: Type[],
  ctx: TypeResolutionContext
): Type {
  try {
    const fun = findFunctionOverload(
      functionType,
      argTypes,
      node,
      ctx,
      null,
      false,
      ctx.parsingContext.messageCollector,
      true
    );

    if (fun instanceof FunctionType) {
      node.resolvedFunctionType = fun;

      ensureArgumentCoercion(node, fun, argTypes, ctx);

      return fun.returnType;
    }
  } catch (e) {
    const errorNode = e.node || node;

    if (!ctx.parsingContext.messageCollector.hasErrorForBranch(errorNode)) {
      if (e instanceof AstNodeError) {
        ctx.parsingContext.messageCollector.error(e);
      } else {
        ctx.parsingContext.messageCollector.error(e.toString(), errorNode);
      }
    }
  }

  if (!ctx.parsingContext.messageCollector.hasErrorForBranch(node)) {
    ctx.parsingContext.messageCollector.error(new AstNodeError('invalid function', node));
  }

  return INVALID_TYPE;
}

function findFunctionOverload(
  incommingType: Type,
  argTypes: Type[],
  errorNode: Nodes.Node,
  ctx: TypeResolutionContext,
  returnType: Type | null,
  strict: boolean,
  messageCollector: MessageCollector,
  automaticCoercion: boolean
): Type {
  if (incommingType instanceof TypeType) {
    return findFunctionOverload(
      incommingType.of,
      argTypes,
      errorNode,
      ctx,
      returnType,
      strict,
      messageCollector,
      automaticCoercion
    );
  }
  if (incommingType instanceof IntersectionType) {
    const matchList: { fun: FunctionType; score: number; casts: (FunctionType | null)[] }[] = [];

    for (let fun of incommingType.of) {
      if (fun instanceof FunctionType) {
        if (strict) {
          if (acceptsTypes(fun, argTypes, strict, ctx, automaticCoercion)) {
            if (fun.returnType.equals(returnType)) {
              return fun;
            }
          }
        } else {
          const score = acceptsTypes(fun, argTypes, strict, ctx, automaticCoercion);
          if (score) {
            if (!returnType || canBeAssigned(fun.returnType, returnType)) {
              matchList.push({ fun, score: score.score, casts: score.casts });
            }
          }
        }
      } else {
        if (errorNode) {
          messageCollector.error(new NotAFunction(fun, errorNode));
        }
        return INVALID_TYPE;
      }
    }

    if (matchList.length == 1) {
      return matchList[0].fun;
    } else if (matchList.length > 0) {
      matchList.sort((a, b) => {
        if (a.score < b.score) {
          return 1;
        } else if (a.score > b.score) {
          return -1;
        } else {
          return 0;
        }
      });

      if (matchList[0].score > matchList[1].score) {
        return matchList[0].fun;
      }

      const initialScore = matchList[0].score;

      let i = 0;

      while (i < matchList.length) {
        i++;

        if (matchList[i].score != initialScore) {
          // TODO: WARN ABOUT NON-OPTIMAL CODE
          return matchList[i].fun;
        }
      }

      console.log(matchList);
    }

    if (errorNode) {
      messageCollector.error(new InvalidOverload(incommingType, argTypes, errorNode));
      return INVALID_TYPE;
    }

    return new UnionType(incommingType.of.map(($: FunctionType) => $.returnType));
  } else if (incommingType instanceof FunctionType) {
    const queryResult = acceptsTypes(incommingType, argTypes, strict, ctx, automaticCoercion);

    if (!queryResult) {
      if (errorNode) {
        messageCollector.error(new InvalidCall(incommingType.parameterTypes, argTypes, errorNode));
      } else {
        return INVALID_TYPE;
      }
    }

    return incommingType;
  } else {
    if (errorNode && !incommingType.equals(INVALID_TYPE)) {
      messageCollector.error(new NotAFunction(incommingType, errorNode));
    }
    return INVALID_TYPE;
  }
}

function findImplicitTypeCasting(
  from: Type,
  to: Type,
  ctx: TypeResolutionContext,
  messageCollector: MessageCollector
): FunctionType | null {
  if (canBeAssigned(from, to)) {
    return null;
  }
  if (from instanceof TypeAlias) {
    try {
      const fnType = resolveTypeMember(from, 'as', ctx);

      const fun = findFunctionOverload(fnType, [from], null, ctx, to, true, messageCollector, true);

      if (fun instanceof FunctionType) {
        if (!fun.name.hasAnnotation(annotations.Explicit)) {
          if (canBeAssigned(fun.returnType, to)) {
            return fun;
          }
        }
      }
    } catch (e) {
      return null;
    }
  }

  return null;
}

function acceptsTypes(
  type: FunctionType,
  types: Type[],
  strict: boolean,
  ctx: TypeResolutionContext,
  automaticCoercion: boolean
): { score: number; casts: (FunctionType | null)[] } | null {
  if (type.parameterTypes.length !== types.length) {
    return null;
  }

  let score = 1;
  let casts = [];

  if (type.parameterTypes.length == 0) {
    return { score: 1, casts: [] };
  }

  for (let index = 0; index < types.length; index++) {
    const argumentType = types[index];
    const parameterType = type.parameterTypes[index];

    const equals = argumentType.equals(parameterType);

    if (equals) {
      score += 1;
      casts.push(null);
    } else if (!strict) {
      const cleanAssignation = canBeAssigned(argumentType, parameterType);

      if (cleanAssignation) {
        score += getTypeSimilarity(argumentType, parameterType);
      } else {
        try {
          const implicitCast =
            automaticCoercion && findImplicitTypeCasting(argumentType, parameterType, ctx, new MessageCollector());

          if (implicitCast) {
            casts.push(implicitCast);
            score += 0.5 * ((types.length - index) / types.length);
          } else {
            return null;
          }
        } catch {
          return null;
        }
      }
    } else {
      return null;
    }
  }

  return {
    score,
    casts
  };
}

function downToRefTypes(type: Type): (RefType | StructType)[] {
  let argType = type;

  while (true) {
    if (argType instanceof StructType) {
      return [argType];
    } else if (argType instanceof RefType) {
      return [argType];
    } else if (argType instanceof TypeAlias) {
      argType = argType.of;
    } else if (argType instanceof UnionType) {
      return flatten((argType as UnionType).of.map($ => downToRefTypes($)));
    } else {
      return [];
    }
  }
}

function getTypeSimilarity(lhs: Type, rhs: Type) {
  if (rhs.equals(lhs) && lhs.equals(rhs)) {
    return 1;
  }

  const lhsTypes = downToRefTypes(lhs);
  if (lhsTypes.length == 0) return 0;

  const rhsTypes = downToRefTypes(rhs);
  if (rhsTypes.length == 0) return 0;

  let results: number[] = [];

  lhsTypes.forEach(lhs => rhsTypes.forEach(rhs => results.push(lhs.typeSimilarity(rhs))));

  return Math.max.apply(Math, results);
}

function canBeAssigned(sourceType: Type, targetType: Type): boolean {
  if (!sourceType || !sourceType.canBeAssignedTo) {
    console.trace();
    console.log(sourceType, sourceType.toString());
    console.log(sourceType.inspect(10));
  }
  return sourceType.canBeAssignedTo(targetType);
}

function ensureCanBeAssignedWithImplicitConversion(
  sourceType: Type,
  targetType: Type,
  node: Nodes.Node,
  ctx: TypeResolutionContext
) {
  if (canBeAssigned(sourceType, targetType)) {
    return { node, type: targetType };
  } else {
    const implicitCast = findImplicitTypeCasting(sourceType, targetType, ctx, ctx.parsingContext.messageCollector);

    if (implicitCast) {
      return { node: createImplicitCall(node, implicitCast, [node], ctx), type: targetType };
    } else {
      ctx.parsingContext.messageCollector.error(new TypeMismatch(sourceType, targetType, node));
      return { node, type: targetType };
    }
  }
}

function annotateImplicitCall(
  nodeToAnnotate: Nodes.Node,
  fun: FunctionType,
  argumentNodes: Nodes.Node[],
  ctx: TypeResolutionContext
) {
  const oldAnnotation = nodeToAnnotate.getAnnotation(annotations.ImplicitCall);
  const newAnnotation = new annotations.ImplicitCall(createImplicitCall(nodeToAnnotate, fun, argumentNodes, ctx));
  if (oldAnnotation) {
    if (oldAnnotation.implicitCall.resolvedFunctionType !== fun) {
      ctx.parsingContext.messageCollector.error(
        new AstNodeError(`This node already has an ${oldAnnotation} trying to add ${newAnnotation}`, nodeToAnnotate)
      );
    }
  } else {
    nodeToAnnotate.annotate(newAnnotation);
  }
}

function createImplicitCall(node: Nodes.Node, fun: FunctionType, args: Nodes.Node[], ctx: TypeResolutionContext) {
  const functionCallNode = new Nodes.InjectedFunctionCallNode(node.astNode);
  functionCallNode.argumentsNode = args;
  functionCallNode.annotate(new annotations.Injected());
  functionCallNode.resolvedFunctionType = fun;
  ensureArgumentCoercion(functionCallNode, fun, args.map($ => $.ofType), ctx);
  functionCallNode.ofType = fun.returnType;
  return functionCallNode;
}

function ensureArgumentCoercion(
  node: Nodes.AbstractFunctionCallNode,
  fun: FunctionType,
  argsTypes: Type[],
  ctx: TypeResolutionContext
) {
  node.argumentsNode.forEach((argNode, i) => {
    const argType = argsTypes[i];

    if (argType) {
      const ret = ensureCanBeAssignedWithImplicitConversion(argType, fun.parameterTypes[i], argNode, ctx);
      node.argumentsNode[i] = ret.node;
    } else {
      ctx.parsingContext.messageCollector.error(new AstNodeError('type is undefined', node.argumentsNode[i]));
    }
  });
}
