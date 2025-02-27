(module
 (type $0 (func))
 (type $1 (func (result i32)))
 (type $2 (func (param i32)))
 (type $3 (func (param i32 i32)))
 (type $4 (func (param i32 i32 i64)))
 (type $5 (func (param i32 i32 i32) (result i64)))
 (type $6 (func (param i64) (result i32)))
 (import "test" "pushTest" (func $fimport$0 (param i32)))
 (import "test" "registerAssertion" (func $fimport$1 (param i32 i32)))
 (import "test" "popTest" (func $fimport$2))
 (global $global$0 (mut i32) (i32.const 0))
 (global $global$1 (mut i32) (i32.const 0))
 (global $global$2 (mut i32) (i32.const 0))
 (global $global$3 (mut i32) (i32.const 0))
 (global $global$4 (mut i32) (i32.const 0))
 (global $global$5 (mut i32) (i32.const 0))
 (global $global$6 (mut i32) (i32.const 0))
 (global $global$7 (mut i64) (i64.const 0))
 (memory $0 1)
 (data $0 (i32.const 358) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data $1 (i32.const 385) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data $2 (i32.const 418) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data $3 (i32.const 445) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data $4 (i32.const 478) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data $5 (i32.const 513) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data $6 (i32.const 554) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data $7 (i32.const 589) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data $8 (i32.const 630) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data $9 (i32.const 665) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data $10 (i32.const 706) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data $11 (i32.const 741) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data $12 (i32.const 782) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00X")
 (data $13 (i32.const 809) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00X")
 (data $14 (i32.const 842) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data $15 (i32.const 869) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data $16 (i32.const 902) "\1a\00\00\00a\00s\00s\00e\00r\00t\00(\00f\00a\00l\00s\00e\00)")
 (data $17 (i32.const 316) "\08\00\00\00t\00r\00u\00e")
 (data $18 (i32.const 329) "\n\00\00\00f\00a\00l\00s\00e")
 (data $19 (i32.const 344) "\02\00\00\000")
 (data $20 (i32.const 351) "\02\00\00\000")
 (data $21 (i32.const 16) "B\00\00\00p\00a\00t\00t\00e\00r\00n\00 \00m\00a\00t\00c\00h\00i\00n\00g\00 \00w\00i\00t\00h\00 \00d\00e\00c\00o\00n\00s\00t\00r\00u\00c\00t")
 (data $22 (i32.const 87) "\14\00\00\00i\00s\00R\00e\00d\00(\00R\00e\00d\00)")
 (data $23 (i32.const 112) "\18\00\00\00i\00s\00R\00e\00d\00(\00G\00r\00e\00e\00n\00)")
 (data $24 (i32.const 141) "\16\00\00\00i\00s\00R\00e\00d\00(\00B\00l\00u\00e\00)")
 (data $25 (i32.const 168) ",\00\00\00i\00s\00R\00e\00d\00(\00C\00u\00s\00t\00o\00m\00(\002\005\005\00,\000\00,\000\00)\00)")
 (data $26 (i32.const 217) "(\00\00\00i\00s\00R\00e\00d\00(\00C\00u\00s\00t\00o\00m\00(\000\00,\001\00,\003\00)\00)")
 (data $27 (i32.const 262) ",\00\00\00i\00s\00R\00e\00d\00(\00C\00u\00s\00t\00o\00m\00(\002\005\005\00,\001\00,\003\00)\00)")
 (export "memory" (memory $0))
 (export "test_getMaxMemory" (func $0))
 (export "test_getLastErrorMessage" (func $2))
 (export "main" (func $5))
 (start $6)
 (func $0 (result i32)
  (global.get $global$6)
 )
 (func $1 (param $0 i32) (param $1 i32) (param $2 i64)
  (call $fimport$1
   (i32.eq
    (i32.eqz
     (local.get $0)
    )
    (i32.eqz
     (local.get $1)
    )
   )
   (i32.wrap_i64
    (local.get $2)
   )
  )
 )
 (func $2 (result i32)
  (local $0 i64)
  (if (result i32)
   (i32.eq
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
 (func $3 (param $0 i32) (param $1 i32) (param $2 i32) (result i64)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i64)
  (if
   (i32.lt_u
    (global.get $global$3)
    (i32.const 12)
   )
   (then
    (unreachable)
   )
  )
  (if
   (i32.gt_u
    (local.tee $4
     (i32.and
      (i32.add
       (global.get $global$2)
       (i32.add
        (local.tee $3
         (global.get $global$6)
        )
        (i32.const 32)
       )
      )
      (i32.xor
       (global.get $global$2)
       (i32.const -1)
      )
     )
    )
    (i32.shl
     (local.tee $5
      (memory.size)
     )
     (i32.const 16)
    )
   )
   (then
    (drop
     (memory.grow
      (select
       (local.get $5)
       (local.tee $6
        (i32.shr_s
         (i32.and
          (i32.add
           (i32.sub
            (local.get $4)
            (local.get $3)
           )
           (i32.const 65535)
          )
          (i32.const -65536)
         )
         (i32.const 16)
        )
       )
       (i32.gt_u
        (local.get $5)
        (local.get $6)
       )
      )
     )
    )
   )
  )
  (global.set $global$6
   (local.get $4)
  )
  (local.set $5
   (i32.add
    (local.tee $3
     (local.tee $4
      (i32.add
       (local.get $3)
       (i32.const 16)
      )
     )
    )
    (i32.const 12)
   )
  )
  (loop $label
   (if
    (i32.ne
     (local.get $3)
     (local.get $5)
    )
    (then
     (i32.store8
      (local.get $3)
      (i32.load8_u
       (i32.const 0)
      )
     )
     (local.set $3
      (i32.add
       (local.get $3)
       (i32.const 1)
      )
     )
     (br $label)
    )
   )
  )
  (i32.store
   (i32.wrap_i64
    (local.tee $7
     (i64.or
      (i64.extend_i32_u
       (local.get $4)
      )
      (i64.const 17179869184)
     )
    )
   )
   (local.get $0)
  )
  (i32.store
   (i32.add
    (local.tee $0
     (i32.wrap_i64
      (local.get $7)
     )
    )
    (i32.const 4)
   )
   (local.get $1)
  )
  (i32.store
   (i32.add
    (local.get $0)
    (i32.const 8)
   )
   (local.get $2)
  )
  (local.get $7)
 )
 (func $4 (param $0 i64) (result i32)
  (local $1 i32)
  (block $block (result i32)
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
     (i32.const 1)
    )
    (then
     (drop
      (br_if $block
       (i32.const 0)
       (i32.ne
        (local.get $1)
        (i32.const 4)
       )
      )
     )
     (br $block
      (i32.and
       (i32.eqz
        (i32.load
         (i32.add
          (local.tee $1
           (i32.wrap_i64
            (local.get $0)
           )
          )
          (i32.const 8)
         )
        )
       )
       (i32.and
        (i32.eqz
         (i32.load
          (i32.add
           (local.get $1)
           (i32.const 4)
          )
         )
        )
        (i32.eq
         (i32.load
          (local.get $1)
         )
         (i32.const 255)
        )
       )
      )
     )
    )
   )
   (i32.const 1)
  )
 )
 (func $5
  (call $fimport$0
   (i32.const 16)
  )
  (call $1
   (call $4
    (i64.const 4294967296)
   )
   (i32.const 1)
   (i64.const 12884901975)
  )
  (call $1
   (call $4
    (i64.const 8589934592)
   )
   (i32.const 0)
   (i64.const 12884902000)
  )
  (call $1
   (call $4
    (i64.const 12884901888)
   )
   (i32.const 0)
   (i64.const 12884902029)
  )
  (call $1
   (call $4
    (call $3
     (i32.const 255)
     (i32.const 0)
     (i32.const 0)
    )
   )
   (i32.const 1)
   (i64.const 12884902056)
  )
  (call $1
   (call $4
    (call $3
     (i32.const 0)
     (i32.const 1)
     (i32.const 3)
    )
   )
   (i32.const 0)
   (i64.const 12884902105)
  )
  (call $1
   (call $4
    (call $3
     (i32.const 255)
     (i32.const 1)
     (i32.const 3)
    )
   )
   (i32.const 0)
   (i64.const 12884902150)
  )
  (call $fimport$2)
 )
 (func $6
  (global.set $global$0
   (i32.const 4)
  )
  (global.set $global$1
   (i32.const 16)
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
     (global.get $global$2)
     (i32.const 65536)
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
