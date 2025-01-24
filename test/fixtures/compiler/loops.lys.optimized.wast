(module
 (type $0 (func))
 (type $1 (func (result i32)))
 (global $global$0 (mut i32) (i32.const 0))
 (memory $0 1)
 (data $0 (i32.const 21) "\08\00\00\00t\00r\00u\00e")
 (data $1 (i32.const 34) "\n\00\00\00f\00a\00l\00s\00e")
 (data $2 (i32.const 49) "\02\00\00\000")
 (data $3 (i32.const 56) "\02\00\00\000")
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
  (loop $label
   (local.set $0
    (i32.add
     (local.get $0)
     (i32.const 1)
    )
   )
   (br $label)
  )
  (unreachable)
 )
 (func $3
  (global.set $global$0
   (i32.const 65536)
  )
 )
)
