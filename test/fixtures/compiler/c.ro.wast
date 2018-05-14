(module
 (type $f_i32_i32 (func (param i32) (result i32)))
 (type $f_f32_f32 (func (param f32) (result f32)))
 (type $f_i32_ (func (result i32)))
 (table 3 3 anyfunc)
 (elem (i32.const 0) $x $x1 $outer)
 (export "outer" (func $outer))
 (func $x (; 0 ;) (type $f_i32_i32) (param $0 i32) (result i32)
  (return
   (get_local $0)
  )
 )
 (func $x1 (; 1 ;) (type $f_f32_f32) (param $0 f32) (result f32)
  (return
   (get_local $0)
  )
 )
 (func $outer (; 2 ;) (type $f_i32_) (result i32)
  (return
   (call $x
    (i32.const 1)
   )
  )
 )
)
