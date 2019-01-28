(module
 (type $0 (func (param i32) (result i32)))
 (type $1 (func (result i32)))
 (export "main" (func $0))
 (export "main2" (func $1))
 (func $0 (; 0 ;) (type $1) (result i32)
  (i32.const 2)
 )
 (func $1 (; 1 ;) (type $0) (param $0 i32) (result i32)
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
