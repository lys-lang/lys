(module
 (type $0 (func (result i32)))
 (type $1 (func (param i32) (result i32)))
 (export "main" (func $0))
 (export "main2" (func $1))
 (func $0 (; 0 ;) (type $0) (result i32)
  (i32.const 2)
 )
 (func $1 (; 1 ;) (type $1) (param $0 i32) (result i32)
  (local $1 i32)
  (set_local $1
   (i32.const 1)
  )
  (if
   (i32.eq
    (get_local $0)
    (i32.const 1)
   )
   (set_local $1
    (i32.const 3)
   )
  )
  (get_local $1)
 )
)
