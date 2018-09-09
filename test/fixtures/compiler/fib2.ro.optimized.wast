(module
 (type $7 (func (param i32) (result i32)))
 (type $11 (func (param i32 i32 i32) (result i32)))
 (type $12 (func (result i32)))
 (export "fib" (func $91))
 (export "test" (func $92))
 (func $90 (; 0 ;) (; has Stack IR ;) (type $11) (param $0 i32) (param $1 i32) (param $2 i32) (result i32)
  (if (result i32)
   (i32.gt_s
    (get_local $0)
    (i32.const 0)
   )
   (call $90
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
 (func $91 (; 1 ;) (; has Stack IR ;) (type $7) (param $0 i32) (result i32)
  (call $90
   (get_local $0)
   (i32.const 0)
   (i32.const 1)
  )
 )
 (func $92 (; 2 ;) (; has Stack IR ;) (type $12) (result i32)
  (call $91
   (i32.const 46)
  )
 )
)
