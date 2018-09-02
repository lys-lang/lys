(module
 (type $0 (func (param i32 i32) (result i32)))
 (type $4 (func (result i32)))
 (type $5 (func))
 (global $global$0 (mut i32) (i32.const 0))
 (global $global$1 (mut i32) (i32.const 0))
 (global $global$2 (mut i32) (i32.const 0))
 (export "main" (func $55))
 (start $56)
 (func $12 (; 0 ;) (; has Stack IR ;) (type $0) (param $0 i32) (param $1 i32) (result i32)
  (i32.sub
   (get_local $0)
   (get_local $1)
  )
 )
 (func $55 (; 1 ;) (; has Stack IR ;) (type $4) (result i32)
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
 (func $56 (; 2 ;) (; has Stack IR ;) (type $5)
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
