(module
 (type $1 (func (param i32 i32) (result i32)))
 (type $7 (func (param i32) (result i32)))
 (type $14 (func (param i32 i32 i32) (result i32)))
 (export "fib" (func $102))
 (func $2 (; 0 ;) (; has Stack IR ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (i32.eq
   (get_local $0)
   (get_local $1)
  )
 )
 (func $101 (; 1 ;) (; has Stack IR ;) (type $14) (param $0 i32) (param $1 i32) (param $2 i32) (result i32)
  (block $label$1
   (block $label$3
    (br_if $label$1
     (call $2
      (i32.const 0)
      (get_local $0)
     )
    )
    (br_if $label$3
     (call $2
      (i32.const 1)
      (get_local $0)
     )
    )
    (set_local $1
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
    )
    (br $label$1)
   )
   (set_local $1
    (get_local $2)
   )
  )
  (get_local $1)
 )
 (func $102 (; 2 ;) (; has Stack IR ;) (type $7) (param $0 i32) (result i32)
  (call $101
   (get_local $0)
   (i32.const 0)
   (i32.const 1)
  )
 )
)
