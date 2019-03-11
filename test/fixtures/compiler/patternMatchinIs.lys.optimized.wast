(module
 (type $0 (func (param i32)))
 (type $1 (func (param i32 i32)))
 (type $2 (func (param i32) (result i64)))
 (type $3 (func (param i64) (result i32)))
 (type $4 (func (param i32) (result i32)))
 (type $5 (func (result i32)))
 (type $6 (func (param i32 i32) (result i32)))
 (type $7 (func))
 (type $8 (func (result i32)))
 (type $9 (func (param i32 i32)))
 (type $10 (func (param i32) (result i32)))
 (type $11 (func (param i64) (result i64)))
 (type $12 (func (result i64)))
 (import "env" "printf" (func $fimport$0 (param i32 i32)))
 (memory $0 1)
 (data (i32.const 80) "\08\00\00\00t\00r\00u\00e")
 (data (i32.const 93) "\n\00\00\00f\00a\00l\00s\00e")
 (data (i32.const 108) "\02\00\00\000")
 (data (i32.const 115) "\02\00\00\000")
 (data (i32.const 73) "\02\00\00\00-")
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
 (export "test_getLastErrorMessage" (func $3))
 (export "test_getMaxMemory" (func $7))
 (export "isA" (func $25))
 (export "isB" (func $26))
 (export "isEnum" (func $27))
 (export "isRed" (func $28))
 (export "isColor" (func $29))
 (export "isCustom" (func $30))
 (export "testPassing" (func $31))
 (start $32)
 (func $0 (; 1 ;) (type $2) (param $0 i32) (result i64)
  (i64.or
   (call $16
    (i64.const 9)
   )
   (i64.extend_i32_u
    (local.get $0)
   )
  )
 )
 (func $1 (; 2 ;) (type $3) (param $0 i64) (result i32)
  (i64.eq
   (call $16
    (i64.const 9)
   )
   (i64.and
    (local.get $0)
    (i64.const -4294967296)
   )
  )
 )
 (func $2 (; 3 ;) (type $0) (param $0 i32)
  (local $1 i64)
  (if
   (call $17
    (local.get $0)
    (i32.const 0)
   )
   (block
    (i64.store
     (i32.wrap_i64
      (local.tee $1
       (call $0
        (call $4)
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
 (func $3 (; 4 ;) (type $5) (result i32)
  (local $0 i64)
  (block $label$1 (result i32)
   (drop
    (br_if $label$1
     (i32.const 0)
     (i32.eqz
      (call $1
       (local.tee $0
        (global.get $global$0)
       )
      )
     )
    )
   )
   (call $10
    (call $19
     (i64.load
      (i32.wrap_i64
       (local.get $0)
      )
     )
    )
    (i32.const 4)
   )
  )
 )
 (func $4 (; 5 ;) (type $8) (result i32)
  (local $0 i32)
  (local $1 i32)
  (call $6
   (local.tee $1
    (call $5
     (local.tee $0
      (call $11
       (i32.const 1)
       (i32.const 8)
      )
     )
    )
   )
   (local.get $0)
  )
  (local.get $1)
 )
 (func $5 (; 6 ;) (type $4) (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (if (result i32)
   (call $14
    (local.get $0)
    (i32.const 0)
   )
   (block (result i32)
    (if
     (call $14
      (local.get $0)
      (global.get $global$4)
     )
     (unreachable)
    )
    (if
     (call $14
      (local.tee $0
       (call $8
        (call $9
         (call $9
          (local.tee $3
           (global.get $global$7)
          )
          (local.get $0)
         )
         (global.get $global$3)
        )
        (call $12
         (global.get $global$3)
        )
       )
      )
      (call $13
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
         (call $8
          (call $9
           (call $10
            (local.get $0)
            (local.get $3)
           )
           (i32.const 65535)
          )
          (call $12
           (i32.const 65535)
          )
         )
         (i32.const 16)
        )
       )
      )
      (if
       (i32.eqz
        (call $14
         (local.get $2)
         (local.get $1)
        )
       )
       (local.set $2
        (local.get $4)
       )
      )
      (if
       (call $15
        (grow_memory
         (local.get $2)
        )
       )
       (if
        (call $15
         (grow_memory
          (local.get $1)
         )
        )
        (unreachable)
       )
      )
     )
    )
    (global.set $global$7
     (local.get $0)
    )
    (call $9
     (local.get $3)
     (i32.const 8)
    )
   )
   (block (result i32)
    (call $fimport$0
     (call $10
      (call $19
       (i64.const 16)
      )
      (i32.const 4)
     )
     (i32.const 0)
    )
    (unreachable)
   )
  )
 )
 (func $6 (; 7 ;) (type $9) (param $0 i32) (param $1 i32)
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
 (func $7 (; 8 ;) (type $5) (result i32)
  (global.get $global$7)
 )
 (func $8 (; 9 ;) (type $6) (param $0 i32) (param $1 i32) (result i32)
  (i32.and
   (local.get $0)
   (local.get $1)
  )
 )
 (func $9 (; 10 ;) (type $6) (param $0 i32) (param $1 i32) (result i32)
  (i32.add
   (local.get $0)
   (local.get $1)
  )
 )
 (func $10 (; 11 ;) (type $6) (param $0 i32) (param $1 i32) (result i32)
  (i32.sub
   (local.get $0)
   (local.get $1)
  )
 )
 (func $11 (; 12 ;) (type $6) (param $0 i32) (param $1 i32) (result i32)
  (i32.mul
   (local.get $0)
   (local.get $1)
  )
 )
 (func $12 (; 13 ;) (type $4) (param $0 i32) (result i32)
  (i32.xor
   (local.get $0)
   (i32.const -1)
  )
 )
 (func $13 (; 14 ;) (type $6) (param $0 i32) (param $1 i32) (result i32)
  (i32.shl
   (local.get $0)
   (local.get $1)
  )
 )
 (func $14 (; 15 ;) (type $6) (param $0 i32) (param $1 i32) (result i32)
  (i32.gt_s
   (local.get $0)
   (local.get $1)
  )
 )
 (func $15 (; 16 ;) (type $10) (param $0 i32) (result i32)
  (i32.lt_s
   (local.get $0)
   (i32.const 0)
  )
 )
 (func $16 (; 17 ;) (type $11) (param $0 i64) (result i64)
  (i64.shl
   (local.get $0)
   (i64.const 32)
  )
 )
 (func $17 (; 18 ;) (type $6) (param $0 i32) (param $1 i32) (result i32)
  (i32.eq
   (i32.eqz
    (local.get $0)
   )
   (i32.eqz
    (local.get $1)
   )
  )
 )
 (func $18 (; 19 ;) (type $6) (param $0 i32) (param $1 i32) (result i32)
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
 (func $19 (; 20 ;) (type $3) (param $0 i64) (result i32)
  (call $9
   (i32.wrap_i64
    (local.get $0)
   )
   (i32.const 4)
  )
 )
 (func $20 (; 21 ;) (type $3) (param $0 i64) (result i32)
  (i64.eq
   (call $16
    (i64.const 2)
   )
   (i64.and
    (local.get $0)
    (i64.const -4294967296)
   )
  )
 )
 (func $21 (; 22 ;) (type $3) (param $0 i64) (result i32)
  (i64.eq
   (call $16
    (i64.const 3)
   )
   (i64.and
    (local.get $0)
    (i64.const -4294967296)
   )
  )
 )
 (func $22 (; 23 ;) (type $3) (param $0 i64) (result i32)
  (call $18
   (call $18
    (call $18
     (call $23
      (local.get $0)
     )
     (i64.eq
      (call $16
       (i64.const 7)
      )
      (i64.and
       (local.get $0)
       (i64.const -4294967296)
      )
     )
    )
    (i64.eq
     (call $16
      (i64.const 8)
     )
     (i64.and
      (local.get $0)
      (i64.const -4294967296)
     )
    )
   )
   (call $1
    (local.get $0)
   )
  )
 )
 (func $23 (; 24 ;) (type $3) (param $0 i64) (result i32)
  (i64.eq
   (call $16
    (i64.const 6)
   )
   (i64.and
    (local.get $0)
    (i64.const -4294967296)
   )
  )
 )
 (func $24 (; 25 ;) (type $12) (result i64)
  (local $0 i64)
  (i32.store
   (i32.wrap_i64
    (local.tee $0
     (call $0
      (call $4)
     )
    )
   )
   (i32.const 1)
  )
  (local.get $0)
 )
 (func $25 (; 26 ;) (type $3) (param $0 i64) (result i32)
  (block $label$1 (result i32)
   (drop
    (br_if $label$1
     (i32.const 0)
     (i32.eqz
      (call $20
       (local.get $0)
      )
     )
    )
   )
   (i32.const 1)
  )
 )
 (func $26 (; 27 ;) (type $3) (param $0 i64) (result i32)
  (block $label$1 (result i32)
   (drop
    (br_if $label$1
     (i32.const 0)
     (i32.eqz
      (call $21
       (local.get $0)
      )
     )
    )
   )
   (i32.const 1)
  )
 )
 (func $27 (; 28 ;) (type $3) (param $0 i64) (result i32)
  (block $label$1 (result i32)
   (drop
    (br_if $label$1
     (i32.const 0)
     (i32.eqz
      (call $18
       (call $18
        (call $20
         (local.get $0)
        )
        (call $21
         (local.get $0)
        )
       )
       (i64.eq
        (call $16
         (i64.const 4)
        )
        (i64.and
         (local.get $0)
         (i64.const -4294967296)
        )
       )
      )
     )
    )
   )
   (i32.const 1)
  )
 )
 (func $28 (; 29 ;) (type $3) (param $0 i64) (result i32)
  (block $label$1 (result i32)
   (drop
    (br_if $label$1
     (i32.const 0)
     (i32.eqz
      (call $23
       (local.get $0)
      )
     )
    )
   )
   (i32.const 1)
  )
 )
 (func $29 (; 30 ;) (type $3) (param $0 i64) (result i32)
  (block $label$1 (result i32)
   (drop
    (br_if $label$1
     (i32.const 0)
     (i32.eqz
      (call $22
       (local.get $0)
      )
     )
    )
   )
   (i32.const 1)
  )
 )
 (func $30 (; 31 ;) (type $3) (param $0 i64) (result i32)
  (block $label$1 (result i32)
   (drop
    (br_if $label$1
     (i32.const 0)
     (i32.eqz
      (call $1
       (local.get $0)
      )
     )
    )
   )
   (i32.const 1)
  )
 )
 (func $31 (; 32 ;) (type $7)
  (call $2
   (call $17
    (call $25
     (call $16
      (i64.const 2)
     )
    )
    (i32.const 1)
   )
  )
  (call $2
   (call $17
    (call $27
     (call $16
      (i64.const 2)
     )
    )
    (i32.const 1)
   )
  )
  (call $2
   (call $17
    (call $26
     (call $16
      (i64.const 3)
     )
    )
    (i32.const 1)
   )
  )
  (call $2
   (call $17
    (call $25
     (call $16
      (i64.const 3)
     )
    )
    (i32.const 0)
   )
  )
  (call $2
   (call $17
    (call $27
     (call $16
      (i64.const 3)
     )
    )
    (i32.const 1)
   )
  )
  (call $2
   (call $17
    (call $26
     (call $16
      (i64.const 3)
     )
    )
    (i32.const 1)
   )
  )
  (call $2
   (call $17
    (call $25
     (call $16
      (i64.const 4)
     )
    )
    (i32.const 0)
   )
  )
  (call $2
   (call $17
    (call $27
     (call $16
      (i64.const 4)
     )
    )
    (i32.const 1)
   )
  )
  (call $2
   (call $17
    (call $26
     (call $16
      (i64.const 4)
     )
    )
    (i32.const 0)
   )
  )
  (call $2
   (call $17
    (call $25
     (global.get $global$8)
    )
    (i32.const 1)
   )
  )
  (call $2
   (call $17
    (call $26
     (global.get $global$8)
    )
    (i32.const 0)
   )
  )
  (call $2
   (call $17
    (call $27
     (global.get $global$8)
    )
    (i32.const 1)
   )
  )
  (call $2
   (call $17
    (call $25
     (global.get $global$9)
    )
    (i32.const 1)
   )
  )
  (call $2
   (call $17
    (call $26
     (global.get $global$9)
    )
    (i32.const 0)
   )
  )
  (call $2
   (call $17
    (call $27
     (global.get $global$9)
    )
    (i32.const 1)
   )
  )
  (call $2
   (call $17
    (call $25
     (global.get $global$10)
    )
    (i32.const 1)
   )
  )
  (call $2
   (call $17
    (call $26
     (global.get $global$10)
    )
    (i32.const 0)
   )
  )
  (call $2
   (call $17
    (call $27
     (global.get $global$10)
    )
    (i32.const 1)
   )
  )
  (call $2
   (call $17
    (call $28
     (global.get $global$10)
    )
    (i32.const 0)
   )
  )
  (call $2
   (call $17
    (call $28
     (call $16
      (i64.const 6)
     )
    )
    (i32.const 1)
   )
  )
  (call $2
   (call $17
    (call $29
     (call $24)
    )
    (i32.const 1)
   )
  )
  (call $2
   (call $17
    (call $30
     (call $24)
    )
    (i32.const 1)
   )
  )
  (call $2
   (call $17
    (call $28
     (call $24)
    )
    (i32.const 0)
   )
  )
  (call $2
   (call $17
    (call $26
     (call $24)
    )
    (i32.const 0)
   )
  )
 )
 (func $32 (; 33 ;) (type $7)
  (global.set $global$0
   (call $16
    (i64.const 8)
   )
  )
  (global.set $global$1
   (i32.const 3)
  )
  (global.set $global$2
   (call $13
    (i32.const 1)
    (global.get $global$1)
   )
  )
  (global.set $global$3
   (call $10
    (global.get $global$2)
    (i32.const 1)
   )
  )
  (global.set $global$4
   (call $13
    (i32.const 1)
    (i32.const 30)
   )
  )
  (global.set $global$5
   (call $11
    (i32.const 64)
    (i32.const 1024)
   )
  )
  (global.set $global$6
   (call $8
    (call $9
     (global.get $global$5)
     (global.get $global$3)
    )
    (call $12
     (global.get $global$3)
    )
   )
  )
  (global.set $global$7
   (global.get $global$6)
  )
  (global.set $global$8
   (call $16
    (i64.const 2)
   )
  )
  (global.set $global$9
   (call $16
    (i64.const 2)
   )
  )
  (global.set $global$10
   (call $16
    (i64.const 2)
   )
  )
 )
)
