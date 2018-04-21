export enum NativeTypes {
  i32 = 1,
  i64 = 1 << 1,
  f32 = 1 << 2,
  f64 = 1 << 3,
  anyfunc = 1 << 4,
  func = 1 << 5,
  block_type = 1 << 6,

  i8 = 1 << 7,
  u8 = 1 << 8,
  i16 = 1 << 9,
  u16 = 1 << 10,
  u32 = 1 << 11,
  u64 = 1 << 12
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
  u8 = word >> 2,
  i8 = word >> 2,
  i16 = word >> 1,
  anyfunc = word,
  func = word,
  block_type = word
}

export abstract class Type {
  abstract getSize(): number;
}

export abstract class NativeType extends Type {
  constructor(public nativeType: NativeTypes) {
    super();
  }
}

export namespace InjectableTypes {
  export class byte extends NativeType {
    constructor() {
      super(NativeTypes.u8);
    }
    getSize() {
      return sizeOf.u8;
    }
  }

  export class int extends NativeType {
    constructor() {
      super(NativeTypes.i32);
    }
    getSize() {
      return sizeOf.i32;
    }
  }

  export class uint extends NativeType {
    constructor() {
      super(NativeTypes.u32);
    }
    getSize() {
      return sizeOf.u32;
    }
  }

  export class short extends NativeType {
    constructor() {
      super(NativeTypes.i16);
    }
    getSize() {
      return sizeOf.i16;
    }
  }

  export class ushort extends NativeType {
    constructor() {
      super(NativeTypes.u16);
    }
    getSize() {
      return sizeOf.u16;
    }
  }

  export class float extends NativeType {
    constructor() {
      super(NativeTypes.f32);
    }
    getSize() {
      return sizeOf.f32;
    }
  }

  export class double extends NativeType {
    constructor() {
      super(NativeTypes.f64);
    }
    getSize() {
      return sizeOf.f64;
    }
  }

  export class pointer extends NativeType {
    constructor() {
      super(NativeTypes.anyfunc);
    }
    getSize() {
      return sizeOf.anyfunc;
    }
  }
}
