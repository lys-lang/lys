(module
 (type $none_=>_none (func))
 (type $i32_=>_none (func (param i32)))
 (type $none_=>_i32 (func (result i32)))
 (type $i32_i32_=>_none (func (param i32 i32)))
 (type $i64_=>_i32 (func (param i64) (result i32)))
 (type $i64_=>_i64 (func (param i64) (result i64)))
 (import "test" "pushTest" (func $fimport$0 (param i32)))
 (import "test" "registerAssertion" (func $fimport$1 (param i32 i32)))
 (import "test" "popTest" (func $fimport$2))
 (memory $0 1)
 (data (i32.const 168) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 195) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 228) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 255) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 288) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 323) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 364) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 399) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 440) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 475) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 516) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 551) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 592) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00X")
 (data (i32.const 619) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00X")
 (data (i32.const 652) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 679) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 712) "\1a\00\00\00a\00s\00s\00e\00r\00t\00(\00f\00a\00l\00s\00e\00)")
 (data (i32.const 126) "\08\00\00\00t\00r\00u\00e")
 (data (i32.const 139) "\n\00\00\00f\00a\00l\00s\00e")
 (data (i32.const 154) "\02\00\00\000")
 (data (i32.const 161) "\02\00\00\000")
 (data (i32.const 16) "d\00\00\00p\00a\00t\00t\00e\00r\00n\00 \00m\00a\00t\00c\00h\00i\00n\00g\00 \00w\00i\00t\00h\00 \00\'\00c\00a\00s\00e\00 \00X\00 \00i\00s\00 \00<\00t\00y\00p\00e\00>\00\'\00 \00s\00e\00t\00t\00i\00n\00g\00 \00X")
 (global $global$0 (mut i32) (i32.const 0))
 (global $global$1 (mut i32) (i32.const 0))
 (global $global$2 (mut i32) (i32.const 0))
 (global $global$3 (mut i32) (i32.const 0))
 (global $global$4 (mut i64) (i64.const 0))
 (export "memory" (memory $0))
 (export "test_getMaxMemory" (func $0))
 (export "test_getLastErrorMessage" (func $3))
 (export "main" (func $7))
 (start $8)
 (func $0 (result i32)
  (global.get $global$3)
 )
 (func $1 (result i32)
  (local $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (if
   (i32.gt_u
    (i32.const 8)
    (global.get $global$1)
   )
   (unreachable)
  )
  (if
   (i32.gt_u
    (local.tee $1
     (i32.and
      (i32.add
       (global.get $global$0)
       (i32.add
        (local.tee $0
         (global.get $global$3)
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
  (global.set $global$3
   (local.get $1)
  )
  (i32.add
   (local.get $0)
   (i32.const 16)
  )
 )
 (func $2 (param $0 i32)
  (local $1 i32)
  (local.set $1
   (i32.add
    (local.get $0)
    (i32.const 8)
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
 (func $3 (result i32)
  (local $0 i64)
  (block $label$1 (result i32)
   (drop
    (br_if $label$1
     (i32.const 0)
     (i32.ne
      (i32.wrap_i64
       (i64.shr_u
        (local.tee $0
         (global.get $global$4)
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
 (func $4 (param $0 i32)
  (local $1 i64)
  (call $fimport$1
   (local.get $0)
   (i32.const 712)
  )
  (if
   (i32.eq
    (i32.eqz
     (local.get $0)
    )
    (i32.const 1)
   )
   (block
    (call $2
     (local.tee $0
      (call $1)
     )
    )
    (i64.store
     (i32.wrap_i64
      (local.tee $1
       (i64.or
        (i64.extend_i32_u
         (local.get $0)
        )
        (i64.const 12884901888)
       )
      )
     )
     (i64.const 12884902600)
    )
    (global.set $global$4
     (local.get $1)
    )
    (unreachable)
   )
  )
 )
 (func $5 (param $0 i64) (result i32)
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
 (func $6 (param $0 i64) (result i64)
  (block $label$1 (result i64)
   (if
    (i32.ne
     (i32.wrap_i64
      (i64.shr_u
       (local.get $0)
       (i64.const 32)
      )
     )
     (i32.const 4)
    )
    (block
     (drop
      (br_if $label$1
       (i64.const 17179869184)
       (i32.eqz
        (call $5
         (local.get $0)
        )
       )
      )
     )
     (br $label$1
      (select
       (i64.const 21474836480)
       (i64.const 17179869184)
       (i32.ne
        (i32.wrap_i64
         (i64.shr_u
          (local.get $0)
          (i64.const 32)
         )
        )
        (i32.const 1)
       )
      )
     )
    )
   )
   (local.get $0)
  )
 )
 (func $7
  (call $fimport$0
   (i32.const 16)
  )
  (call $4
   (i32.eq
    (i32.wrap_i64
     (i64.shr_u
      (call $6
       (i64.const 17179869184)
      )
      (i64.const 32)
     )
    )
    (i32.const 4)
   )
  )
  (call $4
   (i32.eq
    (i32.wrap_i64
     (i64.shr_u
      (call $6
       (i64.const 25769803776)
      )
      (i64.const 32)
     )
    )
    (i32.const 4)
   )
  )
  (call $4
   (i32.eq
    (i32.wrap_i64
     (i64.shr_u
      (call $6
       (i64.const 4294967296)
      )
      (i64.const 32)
     )
    )
    (i32.const 4)
   )
  )
  (call $4
   (i32.eq
    (i32.wrap_i64
     (i64.shr_u
      (call $6
       (i64.const 8589934592)
      )
      (i64.const 32)
     )
    )
    (i32.const 5)
   )
  )
  (call $4
   (i32.eq
    (i32.wrap_i64
     (i64.shr_u
      (call $6
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
 (func $8
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
   (global.get $global$2)
  )
  (global.set $global$4
   (i64.const 8589934592)
  )
 )
)
