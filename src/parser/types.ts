import { Closure } from './closure';
import { AstNodeError } from './NodeError';
import { TypeGraph } from './types/TypeGraph';
import { TypeResolutionContext } from './types/TypePropagator';

export type Valtype = 'i32' | 'i64' | 'f32' | 'f64' | 'u32' | 'label';

export enum NativeTypes {
  i32 = 'i32',
  i64 = 'i64',
  f32 = 'f32',
  f64 = 'f64',
  anyfunc = 'anyfunc',
  func = 'func',
  block_type = 'block_type',
  void = 'void',

  boolean = 'boolean',
  i8 = 'i8',
  u8 = 'u8',
  i16 = 'i16',
  u16 = 'u16',
  u32 = 'u32',
  u64 = 'u64'
}

// In _bytes_
const word = 4;

export enum sizeOf {
  i32 = word,
  i64 = word * 2,
  f32 = word,
  f64 = word * 2,
  u64 = word * 2,
  u32 = word,
  u16 = word >> 1,
  boolean = word >> 2,
  u8 = word >> 2,
  i8 = word >> 2,
  i16 = word >> 1,
  anyfunc = word,
  func = word,
  block_type = word
}

export abstract class Type {
  nativeType: NativeTypes;
  superType: Type | null = null;
  getSize(): number {
    return sizeOf[this.nativeType];
  }
  get binaryenType(): Valtype {
    switch (this.nativeType) {
      case NativeTypes.i32:
        return 'i32';
      case NativeTypes.u32:
        return 'i32';
      case NativeTypes.f32:
        return 'f32';
      case NativeTypes.f64:
        return 'f64';

      case NativeTypes.boolean:
      case NativeTypes.u8:
      case NativeTypes.i8:
      case NativeTypes.u16:
      case NativeTypes.i16:
      case NativeTypes.func:
        return 'i32';

      case NativeTypes.void:
        return undefined;
    }
  }

  equals(_otherType: Type) {
    if (!_otherType) return false;
    return _otherType && _otherType instanceof this.constructor;
  }

  canBeAssignedTo(_otherType: Type) {
    if (this.superType && this.superType.canBeAssignedTo(_otherType)) {
      return true;
    }

    return this.equals(_otherType); // add supertype logic here
  }

  toString() {
    return `???<${NativeTypes[this.nativeType]}>`;
  }
}

export class VoidType extends Type {
  nativeType: NativeTypes = NativeTypes.void;

  protected constructor() {
    super();
  }

  toString() {
    return 'void';
  }

  static instance = new VoidType();
}

export class UnknownType extends VoidType {
  toString() {
    return 'UNKNOWN';
  }

  equals(_: Type) {
    return false;
  }

  canBeAssignedTo(_: Type) {
    return true;
  }

  static instance = new UnknownType();
}

export class InvalidType extends VoidType {
  toString() {
    return 'INVALID_TYPE';
  }

  static instance = new InvalidType();
}

export class FunctionType extends Type {
  nativeType: NativeTypes = NativeTypes.func;

  constructor(public internalName: string) {
    super();
  }

  parameterTypes: Type[];
  parameterNames: string[];
  returnType: Type;

  acceptsTypes(types: Type[]) {
    if (this.parameterTypes.length !== types.length) return false;
    return types.every(($, $$) => this.parameterTypes[$$].equals($));
  }

  equals(type: Type) {
    if (!(type instanceof FunctionType)) return false;
    if (this.parameterTypes.length != type.parameterTypes.length) return false;
    if (!this.returnType.equals(type.returnType)) return false;
    if (this.parameterTypes.some(($, $$) => !$.equals(type.parameterTypes[$$]))) return false;
    return true;
  }

  toString() {
    return `fun(${this.parameterTypes
      .map(($, $$) => {
        if (this.parameterNames[$$]) {
          return this.parameterNames[$$] + ': ' + $;
        } else {
          return $;
        }
      })
      .join(', ')}) -> ${this.returnType}`;
  }
}

export class HeapReferenceType extends Type {
  nativeType: NativeTypes = NativeTypes.i32;

  toString() {
    return 'HEAP<???>';
  }
}

export class PolimorphicType extends HeapReferenceType {
  constructor(public fqn: string) {
    super();
  }

  toString() {
    return this.fqn;
  }
}

export class StructType extends PolimorphicType {
  constructor(public internalName: string, fqn: string, superType: Type = null) {
    super(fqn);
    this.superType = superType;
  }

  parameterTypes: Type[];
  parameterNames: string[];

