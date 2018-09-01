(module
 (type $0 (func (param f32 f32) (result f32)))
 (type $1 (func (param i32 i32) (result i32)))
 (export "testInt" (func $2))
 (export "testFloat" (func $3))
 (func $2 (; 0 ;) (; has Stack IR ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (i32.add
   (get_local $0)
   (get_local $1)
  )
 )
 (func $3 (; 1 ;) (; has Stack IR ;) (type $0) (param $0 f32) (param $1 f32) (result f32)
  (f32.add
   (get_local $0)
   (get_local $1)
  )
 )
)
