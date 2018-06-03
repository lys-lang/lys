declare module binaryen {

  const none: Type;
  const i32: Type;
  const i64: Type;
  const f32: Type;
  const f64: Type;
  const unreachable: Type;
  const auto: Type;

  const InvalidId: ExpressionId;
  const BlockId: ExpressionId;
  const IfId: ExpressionId;
  const LoopId: ExpressionId;
  const BreakId: ExpressionId;
  const SwitchId: ExpressionId;
  const CallId: ExpressionId;
  const CallImportId: ExpressionId;
  const CallIndirectId: ExpressionId;
  const GetLocalid: ExpressionId;
  const SetLocalId: ExpressionId;
  const GetGlobalId: ExpressionId;
  const SetGlobalId: ExpressionId;
  const LoadId: ExpressionId;
  const StoreId: ExpressionId;
  const ConstId: ExpressionId;
  const UnaryId: ExpressionId;
  const BinaryId: ExpressionId;
  const SelectId: ExpressionId;
  const DropId: ExpressionId;
  const ReturnId: ExpressionId;
  const HostId: ExpressionId;
  const NopId: ExpressionId;
  const UnreachableId: ExpressionId;
  const AtomicCmpxchgId: ExpressionId;
  const AtomicRMWId: ExpressionId;
  const AtomicWaitId: ExpressionId;
  const AtomicWakeId: ExpressionId;

  const ExternalFunction: ExternalKind;
  const ExternalTable: ExternalKind;
  const ExternalMemory: ExternalKind;
  const ExternalGlobal: ExternalKind;

  interface I32Operations {
    load(offset: number, align: number, ptr: Expression): Expression;
    load8_s(offset: number, align: number, ptr: Expression): Expression;
    load8_u(offset: number, align: number, ptr: Expression): Expression;
    load16_s(offset: number, align: number, ptr: Expression): Expression;
    load16_u(offset: number, align: number, ptr: Expression): Expression;
    store(offset: number, align: number, ptr: Expression, value: Expression): Expression;
    store8(offset: number, align: number, ptr: Expression, value: Expression): Expression;
    store16(offset: number, align: number, ptr: Expression, value: Expression): Expression;
    const(value: number): Expression;
    clz(value: Expression): Expression;
    ctz(value: Expression): Expression;
    popcnt(value: Expression): Expression;
    eqz(value: Expression): Expression;
    trunc_s: {
      f32(value: Expression): Expression;
      f64(value: Expression): Expression;
    };
    trunc_u: {
      f32(value: Expression): Expression;
      f64(value: Expression): Expression;
    }
    reinterpret(value: Expression): Expression;
    wrap(value: Expression): Expression;
    add(left: Expression, right: Expression): Expression;
    sub(left: Expression, right: Expression): Expression;
    mul(left: Expression, right: Expression): Expression;
    div_s(left: Expression, right: Expression): Expression;
    div_u(left: Expression, right: Expression): Expression;
    rem_s(left: Expression, right: Expression): Expression;
    rem_u(left: Expression, right: Expression): Expression;
    and(left: Expression, right: Expression): Expression;
    or(left: Expression, right: Expression): Expression;
    xor(left: Expression, right: Expression): Expression;
    shl(left: Expression, right: Expression): Expression;
    shr_u(left: Expression, right: Expression): Expression;
    shr_s(left: Expression, right: Expression): Expression;
    rotl(left: Expression, right: Expression): Expression;
    rotr(left: Expression, right: Expression): Expression;
    eq(left: Expression, right: Expression): Expression;
    ne(left: Expression, right: Expression): Expression;
    lt_s(left: Expression, right: Expression): Expression;
    lt_u(left: Expression, right: Expression): Expression;
    le_s(left: Expression, right: Expression): Expression;
    le_u(left: Expression, right: Expression): Expression;
    gt_s(left: Expression, right: Expression): Expression;
    gt_u(left: Expression, right: Expression): Expression;
    ge_s(left: Expression, right: Expression): Expression;
    ge_u(left: Expression, right: Expression): Expression;
    atomic: {
      load(offset: number, ptr: Expression): Expression;
      load8_u(offset: number, ptr: Expression): Expression;
      load16_u(offset: number, ptr: Expression): Expression;
      store(offset: number, ptr: Expression, value: Expression): Expression;
      store8(offset: number, ptr: Expression, value: Expression): Expression;
      store16(offset: number, ptr: Expression, value: Expression): Expression;
      rmw: {
        add(offset: number, ptr: Expression, value: Expression): Expression;
        sub(offset: number, ptr: Expression, value: Expression): Expression;
        and(offset: number, ptr: Expression, value: Expression): Expression;
        or(offset: number, ptr: Expression, value: Expression): Expression;
        xor(offset: number, ptr: Expression, value: Expression): Expression;
        xchg(offset: number, ptr: Expression, value: Expression): Expression;
        cmpxchg(offset: number, ptr: Expression, expected: Expression, replacement: Expression): Expression;
      },
      rmw_8u: {
        add(offset: number, ptr: Expression, value: Expression): Expression;
        sub(offset: number, ptr: Expression, value: Expression): Expression;
        and(offset: number, ptr: Expression, value: Expression): Expression;
        or(offset: number, ptr: Expression, value: Expression): Expression;
        xor(offset: number, ptr: Expression, value: Expression): Expression;
        xchg(offset: number, ptr: Expression, value: Expression): Expression;
        cmpxchg(offset: number, ptr: Expression, expected: Expression, replacement: Expression): Expression;
      },
      rmw_16u: {
        add(offset: number, ptr: Expression, value: Expression): Expression;
        sub(offset: number, ptr: Expression, value: Expression): Expression;
        and(offset: number, ptr: Expression, value: Expression): Expression;
        or(offset: number, ptr: Expression, value: Expression): Expression;
        xor(offset: number, ptr: Expression, value: Expression): Expression;
        xchg(offset: number, ptr: Expression, value: Expression): Expression;
        cmpxchg(offset: number, ptr: Expression, expected: Expression, replacement: Expression): Expression;
      }
    },
    wait(ptr: Expression, expected: Expression, timeout: Expression): Expression;
  }

  interface I64Operations {
    load(offset: number, align: number, ptr: Expression): Expression;
    load8_s(offset: number, align: number, ptr: Expression): Expression;
    load8_u(offset: number, align: number, ptr: Expression): Expression;
    load16_s(offset: number, align: number, ptr: Expression): Expression;
    load16_u(offset: number, align: number, ptr: Expression): Expression;
    load32_s(offset: number, align: number, ptr: Expression): Expression;
    load32_u(offset: number, align: number, ptr: Expression): Expression;
    store(offset: number, align: number, ptr: Expression, value: Expression): Expression;
    store8(offset: number, align: number, ptr: Expression, value: Expression): Expression;
    store16(offset: number, align: number, ptr: Expression, value: Expression): Expression;
    store32(offset: number, align: number, ptr: Expression, value: Expression): Expression;
    const(low: number, high: number): Expression;
    clz(value: Expression): Expression;
    ctz(value: Expression): Expression;
    popcnt(value: Expression): Expression;
    eqz(value: Expression): Expression;
    trunc_s: {
      f32(value: Expression): Expression;
      f64(value: Expression): Expression;
    };
    trunc_u: {
      f32(value: Expression): Expression;
      f64(value: Expression): Expression;
    }
    reinterpret(value: Expression): Expression;
    extend_s(value: Expression): Expression;
    extend_u(value: Expression): Expression;
    add(left: Expression, right: Expression): Expression;
    sub(left: Expression, right: Expression): Expression;
    mul(left: Expression, right: Expression): Expression;
    div_s(left: Expression, right: Expression): Expression;
    div_u(left: Expression, right: Expression): Expression;
    rem_s(left: Expression, right: Expression): Expression;
    rem_u(left: Expression, right: Expression): Expression;
    and(left: Expression, right: Expression): Expression;
    or(left: Expression, right: Expression): Expression;
    xor(left: Expression, right: Expression): Expression;
    shl(left: Expression, right: Expression): Expression;
    shr_u(left: Expression, right: Expression): Expression;
    shr_s(left: Expression, right: Expression): Expression;
    rotl(left: Expression, right: Expression): Expression;
    rotr(left: Expression, right: Expression): Expression;
    eq(left: Expression, right: Expression): Expression;
    ne(left: Expression, right: Expression): Expression;
    lt_s(left: Expression, right: Expression): Expression;
    lt_u(left: Expression, right: Expression): Expression;
    le_s(left: Expression, right: Expression): Expression;
    le_u(left: Expression, right: Expression): Expression;
    gt_s(left: Expression, right: Expression): Expression;
    gt_u(left: Expression, right: Expression): Expression;
    ge_s(left: Expression, right: Expression): Expression;
    ge_u(left: Expression, right: Expression): Expression;
    atomic: {
      load(offset: number, ptr: Expression): Expression;
      load8_u(offset: number, ptr: Expression): Expression;
      load16_u(offset: number, ptr: Expression): Expression;
      load32_u(offset: number, ptr: Expression): Expression;
      store(offset: number, ptr: Expression, value: Expression): Expression;
      store8(offset: number, ptr: Expression, value: Expression): Expression;
      store16(offset: number, ptr: Expression, value: Expression): Expression;
      store32(offset: number, ptr: Expression, value: Expression): Expression;
      rmw: {
        add(offset: number, ptr: Expression, value: Expression): Expression;
        sub(offset: number, ptr: Expression, value: Expression): Expression;
        and(offset: number, ptr: Expression, value: Expression): Expression;
        or(offset: number, ptr: Expression, value: Expression): Expression;
        xor(offset: number, ptr: Expression, value: Expression): Expression;
        xchg(offset: number, ptr: Expression, value: Expression): Expression;
        cmpxchg(offset: number, ptr: Expression, expected: Expression, replacement: Expression): Expression;
      },
      rmw_8u: {
        add(offset: number, ptr: Expression, value: Expression): Expression;
        sub(offset: number, ptr: Expression, value: Expression): Expression;
        and(offset: number, ptr: Expression, value: Expression): Expression;
        or(offset: number, ptr: Expression, value: Expression): Expression;
        xor(offset: number, ptr: Expression, value: Expression): Expression;
        xchg(offset: number, ptr: Expression, value: Expression): Expression;
        cmpxchg(offset: number, ptr: Expression, expected: Expression, replacement: Expression): Expression;
      },
      rmw_16u: {
        add(offset: number, ptr: Expression, value: Expression): Expression;
        sub(offset: number, ptr: Expression, value: Expression): Expression;
        and(offset: number, ptr: Expression, value: Expression): Expression;
        or(offset: number, ptr: Expression, value: Expression): Expression;
        xor(offset: number, ptr: Expression, value: Expression): Expression;
        xchg(offset: number, ptr: Expression, value: Expression): Expression;
        cmpxchg(offset: number, ptr: Expression, expected: Expression, replacement: Expression): Expression;
      },
      rmw_32u: {
        add(offset: number, ptr: Expression, value: Expression): Expression;
        sub(offset: number, ptr: Expression, value: Expression): Expression;
        and(offset: number, ptr: Expression, value: Expression): Expression;
        or(offset: number, ptr: Expression, value: Expression): Expression;
        xor(offset: number, ptr: Expression, value: Expression): Expression;
        xchg(offset: number, ptr: Expression, value: Expression): Expression;
        cmpxchg(offset: number, ptr: Expression, expected: Expression, replacement: Expression): Expression;
      }
    },
    wait(ptr: Expression, expected: Expression, timeout: Expression): Expression;
  }

  interface F32Operations {
    load(offset: number, align: number, ptr: Expression): Expression;
    store(offset: number, align: number, ptr: Expression, value: Expression): Expression;
    const(value: number): Expression;
    const_bits(value: number): Expression;
    neg(value: Expression): Expression;
    abs(value: Expression): Expression;
    ceil(value: Expression): Expression;
    floor(value: Expression): Expression;
    trunc(value: Expression): Expression;
    nearest(value: Expression): Expression;
    sqrt(value: Expression): Expression;
    reinterpret(value: Expression): Expression;
    convert_s: {
      i32(value: Expression): Expression;
      i64(value: Expression): Expression;
    };
    convert_u: {
      i32(value: Expression): Expression;
      i64(value: Expression): Expression;
    };
    demote(value: Expression): Expression;
    add(left: Expression, right: Expression): Expression;
    sub(left: Expression, right: Expression): Expression;
    mul(left: Expression, right: Expression): Expression;
    div(left: Expression, right: Expression): Expression;
    copysign(left: Expression, right: Expression): Expression;
    min(left: Expression, right: Expression): Expression;
    max(left: Expression, right: Expression): Expression;
    eq(left: Expression, right: Expression): Expression;
    ne(left: Expression, right: Expression): Expression;
    lt(left: Expression, right: Expression): Expression;
    le(left: Expression, right: Expression): Expression;
    gt(left: Expression, right: Expression): Expression;
    ge(left: Expression, right: Expression): Expression;
  }

  interface F64Operations {
    load(offset: number, align: number, ptr: Expression): Expression;
    store(offset: number, align: number, ptr: Expression, value: Expression): Expression;
    const(value: number): Expression;
    const_bits(low: number, high: number): Expression;
    neg(value: Expression): Expression;
    abs(value: Expression): Expression;
    ceil(value: Expression): Expression;
    floor(value: Expression): Expression;
    trunc(value: Expression): Expression;
    nearest(value: Expression): Expression;
    sqrt(value: Expression): Expression;
    reinterpret(value: Expression): Expression;
    convert_s: {
      i32(value: Expression): Expression;
      i64(value: Expression): Expression;
    };
    convert_u: {
      i32(value: Expression): Expression;
      i64(value: Expression): Expression;
    };
    promote(value: Expression): Expression;
    add(left: Expression, right: Expression): Expression;
    sub(left: Expression, right: Expression): Expression;
    mul(left: Expression, right: Expression): Expression;
    div(left: Expression, right: Expression): Expression;
    copysign(left: Expression, right: Expression): Expression;
    min(left: Expression, right: Expression): Expression;
    max(left: Expression, right: Expression): Expression;
    eq(left: Expression, right: Expression): Expression;
    ne(left: Expression, right: Expression): Expression;
    lt(left: Expression, right: Expression): Expression;
    le(left: Expression, right: Expression): Expression;
    gt(left: Expression, right: Expression): Expression;
    ge(left: Expression, right: Expression): Expression;
  }

  interface MemorySegment {
    offset: Expression;
    data: Uint8Array;
  }

  interface BinaryWithSourceMap {
    binary: Uint8Array;
    sourceMap: string | null;
  }

  class Module {

    addFunctionType(name: string, resultType: Type, paramTypes: Type[]): FunctionType;
    getFunctionTypeBySignature(resultType: Type, paramTypes: Type[]): FunctionType;
    addFunction(name: string, functionType: FunctionType, varTypes: Type[], body: Statement): Function;
    getFunction(name: string): Function;
    removeFunction(name: string): void;
    addGlobal(name: string, type: Type, mutable: boolean, init: Expression): Global;
    addFunctionImport(internalName: string, externalModuleName: string, externalBaseName: string, functionType: FunctionType): Import;
    addTableImport(internalName: string, externalModuleName: string, externalBaseName: string): Import;
    addMemoryImport(internalName: string, externalModuleName: string, externalBaseName: string): Import;
    addGlobalImport(internalName: string, externalModuleName: string, externalBaseName: string, globalType: Type): Import;
    removeImport(internalName: string): void;
    addFunctionExport(internalName: string, externalName: string): Export;
    addTableExport(internalName: string, externalName: string): Export;
    addMemoryExport(internalName: string, externalName: string): Export;
    addGlobalExport(internalName: string, externalName: string): Export;
    removeExport(externalName: string): void;
    setFunctionTable(funcs: number[]): void;
    setMemory(initial: number, maximum: number, exportName?: string | null, segments?: MemorySegment[]): void;
    setStart(start: binaryen.Function): void;

    emitBinary(): Uint8Array;
    emitBinary(sourceMapUrl: string | null): BinaryWithSourceMap;
    emitText(): string;
    emitAsmjs(): string;
    validate(): number;
    optimize(): void;
    optimizeFunction(func: string|Function): void;
    runPasses(passes: string[]): void;
    runPassesOnFunction(func: string|Function, passes: string[]): void;
    autoDrop(): void;
    interpret(): void;
    addDebugInfoFileName(filename: string): number;
    getDebugInfoFileName(index: number): string | null;
    setDebugLocation(func: Function, expr: Expression, fileIndex: number, lineNumber: number, columnNumber: number): void;
    dispose(): void;

    i32: I32Operations;
    i64: I64Operations;
    f32: F32Operations;
    f64: F64Operations;

    block(label: string, children: Statement[], resultType?: Type): Statement;
    if(condition: Expression, ifTrue: Statement, ifFalse?: Statement): Statement;
    loop(label: string, body: Statement): Statement;

    break(label: string, condition?: Expression, value?: Expression): Statement;
    /* alias */ br(label: string, condition?: Expression, value?: Expression): Statement;
    /* alias */ br_if(label: string, condition?: Expression, value?: Expression): Statement;
    switch(labels: string[], defaultLabel: string, condition: Expression, value?: Expression): Statement;
    call(name: string, operands: Expression[], type: Type): Expression;
    callImport(name: string, operands: Expression[], type: Type): Expression;
    /* alias */ call_import(name: string, operands: Expression[], type: Type): Expression;
    callIndirect(target: Expression, operands: Expression[], type: Type): Expression;
    /* alias */ call_indirect(target: Expression, operands: Expression[], type: Type): Expression;
    getLocal(index: number, type: Type): Expression;
    /* alias */ get_local(index: number, type: Type): Expression;
    setLocal(index: number, value: Expression): Statement;
    /* alias */ set_local(index: number, value: Expression): Statement;
    teeLocal(index: number, value: Expression): Expression;
    /* alias */ tee_local(index: number, value: Expression): Expression;
    getGlobal(name: string, type: Type): Expression;
    /* alias */ get_global(name: string, type: Type): Expression;
    setGlobal(name: string, value: Expression): Expression;
    /* alias */ set_global(name: string, value: Expression): Expression;
    select(condition: Expression, ifTrue: Expression, ifFalse: Expression): Expression;
    drop(value: Expression): Statement;
    return(value?: Expression): Statement;
    nop(): Statement;
    growMemory(value: Expression): Expression;
    /* alias */ grow_memory(value: Expression): Expression;
    currentMemory(): Expression;
    /* alias */ current_memory(): Expression;
    hasFeature(name: string): Expression;
    /* alias */ has_feature(name: string): Expression;
    unreachable(): Statement;
    wake(ptr: Expression, wakeCount: Expression): Expression;
  }

  function getExpressionId(expression: Expression): number;
  function getExpressionType(expression: Expression): Type;
  function getExpressionInfo(expression: Expression): ExpressionInfo;

  interface ExpressionInfo {
    id: ExpressionId;
    type: Type;
  }

  interface BlockInfo extends ExpressionInfo {
    name: string;
    children: Expression[];
  }

  interface IfInfo extends ExpressionInfo {
    condition: Expression;
    ifTrue: Expression;
    ifFalse: Expression | null;
  }

  interface LoopInfo extends ExpressionInfo {
    name: string;
    body: Expression;
  }

  interface BreakInfo extends ExpressionInfo {
    name: string;
    condition: Expression | null;
    value: Expression | null;
  }

  interface SwitchInfo extends ExpressionInfo {
    names: string[];
    defaultName: string | null;
    condition: Expression;
    value: Expression | null;
  }

  interface CallInfo extends ExpressionInfo {
    target: string;
    operands: Expression[];
  }

  interface CallImportInfo extends ExpressionInfo {
    target: string;
    operands: Expression[];
  }

  interface CallIndirectInfo extends ExpressionInfo {
    target: Expression;
    operands: Expression[];
  }

  interface GetLocalInfo extends ExpressionInfo {
    index: number;
  }

  interface SetLocalInfo extends ExpressionInfo {
    isTee: boolean;
    index: number;
    value: Expression;
  }

  interface GetGlobalInfo extends ExpressionInfo {
    name: string;
  }

  interface SetGlobalInfo extends ExpressionInfo {
    name: string;
    value: Expression;
  }

  interface LoadInfo extends ExpressionInfo {
    isAtomic: boolean;
    isSigned: boolean;
    offset: number;
    bytes: number;
    align: number;
    ptr: Expression;
  }

  interface StoreInfo extends ExpressionInfo {
    isAtomic: boolean;
    offset: number;
    bytes: number;
    align: number;
    ptr: Expression;
    value: Expression;
  }

  interface ConstInfo extends ExpressionInfo {
    value: number | { low: number, high: number };
  }

  interface UnaryInfo extends ExpressionInfo {
    op: number; // TODO: declare ops
    value: Expression;
  }

  interface BinaryInfo extends ExpressionInfo {
    op: number; // TODO: declare ops
    left: Expression;
    right: Expression;
  }

  interface SelectInfo extends ExpressionInfo {
    ifTrue: Expression;
    ifFalse: Expression;
    condition: Expression;
  }

  interface DropInfo extends ExpressionInfo {
    value: Expression;
  }

  interface ReturnInfo extends ExpressionInfo {
    value: Expression | null;
  }

  interface HostInfo extends ExpressionInfo {
    op: number; // TODO: declare ops
    nameOperand: string | null;
    operands: Expression[];
  }

  interface AtomicRMWInfo extends ExpressionInfo {
    op: number; // TODO: declare ops
    bytes: number;
    offset: number;
    ptr: Expression;
    value: Expression;
  }

  interface AtomicCmpxchgInfo extends ExpressionInfo {
    bytes: number;
    offset: number;
    ptr: Expression;
    expected: Expression;
    replacement: Expression;
  }

  interface AtomicWaitInfo extends ExpressionInfo {
    ptr: Expression;
    expected: Expression;
    timeout: Expression;
    expectedType: Type;
  }

  interface AtomicWakeInfo extends ExpressionInfo {
    ptr: Expression;
    wakeCount: Expression;
  }

  function getFunctionTypeInfo(ftype: FunctionType): FunctionTypeInfo;

  interface FunctionTypeInfo {
    name: string;
    params: Type[];
    result: Type;
  }

  function getFunctionInfo(func: Function): FunctionInfo;

  interface FunctionInfo {
    name: string;
    ype: FunctionType;
    params: Type[];
    result: Type;
    vars: Type[];
    body: Expression
  }

  function getImportInfo(import_: Import): ImportInfo;

  interface ImportInfo {
    kind: ExternalKind;
    module: string;
    base: string;
    name: string;
  }

  interface GlobalImportInfo extends ImportInfo {
    globalType: Type;
  }

  interface FunctionImportInfo extends ImportInfo {
    functionType: string;
  }

  function getExportInfo(export_: Export): ExportInfo;

  interface ExportInfo {
    kind: ExternalKind;
    name: string;
    value: string;
  }

  function emitText(expression: Expression): string;
  function readBinary(data: Uint8Array): Module;
  function parseText(text: string): Module;
  function setAPITracing(on: boolean): void;

  class Relooper {
    addBlock(expression: Expression): RelooperBlock;
    addBranch(from: RelooperBlock, to: RelooperBlock, condition: Expression, code: Expression): void;
    addBlockWithSwitch(code: Expression, condition: Expression): RelooperBlock;
    addBranchForSwitch(from: RelooperBlock, to: RelooperBlock, indexes: number[], code: Expression): void;
    renderAndDispose(entry: RelooperBlock, labelHelper: number, module: Module): Expression;
  }

  // These are actually pointers internally
  abstract class Type { protected __Type__: number; }
  abstract class ExpressionId { protected __ExpressionId__: number; }
  abstract class ExternalKind { protected __ExternalKind__: number; }
  abstract class Statement { protected __Statement__: number; }
  abstract class FunctionType { protected __FunctionType__: number; }
  abstract class Function { protected __Function__: number; }
  abstract class Expression { protected __Expression__: number; }
  abstract class Global { protected __Global__: number; }
  abstract class Import { protected __Import__: number; }
  abstract class Export { protected __Export__: number; }
  abstract class RelooperBlock { protected __RelooperBlock__: number; }
}

export = binaryen;
