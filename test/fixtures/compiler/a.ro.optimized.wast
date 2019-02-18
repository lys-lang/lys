(module
 (type $0 (func (result i32)))
 (type $1 (func (param i32) (result i32)))
 (type $2 (func (param i32 i32) (result i32)))
 (type $3 (func (param f32 f32) (result f32)))
 (type $4 (func (param f32 f64) (result f32)))
 (memory $0 1)
 (export "memory" (memory $0))
 (export "test" (func $0))
 (export "test0" (func $0))
 (export "testa" (func $1))
 (export "floatingPoints" (func $4))
 (export "addFloat" (func $5))
 (export "addInts" (func $6))
 (export "x" (func $7))
 (func $0 (; 0 ;) (type $0) (result i32)
  (i32.const 1)
 )
 (func $1 (; 1 ;) (type $1) (param $0 i32) (result i32)
  (local.get $0)
 )
 (func $2 (; 2 ;) (type $2) (param $0 i32) (param $1 i32) (result i32)
  (i32.add
   (local.get $0)
   (local.get $1)
  )
 )
 (func $3 (; 3 ;) (type $3) (param $0 f32) (param $1 f32) (result f32)
  (f32.add
   (local.get $0)
   (local.get $1)
  )
 )
 (func $4 (; 4 ;) (type $4) (param $0 f32) (param $1 f64) (result f32)
  (local.get $0)
 )
 (func $5 (; 5 ;) (type $3) (param $0 f32) (param $1 f32) (result f32)
  (call $3
   (local.get $0)
   (local.get $1)
  )
 )
 (func $6 (; 6 ;) (type $2) (param $0 i32) (param $1 i32) (result i32)
  (call $2
   (local.get $0)
   (local.get $1)
  )
 )
 (func $7 (; 7 ;) (type $3) (param $0 f32) (param $1 f32) (result f32)
  (f32.mul
   (call $3
    (local.get $0)
    (f32.const 1)
   )
   (local.get $1)
  )
 )
)
