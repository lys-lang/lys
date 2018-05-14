(module
 (type $f_f32_f32_f32 (func (param f32 f32) (result f32)))
 (type $f_i32_i32_i32 (func (param i32 i32) (result i32)))
 (table 4 4 anyfunc)
 (elem (i32.const 0) $sum $sum1 $testInt $testFloat)
 (export "testInt" (func $testInt))
 (export "testFloat" (func $testFloat))
 (func $sum (; 0 ;) (type $f_f32_f32_f32) (param $0 f32) (param $1 f32) (result f32)
  (return
   (f32.add
    (get_local $0)
    (get_local $1)
   )
  )
 )
 (func $sum1 (; 1 ;) (type $f_i32_i32_i32) (param $0 i32) (param $1 i32) (result i32)
  (return
   (i32.add
    (get_local $0)
    (get_local $1)
   )
  )
 )
 (func $testInt (; 2 ;) (type $f_i32_i32_i32) (param $0 i32) (param $1 i32) (result i32)
  (return
   (call $sum1
    (get_local $0)
    (get_local $1)
   )
  )
 )
 (func $testFloat (; 3 ;) (type $f_f32_f32_f32) (param $0 f32) (param $1 f32) (result f32)
  (return
   (call $sum
    (get_local $0)
    (get_local $1)
   )
  )
 )
)
