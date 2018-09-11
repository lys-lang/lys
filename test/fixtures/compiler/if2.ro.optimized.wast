(module
 (type $1 (func (param i32 i32) (result i32)))
 (type $14 (func (result i32)))
 (export "gcd" (func $101))
 (export "test" (func $102))
 (func $16 (; 0 ;) (; has Stack IR ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (i32.sub
   (get_local $0)
   (get_local $1)
  )
 )
 (func $101 (; 1 ;) (; has Stack IR ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (if
   (i32.gt_s
    (get_local $0)
    (get_local $1)
   )
   (set_local $0
    (call $101
     (call $16
      (get_local $0)
      (get_local $1)
     )
     (get_local $1)
    )
   )
   (if
    (i32.lt_s
     (get_local $0)
     (get_local $1)
    )
    (set_local $0
     (call $101
      (get_local $0)
      (call $16
       (get_local $1)
       (get_local $0)
      )
     )
    )
   )
  )
  (get_local $0)
 )
 (func $102 (; 2 ;) (; has Stack IR ;) (type $14) (result i32)
  (call $101
   (i32.const 119)
   (i32.const 7)
  )
 )
)
