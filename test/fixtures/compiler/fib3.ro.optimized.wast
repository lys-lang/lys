(module
 (type $4 (func (param i32) (result i32)))
 (type $8 (func (param i32 i32 i32) (result i32)))
 (type $9 (func (result i32)))
 (export "fib" (func $74))
 (export "test" (func $75))
 (func $73 (; 0 ;) (; has Stack IR ;) (type $8) (param $0 i32) (param $1 i32) (param $2 i32) (result i32)
  (if (result i32)
   (i32.gt_s
    (get_local $0)
    (i32.const 0)
   )
   (call $73
    (i32.sub
     (get_local $0)
     (i32.const 1)
    )
    (get_local $2)
    (i32.add
     (get_local $1)
     (get_local $2)
    )
   )
   (get_local $1)
  )
 )
 (func $74 (; 1 ;) (; has Stack IR ;) (type $4) (param $0 i32) (result i32)
  (call $73
   (get_local $0)
   (i32.const 0)
   (i32.const 1)
  )
 )
 (func $75 (; 2 ;) (; has Stack IR ;) (type $9) (result i32)
  (call $74
   (i32.const 46)
  )
 )
)
