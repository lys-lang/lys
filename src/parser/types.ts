import binaryen = require('binaryen');

export enum NativeTypes {
  i32 = 'i32',
  i64 = 'i64',
  f32 = 'f32',
  f64 = 'f64',
  anyfunc = 'anyfunc',
  func = 'func',
  block_type = 'block_type',

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
  get binaryenType() {
    switch (this.nativeType) {
      case NativeTypes.i32:
        return binaryen.i32;
      case NativeTypes.u32:
        return binaryen.i32;
      case NativeTypes.f32:
        return binaryen.f32;
      case NativeTypes.f64:
        return binaryen.f64;

      case NativeTypes.boolean:
      case NativeTypes.u8:
      case NativeTypes.i8:
      case NativeTypes.u16:
      case NativeTypes.i16:
      case NativeTypes.func:
        return binaryen.i32;
    }
  }
  equals(_otherType: Type) {
    return _otherType && this.nativeType == _otherType.nativeType;
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

export class byte extends NativeType {
  constructor() {
    super(NativeTypes.u8);
  }
}

export class bool extends NativeType {
  constructor() {
    super(NativeTypes.boolean);
  }
}

export class int extends NativeType {
  constructor() {
    super(NativeTypes.i32);
  }
}

export class uint extends NativeType {
  constructor() {
    super(NativeTypes.u32);
  }
}

export class short extends NativeType {
  constructor() {
    super(NativeTypes.i16);
  }
}

export class ushort extends NativeType {
  constructor() {
    super(NativeTypes.u16);
  }
}

export class float extends NativeType {
  constructor() {
    super(NativeTypes.f32);
  }
}

export class double extends NativeType {
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
  byte,
  boolean: bool,
  int,
  uint,
  short,
  ushort,
  float,
  double,
  pointer
};
