(module
 (type $0 (func (param i32)))
 (type $1 (func (param i32 i32)))
 (type $2 (func))
 (type $3 (func (param i64) (result i64)))
 (type $4 (func (result i32)))
 (type $5 (func (param i32) (result i32)))
 (type $6 (func (param i32 i32 i32)))
 (type $7 (func (param i32 i64)))
 (type $8 (func (param i32) (result i32)))
 (import "test" "pushTest" (func $fimport$0 (param i32)))
 (import "test" "registerAssertion" (func $fimport$1 (param i32 i32)))
 (import "test" "popTest" (func $fimport$2))
 (memory $0 1)
 (data (i32.const 774) "\08\00\00\00t\00r\00u\00e")
 (data (i32.const 787) "\n\00\00\00f\00a\00l\00s\00e")
 (data (i32.const 802) "\02\00\00\000")
 (data (i32.const 809) "\02\00\00\000")
 (data (i32.const 199) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 226) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 259) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 286) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 319) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 354) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 395) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 430) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 471) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 506) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 547) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 582) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 623) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00X")
 (data (i32.const 650) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00X")
 (data (i32.const 683) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 710) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 743) "\1a\00\00\00a\00s\00s\00e\00r\00t\00(\00f\00a\00l\00s\00e\00)")
 (data (i32.const 16) "&\00\00\00F\00o\00r\00e\00s\00t\00 \00&\00 \00T\00r\00e\00e\00 \00t\00e\00s\00t\00s")
 (data (i32.const 59) "\10\00\00\00a\00 \00i\00s\00 \00N\00i\00l")
 (data (i32.const 80) "\14\00\00\00a\00 \00i\00s\00 \00F\00o\00r\00e\00s")
 (data (i32.const 105) "\14\00\00\00b\00 \00i\00s\00 \00F\00o\00r\00e\00s")
 (data (i32.const 130) "\12\00\00\00c\00 \00i\00s\00 \00C\00o\00n\00s")
 (data (i32.const 153) "\12\00\00\00e\00 \00i\00s\00 \00N\00o\00d\00e")
 (data (i32.const 176) "\12\00\00\00e\00 \00i\00s\00 \00T\00r\00e\00e")
 (global $global$0 (mut i32) (i32.const 0))
 (global $global$1 (mut i32) (i32.const 0))
 (global $global$2 (mut i32) (i32.const 0))
 (global $global$3 (mut i32) (i32.const 0))
 (global $global$4 (mut i32) (i32.const 0))
 (global $global$5 (mut i32) (i32.const 0))
 (global $global$6 (mut i32) (i32.const 0))
 (global $global$7 (mut i64) (i64.const 0))
 (export "memory" (memory $0))
 (export "test_getMaxMemory" (func $0))
 (export "test_getLastErrorMessage" (func $4))
 (export "main" (func $8))
 (start $9)
 (func $0 (; 3 ;) (type $4) (result i32)
  (global.get $global$6)
 )
 (func $1 (; 4 ;) (type $8) (param $0 i32) (result i32)
  (local $1 i32)
  (call $3
   (local.tee $1
    (call $2
     (local.tee $0
      (i32.shl
       (local.get $0)
       (i32.const 3)
      )
     )
    )
   )
   (i32.const 0)
   (local.get $0)
  )
  (local.get $1)
 )
 (func $2 (; 5 ;) (type $5) (param $0 i32) (result i32)
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
         (i32.const 8)
         (i32.gt_u
          (local.get $0)
          (i32.const 8)
         )
        )
        (local.tee $0
         (global.get $global$6)
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
      (current_memory)
     )
     (i32.const 16)
    )
   )
   (if
    (i32.lt_u
     (grow_memory
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
      (grow_memory
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
  (local.get $0)
 )
 (func $3 (; 6 ;) (type $6) (param $0 i32) (param $1 i32) (param $2 i32)
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
 (func $4 (; 7 ;) (type $4) (result i32)
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
      (i64.const 103079215104)
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
 (func $5 (; 8 ;) (type $7) (param $0 i32) (param $1 i64)
  (call $fimport$1
   (local.get $0)
   (i32.wrap_i64
    (local.get $1)
   )
  )
 )
 (func $6 (; 9 ;) (type $3) (param $0 i64) (result i64)
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
      (i64.const 12884901888)
     )
    )
   )
   (local.get $0)
  )
  (local.get $1)
 )
 (func $7 (; 10 ;) (type $3) (param $0 i64) (result i64)
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
      (i64.const 25769803776)
     )
    )
   )
   (local.get $0)
  )
  (local.get $1)
 )
 (func $8 (; 11 ;) (type $2)
  (local $0 i64)
  (local $1 i64)
  (local $2 i64)
  (local $3 i64)
  (call $fimport$0
   (i32.const 16)
  )
  (local.set $1
   (call $7
    (i64.const 8589934592)
   )
  )
  (call $5
   (i64.eq
    (i64.and
     (block (result i64)
      (local.set $3
       (call $7
        (i64.const 21474836480)
       )
      )
      (drop
       (call $7
        (call $6
         (i64.const 8589934592)
        )
       )
      )
      (local.set $0
       (call $6
        (i64.const 21474836480)
       )
      )
      (call $5
       (i32.const 1)
       (i64.const 107374182459)
      )
      (call $5
       (i32.const 1)
       (i64.const 107374182480)
      )
      (call $5
       (i32.or
        (i32.ne
         (i64.eq
          (i64.and
           (local.get $1)
           (i64.const -4294967296)
          )
          (i64.const 21474836480)
         )
         (i32.const 0)
        )
        (i32.ne
         (i64.eq
          (i64.and
           (local.get $1)
           (i64.const -4294967296)
          )
          (i64.const 25769803776)
         )
         (i32.const 0)
        )
       )
       (i64.const 107374182505)
      )
      (local.get $3)
     )
     (i64.const -4294967296)
    )
    (i64.const 25769803776)
   )
   (i64.const 107374182530)
  )
  (call $5
   (i64.eq
    (i64.and
     (local.get $0)
     (i64.const -4294967296)
    )
    (i64.const 12884901888)
   )
   (i64.const 107374182553)
  )
  (call $5
   (i32.or
    (i32.ne
     (i64.eq
      (i64.and
       (local.get $0)
       (i64.const -4294967296)
      )
      (i64.const 8589934592)
     )
     (i32.const 0)
    )
    (i32.ne
     (i64.eq
      (i64.and
       (local.get $0)
       (i64.const -4294967296)
      )
      (i64.const 12884901888)
     )
     (i32.const 0)
    )
   )
   (i64.const 107374182576)
  )
  (call $fimport$2)
 )
 (func $9 (; 12 ;) (type $2)
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
   (i64.const 98784247808)
  )
 )
)
