(module
 (type $0 (func (param i32)))
 (type $1 (func (param i32 i32)))
 (type $2 (func))
 (type $3 (func (param i64 i32)))
 (type $4 (func (param i64)))
 (type $5 (func (result i32)))
 (type $6 (func (param i32) (result i32)))
 (type $7 (func (param i64) (result i64)))
 (type $8 (func (param i32 i32 i32) (result i32)))
 (type $9 (func (param i32 i32 i32)))
 (type $10 (func (param i64 i64) (result i32)))
 (type $11 (func (param i64 i64 i64)))
 (type $12 (func (param i32 i32 i64)))
 (type $13 (func (param i32 i64)))
 (type $14 (func (param i64 i64) (result i64)))
 (type $15 (func (param i64 i32) (result i32)))
 (import "test" "pushTest" (func $fimport$0 (param i32)))
 (import "test" "registerAssertion" (func $fimport$1 (param i32 i32)))
 (import "test" "popTest" (func $fimport$2))
 (import "env" "printf" (func $fimport$3 (param i32 i32)))
 (import "env" "printf" (func $fimport$4 (param i32 i32)))
 (import "env" "printf" (func $fimport$5 (param i32 i32)))
 (memory $0 1)
 (data (i32.const 1130) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 1157) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 1190) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 1217) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 1250) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 1277) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 1310) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 1337) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 1370) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 1397) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 1430) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 1457) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 1490) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 1517) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 1550) "\1a\00\00\00a\00s\00s\00e\00r\00t\00(\00f\00a\00l\00s\00e\00)")
 (data (i32.const 1088) "\08\00\00\00t\00r\00u\00e")
 (data (i32.const 1101) "\n\00\00\00f\00a\00l\00s\00e")
 (data (i32.const 1116) "\02\00\00\000")
 (data (i32.const 1123) "\02\00\00\000")
 (data (i32.const 16) ".\00\00\00T\00e\00s\00t\00 \00b\00y\00t\00e\00 \00c\00o\00n\00c\00a\00t\00e\00n\00a\00t\00i\00o\00n")
 (data (i32.const 67) "\06\00\00\00a\00b\00c")
 (data (i32.const 78) "\08\00\00\001\002\003\004")
 (data (i32.const 91) "\1a\00\00\00a\00.\00l\00e\00n\00g\00t\00h\00 \00=\00=\00 \006")
 (data (i32.const 122) "\1a\00\00\00a\00.\00l\00e\00n\00g\00t\00h\00 \00=\00=\00 \006")
 (data (i32.const 153) "\1c\00\00\00c\00.\00l\00e\00n\00g\00t\00h\00 \00=\00=\00 \001\002")
 (data (i32.const 186) "\0e\00\00\00a\00b\00c\001\002\003\004")
 (data (i32.const 205) "$\00\00\00c\00 \00=\00=\00 \00\'\00a\00b\00c\001\002\003\004\00\'\00 \00(\001\00)")
 (data (i32.const 246) "\0e\00\00\00a\00b\00c\001\002\003\004")
 (data (i32.const 265) "$\00\00\00c\00 \00=\00=\00 \00\'\00a\00b\00c\001\002\003\004\00\'\00 \00(\002\00)")
 (data (i32.const 306) "\1c\00\00\00d\00.\00l\00e\00n\00g\00t\00h\00 \00=\00=\00 \002\008")
 (data (i32.const 339) "\1c\00\00\00a\00b\00c\001\002\003\004\00a\00b\00c\001\002\003\004")
 (data (i32.const 372) ",\00\00\00T\00e\00s\00t\00 \00s\00t\00r\00i\00n\00g\00 \00o\00p\00e\00r\00a\00t\00i\00o\00n\00s")
 (data (i32.const 421) "\0c\00\00\00a\00s\00d\00n\'5\d8\11\dc")
 (data (i32.const 438) "\1e\00\00\00s\00t\00r\00.\00l\00e\00n\00g\00t\00h\00 \00=\00=\00 \006")
 (data (i32.const 473) "\12\00\00\00c\00h\00a\00r\00 \00a\00t\00 \000")
 (data (i32.const 496) "\12\00\00\00c\00h\00a\00r\00 \00a\00t\00 \001")
 (data (i32.const 519) "\12\00\00\00c\00h\00a\00r\00 \00a\00t\00 \002")
 (data (i32.const 542) "\12\00\00\00c\00h\00a\00r\00 \00a\00t\00 \003")
 (data (i32.const 565) "\12\00\00\00c\00h\00a\00r\00 \00a\00t\00 \004")
 (data (i32.const 588) "\12\00\00\00c\00h\00a\00r\00 \00a\00t\00 \005")
 (data (i32.const 611) "(\00\00\00S\00t\00r\00i\00n\00g\00 \00c\00o\00n\00c\00a\00t\00e\00n\00a\00t\00i\00o\00n")
 (data (i32.const 656) "\04\00\00\00d\00s")
 (data (i32.const 665) "\04\00\00\00s\00a")
 (data (i32.const 674) ".\00\00\00S\00t\00r\00i\00n\00g\00.\00l\00e\00n\00g\00t\00h\00 \00m\00u\00s\00t\00 \00b\00e\00 \003")
 (data (i32.const 725) "8\00\00\00S\00t\00r\00i\00n\00g\00.\00d\00a\00t\00a\00.\00l\00e\00n\00g\00t\00h\00 \00m\00u\00s\00t\00 \00b\00e\00 \006")
 (data (i32.const 786) "4\00\00\00S\00t\00r\00i\00n\00g\00 \00c\00o\00n\00c\00a\00t\00e\00n\00a\00t\00i\00o\00n\00 \00U\00T\00F\001\006")
 (data (i32.const 843) "\04\00\00\00a\00b")
 (data (i32.const 852) "\06\00\00\00\b5\00\9c&\0e\fe")
 (data (i32.const 863) "$\00\00\00a\00 \00a\00s\00s\00e\00r\00t\00i\00o\00n\00 \00f\00a\00i\00l\00e\00d")
 (data (i32.const 904) "$\00\00\00b\00 \00a\00s\00s\00e\00r\00t\00i\00o\00n\00 \00f\00a\00i\00l\00e\00d")
 (data (i32.const 945) "$\00\00\00\b5\00 \00a\00s\00s\00e\00r\00t\00i\00o\00n\00 \00f\00a\00i\00l\00e\00d")
 (data (i32.const 986) ".\00\00\000\00x\002\006\009\00C\00 \00a\00s\00s\00e\00r\00t\00i\00o\00n\00 \00f\00a\00i\00l\00e\00d")
 (data (i32.const 1037) ".\00\00\000\00x\00F\00E\000\00E\00 \00a\00s\00s\00e\00r\00t\00i\00o\00n\00 \00f\00a\00i\00l\00e\00d")
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
 (export "test_getLastErrorMessage" (func $11))
 (export "main" (func $19))
 (start $20)
 (func $0 (; 6 ;) (type $3) (param $0 i64) (param $1 i32)
  (call $fimport$3
   (i32.wrap_i64
    (local.get $0)
   )
   (local.get $1)
  )
 )
 (func $1 (; 7 ;) (type $3) (param $0 i64) (param $1 i32)
  (call $fimport$4
   (i32.wrap_i64
    (local.get $0)
   )
   (local.get $1)
  )
 )
 (func $2 (; 8 ;) (type $3) (param $0 i64) (param $1 i32)
  (call $fimport$5
   (i32.wrap_i64
    (local.get $0)
   )
   (local.get $1)
  )
 )
 (func $3 (; 9 ;) (type $5) (result i32)
  (global.get $global$6)
 )
 (func $4 (; 10 ;) (type $6) (param $0 i32) (result i32)
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
 (func $5 (; 11 ;) (type $8) (param $0 i32) (param $1 i32) (param $2 i32) (result i32)
  (local $3 i32)
  (local $4 i64)
  (local $5 i64)
  (local.set $4
   (i64.extend_i32_s
    (local.get $0)
   )
  )
  (local.set $5
   (i64.extend_i32_s
    (local.get $1)
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
   (local.get $1)
   (local.get $2)
  )
 )
 (func $6 (; 12 ;) (type $9) (param $0 i32) (param $1 i32) (param $2 i32)
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
 (func $7 (; 13 ;) (type $12) (param $0 i32) (param $1 i32) (param $2 i64)
  (call $13
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
     (i64.const 1250)
     (local.get $0)
    )
    (call $1
     (i64.const 1277)
     (local.get $1)
    )
   )
  )
 )
 (func $8 (; 14 ;) (type $12) (param $0 i32) (param $1 i32) (param $2 i64)
  (call $13
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
    (call $0
     (i64.const 1310)
     (local.get $0)
    )
    (call $0
     (i64.const 1337)
     (local.get $1)
    )
   )
  )
 )
 (func $9 (; 15 ;) (type $12) (param $0 i32) (param $1 i32) (param $2 i64)
  (call $13
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
    (call $2
     (i64.const 1370)
     (local.get $0)
    )
    (call $2
     (i64.const 1397)
     (local.get $1)
    )
   )
  )
 )
 (func $10 (; 16 ;) (type $11) (param $0 i64) (param $1 i64) (param $2 i64)
  (call $13
   (call $18
    (local.get $0)
    (local.get $1)
   )
   (local.get $2)
  )
 )
 (func $11 (; 17 ;) (type $5) (result i32)
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
 (func $12 (; 18 ;) (type $4) (param $0 i64)
  (call $fimport$0
   (i32.wrap_i64
    (local.get $0)
   )
  )
 )
 (func $13 (; 19 ;) (type $13) (param $0 i32) (param $1 i64)
  (call $fimport$1
   (local.get $0)
   (i32.wrap_i64
    (local.get $1)
   )
  )
 )
 (func $14 (; 20 ;) (type $7) (param $0 i64) (result i64)
  (local $1 i32)
  (local $2 i64)
  (call $6
   (local.tee $1
    (call $4
     (i32.const 8)
    )
   )
   (i32.const 0)
   (i32.const 8)
  )
  (i64.store
   (i32.wrap_i64
    (local.tee $2
     (i64.or
      (i64.extend_i32_u
       (local.get $1)
      )
      (i64.const 42949672960)
     )
    )
   )
   (local.get $0)
  )
  (local.get $2)
 )
 (func $15 (; 21 ;) (type $14) (param $0 i64) (param $1 i64) (result i64)
  (call $14
   (call $17
    (i64.load
     (i32.wrap_i64
      (local.get $0)
     )
    )
    (i64.load
     (i32.wrap_i64
      (local.get $1)
     )
    )
   )
  )
 )
 (func $16 (; 22 ;) (type $15) (param $0 i64) (param $1 i32) (result i32)
  (if
   (i32.gt_u
    (local.get $1)
    (i32.div_u
     (i32.load
      (i32.wrap_i64
       (i64.load
        (i32.wrap_i64
         (local.get $0)
        )
       )
      )
     )
     (i32.const 2)
    )
   )
   (unreachable)
  )
  (i32.load16_u
   (i32.add
    (i32.wrap_i64
     (i64.extend_i32_s
      (i32.add
       (i32.wrap_i64
        (i64.load
         (i32.wrap_i64
          (local.get $0)
         )
        )
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
 (func $17 (; 23 ;) (type $14) (param $0 i64) (param $1 i64) (result i64)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (call $6
   (local.tee $2
    (call $4
     (local.tee $6
      (i32.add
       (local.tee $5
        (i32.add
         (local.tee $3
          (i32.load
           (i32.wrap_i64
            (local.get $0)
           )
          )
         )
         (local.tee $4
          (i32.load
           (i32.wrap_i64
            (local.get $1)
           )
          )
         )
        )
       )
       (i32.const 4)
      )
     )
    )
   )
   (i32.const 0)
   (local.get $6)
  )
  (i32.store
   (local.get $2)
   (local.get $5)
  )
  (drop
   (call $5
    (i32.add
     (i32.wrap_i64
      (local.get $1)
     )
     (i32.const 4)
    )
    (call $5
     (i32.add
      (i32.wrap_i64
       (local.get $0)
      )
      (i32.const 4)
     )
     (i32.add
      (i32.wrap_i64
       (local.tee $0
        (i64.extend_i32_u
         (local.get $2)
        )
       )
      )
      (i32.const 4)
     )
     (local.get $3)
    )
    (local.get $4)
   )
  )
  (local.get $0)
 )
 (func $18 (; 24 ;) (type $10) (param $0 i64) (param $1 i64) (result i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (if (result i32)
   (i32.eq
    (i32.load
     (i32.wrap_i64
      (local.get $0)
     )
    )
    (i32.load
     (i32.wrap_i64
      (local.get $1)
     )
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
      (i32.load
       (i32.wrap_i64
        (local.get $0)
       )
      )
     )
     (local.set $3
      (i32.const 1)
     )
     (loop $label$4
      (block $label$5
       (if
        (i32.gt_u
         (local.tee $4
          (local.tee $2
           (i32.sub
            (local.get $2)
            (i32.const 1)
           )
          )
         )
         (i32.load
          (i32.wrap_i64
           (local.get $0)
          )
         )
        )
        (unreachable)
       )
       (if
        (i32.ne
         (block (result i32)
          (local.set $5
           (i32.load8_u
            (i32.add
             (local.get $4)
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
            )
           )
          )
          (if
           (i32.gt_u
            (local.get $2)
            (i32.load
             (i32.wrap_i64
              (local.get $1)
             )
            )
           )
           (unreachable)
          )
          (local.get $5)
         )
         (i32.load8_u
          (i32.add
           (local.get $2)
           (i32.wrap_i64
            (i64.extend_i32_s
             (i32.add
              (i32.wrap_i64
               (local.get $1)
              )
              (i32.const 4)
             )
            )
           )
          )
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
 (func $19 (; 25 ;) (type $2)
  (local $0 i64)
  (local $1 i64)
  (call $12
   (i64.const 16)
  )
  (local.set $0
   (call $17
    (i64.const 67)
    (i64.const 78)
   )
  )
  (call $7
   (i32.load
    (i32.const 67)
   )
   (i32.const 6)
   (i64.const 91)
  )
  (call $7
   (i32.load
    (i32.const 78)
   )
   (i32.const 8)
   (i64.const 122)
  )
  (call $7
   (i32.load
    (i32.wrap_i64
     (local.get $0)
    )
   )
   (i32.const 14)
   (i64.const 153)
  )
  (call $10
   (local.get $0)
   (i64.const 186)
   (i64.const 205)
  )
  (local.set $1
   (call $17
    (local.get $0)
    (local.get $0)
   )
  )
  (call $10
   (local.get $0)
   (i64.const 246)
   (i64.const 265)
  )
  (call $7
   (i32.load
    (i32.wrap_i64
     (local.get $1)
    )
   )
   (i32.const 28)
   (i64.const 306)
  )
  (call $10
   (local.get $1)
   (i64.const 339)
   (local.get $1)
  )
  (call $fimport$2)
  (call $12
   (i64.const 372)
  )
  (call $7
   (i32.div_u
    (i32.load
     (i32.wrap_i64
      (i64.load
       (i32.wrap_i64
        (local.tee $0
         (call $14
          (i64.const 421)
         )
        )
       )
      )
     )
    )
    (i32.const 2)
   )
   (i32.const 6)
   (i64.const 438)
  )
  (call $9
   (call $16
    (local.get $0)
    (i32.const 0)
   )
   (i32.const 97)
   (i64.const 473)
  )
  (call $9
   (call $16
    (local.get $0)
    (i32.const 1)
   )
   (i32.const 115)
   (i64.const 496)
  )
  (call $9
   (call $16
    (local.get $0)
    (i32.const 2)
   )
   (i32.const 100)
   (i64.const 519)
  )
  (call $9
   (call $16
    (local.get $0)
    (i32.const 3)
   )
   (i32.const 10094)
   (i64.const 542)
  )
  (call $9
   (call $16
    (local.get $0)
    (i32.const 4)
   )
   (i32.const 55349)
   (i64.const 565)
  )
  (call $9
   (call $16
    (local.get $0)
    (i32.const 5)
   )
   (i32.const 56337)
   (i64.const 588)
  )
  (call $fimport$2)
  (call $12
   (i64.const 611)
  )
  (call $8
   (i32.div_u
    (i32.load
     (i32.wrap_i64
      (i64.load
       (i32.wrap_i64
        (local.tee $0
         (call $15
          (call $14
           (i64.const 656)
          )
          (call $14
           (i64.const 665)
          )
         )
        )
       )
      )
     )
    )
    (i32.const 2)
   )
   (i32.const 4)
   (i64.const 674)
  )
  (call $8
   (i32.load
    (i32.wrap_i64
     (i64.load
      (i32.wrap_i64
       (local.get $0)
      )
     )
    )
   )
   (i32.const 8)
   (i64.const 725)
  )
  (call $fimport$2)
  (call $12
   (i64.const 786)
  )
  (call $8
   (call $16
    (local.tee $0
     (call $15
      (call $14
       (i64.const 843)
      )
      (call $14
       (i64.const 852)
      )
     )
    )
    (i32.const 0)
   )
   (i32.const 97)
   (i64.const 863)
  )
  (call $8
   (call $16
    (local.get $0)
    (i32.const 1)
   )
   (i32.const 98)
   (i64.const 904)
  )
  (call $8
   (call $16
    (local.get $0)
    (i32.const 2)
   )
   (i32.const 181)
   (i64.const 945)
  )
  (call $8
   (call $16
    (local.get $0)
    (i32.const 3)
   )
   (i32.const 9884)
   (i64.const 986)
  )
  (call $8
   (call $16
    (local.get $0)
    (i32.const 4)
   )
   (i32.const 65038)
   (i64.const 1037)
  )
  (call $fimport$2)
 )
 (func $20 (; 26 ;) (type $2)
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
