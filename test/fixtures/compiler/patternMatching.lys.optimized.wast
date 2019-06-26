(module
 (type $0 (func))
 (type $1 (func (result i32)))
 (type $2 (func (param i32) (result i32)))
 (type $3 (func (param i32 i32 i32)))
 (type $4 (func (param i64) (result i32)))
 (type $5 (func (param i64) (result i64)))
 (type $6 (func (result i64)))
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
 (export "test" (func $4))
 (export "test2" (func $5))
 (export "test3" (func $6))
 (export "test4" (func $7))
 (start $8)
 (func $0 (; 0 ;) (type $1) (result i32)
  (global.get $global$6)
 )
 (func $1 (; 1 ;) (type $2) (param $0 i32) (result i32)
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
    (global.get $global$3)
   )
   (unreachable)
  )
  (if
   (i32.gt_u
    (local.tee $1
     (i32.and
      (i32.add
       (global.get $global$2)
       (i32.add
        (select
         (local.get $0)
         (i32.const 16)
         (i32.gt_u
          (local.get $0)
          (i32.const 16)
         )
        )
        (i32.add
         (local.tee $0
          (global.get $global$6)
         )
         (i32.const 16)
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
  (global.set $global$6
   (local.get $1)
  )
  (i32.add
   (local.get $0)
   (i32.const 16)
  )
 )
 (func $2 (; 2 ;) (type $3) (param $0 i32) (param $1 i32) (param $2 i32)
  (local.set $2
   (i32.add
    (local.get $0)
    (local.get $2)
   )
  )
  (loop $label$1
   (if
    (i32.eqz
     (i32.eq
      (local.get $0)
      (local.get $2)
     )
    )
    (block
     (i32.store8
      (local.get $0)
      (i32.load8_u
       (local.get $1)
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
 (func $3 (; 3 ;) (type $6) (result i64)
  (local $0 i32)
  (local $1 i64)
  (call $2
   (local.tee $0
    (call $1
     (i32.const 4)
    )
   )
   (i32.const 0)
   (i32.const 4)
  )
  (i32.store
   (i32.wrap_i64
    (local.tee $1
     (i64.or
      (i64.extend_i32_u
       (local.get $0)
      )
      (i64.const 8589934592)
     )
    )
   )
   (i32.const 0)
  )
  (local.get $1)
 )
 (func $4 (; 4 ;) (type $2) (param $0 i32) (result i32)
  (select
   (i32.const 0)
   (i32.const 1)
   (i32.ne
    (local.get $0)
    (i32.const 1)
   )
  )
 )
 (func $5 (; 5 ;) (type $2) (param $0 i32) (result i32)
  (block $label$1 (result i32)
   (if
    (i32.ne
     (local.get $0)
     (i32.const 10)
    )
    (block
     (if
      (i32.ne
       (local.get $0)
       (i32.const 20)
      )
      (block
       (if
        (i32.ne
         (local.get $0)
         (i32.const 30)
        )
        (block
         (if
          (i32.ne
           (local.get $0)
           (i32.const 40)
          )
          (block
           (if
            (i32.ne
             (local.get $0)
             (i32.const 50)
            )
            (block
             (if
              (i32.ne
               (local.get $0)
               (i32.const 60)
              )
              (block
               (if
                (i32.ne
                 (local.get $0)
                 (i32.const 70)
                )
                (block
                 (if
                  (i32.ne
                   (local.get $0)
                   (i32.const 80)
                  )
                  (block
                   (drop
                    (br_if $label$1
                     (i32.const 0)
                     (i32.ne
                      (local.get $0)
                      (i32.const 90)
                     )
                    )
                   )
                   (br $label$1
                    (i32.const 9)
                   )
                  )
                 )
                 (br $label$1
                  (i32.const 8)
                 )
                )
               )
               (br $label$1
                (i32.const 7)
               )
              )
             )
             (br $label$1
              (i32.const 6)
             )
            )
           )
           (br $label$1
            (i32.const 5)
           )
          )
         )
         (br $label$1
          (i32.const 4)
         )
        )
       )
       (br $label$1
        (i32.const 3)
       )
      )
     )
     (br $label$1
      (i32.const 2)
     )
    )
   )
   (i32.const 1)
  )
 )
 (func $6 (; 6 ;) (type $4) (param $0 i64) (result i32)
  (block $label$1 (result i32)
   (if
    (i64.ne
     (i64.and
      (local.get $0)
      (i64.const -4294967296)
     )
     (i64.const 8589934592)
    )
    (block
     (block $label$3
      (br_if $label$3
       (i64.eq
        (i64.and
         (local.get $0)
         (i64.const -4294967296)
        )
        (i64.const 4294967296)
       )
      )
     )
     (br $label$1
      (i32.const 0)
     )
    )
   )
   (i32.const 1)
  )
 )
 (func $7 (; 7 ;) (type $5) (param $0 i64) (result i64)
  (block $label$1 (result i64)
   (if
    (i64.ne
     (i64.and
      (local.get $0)
      (i64.const -4294967296)
     )
     (i64.const 8589934592)
    )
    (block
     (block $label$3
      (br_if $label$3
       (i64.eq
        (i64.and
         (local.get $0)
         (i64.const -4294967296)
        )
        (i64.const 4294967296)
       )
      )
     )
     (br $label$1
      (call $3)
     )
    )
   )
   (local.get $0)
  )
 )
 (func $8 (; 8 ;) (type $0)
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
