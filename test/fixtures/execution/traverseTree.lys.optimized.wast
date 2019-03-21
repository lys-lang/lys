(module
 (type $0 (func))
 (type $1 (func (param i32)))
 (type $2 (func (param i32 i32)))
 (type $3 (func (param i64 i32)))
 (type $4 (func (param i64) (result i32)))
 (type $5 (func (param i32) (result i32)))
 (type $6 (func (result i32)))
 (type $7 (func (param i32 i32 i32)))
 (type $8 (func (param i32 i64 i64) (result i64)))
 (type $9 (func (param i32)))
 (import "test" "pushTest" (func $fimport$0 (param i32)))
 (import "test" "registerAssertion" (func $fimport$1 (param i32 i32)))
 (import "test" "popTest" (func $fimport$2))
 (import "env" "printf" (func $fimport$3 (param i32 i32)))
 (memory $0 1)
 (data (i32.const 667) "\08\00\00\00t\00r\00u\00e")
 (data (i32.const 680) "\n\00\00\00f\00a\00l\00s\00e")
 (data (i32.const 695) "\02\00\00\000")
 (data (i32.const 702) "\02\00\00\000")
 (data (i32.const 92) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 119) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 152) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 179) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 212) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 247) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 288) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 323) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 364) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 399) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 440) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 475) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 516) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00X")
 (data (i32.const 543) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00X")
 (data (i32.const 576) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 603) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 636) "\1a\00\00\00a\00s\00s\00e\00r\00t\00(\00f\00a\00l\00s\00e\00)")
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
 (func $0 (; 4 ;) (type $3) (param $0 i64) (param $1 i32)
  (call $fimport$3
   (i32.wrap_i64
    (local.get $0)
   )
   (local.get $1)
  )
 )
 (func $1 (; 5 ;) (type $9) (param $0 i32)
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
     (i64.const 576)
     (local.get $0)
    )
    (call $0
     (i64.const 603)
     (i32.const 45)
    )
   )
  )
 )
 (func $2 (; 6 ;) (type $6) (result i32)
  (local $0 i64)
  (block $label$1 (result i32)
   (drop
    (br_if $label$1
     (i32.const 0)
     (i64.ne
      (i64.and
       (local.tee $0
        (global.get $global$0)
       )
       (i64.const -4294967296)
      )
      (i64.const 38654705664)
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
 (func $3 (; 7 ;) (type $6) (result i32)
  (global.get $global$7)
 )
 (func $4 (; 8 ;) (type $5) (param $0 i32) (result i32)
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
    (global.get $global$4)
   )
   (unreachable)
  )
  (if
   (i32.gt_u
    (local.tee $0
     (i32.and
      (i32.add
       (global.get $global$3)
       (i32.add
        (local.tee $2
         (global.get $global$7)
        )
        (select
         (local.get $0)
         (i32.const 8)
         (i32.gt_u
          (local.get $0)
          (i32.const 8)
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
     (local.tee $1
      (current_memory)
     )
     (i32.const 16)
    )
   )
   (if
    (i32.lt_u
     (grow_memory
      (select
       (local.tee $3
        (local.get $1)
       )
       (local.tee $4
        (local.tee $1
         (i32.shr_s
          (i32.and
           (i32.add
            (i32.sub
             (local.get $0)
             (local.get $2)
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
        (local.get $3)
        (local.get $4)
       )
      )
     )
     (i32.const 0)
    )
    (if
     (i32.lt_u
      (grow_memory
       (local.get $1)
      )
      (i32.const 0)
     )
     (unreachable)
    )
   )
  )
  (global.set $global$7
   (local.get $0)
  )
  (local.get $2)
 )
 (func $5 (; 9 ;) (type $7) (param $0 i32) (param $1 i32) (param $2 i32)
  (local.set $2
   (i32.add
    (local.get $0)
    (local.get $2)
   )
  )
  (loop $label$1
   (if
    (i32.eqz
     (i32.eq
      (local.get $0)
      (local.get $2)
     )
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
 (func $6 (; 10 ;) (type $8) (param $0 i32) (param $1 i64) (param $2 i64) (result i64)
  (local $3 i32)
  (local $4 i64)
  (call $5
   (local.tee $3
    (call $4
     (i32.const 20)
    )
   )
   (i32.const 0)
   (i32.const 20)
  )
  (i32.store
   (i32.wrap_i64
    (local.tee $4
     (i64.or
      (i64.extend_i32_u
       (local.get $3)
      )
      (i64.const 8589934592)
     )
    )
   )
   (local.get $0)
  )
  (i64.store
   (i32.add
    (i32.wrap_i64
     (local.get $4)
    )
    (i32.const 4)
   )
   (local.get $1)
  )
  (i64.store
   (i32.add
    (i32.wrap_i64
     (local.get $4)
    )
    (i32.const 12)
   )
   (local.get $2)
  )
  (local.get $4)
 )
 (func $7 (; 11 ;) (type $4) (param $0 i64) (result i32)
  (local $1 i32)
  (local $2 i64)
  (local $3 i64)
  (block $label$1 (result i32)
   (if
    (i64.ne
     (i64.and
      (local.get $0)
      (i64.const -4294967296)
     )
     (i64.const 12884901888)
    )
    (block
     (block $label$3
      (br_if $label$3
       (i64.eq
        (i64.and
         (local.get $0)
         (i64.const -4294967296)
        )
        (i64.const 8589934592)
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
     (br $label$1
      (i32.add
       (i32.add
        (call $7
         (block (result i64)
          (local.set $3
           (i64.load
            (i32.add
             (i32.wrap_i64
              (local.get $0)
             )
             (i32.const 4)
            )
           )
          )
          (local.set $0
           (i64.load
            (i32.add
             (i32.wrap_i64
              (local.get $0)
             )
             (i32.const 12)
            )
           )
          )
          (local.get $3)
         )
        )
        (local.get $1)
       )
       (call $7
        (local.get $0)
       )
      )
     )
    )
   )
   (i32.const 0)
  )
 )
 (func $8 (; 12 ;) (type $0)
  (call $fimport$0
   (i32.const 16)
  )
  (call $1
   (call $7
    (call $6
     (i32.const 42)
     (call $6
      (i32.const 3)
      (i64.const 12884901888)
      (i64.const 12884901888)
     )
     (i64.const 12884901888)
    )
   )
  )
  (call $fimport$2)
 )
 (func $9 (; 13 ;) (type $0)
  (global.set $global$0
   (i64.const 34359738368)
  )
  (global.set $global$1
   (i32.const 3)
  )
  (global.set $global$2
   (i32.shl
    (i32.const 1)
    (global.get $global$1)
   )
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
     (global.get $global$5)
     (global.get $global$3)
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
 )
)
