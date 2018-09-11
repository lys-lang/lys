(module
 (type $7 (func (param i32) (result i32)))
 (type $14 (func (result i32)))
 (export "main" (func $101))
 (export "main2" (func $102))
 (func $101 (; 0 ;) (; has Stack IR ;) (type $14) (result i32)
  (i32.const 2)
 )
 (func $102 (; 1 ;) (; has Stack IR ;) (type $7) (param $0 i32) (result i32)
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
