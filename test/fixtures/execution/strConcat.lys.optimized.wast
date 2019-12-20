(module
 (type $none_=>_none (func))
 (type $i32_i32_=>_none (func (param i32 i32)))
 (type $i64_=>_none (func (param i64)))
 (type $none_=>_i32 (func (result i32)))
 (type $i64_i64_=>_i64 (func (param i64 i64) (result i64)))
 (type $i32_=>_none (func (param i32)))
 (type $i32_i32_i64_=>_none (func (param i32 i32 i64)))
 (type $i32_i64_=>_none (func (param i32 i64)))
 (type $i32_f64_=>_none (func (param i32 f64)))
 (type $i64_i32_=>_none (func (param i64 i32)))
 (type $i64_i64_i64_=>_none (func (param i64 i64 i64)))
 (type $i64_f64_=>_none (func (param i64 f64)))
 (type $f64_f64_i64_=>_none (func (param f64 f64 i64)))
 (type $i32_=>_i32 (func (param i32) (result i32)))
 (type $i32_i32_i32_=>_i32 (func (param i32 i32 i32) (result i32)))
 (type $i64_i32_=>_i32 (func (param i64 i32) (result i32)))
 (type $i64_i64_=>_i32 (func (param i64 i64) (result i32)))
 (type $i32_=>_i64 (func (param i32) (result i64)))
 (import "test" "pushTest" (func $fimport$0 (param i32)))
 (import "test" "registerAssertion" (func $fimport$1 (param i32 i32)))
 (import "test" "popTest" (func $fimport$2))
 (import "env" "printf" (func $fimport$3 (param i32 i32)))
 (import "env" "printf" (func $fimport$4 (param i32 f64)))
 (memory $0 1)
 (data (i32.const 1123) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 1150) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 1183) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 1210) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 1243) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 1278) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 1319) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 1354) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 1395) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 1430) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 1471) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 1506) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 1547) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00X")
 (data (i32.const 1574) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00X")
 (data (i32.const 1607) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 1634) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 1667) "\1a\00\00\00a\00s\00s\00e\00r\00t\00(\00f\00a\00l\00s\00e\00)")
 (data (i32.const 1081) "\08\00\00\00t\00r\00u\00e")
 (data (i32.const 1094) "\n\00\00\00f\00a\00l\00s\00e")
 (data (i32.const 1109) "\02\00\00\000")
 (data (i32.const 1116) "\02\00\00\000")
 (data (i32.const 16) ".\00\00\00T\00e\00s\00t\00 \00b\00y\00t\00e\00 \00c\00o\00n\00c\00a\00t\00e\00n\00a\00t\00i\00o\00n")
 (data (i32.const 67) "\06\00\00\00a\00b\00c")
 (data (i32.const 78) "\08\00\00\001\002\003\004")
 (data (i32.const 91) "\1a\00\00\00a\00.\00l\00e\00n\00g\00t\00h\00 \00=\00=\00 \003")
 (data (i32.const 122) "\1a\00\00\00b\00.\00l\00e\00n\00g\00t\00h\00 \00=\00=\00 \004")
 (data (i32.const 153) "\1a\00\00\00c\00.\00l\00e\00n\00g\00t\00h\00 \00=\00=\00 \007")
 (data (i32.const 184) "\0e\00\00\00a\00b\00c\001\002\003\004")
 (data (i32.const 203) "$\00\00\00c\00 \00=\00=\00 \00\'\00a\00b\00c\001\002\003\004\00\'\00 \00(\001\00)")
 (data (i32.const 244) "\0e\00\00\00a\00b\00c\001\002\003\004")
 (data (i32.const 263) "$\00\00\00c\00 \00=\00=\00 \00\'\00a\00b\00c\001\002\003\004\00\'\00 \00(\002\00)")
 (data (i32.const 304) "\1c\00\00\00d\00.\00l\00e\00n\00g\00t\00h\00 \00=\00=\00 \002\008")
 (data (i32.const 337) "\1c\00\00\00a\00b\00c\001\002\003\004\00a\00b\00c\001\002\003\004")
 (data (i32.const 370) ",\00\00\00T\00e\00s\00t\00 \00s\00t\00r\00i\00n\00g\00 \00o\00p\00e\00r\00a\00t\00i\00o\00n\00s")
 (data (i32.const 419) "\0c\00\00\00a\00s\00d\00n\'5\d8\11\dc")
 (data (i32.const 436) "\1e\00\00\00s\00t\00r\00.\00l\00e\00n\00g\00t\00h\00 \00=\00=\00 \006")
 (data (i32.const 471) "\12\00\00\00c\00h\00a\00r\00 \00a\00t\00 \000")
 (data (i32.const 494) "\12\00\00\00c\00h\00a\00r\00 \00a\00t\00 \001")
 (data (i32.const 517) "\12\00\00\00c\00h\00a\00r\00 \00a\00t\00 \002")
 (data (i32.const 540) "\12\00\00\00c\00h\00a\00r\00 \00a\00t\00 \003")
 (data (i32.const 563) "\12\00\00\00c\00h\00a\00r\00 \00a\00t\00 \004")
 (data (i32.const 586) "\12\00\00\00c\00h\00a\00r\00 \00a\00t\00 \005")
 (data (i32.const 609) "(\00\00\00S\00t\00r\00i\00n\00g\00 \00c\00o\00n\00c\00a\00t\00e\00n\00a\00t\00i\00o\00n")
 (data (i32.const 654) "\04\00\00\00d\00s")
 (data (i32.const 663) "\04\00\00\00s\00a")
 (data (i32.const 672) ".\00\00\00S\00t\00r\00i\00n\00g\00.\00l\00e\00n\00g\00t\00h\00 \00m\00u\00s\00t\00 \00b\00e\00 \004")
 (data (i32.const 723) "4\00\00\00S\00t\00r\00i\00n\00g\00 \00c\00o\00n\00c\00a\00t\00e\00n\00a\00t\00i\00o\00n\00 \00U\00T\00F\001\006")
 (data (i32.const 780) "\04\00\00\00a\00b")
 (data (i32.const 789) "\06\00\00\00\b5\00\9c&\0e\fe")
 (data (i32.const 800) ".\00\00\00S\00t\00r\00i\00n\00g\00.\00l\00e\00n\00g\00t\00h\00 \00m\00u\00s\00t\00 \00b\00e\00 \005")
 (data (i32.const 851) "$\00\00\00a\00 \00a\00s\00s\00e\00r\00t\00i\00o\00n\00 \00f\00a\00i\00l\00e\00d")
 (data (i32.const 892) "$\00\00\00b\00 \00a\00s\00s\00e\00r\00t\00i\00o\00n\00 \00f\00a\00i\00l\00e\00d")
 (data (i32.const 933) "$\00\00\00\b5\00 \00a\00s\00s\00e\00r\00t\00i\00o\00n\00 \00f\00a\00i\00l\00e\00d")
 (data (i32.const 974) ".\00\00\000\00x\002\006\009\00C\00 \00a\00s\00s\00e\00r\00t\00i\00o\00n\00 \00f\00a\00i\00l\00e\00d")
 (data (i32.const 1025) ".\00\00\000\00x\00F\00E\000\00E\00 \00a\00s\00s\00e\00r\00t\00i\00o\00n\00 \00f\00a\00i\00l\00e\00d")
 (global $global$0 (mut i32) (i32.const 0))
 (global $global$1 (mut i32) (i32.const 0))
 (global $global$2 (mut i32) (i32.const 0))
 (global $global$3 (mut i32) (i32.const 0))
 (global $global$4 (mut i32) (i32.const 0))
 (global $global$5 (mut i32) (i32.const 0))
 (global $global$6 (mut i32) (i32.const 0))
 (global $global$7 (mut i64) (i64.const 0))
 (export "memory" (memory $0))
 (export "test_getMaxMemory" (func $3))
 (export "test_getLastErrorMessage" (func $10))
 (export "main" (func $18))
 (start $19)
 (func $0 (; 5 ;) (param $0 i64)
  (call $fimport$3
   (i32.wrap_i64
    (local.get $0)
   )
   (i32.const 0)
  )
 )
 (func $1 (; 6 ;) (param $0 i64) (param $1 i32)
  (call $fimport$3
   (i32.wrap_i64
    (local.get $0)
   )
   (local.get $1)
  )
 )
 (func $2 (; 7 ;) (param $0 i64) (param $1 f64)
  (call $fimport$4
   (i32.wrap_i64
    (local.get $0)
   )
   (local.get $1)
  )
 )
 (func $3 (; 8 ;) (result i32)
  (global.get $global$6)
 )
 (func $4 (; 9 ;) (param $0 i32) (result i32)
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
 (func $5 (; 10 ;) (param $0 i32) (param $1 i32) (param $2 i32) (result i32)
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
  (loop $label$1
   (if
    (i32.lt_u
     (local.get $3)
     (local.get $2)
    )
    (block
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
     (br $label$1)
    )
   )
  )
  (i32.add
   (local.get $0)
   (local.get $2)
  )
 )
 (func $6 (; 11 ;) (param $0 i32) (param $1 i32)
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
 (func $7 (; 12 ;) (param $0 f64) (param $1 f64) (param $2 i64)
  (call $12
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
   (block
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
 (func $8 (; 13 ;) (param $0 i32) (param $1 i32) (param $2 i64)
  (call $12
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
   (block
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
 (func $9 (; 14 ;) (param $0 i64) (param $1 i64) (param $2 i64)
  (call $12
   (call $16
    (local.get $0)
    (local.get $1)
   )
   (local.get $2)
  )
  (if
   (select
    (i32.const 0)
    (i32.const 1)
    (call $16
     (local.get $0)
     (local.get $1)
    )
   )
   (block
    (call $0
     (local.get $0)
    )
    (call $0
     (local.get $1)
    )
   )
  )
 )
 (func $10 (; 15 ;) (result i32)
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
 (func $11 (; 16 ;) (param $0 i64)
  (call $fimport$0
   (i32.wrap_i64
    (local.get $0)
   )
  )
 )
 (func $12 (; 17 ;) (param $0 i32) (param $1 i64)
  (call $fimport$1
   (local.get $0)
   (i32.wrap_i64
    (local.get $1)
   )
  )
 )
 (func $13 (; 18 ;) (param $0 i64) (param $1 i64) (result i64)
  (call $15
   (local.get $0)
   (local.get $1)
  )
 )
 (func $14 (; 19 ;) (param $0 i64) (param $1 i32) (result i32)
  (if
   (i32.gt_u
    (local.get $1)
    (i32.div_u
     (i32.load
      (i32.wrap_i64
       (local.get $0)
      )
     )
     (i32.const 2)
    )
   )
   (unreachable)
  )
  (if
   (i32.lt_u
    (local.get $1)
    (i32.const 0)
   )
   (unreachable)
  )
  (i32.load16_u
   (i32.add
    (i32.wrap_i64
     (i64.extend_i32_s
      (i32.add
       (i32.wrap_i64
        (local.get $0)
       )
       (i32.const 4)
      )
     )
    )
    (i32.shl
     (local.get $1)
     (i32.const 1)
    )
   )
  )
 )
 (func $15 (; 20 ;) (param $0 i64) (param $1 i64) (result i64)
  (local $2 i32)
  (local $3 i32)
  (local $4 i64)
  (drop
   (call $5
    (call $5
     (i32.add
      (i32.wrap_i64
       (local.tee $4
        (call $17
         (i32.add
          (local.tee $2
           (i32.shl
            (i32.div_u
             (i32.load
              (i32.wrap_i64
               (local.get $0)
              )
             )
             (i32.const 2)
            )
            (i32.const 1)
           )
          )
          (local.tee $3
           (i32.shl
            (i32.div_u
             (i32.load
              (i32.wrap_i64
               (local.get $1)
              )
             )
             (i32.const 2)
            )
            (i32.const 1)
           )
          )
         )
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
     (local.get $2)
    )
    (i32.add
     (i32.wrap_i64
      (local.get $1)
     )
     (i32.const 4)
    )
    (local.get $3)
   )
  )
  (i64.or
   (i64.and
    (local.get $4)
    (i64.const 4294967295)
   )
   (i64.const 12884901888)
  )
 )
 (func $16 (; 21 ;) (param $0 i64) (param $1 i64) (result i32)
  (local $2 i32)
  (local $3 i32)
  (if (result i32)
   (i32.eq
    (i32.div_u
     (i32.load
      (i32.wrap_i64
       (local.get $0)
      )
     )
     (i32.const 2)
    )
    (i32.div_u
     (i32.load
      (i32.wrap_i64
       (local.get $1)
      )
     )
     (i32.const 2)
    )
   )
   (if (result i32)
    (i32.eq
     (i32.wrap_i64
      (local.get $0)
     )
     (i32.wrap_i64
      (local.get $1)
     )
    )
    (i32.const 1)
    (block (result i32)
     (local.set $2
      (i32.div_u
       (i32.load
        (i32.wrap_i64
         (local.get $0)
        )
       )
       (i32.const 2)
      )
     )
     (local.set $3
      (i32.const 1)
     )
     (loop $label$4
      (block $label$5
       (br_if $label$5
        (i32.le_u
         (local.get $2)
         (i32.const 0)
        )
       )
       (if
        (i32.ne
         (call $14
          (local.get $0)
          (local.tee $2
           (i32.sub
            (local.get $2)
            (i32.const 1)
           )
          )
         )
         (call $14
          (local.get $1)
          (local.get $2)
         )
        )
        (block
         (local.set $3
          (i32.const 0)
         )
         (br $label$5)
        )
       )
       (br_if $label$4
        (i32.gt_u
         (local.get $2)
         (i32.const 0)
        )
       )
      )
     )
     (local.get $3)
    )
   )
   (i32.const 0)
  )
 )
 (func $17 (; 22 ;) (param $0 i32) (result i64)
  (local $1 i32)
  (local $2 i32)
  (call $6
   (local.tee $1
    (call $4
     (local.tee $2
      (i32.add
       (local.get $0)
       (i32.const 4)
      )
     )
    )
   )
   (local.get $2)
  )
  (i32.store
   (local.get $1)
   (local.get $0)
  )
  (i64.or
   (i64.extend_i32_u
    (local.get $1)
   )
   (i64.const 38654705664)
  )
 )
 (func $18 (; 23 ;)
  (local $0 i64)
  (local $1 i64)
  (call $11
   (i64.const 12884901904)
  )
  (local.set $0
   (call $15
    (i64.const 12884901955)
    (i64.const 12884901966)
   )
  )
  (call $8
   (i32.div_u
    (i32.load
     (i32.const 67)
    )
    (i32.const 2)
   )
   (i32.const 3)
   (i64.const 12884901979)
  )
  (call $8
   (i32.div_u
    (i32.load
     (i32.const 78)
    )
    (i32.const 2)
   )
   (i32.const 4)
   (i64.const 12884902010)
  )
  (call $8
   (i32.div_u
    (i32.load
     (i32.wrap_i64
      (local.get $0)
     )
    )
    (i32.const 2)
   )
   (i32.const 7)
   (i64.const 12884902041)
  )
  (call $9
   (local.get $0)
   (i64.const 12884902072)
   (i64.const 12884902091)
  )
  (local.set $1
   (call $15
    (local.get $0)
    (local.get $0)
   )
  )
  (call $9
   (local.get $0)
   (i64.const 12884902132)
   (i64.const 12884902151)
  )
  (call $8
   (i32.div_u
    (i32.load
     (i32.wrap_i64
      (local.get $1)
     )
    )
    (i32.const 2)
   )
   (i32.const 14)
   (i64.const 12884902192)
  )
  (call $9
   (local.get $1)
   (i64.const 12884902225)
   (local.get $1)
  )
  (call $fimport$2)
  (call $11
   (i64.const 12884902258)
  )
  (call $8
   (i32.div_u
    (i32.load
     (i32.const 419)
    )
    (i32.const 2)
   )
   (i32.const 6)
   (i64.const 12884902324)
  )
  (call $7
   (f64.convert_i32_u
    (call $14
     (i64.const 12884902307)
     (i32.const 0)
    )
   )
   (f64.const 97)
   (i64.const 12884902359)
  )
  (call $7
   (f64.convert_i32_u
    (call $14
     (i64.const 12884902307)
     (i32.const 1)
    )
   )
   (f64.const 115)
   (i64.const 12884902382)
  )
  (call $7
   (f64.convert_i32_u
    (call $14
     (i64.const 12884902307)
     (i32.const 2)
    )
   )
   (f64.const 100)
   (i64.const 12884902405)
  )
  (call $7
   (f64.convert_i32_u
    (call $14
     (i64.const 12884902307)
     (i32.const 3)
    )
   )
   (f64.const 10094)
   (i64.const 12884902428)
  )
  (call $7
   (f64.convert_i32_u
    (call $14
     (i64.const 12884902307)
     (i32.const 4)
    )
   )
   (f64.const 55349)
   (i64.const 12884902451)
  )
  (call $7
   (f64.convert_i32_u
    (call $14
     (i64.const 12884902307)
     (i32.const 5)
    )
   )
   (f64.const 56337)
   (i64.const 12884902474)
  )
  (call $fimport$2)
  (call $11
   (i64.const 12884902497)
  )
  (call $8
   (i32.div_u
    (i32.load
     (i32.wrap_i64
      (call $13
       (i64.const 12884902542)
       (i64.const 12884902551)
      )
     )
    )
    (i32.const 2)
   )
   (i32.const 4)
   (i64.const 12884902560)
  )
  (call $fimport$2)
  (call $11
   (i64.const 12884902611)
  )
  (call $8
   (i32.div_u
    (i32.load
     (i32.wrap_i64
      (local.tee $0
       (call $13
        (i64.const 12884902668)
        (i64.const 12884902677)
       )
      )
     )
    )
    (i32.const 2)
   )
   (i32.const 5)
   (i64.const 12884902688)
  )
  (call $8
   (call $14
    (local.get $0)
    (i32.const 0)
   )
   (i32.const 97)
   (i64.const 12884902739)
  )
  (call $8
   (call $14
    (local.get $0)
    (i32.const 1)
   )
   (i32.const 98)
   (i64.const 12884902780)
  )
  (call $8
   (call $14
    (local.get $0)
    (i32.const 2)
   )
   (i32.const 181)
   (i64.const 12884902821)
  )
  (call $8
   (call $14
    (local.get $0)
    (i32.const 3)
   )
   (i32.const 9884)
   (i64.const 12884902862)
  )
  (call $8
   (call $14
    (local.get $0)
    (i32.const 4)
   )
   (i32.const 65038)
   (i64.const 12884902913)
  )
  (call $fimport$2)
 )
 (func $19 (; 24 ;)
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
 )
)
