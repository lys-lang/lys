(module
 (type $0 (func (param i32 i32) (result i32)))
 (type $4 (func (param i32) (result i32)))
 (type $8 (func (param i32 i32 i32) (result i32)))
 (export "fib" (func $74))
 (func $2 (; 0 ;) (; has Stack IR ;) (type $0) (param $0 i32) (param $1 i32) (result i32)
  (i32.eq
   (get_local $0)
   (get_local $1)
  )
 )
 (func $73 (; 1 ;) (; has Stack IR ;) (type $8) (param $0 i32) (param $1 i32) (param $2 i32) (result i32)
  (local $3 i32)
  (block $label$1 (result i32)
   (block $label$2
    (block $label$3
     (br_if $label$2
      (call $2
       (i32.const 0)
       (tee_local $3
        (get_local $0)
       )
      )
     )
     (br_if $label$3
      (call $2
       (i32.const 1)
       (get_local $3)
      )
     )
     (br $label$1
      (call $73
       (i32.sub
        (get_local $3)
        (i32.const 1)
       )
       (get_local $2)
       (i32.add
        (get_local $1)
        (get_local $2)
       )
      )
     )
    )
    (br $label$1
     (get_local $2)
    )
   )
   (get_local $1)
  )
 )
 (func $74 (; 2 ;) (; has Stack IR ;) (type $4) (param $0 i32) (result i32)
  (call $73
   (get_local $0)
   (i32.const 0)
   (i32.const 1)
  )
 )
)
