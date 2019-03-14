(module
 (type $0 (func (param i32)))
 (type $1 (func (param i32 i32)))
 (type $2 (func))
 (type $3 (func (param i64 i32)))
 (type $4 (func (param i64) (result i64)))
 (type $5 (func (result i32)))
 (type $6 (func (param i32) (result i32)))
 (type $7 (func (param i32 i32) (result i32)))
 (type $8 (func (param i32 i32 i32)))
 (type $9 (func (param i32)))
 (type $10 (func (result i64)))
 (type $11 (func (result i32)))
 (import "test" "pushTest" (func $fimport$0 (param i32)))
 (import "test" "registerAssertion" (func $fimport$1 (param i32 i32)))
 (import "test" "popTest" (func $fimport$2))
 (import "env" "printf" (func $fimport$3 (param i32 i32)))
 (memory $0 1)
 (data (i32.const 525) "\08\00\00\00t\00r\00u\00e")
 (data (i32.const 538) "\n\00\00\00f\00a\00l\00s\00e")
 (data (i32.const 553) "\02\00\00\000")
 (data (i32.const 560) "\02\00\00\000")
 (data (i32.const 74) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 101) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 134) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 161) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 194) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 221) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 254) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 281) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 314) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 341) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 374) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 401) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 434) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 461) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 494) "\1a\00\00\00a\00s\00s\00e\00r\00t\00(\00f\00a\00l\00s\00e\00)")
 (data (i32.const 16) "\1a\00\00\00I\00t\00e\00r\00a\00t\00o\00r\00 \00t\00e\00s\00t")
 (data (i32.const 47) "\16\00\00\00s\00p\00e\00c\00 \00t\00e\00s\00t\00 \001")
 (global $global$0 (mut i32) (i32.const 0))
 (global $global$1 (mut i32) (i32.const 0))
 (global $global$2 (mut i32) (i32.const 0))
 (global $global$3 (mut i32) (i32.const 0))
 (global $global$4 (mut i32) (i32.const 0))
 (global $global$5 (mut i32) (i32.const 0))
 (global $global$6 (mut i32) (i32.const 0))
 (global $global$7 (mut i64) (i64.const 0))
 (export "memory" (memory $0))
 (export "test_getMaxMemory" (func $1))
 (export "test_getLastErrorMessage" (func $6))
 (export "main" (func $10))
 (start $11)
 (func $0 (; 4 ;) (type $3) (param $0 i64) (param $1 i32)
  (call $fimport$3
   (i32.wrap_i64
    (local.get $0)
   )
   (local.get $1)
  )
 )
 (func $1 (; 5 ;) (type $5) (result i32)
  (global.get $global$6)
 )
 (func $2 (; 6 ;) (type $7) (param $0 i32) (param $1 i32) (result i32)
  (call $4
   (local.tee $1
    (call $3
     (local.tee $0
      (i32.mul
       (local.get $0)
       (local.get $1)
      )
     )
    )
   )
   (i32.const 0)
   (local.get $0)
  )
  (local.get $1)
 )
 (func $3 (; 7 ;) (type $6) (param $0 i32) (result i32)
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
        (local.tee $2
         (global.get $global$6)
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
       (global.get $global$2)
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
  (global.set $global$6
   (local.get $0)
  )
  (local.get $2)
 )
 (func $4 (; 8 ;) (type $8) (param $0 i32) (param $1 i32) (param $2 i32)
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
 (func $5 (; 9 ;) (type $9) (param $0 i32)
  (call $fimport$1
   (i32.eq
    (local.get $0)
    (i32.const 55)
   )
   (i32.const 47)
  )
  (if
   (i32.ne
    (local.get $0)
    (i32.const 55)
   )
   (block
    (call $0
     (i64.const 254)
     (local.get $0)
    )
    (call $0
     (i64.const 281)
     (i32.const 55)
    )
   )
  )
 )
 (func $6 (; 10 ;) (type $5) (result i32)
  (local $0 i64)
  (block $label$1 (result i32)
   (drop
    (br_if $label$1
     (i32.const 0)
     (i64.ne
      (i64.and
       (local.tee $0
        (global.get $global$7)
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
 (func $7 (; 11 ;) (type $10) (result i64)
  (local $0 i64)
  (i32.store
   (i32.wrap_i64
    (local.tee $0
     (i64.or
      (i64.extend_i32_u
       (call $2
        (i32.const 1)
        (i32.const 8)
       )
      )
      (i64.const 4294967296)
     )
    )
   )
   (i32.const 1)
  )
  (i32.store
   (i32.add
    (i32.wrap_i64
     (local.get $0)
    )
    (i32.const 4)
   )
   (i32.const 10)
  )
  (local.get $0)
 )
 (func $8 (; 12 ;) (type $4) (param $0 i64) (result i64)
  (local $1 i32)
  (local $2 i64)
  (if (result i64)
   (i32.le_s
    (i32.load
     (i32.wrap_i64
      (local.get $0)
     )
    )
    (i32.load
     (i32.add
      (i32.wrap_i64
       (local.get $0)
      )
      (i32.const 4)
     )
    )
   )
   (block (result i64)
    (local.set $1
     (i32.load
      (i32.wrap_i64
       (local.get $0)
      )
     )
    )
    (i32.store
     (i32.wrap_i64
      (local.tee $2
       (i64.or
        (i64.extend_i32_u
         (call $2
          (i32.const 1)
          (i32.const 4)
         )
        )
        (i64.const 17179869184)
       )
      )
     )
     (local.get $1)
    )
    (i32.store
     (i32.wrap_i64
      (local.get $0)
     )
     (i32.add
      (i32.load
       (i32.wrap_i64
        (local.get $0)
       )
      )
      (i32.const 1)
     )
    )
    (local.get $2)
   )
   (i64.const 12884901888)
  )
 )
 (func $9 (; 13 ;) (type $11) (result i32)
  (local $0 i32)
  (local $1 i64)
  (local $2 i64)
  (local.set $1
   (call $7)
  )
  (loop $label$1
   (if
    (i64.eq
     (i64.and
      (local.tee $2
       (call $8
        (local.get $1)
       )
      )
      (i64.const -4294967296)
     )
     (i64.const 17179869184)
    )
    (block
     (local.set $0
      (i32.add
       (local.get $0)
       (i32.load
        (i32.wrap_i64
         (local.get $2)
        )
       )
      )
     )
     (br $label$1)
    )
   )
  )
  (local.get $0)
 )
 (func $10 (; 14 ;) (type $2)
  (call $fimport$0
   (i32.const 16)
  )
  (call $5
   (call $9)
  )
  (call $fimport$2)
 )
 (func $11 (; 15 ;) (type $2)
  (global.set $global$0
   (i32.const 3)
  )
  (global.set $global$1
   (i32.shl
    (i32.const 1)
    (global.get $global$0)
   )
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
     (global.get $global$4)
     (global.get $global$2)
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
   (i64.const 34359738368)
  )
 )
)
