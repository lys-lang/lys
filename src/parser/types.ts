import { Closure } from './closure';
import { AstNodeError } from './NodeError';
import { TypeGraph } from './types/TypeGraph';
import { TypeResolutionContext } from './types/TypePropagator';
import { flatten } from './helpers';

export type Valtype = 'i32' | 'i64' | 'f32' | 'f64' | 'u32' | 'label';

export enum NativeTypes {
  i32 = 'i32',
  i64 = 'i64',
  f32 = 'f32',
  f64 = 'f64',

  anyfunc = 'anyfunc',
  func = 'func',
  void = 'void',

  boolean = 'boolean',
  char = 'char',

  usize = 'usize',
  isize = 'isize',

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
  char = word,
  usize = word,
  isize = word,
  u8 = word >> 2,
  i8 = word >> 2,
  i16 = word >> 1,
  anyfunc = word,
  func = word
}

export abstract class Type {
  nativeType: NativeTypes;

  getSize(): number {
    return sizeOf[this.nativeType];
  }
  get binaryenType(): Valtype {
    switch (this.nativeType) {
      case NativeTypes.boolean:
      case NativeTypes.u8:
      case NativeTypes.i8:
      case NativeTypes.u16:
      case NativeTypes.i16:
      case NativeTypes.i32:
      case NativeTypes.u32:
      case NativeTypes.char:
      case NativeTypes.usize:
      case NativeTypes.isize:
        return 'i32';

      case NativeTypes.f32:
        return 'f32';

      case NativeTypes.f64:
        return 'f64';

      case NativeTypes.func:
      case NativeTypes.i64:
      case NativeTypes.u64:
        return 'i64';

      case NativeTypes.void:
        return undefined;
      default:
        throw new Error(`Type ${this} (${this.constructor.name}) returned a undefined binaryenType`);
    }
  }

  equals(otherType: Type) {
    if (!otherType) return false;

    return otherType === this;
  }

  canBeAssignedTo(otherType: Type) {
    if (this.equals(otherType)) {
      return true;
    }

    if (otherType instanceof TypeAlias) {
      return this.canBeAssignedTo(otherType.of);
    }

    if (otherType instanceof UnionType) {
      if (otherType.of.some($ => this.canBeAssignedTo($))) {
        return true;
      }
    }

    return false;
  }

  toString() {
    return `???<${NativeTypes[this.nativeType]}>`;
  }
}

export class FunctionType extends Type {
  nativeType: NativeTypes = NativeTypes.func;

  constructor(public internalName: string) {
    super();
  }

  parameterTypes: Type[];
  parameterNames: string[];
  returnType: Type;

