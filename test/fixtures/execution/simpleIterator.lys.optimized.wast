(module
 (type $0 (func (param i32)))
 (type $1 (func (param i32 i32)))
 (type $2 (func))
 (type $3 (func (param i64 i32)))
 (type $4 (func (result i32)))
 (type $5 (func (param i32) (result i32)))
 (type $6 (func (param i32 i32) (result i32)))
 (type $7 (func (param i32 i32 i32)))
 (type $8 (func (param i64) (result i64)))
 (type $9 (func (param i32)))
 (type $10 (func (result i64)))
 (type $11 (func (result i32)))
 (import "test" "pushTest" (func $fimport$0 (param i32)))
 (import "test" "registerAssertion" (func $fimport$1 (param i32 i32)))
 (import "test" "popTest" (func $fimport$2))
 (import "env" "printf" (func $fimport$3 (param i32 i32)))
 (memory $0 1)
 (data (i32.const 121) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 148) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 181) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 208) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 241) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 276) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 317) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 352) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 393) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 428) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 469) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 504) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 545) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00X")
 (data (i32.const 572) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00X")
 (data (i32.const 605) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 632) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 665) "\1a\00\00\00a\00s\00s\00e\00r\00t\00(\00f\00a\00l\00s\00e\00)")
 (data (i32.const 79) "\08\00\00\00t\00r\00u\00e")
 (data (i32.const 92) "\n\00\00\00f\00a\00l\00s\00e")
 (data (i32.const 107) "\02\00\00\000")
 (data (i32.const 114) "\02\00\00\000")
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
 (func $1 (; 5 ;) (type $4) (result i32)
  (global.get $global$6)
 )
 (func $2 (; 6 ;) (type $6) (param $0 i32) (param $1 i32) (result i32)
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
 (func $3 (; 7 ;) (type $5) (param $0 i32) (result i32)
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
    (local.tee $1
     (i32.and
      (i32.add
       (global.get $global$2)
       (i32.add
        (select
         (local.get $0)
         (i32.const 16)
         (i32.gt_u
          (local.get $0)
          (i32.const 16)
         )
        )
        (i32.add
         (local.tee $0
          (global.get $global$6)
         )
         (i32.const 16)
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
  (global.set $global$6
   (local.get $1)
  )
  (i32.add
   (local.get $0)
   (i32.const 16)
  )
 )
 (func $4 (; 8 ;) (type $7) (param $0 i32) (param $1 i32) (param $2 i32)
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
     (i64.const 12884902493)
     (local.get $0)
    )
    (call $0
     (i64.const 12884902520)
     (i32.const 55)
    )
   )
  )
 )
 (func $6 (; 10 ;) (type $4) (result i32)
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
 (func $8 (; 12 ;) (type $8) (param $0 i64) (result i64)
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
        (i64.const 12884901888)
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
   (i64.const 8589934592)
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
    (i32.eq
     (i32.wrap_i64
      (i64.shr_u
       (local.tee $2
        (call $8
         (local.get $1)
        )
       )
       (i64.const 32)
      )
     )
     (i32.const 3)
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
   (i32.const 4)
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
   (i64.const 8589934592)
  )
 )
)
