(module
 (type $0 (func (param i32 i32) (result i32)))
 (type $7 (func))
 (type $8 (func (result i32)))
 (global $global$0 (mut i32) (i32.const 0))
 (global $global$1 (mut i32) (i32.const 0))
 (global $global$2 (mut i32) (i32.const 0))
 (export "main" (func $73))
 (start $74)
 (func $12 (; 0 ;) (; has Stack IR ;) (type $0) (param $0 i32) (param $1 i32) (result i32)
  (i32.sub
   (get_local $0)
   (get_local $1)
  )
 )
 (func $73 (; 1 ;) (; has Stack IR ;) (type $8) (result i32)
  (set_global $global$0
   (call $12
    (i32.add
     (get_global $global$0)
     (i32.const 1)
    )
    (get_global $global$2)
   )
  )
  (get_global $global$0)
 )
 (func $74 (; 2 ;) (; has Stack IR ;) (type $7)
  (set_global $global$0
   (i32.const 2)
  )
  (set_global $global$1
   (i32.const 1)
  )
  (set_global $global$2
   (call $12
    (get_global $global$1)
    (get_global $global$0)
   )
  )
 )
)