  acceptsTypes(types: Type[], strict: boolean) {
    return acceptsTypes(this, types, strict);
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

export class RefType extends Type {
  nativeType: NativeTypes = NativeTypes.u64;
  superType: RefType | null = null;

  static instance: RefType = new RefType();

  toString() {
    return 'ref';
  }

  canBeAssignedTo(otherType: Type) {
    if (super.canBeAssignedTo(otherType)) {
      return true;
    }

    if (this.superType && this.superType.canBeAssignedTo(otherType)) {
      return true;
    }

    if (otherType instanceof RefType && otherType.toString() == 'ref') {
      return true;
    }

    return false;
  }

  typeSimilarity(to: Type, depth: number = 1): number {
    if (this.equals(to)) {
      return 1 / depth;
    }

    if (this.superType) {
      return this.superType.typeSimilarity(to, depth + 1);
    }

    return 0;
  }

  equals(other: Type) {
    if (!other) return false;
    return other instanceof RefType && other.toString() == 'ref';
  }
}

export class PolimorphicType extends RefType {
  of = new Map<string, StructType>();

  constructor(public fqn: string) {
    super();
    this.superType = RefType.instance;
  }

  equals(otherType: Type) {
    if (!otherType) return false;
    return this === otherType;
  }

  toString() {
    return this.fqn;
  }
}

export class StringType extends RefType {
  toString() {
    return 'string';
  }

  equals(other: Type) {
    if (!other) return false;
    return other instanceof StringType;
  }
}

function acceptsTypes(type: StructType | FunctionType, types: Type[], strict: boolean): number {
  if (type.parameterTypes.length !== types.length) {
    return 0;
  }

  let score = 1;

  if (type.parameterTypes.length == 0) {
    return 1;
  }

  for (let index = 0; index < types.length; index++) {
    const argumentType = types[index];
    const parameterType = type.parameterTypes[index];

    const equals = argumentType.equals(parameterType);

    if (equals) {
      score += 1;
    } else if (!strict) {
      const canBeAssignedTo = argumentType.canBeAssignedTo(parameterType);

      if (!canBeAssignedTo) {
        return 0;
      }

      score += getTypeSimilarity(argumentType, parameterType);
    } else {
      return 0;
    }
  }

  return score;
}

function downToRefTypes(type: Type): RefType[] {
  let argType = type;

  while (true) {
    if (argType instanceof RefType) {
      return [argType];
    } else if (argType instanceof TypeAlias) {
      argType = argType.of;
    } else if (argType instanceof UnionType) {
      return flatten(argType.of.map($ => downToRefTypes($)));
    } else {
      return [];
    }
  }
}

export function getTypeSimilarity(lhs: Type, rhs: Type) {
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

export class StructType extends RefType {
  private constructor(public internalName: string, public fqn: string, superType: PolimorphicType = null) {
    super();

    if (superType) {
      this.superType = superType;
      if (superType.of.has(fqn)) {
        throw new Error('Supertype already have ' + fqn);
      }
      superType.of.set(fqn, this);
    } else {
      this.superType = RefType.instance;
    }
  }

  static fromSuperType(internalName: string, fqn: string, superType: PolimorphicType) {
    if (superType && superType.of.has(fqn)) {
      return superType.of.get(fqn);
    } else {
      return new StructType(internalName, fqn, superType);
    }
  }

  parameterTypes: Type[];
  parameterNames: string[];

  acceptsTypes(types: Type[], strict: boolean) {
    return acceptsTypes(this, types, strict);
  }

  equals(type: Type) {
    if (!(type instanceof StructType)) return false;
    if (this.fqn !== type.fqn) return false;
    if (this.superType !== type.superType) return false;
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
      return new IntersectionType(newTypes);
    }
  }

  equals(other: Type) {
    if (!other) return false;
    // TODO: flatMap
    return other instanceof IntersectionType && other.of.every($ => this.of.includes($));
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

  equals(other: Type) {
    if (!other) return false;
    return (
      other instanceof ReferenceType && other.closure.get(other.referencedName) == this.closure.get(this.referencedName)
    );
  }
}

export class UnionType extends Type {
  get binaryenType(): Valtype {
    const nativeTypes = new Set<Valtype>();

    this.of.forEach($ => {
      nativeTypes.add($.binaryenType);
    });

    if (nativeTypes.size == 1) {
      return nativeTypes.values().next().value;
    } else {
      throw new Error('Cannot find a suitable low level type for ' + this.toString());
    }
  }

  constructor(public of: Type[] = [], public readonly simplified = false) {
    super();
  }

  toString() {
    if (this.of.length == 0) return '(empty union)';
    return this.of.map($ => $.toString()).join(' | ');
  }

  canBeAssignedTo(otherType: Type) {
    return this.of.every($ => $.canBeAssignedTo(otherType));
  }

  equals(other: Type) {
    if (!other) return false;

    return (
      other instanceof UnionType && other.of.every($ => this.of.includes($)) && this.of.every($ => other.of.includes($))
    );
  }

  simplify() {
    const newTypes: Type[] = [];

    const superTypes = new Set<PolimorphicType>();

    this.of.forEach($ => {
      if ($ instanceof UnknownType) return;

      if ($ instanceof RefType && $.superType && $.superType instanceof PolimorphicType) {
        superTypes.add($.superType);
      }

      if (!newTypes.some($1 => $1.equals($))) {
        newTypes.push($);
      }
    });

    if (newTypes.length == 0) {
      return InvalidType.instance;
    }

    if (newTypes.length === 1) {
      return newTypes[0];
    } else {
      if (superTypes.size == 1) {
        const superType = superTypes.values().next().value;

        if (meetsAllRequirements(newTypes, superType)) {
          return superType;
        }
      }
      return new UnionType(newTypes, true);
    }
  }
}

function meetsAllRequirements(types: Type[], superType: PolimorphicType) {
  const missing = new Set(superType.of.values());

  if (types.length < missing.size) {
    return false;
  }

  types.forEach(($: StructType) => missing.delete($));

  return missing.size == 0;
}

export class TypeAlias extends Type {
  of: Type = null;
  constructor(public name: string) {
    super();
  }

  get nativeType(): NativeTypes {
    return this.of.nativeType;
  }

  canBeAssignedTo(other: Type) {
    return this.of.canBeAssignedTo(other);
  }

  equals(other: Type) {
    return other == this;
  }

  toString() {
    return this.name;
  }
}

export class TypeType extends Type {
  private constructor(public of: Type) {
    super();
  }

  static memMap = new WeakMap<Type, TypeType>();

  static of(of: Type) {
    let ret = this.memMap.get(of);
    if (!ret) {
      ret = new TypeType(of);
      this.memMap.set(of, ret);
    }
    return ret;
  }

  equals(other: Type) {
    if (!other) return false;
    return other instanceof TypeType && other.of.equals(this.of);
  }

  toString() {
    return `Type<${this.of.toString()}>`;
  }
}

export abstract class NativeType extends Type {
  protected constructor(public nativeType: NativeTypes) {
    super();
  }

  equals(other: Type) {
    if (!other) return false;
    return other instanceof this.constructor && other.nativeType === this.nativeType;
  }

  toString() {
    return NativeTypes[this.nativeType] as string;
  }
}

export class VoidType extends NativeType {
  static instance = new VoidType(NativeTypes.void);
}

export class u8 extends NativeType {
  static instance = new u8(NativeTypes.u8);
}

export class bool extends NativeType {
  static instance = new bool(NativeTypes.boolean);
}

export class i32 extends NativeType {
  static instance = new i32(NativeTypes.i32);
}

export class char extends NativeType {
  static instance = new char(NativeTypes.i32);
}

export class usize extends NativeType {
  static instance = new usize(NativeTypes.i32);
}

export class isize extends NativeType {
  static instance = new isize(NativeTypes.i32);
}

export class u32 extends NativeType {
  static instance = new u32(NativeTypes.u32);
}

export class i16 extends NativeType {
  static instance = new i16(NativeTypes.i16);
}

export class u16 extends NativeType {
  static instance = new u16(NativeTypes.u16);
}

export class f32 extends NativeType {
  static instance = new f32(NativeTypes.f32);
}

export class f64 extends NativeType {
  static instance = new f64(NativeTypes.f64);
}

export class i64 extends NativeType {
  static instance = new i64(NativeTypes.i64);
}

export class u64 extends NativeType {
  static instance = new u64(NativeTypes.u64);
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

  static instance = new UnknownType(NativeTypes.void);
}

export class InvalidType extends VoidType {
  toString() {
    return 'INVALID_TYPE';
  }

  equals(_: Type) {
    return false;
  }

  canBeAssignedTo(_: Type) {
    return false;
  }

  static instance = new InvalidType(NativeTypes.void);
}

export const InjectableTypes: Record<string, Type> = {
  u8: TypeType.of(u8.instance),
  boolean: TypeType.of(bool.instance),
  char: TypeType.of(char.instance),
  usize: TypeType.of(usize.instance),
  isize: TypeType.of(isize.instance),
  i32: TypeType.of(i32.instance),
  u32: TypeType.of(u32.instance),
  i64: TypeType.of(i64.instance),
  u64: TypeType.of(u64.instance),
  i16: TypeType.of(i16.instance),
  u16: TypeType.of(u16.instance),
  f32: TypeType.of(f32.instance),
  f64: TypeType.of(f64.instance),
  void: TypeType.of(VoidType.instance),
  ref: TypeType.of(RefType.instance),
  string: TypeType.of(StringType.instance)
};

export function toConcreteType(type: Type, ctx: TypeResolutionContext) {
  if (type instanceof ReferenceType) {
    return type.resolveType(ctx.currentGraph);
  }

  return type;
}
