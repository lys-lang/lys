(module
 (type $f_i32_ (func (result i32)))
 (type $f_i32_i32 (func (param i32) (result i32)))
 (type $f_f32_f32_f64 (func (param f32 f64) (result f32)))
 (type $f_f32_f32_f32 (func (param f32 f32) (result f32)))
 (type $f_i32_i32_i32 (func (param i32 i32) (result i32)))
 (table 7 7 anyfunc)
 (elem (i32.const 0) $test $test0 $testa $floatingPoints $addFloat $addInts $x)
 (export "test" (func $test))
 (export "test0" (func $test0))
 (export "testa" (func $testa))
 (export "floatingPoints" (func $floatingPoints))
 (export "addFloat" (func $addFloat))
 (export "addInts" (func $addInts))
 (export "x" (func $x))
 (func $test (; 0 ;) (type $f_i32_) (result i32)
  (return
   (i32.const 1)
  )
 )
 (func $test0 (; 1 ;) (type $f_i32_) (result i32)
  (return
   (i32.const 1)
  )
 )
 (func $testa (; 2 ;) (type $f_i32_i32) (param $0 i32) (result i32)
  (return
   (get_local $0)
  )
 )
 (func $floatingPoints (; 3 ;) (type $f_f32_f32_f64) (param $0 f32) (param $1 f64) (result f32)
  (return
   (get_local $0)
  )
 )
 (func $addFloat (; 4 ;) (type $f_f32_f32_f32) (param $0 f32) (param $1 f32) (result f32)
  (return
   (f32.add
    (get_local $0)
    (get_local $1)
   )
  )
 )
 (func $addInts (; 5 ;) (type $f_i32_i32_i32) (param $0 i32) (param $1 i32) (result i32)
  (return
   (i32.add
    (get_local $0)
    (get_local $1)
   )
  )
 )
 (func $x (; 6 ;) (type $f_f32_f32_f32) (param $0 f32) (param $1 f32) (result f32)
  (return
   (f32.mul
    (f32.add
     (get_local $0)
     (f32.const 1)
    )
    (get_local $1)
   )
  )
 )
)
