(module
 (type $7 (func (param i32) (result i32)))
 (type $11 (func (result i32)))
 (export "main" (func $90))
 (export "main2" (func $91))
 (func $90 (; 0 ;) (; has Stack IR ;) (type $11) (result i32)
  (i32.const 2)
 )
 (func $91 (; 1 ;) (; has Stack IR ;) (type $7) (param $0 i32) (result i32)
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