  acceptsTypes(types: Type[]) {
    if (this.parameterTypes.length !== types.length) return false;
    return types.every(($, $$) => this.parameterTypes[$$].equals($));
  }

  equals(type: Type) {
    if (!(type instanceof StructType)) return false;
    if (this.fqn !== type.fqn) return false;
    if (this.parameterTypes.length != type.parameterTypes.length) return false;
    if (this.parameterTypes.some(($, $$) => !$.equals(type.parameterTypes[$$]))) return false;
    return true;
  }

  toString() {
    return this.fqn;
  }
}

export class IntersectionType extends Type {
  nativeType: NativeTypes = NativeTypes.anyfunc;

  constructor(public of: Type[] = []) {
    super();
  }

  toString() {
    return this.of.map($ => $.toString()).join(' & ');
  }

  simplify() {
    const newTypes: Type[] = [];
    this.of.forEach($ => {
      if (!newTypes.some($1 => $1.equals($))) {
        newTypes.push($);
      }
    });

    if (newTypes.length === 1) {
      return newTypes[0];
    } else {
      const newType = new IntersectionType();
      newType.of = newTypes;
      return newType;
    }
  }
}

export class ReferenceType extends Type {
  constructor(public referencedName: string, public closure: Closure) {
    super();
    if (!closure) {
      debugger;
    }
  }

  resolveType(typeGraph: TypeGraph): Type {
    const resolvedReference = this.closure.get(this.referencedName);
    const typeNode = typeGraph.findNode(resolvedReference.referencedNode);

    // TODO: verify referencedNode is a type declaration and not a variable name

    if (!typeNode) {
      throw new AstNodeError('Node has no type node', resolvedReference.referencedNode);
    }
    if (!typeNode.resultType()) {
      throw new AstNodeError(
        `Node ${resolvedReference.referencedNode.parent.nodeName}.${
          resolvedReference.referencedNode.nodeName
        } has no resolved type (${resolvedReference.referencedNode.name})`,
        resolvedReference.referencedNode
      );
    }
    return typeNode.resultType();
  }

  toString() {
    return `TypeRef(${this.referencedName})`;
  }
}

export class UnionType extends Type {
  nativeType: NativeTypes = NativeTypes.anyfunc;

  constructor(public of: Type[] = []) {
    super();
  }

  toString() {
    if (this.of.length == 0) return '(empty union)';
    return this.of.map($ => $.toString()).join(' | ');
  }

  simplify() {
    const newTypes: Type[] = [];

    const superTypes = new Set<Type>();

    this.of.forEach($ => {
      superTypes.add($.superType);

      if (!newTypes.some($1 => $1.equals($))) {
        newTypes.push($);
      }
    });

    if (newTypes.length === 1) {
      return newTypes[0];
    } else {
      if (superTypes.size == 1) {
        const superType = superTypes.values().next().value;
        if (newTypes.every($ => $.canBeAssignedTo(superType))) {
          return superType;
        }
      }
      const newType = new UnionType();
      newType.of = newTypes;
      return newType;
    }
  }
}

export abstract class NativeType extends Type {
  constructor(public nativeType: NativeTypes) {
    super();
  }
  toString() {
    return NativeTypes[this.nativeType];
  }
}

export class u8 extends NativeType {
  constructor() {
    super(NativeTypes.u8);
  }
}

export class bool extends NativeType {
  static instance = new bool();

  constructor() {
    super(NativeTypes.i32);
  }

  equals(_otherType: Type) {
    if (!_otherType) return false;
    return _otherType && _otherType instanceof bool;
  }

  toString() {
    return NativeTypes.boolean;
  }
}

export class i32 extends NativeType {
  constructor() {
    super(NativeTypes.i32);
  }
}

export class u32 extends NativeType {
  constructor() {
    super(NativeTypes.u32);
  }
}

export class i16 extends NativeType {
  constructor() {
    super(NativeTypes.i16);
  }
}

export class u16 extends NativeType {
  constructor() {
    super(NativeTypes.u16);
  }
}

export class f32 extends NativeType {
  constructor() {
    super(NativeTypes.f32);
  }
}

export class f64 extends NativeType {
  constructor() {
    super(NativeTypes.f64);
  }
}

export class pointer extends NativeType {
  constructor() {
    super(NativeTypes.anyfunc);
  }
}

export const InjectableTypes = {
  u8,
  boolean: bool,
  i32,
  u32,
  i16,
  u16,
  f32,
  f64,
  pointer,
  void: VoidType
};

export function toConcreteType(type: Type, ctx: TypeResolutionContext) {
  if (type instanceof ReferenceType) {
    return type.resolveType(ctx.currentGraph);
  }

  return type;
}
