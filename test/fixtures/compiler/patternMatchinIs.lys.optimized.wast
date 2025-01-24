(module
 (type $0 (func (param i64) (result i32)))
 (type $1 (func (result i32)))
 (type $2 (func))
 (type $3 (func (param i32 i32)))
 (type $4 (func (param i32)))
 (type $5 (func (param i32 i32) (result i32)))
 (type $6 (func (result i64)))
 (import "test" "registerAssertion" (func $fimport$0 (param i32 i32)))
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
 (memory $0 1)
 (data $0 (i32.const 63) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data $1 (i32.const 90) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data $2 (i32.const 123) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data $3 (i32.const 150) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data $4 (i32.const 183) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data $5 (i32.const 218) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data $6 (i32.const 259) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data $7 (i32.const 294) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data $8 (i32.const 335) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data $9 (i32.const 370) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data $10 (i32.const 411) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data $11 (i32.const 446) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data $12 (i32.const 487) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00X")
 (data $13 (i32.const 514) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00X")
 (data $14 (i32.const 547) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data $15 (i32.const 574) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data $16 (i32.const 607) "\1a\00\00\00a\00s\00s\00e\00r\00t\00(\00f\00a\00l\00s\00e\00)")
 (data $17 (i32.const 21) "\08\00\00\00t\00r\00u\00e")
 (data $18 (i32.const 34) "\n\00\00\00f\00a\00l\00s\00e")
 (data $19 (i32.const 49) "\02\00\00\000")
 (data $20 (i32.const 56) "\02\00\00\000")
 (export "memory" (memory $0))
 (export "test_getLastErrorMessage" (func $0))
 (export "test_getMaxMemory" (func $2))
 (export "isA" (func $5))
 (export "isB" (func $6))
 (export "isEnum" (func $7))
 (export "isRed" (func $8))
 (export "isColor" (func $9))
 (export "isCustom" (func $10))
 (export "testPassing" (func $11))
 (start $12)
 (func $0 (result i32)
  (local $0 i64)
  (if (result i32)
   (i32.eq
    (i32.wrap_i64
     (i64.shr_u
      (local.tee $0
       (global.get $global$0)
      )
      (i64.const 32)
     )
    )
    (i32.const 3)
   )
   (then
    (i32.wrap_i64
     (i64.load
      (i32.wrap_i64
       (local.get $0)
      )
     )
    )
   )
   (else
    (i32.const 0)
   )
  )
 )
 (func $1 (param $0 i32)
  (local $1 i64)
  (call $fimport$0
   (local.get $0)
   (i32.const 607)
  )
  (if
   (i32.eqz
    (local.get $0)
   )
   (then
    (i64.store
     (i32.wrap_i64
      (local.tee $1
       (i64.or
        (i64.extend_i32_u
         (call $3
          (i32.const 1)
          (i32.const 8)
         )
        )
        (i64.const 12884901888)
       )
      )
     )
     (i64.const 12884902495)
    )
    (global.set $global$0
     (local.get $1)
    )
    (unreachable)
   )
  )
 )
 (func $2 (result i32)
  (global.get $global$7)
 )
 (func $3 (param $0 i32) (param $1 i32) (result i32)
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
    (global.get $global$4)
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
       (global.get $global$3)
       (i32.add
        (i32.add
         (local.tee $1
          (global.get $global$7)
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
       (global.get $global$3)
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
  (global.set $global$7
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
 (func $4 (result i64)
  (local $0 i64)
  (i32.store
   (i32.wrap_i64
    (local.tee $0
     (i64.or
      (i64.extend_i32_u
       (call $3
        (i32.const 1)
        (i32.const 4)
       )
      )
      (i64.const 30064771072)
     )
    )
   )
   (i32.const 1)
  )
  (local.get $0)
 )
 (func $5 (param $0 i64) (result i32)
  (i32.eq
   (i32.wrap_i64
    (i64.shr_u
     (local.get $0)
     (i64.const 32)
    )
   )
   (i32.const 1)
  )
 )
 (func $6 (param $0 i64) (result i32)
  (i32.eq
   (i32.wrap_i64
    (i64.shr_u
     (local.get $0)
     (i64.const 32)
    )
   )
   (i32.const 2)
  )
 )
 (func $7 (param $0 i64) (result i32)
  (local $1 i32)
  (i32.or
   (i32.eq
    (local.tee $1
     (i32.wrap_i64
      (i64.shr_u
       (local.get $0)
       (i64.const 32)
      )
     )
    )
    (i32.const 3)
   )
   (i32.or
    (i32.eq
     (local.get $1)
     (i32.const 1)
    )
    (i32.eq
     (local.get $1)
     (i32.const 2)
    )
   )
  )
 )
 (func $8 (param $0 i64) (result i32)
  (i32.eq
   (i32.wrap_i64
    (i64.shr_u
     (local.get $0)
     (i64.const 32)
    )
   )
   (i32.const 4)
  )
 )
 (func $9 (param $0 i64) (result i32)
  (local $1 i32)
  (i32.or
   (i32.eq
    (local.tee $1
     (i32.wrap_i64
      (i64.shr_u
       (local.get $0)
       (i64.const 32)
      )
     )
    )
    (i32.const 7)
   )
   (i32.or
    (i32.or
     (i32.eq
      (local.get $1)
      (i32.const 4)
     )
     (i32.eq
      (local.get $1)
      (i32.const 5)
     )
    )
    (i32.eq
     (local.get $1)
     (i32.const 6)
    )
   )
  )
 )
 (func $10 (param $0 i64) (result i32)
  (i32.eq
   (i32.wrap_i64
    (i64.shr_u
     (local.get $0)
     (i64.const 32)
    )
   )
   (i32.const 7)
  )
 )
 (func $11
  (local $0 i32)
  (call $1
   (i32.const 1)
  )
  (call $1
   (i32.const 1)
  )
  (call $1
   (i32.const 1)
  )
  (call $1
   (i32.const 1)
  )
  (call $1
   (i32.const 1)
  )
  (call $1
   (i32.const 1)
  )
  (call $1
   (i32.const 1)
  )
  (call $1
   (i32.const 1)
  )
  (call $1
   (i32.const 1)
  )
  (call $1
   (i32.eq
    (i32.wrap_i64
     (i64.shr_u
      (global.get $global$8)
      (i64.const 32)
     )
    )
    (i32.const 1)
   )
  )
  (call $1
   (i32.ne
    (i32.wrap_i64
     (i64.shr_u
      (global.get $global$8)
      (i64.const 32)
     )
    )
    (i32.const 2)
   )
  )
  (call $1
   (i32.or
    (i32.eq
     (local.tee $0
      (i32.wrap_i64
       (i64.shr_u
        (global.get $global$8)
        (i64.const 32)
       )
      )
     )
     (i32.const 3)
    )
    (i32.or
     (i32.eq
      (local.get $0)
      (i32.const 1)
     )
     (i32.eq
      (local.get $0)
      (i32.const 2)
     )
    )
   )
  )
  (call $1
   (i32.eq
    (i32.wrap_i64
     (i64.shr_u
      (global.get $global$9)
      (i64.const 32)
     )
    )
    (i32.const 1)
   )
  )
  (call $1
   (i32.ne
    (i32.wrap_i64
     (i64.shr_u
      (global.get $global$9)
      (i64.const 32)
     )
    )
    (i32.const 2)
   )
  )
  (call $1
   (i32.or
    (i32.eq
     (local.tee $0
      (i32.wrap_i64
       (i64.shr_u
        (global.get $global$9)
        (i64.const 32)
       )
      )
     )
     (i32.const 3)
    )
    (i32.or
     (i32.eq
      (local.get $0)
      (i32.const 1)
     )
     (i32.eq
      (local.get $0)
      (i32.const 2)
     )
    )
   )
  )
  (call $1
   (i32.eq
    (i32.wrap_i64
     (i64.shr_u
      (global.get $global$10)
      (i64.const 32)
     )
    )
    (i32.const 1)
   )
  )
  (call $1
   (i32.ne
    (i32.wrap_i64
     (i64.shr_u
      (global.get $global$10)
      (i64.const 32)
     )
    )
    (i32.const 2)
   )
  )
  (call $1
   (i32.or
    (i32.eq
     (local.tee $0
      (i32.wrap_i64
       (i64.shr_u
        (global.get $global$10)
        (i64.const 32)
       )
      )
     )
     (i32.const 3)
    )
    (i32.or
     (i32.eq
      (local.get $0)
      (i32.const 1)
     )
     (i32.eq
      (local.get $0)
      (i32.const 2)
     )
    )
   )
  )
  (call $1
   (i32.ne
    (i32.wrap_i64
     (i64.shr_u
      (global.get $global$10)
      (i64.const 32)
     )
    )
    (i32.const 4)
   )
  )
  (call $1
   (i32.const 1)
  )
  (call $1
   (i32.or
    (i32.eq
     (local.tee $0
      (i32.wrap_i64
       (i64.shr_u
        (call $4)
        (i64.const 32)
       )
      )
     )
     (i32.const 7)
    )
    (i32.or
     (i32.or
      (i32.eq
       (local.get $0)
       (i32.const 4)
      )
      (i32.eq
       (local.get $0)
       (i32.const 5)
      )
     )
     (i32.eq
      (local.get $0)
      (i32.const 6)
     )
    )
   )
  )
  (call $1
   (i32.eq
    (i32.wrap_i64
     (i64.shr_u
      (call $4)
      (i64.const 32)
     )
    )
    (i32.const 7)
   )
  )
  (call $1
   (i32.ne
    (i32.wrap_i64
     (i64.shr_u
      (call $4)
      (i64.const 32)
     )
    )
    (i32.const 4)
   )
  )
  (call $1
   (i32.ne
    (i32.wrap_i64
     (i64.shr_u
      (call $4)
      (i64.const 32)
     )
    )
    (i32.const 2)
   )
  )
 )
 (func $12
  (global.set $global$0
   (i64.const 8589934592)
  )
  (global.set $global$1
   (i32.const 4)
  )
  (global.set $global$2
   (i32.const 16)
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
     (global.get $global$3)
     (i32.const 65536)
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
   (i64.const 4294967296)
  )
  (global.set $global$9
   (i64.const 4294967296)
  )
  (global.set $global$10
   (i64.const 4294967296)
  )
 )
)
