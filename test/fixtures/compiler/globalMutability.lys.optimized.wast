(module
 (type $none_=>_i32 (func (result i32)))
 (type $none_=>_none (func))
 (memory $0 1)
 (data (i32.const 21) "\08\00\00\00t\00r\00u\00e")
 (data (i32.const 34) "\n\00\00\00f\00a\00l\00s\00e")
 (data (i32.const 49) "\02\00\00\000")
 (data (i32.const 56) "\02\00\00\000")
 (global $global$0 (mut i32) (i32.const 0))
 (global $global$1 (mut i32) (i32.const 0))
 (global $global$2 (mut i32) (i32.const 0))
 (export "memory" (memory $0))
 (export "test_getMaxMemory" (func $0))
 (export "main" (func $1))
 (start $2)
 (func $0 (result i32)
  (global.get $global$0)
 )
 (func $1 (result i32)
  (global.set $global$1
   (i32.sub
    (i32.add
     (global.get $global$1)
     (i32.const 1)
    )
    (global.get $global$2)
   )
  )
  (global.get $global$1)
 )
 (func $2
  (global.set $global$0
   (i32.const 65536)
  )
  (global.set $global$1
   (i32.const 2)
  )
  (global.set $global$2
   (i32.const -1)
  )
 )
)
