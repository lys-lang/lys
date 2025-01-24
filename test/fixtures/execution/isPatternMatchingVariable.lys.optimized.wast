(module
 (type $0 (func))
 (type $1 (func (param i32)))
 (type $2 (func (result i32)))
 (type $3 (func (param i32 i32)))
 (type $4 (func (param i64) (result i64)))
 (import "test" "pushTest" (func $fimport$0 (param i32)))
 (import "test" "registerAssertion" (func $fimport$1 (param i32 i32)))
 (import "test" "popTest" (func $fimport$2))
 (global $global$0 (mut i32) (i32.const 0))
 (global $global$1 (mut i32) (i32.const 0))
 (global $global$2 (mut i32) (i32.const 0))
 (global $global$3 (mut i64) (i64.const 0))
 (memory $0 1)
 (data $0 (i32.const 168) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data $1 (i32.const 195) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data $2 (i32.const 228) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data $3 (i32.const 255) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data $4 (i32.const 288) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data $5 (i32.const 323) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data $6 (i32.const 364) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data $7 (i32.const 399) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data $8 (i32.const 440) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data $9 (i32.const 475) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data $10 (i32.const 516) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data $11 (i32.const 551) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data $12 (i32.const 592) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00X")
 (data $13 (i32.const 619) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00X")
 (data $14 (i32.const 652) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data $15 (i32.const 679) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data $16 (i32.const 712) "\1a\00\00\00a\00s\00s\00e\00r\00t\00(\00f\00a\00l\00s\00e\00)")
 (data $17 (i32.const 126) "\08\00\00\00t\00r\00u\00e")
 (data $18 (i32.const 139) "\n\00\00\00f\00a\00l\00s\00e")
 (data $19 (i32.const 154) "\02\00\00\000")
 (data $20 (i32.const 161) "\02\00\00\000")
 (data $21 (i32.const 16) "d\00\00\00p\00a\00t\00t\00e\00r\00n\00 \00m\00a\00t\00c\00h\00i\00n\00g\00 \00w\00i\00t\00h\00 \00\'\00c\00a\00s\00e\00 \00X\00 \00i\00s\00 \00<\00t\00y\00p\00e\00>\00\'\00 \00s\00e\00t\00t\00i\00n\00g\00 \00X")
 (export "memory" (memory $0))
 (export "test_getMaxMemory" (func $0))
 (export "test_getLastErrorMessage" (func $1))
 (export "main" (func $4))
 (start $5)
 (func $0 (result i32)
  (global.get $global$2)
 )
 (func $1 (result i32)
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
 (func $2 (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i64)
  (call $fimport$1
   (local.get $0)
   (i32.const 712)
  )
  (if
   (i32.eqz
    (local.get $0)
   )
   (then
    (if
     (i32.lt_u
      (global.get $global$1)
      (i32.const 8)
     )
     (then
      (unreachable)
     )
    )
    (if
     (i32.gt_u
      (local.tee $1
       (i32.and
        (i32.add
         (global.get $global$0)
         (i32.add
          (local.tee $0
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
              (local.get $1)
              (local.get $0)
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
    (global.set $global$2
     (local.get $1)
    )
    (local.set $2
     (i32.add
      (local.tee $0
       (local.tee $1
        (i32.add
         (local.get $0)
         (i32.const 16)
        )
       )
      )
      (i32.const 8)
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
    (i64.store
     (i32.wrap_i64
      (local.tee $4
       (i64.or
        (i64.extend_i32_u
         (local.get $1)
        )
        (i64.const 12884901888)
       )
      )
     )
     (i64.const 12884902600)
    )
    (global.set $global$3
     (local.get $4)
    )
    (unreachable)
   )
  )
 )
 (func $3 (param $0 i64) (result i64)
  (local $1 i32)
  (block $block (result i64)
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
     (i32.const 4)
    )
    (then
     (drop
      (br_if $block
       (i64.const 17179869184)
       (i32.eqz
        (i32.or
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
         (i32.eq
          (local.get $1)
          (i32.const 3)
         )
        )
       )
      )
     )
     (br $block
      (select
       (i64.const 21474836480)
       (i64.const 17179869184)
       (i32.ne
        (local.get $1)
        (i32.const 1)
       )
      )
     )
    )
   )
   (local.get $0)
  )
 )
 (func $4
  (call $fimport$0
   (i32.const 16)
  )
  (call $2
   (i32.eq
    (i32.wrap_i64
     (i64.shr_u
      (call $3
       (i64.const 17179869184)
      )
      (i64.const 32)
     )
    )
    (i32.const 4)
   )
  )
  (call $2
   (i32.eq
    (i32.wrap_i64
     (i64.shr_u
      (call $3
       (i64.const 25769803776)
      )
      (i64.const 32)
     )
    )
    (i32.const 4)
   )
  )
  (call $2
   (i32.eq
    (i32.wrap_i64
     (i64.shr_u
      (call $3
       (i64.const 4294967296)
      )
      (i64.const 32)
     )
    )
    (i32.const 4)
   )
  )
  (call $2
   (i32.eq
    (i32.wrap_i64
     (i64.shr_u
      (call $3
       (i64.const 8589934592)
      )
      (i64.const 32)
     )
    )
    (i32.const 5)
   )
  )
  (call $2
   (i32.eq
    (i32.wrap_i64
     (i64.shr_u
      (call $3
       (i64.const 34359738368)
      )
      (i64.const 32)
     )
    )
    (i32.const 4)
   )
  )
  (call $fimport$2)
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
  (global.set $global$3
   (i64.const 8589934592)
  )
 )
)
