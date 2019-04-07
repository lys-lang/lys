(module
 (type $0 (func (param i32)))
 (type $1 (func (param i32 i32)))
 (type $2 (func))
 (type $3 (func (result i32)))
 (type $4 (func (param i32) (result i32)))
 (type $5 (func (param i32) (result i64)))
 (type $6 (func (param i64) (result i64)))
 (type $7 (func (param i32 i32 i32) (result i32)))
 (type $8 (func (param i64 i32)))
 (type $9 (func (param i64)))
 (type $10 (func (param i64) (result i32)))
 (type $11 (func (param i64 i64) (result i32)))
 (type $12 (func (param i64 i64 i32)))
 (type $13 (func (param i64 i64)))
 (type $14 (func (param i32 i64)))
 (type $15 (func (param i64 i64) (result i64)))
 (type $16 (func (param i32 i32)))
 (import "test" "pushTest" (func $fimport$0 (param i32)))
 (import "test" "registerAssertion" (func $fimport$1 (param i32 i32)))
 (import "test" "popTest" (func $fimport$2))
 (import "env" "printf" (func $fimport$3 (param i32 i32)))
 (memory $0 1)
 (data (i32.const 687) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 714) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 747) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 774) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 807) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 842) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 883) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 918) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 959) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 994) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 1035) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 1070) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 1111) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00X")
 (data (i32.const 1138) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00X")
 (data (i32.const 1171) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 1198) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 1231) "\1a\00\00\00a\00s\00s\00e\00r\00t\00(\00f\00a\00l\00s\00e\00)")
 (data (i32.const 645) "\08\00\00\00t\00r\00u\00e")
 (data (i32.const 658) "\n\00\00\00f\00a\00l\00s\00e")
 (data (i32.const 673) "\02\00\00\000")
 (data (i32.const 680) "\02\00\00\000")
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
 (export "test_getLastErrorMessage" (func $7))
 (export "main" (func $22))
 (start $23)
 (func $0 (; 4 ;) (type $3) (result i32)
  (global.get $global$6)
 )
 (func $1 (; 5 ;) (type $5) (param $0 i32) (result i64)
  (local $1 i32)
  (local $2 i32)
  (call $4
   (local.tee $1
    (call $2
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
  (i64.extend_i32_u
   (local.get $1)
  )
 )
 (func $2 (; 6 ;) (type $4) (param $0 i32) (result i32)
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
 (func $3 (; 7 ;) (type $7) (param $0 i32) (param $1 i32) (param $2 i32) (result i32)
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
 (func $4 (; 8 ;) (type $16) (param $0 i32) (param $1 i32)
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
 (func $5 (; 9 ;) (type $8) (param $0 i64) (param $1 i32)
  (call $fimport$3
   (i32.wrap_i64
    (local.get $0)
   )
   (local.get $1)
  )
 )
 (func $6 (; 10 ;) (type $9) (param $0 i64)
  (call $5
   (local.get $0)
   (i32.const 0)
  )
 )
 (func $7 (; 11 ;) (type $3) (result i32)
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
      (i64.const 81604378624)
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
 (func $8 (; 12 ;) (type $9) (param $0 i64)
  (call $fimport$0
   (i32.wrap_i64
    (local.get $0)
   )
  )
 )
 (func $9 (; 13 ;) (type $14) (param $0 i32) (param $1 i64)
  (call $fimport$1
   (local.get $0)
   (i32.wrap_i64
    (local.get $1)
   )
  )
 )
 (func $10 (; 14 ;) (type $10) (param $0 i64) (result i32)
  (local $1 i32)
  (local $2 i64)
  (if (result i32)
   (i64.eq
    (local.get $0)
    (i64.const 0)
   )
   (i32.const 1)
   (block (result i32)
    (local.set $2
     (i64.const 10)
    )
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
 (func $11 (; 15 ;) (type $10) (param $0 i64) (result i32)
  (local $1 i32)
  (local $2 i64)
  (if (result i32)
   (i64.eq
    (local.get $0)
    (i64.const 0)
   )
   (i32.const 1)
   (block (result i32)
    (local.set $2
     (i64.const 10)
    )
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
 (func $12 (; 16 ;) (type $12) (param $0 i64) (param $1 i64) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i64)
  (local $6 i64)
  (loop $label$1
   (br_if $label$1
    (i64.ne
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
     (i64.const 0)
    )
   )
  )
 )
 (func $13 (; 17 ;) (type $6) (param $0 i64) (result i64)
  (local $1 i32)
  (local $2 i64)
  (if (result i64)
   (i64.eq
    (local.get $0)
    (i64.const 0)
   )
   (i64.const 673)
   (block (result i64)
    (local.set $2
     (call $1
      (i32.shl
       (local.tee $1
        (call $10
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
     (call $12
      (local.get $2)
      (local.get $0)
      (local.get $1)
     )
     (call $12
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
    (local.get $2)
   )
  )
 )
 (func $14 (; 18 ;) (type $6) (param $0 i64) (result i64)
  (local $1 i32)
  (local $2 i64)
  (if (result i64)
   (i64.eq
    (local.get $0)
    (i64.const 0)
   )
   (i64.const 680)
   (block (result i64)
    (call $12
     (local.tee $2
      (call $1
       (i32.shl
        (local.tee $1
         (call $11
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
    (local.get $2)
   )
  )
 )
 (func $15 (; 19 ;) (type $15) (param $0 i64) (param $1 i64) (result i64)
  (local $2 i32)
  (local $3 i32)
  (local $4 i64)
  (drop
   (call $3
    (call $3
     (i32.add
      (i32.wrap_i64
       (local.tee $4
        (call $1
         (i32.add
          (local.tee $2
           (i32.load
            (i32.wrap_i64
             (local.get $0)
            )
           )
          )
          (local.tee $3
           (i32.load
            (i32.wrap_i64
             (local.get $1)
            )
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
  (local.get $4)
 )
 (func $16 (; 20 ;) (type $11) (param $0 i64) (param $1 i64) (result i32)
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
 (func $17 (; 21 ;) (type $13) (param $0 i64) (param $1 i64)
  (call $21
   (call $14
    (local.get $0)
   )
   (local.get $1)
  )
 )
 (func $18 (; 22 ;) (type $14) (param $0 i32) (param $1 i64)
  (call $21
   (call $13
    (i64.extend_i32_s
     (local.get $0)
    )
   )
   (local.get $1)
  )
 )
 (func $19 (; 23 ;) (type $14) (param $0 i32) (param $1 i64)
  (call $17
   (i64.extend_i32_u
    (local.get $0)
   )
   (local.get $1)
  )
 )
 (func $20 (; 24 ;) (type $8) (param $0 i64) (param $1 i32)
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
       (call $10
        (local.get $0)
       )
      )
     )
    )
   )
   (block
    (call $5
     (i64.const 16)
     (i32.wrap_i64
      (local.get $0)
     )
    )
    (call $5
     (i64.const 49)
     (local.get $2)
    )
    (call $5
     (i64.const 82)
     (local.get $1)
    )
   )
  )
  (call $9
   (local.get $3)
   (i64.const 115)
  )
 )
 (func $21 (; 25 ;) (type $13) (param $0 i64) (param $1 i64)
  (local $2 i32)
  (local $3 i64)
  (local.set $3
   (call $15
    (call $15
     (call $15
      (call $15
       (i64.const 156)
       (local.get $0)
      )
      (i64.const 177)
     )
     (local.get $1)
    )
    (i64.const 208)
   )
  )
  (if
   (select
    (i32.const 0)
    (i32.const 1)
    (local.tee $2
     (call $16
      (local.get $0)
      (local.get $1)
     )
    )
   )
   (block
    (call $6
     (i64.const 215)
    )
    (call $6
     (local.get $0)
    )
    (call $6
     (i64.const 232)
    )
    (call $6
     (local.get $1)
    )
   )
  )
  (call $9
   (local.get $2)
   (local.get $3)
  )
 )
 (func $22 (; 26 ;) (type $2)
  (call $8
   (i64.const 255)
  )
  (call $8
   (i64.const 312)
  )
  (call $21
   (i64.const 357)
   (i64.const 370)
  )
  (call $fimport$2)
  (call $8
   (i64.const 383)
  )
  (call $20
   (i64.const 2)
   (i32.const 1)
  )
  (call $20
   (i64.const 4444)
   (i32.const 4)
  )
  (call $20
   (i64.const -2)
   (i32.const 2)
  )
  (call $20
   (i64.const -33)
   (i32.const 3)
  )
  (call $20
   (i64.const -1)
   (i32.const 2)
  )
  (call $20
   (i64.const 0)
   (i32.const 1)
  )
  (call $20
   (i64.const 2222222)
   (i32.const 7)
  )
  (call $20
   (i64.const 3333333)
   (i32.const 7)
  )
  (call $20
   (i64.const -444444)
   (i32.const 7)
  )
  (call $20
   (i64.const 123456789)
   (i32.const 9)
  )
  (call $20
   (i64.const 100000)
   (i32.const 6)
  )
  (call $20
   (i64.const 2000)
   (i32.const 4)
  )
  (call $20
   (i64.const 300000)
   (i32.const 6)
  )
  (call $20
   (i64.const 4000)
   (i32.const 4)
  )
  (call $20
   (i64.const -4000)
   (i32.const 5)
  )
  (call $fimport$2)
  (call $8
   (i64.const 444)
  )
  (call $18
   (i32.const 1)
   (i64.const 489)
  )
  (call $18
   (i32.const -1)
   (i64.const 496)
  )
  (call $17
   (i64.const 2222222)
   (i64.const 505)
  )
  (call $18
   (i32.const 3333333)
   (i64.const 524)
  )
  (call $18
   (i32.const -444444)
   (i64.const 543)
  )
  (call $19
   (i32.const 123456789)
   (i64.const 562)
  )
  (call $19
   (i32.const 100000)
   (i64.const 585)
  )
  (call $19
   (i32.const 2000)
   (i64.const 602)
  )
  (call $18
   (i32.const 300000)
   (i64.const 615)
  )
  (call $18
   (i32.const 4000)
   (i64.const 632)
  )
  (call $fimport$2)
  (call $fimport$2)
 )
 (func $23 (; 27 ;) (type $2)
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
   (i64.const 77309411328)
  )
 )
)
