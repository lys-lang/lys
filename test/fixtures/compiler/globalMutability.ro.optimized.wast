(module
 (type $0 (func))
 (type $1 (func (result i32)))
 (type $2 (func (param i32 i32) (result i32)))
 (memory $0 1)
 (global $global$0 (mut i32) (i32.const 0))
 (global $global$1 (mut i32) (i32.const 0))
 (global $global$2 (mut i32) (i32.const 0))
 (export "memory" (memory $0))
 (export "main" (func $2))
 (start $3)
 (func $0 (; 0 ;) (type $2) (param $0 i32) (param $1 i32) (result i32)
  (i32.add
   (local.get $0)
   (local.get $1)
  )
 )
 (func $1 (; 1 ;) (type $2) (param $0 i32) (param $1 i32) (result i32)
  (i32.sub
   (local.get $0)
   (local.get $1)
  )
 )
 (func $2 (; 2 ;) (type $1) (result i32)
  (global.set $global$0
   (call $1
    (call $0
     (global.get $global$0)
     (i32.const 1)
    )
    (global.get $global$2)
   )
  )
  (global.get $global$0)
 )
 (func $3 (; 3 ;) (type $0)
  (global.set $global$0
   (i32.const 2)
  )
  (global.set $global$1
   (i32.const 1)
  )
  (global.set $global$2
   (call $1
    (global.get $global$1)
    (global.get $global$0)
   )
  )
 )
)
