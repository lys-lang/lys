(module
 (type $0 (func (param i32) (result i32)))
 (type $1 (func (param i32 i32) (result i32)))
 (type $2 (func (param i32 i32 i32) (result i32)))
 (export "fib" (func $2))
 (func $0 (; 0 ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (i32.eq
   (local.get $0)
   (local.get $1)
  )
 )
 (func $1 (; 1 ;) (type $2) (param $0 i32) (param $1 i32) (param $2 i32) (result i32)
  (block $label$1
   (br_if $label$1
    (call $0
     (i32.const 0)
     (local.get $0)
    )
   )
   (if
    (i32.eqz
     (call $0
      (i32.const 1)
      (local.get $0)
     )
    )
    (block
     (local.set $1
      (call $1
       (i32.sub
        (local.get $0)
        (i32.const 1)
       )
       (local.get $2)
       (i32.add
        (local.get $1)
        (local.get $2)
       )
      )
     )
     (br $label$1)
    )
   )
   (local.set $1
    (local.get $2)
   )
  )
  (local.get $1)
 )
 (func $2 (; 2 ;) (type $0) (param $0 i32) (result i32)
  (call $1
   (local.get $0)
   (i32.const 0)
   (i32.const 1)
  )
 )
)
