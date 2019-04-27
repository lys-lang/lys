import {
  UnionType,
  FunctionType,
  Type,
  IntersectionType,
  TypeType,
  RefType,
  TypeAlias,
  NeverType,
  NativeTypes,
  StructType,
  StackType,
  TypeHelpers,
  InjectableTypes
} from '../types';
import { annotations } from '../annotations';
import { Nodes } from '../nodes';
import { flatten } from '../helpers';
import { TypeMismatch, InvalidOverload, NotAFunction, InvalidCall, NotAValidType, LysTypeError } from '../NodeError';
import { MessageCollector } from '../MessageCollector';

declare var console: any;

export function isValidType(type: Type | null | void): type is Type {
  if (type instanceof IntersectionType || type instanceof UnionType) {
    return type.of.every(isValidType);
  }

  if (type instanceof FunctionType) {
    return isValidType(type.returnType) && type.parameterTypes!.every(isValidType);
  }

  if (type instanceof TypeAlias) {
    return isValidType(type.of);
  }

  if (type instanceof TypeType) {
    return isValidType(type.of);
  }

  if (!type) {
    return false;
  }

  return true;
}

export function getTypeTypeType(node: Nodes.Node, type: Type | null, messageCollector: MessageCollector): Type | null {
  if (type instanceof TypeType) {
    return type.of;
  } else {
    if (type) {
      messageCollector.errorIfBranchDoesntHaveAny(new NotAValidType(node));
    }
    return null;
  }
}

export function getTypeFromTypeNode(node: Nodes.Node, messageCollector: MessageCollector): Type | null {
  if (node instanceof Nodes.ReferenceNode) {
    return getTypeTypeType(node, TypeHelpers.getNodeType(node), messageCollector);
  } else if (
    node instanceof Nodes.IntersectionTypeNode ||
    node instanceof Nodes.UnionTypeNode ||
    node instanceof Nodes.InjectedTypeNode ||
    node instanceof Nodes.StructTypeNode ||
    node instanceof Nodes.StackTypeNode
  ) {
    return TypeHelpers.getNodeType(node);
  } else {
    messageCollector.errorIfBranchDoesntHaveAny(new NotAValidType(node));

    return null;
  }
}

export function resolveTypeMember(
  errorNode: Nodes.Node | null,
  type: Type,
  memberName: string,
  messageCollector: MessageCollector
): Type | false {
  if (type && type instanceof TypeAlias) {
    const resolvedName = type.name.namespaceNames && type.name.namespaceNames.get(memberName);

    if (resolvedName) {
      const memberType = TypeHelpers.getNodeType(resolvedName);

      if (isValidType(memberType)) {
        return memberType;
      }

      if (errorNode) {
        messageCollector.error(new LysTypeError(`Type "${memberType}" is not ready`, errorNode));
      }

      return false;
    } else {
      if (type.name.namespaceNames) {
        const keys = Array.from(type.name.namespaceNames.keys());
        if (errorNode) {
          messageCollector.error(
            new LysTypeError(
              `Property "${memberName}" doesn't exist in type "${type}". Possible are: ${keys.join(', ')}`,
              errorNode
            )
          );
        }
      } else {
        if (errorNode) {
          messageCollector.error(new LysTypeError(`Type "${type}" has no members.`, errorNode));
        }
      }
      // Since the members are calculated in the scope phase we return
      // `never` type so the type check execution can continue
      return InjectableTypes.never;
    }
  } else {
    if (errorNode) {
      if (!NeverType.isNeverType(type)) {
        messageCollector.error(
          new LysTypeError(`Type ${type.inspect(10)} has no members. Members are stored in type aliases.`, errorNode)
        );
      }
    }
  }
  return false;
}

export function processFunctionCall(
  node: Nodes.AbstractFunctionCallNode,
  functionType: Type,
  argTypes: Type[],
  messageCollector: MessageCollector
): Type | null {
  try {
    const isGetter = !node.hasAnnotation(annotations.IsAssignationLHS);

    if (isGetter) {
      const fun = findFunctionOverload(functionType, argTypes, node, null, false, messageCollector, true);

      if (fun instanceof FunctionType) {
        node.resolvedFunctionType = fun;

        ensureArgumentCoercion(node, fun, argTypes, messageCollector);

        return fun.returnType!;
      }
    } else {
      return functionType;
    }
  } catch (e) {
    const errorNode = e.node || node;

    messageCollector.errorIfBranchDoesntHaveAny(e, errorNode);

    return null;
  }

  if (!NeverType.isNeverType(functionType)) {
    messageCollector.errorIfBranchDoesntHaveAny(new LysTypeError('Invalid function: ' + functionType, node));
  }

  return null;
}

