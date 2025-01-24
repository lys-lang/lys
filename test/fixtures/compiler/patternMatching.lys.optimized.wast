(module
 (type $0 (func (param i32) (result i32)))
 (type $1 (func (result i32)))
 (type $2 (func (param i64) (result i32)))
 (type $3 (func (param i64) (result i64)))
 (type $4 (func))
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
 (export "test" (func $1))
 (export "test2" (func $2))
 (export "test3" (func $3))
 (export "test4" (func $4))
 (start $5)
 (func $0 (result i32)
  (global.get $global$2)
 )
 (func $1 (param $0 i32) (result i32)
  (i32.eq
   (local.get $0)
   (i32.const 1)
  )
 )
 (func $2 (param $0 i32) (result i32)
  (block $block (result i32)
   (if
    (i32.ne
     (local.get $0)
     (i32.const 10)
    )
    (then
     (if
      (i32.ne
       (local.get $0)
       (i32.const 20)
      )
      (then
       (if
        (i32.ne
         (local.get $0)
         (i32.const 30)
        )
        (then
         (if
          (i32.ne
           (local.get $0)
           (i32.const 40)
          )
          (then
           (if
            (i32.ne
             (local.get $0)
             (i32.const 50)
            )
            (then
             (if
              (i32.ne
               (local.get $0)
               (i32.const 60)
              )
              (then
               (if
                (i32.ne
                 (local.get $0)
                 (i32.const 70)
                )
                (then
                 (if
                  (i32.ne
                   (local.get $0)
                   (i32.const 80)
                  )
                  (then
                   (drop
                    (br_if $block
                     (i32.const 0)
                     (i32.ne
                      (local.get $0)
                      (i32.const 90)
                     )
                    )
                   )
                   (br $block
                    (i32.const 9)
                   )
                  )
                 )
                 (br $block
                  (i32.const 8)
                 )
                )
               )
               (br $block
                (i32.const 7)
               )
              )
             )
             (br $block
              (i32.const 6)
             )
            )
           )
           (br $block
            (i32.const 5)
           )
          )
         )
         (br $block
          (i32.const 4)
         )
        )
       )
       (br $block
        (i32.const 3)
       )
      )
     )
     (br $block
      (i32.const 2)
     )
    )
   )
   (i32.const 1)
  )
 )
 (func $3 (param $0 i64) (result i32)
  (local $1 i32)
  (block $block1 (result i32)
   (if
    (i32.ne
     (local.tee $1
      (i32.wrap_i64
       (i64.shr_u
        (local.get $0)
        (i64.const 32)
       )
      )
     )
     (i32.const 2)
    )
    (then
     (block $block
      (br_if $block
       (i32.eq
        (local.get $1)
        (i32.const 1)
       )
      )
     )
     (br $block1
      (i32.const 0)
     )
    )
   )
   (i32.const 1)
  )
 )
 (func $4 (param $0 i64) (result i64)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (if
   (i32.ne
    (local.tee $1
     (i32.wrap_i64
      (i64.shr_u
       (local.get $0)
       (i64.const 32)
      )
     )
    )
    (i32.const 2)
   )
   (then
    (block $block
     (br_if $block
      (i32.eq
       (local.get $1)
       (i32.const 1)
      )
     )
    )
    (if
     (i32.lt_u
      (global.get $global$1)
      (i32.const 4)
     )
     (then
      (unreachable)
     )
    )
    (if
     (i32.gt_u
      (local.tee $2
       (i32.and
        (i32.add
         (global.get $global$0)
         (i32.add
          (local.tee $1
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
       (local.tee $3
        (memory.size)
       )
       (i32.const 16)
      )
     )
     (then
      (drop
       (memory.grow
        (select
         (local.get $3)
         (local.tee $4
          (i32.shr_s
           (i32.and
            (i32.add
             (i32.sub
              (local.get $2)
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
          (local.get $3)
          (local.get $4)
         )
        )
       )
      )
     )
    )
    (global.set $global$2
     (local.get $2)
    )
    (local.set $3
     (i32.add
      (local.tee $1
       (local.tee $2
        (i32.add
         (local.get $1)
         (i32.const 16)
        )
       )
      )
      (i32.const 4)
     )
    )
    (loop $label
     (if
      (i32.ne
       (local.get $1)
       (local.get $3)
      )
      (then
       (i32.store8
        (local.get $1)
        (i32.load8_u
         (i32.const 0)
        )
       )
       (local.set $1
        (i32.add
         (local.get $1)
         (i32.const 1)
        )
       )
       (br $label)
      )
     )
    )
    (i32.store
     (i32.wrap_i64
      (local.tee $0
       (i64.or
        (i64.extend_i32_u
         (local.get $2)
        )
        (i64.const 8589934592)
       )
      )
     )
     (i32.const 0)
    )
   )
  )
  (local.get $0)
 )
 (func $5
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
