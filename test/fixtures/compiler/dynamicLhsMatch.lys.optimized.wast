(module
 (type $0 (func (param i32) (result i32)))
 (memory $0 1)
 (export "memory" (memory $0))
 (export "test" (func $0))
 (export "test2" (func $0))
 (func $0 (; 0 ;) (type $0) (param $0 i32) (result i32)
  (select
   (i32.const 1)
   (i32.const 0)
   (local.get $0)
  )
 )
)
