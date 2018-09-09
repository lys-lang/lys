(module
 (type $1 (func (param i32 i32) (result i32)))
 (type $11 (func (result i32)))
 (export "gcd" (func $90))
 (export "test" (func $91))
 (func $16 (; 0 ;) (; has Stack IR ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (i32.sub
   (get_local $0)
   (get_local $1)
  )
 )
 (func $90 (; 1 ;) (; has Stack IR ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (if (result i32)
   (i32.gt_s
    (get_local $0)
    (get_local $1)
   )
   (call $90
    (call $16
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
    (call $90
     (get_local $0)
     (call $16
      (get_local $1)
      (get_local $0)
     )
    )
    (get_local $0)
   )
  )
 )
 (func $91 (; 2 ;) (; has Stack IR ;) (type $11) (result i32)
  (call $90
   (i32.const 119)
   (i32.const 7)
  )
 )
)
