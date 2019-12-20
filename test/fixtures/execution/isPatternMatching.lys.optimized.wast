(module
 (type $none_=>_none (func))
 (type $i64_=>_i32 (func (param i64) (result i32)))
 (type $i32_=>_none (func (param i32)))
 (type $i32_i32_=>_none (func (param i32 i32)))
 (type $none_=>_i32 (func (result i32)))
 (type $i32_=>_i32 (func (param i32) (result i32)))
 (type $none_=>_i64 (func (result i64)))
 (import "test" "pushTest" (func $fimport$0 (param i32)))
 (import "test" "registerAssertion" (func $fimport$1 (param i32 i32)))
 (import "test" "popTest" (func $fimport$2))
 (memory $0 1)
 (data (i32.const 114) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 141) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 174) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 201) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 234) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 269) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 310) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 345) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 386) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 421) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 462) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 497) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 538) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00X")
 (data (i32.const 565) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00X")
 (data (i32.const 598) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 625) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 658) "\1a\00\00\00a\00s\00s\00e\00r\00t\00(\00f\00a\00l\00s\00e\00)")
 (data (i32.const 72) "\08\00\00\00t\00r\00u\00e")
 (data (i32.const 85) "\n\00\00\00f\00a\00l\00s\00e")
 (data (i32.const 100) "\02\00\00\000")
 (data (i32.const 107) "\02\00\00\000")
 (data (i32.const 16) ".\00\00\00i\00s\00 \00w\00i\00t\00h\00 \00p\00a\00t\00t\00e\00r\00n\00 \00m\00a\00t\00c\00h\00i\00n")
 (global $global$0 (mut i32) (i32.const 0))
 (global $global$1 (mut i32) (i32.const 0))
 (global $global$2 (mut i32) (i32.const 0))
 (global $global$3 (mut i32) (i32.const 0))
 (global $global$4 (mut i32) (i32.const 0))
 (global $global$5 (mut i32) (i32.const 0))
 (global $global$6 (mut i32) (i32.const 0))
 (global $global$7 (mut i64) (i64.const 0))
 (global $global$8 (mut i64) (i64.const 0))
 (global $global$9 (mut i64) (i64.const 0))
 (global $global$10 (mut i64) (i64.const 0))
 (export "memory" (memory $0))
 (export "test_getMaxMemory" (func $0))
 (export "test_getLastErrorMessage" (func $4))
 (export "main" (func $10))
 (start $11)
 (func $0 (; 3 ;) (result i32)
  (global.get $global$6)
 )
 (func $1 (; 4 ;) (param $0 i32) (result i32)
  (local $1 i32)
  (call $3
   (local.tee $1
    (call $2
     (local.get $0)
    )
   )
   (local.get $0)
  )
  (local.get $1)
 )
 (func $2 (; 5 ;) (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (if
   (i32.eqz
    (local.get $0)
   )
   (unreachable)
  )
  (if
   (i32.gt_u
    (local.get $0)
    (global.get $global$3)
   )
   (unreachable)
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
         (local.get $0)
         (i32.const 16)
         (i32.gt_u
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
   (if
    (i32.lt_u
     (memory.grow
      (select
       (local.get $2)
       (local.tee $4
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
       )
       (i32.gt_u
        (local.get $2)
        (local.get $4)
       )
      )
     )
     (i32.const 0)
    )
    (if
     (i32.lt_u
      (memory.grow
       (local.get $3)
      )
      (i32.const 0)
     )
     (unreachable)
    )
   )
  )
  (global.set $global$6
   (local.get $0)
  )
  (i32.add
   (local.get $1)
   (i32.const 16)
  )
 )
 (func $3 (; 6 ;) (param $0 i32) (param $1 i32)
  (local.set $1
   (i32.add
    (local.get $0)
    (local.get $1)
   )
  )
  (loop $label$1
   (if
    (i32.ne
     (local.get $0)
     (local.get $1)
    )
    (block
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
     (br $label$1)
    )
   )
  )
 )
 (func $4 (; 7 ;) (result i32)
  (local $0 i64)
  (block $label$1 (result i32)
   (drop
    (br_if $label$1
     (i32.const 0)
     (i32.ne
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
 (func $5 (; 8 ;) (param $0 i32)
  (local $1 i64)
  (call $fimport$1
   (local.get $0)
   (i32.const 658)
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
         (call $1
          (i32.const 8)
         )
        )
        (i64.const 12884901888)
       )
      )
     )
     (i64.const 12884902546)
    )
    (global.set $global$7
     (local.get $1)
    )
    (unreachable)
   )
  )
 )
 (func $6 (; 9 ;) (param $0 i64) (result i32)
  (if (result i32)
   (i32.eq
    (i32.wrap_i64
     (i64.shr_u
      (local.get $0)
      (i64.const 32)
     )
    )
    (i32.const 3)
   )
   (i32.const 1)
   (i32.ne
    (if (result i32)
     (i32.eq
      (i32.wrap_i64
       (i64.shr_u
        (local.get $0)
        (i64.const 32)
       )
      )
      (i32.const 1)
     )
     (i32.const 1)
     (i32.ne
      (i32.eq
       (i32.wrap_i64
        (i64.shr_u
         (local.get $0)
         (i64.const 32)
        )
       )
       (i32.const 2)
      )
      (i32.const 0)
     )
    )
    (i32.const 0)
   )
  )
 )
 (func $7 (; 10 ;) (param $0 i64) (result i32)
  (if (result i32)
   (i32.eq
    (i32.wrap_i64
     (i64.shr_u
      (local.get $0)
      (i64.const 32)
     )
    )
    (i32.const 7)
   )
   (i32.const 1)
   (i32.ne
    (if (result i32)
     (i32.eq
      (i32.wrap_i64
       (i64.shr_u
        (local.get $0)
        (i64.const 32)
       )
      )
      (i32.const 6)
     )
     (i32.const 1)
     (i32.ne
      (if (result i32)
       (i32.eq
        (i32.wrap_i64
         (i64.shr_u
          (local.get $0)
          (i64.const 32)
         )
        )
        (i32.const 4)
       )
       (i32.const 1)
       (i32.ne
        (i32.eq
         (i32.wrap_i64
          (i64.shr_u
           (local.get $0)
           (i64.const 32)
          )
         )
         (i32.const 5)
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
 (func $8 (; 11 ;) (result i64)
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
 (func $9 (; 12 ;) (param $0 i64) (result i32)
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
 (func $10 (; 13 ;)
  (call $fimport$0
   (i32.const 16)
  )
  (call $5
   (i32.const 1)
  )
  (call $5
   (i32.eqz
    (i32.eqz
     (call $9
      (i64.const 4294967296)
     )
    )
   )
  )
  (call $5
   (i32.const 1)
  )
  (call $5
   (i32.const 1)
  )
  (call $5
   (i32.eqz
    (i32.eqz
     (call $9
      (i64.const 8589934592)
     )
    )
   )
  )
  (call $5
   (i32.const 1)
  )
  (call $5
   (i32.const 1)
  )
  (call $5
   (i32.eqz
    (i32.eqz
     (call $9
      (i64.const 12884901888)
     )
    )
   )
  )
  (call $5
   (i32.const 1)
  )
  (call $5
   (i32.eqz
    (i32.eqz
     (select
      (i32.const 0)
      (i32.const 1)
      (i32.ne
       (i32.wrap_i64
        (i64.shr_u
         (global.get $global$8)
         (i64.const 32)
        )
       )
       (i32.const 1)
      )
     )
    )
   )
  )
  (call $5
   (i32.eq
    (i32.eqz
     (select
      (i32.const 0)
      (i32.const 1)
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
    )
    (i32.const 1)
   )
  )
  (call $5
   (i32.eqz
    (i32.eqz
     (call $9
      (global.get $global$8)
     )
    )
   )
  )
  (call $5
   (i32.eqz
    (i32.eqz
     (select
      (i32.const 0)
      (i32.const 1)
      (i32.ne
       (i32.wrap_i64
        (i64.shr_u
         (global.get $global$9)
         (i64.const 32)
        )
       )
       (i32.const 1)
      )
     )
    )
   )
  )
  (call $5
   (i32.eq
    (i32.eqz
     (select
      (i32.const 0)
      (i32.const 1)
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
    )
    (i32.const 1)
   )
  )
  (call $5
   (i32.eqz
    (i32.eqz
     (call $9
      (global.get $global$9)
     )
    )
   )
  )
  (call $5
   (i32.eqz
    (i32.eqz
     (select
      (i32.const 0)
      (i32.const 1)
      (i32.ne
       (i32.wrap_i64
        (i64.shr_u
         (global.get $global$10)
         (i64.const 32)
        )
       )
       (i32.const 1)
      )
     )
    )
   )
  )
  (call $5
   (i32.eq
    (i32.eqz
     (select
      (i32.const 0)
      (i32.const 1)
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
    )
    (i32.const 1)
   )
  )
  (call $5
   (i32.eqz
    (i32.eqz
     (call $9
      (global.get $global$10)
     )
    )
   )
  )
  (call $5
   (i32.eq
    (i32.eqz
     (select
      (i32.const 0)
      (i32.const 1)
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
    )
    (i32.const 1)
   )
  )
  (call $5
   (i32.const 1)
  )
  (call $5
   (i32.eqz
    (i32.eqz
     (block $label$1 (result i32)
      (drop
       (br_if $label$1
        (i32.const 0)
        (i32.eqz
         (call $7
          (call $8)
         )
        )
       )
      )
      (i32.const 1)
     )
    )
   )
  )
  (call $5
   (i32.eqz
    (i32.eqz
     (block $label$2 (result i32)
      (drop
       (br_if $label$2
        (i32.const 0)
        (i32.ne
         (i32.wrap_i64
          (i64.shr_u
           (call $8)
           (i64.const 32)
          )
         )
         (i32.const 7)
        )
       )
      )
      (i32.const 1)
     )
    )
   )
  )
  (call $5
   (i32.eq
    (i32.eqz
     (select
      (i32.const 0)
      (i32.const 1)
      (i32.ne
       (i32.wrap_i64
        (i64.shr_u
         (call $8)
         (i64.const 32)
        )
       )
       (i32.const 4)
      )
     )
    )
    (i32.const 1)
   )
  )
  (call $5
   (i32.eq
    (i32.eqz
     (select
      (i32.const 0)
      (i32.const 1)
      (i32.ne
       (i32.wrap_i64
        (i64.shr_u
         (call $8)
         (i64.const 32)
        )
       )
       (i32.const 2)
      )
     )
    )
    (i32.const 1)
   )
  )
  (call $fimport$2)
 )
 (func $11 (; 14 ;)
  (global.set $global$0
   (i32.const 4)
  )
  (global.set $global$1
   (i32.const 16)
  )
  (global.set $global$2
   (i32.const 15)
  )
  (global.set $global$3
   (i32.const 1073741824)
  )
  (global.set $global$4
   (i32.const 65536)
  )
  (global.set $global$5
   (i32.const 65536)
  )
  (global.set $global$6
   (global.get $global$5)
  )
  (global.set $global$7
   (i64.const 8589934592)
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
