(module
 (type $0 (func (param i32) (result i32)))
 (type $1 (func (param i32 i32) (result i32)))
 (type $2 (func (param i64) (result i64)))
 (type $3 (func (param i64) (result i32)))
 (type $4 (func))
 (type $5 (func (param i32 i32)))
 (type $6 (func (param i32) (result i32)))
 (memory $0 1)
 (global $global$0 (mut i32) (i32.const 0))
 (global $global$1 (mut i32) (i32.const 0))
 (global $global$2 (mut i32) (i32.const 0))
 (global $global$3 (mut i32) (i32.const 0))
 (global $global$4 (mut i32) (i32.const 0))
 (global $global$5 (mut i32) (i32.const 0))
 (global $global$6 (mut i32) (i32.const 0))
 (global $global$7 (mut i32) (i32.const 0))
 (export "memory" (memory $0))
 (export "test" (func $12))
 (export "test2" (func $13))
 (export "test3" (func $14))
 (export "test4" (func $15))
 (start $16)
 (func $0 (; 0 ;) (type $0) (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (if
   (call $8
    (local.get $0)
    (i32.const 0)
   )
   (block
    (if
     (call $8
      (local.get $0)
      (global.get $global$3)
     )
     (unreachable)
    )
    (if
     (call $8
      (local.tee $0
       (call $3
        (call $4
         (call $4
          (local.tee $3
           (global.get $global$6)
          )
          (local.get $0)
         )
         (global.get $global$2)
        )
        (call $6
         (global.get $global$2)
        )
       )
      )
      (call $7
       (local.tee $1
        (current_memory)
       )
       (i32.const 16)
      )
     )
     (block
      (local.set $2
       (local.get $1)
      )
      (local.set $4
       (local.tee $1
        (i32.shr_u
         (call $3
          (call $4
           (call $5
            (local.get $0)
            (local.get $3)
           )
           (i32.const 65535)
          )
          (call $6
           (i32.const 65535)
          )
         )
         (i32.const 16)
        )
       )
      )
      (if
       (i32.eqz
        (call $8
         (local.get $2)
         (local.get $1)
        )
       )
       (local.set $2
        (local.get $4)
       )
      )
      (if
       (call $9
        (grow_memory
         (local.get $2)
        )
       )
       (if
        (call $9
         (grow_memory
          (local.get $1)
         )
        )
        (unreachable)
       )
      )
     )
    )
    (global.set $global$6
     (local.get $0)
    )
   )
  )
  (local.get $3)
 )
 (func $1 (; 1 ;) (type $5) (param $0 i32) (param $1 i32)
  (local $2 i32)
  (local.set $2
   (local.get $0)
  )
  (loop $label$1
   (if
    (i32.ne
     (local.get $0)
     (local.get $2)
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
 (func $2 (; 2 ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (i32.eq
   (local.get $0)
   (local.get $1)
  )
 )
 (func $3 (; 3 ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (i32.and
   (local.get $0)
   (local.get $1)
  )
 )
 (func $4 (; 4 ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (i32.add
   (local.get $0)
   (local.get $1)
  )
 )
 (func $5 (; 5 ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (i32.sub
   (local.get $0)
   (local.get $1)
  )
 )
 (func $6 (; 6 ;) (type $0) (param $0 i32) (result i32)
  (i32.xor
   (local.get $0)
   (i32.const -1)
  )
 )
 (func $7 (; 7 ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (i32.shl
   (local.get $0)
   (local.get $1)
  )
 )
 (func $8 (; 8 ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (i32.gt_s
   (local.get $0)
   (local.get $1)
  )
 )
 (func $9 (; 9 ;) (type $6) (param $0 i32) (result i32)
  (i32.lt_s
   (local.get $0)
   (i32.const 0)
  )
 )
 (func $10 (; 10 ;) (type $3) (param $0 i64) (result i32)
  (i64.eq
   (i64.and
    (local.get $0)
    (i64.const -4294967296)
   )
   (i64.const 8589934592)
  )
 )
 (func $11 (; 11 ;) (type $3) (param $0 i64) (result i32)
  (i64.eq
   (i64.and
    (local.get $0)
    (i64.const -4294967296)
   )
   (i64.const 12884901888)
  )
 )
 (func $12 (; 12 ;) (type $0) (param $0 i32) (result i32)
  (block $label$1 (result i32)
   (drop
    (br_if $label$1
     (i32.const 0)
     (i32.eqz
      (call $2
       (i32.const 1)
       (local.get $0)
      )
     )
    )
   )
   (i32.const 1)
  )
 )
 (func $13 (; 13 ;) (type $0) (param $0 i32) (result i32)
  (block $label$1 (result i32)
   (if
    (i32.eqz
     (call $2
      (i32.const 10)
      (local.get $0)
     )
    )
    (block
     (if
      (i32.eqz
       (call $2
        (i32.const 20)
        (local.get $0)
       )
      )
      (block
       (if
        (i32.eqz
         (call $2
          (i32.const 30)
          (local.get $0)
         )
        )
        (block
         (if
          (i32.eqz
           (call $2
            (i32.const 40)
            (local.get $0)
           )
          )
          (block
           (if
            (i32.eqz
             (call $2
              (i32.const 50)
              (local.get $0)
             )
            )
            (block
             (if
              (i32.eqz
               (call $2
                (i32.const 60)
                (local.get $0)
               )
              )
              (block
               (if
                (i32.eqz
                 (call $2
                  (i32.const 70)
                  (local.get $0)
                 )
                )
                (block
                 (if
                  (i32.eqz
                   (call $2
                    (i32.const 80)
                    (local.get $0)
                   )
                  )
                  (block
                   (if
                    (i32.eqz
                     (call $2
                      (i32.const 90)
                      (local.get $0)
                     )
                    )
                    (br $label$1
                     (i32.const 0)
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
 (func $14 (; 14 ;) (type $3) (param $0 i64) (result i32)
  (block $label$1 (result i32)
   (if
    (i32.eqz
     (call $11
      (local.get $0)
     )
    )
    (block
     (block $label$3
      (br_if $label$3
       (call $10
        (local.get $0)
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
 (func $15 (; 15 ;) (type $2) (param $0 i64) (result i64)
  (local $1 i32)
  (if
   (i32.eqz
    (call $11
     (local.get $0)
    )
   )
   (block
    (block $label$2
     (br_if $label$2
      (call $10
       (local.get $0)
      )
     )
    )
    (call $1
     (local.tee $1
      (call $0
       (i32.const 8)
      )
     )
     (i32.const 8)
    )
    (i32.store
     (i32.wrap_i64
      (local.tee $0
       (i64.or
        (i64.extend_i32_u
         (local.get $1)
        )
        (i64.const 12884901888)
       )
      )
     )
     (i32.const 0)
    )
   )
  )
  (local.get $0)
 )
 (func $16 (; 16 ;) (type $4)
  (global.set $global$0
   (i32.const 3)
  )
  (global.set $global$1
   (call $7
    (i32.const 1)
    (global.get $global$0)
   )
  )
  (global.set $global$2
   (call $5
    (global.get $global$1)
    (i32.const 1)
   )
  )
  (global.set $global$3
   (call $7
    (i32.const 1)
    (i32.const 30)
   )
  )
  (global.set $global$4
   (i32.const 0)
  )
  (global.set $global$5
   (call $3
    (call $4
     (global.get $global$4)
     (global.get $global$2)
    )
    (call $6
     (global.get $global$2)
    )
   )
  )
  (global.set $global$6
   (global.get $global$5)
  )
  (global.set $global$7
   (i32.const 0)
  )
 )
)
