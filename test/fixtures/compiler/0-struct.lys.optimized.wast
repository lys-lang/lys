(module
 (type $0 (func (param i32)))
 (type $1 (func (param i32 i32)))
 (type $2 (func (param i64) (result i32)))
 (type $3 (func (param i32) (result i32)))
 (type $4 (func (result i32)))
 (type $5 (func (param i32 i32) (result i32)))
 (type $6 (func))
 (type $7 (func (result i32)))
 (type $8 (func (param i32 i32)))
 (type $9 (func (param i32) (result i32)))
 (type $10 (func (param i64 i32)))
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
 (export "memory" (memory $0))
 (export "test_getLastErrorMessage" (func $1))
 (export "test_getMaxMemory" (func $5))
 (export "isRed" (func $19))
 (export "testColors" (func $20))
 (start $21)
 (func $0 (; 1 ;) (type $0) (param $0 i32)
  (local $1 i64)
  (if
   (call $16
    (local.get $0)
    (i32.const 0)
   )
   (block
    (local.set $0
     (call $2)
    )
    (i64.store
     (i32.wrap_i64
      (local.tee $1
       (i64.or
        (call $15
         (i64.const 9)
        )
        (i64.extend_i32_u
         (local.get $0)
        )
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
 (func $1 (; 2 ;) (type $4) (result i32)
  (local $0 i64)
  (block $label$1 (result i32)
   (local.set $0
    (global.get $global$0)
   )
   (drop
    (br_if $label$1
     (i32.const 0)
     (i64.ne
      (call $15
       (i64.const 9)
      )
      (i64.and
       (local.get $0)
       (i64.const -4294967296)
      )
     )
    )
   )
   (call $8
    (call $17
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
 (func $2 (; 3 ;) (type $7) (result i32)
  (local $0 i32)
  (local $1 i32)
  (call $4
   (local.tee $1
    (call $3
     (local.tee $0
      (call $9
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
 (func $3 (; 4 ;) (type $3) (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (if (result i32)
   (call $12
    (local.get $0)
    (i32.const 0)
   )
   (block (result i32)
    (if
     (call $12
      (local.get $0)
      (global.get $global$4)
     )
     (unreachable)
    )
    (if
     (call $12
      (local.tee $0
       (call $6
        (call $7
         (call $7
          (local.tee $3
           (global.get $global$7)
          )
          (local.get $0)
         )
         (global.get $global$3)
        )
        (call $10
         (global.get $global$3)
        )
       )
      )
      (call $11
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
         (call $6
          (call $7
           (call $8
            (local.get $0)
            (local.get $3)
           )
           (i32.const 65535)
          )
          (call $10
           (i32.const 65535)
          )
         )
         (i32.const 16)
        )
       )
      )
      (if
       (i32.eqz
        (call $12
         (local.get $2)
         (local.get $1)
        )
       )
       (local.set $2
        (local.get $4)
       )
      )
      (if
       (call $13
        (grow_memory
         (local.get $2)
        )
       )
       (if
        (call $13
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
    (call $7
     (local.get $3)
     (i32.const 8)
    )
   )
   (block (result i32)
    (call $fimport$0
     (call $8
      (call $17
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
 (func $4 (; 5 ;) (type $8) (param $0 i32) (param $1 i32)
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
 (func $5 (; 6 ;) (type $4) (result i32)
  (global.get $global$7)
 )
 (func $6 (; 7 ;) (type $5) (param $0 i32) (param $1 i32) (result i32)
  (i32.and
   (local.get $0)
   (local.get $1)
  )
 )
 (func $7 (; 8 ;) (type $5) (param $0 i32) (param $1 i32) (result i32)
  (i32.add
   (local.get $0)
   (local.get $1)
  )
 )
 (func $8 (; 9 ;) (type $5) (param $0 i32) (param $1 i32) (result i32)
  (i32.sub
   (local.get $0)
   (local.get $1)
  )
 )
 (func $9 (; 10 ;) (type $5) (param $0 i32) (param $1 i32) (result i32)
  (i32.mul
   (local.get $0)
   (local.get $1)
  )
 )
 (func $10 (; 11 ;) (type $3) (param $0 i32) (result i32)
  (i32.xor
   (local.get $0)
   (i32.const -1)
  )
 )
 (func $11 (; 12 ;) (type $5) (param $0 i32) (param $1 i32) (result i32)
  (i32.shl
   (local.get $0)
   (local.get $1)
  )
 )
 (func $12 (; 13 ;) (type $5) (param $0 i32) (param $1 i32) (result i32)
  (i32.gt_s
   (local.get $0)
   (local.get $1)
  )
 )
 (func $13 (; 14 ;) (type $9) (param $0 i32) (result i32)
  (i32.lt_s
   (local.get $0)
   (i32.const 0)
  )
 )
 (func $14 (; 15 ;) (type $10) (param $0 i64) (param $1 i32)
  (i32.store
   (i32.add
    (i32.wrap_i64
     (local.get $0)
    )
    (local.get $1)
   )
   (i32.const 5)
  )
 )
 (func $15 (; 16 ;) (type $11) (param $0 i64) (result i64)
  (i64.shl
   (local.get $0)
   (i64.const 32)
  )
 )
 (func $16 (; 17 ;) (type $5) (param $0 i32) (param $1 i32) (result i32)
  (i32.eq
   (i32.eqz
    (local.get $0)
   )
   (i32.eqz
    (local.get $1)
   )
  )
 )
 (func $17 (; 18 ;) (type $2) (param $0 i64) (result i32)
  (call $7
   (i32.wrap_i64
    (local.get $0)
   )
   (i32.const 4)
  )
 )
 (func $18 (; 19 ;) (type $12) (result i64)
  (local $0 i32)
  (local $1 i64)
  (local.set $0
   (call $2)
  )
  (call $14
   (local.tee $1
    (i64.or
     (call $15
      (i64.const 5)
     )
     (i64.extend_i32_u
      (local.get $0)
     )
    )
   )
   (i32.const 0)
  )
  (call $14
   (local.get $1)
   (i32.const 4)
  )
  (call $14
   (local.get $1)
   (i32.const 8)
  )
  (local.get $1)
 )
 (func $19 (; 20 ;) (type $2) (param $0 i64) (result i32)
  (block $label$1 (result i32)
   (drop
    (br_if $label$1
     (i32.const 0)
     (i64.ne
      (call $15
       (i64.const 2)
      )
      (i64.and
       (local.get $0)
       (i64.const -4294967296)
      )
     )
    )
   )
   (i32.const 1)
  )
 )
 (func $20 (; 21 ;) (type $6)
  (call $0
   (call $16
    (call $19
     (call $15
      (i64.const 2)
     )
    )
    (i32.const 1)
   )
  )
  (call $0
   (call $16
    (call $19
     (call $15
      (i64.const 3)
     )
    )
    (i32.const 0)
   )
  )
  (call $0
   (call $16
    (call $19
     (call $15
      (i64.const 4)
     )
    )
    (i32.const 0)
   )
  )
  (call $0
   (call $16
    (call $19
     (call $18)
    )
    (i32.const 0)
   )
  )
 )
 (func $21 (; 22 ;) (type $6)
  (global.set $global$0
   (call $15
    (i64.const 8)
   )
  )
  (global.set $global$1
   (i32.const 3)
  )
  (global.set $global$2
   (call $11
    (i32.const 1)
    (global.get $global$1)
   )
  )
  (global.set $global$3
   (call $8
    (global.get $global$2)
    (i32.const 1)
   )
  )
  (global.set $global$4
   (call $11
    (i32.const 1)
    (i32.const 30)
   )
  )
  (global.set $global$5
   (call $9
    (i32.const 64)
    (i32.const 1024)
   )
  )
  (global.set $global$6
   (call $6
    (call $7
     (global.get $global$5)
     (global.get $global$3)
    )
    (call $10
     (global.get $global$3)
    )
   )
  )
  (global.set $global$7
   (global.get $global$6)
  )
 )
)
