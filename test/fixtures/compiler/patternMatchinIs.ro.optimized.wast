(module
 (type $0 (func (param i32) (result i32)))
 (type $1 (func (param i32)))
 (type $2 (func))
 (type $3 (func (param i32 i32) (result i32)))
 (type $4 (func (param i64) (result i32)))
 (type $5 (func (param i32) (result i32)))
 (type $6 (func (result i64)))
 (memory $0 1)
 (global $global$0 (mut i32) (i32.const 0))
 (global $global$1 (mut i32) (i32.const 0))
 (global $global$2 (mut i32) (i32.const 0))
 (global $global$3 (mut i32) (i32.const 0))
 (global $global$4 (mut i32) (i32.const 0))
 (global $global$5 (mut i32) (i32.const 0))
 (global $global$6 (mut i32) (i32.const 0))
 (global $global$7 (mut i32) (i32.const 0))
 (global $global$8 (mut i64) (i64.const 0))
 (global $global$9 (mut i64) (i64.const 0))
 (global $global$10 (mut i64) (i64.const 0))
 (export "memory" (memory $0))
 (export "isA" (func $17))
 (export "isB" (func $18))
 (export "isEnum" (func $19))
 (export "isRed" (func $20))
 (export "isColor" (func $21))
 (export "isCustom" (func $22))
 (export "testPassing" (func $23))
 (start $24)
 (func $0 (; 0 ;) (type $1) (param $0 i32)
  (if
   (call $9
    (local.get $0)
    (i32.const 0)
   )
   (unreachable)
  )
 )
 (func $1 (; 1 ;) (type $0) (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (if
   (call $7
    (local.get $0)
    (i32.const 0)
   )
   (block
    (if
     (call $7
      (local.get $0)
      (global.get $global$3)
     )
     (unreachable)
    )
    (if
     (call $7
      (local.tee $0
       (call $2
        (call $3
         (call $3
          (local.tee $3
           (global.get $global$6)
          )
          (local.get $0)
         )
         (global.get $global$2)
        )
        (call $5
         (global.get $global$2)
        )
       )
      )
      (call $6
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
         (call $2
          (call $3
           (call $4
            (local.get $0)
            (local.get $3)
           )
           (i32.const 65535)
          )
          (call $5
           (i32.const 65535)
          )
         )
         (i32.const 16)
        )
       )
      )
      (if
       (i32.eqz
        (call $7
         (local.get $2)
         (local.get $1)
        )
       )
       (local.set $2
        (local.get $4)
       )
      )
      (if
       (call $8
        (grow_memory
         (local.get $2)
        )
       )
       (if
        (call $8
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
 (func $2 (; 2 ;) (type $3) (param $0 i32) (param $1 i32) (result i32)
  (i32.and
   (local.get $0)
   (local.get $1)
  )
 )
 (func $3 (; 3 ;) (type $3) (param $0 i32) (param $1 i32) (result i32)
  (i32.add
   (local.get $0)
   (local.get $1)
  )
 )
 (func $4 (; 4 ;) (type $3) (param $0 i32) (param $1 i32) (result i32)
  (i32.sub
   (local.get $0)
   (local.get $1)
  )
 )
 (func $5 (; 5 ;) (type $0) (param $0 i32) (result i32)
  (i32.xor
   (local.get $0)
   (i32.const -1)
  )
 )
 (func $6 (; 6 ;) (type $3) (param $0 i32) (param $1 i32) (result i32)
  (i32.shl
   (local.get $0)
   (local.get $1)
  )
 )
 (func $7 (; 7 ;) (type $3) (param $0 i32) (param $1 i32) (result i32)
  (i32.gt_s
   (local.get $0)
   (local.get $1)
  )
 )
 (func $8 (; 8 ;) (type $5) (param $0 i32) (result i32)
  (i32.lt_s
   (local.get $0)
   (i32.const 0)
  )
 )
 (func $9 (; 9 ;) (type $3) (param $0 i32) (param $1 i32) (result i32)
  (i32.eq
   (i32.eqz
    (local.get $0)
   )
   (i32.eqz
    (local.get $1)
   )
  )
 )
 (func $10 (; 10 ;) (type $3) (param $0 i32) (param $1 i32) (result i32)
  (i32.or
   (i32.ne
    (local.get $0)
    (i32.const 0)
   )
   (i32.ne
    (local.get $1)
    (i32.const 0)
   )
  )
 )
 (func $11 (; 11 ;) (type $4) (param $0 i64) (result i32)
  (i64.eq
   (i64.and
    (local.get $0)
    (i64.const -4294967296)
   )
   (i64.const 8589934592)
  )
 )
 (func $12 (; 12 ;) (type $4) (param $0 i64) (result i32)
  (i64.eq
   (i64.and
    (local.get $0)
    (i64.const -4294967296)
   )
   (i64.const 12884901888)
  )
 )
 (func $13 (; 13 ;) (type $4) (param $0 i64) (result i32)
  (call $10
   (call $10
    (call $10
     (call $14
      (local.get $0)
     )
     (i64.eq
      (i64.and
       (local.get $0)
       (i64.const -4294967296)
      )
      (i64.const 30064771072)
     )
    )
    (i64.eq
     (i64.and
      (local.get $0)
      (i64.const -4294967296)
     )
     (i64.const 34359738368)
    )
   )
   (call $16
    (local.get $0)
   )
  )
 )
 (func $14 (; 14 ;) (type $4) (param $0 i64) (result i32)
  (i64.eq
   (i64.and
    (local.get $0)
    (i64.const -4294967296)
   )
   (i64.const 25769803776)
  )
 )
 (func $15 (; 15 ;) (type $6) (result i64)
  (local $0 i64)
  (i32.store
   (i32.wrap_i64
    (local.tee $0
     (i64.or
      (i64.extend_i32_u
       (call $1
        (i32.const 8)
       )
      )
      (i64.const 38654705664)
     )
    )
   )
   (i32.const 1)
  )
  (local.get $0)
 )
 (func $16 (; 16 ;) (type $4) (param $0 i64) (result i32)
  (i64.eq
   (i64.and
    (local.get $0)
    (i64.const -4294967296)
   )
   (i64.const 38654705664)
  )
 )
 (func $17 (; 17 ;) (type $4) (param $0 i64) (result i32)
  (block $label$1 (result i32)
   (drop
    (br_if $label$1
     (i32.const 0)
     (i32.eqz
      (call $11
       (local.get $0)
      )
     )
    )
   )
   (i32.const 1)
  )
 )
 (func $18 (; 18 ;) (type $4) (param $0 i64) (result i32)
  (block $label$1 (result i32)
   (drop
    (br_if $label$1
     (i32.const 0)
     (i32.eqz
      (call $12
       (local.get $0)
      )
     )
    )
   )
   (i32.const 1)
  )
 )
 (func $19 (; 19 ;) (type $4) (param $0 i64) (result i32)
  (block $label$1 (result i32)
   (drop
    (br_if $label$1
     (i32.const 0)
     (i32.eqz
      (call $10
       (call $10
        (call $11
         (local.get $0)
        )
        (call $12
         (local.get $0)
        )
       )
       (i64.eq
        (i64.and
         (local.get $0)
         (i64.const -4294967296)
        )
        (i64.const 17179869184)
       )
      )
     )
    )
   )
   (i32.const 1)
  )
 )
 (func $20 (; 20 ;) (type $4) (param $0 i64) (result i32)
  (block $label$1 (result i32)
   (drop
    (br_if $label$1
     (i32.const 0)
     (i32.eqz
      (call $14
       (local.get $0)
      )
     )
    )
   )
   (i32.const 1)
  )
 )
 (func $21 (; 21 ;) (type $4) (param $0 i64) (result i32)
  (block $label$1 (result i32)
   (drop
    (br_if $label$1
     (i32.const 0)
     (i32.eqz
      (call $13
       (local.get $0)
      )
     )
    )
   )
   (i32.const 1)
  )
 )
 (func $22 (; 22 ;) (type $4) (param $0 i64) (result i32)
  (block $label$1 (result i32)
   (drop
    (br_if $label$1
     (i32.const 0)
     (i32.eqz
      (call $16
       (local.get $0)
      )
     )
    )
   )
   (i32.const 1)
  )
 )
 (func $23 (; 23 ;) (type $2)
  (call $0
   (call $9
    (call $17
     (i64.const 8589934592)
    )
    (i32.const 1)
   )
  )
  (call $0
   (call $9
    (call $19
     (i64.const 8589934592)
    )
    (i32.const 1)
   )
  )
  (call $0
   (call $9
    (call $18
     (i64.const 12884901888)
    )
    (i32.const 1)
   )
  )
  (call $0
   (call $9
    (call $17
     (i64.const 12884901888)
    )
    (i32.const 0)
   )
  )
  (call $0
   (call $9
    (call $19
     (i64.const 12884901888)
    )
    (i32.const 1)
   )
  )
  (call $0
   (call $9
    (call $18
     (i64.const 12884901888)
    )
    (i32.const 1)
   )
  )
  (call $0
   (call $9
    (call $17
     (i64.const 17179869184)
    )
    (i32.const 0)
   )
  )
  (call $0
   (call $9
    (call $19
     (i64.const 17179869184)
    )
    (i32.const 1)
   )
  )
  (call $0
   (call $9
    (call $18
     (i64.const 17179869184)
    )
    (i32.const 0)
   )
  )
  (call $0
   (call $9
    (call $17
     (global.get $global$8)
    )
    (i32.const 1)
   )
  )
  (call $0
   (call $9
    (call $18
     (global.get $global$8)
    )
    (i32.const 0)
   )
  )
  (call $0
   (call $9
    (call $19
     (global.get $global$8)
    )
    (i32.const 1)
   )
  )
  (call $0
   (call $9
    (call $17
     (global.get $global$9)
    )
    (i32.const 1)
   )
  )
  (call $0
   (call $9
    (call $18
     (global.get $global$9)
    )
    (i32.const 0)
   )
  )
  (call $0
   (call $9
    (call $19
     (global.get $global$9)
    )
    (i32.const 1)
   )
  )
  (call $0
   (call $9
    (call $17
     (global.get $global$10)
    )
    (i32.const 1)
   )
  )
  (call $0
   (call $9
    (call $18
     (global.get $global$10)
    )
    (i32.const 0)
   )
  )
  (call $0
   (call $9
    (call $19
     (global.get $global$10)
    )
    (i32.const 1)
   )
  )
  (call $0
   (call $9
    (call $20
     (global.get $global$10)
    )
    (i32.const 0)
   )
  )
  (call $0
   (call $9
    (call $20
     (i64.const 25769803776)
    )
    (i32.const 1)
   )
  )
  (call $0
   (call $9
    (call $21
     (call $15)
    )
    (i32.const 1)
   )
  )
  (call $0
   (call $9
    (call $22
     (call $15)
    )
    (i32.const 1)
   )
  )
  (call $0
   (call $9
    (call $20
     (call $15)
    )
    (i32.const 0)
   )
  )
  (call $0
   (call $9
    (call $18
     (call $15)
    )
    (i32.const 0)
   )
  )
 )
 (func $24 (; 24 ;) (type $2)
  (global.set $global$0
   (i32.const 3)
  )
  (global.set $global$1
   (call $6
    (i32.const 1)
    (global.get $global$0)
   )
  )
  (global.set $global$2
   (call $4
    (global.get $global$1)
    (i32.const 1)
   )
  )
  (global.set $global$3
   (call $6
    (i32.const 1)
    (i32.const 30)
   )
  )
  (global.set $global$4
   (i32.const 0)
  )
  (global.set $global$5
   (call $2
    (call $3
     (global.get $global$4)
     (global.get $global$2)
    )
    (call $5
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
  (global.set $global$8
   (i64.const 8589934592)
  )
  (global.set $global$9
   (i64.const 8589934592)
  )
  (global.set $global$10
   (i64.const 8589934592)
  )
 )
)
