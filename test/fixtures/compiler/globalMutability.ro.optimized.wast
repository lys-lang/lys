(module
 (type $1 (func (param i32 i32) (result i32)))
 (type $13 (func))
 (type $14 (func (result i32)))
 (global $global$0 (mut i32) (i32.const 0))
 (global $global$1 (mut i32) (i32.const 0))
 (global $global$2 (mut i32) (i32.const 0))
 (export "main" (func $101))
 (start $102)
 (func $16 (; 0 ;) (; has Stack IR ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (i32.sub
   (get_local $0)
   (get_local $1)
  )
 )
 (func $101 (; 1 ;) (; has Stack IR ;) (type $14) (result i32)
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
 (func $102 (; 2 ;) (; has Stack IR ;) (type $13)
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
