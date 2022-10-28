(module
 (type $none_=>_none (func))
 (type $none_=>_i32 (func (result i32)))
 (type $i64_=>_i32 (func (param i64) (result i32)))
 (memory $0 1)
 (data (i32.const 21) "\08\00\00\00t\00r\00u\00e")
 (data (i32.const 34) "\n\00\00\00f\00a\00l\00s\00e")
 (data (i32.const 49) "\02\00\00\000")
 (data (i32.const 56) "\02\00\00\000")
 (global $global$0 (mut i32) (i32.const 0))
 (export "memory" (memory $0))
 (export "test_getMaxMemory" (func $0))
 (export "isRed" (func $1))
 (start $2)
 (func $0 (result i32)
  (global.get $global$0)
 )
 (func $1 (param $0 i64) (result i32)
  (block $label$1 (result i32)
   (if
    (i32.ne
     (i32.wrap_i64
      (i64.shr_u
       (local.get $0)
       (i64.const 32)
      )
     )
     (i32.const 1)
    )
    (block
     (drop
      (br_if $label$1
       (i32.const 0)
       (i32.ne
        (i32.wrap_i64
         (i64.shr_u
          (local.get $0)
          (i64.const 32)
         )
        )
        (i32.const 4)
       )
      )
     )
     (br $label$1
      (i32.eq
       (i32.load
        (i32.wrap_i64
         (local.get $0)
        )
       )
       (i32.const 16711680)
      )
     )
    )
   )
   (i32.const 1)
  )
 )
 (func $2
  (global.set $global$0
   (i32.const 65536)
  )
 )
)
