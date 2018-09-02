(module
 (type $0 (func (param i32 i32) (result i32)))
 (type $4 (func (result i32)))
 (export "gcd" (func $55))
 (export "test" (func $56))
 (func $12 (; 0 ;) (; has Stack IR ;) (type $0) (param $0 i32) (param $1 i32) (result i32)
  (i32.sub
   (get_local $0)
   (get_local $1)
  )
 )
 (func $55 (; 1 ;) (; has Stack IR ;) (type $0) (param $0 i32) (param $1 i32) (result i32)
  (if (result i32)
   (i32.gt_s
    (get_local $0)
    (get_local $1)
   )
   (call $55
    (call $12
     (get_local $0)
     (get_local $1)
    )
    (get_local $1)
   )
   (if (result i32)
    (i32.lt_s
     (get_local $0)
     (get_local $1)
    )
    (call $55
     (get_local $0)
     (call $12
      (get_local $1)
      (get_local $0)
     )
    )
    (get_local $0)
   )
  )
 )
 (func $56 (; 2 ;) (; has Stack IR ;) (type $4) (result i32)
  (call $55
   (i32.const 119)
   (i32.const 7)
  )
 )
)