export function findFunctionOverload(
  incommingType: Type,
  argTypes: Type[],
  errorNode: Nodes.Node | null,
  returnType: Type | null,
  strict: boolean,
  messageCollector: MessageCollector,
  automaticCoercion: boolean
): Type | null {
  if (incommingType instanceof TypeType) {
    return findFunctionOverload(
      incommingType.of,
      argTypes,
      errorNode,
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
          if (acceptsTypes(fun, argTypes, strict, automaticCoercion)) {
            if (!returnType || fun.returnType!.equals(returnType)) {
              return fun;
            }
          }
        } else {
          const result = acceptsTypes(fun, argTypes, strict, automaticCoercion);
          if (result) {
            if (!returnType || canBeAssigned(fun.returnType!, returnType)) {
              matchList.push({ fun, score: result.score, casts: result.casts });
            }
          }
        }
      } else {
        if (errorNode) {
          messageCollector.error(new NotAFunction(fun, errorNode));
        }
        return null;
      }
    }

    if (matchList.length === 1) {
      return matchList[0].fun;
    } else if (matchList.length > 1) {
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

      let selectedOverload = 0;

      if (errorNode) {
        messageCollector.warning(
          `Implicit overload with ambiguity.\nPicking overload ${matchList[
            selectedOverload
          ].fun.toString()} for types (${argTypes
            .map($ => $.toString())
            .join(', ')})\nComplete list of overloads:\n${matchList
            .map($ => '  ' + $.fun.toString() + ' score: ' + $.score)
            .join('\n')}`,
          errorNode
        );
      }

      return matchList[selectedOverload].fun;
    }

    if (errorNode) {
      if (incommingType.of.length > 1) {
        messageCollector.error(new InvalidOverload(incommingType, argTypes, errorNode));
      } else {
        const fun = incommingType.of[0] as FunctionType;
        messageCollector.error(new InvalidCall(fun.parameterTypes!, argTypes, errorNode));
      }

      return null;
    }

    return new UnionType((incommingType.of as FunctionType[]).map(($: FunctionType) => $.returnType!));
  } else if (incommingType instanceof FunctionType) {
    const queryResult = acceptsTypes(incommingType, argTypes, strict, automaticCoercion);

    if (!queryResult) {
      if (errorNode) {
        messageCollector.error(new InvalidCall(incommingType.parameterTypes!, argTypes, errorNode));
      } else {
        return null;
      }
    }

    return incommingType;
  } else {
    if (errorNode && !NeverType.isNeverType(incommingType)) {
      messageCollector.error(new NotAFunction(incommingType, errorNode));
    }
    return null;
  }
}

function findImplicitTypeCasting(
  errorNode: Nodes.Node | null,
  from: Type,
  to: Type,
  messageCollector: MessageCollector
): FunctionType | null {
  if (canBeAssigned(from, to)) {
    return null;
  }
  if (from instanceof TypeAlias) {
    try {
      const fnType = resolveTypeMember(errorNode, from, 'as', messageCollector);

      if (fnType) {
        const fun = findFunctionOverload(fnType, [from], null, to, true, messageCollector, true);

        if (fun instanceof FunctionType) {
          if (!fun.name.hasAnnotation(annotations.Explicit)) {
            if (canBeAssigned(fun.returnType!, to)) {
              return fun;
            }
          }
        }
      }
    } catch (e) {
      return null;
    }
  }

  return null;
}

function sizeInBytes(type: Type, defaultSize: number) {
  if (type instanceof StackType) {
    return type.byteSize;
  }
  if (type instanceof RefType) {
    return type.byteSize;
  }
  switch (type.binaryenType) {
    case NativeTypes.i32:
    case NativeTypes.f32:
      return 4;
    case NativeTypes.i64:
    case NativeTypes.f64:
      return 8;
  }
  return defaultSize;
}

