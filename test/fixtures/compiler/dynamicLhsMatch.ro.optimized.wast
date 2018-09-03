(module
 (type $0 (func (param i32 i32) (result i32)))
 (type $4 (func (param i32) (result i32)))
 (export "test" (func $73))
 (export "test2" (func $74))
 (func $2 (; 0 ;) (; has Stack IR ;) (type $0) (param $0 i32) (param $1 i32) (result i32)
  (i32.eq
   (get_local $0)
   (get_local $1)
  )
 )
 (func $7 (; 1 ;) (; has Stack IR ;) (type $0) (param $0 i32) (param $1 i32) (result i32)
  (i32.add
   (get_local $0)
   (get_local $1)
  )
 )
 (func $73 (; 2 ;) (; has Stack IR ;) (type $4) (param $0 i32) (result i32)
  (block $label$1 (result i32)
   (drop
    (br_if $label$1
     (i32.const 1)
     (i32.eqz
      (call $2
       (i32.const 1)
       (call $7
        (get_local $0)
        (i32.const 1)
       )
      )
     )
    )
   )
   (i32.const 0)
  )
 )
 (func $74 (; 3 ;) (; has Stack IR ;) (type $4) (param $0 i32) (result i32)
  (if (result i32)
   (call $2
    (call $7
     (get_local $0)
     (i32.const 1)
    )
    (i32.const 1)
   )
   (i32.const 0)
   (i32.const 1)
  )
 )
)
