(module
 (type $7 (func (param i32) (result i32)))
 (type $14 (func (param i32 i32 i32) (result i32)))
 (type $15 (func (result i32)))
 (export "fib" (func $102))
 (export "test" (func $103))
 (func $101 (; 0 ;) (; has Stack IR ;) (type $14) (param $0 i32) (param $1 i32) (param $2 i32) (result i32)
  (if (result i32)
   (i32.gt_s
    (get_local $0)
    (i32.const 0)
   )
   (call $101
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
 (func $102 (; 1 ;) (; has Stack IR ;) (type $7) (param $0 i32) (result i32)
  (call $101
   (get_local $0)
   (i32.const 0)
   (i32.const 1)
  )
 )
 (func $103 (; 2 ;) (; has Stack IR ;) (type $15) (result i32)
  (call $102
   (i32.const 46)
  )
 )
)
