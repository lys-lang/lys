(module
 (type $none_=>_none (func))
 (type $none_=>_i32 (func (result i32)))
 (type $i32_=>_i32 (func (param i32) (result i32)))
 (type $i32_i32_i32_=>_i32 (func (param i32 i32 i32) (result i32)))
 (memory $0 1)
 (data (i32.const 21) "\08\00\00\00t\00r\00u\00e")
 (data (i32.const 34) "\n\00\00\00f\00a\00l\00s\00e")
 (data (i32.const 49) "\02\00\00\000")
 (data (i32.const 56) "\02\00\00\000")
 (global $global$0 (mut i32) (i32.const 0))
 (export "memory" (memory $0))
 (export "test_getMaxMemory" (func $0))
 (export "fib" (func $2))
 (start $3)
 (func $0 (result i32)
  (global.get $global$0)
 )
 (func $1 (param $0 i32) (param $1 i32) (param $2 i32) (result i32)
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
 (func $2 (param $0 i32) (result i32)
  (call $1
   (local.get $0)
   (i32.const 0)
   (i32.const 1)
  )
 )
 (func $3
  (global.set $global$0
   (i32.const 65536)
  )
 )
)
