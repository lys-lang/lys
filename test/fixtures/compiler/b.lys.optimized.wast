(module
 (type $0 (func (result i32)))
 (type $1 (func (param i32 i32) (result i32)))
 (memory $0 1)
 (export "memory" (memory $0))
 (export "outerFunction" (func $1))
 (func $0 (; 0 ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (i32.add
   (local.get $0)
   (local.get $1)
  )
 )
 (func $1 (; 1 ;) (type $0) (result i32)
  (call $0
   (i32.const 3)
   (i32.const 1)
  )
 )
)
