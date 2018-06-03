(module
 (type $f_boolean_boolean_boolean (func (param i32 i32) (result i32)))
 (table 1 1 anyfunc)
 (elem (i32.const 0) $test)
 (export "test" (func $test))
 (func $test (; 0 ;) (type $f_boolean_boolean_boolean) (param $0 i32) (param $1 i32) (result i32)
  (return
   (i32.ne
    (i32.and
     (get_local $0)
     (get_local $1)
    )
    (i32.const 0)
   )
  )
 )
)
