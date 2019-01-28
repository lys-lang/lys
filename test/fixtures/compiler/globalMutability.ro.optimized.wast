(module
 (type $0 (func (param i32 i32) (result i32)))
 (type $1 (func))
 (global $global$0 (mut i32) (i32.const 0))
 (global $global$1 (mut i32) (i32.const 0))
 (global $global$2 (mut i32) (i32.const 0))
 (start $1)
 (func $0 (; 0 ;) (type $0) (param $0 i32) (param $1 i32) (result i32)
  (i32.sub
   (local.get $0)
   (local.get $1)
  )
 )
 (func $1 (; 1 ;) (type $1)
  (global.set $global$0
   (i32.const 2)
  )
  (global.set $global$1
   (i32.const 1)
  )
  (global.set $global$2
   (call $0
    (global.get $global$1)
    (global.get $global$0)
   )
  )
 )
)
