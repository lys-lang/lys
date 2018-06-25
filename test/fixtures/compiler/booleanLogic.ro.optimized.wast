(module
 (type $0 (func (param i32 i32) (result i32)))
 (export "test" (func $0))
 (func $0 (; 0 ;) (type $0) (param $0 i32) (param $1 i32) (result i32)
  (i32.ne
   (i32.and
    (get_local $0)
    (get_local $1)
   )
   (i32.const 0)
  )
 )
)
