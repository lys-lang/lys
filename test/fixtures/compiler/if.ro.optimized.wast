(module
 (type $0 (func (param i32) (result i32)))
 (type $1 (func (param i32 i32) (result i32)))
 (type $2 (func (result i32)))
 (export "gcd" (func $1))
 (export "test" (func $2))
 (export "ifWithoutElse" (func $3))
 (func $0 (; 0 ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (i32.sub
   (local.get $0)
   (local.get $1)
  )
 )
 (func $1 (; 1 ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (if (result i32)
   (i32.gt_s
    (local.get $0)
    (local.get $1)
   )
   (call $1
    (call $0
     (local.get $0)
     (local.get $1)
    )
    (local.get $1)
   )
   (if (result i32)
    (i32.lt_s
     (local.get $0)
     (local.get $1)
    )
    (call $1
     (local.get $0)
     (call $0
      (local.get $1)
      (local.get $0)
     )
    )
    (local.get $0)
   )
  )
 )
 (func $2 (; 2 ;) (type $2) (result i32)
  (call $1
   (i32.const 119)
   (i32.const 7)
  )
 )
 (func $3 (; 3 ;) (type $0) (param $0 i32) (result i32)
  (select
   (i32.const 3)
   (i32.const 1)
   (i32.eq
    (local.get $0)
    (i32.const 1)
   )
  )
 )
)
