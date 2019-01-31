import { flatten } from './helpers';
import { Nodes } from './nodes';

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

  abstract toString(): string;
  abstract inspect(levels: number): string;
}

export class FunctionType extends Type {
  nativeType: NativeTypes = NativeTypes.func;

  constructor(public name: Nodes.NameIdentifierNode) {
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

  inspect() {
    return `(fun ${JSON.stringify(this.name.name)} (${this.parameterTypes
      .map($ => $.inspect(0))
      .join(' ')}) ${this.returnType.inspect(0)})`;
  }
}

export class RefType extends Type {
  nativeType: NativeTypes = NativeTypes.u64;

  static instance: RefType = new RefType();

  protected constructor() {
    super();
  }

  static isRefType(otherType: Type) {
    return getUnderlyingTypeFromAlias(otherType) === RefType.instance;
  }

  toString() {
    return 'ref';
  }

  inspect() {
    return '(ref ?)';
  }

  canBeAssignedTo(otherType: Type) {
    if (super.canBeAssignedTo(otherType)) {
      return true;
    }

    if (RefType.isRefType(otherType)) {
      return true;
    }

    return false;
  }

  typeSimilarity(to: Type, depth: number = 1): number {
    if (this.equals(to)) {
      return 1 / depth;
    }

    return 0;
  }

  equals(otherType: Type) {
    if (!otherType) return false;
    return RefType.isRefType(otherType);
  }
}

export class StringType extends RefType {
  toString() {
    return 'string';
  }

