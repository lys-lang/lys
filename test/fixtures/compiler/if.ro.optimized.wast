(module
 (type $0 (func (param i32 i32) (result i32)))
 (type $1 (func (result i32)))
 (type $2 (func (param i32) (result i32)))
 (export "gcd" (func $0))
 (export "test" (func $1))
 (export "ifWithoutElse" (func $2))
 (func $0 (; 0 ;) (type $0) (param $0 i32) (param $1 i32) (result i32)
  (if (result i32)
   (i32.gt_s
    (get_local $0)
    (get_local $1)
   )
   (call $0
    (i32.sub
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
    (call $0
     (get_local $0)
     (i32.sub
      (get_local $1)
      (get_local $0)
     )
    )
    (get_local $0)
   )
  )
 )
 (func $1 (; 1 ;) (type $1) (result i32)
  (call $0
   (i32.const 119)
   (i32.const 7)
  )
 )
 (func $2 (; 2 ;) (type $2) (param $0 i32) (result i32)
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