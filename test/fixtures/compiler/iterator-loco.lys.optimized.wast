(module
 (type $0 (func (param i32 i32) (result i32)))
 (type $1 (func (result i32)))
 (type $2 (func))
 (global $global$0 (mut i32) (i32.const 0))
 (global $global$1 (mut i32) (i32.const 0))
 (global $global$2 (mut i32) (i32.const 0))
 (global $global$3 (mut i32) (i32.const 0))
 (global $global$4 (mut i32) (i32.const 0))
 (global $global$5 (mut i32) (i32.const 0))
 (global $global$6 (mut i32) (i32.const 0))
 (memory $0 1)
 (data $0 (i32.const 21) "\08\00\00\00t\00r\00u\00e")
 (data $1 (i32.const 34) "\n\00\00\00f\00a\00l\00s\00e")
 (data $2 (i32.const 49) "\02\00\00\000")
 (data $3 (i32.const 56) "\02\00\00\000")
 (export "memory" (memory $0))
 (export "test_getMaxMemory" (func $0))
 (export "test" (func $2))
 (start $3)
 (func $0 (result i32)
  (global.get $global$6)
 )
 (func $1 (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (if
   (i32.eqz
    (local.tee $0
     (local.tee $4
      (i32.mul
       (local.get $0)
       (local.get $1)
      )
     )
    )
   )
   (then
    (unreachable)
   )
  )
  (if
   (i32.lt_u
    (global.get $global$3)
    (local.get $0)
   )
   (then
    (unreachable)
   )
  )
  (if
   (i32.gt_u
    (local.tee $0
     (i32.and
      (i32.add
       (global.get $global$2)
       (i32.add
        (i32.add
         (local.tee $1
          (global.get $global$6)
         )
         (i32.const 16)
        )
        (select
         (i32.const 16)
         (local.get $0)
         (i32.le_u
          (local.get $0)
          (i32.const 16)
         )
        )
       )
      )
      (i32.xor
       (global.get $global$2)
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
       (i32.gt_u
        (local.get $2)
        (local.get $3)
       )
      )
     )
    )
   )
  )
  (global.set $global$6
   (local.get $0)
  )
  (local.set $2
   (i32.add
    (local.get $4)
    (local.tee $0
     (local.tee $1
      (i32.add
       (local.get $1)
       (i32.const 16)
      )
     )
    )
   )
  )
  (loop $label
   (if
    (i32.ne
     (local.get $0)
     (local.get $2)
    )
    (then
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
     (br $label)
    )
   )
  )
  (local.get $1)
 )
 (func $2 (param $0 i32) (param $1 i32) (result i32)
  (local $2 i64)
  (local $3 i64)
  (local $4 i32)
  (i32.store
   (i32.wrap_i64
    (local.tee $3
     (i64.or
      (i64.extend_i32_u
       (call $1
        (i32.const 1)
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
     (local.get $3)
    )
    (i32.const 4)
   )
   (local.get $1)
  )
  (loop $label
   (if
    (i32.eq
     (i32.wrap_i64
      (i64.shr_u
       (local.tee $2
        (if (result i64)
         (i32.le_s
          (local.tee $1
           (i32.load
            (local.tee $0
             (i32.wrap_i64
              (local.get $3)
             )
            )
           )
          )
          (i32.load
           (i32.add
            (local.get $0)
            (i32.const 4)
           )
          )
         )
         (then
          (i32.store
           (i32.wrap_i64
            (local.tee $2
             (i64.or
              (i64.extend_i32_u
               (call $1
                (i32.const 1)
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
           (local.get $0)
           (i32.add
            (i32.load
             (local.get $0)
            )
            (i32.const 1)
           )
          )
          (local.get $2)
         )
         (else
          (i64.const 8589934592)
         )
        )
       )
       (i64.const 32)
      )
     )
     (i32.const 3)
    )
    (then
     (local.set $4
      (i32.add
       (local.get $4)
       (i32.load
        (i32.wrap_i64
         (local.get $2)
        )
       )
      )
     )
     (br $label)
    )
   )
  )
  (local.get $4)
 )
 (func $3
  (global.set $global$0
   (i32.const 4)
  )
  (global.set $global$1
   (i32.const 16)
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
     (global.get $global$2)
     (i32.const 65536)
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
