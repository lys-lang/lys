(module
 (type $0 (func (result i32)))
 (type $1 (func (param i32 i32) (result i32)))
 (type $2 (func (param i32) (result i32)))
 (type $3 (func))
 (global $global$0 (mut i32) (i32.const 0))
 (memory $0 1)
 (data $0 (i32.const 21) "\08\00\00\00t\00r\00u\00e")
 (data $1 (i32.const 34) "\n\00\00\00f\00a\00l\00s\00e")
 (data $2 (i32.const 49) "\02\00\00\000")
 (data $3 (i32.const 56) "\02\00\00\000")
 (export "memory" (memory $0))
 (export "test_getMaxMemory" (func $0))
 (export "gcd" (func $1))
 (export "test" (func $2))
 (export "ifWithoutElse" (func $3))
 (start $4)
 (func $0 (result i32)
  (global.get $global$0)
 )
 (func $1 (param $0 i32) (param $1 i32) (result i32)
  (if (result i32)
   (i32.gt_s
    (local.get $0)
    (local.get $1)
   )
   (then
    (call $1
     (i32.sub
      (local.get $0)
      (local.get $1)
     )
     (local.get $1)
    )
   )
   (else
    (if (result i32)
     (i32.lt_s
      (local.get $0)
      (local.get $1)
     )
     (then
      (call $1
       (local.get $0)
       (i32.sub
        (local.get $1)
        (local.get $0)
       )
      )
     )
     (else
      (local.get $0)
     )
    )
   )
  )
 )
 (func $2 (result i32)
  (call $1
   (i32.const 119)
   (i32.const 7)
  )
 )
 (func $3 (param $0 i32) (result i32)
  (select
   (i32.const 3)
   (i32.const 1)
   (i32.eq
    (local.get $0)
    (i32.const 1)
   )
  )
 )
 (func $4
  (global.set $global$0
   (i32.const 65536)
  )
 )
)
