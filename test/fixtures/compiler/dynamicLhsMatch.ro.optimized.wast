(module
 (type $0 (func (param i32) (result i32)))
 (export "test" (func $0))
 (export "test2" (func $1))
 (func $0 (; 0 ;) (; has Stack IR ;) (type $0) (param $0 i32) (result i32)
  (block $label$1 (result i32)
   (drop
    (br_if $label$1
     (i32.const 1)
     (get_local $0)
    )
   )
   (i32.const 0)
  )
 )
 (func $1 (; 1 ;) (; has Stack IR ;) (type $0) (param $0 i32) (result i32)
  (select
   (i32.const 1)
   (i32.const 0)
   (get_local $0)
  )
 )
)