function acceptsTypes(
  type: FunctionType,
  types: Type[],
  strict: boolean,
  automaticCoercion: boolean
): { score: number; casts: (FunctionType | null)[] } | null {
  if (type.parameterTypes!.length !== types.length) {
    return null;
  }

  let score = 1;
  let casts = [];

  if (type.parameterTypes!.length === 0) {
    return { score: Infinity, casts: [] };
  }

  for (let index = 0; index < types.length; index++) {
    const argumentType = types[index];
    const parameterType = type.parameterTypes![index];

    const equals = argumentType.equals(parameterType);

    if (equals) {
      score += 1;
      casts.push(null);
    } else if (!strict) {
      const cleanAssignation = canBeAssigned(argumentType, parameterType);

      if (cleanAssignation) {
        score += getTypeSimilarity(argumentType, parameterType);
      } else if (automaticCoercion) {
        try {
          const implicitCast = findImplicitTypeCasting(null, argumentType, parameterType, new MessageCollector());

          if (implicitCast) {
            casts.push(implicitCast);
            const dataLossInBytes = sizeInBytes(parameterType, 0) / sizeInBytes(argumentType, 1);
            if (isNaN(dataLossInBytes)) return null;
            score += 0.5 * Math.min(((types.length - index) / types.length) * dataLossInBytes, 1);
          } else {
            return null;
          }
        } catch {
          return null;
        }
      } else {
        return null;
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
  if (lhsTypes.length === 0) return 0;

  const rhsTypes = downToRefTypes(rhs);
  if (rhsTypes.length === 0) return 0;

  let results: number[] = [];

  lhsTypes.forEach(lhs => rhsTypes.forEach(rhs => results.push(lhs.typeSimilarity(rhs))));

  return Math.max.apply(Math, results);
}

export function canBeAssigned(sourceType: Type, targetType: Type): boolean {
  if (!sourceType || !sourceType.canBeAssignedTo) {
    console.trace();
    console.log(sourceType, sourceType.toString());
    console.log(sourceType.inspect(10));
  }
  return sourceType.canBeAssignedTo(targetType);
}

export function ensureCanBeAssignedWithImplicitConversion(
  sourceType: Type,
  targetType: Type,
  node: Nodes.ExpressionNode,
  messageCollector: MessageCollector
) {
  if (canBeAssigned(sourceType, targetType)) {
    return { node, type: targetType };
  } else {
    const implicitCast = findImplicitTypeCasting(node, sourceType, targetType, new MessageCollector());

    if (implicitCast) {
      return { node: createImplicitCall(node, implicitCast, [node], messageCollector), type: targetType };
    } else {
      messageCollector.error(new TypeMismatch(sourceType, targetType, node));
      return { node, type: targetType };
    }
  }
}

export function annotateImplicitCall(
  nodeToAnnotate: Nodes.Node,
  fun: FunctionType,
  argumentNodes: Nodes.ExpressionNode[],
  messageCollector: MessageCollector
) {
  const oldAnnotation = nodeToAnnotate.getAnnotation(annotations.ImplicitCall);
  const newAnnotation = new annotations.ImplicitCall(
    createImplicitCall(nodeToAnnotate, fun, argumentNodes, messageCollector)
  );
  if (oldAnnotation) {
    if (!fun.equals(oldAnnotation.implicitCall.resolvedFunctionType!)) {
      messageCollector.error(
        new LysTypeError(`This node already has an ${oldAnnotation} trying to add ${newAnnotation}`, nodeToAnnotate)
      );
    }
  } else {
    nodeToAnnotate.annotate(newAnnotation);
  }
}

function createImplicitCall(
  node: Nodes.Node,
  fun: FunctionType,
  args: Nodes.ExpressionNode[],
  messageCollector: MessageCollector
) {
  const functionCallNode = new Nodes.InjectedFunctionCallNode(node.astNode);
  functionCallNode.argumentsNode = args;
  functionCallNode.annotate(new annotations.Injected());
  functionCallNode.resolvedFunctionType = fun;
  ensureArgumentCoercion(functionCallNode, fun, args.map($ => TypeHelpers.getNodeType($)!), messageCollector);

  TypeHelpers.setNodeType(functionCallNode, fun.returnType!);
  return functionCallNode;
}

function ensureArgumentCoercion(
  node: Nodes.AbstractFunctionCallNode,
  fun: FunctionType,
  argsTypes: Type[],
  messageCollector: MessageCollector
) {
  node.argumentsNode.forEach((argNode, i) => {
    const argType = argsTypes[i];

    if (argType) {
      const ret = ensureCanBeAssignedWithImplicitConversion(argType, fun.parameterTypes![i], argNode, messageCollector);
      node.argumentsNode[i] = ret.node;
    } else {
      messageCollector.error(new LysTypeError('type is undefined', node.argumentsNode[i]));
    }
  });
}
