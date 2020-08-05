(module
 (type $i32_=>_i32 (func (param i32) (result i32)))
 (type $none_=>_none (func))
 (type $i32_i32_=>_none (func (param i32 i32)))
 (type $none_=>_i32 (func (result i32)))
 (type $i32_i32_=>_i32 (func (param i32 i32) (result i32)))
 (type $i32_i32_=>_i64 (func (param i32 i32) (result i64)))
 (type $i64_=>_i64 (func (param i64) (result i64)))
 (memory $0 1)
 (data (i32.const 21) "\08\00\00\00t\00r\00u\00e")
 (data (i32.const 34) "\n\00\00\00f\00a\00l\00s\00e")
 (data (i32.const 49) "\02\00\00\000")
 (data (i32.const 56) "\02\00\00\000")
 (global $global$0 (mut i32) (i32.const 0))
 (global $global$1 (mut i32) (i32.const 0))
 (global $global$2 (mut i32) (i32.const 0))
 (global $global$3 (mut i32) (i32.const 0))
 (export "memory" (memory $0))
 (export "test_getMaxMemory" (func $0))
 (export "test" (func $6))
 (start $7)
 (func $0 (result i32)
  (global.get $global$3)
 )
 (func $1 (param $0 i32) (result i32)
  (local $1 i32)
  (call $3
   (local.tee $1
    (call $2
     (local.get $0)
    )
   )
   (local.get $0)
  )
  (local.get $1)
 )
 (func $2 (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (if
   (i32.eqz
    (local.get $0)
   )
   (unreachable)
  )
  (if
   (i32.gt_u
    (local.get $0)
    (global.get $global$1)
   )
   (unreachable)
  )
  (if
   (i32.gt_u
    (local.tee $0
     (i32.and
      (i32.add
       (global.get $global$0)
       (i32.add
        (i32.add
         (local.tee $1
          (global.get $global$3)
         )
         (i32.const 16)
        )
        (select
         (local.get $0)
         (i32.const 16)
         (i32.gt_u
          (local.get $0)
          (i32.const 16)
         )
        )
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
   (if
    (i32.lt_u
     (memory.grow
      (select
       (local.get $2)
       (local.tee $4
        (local.tee $3
         (i32.shr_s
          (i32.and
           (i32.add
            (i32.sub
             (local.get $0)
             (local.get $1)
            )
            (i32.const 65535)
           )
           (i32.const -65536)
          )
          (i32.const 16)
         )
        )
       )
       (i32.gt_u
        (local.get $2)
        (local.get $4)
       )
      )
     )
     (i32.const 0)
    )
    (if
     (i32.lt_u
      (memory.grow
       (local.get $3)
      )
      (i32.const 0)
     )
     (unreachable)
    )
   )
  )
  (global.set $global$3
   (local.get $0)
  )
  (i32.add
   (local.get $1)
   (i32.const 16)
  )
 )
 (func $3 (param $0 i32) (param $1 i32)
  (local.set $1
   (i32.add
    (local.get $0)
    (local.get $1)
   )
  )
  (loop $label$1
   (if
    (i32.ne
     (local.get $0)
     (local.get $1)
    )
    (block
     (i32.store8
      (local.get $0)
      (i32.load8_u
       (i32.const 0)
      )
     )
     (local.set $0
      (i32.add
       (local.get $0)
       (i32.const 1)
      )
     )
     (br $label$1)
    )
   )
  )
 )
 (func $4 (param $0 i32) (param $1 i32) (result i64)
  (local $2 i64)
  (i32.store
   (i32.wrap_i64
    (local.tee $2
     (i64.or
      (i64.extend_i32_u
       (call $1
        (i32.const 8)
       )
      )
      (i64.const 4294967296)
     )
    )
   )
   (local.get $0)
  )
  (i32.store
   (i32.add
    (i32.wrap_i64
     (local.get $2)
    )
    (i32.const 4)
   )
   (local.get $1)
  )
  (local.get $2)
 )
 (func $5 (param $0 i64) (result i64)
  (local $1 i32)
  (local $2 i64)
  (if (result i64)
   (i32.le_s
    (i32.load
     (i32.wrap_i64
      (local.get $0)
     )
    )
    (i32.load
     (i32.add
      (i32.wrap_i64
       (local.get $0)
      )
      (i32.const 4)
     )
    )
   )
   (block (result i64)
    (local.set $1
     (i32.load
      (i32.wrap_i64
       (local.get $0)
      )
     )
    )
    (i32.store
     (i32.wrap_i64
      (local.tee $2
       (i64.or
        (i64.extend_i32_u
         (call $1
          (i32.const 4)
         )
        )
        (i64.const 12884901888)
       )
      )
     )
     (local.get $1)
    )
    (i32.store
     (i32.wrap_i64
      (local.get $0)
     )
     (i32.add
      (i32.load
       (i32.wrap_i64
        (local.get $0)
       )
      )
      (i32.const 1)
     )
    )
    (local.get $2)
   )
   (i64.const 8589934592)
  )
 )
 (func $6 (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i64)
  (local $4 i64)
  (local.set $3
   (call $4
    (local.get $0)
    (local.get $1)
   )
  )
  (loop $label$1
   (if
    (i32.eq
     (i32.wrap_i64
      (i64.shr_u
       (local.tee $4
        (call $5
         (local.get $3)
        )
       )
       (i64.const 32)
      )
     )
     (i32.const 3)
    )
    (block
     (local.set $2
      (i32.add
       (local.get $2)
       (i32.load
        (i32.wrap_i64
         (local.get $4)
        )
       )
      )
     )
     (br $label$1)
    )
   )
  )
  (local.get $2)
 )
 (func $7
  (global.set $global$0
   (i32.const 15)
  )
  (global.set $global$1
   (i32.const 1073741824)
  )
  (global.set $global$2
   (i32.const 65536)
  )
  (global.set $global$3
   (global.get $global$2)
  )
 )
)
