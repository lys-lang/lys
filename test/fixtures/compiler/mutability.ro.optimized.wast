(module
 (type $4 (func (result i32)))
 (type $5 (func (param i32) (result i32)))
 (export "main" (func $55))
 (export "main2" (func $56))
 (func $55 (; 0 ;) (; has Stack IR ;) (type $4) (result i32)
  (i32.const 2)
 )
 (func $56 (; 1 ;) (; has Stack IR ;) (type $5) (param $0 i32) (result i32)
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
