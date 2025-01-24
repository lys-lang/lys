(module
 (type $0 (func))
 (type $1 (func (param i32)))
 (type $2 (func (result i32)))
 (type $3 (func (param i32 i32)))
 (type $4 (func (param i32) (result i32)))
 (type $5 (func (result i64)))
 (import "test" "pushTest" (func $fimport$0 (param i32)))
 (import "test" "registerAssertion" (func $fimport$1 (param i32 i32)))
 (import "test" "popTest" (func $fimport$2))
 (global $global$0 (mut i32) (i32.const 0))
 (global $global$1 (mut i32) (i32.const 0))
 (global $global$2 (mut i32) (i32.const 0))
 (global $global$3 (mut i64) (i64.const 0))
 (global $global$4 (mut i64) (i64.const 0))
 (global $global$5 (mut i64) (i64.const 0))
 (global $global$6 (mut i64) (i64.const 0))
 (memory $0 1)
 (data $0 (i32.const 100) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data $1 (i32.const 127) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data $2 (i32.const 160) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data $3 (i32.const 187) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data $4 (i32.const 220) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data $5 (i32.const 255) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data $6 (i32.const 296) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data $7 (i32.const 331) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data $8 (i32.const 372) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data $9 (i32.const 407) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data $10 (i32.const 448) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data $11 (i32.const 483) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data $12 (i32.const 524) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00X")
 (data $13 (i32.const 551) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00X")
 (data $14 (i32.const 584) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data $15 (i32.const 611) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data $16 (i32.const 644) "\1a\00\00\00a\00s\00s\00e\00r\00t\00(\00f\00a\00l\00s\00e\00)")
 (data $17 (i32.const 58) "\08\00\00\00t\00r\00u\00e")
 (data $18 (i32.const 71) "\n\00\00\00f\00a\00l\00s\00e")
 (data $19 (i32.const 86) "\02\00\00\000")
 (data $20 (i32.const 93) "\02\00\00\000")
 (data $21 (i32.const 16) " \00\00\00<\00e\00x\00p\00r\00>\00 \00i\00s\00 \00<\00t\00y\00p\00e\00>")
 (export "memory" (memory $0))
 (export "test_getMaxMemory" (func $0))
 (export "test_getLastErrorMessage" (func $2))
 (export "main" (func $5))
 (start $6)
 (func $0 (result i32)
  (global.get $global$2)
 )
 (func $1 (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (if
   (i32.eqz
    (local.get $0)
   )
   (then
    (unreachable)
   )
  )
  (if
   (i32.lt_u
    (global.get $global$1)
    (local.get $0)
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
        (i32.add
         (local.tee $1
          (global.get $global$2)
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
  (local.set $0
   (i32.add
    (local.get $0)
    (local.tee $1
     (local.tee $2
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
     (local.get $1)
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
  (local.get $2)
 )
 (func $2 (result i32)
  (local $0 i64)
  (if (result i32)
   (i32.eq
    (i32.wrap_i64
     (i64.shr_u
      (local.tee $0
       (global.get $global$3)
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
 (func $3 (param $0 i32)
  (local $1 i64)
  (call $fimport$1
   (local.get $0)
   (i32.const 644)
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
         (call $1
          (i32.const 8)
         )
        )
        (i64.const 12884901888)
       )
      )
     )
     (i64.const 12884902532)
    )
    (global.set $global$3
     (local.get $1)
    )
    (unreachable)
   )
  )
 )
 (func $4 (result i64)
  (local $0 i64)
  (i32.store
   (i32.wrap_i64
    (local.tee $0
     (i64.or
      (i64.extend_i32_u
       (call $1
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
 (func $5
  (local $0 i32)
  (call $fimport$0
   (i32.const 16)
  )
  (call $3
   (i32.const 1)
  )
  (call $3
   (i32.const 1)
  )
  (call $3
   (i32.const 1)
  )
  (call $3
   (i32.const 1)
  )
  (call $3
   (i32.const 1)
  )
  (call $3
   (i32.const 1)
  )
  (call $3
   (i32.const 1)
  )
  (call $3
   (i32.const 1)
  )
  (call $3
   (i32.const 1)
  )
  (call $3
   (i32.eq
    (i32.wrap_i64
     (i64.shr_u
      (global.get $global$4)
      (i64.const 32)
     )
    )
    (i32.const 1)
   )
  )
  (call $3
   (i32.ne
    (i32.wrap_i64
     (i64.shr_u
      (global.get $global$4)
      (i64.const 32)
     )
    )
    (i32.const 2)
   )
  )
  (call $3
   (i32.or
    (i32.eq
     (local.tee $0
      (i32.wrap_i64
       (i64.shr_u
        (global.get $global$4)
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
  (call $3
   (i32.eq
    (i32.wrap_i64
     (i64.shr_u
      (global.get $global$5)
      (i64.const 32)
     )
    )
    (i32.const 1)
   )
  )
  (call $3
   (i32.ne
    (i32.wrap_i64
     (i64.shr_u
      (global.get $global$5)
      (i64.const 32)
     )
    )
    (i32.const 2)
   )
  )
  (call $3
   (i32.or
    (i32.eq
     (local.tee $0
      (i32.wrap_i64
       (i64.shr_u
        (global.get $global$5)
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
  (call $3
   (i32.eq
    (i32.wrap_i64
     (i64.shr_u
      (global.get $global$6)
      (i64.const 32)
     )
    )
    (i32.const 1)
   )
  )
  (call $3
   (i32.ne
    (i32.wrap_i64
     (i64.shr_u
      (global.get $global$6)
      (i64.const 32)
     )
    )
    (i32.const 2)
   )
  )
  (call $3
   (i32.or
    (i32.eq
     (local.tee $0
      (i32.wrap_i64
       (i64.shr_u
        (global.get $global$6)
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
  (call $3
   (i32.ne
    (i32.wrap_i64
     (i64.shr_u
      (global.get $global$6)
      (i64.const 32)
     )
    )
    (i32.const 4)
   )
  )
  (call $3
   (i32.const 1)
  )
  (call $3
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
  (call $3
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
  (call $3
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
  (call $3
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
  (call $fimport$2)
 )
 (func $6
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
   (i64.const 8589934592)
  )
  (global.set $global$4
   (i64.const 4294967296)
  )
  (global.set $global$5
   (i64.const 4294967296)
  )
  (global.set $global$6
   (i64.const 4294967296)
  )
 )
)
