(module
 (type $0 (func))
 (type $1 (func (result i32)))
 (type $2 (func (param i64) (result i64)))
 (type $3 (func (param i32)))
 (type $4 (func (param i32 i32)))
 (type $5 (func (param i32) (result i32)))
 (type $6 (func (param i32 i64)))
 (import "test" "pushTest" (func $fimport$0 (param i32)))
 (import "test" "registerAssertion" (func $fimport$1 (param i32 i32)))
 (import "test" "popTest" (func $fimport$2))
 (global $global$0 (mut i32) (i32.const 0))
 (global $global$1 (mut i32) (i32.const 0))
 (global $global$2 (mut i32) (i32.const 0))
 (global $global$3 (mut i32) (i32.const 0))
 (global $global$4 (mut i32) (i32.const 0))
 (global $global$5 (mut i32) (i32.const 0))
 (global $global$6 (mut i32) (i32.const 0))
 (global $global$7 (mut i64) (i64.const 0))
 (memory $0 1)
 (data $0 (i32.const 246) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data $1 (i32.const 273) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data $2 (i32.const 306) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data $3 (i32.const 333) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data $4 (i32.const 366) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data $5 (i32.const 401) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data $6 (i32.const 442) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data $7 (i32.const 477) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data $8 (i32.const 518) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data $9 (i32.const 553) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data $10 (i32.const 594) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data $11 (i32.const 629) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data $12 (i32.const 670) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00X")
 (data $13 (i32.const 697) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00X")
 (data $14 (i32.const 730) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data $15 (i32.const 757) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data $16 (i32.const 790) "\1a\00\00\00a\00s\00s\00e\00r\00t\00(\00f\00a\00l\00s\00e\00)")
 (data $17 (i32.const 204) "\08\00\00\00t\00r\00u\00e")
 (data $18 (i32.const 217) "\n\00\00\00f\00a\00l\00s\00e")
 (data $19 (i32.const 232) "\02\00\00\000")
 (data $20 (i32.const 239) "\02\00\00\000")
 (data $21 (i32.const 16) "&\00\00\00F\00o\00r\00e\00s\00t\00 \00&\00 \00T\00r\00e\00e\00 \00t\00e\00s\00t\00s")
 (data $22 (i32.const 59) "\10\00\00\00a\00 \00i\00s\00 \00N\00i\00l")
 (data $23 (i32.const 80) "\14\00\00\00a\00 \00i\00s\00 \00F\00o\00r\00e\00s")
 (data $24 (i32.const 105) "\14\00\00\00b\00 \00i\00s\00 \00F\00o\00r\00e\00s")
 (data $25 (i32.const 130) "\12\00\00\00c\00 \00i\00s\00 \00C\00o\00n\00s")
 (data $26 (i32.const 153) "\12\00\00\00e\00 \00i\00s\00 \00N\00o\00d\00e")
 (data $27 (i32.const 176) "\12\00\00\00e\00 \00i\00s\00 \00T\00r\00e\00e")
 (export "memory" (memory $0))
 (export "test_getMaxMemory" (func $0))
 (export "test_getLastErrorMessage" (func $2))
 (export "main" (func $6))
 (start $7)
 (func $0 (result i32)
  (global.get $global$6)
 )
 (func $1 (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (if
   (i32.eqz
    (local.tee $0
     (local.tee $4
      (i32.shl
       (local.get $0)
       (i32.const 3)
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
 (func $2 (result i32)
  (local $0 i64)
  (if (result i32)
   (i32.eq
    (i32.wrap_i64
     (i64.shr_u
      (local.tee $0
       (global.get $global$7)
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
 (func $3 (param $0 i32) (param $1 i64)
  (call $fimport$1
   (local.get $0)
   (i32.wrap_i64
    (local.get $1)
   )
  )
 )
 (func $4 (param $0 i64) (result i64)
  (local $1 i64)
  (i64.store
   (i32.wrap_i64
    (local.tee $1
     (i64.or
      (i64.extend_i32_u
       (call $1
        (i32.const 1)
       )
      )
      (i64.const 8589934592)
     )
    )
   )
   (local.get $0)
  )
  (local.get $1)
 )
 (func $5 (param $0 i64) (result i64)
  (local $1 i64)
  (i64.store
   (i32.wrap_i64
    (local.tee $1
     (i64.or
      (i64.extend_i32_u
       (call $1
        (i32.const 1)
       )
      )
      (i64.const 17179869184)
     )
    )
   )
   (local.get $0)
  )
  (local.get $1)
 )
 (func $6
  (local $0 i32)
  (local $1 i64)
  (local $2 i64)
  (local $3 i64)
  (call $fimport$0
   (i32.const 16)
  )
  (local.set $1
   (call $5
    (i64.const 4294967296)
   )
  )
  (local.set $2
   (call $5
    (i64.const 12884901888)
   )
  )
  (drop
   (call $5
    (call $4
     (i64.const 4294967296)
    )
   )
  )
  (local.set $3
   (call $4
    (i64.const 12884901888)
   )
  )
  (call $3
   (i32.const 1)
   (i64.const 12884901947)
  )
  (call $3
   (i32.const 1)
   (i64.const 12884901968)
  )
  (call $3
   (i32.or
    (i32.eq
     (local.tee $0
      (i32.wrap_i64
       (i64.shr_u
        (local.get $1)
        (i64.const 32)
       )
      )
     )
     (i32.const 3)
    )
    (i32.eq
     (local.get $0)
     (i32.const 4)
    )
   )
   (i64.const 12884901993)
  )
  (call $3
   (i32.eq
    (i32.wrap_i64
     (i64.shr_u
      (local.get $2)
      (i64.const 32)
     )
    )
    (i32.const 4)
   )
   (i64.const 12884902018)
  )
  (call $3
   (i32.eq
    (local.tee $0
     (i32.wrap_i64
      (i64.shr_u
       (local.get $3)
       (i64.const 32)
      )
     )
    )
    (i32.const 2)
   )
   (i64.const 12884902041)
  )
  (call $3
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
   (i64.const 12884902064)
  )
  (call $fimport$2)
 )
 (func $7
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
  (global.set $global$7
   (i64.const 8589934592)
  )
 )
)
