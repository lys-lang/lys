(module
 (type $0 (func))
 (type $1 (func (result i32)))
 (type $2 (func (param i32) (result i32)))
 (type $3 (func (param i32 i32 i32) (result i32)))
 (memory $0 1)
 (data (i32.const 21) "\08\00\00\00t\00r\00u\00e")
 (data (i32.const 34) "\n\00\00\00f\00a\00l\00s\00e")
 (data (i32.const 49) "\02\00\00\000")
 (data (i32.const 56) "\02\00\00\000")
 (global $global$0 (mut i32) (i32.const 0))
 (global $global$1 (mut i32) (i32.const 0))
 (global $global$2 (mut i32) (i32.const 0))
 (global $global$3 (mut i32) (i32.const 0))
 (global $global$4 (mut i32) (i32.const 0))
 (global $global$5 (mut i32) (i32.const 0))
 (global $global$6 (mut i32) (i32.const 0))
 (export "memory" (memory $0))
 (export "test_getMaxMemory" (func $0))
 (export "fib" (func $2))
 (start $3)
 (func $0 (; 0 ;) (type $1) (result i32)
  (global.get $global$6)
 )
 (func $1 (; 1 ;) (type $3) (param $0 i32) (param $1 i32) (param $2 i32) (result i32)
  (block $label$1 (result i32)
   (if
    (local.get $0)
    (block
     (if
      (i32.ne
       (local.get $0)
       (i32.const 1)
      )
      (br $label$1
       (call $1
        (i32.sub
         (local.get $0)
         (i32.const 1)
        )
        (local.get $2)
        (i32.add
         (local.get $1)
         (local.get $2)
        )
       )
      )
     )
     (br $label$1
      (local.get $2)
     )
    )
   )
   (local.get $1)
  )
 )
 (func $2 (; 2 ;) (type $2) (param $0 i32) (result i32)
  (call $1
   (local.get $0)
   (i32.const 0)
   (i32.const 1)
  )
 )
 (func $3 (; 3 ;) (type $0)
  (global.set $global$0
   (i32.const 4)
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
