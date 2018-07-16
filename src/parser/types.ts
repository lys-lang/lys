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
    return _otherType && this.nativeType == _otherType.nativeType && this.binaryenType == _otherType.binaryenType;
  }
  canBeAssignedTo(_otherType: Type) {
    return this.equals(_otherType);
  }

  toString() {
    return `???<${NativeTypes[this.nativeType]}>`;
  }
}

export class VoidType extends Type {
  nativeType: NativeTypes = NativeTypes.void;

  private constructor() {
    super();
  }

  toString() {
    return 'void';
  }

  static instance = new VoidType();
}

export class FunctionType extends Type {
  nativeType: NativeTypes = NativeTypes.func;

  constructor(public internalName: string) {
    super();
  }

  parameterTypes: Type[];
  returnType: Type;

  acceptsTypes(types: Type[]) {
    if (this.parameterTypes.length !== types.length) return false;
    return types.every(($, $$) => this.parameterTypes[$$].equals($));
  }

  toString() {
    return `fun(${this.parameterTypes.join(', ')}) -> ${this.returnType}`;
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
      const newType = new UnionType();
      newType.of = newTypes;
      return newType;
    }
  }
}

export class TypeReference extends Type {
  constructor(public referencedName: string) {
    super();
  }
  toString() {
    return `TypeRef(${this.referencedName})`;
  }
}

export class UnionType extends Type {
  nativeType: NativeTypes = NativeTypes.anyfunc;

  constructor() {
    super();
  }

  of: Type[] = [];

  toString() {
    return this.of.map($ => $.toString()).join(' | ');
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
  constructor() {
    super(NativeTypes.i32);
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
