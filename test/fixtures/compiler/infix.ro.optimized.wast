(module
 (type $0 (func (param i32 i32) (result i32)))
 (type $1 (func (param f32 f32) (result f32)))
 (export "testInt" (func $0))
 (export "testFloat" (func $1))
 (func $0 (; 0 ;) (type $0) (param $0 i32) (param $1 i32) (result i32)
  (i32.add
   (get_local $0)
   (get_local $1)
  )
 )
 (func $1 (; 1 ;) (type $1) (param $0 f32) (param $1 f32) (result f32)
  (f32.add
   (get_local $0)
   (get_local $1)
  )
 )
)
