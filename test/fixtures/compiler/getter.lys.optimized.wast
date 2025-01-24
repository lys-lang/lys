(module
 (type $0 (func (result i32)))
 (type $1 (func (param i64) (result i32)))
 (type $2 (func))
 (global $global$0 (mut i32) (i32.const 0))
 (memory $0 1)
 (data $0 (i32.const 21) "\08\00\00\00t\00r\00u\00e")
 (data $1 (i32.const 34) "\n\00\00\00f\00a\00l\00s\00e")
 (data $2 (i32.const 49) "\02\00\00\000")
 (data $3 (i32.const 56) "\02\00\00\000")
 (export "memory" (memory $0))
 (export "test_getMaxMemory" (func $0))
 (export "main" (func $1))
 (start $2)
 (func $0 (result i32)
  (global.get $global$0)
 )
 (func $1 (param $0 i64) (result i32)
  (local $1 i32)
  (i32.or
   (i32.load
    (i32.add
     (local.tee $1
      (i32.wrap_i64
       (local.get $0)
      )
     )
     (i32.const 8)
    )
   )
   (i32.or
    (i32.shl
     (i32.load
      (local.get $1)
     )
     (i32.const 16)
    )
    (i32.shl
     (i32.load
      (i32.add
       (local.get $1)
       (i32.const 4)
      )
     )
     (i32.const 8)
    )
   )
  )
 )
 (func $2
  (global.set $global$0
   (i32.const 65536)
  )
 )
)