  inspect() {
    return '(ref string)';
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
      return flatten((argType as UnionType).of.map($ => downToRefTypes($)));
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
  parameterTypes: Type[] = [];
  parameterNames: string[] = [];

  constructor(public structName: string) {
    super();
  }

  acceptsTypes(types: Type[], strict: boolean) {
    return acceptsTypes(this, types, strict);
  }

  equals(type: Type) {
    return type === this;
  }

  toString() {
    return this.structName.toString();
  }

  inspect() {
    return '(struct ' + this.structName.toString() + ')';
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

  inspect(levels: number = 0) {
    return '(intersection ' + this.of.map($ => $.inspect(levels - 1)).join(' ') + ')';
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

export function getUnderlyingTypeFromAlias(type: Type): Type {
  if (type instanceof TypeAlias) {
    return getUnderlyingTypeFromAlias(type.of);
  } else {
    return type;
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

  constructor(public readonly of: Type[] = [], public readonly simplified = false) {
    super();
  }

  static of(x: Type[] | Type): UnionType {
    if (x instanceof UnionType) {
      return x;
    } else if (x instanceof Type) {
      return new UnionType([x], true);
    } else if (x instanceof Array) {
      return new UnionType(x);
    }
    throw new Error('Cannot create UnionType');
  }

  toString() {
    if (this.of.length == 0) return '(empty union)';
    return this.of.map($ => $.toString()).join(' | ');
  }

  inspect(levels: number = 0) {
    if (this.of.length == 0) return `(union EMPTY)`;
    return '(union ' + this.of.map($ => $.inspect(levels - 1)).join(' ') + ')';
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

  /**
   * This method expands the union type made by other union types into a single
   * union made of the atoms of every member of the initial union. Recursively.
   */
  expand(): Type {
    const newSet = new Set<Type>();

    function add(typeToAdd: Type) {
      const candidate = getUnderlyingTypeFromAlias(typeToAdd);

      if (candidate instanceof UnionType) {
        // If it is an union, we must expand it for each atom
        candidate.of.forEach($ => add($));
      } else {
        // finalize if already present
        if (newSet.has(typeToAdd)) {
          return;
        }
        for (let $ of newSet) {
          // finalize if we already have a type A == B && B == A
          if ($.equals(typeToAdd) && typeToAdd.equals($)) {
            return;
          }
        }
        newSet.add(typeToAdd);
      }
    }

    this.of.forEach(add);

    const newTypes = Array.from(newSet.values());

    return new UnionType(newTypes).simplify();
  }

  /**
   * This method removes an element from the union
   * @param type type to subtract
   */
  subtract(type: Type): Type {
    const removingRefType = RefType.isRefType(type);

    if (!this.simplified) {
      return UnionType.of(this.expand()).subtract(type);
    }

    const newSet = new Set<Type>();

    for (let $ of this.of) {
      if ((!removingRefType && RefType.isRefType($)) || !$.canBeAssignedTo(type)) {
        newSet.add($);
      }
    }

    if (newSet.size == 0) {
      return NeverType.instance;
    }

    const newTypes = Array.from(newSet.values());

    if (newTypes.length == 1) {
      return newTypes[0];
    }

    return new UnionType(newTypes);
  }

  /**
   * This method simplifies the union type. e.g:
   *
   *   type T0 = A | A | A | B
   *   type T0Simplified = A | B
   *
   * It removes types present in unions
   *
   *   type T1 = T0Simplified | B | C | A
   *   type T1Simplified = T0Simplified | C
   *
   *
   */
  simplify() {
    if (this.of.length === 1) {
      return this.of[0];
    }

    let newTypes: Type[] = [];

    this.of.forEach($ => {
      if ($ instanceof UnknownType) return;

      if (!newTypes.some($1 => $1.equals($))) {
        newTypes.push($);
      }
    });

    if (newTypes.length == 0) {
      return InvalidType.instance;
    }

    let unions: UnionType[] = [];

    function collectUnion($: Type) {
      const candidate = getUnderlyingTypeFromAlias($);

      if (candidate instanceof UnionType) {
        if (!unions.includes(candidate)) {
          unions.push(candidate);
          candidate.of.forEach($ => {
            collectUnion($);
          });
        }
      }
    }

    // Collect unions
    newTypes.forEach(collectUnion);

    // This are the unions that generate some conflict with other unions,
    // therefore we need to expand those unions to the atoms
    const blackListedUnionAtoms: Type[] = [];
    const unionsToRemove: UnionType[] = [];

    // Find the conflictive atoms
    unions.forEach((union, ix) => {
      const expanded = UnionType.of(union.expand());

      const hasConflict = expanded.of.some(atom => unions.some(($, $$) => $$ != ix && atom.canBeAssignedTo($)));
      if (hasConflict) {
        blackListedUnionAtoms.push(...expanded.of);

        // we are removing the union, it might have elements not present in the
        // newTypes, we add them
        expanded.of.forEach($ => {
          if (!newTypes.some($1 => $1.equals($))) {
            newTypes.push($);
          }
        });
        unionsToRemove.push(union);
      }
    });

    unions = unions.filter($ => !unionsToRemove.includes($));

    // Eliminate types present in unions
    newTypes.forEach((newType, i) => {
      const candidate = getUnderlyingTypeFromAlias(newType);

      if (unionsToRemove.includes(candidate as any)) {
        newTypes[i] = null;
        return;
      }

      if (RefType.isRefType(candidate) || blackListedUnionAtoms.some(x => candidate.canBeAssignedTo(x))) {
        return;
      }

      if (unions.some(union => !union.equals(candidate) && candidate.canBeAssignedTo(union))) {
        newTypes[i] = null;
      }
    });

    // Remove eliminated types
    newTypes = newTypes.filter($ => !!$);

    if (newTypes.length === 1) {
      return newTypes[0];
    } else {
      return new UnionType(newTypes, true);
    }
  }
}

export class TypeAlias extends Type {
  constructor(public name: Nodes.NameIdentifierNode, public readonly of: Type) {
    super();
  }

  get binaryenType() {
    return this.of.binaryenType;
  }

  get nativeType(): NativeTypes {
    return this.of.nativeType;
  }

  canBeAssignedTo(other: Type) {
    return this.of.canBeAssignedTo(other);
  }

  equals(other: Type) {
    return other === this;
  }

  toString() {
    return this.name.toString();
  }

  inspect(levels: number = 0) {
    return '(alias ' + this.name.toString() + (levels > 0 ? ' ' + this.of.inspect(levels - 1) : '') + ')';
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

  inspect(levels: number = 0) {
    return `(type ${this.of.inspect(levels - 1)})`;
  }

  toString() {
    return `Type<${this.of}>`;
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

  inspect() {
    return '(native ' + (NativeTypes[this.nativeType] as string) + ')';
  }
}

export class VoidType extends NativeType {
  static instance = new VoidType(NativeTypes.void);

  inspect() {
    return '(void)';
  }
}

export class NeverType extends NativeType {
  static instance = new NeverType(NativeTypes.void);

  equals(other: Type) {
    if (other instanceof NeverType) return true;
    if (other instanceof UnionType) {
      if (other.of.length == 0) {
        return true;
      }
      if (other.of.length == 1 && this.equals(other.of[0])) {
        return true;
      }
    }
    return super.equals(other);
  }

  inspect() {
    return '(never)';
  }
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
    return '(unknown)';
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
    return '(invalid)';
  }

  equals(otherType: Type) {
    return otherType instanceof InvalidType;
  }

  canBeAssignedTo(_: Type) {
    return false;
  }

  static instance = new InvalidType(NativeTypes.void);
}

export const InjectableTypes: Record<string, Type> = {
  u8: u8.instance,
  boolean: bool.instance,
  char: char.instance,
  usize: usize.instance,
  isize: isize.instance,
  i32: i32.instance,
  u32: u32.instance,
  i64: i64.instance,
  u64: u64.instance,
  i16: i16.instance,
  u16: u16.instance,
  f32: f32.instance,
  f64: f64.instance,
  void: VoidType.instance,
  ref: RefType.instance,
  string: StringType.instance,
  never: NeverType.instance
};
