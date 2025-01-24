(module
 (type $0 (func (result i32)))
 (type $1 (func))
 (global $global$0 (mut i32) (i32.const 0))
 (global $global$1 (mut i32) (i32.const 0))
 (global $global$2 (mut i32) (i32.const 0))
 (memory $0 1)
 (data $0 (i32.const 21) "\08\00\00\00t\00r\00u\00e")
 (data $1 (i32.const 34) "\n\00\00\00f\00a\00l\00s\00e")
 (data $2 (i32.const 49) "\02\00\00\000")
 (data $3 (i32.const 56) "\02\00\00\000")
 (export "memory" (memory $0))
 (export "test_getMaxMemory" (func $0))
 (export "main" (func $1))
 (start $2)
 (func $0 (result i32)
  (global.get $global$2)
 )
 (func $1 (result i32)
  (local $0 i32)
  (local $1 i32)
  (local $2 i32)
  (if
   (i32.eqz
    (global.get $global$1)
   )
   (then
    (unreachable)
   )
  )
  (if
   (i32.gt_u
    (local.tee $1
     (i32.and
      (i32.add
       (global.get $global$0)
       (i32.add
        (local.tee $0
         (global.get $global$2)
        )
        (i32.const 32)
       )
      )
      (i32.xor
       (global.get $global$0)
       (i32.const -1)
      )
     )
    )
    (i32.shl
     (local.tee $2
      (memory.size)
     )
     (i32.const 16)
    )
   )
   (then
    (drop
     (memory.grow
      (select
       (local.get $2)
       (local.tee $0
        (i32.shr_s
         (i32.and
          (i32.add
           (i32.sub
            (local.get $1)
            (local.get $0)
           )
           (i32.const 65535)
          )
          (i32.const -65536)
         )
         (i32.const 16)
        )
       )
       (i32.lt_u
        (local.get $0)
        (local.get $2)
       )
      )
     )
    )
   )
  )
  (global.set $global$2
   (local.get $1)
  )
  (i32.const 9)
 )
 (func $2
  (global.set $global$0
   (i32.const 15)
  )
  (global.set $global$1
   (i32.const 1073741824)
  )
  (global.set $global$2
   (i32.const 65536)
  )
 )
)
