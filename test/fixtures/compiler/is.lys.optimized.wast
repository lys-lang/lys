(module
 (type $none_=>_none (func))
 (type $none_=>_i32 (func (result i32)))
 (type $i64_=>_i64 (func (param i64) (result i64)))
 (memory $0 1)
 (data (i32.const 21) "\08\00\00\00t\00r\00u\00e")
 (data (i32.const 34) "\n\00\00\00f\00a\00l\00s\00e")
 (data (i32.const 49) "\02\00\00\000")
 (data (i32.const 56) "\02\00\00\000")
 (global $global$0 (mut i32) (i32.const 0))
 (export "memory" (memory $0))
 (export "test_getMaxMemory" (func $0))
 (export "identity" (func $1))
 (export "test" (func $2))
 (start $3)
 (func $0 (result i32)
  (global.get $global$0)
 )
 (func $1 (param $0 i64) (result i64)
  (local.get $0)
 )
 (func $2
  (nop)
 )
 (func $3
  (global.set $global$0
   (i32.const 65536)
  )
 )
)
