(module
 (type $0 (func (param i32) (result i32)))
 (type $1 (func (param i32 i32) (result i32)))
 (memory $0 1)
 (export "memory" (memory $0))
 (export "test" (func $2))
 (export "test2" (func $3))
 (func $0 (; 0 ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (i32.eq
   (local.get $0)
   (local.get $1)
  )
 )
 (func $1 (; 1 ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (i32.add
   (local.get $0)
   (local.get $1)
  )
 )
 (func $2 (; 2 ;) (type $0) (param $0 i32) (result i32)
  (block $label$1 (result i32)
   (drop
    (br_if $label$1
     (i32.const 1)
     (i32.eqz
      (call $0
       (i32.const 1)
       (call $1
        (local.get $0)
        (i32.const 1)
       )
      )
     )
    )
   )
   (i32.const 0)
  )
 )
 (func $3 (; 3 ;) (type $0) (param $0 i32) (result i32)
  (if (result i32)
   (call $0
    (call $1
     (local.get $0)
     (i32.const 1)
    )
    (i32.const 1)
   )
   (i32.const 0)
   (i32.const 1)
  )
 )
)
