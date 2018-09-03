(module
 (type $0 (func (param i32 i32) (result i32)))
 (type $4 (func (param i32) (result i32)))
 (type $8 (func (result i32)))
 (export "gcd" (func $73))
 (export "test" (func $74))
 (export "ifWithoutElse" (func $75))
 (func $12 (; 0 ;) (; has Stack IR ;) (type $0) (param $0 i32) (param $1 i32) (result i32)
  (i32.sub
   (get_local $0)
   (get_local $1)
  )
 )
 (func $73 (; 1 ;) (; has Stack IR ;) (type $0) (param $0 i32) (param $1 i32) (result i32)
  (if (result i32)
   (i32.gt_s
    (get_local $0)
    (get_local $1)
   )
   (call $73
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
    (call $73
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
 (func $74 (; 2 ;) (; has Stack IR ;) (type $8) (result i32)
  (call $73
   (i32.const 119)
   (i32.const 7)
  )
 )
 (func $75 (; 3 ;) (; has Stack IR ;) (type $4) (param $0 i32) (result i32)
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
