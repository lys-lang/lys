(module
 (type $none_=>_none (func))
 (type $i32_i32_=>_none (func (param i32 i32)))
 (type $i32_i64_=>_none (func (param i32 i64)))
 (type $i64_=>_none (func (param i64)))
 (type $i64_i32_=>_none (func (param i64 i32)))
 (type $i64_i64_=>_none (func (param i64 i64)))
 (type $none_=>_i32 (func (result i32)))
 (type $i64_=>_i32 (func (param i64) (result i32)))
 (type $i64_=>_i64 (func (param i64) (result i64)))
 (type $i64_i64_=>_i64 (func (param i64 i64) (result i64)))
 (type $i32_=>_none (func (param i32)))
 (type $i64_i64_i32_=>_none (func (param i64 i64 i32)))
 (type $i32_=>_i32 (func (param i32) (result i32)))
 (type $i32_i32_i32_=>_i32 (func (param i32 i32 i32) (result i32)))
 (type $i64_i32_=>_i32 (func (param i64 i32) (result i32)))
 (type $i64_i64_=>_i32 (func (param i64 i64) (result i32)))
 (type $i32_=>_i64 (func (param i32) (result i64)))
 (import "test" "pushTest" (func $fimport$0 (param i32)))
 (import "test" "registerAssertion" (func $fimport$1 (param i32 i32)))
 (import "test" "popTest" (func $fimport$2))
 (import "env" "printf" (func $fimport$3 (param i32 i32)))
 (memory $0 1)
 (data (i32.const 692) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 719) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 752) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 779) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 812) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 847) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 888) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 923) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 964) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 999) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 1040) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 1075) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 1116) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00X")
 (data (i32.const 1143) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00X")
 (data (i32.const 1176) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 1203) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 1236) "\1a\00\00\00a\00s\00s\00e\00r\00t\00(\00f\00a\00l\00s\00e\00)")
 (data (i32.const 650) "\08\00\00\00t\00r\00u\00e")
 (data (i32.const 663) "\n\00\00\00f\00a\00l\00s\00e")
 (data (i32.const 678) "\02\00\00\000")
 (data (i32.const 685) "\02\00\00\000")
 (data (i32.const 16) "\1c\00\00\00 \00 \00 \00 \00n\00u\00m\00b\00e\00r\00:\00 \00%\00d")
 (data (i32.const 49) "\1c\00\00\00 \00 \00 \00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 82) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 115) "$\00\00\00a\00s\00s\00e\00r\00t\00N\00u\00m\00b\00e\00r\00L\00e\00n\00g\00t\00h")
 (data (i32.const 156) "\10\00\00\00G\00i\00v\00e\00n\00:\00 \00\'")
 (data (i32.const 177) "\1a\00\00\00\'\00 \00E\00x\00p\00e\00c\00t\00e\00d\00:\00 \00\'")
 (data (i32.const 208) "\02\00\00\00\'")
 (data (i32.const 215) "\0c\00\00\00g\00i\00v\00e\00n\00:")
 (data (i32.const 232) "\12\00\00\00e\00x\00p\00e\00c\00t\00e\00d\00:")
 (data (i32.const 255) "4\00\00\00s\00t\00r\00i\00n\00g\00i\00f\00y\00c\00a\00t\00i\00o\00n\00 \00o\00f\00 \00n\00u\00m\00b\00e\00r\00s")
 (data (i32.const 312) "(\00\00\00t\00e\00s\00t\00 \00s\00t\00r\00i\00n\00g\00 \00e\00q\00u\00a\00l\00i\00t\00y")
 (data (i32.const 357) "\08\00\00\00a\00b\00c\00d")
 (data (i32.const 370) "\08\00\00\00a\00b\00c\00d")
 (data (i32.const 383) "8\00\00\00g\00e\00t\00 \00n\00u\00m\00b\00e\00r\00 \00c\00h\00a\00r\00a\00c\00t\00e\00r\00s\00 \00l\00e\00n\00g\00t\00h")
 (data (i32.const 444) "(\00\00\00n\00u\00m\00b\00e\00r\00 \00s\00e\00r\00i\00a\00l\00i\00z\00a\00t\00i\00o\00n")
 (data (i32.const 489) "\02\00\00\001")
 (data (i32.const 496) "\04\00\00\00-\001")
 (data (i32.const 505) "\0e\00\00\002\002\002\002\002\002\002")
 (data (i32.const 524) "\0e\00\00\003\003\003\003\003\003\003")
 (data (i32.const 543) "\0e\00\00\00-\004\004\004\004\004\004")
 (data (i32.const 562) "\12\00\00\001\002\003\004\005\006\007\008\009")
 (data (i32.const 585) "\0c\00\00\001\000\000\000\000\000")
 (data (i32.const 602) "\08\00\00\002\000\000\000")
 (data (i32.const 615) "\0c\00\00\003\000\000\000\000\000")
 (data (i32.const 632) "\08\00\00\004\000\000\000")
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
 (export "test_getLastErrorMessage" (func $6))
 (export "main" (func $24))
 (start $25)
 (func $0 (; 4 ;) (result i32)
  (global.get $global$6)
 )
 (func $1 (; 5 ;) (param $0 i32) (result i32)
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
 (func $2 (; 6 ;) (param $0 i32) (param $1 i32) (param $2 i32) (result i32)
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
 (func $3 (; 7 ;) (param $0 i32) (param $1 i32)
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
 (func $4 (; 8 ;) (param $0 i64) (param $1 i32)
  (call $fimport$3
   (i32.wrap_i64
    (local.get $0)
   )
   (local.get $1)
  )
 )
 (func $5 (; 9 ;) (param $0 i64)
  (call $4
   (local.get $0)
   (i32.const 0)
  )
 )
 (func $6 (; 10 ;) (result i32)
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
 (func $7 (; 11 ;) (param $0 i64)
  (call $fimport$0
   (i32.wrap_i64
    (local.get $0)
   )
  )
 )
 (func $8 (; 12 ;) (param $0 i32) (param $1 i64)
  (call $fimport$1
   (local.get $0)
   (i32.wrap_i64
    (local.get $1)
   )
  )
 )
 (func $9 (; 13 ;) (param $0 i32) (result i64)
  (local $1 i32)
  (local $2 i32)
  (call $3
   (local.tee $1
    (call $1
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
 (func $10 (; 14 ;) (param $0 i64) (param $1 i64) (result i64)
  (call $12
   (local.get $0)
   (local.get $1)
  )
 )
 (func $11 (; 15 ;) (param $0 i64) (param $1 i32) (result i32)
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
 (func $12 (; 16 ;) (param $0 i64) (param $1 i64) (result i64)
  (local $2 i32)
  (local $3 i32)
  (local $4 i64)
  (drop
   (call $2
    (call $2
     (i32.add
      (i32.wrap_i64
       (local.tee $4
        (call $9
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
 (func $13 (; 17 ;) (param $0 i64) (param $1 i64) (result i32)
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
         (call $11
          (local.get $0)
          (local.tee $2
           (i32.sub
            (local.get $2)
            (i32.const 1)
           )
          )
         )
         (call $11
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
 (func $14 (; 18 ;) (param $0 i64) (result i32)
  (local $1 i32)
  (if (result i32)
   (i64.eqz
    (local.get $0)
   )
   (i32.const 1)
   (block (result i32)
    (if
     (i64.lt_s
      (local.get $0)
      (i64.const 0)
     )
     (block
      (local.set $1
       (i32.const 1)
      )
      (local.set $0
       (i64.mul
        (local.get $0)
        (i64.const -1)
       )
      )
     )
    )
    (loop $label$4
     (local.set $1
      (i32.add
       (local.get $1)
       (i32.const 1)
      )
     )
     (br_if $label$4
      (i64.gt_s
       (local.tee $0
        (i64.div_s
         (local.get $0)
         (i64.const 10)
        )
       )
       (i64.const 0)
      )
     )
    )
    (local.get $1)
   )
  )
 )
 (func $15 (; 19 ;) (param $0 i64) (result i32)
  (local $1 i32)
  (if (result i32)
   (i64.eqz
    (local.get $0)
   )
   (i32.const 1)
   (block (result i32)
    (loop $label$3
     (local.set $1
      (i32.add
       (local.get $1)
       (i32.const 1)
      )
     )
     (br_if $label$3
      (i64.gt_u
       (local.tee $0
        (i64.div_u
         (local.get $0)
         (i64.const 10)
        )
       )
       (i64.const 0)
      )
     )
    )
    (local.get $1)
   )
  )
 )
 (func $16 (; 20 ;) (param $0 i64) (param $1 i64) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i64)
  (local $6 i64)
  (loop $label$1
   (br_if $label$1
    (i32.eqz
     (i64.eqz
      (local.tee $1
       (block (result i64)
        (local.set $6
         (i64.div_u
          (local.get $1)
          (i64.const 10)
         )
        )
        (local.set $3
         (i32.and
          (i32.add
           (i32.and
            (i32.wrap_i64
             (i64.rem_u
              (local.get $1)
              (i64.const 10)
             )
            )
            (i32.const 65535)
           )
           (i32.const 48)
          )
          (i32.const 65535)
         )
        )
        (if
         (i32.gt_u
          (i32.add
           (local.tee $4
            (i32.shl
             (local.tee $2
              (i32.sub
               (local.get $2)
               (i32.const 1)
              )
             )
             (i32.const 1)
            )
           )
           (i32.const 1)
          )
          (i32.load
           (i32.wrap_i64
            (local.get $0)
           )
          )
         )
         (unreachable)
        )
        (i32.store16
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
         (local.get $3)
        )
        (local.get $6)
       )
      )
     )
    )
   )
  )
 )
 (func $17 (; 21 ;) (param $0 i64) (result i64)
  (local $1 i32)
  (local $2 i64)
  (if (result i64)
   (i64.eqz
    (local.get $0)
   )
   (i64.const 12884902566)
   (block (result i64)
    (local.set $2
     (call $9
      (i32.shl
       (local.tee $1
        (call $14
         (local.get $0)
        )
       )
       (i32.const 1)
      )
     )
    )
    (if
     (i64.gt_s
      (local.get $0)
      (i64.const 0)
     )
     (call $16
      (local.get $2)
      (local.get $0)
      (local.get $1)
     )
     (call $16
      (local.get $2)
      (i64.mul
       (local.get $0)
       (i64.const -1)
      )
      (local.get $1)
     )
    )
    (if
     (i64.lt_s
      (local.get $0)
      (i64.const 0)
     )
     (i32.store16
      (i32.wrap_i64
       (i64.extend_i32_s
        (i32.add
         (i32.wrap_i64
          (local.get $2)
         )
         (i32.const 4)
        )
       )
      )
      (i32.const 45)
     )
    )
    (i64.or
     (i64.and
      (local.get $2)
      (i64.const 4294967295)
     )
     (i64.const 12884901888)
    )
   )
  )
 )
 (func $18 (; 22 ;) (param $0 i64) (result i64)
  (local $1 i32)
  (local $2 i64)
  (if (result i64)
   (i64.eqz
    (local.get $0)
   )
   (i64.const 12884902573)
   (block (result i64)
    (call $16
     (local.tee $2
      (call $9
       (i32.shl
        (local.tee $1
         (call $15
          (local.get $0)
         )
        )
        (i32.const 1)
       )
      )
     )
     (local.get $0)
     (local.get $1)
    )
    (i64.or
     (i64.and
      (local.get $2)
      (i64.const 4294967295)
     )
     (i64.const 12884901888)
    )
   )
  )
 )
 (func $19 (; 23 ;) (param $0 i64) (param $1 i64)
  (call $23
   (call $18
    (local.get $0)
   )
   (local.get $1)
  )
 )
 (func $20 (; 24 ;) (param $0 i32) (param $1 i64)
  (call $23
   (call $17
    (i64.extend_i32_s
     (local.get $0)
    )
   )
   (local.get $1)
  )
 )
 (func $21 (; 25 ;) (param $0 i32) (param $1 i64)
  (call $19
   (i64.extend_i32_u
    (local.get $0)
   )
   (local.get $1)
  )
 )
 (func $22 (; 26 ;) (param $0 i64) (param $1 i32)
  (local $2 i32)
  (local $3 i32)
  (if
   (select
    (i32.const 0)
    (i32.const 1)
    (local.tee $3
     (i32.eq
      (local.get $1)
      (local.tee $2
       (call $14
        (local.get $0)
       )
      )
     )
    )
   )
   (block
    (call $4
     (i64.const 12884901904)
     (i32.wrap_i64
      (local.get $0)
     )
    )
    (call $4
     (i64.const 12884901937)
     (local.get $2)
    )
    (call $4
     (i64.const 12884901970)
     (local.get $1)
    )
   )
  )
  (call $8
   (local.get $3)
   (i64.const 12884902003)
  )
 )
 (func $23 (; 27 ;) (param $0 i64) (param $1 i64)
  (local $2 i32)
  (local $3 i64)
  (local.set $3
   (call $10
    (call $10
     (call $10
      (call $10
       (i64.const 12884902044)
       (local.get $0)
      )
      (i64.const 12884902065)
     )
     (local.get $1)
    )
    (i64.const 12884902096)
   )
  )
  (if
   (select
    (i32.const 0)
    (i32.const 1)
    (local.tee $2
     (call $13
      (local.get $0)
      (local.get $1)
     )
    )
   )
   (block
    (call $5
     (i64.const 12884902103)
    )
    (call $5
     (local.get $0)
    )
    (call $5
     (i64.const 12884902120)
    )
    (call $5
     (local.get $1)
    )
   )
  )
  (call $8
   (local.get $2)
   (local.get $3)
  )
 )
 (func $24 (; 28 ;)
  (call $7
   (i64.const 12884902143)
  )
  (call $7
   (i64.const 12884902200)
  )
  (call $23
   (i64.const 12884902245)
   (i64.const 12884902258)
  )
  (call $fimport$2)
  (call $7
   (i64.const 12884902271)
  )
  (call $22
   (i64.const 2)
   (i32.const 1)
  )
  (call $22
   (i64.const 4444)
   (i32.const 4)
  )
  (call $22
   (i64.const -2)
   (i32.const 2)
  )
  (call $22
   (i64.const -33)
   (i32.const 3)
  )
  (call $22
   (i64.const -1)
   (i32.const 2)
  )
  (call $22
   (i64.const 0)
   (i32.const 1)
  )
  (call $22
   (i64.const 2222222)
   (i32.const 7)
  )
  (call $22
   (i64.const 3333333)
   (i32.const 7)
  )
  (call $22
   (i64.const -444444)
   (i32.const 7)
  )
  (call $22
   (i64.const 123456789)
   (i32.const 9)
  )
  (call $22
   (i64.const 100000)
   (i32.const 6)
  )
  (call $22
   (i64.const 2000)
   (i32.const 4)
  )
  (call $22
   (i64.const 300000)
   (i32.const 6)
  )
  (call $22
   (i64.const 4000)
   (i32.const 4)
  )
  (call $22
   (i64.const -4000)
   (i32.const 5)
  )
  (call $fimport$2)
  (call $7
   (i64.const 12884902332)
  )
  (call $20
   (i32.const 1)
   (i64.const 12884902377)
  )
  (call $20
   (i32.const -1)
   (i64.const 12884902384)
  )
  (call $19
   (i64.const 2222222)
   (i64.const 12884902393)
  )
  (call $20
   (i32.const 3333333)
   (i64.const 12884902412)
  )
  (call $20
   (i32.const -444444)
   (i64.const 12884902431)
  )
  (call $21
   (i32.const 123456789)
   (i64.const 12884902450)
  )
  (call $21
   (i32.const 100000)
   (i64.const 12884902473)
  )
  (call $21
   (i32.const 2000)
   (i64.const 12884902490)
  )
  (call $20
   (i32.const 300000)
   (i64.const 12884902503)
  )
  (call $20
   (i32.const 4000)
   (i64.const 12884902520)
  )
  (call $fimport$2)
  (call $fimport$2)
 )
 (func $25 (; 29 ;)
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
