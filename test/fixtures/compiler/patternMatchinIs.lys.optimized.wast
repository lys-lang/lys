(module
 (type $0 (func))
 (type $1 (func (param i32)))
 (type $2 (func (param i32 i32)))
 (type $3 (func (param i64) (result i32)))
 (type $4 (func (param i32) (result i32)))
 (type $5 (func (result i32)))
 (type $6 (func (param i32) (result i32)))
 (type $7 (func (param i32 i32)))
 (type $8 (func (result i64)))
 (import "env" "segfault" (func $fimport$0))
 (import "test" "registerAssertion" (func $fimport$1 (param i32 i32)))
 (import "env" "printf" (func $fimport$2 (param i32 i32)))
 (memory $0 1)
 (data (i32.const 104) "\08\00\00\00t\00r\00u\00e")
 (data (i32.const 117) "\n\00\00\00f\00a\00l\00s\00e")
 (data (i32.const 132) "\02\00\00\000")
 (data (i32.const 139) "\02\00\00\000")
 (data (i32.const 73) "\1a\00\00\00a\00s\00s\00e\00r\00t\00(\00f\00a\00l\00s\00e\00)")
 (data (i32.const 16) "4\00\00\00t\00r\00y\00i\00n\00g\00 \00t\00o\00 \00a\00l\00l\00o\00c\00a\00t\00e\00 \000\00 \00b\00y\00t\00e\00s")
 (global $global$0 (mut i64) (i64.const 0))
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
 (export "test_getLastErrorMessage" (func $0))
 (export "test_getMaxMemory" (func $2))
 (export "isA" (func $9))
 (export "isB" (func $10))
 (export "isEnum" (func $11))
 (export "isRed" (func $12))
 (export "isColor" (func $13))
 (export "isCustom" (func $14))
 (export "testPassing" (func $15))
 (start $16)
 (func $0 (; 3 ;) (type $5) (result i32)
  (local $0 i64)
  (block $label$1 (result i32)
   (drop
    (br_if $label$1
     (i32.const 0)
     (i64.ne
      (i64.and
       (local.tee $0
        (global.get $global$0)
       )
       (i64.const -4294967296)
      )
      (i64.const 38654705664)
     )
    )
   )
   (i32.wrap_i64
    (i64.load
     (i32.wrap_i64
      (local.get $0)
     )
    )
   )
  )
 )
 (func $1 (; 4 ;) (type $1) (param $0 i32)
  (local $1 i64)
  (call $fimport$1
   (local.get $0)
   (i32.const 73)
  )
  (if
   (i32.eq
    (i32.eqz
     (local.get $0)
    )
    (i32.const 1)
   )
   (block
    (i64.store
     (i32.wrap_i64
      (local.tee $1
       (i64.or
        (i64.extend_i32_u
         (call $3
          (i32.const 8)
         )
        )
        (i64.const 38654705664)
       )
      )
     )
     (i64.const 73)
    )
    (global.set $global$0
     (local.get $1)
    )
    (unreachable)
   )
  )
 )
 (func $2 (; 5 ;) (type $5) (result i32)
  (global.get $global$7)
 )
 (func $3 (; 6 ;) (type $6) (param $0 i32) (result i32)
  (local $1 i32)
  (call $5
   (local.tee $0
    (call $4
     (local.tee $1
      (local.get $0)
     )
    )
   )
   (local.get $1)
  )
  (local.get $0)
 )
 (func $4 (; 7 ;) (type $4) (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (if (result i32)
   (i32.gt_s
    (local.get $0)
    (i32.const 0)
   )
   (block (result i32)
    (if
     (i32.gt_s
      (local.get $0)
      (global.get $global$4)
     )
     (unreachable)
    )
    (if
     (i32.gt_s
      (local.tee $0
       (i32.and
        (i32.add
         (global.get $global$3)
         (i32.add
          (local.get $0)
          (local.tee $2
           (global.get $global$7)
          )
         )
        )
        (i32.xor
         (global.get $global$3)
         (i32.const -1)
        )
       )
      )
      (i32.shl
       (local.tee $1
        (current_memory)
       )
       (i32.const 16)
      )
     )
     (if
      (i32.lt_s
       (grow_memory
        (select
         (local.tee $3
          (local.get $1)
         )
         (local.tee $4
          (local.tee $1
           (i32.shr_u
            (i32.and
             (i32.add
              (i32.sub
               (local.get $0)
               (local.get $2)
              )
              (i32.const 65535)
             )
             (i32.const -65536)
            )
            (i32.const 16)
           )
          )
         )
         (i32.gt_s
          (local.get $3)
          (local.get $4)
         )
        )
       )
       (i32.const 0)
      )
      (if
       (i32.lt_s
        (grow_memory
         (local.get $1)
        )
        (i32.const 0)
       )
       (unreachable)
      )
     )
    )
    (global.set $global$7
     (local.get $0)
    )
    (i32.add
     (local.get $2)
     (i32.const 8)
    )
   )
   (block (result i32)
    (call $fimport$2
     (i32.const 16)
     (i32.const 0)
    )
    (call $fimport$0)
    (i32.const 0)
   )
  )
 )
 (func $5 (; 8 ;) (type $7) (param $0 i32) (param $1 i32)
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
 (func $6 (; 9 ;) (type $3) (param $0 i64) (result i32)
  (if (result i32)
   (i64.eq
    (i64.and
     (local.get $0)
     (i64.const -4294967296)
    )
    (i64.const 17179869184)
   )
   (i32.const 1)
   (i32.ne
    (i32.or
     (i32.ne
      (i64.eq
       (i64.and
        (local.get $0)
        (i64.const -4294967296)
       )
       (i64.const 8589934592)
      )
      (i32.const 0)
     )
     (i32.ne
      (i64.eq
       (i64.and
        (local.get $0)
        (i64.const -4294967296)
       )
       (i64.const 12884901888)
      )
      (i32.const 0)
     )
    )
    (i32.const 0)
   )
  )
 )
 (func $7 (; 10 ;) (type $3) (param $0 i64) (result i32)
  (if (result i32)
   (i64.eq
    (i64.and
     (local.get $0)
     (i64.const -4294967296)
    )
    (i64.const 38654705664)
   )
   (i32.const 1)
   (i32.ne
    (if (result i32)
     (i64.eq
      (i64.and
       (local.get $0)
       (i64.const -4294967296)
      )
      (i64.const 34359738368)
     )
     (i32.const 1)
     (i32.ne
      (i32.or
       (i32.ne
        (i64.eq
         (i64.and
          (local.get $0)
          (i64.const -4294967296)
         )
         (i64.const 25769803776)
        )
        (i32.const 0)
       )
       (i32.ne
        (i64.eq
         (i64.and
          (local.get $0)
          (i64.const -4294967296)
         )
         (i64.const 30064771072)
        )
        (i32.const 0)
       )
      )
      (i32.const 0)
     )
    )
    (i32.const 0)
   )
  )
 )
 (func $8 (; 11 ;) (type $8) (result i64)
  (local $0 i64)
  (i32.store
   (i32.wrap_i64
    (local.tee $0
     (i64.or
      (i64.extend_i32_u
       (call $3
        (i32.const 4)
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
 (func $9 (; 12 ;) (type $3) (param $0 i64) (result i32)
  (select
   (i32.const 0)
   (i32.const 1)
   (i64.ne
    (i64.and
     (local.get $0)
     (i64.const -4294967296)
    )
    (i64.const 8589934592)
   )
  )
 )
 (func $10 (; 13 ;) (type $3) (param $0 i64) (result i32)
  (select
   (i32.const 0)
   (i32.const 1)
   (i64.ne
    (i64.and
     (local.get $0)
     (i64.const -4294967296)
    )
    (i64.const 12884901888)
   )
  )
 )
 (func $11 (; 14 ;) (type $3) (param $0 i64) (result i32)
  (block $label$1 (result i32)
   (drop
    (br_if $label$1
     (i32.const 0)
     (i32.eqz
      (call $6
       (local.get $0)
      )
     )
    )
   )
   (i32.const 1)
  )
 )
 (func $12 (; 15 ;) (type $3) (param $0 i64) (result i32)
  (select
   (i32.const 0)
   (i32.const 1)
   (i64.ne
    (i64.and
     (local.get $0)
     (i64.const -4294967296)
    )
    (i64.const 25769803776)
   )
  )
 )
 (func $13 (; 16 ;) (type $3) (param $0 i64) (result i32)
  (block $label$1 (result i32)
   (drop
    (br_if $label$1
     (i32.const 0)
     (i32.eqz
      (call $7
       (local.get $0)
      )
     )
    )
   )
   (i32.const 1)
  )
 )
 (func $14 (; 17 ;) (type $3) (param $0 i64) (result i32)
  (select
   (i32.const 0)
   (i32.const 1)
   (i64.ne
    (i64.and
     (local.get $0)
     (i64.const -4294967296)
    )
    (i64.const 38654705664)
   )
  )
 )
 (func $15 (; 18 ;) (type $0)
  (call $1
   (i32.const 1)
  )
  (call $1
   (i32.eqz
    (i32.eqz
     (call $11
      (i64.const 8589934592)
     )
    )
   )
  )
  (call $1
   (i32.const 1)
  )
  (call $1
   (i32.const 1)
  )
  (call $1
   (i32.eqz
    (i32.eqz
     (call $11
      (i64.const 12884901888)
     )
    )
   )
  )
  (call $1
   (i32.const 1)
  )
  (call $1
   (i32.const 1)
  )
  (call $1
   (i32.eqz
    (i32.eqz
     (call $11
      (i64.const 17179869184)
     )
    )
   )
  )
  (call $1
   (i32.const 1)
  )
  (call $1
   (i32.eqz
    (i32.eqz
     (select
      (i32.const 0)
      (i32.const 1)
      (i64.ne
       (i64.and
        (global.get $global$8)
        (i64.const -4294967296)
       )
       (i64.const 8589934592)
      )
     )
    )
   )
  )
  (call $1
   (i32.eq
    (i32.eqz
     (select
      (i32.const 0)
      (i32.const 1)
      (i64.ne
       (i64.and
        (global.get $global$8)
        (i64.const -4294967296)
       )
       (i64.const 12884901888)
      )
     )
    )
    (i32.const 1)
   )
  )
  (call $1
   (i32.eqz
    (i32.eqz
     (call $11
      (global.get $global$8)
     )
    )
   )
  )
  (call $1
   (i32.eqz
    (i32.eqz
     (select
      (i32.const 0)
      (i32.const 1)
      (i64.ne
       (i64.and
        (global.get $global$9)
        (i64.const -4294967296)
       )
       (i64.const 8589934592)
      )
     )
    )
   )
  )
  (call $1
   (i32.eq
    (i32.eqz
     (select
      (i32.const 0)
      (i32.const 1)
      (i64.ne
       (i64.and
        (global.get $global$9)
        (i64.const -4294967296)
       )
       (i64.const 12884901888)
      )
     )
    )
    (i32.const 1)
   )
  )
  (call $1
   (i32.eqz
    (i32.eqz
     (call $11
      (global.get $global$9)
     )
    )
   )
  )
  (call $1
   (i32.eqz
    (i32.eqz
     (select
      (i32.const 0)
      (i32.const 1)
      (i64.ne
       (i64.and
        (global.get $global$10)
        (i64.const -4294967296)
       )
       (i64.const 8589934592)
      )
     )
    )
   )
  )
  (call $1
   (i32.eq
    (i32.eqz
     (select
      (i32.const 0)
      (i32.const 1)
      (i64.ne
       (i64.and
        (global.get $global$10)
        (i64.const -4294967296)
       )
       (i64.const 12884901888)
      )
     )
    )
    (i32.const 1)
   )
  )
  (call $1
   (i32.eqz
    (i32.eqz
     (call $11
      (global.get $global$10)
     )
    )
   )
  )
  (call $1
   (i32.eq
    (i32.eqz
     (select
      (i32.const 0)
      (i32.const 1)
      (i64.ne
       (i64.and
        (global.get $global$10)
        (i64.const -4294967296)
       )
       (i64.const 25769803776)
      )
     )
    )
    (i32.const 1)
   )
  )
  (call $1
   (i32.const 1)
  )
  (call $1
   (i32.eqz
    (i32.eqz
     (call $13
      (call $8)
     )
    )
   )
  )
  (call $1
   (i32.eqz
    (i32.eqz
     (select
      (i32.const 0)
      (i32.const 1)
      (i64.ne
       (i64.and
        (call $8)
        (i64.const -4294967296)
       )
       (i64.const 38654705664)
      )
     )
    )
   )
  )
  (call $1
   (i32.eq
    (i32.eqz
     (select
      (i32.const 0)
      (i32.const 1)
      (i64.ne
       (i64.and
        (call $8)
        (i64.const -4294967296)
       )
       (i64.const 25769803776)
      )
     )
    )
    (i32.const 1)
   )
  )
  (call $1
   (i32.eq
    (i32.eqz
     (select
      (i32.const 0)
      (i32.const 1)
      (i64.ne
       (i64.and
        (call $8)
        (i64.const -4294967296)
       )
       (i64.const 12884901888)
      )
     )
    )
    (i32.const 1)
   )
  )
 )
 (func $16 (; 19 ;) (type $0)
  (global.set $global$0
   (i64.const 34359738368)
  )
  (global.set $global$1
   (i32.const 3)
  )
  (global.set $global$2
   (i32.shl
    (i32.const 1)
    (global.get $global$1)
   )
  )
  (global.set $global$3
   (i32.sub
    (global.get $global$2)
    (i32.const 1)
   )
  )
  (global.set $global$4
   (i32.const 1073741824)
  )
  (global.set $global$5
   (i32.const 65536)
  )
  (global.set $global$6
   (i32.and
    (i32.add
     (global.get $global$5)
     (global.get $global$3)
    )
    (i32.xor
     (global.get $global$3)
     (i32.const -1)
    )
   )
  )
  (global.set $global$7
   (global.get $global$6)
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
