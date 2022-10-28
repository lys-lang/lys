(module
 (type $none_=>_none (func))
 (type $none_=>_i32 (func (result i32)))
 (memory $0 1)
 (data (i32.const 21) "\08\00\00\00t\00r\00u\00e")
 (data (i32.const 34) "\n\00\00\00f\00a\00l\00s\00e")
 (data (i32.const 49) "\02\00\00\000")
 (data (i32.const 56) "\02\00\00\000")
 (global $global$0 (mut i32) (i32.const 0))
 (export "memory" (memory $0))
 (export "test_getMaxMemory" (func $0))
 (export "test" (func $1))
 (export "test1" (func $1))
 (export "test2" (func $2))
 (export "test3" (func $1))
 (start $3)
 (func $0 (result i32)
  (global.get $global$0)
 )
 (func $1
  (nop)
 )
 (func $2
  (local $0 i32)
  (local.set $0
   (i32.const 1)
  )
  (loop $label$1
   (local.set $0
    (i32.add
     (local.get $0)
     (i32.const 1)
    )
   )
   (br $label$1)
  )
 )
 (func $3
  (global.set $global$0
   (i32.const 65536)
  )
 )
)
