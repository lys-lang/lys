(module
 (type $1 (func (param i32 i32) (result i32)))
 (type $10 (func))
 (type $11 (func (result i32)))
 (global $global$0 (mut i32) (i32.const 0))
 (global $global$1 (mut i32) (i32.const 0))
 (global $global$2 (mut i32) (i32.const 0))
 (export "main" (func $90))
 (start $91)
 (func $16 (; 0 ;) (; has Stack IR ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (i32.sub
   (get_local $0)
   (get_local $1)
  )
 )
 (func $90 (; 1 ;) (; has Stack IR ;) (type $11) (result i32)
  (set_global $global$0
   (call $16
    (i32.add
     (get_global $global$0)
     (i32.const 1)
    )
    (get_global $global$2)
   )
  )
  (get_global $global$0)
 )
 (func $91 (; 2 ;) (; has Stack IR ;) (type $10)
  (set_global $global$0
   (i32.const 2)
  )
  (set_global $global$1
   (i32.const 1)
  )
  (set_global $global$2
   (call $16
    (get_global $global$1)
    (get_global $global$0)
   )
  )
 )
)
