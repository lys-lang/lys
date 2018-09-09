(module
 (type $1 (func (param i32 i32) (result i32)))
 (type $5 (func (param f32 f32) (result f32)))
 (export "testInt" (func $92))
 (export "testFloat" (func $93))
 (func $92 (; 0 ;) (; has Stack IR ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (i32.add
   (get_local $0)
   (get_local $1)
  )
 )
 (func $93 (; 1 ;) (; has Stack IR ;) (type $5) (param $0 f32) (param $1 f32) (result f32)
  (f32.add
   (get_local $0)
   (get_local $1)
  )
 )
)
