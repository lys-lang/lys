(module
 (type $0 (func (param i32 i32) (result i32)))
 (type $1 (func (param i32) (result i32)))
 (type $2 (func (param i32 i32 i32) (result i32)))
 (export "fib" (func $2))
 (func $0 (; 0 ;) (type $0) (param $0 i32) (param $1 i32) (result i32)
  (i32.eq
   (get_local $0)
   (get_local $1)
  )
 )
 (func $1 (; 1 ;) (type $2) (param $0 i32) (param $1 i32) (param $2 i32) (result i32)
  (block $label$1
   (block $label$2
    (br_if $label$1
     (call $0
      (i32.const 0)
      (get_local $0)
     )
    )
    (br_if $label$2
     (call $0
      (i32.const 1)
      (get_local $0)
     )
    )
    (set_local $1
     (call $1
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
    )
    (br $label$1)
   )
   (set_local $1
    (get_local $2)
   )
  )
  (get_local $1)
 )
 (func $2 (; 2 ;) (type $1) (param $0 i32) (result i32)
  (call $1
   (get_local $0)
   (i32.const 0)
   (i32.const 1)
  )
 )
)
