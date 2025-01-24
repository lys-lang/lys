(module
 (type $0 (func))
 (type $1 (func (param i32 i32)))
 (type $2 (func (param i64)))
 (type $3 (func (result i32)))
 (type $4 (func (param i32)))
 (type $5 (func (param i32 f64)))
 (type $6 (func (param i64 i32)))
 (type $7 (func (param i64 f64)))
 (type $8 (func (param i32 i32 i32) (result i32)))
 (type $9 (func (param f64 f64 i64)))
 (type $10 (func (param i32 i32 i64)))
 (type $11 (func (param i64 i64 i64)))
 (type $12 (func (param i32 i64)))
 (type $13 (func (param i64 i64) (result i64)))
 (type $14 (func (param i64 i64) (result i32)))
 (import "test" "pushTest" (func $fimport$0 (param i32)))
 (import "test" "registerAssertion" (func $fimport$1 (param i32 i32)))
 (import "test" "popTest" (func $fimport$2))
 (import "env" "printf" (func $fimport$3 (param i32 i32)))
 (import "env" "printf" (func $fimport$4 (param i32 f64)))
 (global $global$0 (mut i32) (i32.const 0))
 (global $global$1 (mut i32) (i32.const 0))
 (global $global$2 (mut i32) (i32.const 0))
 (global $global$3 (mut i64) (i64.const 0))
 (memory $0 1)
 (data $0 (i32.const 1123) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data $1 (i32.const 1150) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data $2 (i32.const 1183) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data $3 (i32.const 1210) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data $4 (i32.const 1243) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data $5 (i32.const 1278) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data $6 (i32.const 1319) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data $7 (i32.const 1354) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data $8 (i32.const 1395) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data $9 (i32.const 1430) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data $10 (i32.const 1471) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data $11 (i32.const 1506) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data $12 (i32.const 1547) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00X")
 (data $13 (i32.const 1574) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00X")
 (data $14 (i32.const 1607) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data $15 (i32.const 1634) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data $16 (i32.const 1667) "\1a\00\00\00a\00s\00s\00e\00r\00t\00(\00f\00a\00l\00s\00e\00)")
 (data $17 (i32.const 1081) "\08\00\00\00t\00r\00u\00e")
 (data $18 (i32.const 1094) "\n\00\00\00f\00a\00l\00s\00e")
 (data $19 (i32.const 1109) "\02\00\00\000")
 (data $20 (i32.const 1116) "\02\00\00\000")
 (data $21 (i32.const 16) ".\00\00\00T\00e\00s\00t\00 \00b\00y\00t\00e\00 \00c\00o\00n\00c\00a\00t\00e\00n\00a\00t\00i\00o\00n")
 (data $22 (i32.const 67) "\06\00\00\00a\00b\00c")
 (data $23 (i32.const 78) "\08\00\00\001\002\003\004")
 (data $24 (i32.const 91) "\1a\00\00\00a\00.\00l\00e\00n\00g\00t\00h\00 \00=\00=\00 \003")
 (data $25 (i32.const 122) "\1a\00\00\00b\00.\00l\00e\00n\00g\00t\00h\00 \00=\00=\00 \004")
 (data $26 (i32.const 153) "\1a\00\00\00c\00.\00l\00e\00n\00g\00t\00h\00 \00=\00=\00 \007")
 (data $27 (i32.const 184) "\0e\00\00\00a\00b\00c\001\002\003\004")
 (data $28 (i32.const 203) "$\00\00\00c\00 \00=\00=\00 \00\'\00a\00b\00c\001\002\003\004\00\'\00 \00(\001\00)")
 (data $29 (i32.const 244) "\0e\00\00\00a\00b\00c\001\002\003\004")
 (data $30 (i32.const 263) "$\00\00\00c\00 \00=\00=\00 \00\'\00a\00b\00c\001\002\003\004\00\'\00 \00(\002\00)")
 (data $31 (i32.const 304) "\1c\00\00\00d\00.\00l\00e\00n\00g\00t\00h\00 \00=\00=\00 \002\008")
 (data $32 (i32.const 337) "\1c\00\00\00a\00b\00c\001\002\003\004\00a\00b\00c\001\002\003\004")
 (data $33 (i32.const 370) ",\00\00\00T\00e\00s\00t\00 \00s\00t\00r\00i\00n\00g\00 \00o\00p\00e\00r\00a\00t\00i\00o\00n\00s")
 (data $34 (i32.const 419) "\0c\00\00\00a\00s\00d\00n\'5\d8\11\dc")
 (data $35 (i32.const 436) "\1e\00\00\00s\00t\00r\00.\00l\00e\00n\00g\00t\00h\00 \00=\00=\00 \006")
 (data $36 (i32.const 471) "\12\00\00\00c\00h\00a\00r\00 \00a\00t\00 \000")
 (data $37 (i32.const 494) "\12\00\00\00c\00h\00a\00r\00 \00a\00t\00 \001")
 (data $38 (i32.const 517) "\12\00\00\00c\00h\00a\00r\00 \00a\00t\00 \002")
 (data $39 (i32.const 540) "\12\00\00\00c\00h\00a\00r\00 \00a\00t\00 \003")
 (data $40 (i32.const 563) "\12\00\00\00c\00h\00a\00r\00 \00a\00t\00 \004")
 (data $41 (i32.const 586) "\12\00\00\00c\00h\00a\00r\00 \00a\00t\00 \005")
 (data $42 (i32.const 609) "(\00\00\00S\00t\00r\00i\00n\00g\00 \00c\00o\00n\00c\00a\00t\00e\00n\00a\00t\00i\00o\00n")
 (data $43 (i32.const 654) "\04\00\00\00d\00s")
 (data $44 (i32.const 663) "\04\00\00\00s\00a")
 (data $45 (i32.const 672) ".\00\00\00S\00t\00r\00i\00n\00g\00.\00l\00e\00n\00g\00t\00h\00 \00m\00u\00s\00t\00 \00b\00e\00 \004")
 (data $46 (i32.const 723) "4\00\00\00S\00t\00r\00i\00n\00g\00 \00c\00o\00n\00c\00a\00t\00e\00n\00a\00t\00i\00o\00n\00 \00U\00T\00F\001\006")
 (data $47 (i32.const 780) "\04\00\00\00a\00b")
 (data $48 (i32.const 789) "\06\00\00\00\b5\00\9c&\0e\fe")
 (data $49 (i32.const 800) ".\00\00\00S\00t\00r\00i\00n\00g\00.\00l\00e\00n\00g\00t\00h\00 \00m\00u\00s\00t\00 \00b\00e\00 \005")
 (data $50 (i32.const 851) "$\00\00\00a\00 \00a\00s\00s\00e\00r\00t\00i\00o\00n\00 \00f\00a\00i\00l\00e\00d")
 (data $51 (i32.const 892) "$\00\00\00b\00 \00a\00s\00s\00e\00r\00t\00i\00o\00n\00 \00f\00a\00i\00l\00e\00d")
 (data $52 (i32.const 933) "$\00\00\00\b5\00 \00a\00s\00s\00e\00r\00t\00i\00o\00n\00 \00f\00a\00i\00l\00e\00d")
 (data $53 (i32.const 974) ".\00\00\000\00x\002\006\009\00C\00 \00a\00s\00s\00e\00r\00t\00i\00o\00n\00 \00f\00a\00i\00l\00e\00d")
 (data $54 (i32.const 1025) ".\00\00\000\00x\00F\00E\000\00E\00 \00a\00s\00s\00e\00r\00t\00i\00o\00n\00 \00f\00a\00i\00l\00e\00d")
 (export "memory" (memory $0))
 (export "test_getMaxMemory" (func $3))
 (export "test_getLastErrorMessage" (func $8))
 (export "main" (func $13))
 (start $14)
 (func $0 (param $0 i64)
  (call $fimport$3
   (i32.wrap_i64
    (local.get $0)
   )
   (i32.const 0)
  )
 )
 (func $1 (param $0 i64) (param $1 i32)
  (call $fimport$3
   (i32.wrap_i64
    (local.get $0)
   )
   (local.get $1)
  )
 )
 (func $2 (param $0 i64) (param $1 f64)
  (call $fimport$4
   (i32.wrap_i64
    (local.get $0)
   )
   (local.get $1)
  )
 )
 (func $3 (result i32)
  (global.get $global$2)
 )
 (func $4 (param $0 i32) (param $1 i32) (param $2 i32) (result i32)
  (local $3 i32)
  (local $4 i64)
  (local $5 i64)
  (local.set $4
   (i64.extend_i32_s
    (local.get $1)
   )
  )
  (local.set $5
   (i64.extend_i32_s
    (local.get $0)
   )
  )
  (loop $label
   (if
    (i32.gt_u
     (local.get $2)
     (local.get $3)
    )
    (then
     (i32.store8
      (i32.add
       (local.get $3)
       (i32.wrap_i64
        (local.get $5)
       )
      )
      (i32.load8_u
       (i32.add
        (local.get $3)
        (i32.wrap_i64
         (local.get $4)
        )
       )
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
  (i32.add
   (local.get $0)
   (local.get $2)
  )
 )
 (func $5 (param $0 f64) (param $1 f64) (param $2 i64)
  (call $10
   (f64.eq
    (local.get $0)
    (local.get $1)
   )
   (local.get $2)
  )
  (if
   (f64.ne
    (local.get $0)
    (local.get $1)
   )
   (then
    (call $2
     (i64.const 12884903011)
     (local.get $0)
    )
    (call $2
     (i64.const 12884903038)
     (local.get $1)
    )
   )
  )
 )
 (func $6 (param $0 i32) (param $1 i32) (param $2 i64)
  (call $10
   (i32.eq
    (local.get $0)
    (local.get $1)
   )
   (local.get $2)
  )
  (if
   (i32.ne
    (local.get $0)
    (local.get $1)
   )
   (then
    (call $1
     (i64.const 12884903435)
     (local.get $0)
    )
    (call $1
     (i64.const 12884903462)
     (local.get $1)
    )
   )
  )
 )
 (func $7 (param $0 i64) (param $1 i64) (param $2 i64)
  (call $10
   (call $12
    (local.get $0)
    (local.get $1)
   )
   (local.get $2)
  )
  (if
   (i32.eqz
    (call $12
     (local.get $0)
     (local.get $1)
    )
   )
   (then
    (call $0
     (local.get $0)
    )
    (call $0
     (local.get $1)
    )
   )
  )
 )
 (func $8 (result i32)
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
 (func $9 (param $0 i64)
  (call $fimport$0
   (i32.wrap_i64
    (local.get $0)
   )
  )
 )
 (func $10 (param $0 i32) (param $1 i64)
  (call $fimport$1
   (local.get $0)
   (i32.wrap_i64
    (local.get $1)
   )
  )
 )
 (func $11 (param $0 i64) (param $1 i64) (result i64)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i64)
  (if
   (i32.eqz
    (local.tee $2
     (local.tee $8
      (i32.add
       (local.tee $7
        (i32.add
         (local.tee $5
          (i32.and
           (i32.load
            (i32.wrap_i64
             (local.get $0)
            )
           )
           (i32.const -2)
          )
         )
         (local.tee $6
          (i32.and
           (i32.load
            (i32.wrap_i64
             (local.get $1)
            )
           )
           (i32.const -2)
          )
         )
        )
       )
       (i32.const 4)
      )
     )
    )
   )
   (then
    (unreachable)
   )
  )
  (if
   (i32.lt_u
    (global.get $global$1)
    (local.get $2)
   )
   (then
    (unreachable)
   )
  )
  (if
   (i32.gt_u
    (local.tee $2
     (i32.and
      (i32.add
       (global.get $global$0)
       (i32.add
        (i32.add
         (local.tee $3
          (global.get $global$2)
         )
         (i32.const 16)
        )
        (select
         (i32.const 16)
         (local.get $2)
         (i32.le_u
          (local.get $2)
          (i32.const 16)
         )
        )
       )
      )
      (i32.xor
       (global.get $global$0)
       (i32.const -1)
      )
     )
    )
    (i32.shl
     (local.tee $4
      (memory.size)
     )
     (i32.const 16)
    )
   )
   (then
    (drop
     (memory.grow
      (select
       (local.get $4)
       (local.tee $9
        (i32.shr_s
         (i32.and
          (i32.add
           (i32.sub
            (local.get $2)
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
        (local.get $4)
        (local.get $9)
       )
      )
     )
    )
   )
  )
  (global.set $global$2
   (local.get $2)
  )
  (local.set $4
   (i32.add
    (local.get $8)
    (local.tee $2
     (local.tee $3
      (i32.add
       (local.get $3)
       (i32.const 16)
      )
     )
    )
   )
  )
  (loop $label
   (if
    (i32.ne
     (local.get $2)
     (local.get $4)
    )
    (then
     (i32.store8
      (local.get $2)
      (i32.load8_u
       (i32.const 0)
      )
     )
     (local.set $2
      (i32.add
       (local.get $2)
       (i32.const 1)
      )
     )
     (br $label)
    )
   )
  )
  (i32.store
   (local.get $3)
   (local.get $7)
  )
  (drop
   (call $4
    (call $4
     (i32.add
      (i32.wrap_i64
       (local.tee $10
        (i64.or
         (i64.extend_i32_u
          (local.get $3)
         )
         (i64.const 38654705664)
        )
       )
      )
      (i32.const 4)
     )
     (i32.add
      (i32.wrap_i64
       (local.get $0)
      )
      (i32.const 4)
     )
     (local.get $5)
    )
    (i32.add
     (i32.wrap_i64
      (local.get $1)
     )
     (i32.const 4)
    )
    (local.get $6)
   )
  )
  (i64.or
   (i64.and
    (local.get $10)
    (i64.const 4294967295)
   )
   (i64.const 12884901888)
  )
 )
 (func $12 (param $0 i64) (param $1 i64) (result i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (if (result i32)
   (i32.eq
    (i32.shr_u
     (i32.load
      (local.tee $2
       (i32.wrap_i64
        (local.get $0)
       )
      )
     )
     (i32.const 1)
    )
    (i32.shr_u
     (i32.load
      (local.tee $3
       (i32.wrap_i64
        (local.get $1)
       )
      )
     )
     (i32.const 1)
    )
   )
   (then
    (if (result i32)
     (i32.eq
      (local.get $2)
      (local.get $3)
     )
     (then
      (i32.const 1)
     )
     (else
      (local.set $2
       (i32.shr_u
        (i32.load
         (i32.wrap_i64
          (local.get $0)
         )
        )
        (i32.const 1)
       )
      )
      (local.set $3
       (i32.const 1)
      )
      (loop $label
       (block $block
        (br_if $block
         (i32.eqz
          (local.get $2)
         )
        )
        (if
         (i32.gt_u
          (local.tee $2
           (i32.sub
            (local.get $2)
            (i32.const 1)
           )
          )
          (i32.shr_u
           (i32.load
            (i32.wrap_i64
             (local.get $0)
            )
           )
           (i32.const 1)
          )
         )
         (then
          (unreachable)
         )
        )
        (if
         (i32.gt_u
          (local.get $2)
          (i32.shr_u
           (i32.load
            (i32.wrap_i64
             (local.get $1)
            )
           )
           (i32.const 1)
          )
         )
         (then
          (unreachable)
         )
        )
        (if
         (i32.ne
          (i32.load16_u
           (i32.add
            (local.tee $4
             (i32.shl
              (local.get $2)
              (i32.const 1)
             )
            )
            (i32.add
             (i32.wrap_i64
              (local.get $0)
             )
             (i32.const 4)
            )
           )
          )
          (i32.load16_u
           (i32.add
            (local.get $4)
            (i32.add
             (i32.wrap_i64
              (local.get $1)
             )
             (i32.const 4)
            )
           )
          )
         )
         (then
          (local.set $3
           (i32.const 0)
          )
          (br $block)
         )
        )
        (br_if $label
         (local.get $2)
        )
       )
      )
      (local.get $3)
     )
    )
   )
   (else
    (i32.const 0)
   )
  )
 )
 (func $13
  (local $0 i64)
  (local $1 i64)
  (local $2 i32)
  (call $9
   (i64.const 12884901904)
  )
  (local.set $0
   (call $11
    (i64.const 12884901955)
    (i64.const 12884901966)
   )
  )
  (call $6
   (i32.shr_u
    (i32.load
     (i32.const 67)
    )
    (i32.const 1)
   )
   (i32.const 3)
   (i64.const 12884901979)
  )
  (call $6
   (i32.shr_u
    (i32.load
     (i32.const 78)
    )
    (i32.const 1)
   )
   (i32.const 4)
   (i64.const 12884902010)
  )
  (call $6
   (i32.shr_u
    (i32.load
     (i32.wrap_i64
      (local.get $0)
     )
    )
    (i32.const 1)
   )
   (i32.const 7)
   (i64.const 12884902041)
  )
  (call $7
   (local.get $0)
   (i64.const 12884902072)
   (i64.const 12884902091)
  )
  (local.set $1
   (call $11
    (local.get $0)
    (local.get $0)
   )
  )
  (call $7
   (local.get $0)
   (i64.const 12884902132)
   (i64.const 12884902151)
  )
  (call $6
   (i32.shr_u
    (i32.load
     (i32.wrap_i64
      (local.get $1)
     )
    )
    (i32.const 1)
   )
   (i32.const 14)
   (i64.const 12884902192)
  )
  (call $7
   (local.get $1)
   (i64.const 12884902225)
   (local.get $1)
  )
  (call $fimport$2)
  (call $9
   (i64.const 12884902258)
  )
  (call $6
   (i32.shr_u
    (i32.load
     (i32.const 419)
    )
    (i32.const 1)
   )
   (i32.const 6)
   (i64.const 12884902324)
  )
  (if
   (i32.lt_u
    (i32.shr_u
     (i32.load
      (i32.const 419)
     )
     (i32.const 1)
    )
    (i32.const 0)
   )
   (then
    (unreachable)
   )
  )
  (call $5
   (f64.convert_i32_u
    (i32.load16_u
     (i32.const 423)
    )
   )
   (f64.const 97)
   (i64.const 12884902359)
  )
  (if
   (i32.eqz
    (i32.shr_u
     (i32.load
      (i32.const 419)
     )
     (i32.const 1)
    )
   )
   (then
    (unreachable)
   )
  )
  (call $5
   (f64.convert_i32_u
    (i32.load16_u
     (i32.const 425)
    )
   )
   (f64.const 115)
   (i64.const 12884902382)
  )
  (if
   (i32.lt_u
    (i32.shr_u
     (i32.load
      (i32.const 419)
     )
     (i32.const 1)
    )
    (i32.const 2)
   )
   (then
    (unreachable)
   )
  )
  (call $5
   (f64.convert_i32_u
    (i32.load16_u
     (i32.const 427)
    )
   )
   (f64.const 100)
   (i64.const 12884902405)
  )
  (if
   (i32.lt_u
    (i32.shr_u
     (i32.load
      (i32.const 419)
     )
     (i32.const 1)
    )
    (i32.const 3)
   )
   (then
    (unreachable)
   )
  )
  (call $5
   (f64.convert_i32_u
    (i32.load16_u
     (i32.const 429)
    )
   )
   (f64.const 10094)
   (i64.const 12884902428)
  )
  (if
   (i32.lt_u
    (i32.shr_u
     (i32.load
      (i32.const 419)
     )
     (i32.const 1)
    )
    (i32.const 4)
   )
   (then
    (unreachable)
   )
  )
  (call $5
   (f64.convert_i32_u
    (i32.load16_u
     (i32.const 431)
    )
   )
   (f64.const 55349)
   (i64.const 12884902451)
  )
  (if
   (i32.lt_u
    (i32.shr_u
     (i32.load
      (i32.const 419)
     )
     (i32.const 1)
    )
    (i32.const 5)
   )
   (then
    (unreachable)
   )
  )
  (call $5
   (f64.convert_i32_u
    (i32.load16_u
     (i32.const 433)
    )
   )
   (f64.const 56337)
   (i64.const 12884902474)
  )
  (call $fimport$2)
  (call $9
   (i64.const 12884902497)
  )
  (call $6
   (i32.shr_u
    (i32.load
     (i32.wrap_i64
      (call $11
       (i64.const 12884902542)
       (i64.const 12884902551)
      )
     )
    )
    (i32.const 1)
   )
   (i32.const 4)
   (i64.const 12884902560)
  )
  (call $fimport$2)
  (call $9
   (i64.const 12884902611)
  )
  (call $6
   (i32.shr_u
    (i32.load
     (i32.wrap_i64
      (local.tee $0
       (call $11
        (i64.const 12884902668)
        (i64.const 12884902677)
       )
      )
     )
    )
    (i32.const 1)
   )
   (i32.const 5)
   (i64.const 12884902688)
  )
  (if
   (i32.lt_u
    (i32.shr_u
     (i32.load
      (i32.wrap_i64
       (local.get $0)
      )
     )
     (i32.const 1)
    )
    (i32.const 0)
   )
   (then
    (unreachable)
   )
  )
  (call $6
   (i32.load16_u
    (i32.add
     (local.tee $2
      (i32.wrap_i64
       (local.get $0)
      )
     )
     (i32.const 4)
    )
   )
   (i32.const 97)
   (i64.const 12884902739)
  )
  (if
   (i32.eqz
    (i32.shr_u
     (i32.load
      (local.get $2)
     )
     (i32.const 1)
    )
   )
   (then
    (unreachable)
   )
  )
  (call $6
   (i32.load16_u
    (i32.add
     (local.tee $2
      (i32.wrap_i64
       (local.get $0)
      )
     )
     (i32.const 6)
    )
   )
   (i32.const 98)
   (i64.const 12884902780)
  )
  (if
   (i32.lt_u
    (i32.shr_u
     (i32.load
      (local.get $2)
     )
     (i32.const 1)
    )
    (i32.const 2)
   )
   (then
    (unreachable)
   )
  )
  (call $6
   (i32.load16_u
    (i32.add
     (local.tee $2
      (i32.wrap_i64
       (local.get $0)
      )
     )
     (i32.const 8)
    )
   )
   (i32.const 181)
   (i64.const 12884902821)
  )
  (if
   (i32.lt_u
    (i32.shr_u
     (i32.load
      (local.get $2)
     )
     (i32.const 1)
    )
    (i32.const 3)
   )
   (then
    (unreachable)
   )
  )
  (call $6
   (i32.load16_u
    (i32.add
     (local.tee $2
      (i32.wrap_i64
       (local.get $0)
      )
     )
     (i32.const 10)
    )
   )
   (i32.const 9884)
   (i64.const 12884902862)
  )
  (if
   (i32.lt_u
    (i32.shr_u
     (i32.load
      (local.get $2)
     )
     (i32.const 1)
    )
    (i32.const 4)
   )
   (then
    (unreachable)
   )
  )
  (call $6
   (i32.load16_u
    (i32.add
     (i32.wrap_i64
      (local.get $0)
     )
     (i32.const 12)
    )
   )
   (i32.const 65038)
   (i64.const 12884902913)
  )
  (call $fimport$2)
 )
 (func $14
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
