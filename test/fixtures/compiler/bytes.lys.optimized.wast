(module
 (type $0 (func))
 (type $1 (func (result i32)))
 (type $2 (func (result i64)))
 (memory $0 1)
 (data (i32.const 54) "\08\00\00\00t\00r\00u\00e")
 (data (i32.const 67) "\n\00\00\00f\00a\00l\00s\00e")
 (data (i32.const 82) "\02\00\00\000")
 (data (i32.const 89) "\02\00\00\000")
 (data (i32.const 16) "\0c\00\00\00a\00s\00d\00a\00s\00d")
 (data (i32.const 33) "\10\00\00\00u\00t\00f\00 \00\ab\00\100\110\bb")
 (global $global$0 (mut i32) (i32.const 0))
 (global $global$1 (mut i32) (i32.const 0))
 (global $global$2 (mut i32) (i32.const 0))
 (global $global$3 (mut i32) (i32.const 0))
 (global $global$4 (mut i32) (i32.const 0))
 (global $global$5 (mut i32) (i32.const 0))
 (global $global$6 (mut i32) (i32.const 0))
 (global $global$7 (mut i64) (i64.const 0))
 (global $global$8 (mut i64) (i64.const 0))
 (export "memory" (memory $0))
 (export "test_getMaxMemory" (func $0))
 (export "main" (func $1))
 (start $2)
 (func $0 (; 0 ;) (type $1) (result i32)
  (global.get $global$6)
 )
 (func $1 (; 1 ;) (type $2) (result i64)
  (global.get $global$7)
 )
 (func $2 (; 2 ;) (type $0)
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
  (global.set $global$7
   (i64.const 64424509456)
  )
  (global.set $global$8
   (i64.const 64424509473)
  )
 )
)
