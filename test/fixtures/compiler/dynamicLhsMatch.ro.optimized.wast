(module
 (type $1 (func (param i32 i32) (result i32)))
 (type $7 (func (param i32) (result i32)))
 (export "test" (func $101))
 (export "test2" (func $102))
 (func $2 (; 0 ;) (; has Stack IR ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (i32.eq
   (get_local $0)
   (get_local $1)
  )
 )
 (func $10 (; 1 ;) (; has Stack IR ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (i32.add
   (get_local $0)
   (get_local $1)
  )
 )
 (func $101 (; 2 ;) (; has Stack IR ;) (type $7) (param $0 i32) (result i32)
  (block $label$1 (result i32)
   (drop
    (br_if $label$1
     (i32.const 1)
     (i32.eqz
      (call $2
       (i32.const 1)
       (call $10
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
 (func $102 (; 3 ;) (; has Stack IR ;) (type $7) (param $0 i32) (result i32)
  (if (result i32)
   (call $2
    (call $10
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
