(module
 (type $4 (func (param i32 i32 i32) (result i32)))
 (type $5 (func (param i32) (result i32)))
 (type $6 (func (result i32)))
 (export "fib" (func $56))
 (export "test" (func $57))
 (func $55 (; 0 ;) (; has Stack IR ;) (type $4) (param $0 i32) (param $1 i32) (param $2 i32) (result i32)
  (if (result i32)
   (i32.gt_s
    (get_local $0)
    (i32.const 0)
   )
   (call $55
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
 (func $56 (; 1 ;) (; has Stack IR ;) (type $5) (param $0 i32) (result i32)
  (call $55
   (get_local $0)
   (i32.const 0)
   (i32.const 1)
  )
 )
 (func $57 (; 2 ;) (; has Stack IR ;) (type $6) (result i32)
  (call $56
   (i32.const 46)
  )
 )
)
