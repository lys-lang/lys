(module
 (type $0 (func (param i32 i32)))
 (type $1 (func (param i32)))
 (type $2 (func))
 (type $3 (func (result i32)))
 (import "env" "printf" (func $fimport$0 (param i32 i32)))
 (import "env" "putchar" (func $fimport$1 (param i32)))
 (memory $0 1)
 (data (i32.const 16) "\08\00\00\00t\00r\00u\00e")
 (data (i32.const 29) "\n\00\00\00f\00a\00l\00s\00e")
 (data (i32.const 44) "\02\00\00\000")
 (data (i32.const 51) "\02\00\00\000")
 (global $global$0 (mut i32) (i32.const 0))
 (global $global$1 (mut i32) (i32.const 0))
 (global $global$2 (mut i32) (i32.const 0))
 (global $global$3 (mut i32) (i32.const 0))
 (global $global$4 (mut i32) (i32.const 0))
 (global $global$5 (mut i32) (i32.const 0))
 (global $global$6 (mut i32) (i32.const 0))
 (export "memory" (memory $0))
 (export "test_getMaxMemory" (func $0))
 (export "main" (func $1))
 (start $2)
 (func $0 (; 2 ;) (type $3) (result i32)
  (global.get $global$6)
 )
 (func $1 (; 3 ;) (type $2)
  (call $fimport$1
   (i32.const 0)
  )
  (call $fimport$0
   (i32.const 0)
   (i32.const 0)
  )
 )
 (func $2 (; 4 ;) (type $2)
  (global.set $global$0
   (i32.const 3)
  )
  (global.set $global$1
   (i32.shl
    (i32.const 1)
    (global.get $global$0)
   )
  )
  (global.set $global$2
   (i32.sub
    (global.get $global$1)
    (i32.const 1)
   )
  )
  (global.set $global$3
   (i32.const 1073741824)
  )
  (global.set $global$4
   (i32.const 65536)
  )
  (global.set $global$5
   (i32.and
    (i32.add
     (global.get $global$4)
     (global.get $global$2)
    )
    (i32.xor
     (global.get $global$2)
     (i32.const -1)
    )
   )
  )
  (global.set $global$6
   (global.get $global$5)
  )
 )
)
