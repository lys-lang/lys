(module
 (type $0 (func))
 (type $1 (func (param i32 i32)))
 (type $2 (func (result i32)))
 (type $3 (func (param i32)))
 (type $4 (func (param i64 i32)))
 (type $5 (func (param i32 i64) (result i64)))
 (type $6 (func (param i64) (result i32)))
 (import "test" "pushTest" (func $fimport$0 (param i32)))
 (import "test" "registerAssertion" (func $fimport$1 (param i32 i32)))
 (import "test" "popTest" (func $fimport$2))
 (import "env" "printf" (func $fimport$3 (param i32 i32)))
 (global $global$0 (mut i64) (i64.const 0))
 (global $global$1 (mut i32) (i32.const 0))
 (global $global$2 (mut i32) (i32.const 0))
 (global $global$3 (mut i32) (i32.const 0))
 (memory $0 1)
 (data $0 (i32.const 139) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data $1 (i32.const 166) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data $2 (i32.const 199) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data $3 (i32.const 226) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data $4 (i32.const 259) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data $5 (i32.const 294) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data $6 (i32.const 335) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data $7 (i32.const 370) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data $8 (i32.const 411) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data $9 (i32.const 446) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data $10 (i32.const 487) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data $11 (i32.const 522) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data $12 (i32.const 563) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00X")
 (data $13 (i32.const 590) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00X")
 (data $14 (i32.const 623) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data $15 (i32.const 650) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data $16 (i32.const 683) "\1a\00\00\00a\00s\00s\00e\00r\00t\00(\00f\00a\00l\00s\00e\00)")
 (data $17 (i32.const 97) "\08\00\00\00t\00r\00u\00e")
 (data $18 (i32.const 110) "\n\00\00\00f\00a\00l\00s\00e")
 (data $19 (i32.const 125) "\02\00\00\000")
 (data $20 (i32.const 132) "\02\00\00\000")
 (data $21 (i32.const 16) "\1a\00\00\00T\00r\00a\00v\00e\00r\00s\00e\00 \00t\00r\00e\00e")
 (data $22 (i32.const 47) "(\00\00\00s\00u\00m\00(\00t\00r\00e\00e\00)\00 \00r\00e\00t\00u\00r\00n\00s\00 \004\005")
 (export "memory" (memory $0))
 (export "test_getLastErrorMessage" (func $1))
 (export "test_getMaxMemory" (func $2))
 (export "main" (func $5))
 (start $6)
 (func $0 (param $0 i64) (param $1 i32)
  (call $fimport$3
   (i32.wrap_i64
    (local.get $0)
   )
   (local.get $1)
  )
 )
 (func $1 (result i32)
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
 (func $2 (result i32)
  (global.get $global$3)
 )
 (func $3 (param $0 i32) (param $1 i64) (result i64)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i64)
  (if
   (i32.lt_u
    (global.get $global$2)
    (i32.const 20)
   )
   (then
    (unreachable)
   )
  )
  (if
   (i32.gt_u
    (local.tee $3
     (i32.and
      (i32.add
       (global.get $global$1)
       (i32.add
        (local.tee $2
         (global.get $global$3)
        )
        (i32.const 36)
       )
      )
      (i32.xor
       (global.get $global$1)
       (i32.const -1)
      )
     )
    )
    (i32.shl
     (local.tee $4
      (memory.size)
     )
     (i32.const 16)
    )
   )
   (then
    (drop
     (memory.grow
      (select
       (local.get $4)
       (local.tee $5
        (i32.shr_s
         (i32.and
          (i32.add
           (i32.sub
            (local.get $3)
            (local.get $2)
           )
           (i32.const 65535)
          )
          (i32.const -65536)
         )
         (i32.const 16)
        )
       )
       (i32.gt_u
        (local.get $4)
        (local.get $5)
       )
      )
     )
    )
   )
  )
  (global.set $global$3
   (local.get $3)
  )
  (local.set $4
   (i32.add
    (local.tee $2
     (local.tee $3
      (i32.add
       (local.get $2)
       (i32.const 16)
      )
     )
    )
    (i32.const 20)
   )
  )
  (loop $label
   (if
    (i32.ne
     (local.get $2)
     (local.get $4)
    )
    (then
     (i32.store8
      (local.get $2)
      (i32.load8_u
       (i32.const 0)
      )
     )
     (local.set $2
      (i32.add
       (local.get $2)
       (i32.const 1)
      )
     )
     (br $label)
    )
   )
  )
  (i32.store
   (i32.wrap_i64
    (local.tee $6
     (i64.or
      (i64.extend_i32_u
       (local.get $3)
      )
      (i64.const 4294967296)
     )
    )
   )
   (local.get $0)
  )
  (i64.store
   (i32.add
    (local.tee $0
     (i32.wrap_i64
      (local.get $6)
     )
    )
    (i32.const 4)
   )
   (local.get $1)
  )
  (i64.store
   (i32.add
    (local.get $0)
    (i32.const 12)
   )
   (i64.const 8589934592)
  )
  (local.get $6)
 )
 (func $4 (param $0 i64) (result i32)
  (local $1 i32)
  (local $2 i32)
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
     (local.set $2
      (i32.load
       (local.tee $1
        (i32.wrap_i64
         (local.get $0)
        )
       )
      )
     )
     (local.set $0
      (i64.load
       (i32.add
        (local.get $1)
        (i32.const 12)
       )
      )
     )
     (br $block1
      (i32.add
       (i32.add
        (call $4
         (i64.load
          (i32.add
           (local.get $1)
           (i32.const 4)
          )
         )
        )
        (local.get $2)
       )
       (call $4
        (local.get $0)
       )
      )
     )
    )
   )
   (i32.const 0)
  )
 )
 (func $5
  (local $0 i32)
  (call $fimport$0
   (i32.const 16)
  )
  (call $fimport$1
   (i32.eq
    (local.tee $0
     (call $4
      (call $3
       (i32.const 42)
       (call $3
        (i32.const 3)
        (i64.const 8589934592)
       )
      )
     )
    )
    (i32.const 45)
   )
   (i32.const 47)
  )
  (if
   (i32.ne
    (local.get $0)
    (i32.const 45)
   )
   (then
    (call $0
     (i64.const 12884902511)
     (local.get $0)
    )
    (call $0
     (i64.const 12884902538)
     (i32.const 45)
    )
   )
  )
  (call $fimport$2)
 )
 (func $6
  (global.set $global$0
   (i64.const 8589934592)
  )
  (global.set $global$1
   (i32.const 15)
  )
  (global.set $global$2
   (i32.const 1073741824)
  )
  (global.set $global$3
   (i32.const 65536)
  )
 )
)
