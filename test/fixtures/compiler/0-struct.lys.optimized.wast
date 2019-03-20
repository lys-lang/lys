(module
 (type $0 (func))
 (type $1 (func (param i32)))
 (type $2 (func (param i32 i32)))
 (type $3 (func (param i64) (result i32)))
 (type $4 (func (param i32) (result i32)))
 (type $5 (func (result i32)))
 (type $6 (func (param i32 i32) (result i32)))
 (type $7 (func (param i32 i32 i32)))
 (type $8 (func (result i64)))
 (import "test" "registerAssertion" (func $fimport$0 (param i32 i32)))
 (memory $0 1)
 (data (i32.const 591) "\08\00\00\00t\00r\00u\00e")
 (data (i32.const 604) "\n\00\00\00f\00a\00l\00s\00e")
 (data (i32.const 619) "\02\00\00\000")
 (data (i32.const 626) "\02\00\00\000")
 (data (i32.const 16) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 43) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 76) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 103) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 136) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 171) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 212) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 247) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 288) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 323) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 364) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 399) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 440) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00X")
 (data (i32.const 467) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00X")
 (data (i32.const 500) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 527) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 560) "\1a\00\00\00a\00s\00s\00e\00r\00t\00(\00f\00a\00l\00s\00e\00)")
 (global $global$0 (mut i64) (i64.const 0))
 (global $global$1 (mut i32) (i32.const 0))
 (global $global$2 (mut i32) (i32.const 0))
 (global $global$3 (mut i32) (i32.const 0))
 (global $global$4 (mut i32) (i32.const 0))
 (global $global$5 (mut i32) (i32.const 0))
 (global $global$6 (mut i32) (i32.const 0))
 (global $global$7 (mut i32) (i32.const 0))
 (export "memory" (memory $0))
 (export "test_getLastErrorMessage" (func $0))
 (export "test_getMaxMemory" (func $2))
 (export "isRed" (func $7))
 (export "testColors" (func $8))
 (start $9)
 (func $0 (; 1 ;) (type $5) (result i32)
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
 (func $1 (; 2 ;) (type $1) (param $0 i32)
  (local $1 i64)
  (call $fimport$0
   (local.get $0)
   (i32.const 560)
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
         (call $3
          (i32.const 1)
          (i32.const 8)
         )
        )
        (i64.const 38654705664)
       )
      )
     )
     (i64.const 560)
    )
    (global.set $global$0
     (local.get $1)
    )
    (unreachable)
   )
  )
 )
 (func $2 (; 3 ;) (type $5) (result i32)
  (global.get $global$7)
 )
 (func $3 (; 4 ;) (type $6) (param $0 i32) (param $1 i32) (result i32)
  (call $5
   (local.tee $1
    (call $4
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
 (func $4 (; 5 ;) (type $4) (param $0 i32) (result i32)
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
 (func $5 (; 6 ;) (type $7) (param $0 i32) (param $1 i32) (param $2 i32)
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
 (func $6 (; 7 ;) (type $8) (result i64)
  (local $0 i64)
  (i32.store
   (i32.wrap_i64
    (local.tee $0
     (i64.or
      (i64.extend_i32_u
       (call $3
        (i32.const 1)
        (i32.const 12)
       )
      )
      (i64.const 21474836480)
     )
    )
   )
   (i32.const 5)
  )
  (i32.store
   (i32.add
    (i32.wrap_i64
     (local.get $0)
    )
    (i32.const 4)
   )
   (i32.const 5)
  )
  (i32.store
   (i32.add
    (i32.wrap_i64
     (local.get $0)
    )
    (i32.const 8)
   )
   (i32.const 5)
  )
  (local.get $0)
 )
 (func $7 (; 8 ;) (type $3) (param $0 i64) (result i32)
  (select
   (i32.const 0)
   (i32.const 1)
   (i64.ne
    (i64.and
     (local.get $0)
     (i64.const -4294967296)
    )
    (i64.const 8589934592)
   )
  )
 )
 (func $8 (; 9 ;) (type $0)
  (call $1
   (i32.const 1)
  )
  (call $1
   (i32.const 1)
  )
  (call $1
   (i32.const 1)
  )
  (call $1
   (i32.eq
    (i32.eqz
     (select
      (i32.const 0)
      (i32.const 1)
      (i64.ne
       (i64.and
        (call $6)
        (i64.const -4294967296)
       )
       (i64.const 8589934592)
      )
     )
    )
    (i32.const 1)
   )
  )
 )
 (func $9 (; 10 ;) (type $0)
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
