(module
 (type $0 (func))
 (type $1 (func (result i32)))
 (memory $0 1)
 (global $global$0 (mut i32) (i32.const 0))
 (global $global$1 (mut i32) (i32.const 0))
 (global $global$2 (mut i32) (i32.const 0))
 (export "memory" (memory $0))
 (export "main" (func $0))
 (start $1)
 (func $0 (; 0 ;) (type $1) (result i32)
  (global.set $global$0
   (i32.sub
    (i32.add
     (global.get $global$0)
     (i32.const 1)
    )
    (global.get $global$2)
   )
  )
  (global.get $global$0)
 )
 (func $1 (; 1 ;) (type $0)
  (global.set $global$0
   (i32.const 2)
  )
  (global.set $global$1
   (i32.const 1)
  )
  (global.set $global$2
   (i32.sub
    (global.get $global$1)
    (global.get $global$0)
   )
  )
 )
)
