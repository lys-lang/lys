(module
 (type $none_=>_none (func))
 (type $i32_=>_none (func (param i32)))
 (type $none_=>_i32 (func (result i32)))
 (type $i32_i32_=>_none (func (param i32 i32)))
 (type $i64_i32_=>_none (func (param i64 i32)))
 (type $i64_=>_i32 (func (param i64) (result i32)))
 (type $i32_i64_=>_i64 (func (param i32 i64) (result i64)))
 (import "test" "pushTest" (func $fimport$0 (param i32)))
 (import "test" "registerAssertion" (func $fimport$1 (param i32 i32)))
 (import "test" "popTest" (func $fimport$2))
 (import "env" "printf" (func $fimport$3 (param i32 i32)))
 (memory $0 1)
 (data (i32.const 139) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 166) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 199) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 226) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 259) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 294) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 335) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 370) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 411) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 446) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 487) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 522) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 563) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00X")
 (data (i32.const 590) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00X")
 (data (i32.const 623) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 650) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 683) "\1a\00\00\00a\00s\00s\00e\00r\00t\00(\00f\00a\00l\00s\00e\00)")
 (data (i32.const 97) "\08\00\00\00t\00r\00u\00e")
 (data (i32.const 110) "\n\00\00\00f\00a\00l\00s\00e")
 (data (i32.const 125) "\02\00\00\000")
 (data (i32.const 132) "\02\00\00\000")
 (data (i32.const 16) "\1a\00\00\00T\00r\00a\00v\00e\00r\00s\00e\00 \00t\00r\00e\00e")
 (data (i32.const 47) "(\00\00\00s\00u\00m\00(\00t\00r\00e\00e\00)\00 \00r\00e\00t\00u\00r\00n\00s\00 \004\005")
 (global $global$0 (mut i64) (i64.const 0))
 (global $global$1 (mut i32) (i32.const 0))
 (global $global$2 (mut i32) (i32.const 0))
 (global $global$3 (mut i32) (i32.const 0))
 (global $global$4 (mut i32) (i32.const 0))
 (global $global$5 (mut i32) (i32.const 0))
 (global $global$6 (mut i32) (i32.const 0))
 (global $global$7 (mut i32) (i32.const 0))
 (export "memory" (memory $0))
 (export "test_getLastErrorMessage" (func $2))
 (export "test_getMaxMemory" (func $3))
 (export "main" (func $8))
 (start $9)
 (func $0 (; 4 ;) (param $0 i64) (param $1 i32)
  (call $fimport$3
   (i32.wrap_i64
    (local.get $0)
   )
   (local.get $1)
  )
 )
 (func $1 (; 5 ;) (param $0 i32)
  (call $fimport$1
   (i32.eq
    (local.get $0)
    (i32.const 45)
   )
   (i32.const 47)
  )
  (if
   (i32.ne
    (local.get $0)
    (i32.const 45)
   )
   (block
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
 )
 (func $2 (; 6 ;) (result i32)
  (local $0 i64)
  (block $label$1 (result i32)
   (drop
    (br_if $label$1
     (i32.const 0)
     (i32.ne
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
 (func $3 (; 7 ;) (result i32)
  (global.get $global$7)
 )
 (func $4 (; 8 ;) (result i32)
  (local $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (if
   (i32.gt_u
    (i32.const 20)
    (global.get $global$4)
   )
   (unreachable)
  )
  (if
   (i32.gt_u
    (local.tee $1
     (i32.and
      (i32.add
       (global.get $global$3)
       (i32.add
        (local.tee $0
         (global.get $global$7)
        )
        (i32.const 36)
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
  (global.set $global$7
   (local.get $1)
  )
  (i32.add
   (local.get $0)
   (i32.const 16)
  )
 )
 (func $5 (; 9 ;) (param $0 i32)
  (local $1 i32)
  (local.set $1
   (i32.add
    (local.get $0)
    (i32.const 20)
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
 (func $6 (; 10 ;) (param $0 i32) (param $1 i64) (result i64)
  (local $2 i32)
  (local $3 i64)
  (call $5
   (local.tee $2
    (call $4)
   )
  )
  (i32.store
   (i32.wrap_i64
    (local.tee $3
     (i64.or
      (i64.extend_i32_u
       (local.get $2)
      )
      (i64.const 4294967296)
     )
    )
   )
   (local.get $0)
  )
  (i64.store
   (i32.add
    (i32.wrap_i64
     (local.get $3)
    )
    (i32.const 4)
   )
   (local.get $1)
  )
  (i64.store
   (i32.add
    (i32.wrap_i64
     (local.get $3)
    )
    (i32.const 12)
   )
   (i64.const 8589934592)
  )
  (local.get $3)
 )
 (func $7 (; 11 ;) (param $0 i64) (result i32)
  (local $1 i32)
  (local $2 i64)
  (block $label$1 (result i32)
   (if
    (i32.ne
     (i32.wrap_i64
      (i64.shr_u
       (local.get $0)
       (i64.const 32)
      )
     )
     (i32.const 2)
    )
    (block
     (block $label$3
      (br_if $label$3
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
     )
     (local.set $1
      (i32.load
       (i32.wrap_i64
        (local.get $0)
       )
      )
     )
     (local.set $2
      (i64.load
       (i32.add
        (i32.wrap_i64
         (local.get $0)
        )
        (i32.const 12)
       )
      )
     )
     (br $label$1
      (i32.add
       (i32.add
        (call $7
         (i64.load
          (i32.add
           (i32.wrap_i64
            (local.get $0)
           )
           (i32.const 4)
          )
         )
        )
        (local.get $1)
       )
       (call $7
        (local.get $2)
       )
      )
     )
    )
   )
   (i32.const 0)
  )
 )
 (func $8 (; 12 ;)
  (call $fimport$0
   (i32.const 16)
  )
  (call $1
   (call $7
    (call $6
     (i32.const 42)
     (call $6
      (i32.const 3)
      (i64.const 8589934592)
     )
    )
   )
  )
  (call $fimport$2)
 )
 (func $9 (; 13 ;)
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
   (i32.const 15)
  )
  (global.set $global$4
   (i32.const 1073741824)
  )
  (global.set $global$5
   (i32.const 65536)
  )
  (global.set $global$6
   (i32.const 65536)
  )
  (global.set $global$7
   (global.get $global$6)
  )
 )
)
