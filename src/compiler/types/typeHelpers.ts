import { UnionType, FunctionType, Type, IntersectionType, TypeType, TypeAlias, TraitType, TypeHelpers, FunctionSignatureType } from '../types';

export function isValidType(type: Type | null | void): type is Type {
  if (type instanceof IntersectionType || type instanceof UnionType) {
    return type.of.every(isValidType);
  }

  if (type instanceof FunctionSignatureType) {
    return isValidType(type.returnType) && type.parameterTypes.every(isValidType);
  }

  if (type instanceof FunctionType) {
    return isValidType(type.signature);
  }

  if (type instanceof TypeAlias) {
    return isValidType(type.of);
  }

  if (type instanceof TraitType) {
    for (let [, value] of type.traitNode.namespaceNames) {
      if (!isValidType(TypeHelpers.getNodeType(value))) {
        return false;
      }
    }
    return true;
  }

  if (type instanceof TypeType) {
    return isValidType(type.of);
  }

  if (!type) {
    return false;
  }

  return true;
}
