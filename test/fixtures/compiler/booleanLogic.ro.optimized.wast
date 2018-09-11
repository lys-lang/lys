(module
 (type $1 (func (param i32 i32) (result i32)))
 (export "test" (func $101))
 (func $101 (; 0 ;) (; has Stack IR ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (i32.and
   (i32.ne
    (get_local $0)
    (i32.const 0)
   )
   (i32.ne
    (get_local $1)
    (i32.const 0)
   )
  )
 )
)
