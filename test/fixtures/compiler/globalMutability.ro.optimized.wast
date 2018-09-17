(module
 (type $0 (func (param i32 i32) (result i32)))
 (type $1 (func))
 (type $2 (func (result i32)))
 (global $global$0 (mut i32) (i32.const 0))
 (global $global$1 (mut i32) (i32.const 0))
 (global $global$2 (mut i32) (i32.const 0))
 (export "main" (func $1))
 (start $2)
 (func $0 (; 0 ;) (type $0) (param $0 i32) (param $1 i32) (result i32)
  (i32.sub
   (get_local $0)
   (get_local $1)
  )
 )
 (func $1 (; 1 ;) (type $2) (result i32)
  (set_global $global$0
   (call $0
    (i32.add
     (get_global $global$0)
     (i32.const 1)
    )
    (get_global $global$2)
   )
  )
  (get_global $global$0)
 )
 (func $2 (; 2 ;) (type $1)
  (set_global $global$0
   (i32.const 2)
  )
  (set_global $global$1
   (i32.const 1)
  )
  (set_global $global$2
   (call $0
    (get_global $global$1)
    (get_global $global$0)
   )
  )
 )
)
