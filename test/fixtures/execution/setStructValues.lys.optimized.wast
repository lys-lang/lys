(module
 (type $0 (func (param i32 i32)))
 (type $1 (func))
 (type $2 (func (result i32)))
 (type $3 (func (param i64 i32)))
 (type $4 (func (param i32 i32 i64)))
 (type $5 (func (param i32)))
 (type $6 (func (param i32 i32) (result i32)))
 (type $7 (func (param i64 i64 i64)))
 (type $8 (func (param i64)))
 (type $9 (func (param i32 i64)))
 (type $10 (func (result i64)))
 (import "test" "printMemory" (func $fimport$0 (param i32 i32)))
 (import "test" "pushTest" (func $fimport$1 (param i32)))
 (import "test" "registerAssertion" (func $fimport$2 (param i32 i32)))
 (import "test" "popTest" (func $fimport$3))
 (import "env" "printf" (func $fimport$4 (param i32 i32)))
 (global $global$0 (mut i32) (i32.const 0))
 (global $global$1 (mut i32) (i32.const 0))
 (global $global$2 (mut i32) (i32.const 0))
 (global $global$3 (mut i32) (i32.const 0))
 (global $global$4 (mut i32) (i32.const 0))
 (global $global$5 (mut i32) (i32.const 0))
 (global $global$6 (mut i32) (i32.const 0))
 (global $global$7 (mut i64) (i64.const 0))
 (global $global$8 (mut i64) (i64.const 0))
 (global $global$9 (mut i64) (i64.const 0))
 (memory $0 1)
 (data $0 (i32.const 1669) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data $1 (i32.const 1696) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data $2 (i32.const 1729) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data $3 (i32.const 1756) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data $4 (i32.const 1789) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data $5 (i32.const 1824) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data $6 (i32.const 1865) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data $7 (i32.const 1900) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data $8 (i32.const 1941) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data $9 (i32.const 1976) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data $10 (i32.const 2017) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data $11 (i32.const 2052) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data $12 (i32.const 2093) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00X")
 (data $13 (i32.const 2120) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00X")
 (data $14 (i32.const 2153) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data $15 (i32.const 2180) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data $16 (i32.const 2213) "\1a\00\00\00a\00s\00s\00e\00r\00t\00(\00f\00a\00l\00s\00e\00)")
 (data $17 (i32.const 1627) "\08\00\00\00t\00r\00u\00e")
 (data $18 (i32.const 1640) "\n\00\00\00f\00a\00l\00s\00e")
 (data $19 (i32.const 1655) "\02\00\00\000")
 (data $20 (i32.const 1662) "\02\00\00\000")
 (data $21 (i32.const 16) "\10\00\00\00t\00e\00s\00t\00L\00o\00a\00d")
 (data $22 (i32.const 37) " \00\00\00i\003\002\00.\00l\00o\00a\00d\00(\00x\00)\00 \00=\00=\00 \000")
 (data $23 (i32.const 74) " \00\00\00i\003\002\00.\00l\00o\00a\00d\00(\00y\00)\00 \00=\00=\00 \000")
 (data $24 (i32.const 111) "\12\00\00\00t\00e\00s\00t\00S\00t\00o\00r\00e")
 (data $25 (i32.const 134) "\16\00\00\00t\00e\00s\00t\00N\00u\00m\00b\00e\00r\00s")
 (data $26 (i32.const 161) " \00\00\000\00x\00F\00F\00F\00F\00F\00F\00F\00F\00 \00=\00=\00 \00-\001")
 (data $27 (i32.const 198) "<\00\00\000\00x\00F\00F\00F\00F\00F\00F\00F\00F\00 \00a\00s\00 \00u\003\002\00 \00=\00=\00 \00-\001\00 \00a\00s\00 \00u\003\002")
 (data $28 (i32.const 263) "\1c\00\00\00i\003\002\00.\00l\00o\00a\00d\00(\00x\00)\00 \00%\00X")
 (data $29 (i32.const 296) "\1c\00\00\00i\003\002\00.\00l\00o\00a\00d\00(\00y\00)\00 \00%\00X")
 (data $30 (i32.const 329) "L\00\00\000\00x\00A\00B\00C\00D\00E\00F\000\001\00 \00a\00s\00 \00i\006\004\00 \00=\00=\00 \000\00x\00A\00B\00C\00D\00E\00F\000\001\00 \00a\00s\00 \00i\006\004")
 (data $31 (i32.const 410) " \00\00\00i\003\002\00.\00l\00o\00a\00d\00(\00x\00)\00 \00=\00=\00 \003")
 (data $32 (i32.const 447) "@\00\00\00i\003\002\00.\00l\00o\00a\00d\00(\00y\00)\00 \00a\00s\00 \00u\003\002\00 \00=\00=\00 \000\00x\00A\00B\00C\00D\00E\00F\000\001")
 (data $33 (i32.const 516) "@\00\00\00i\003\002\00.\00l\00o\00a\00d\00(\00y\00)\00 \00=\00=\00 \000\00x\00A\00B\00C\00D\00E\00F\000\001\00 \00a\00s\00 \00i\003\002")
 (data $34 (i32.const 585) "\16\00\00\00V\00A\00R\00 \00=\00=\00 \00V\00A\00R\002")
 (data $35 (i32.const 612) "N\00\00\00i\003\002\00.\00l\00o\00a\00d\00(\00y\00)\00 \00a\00s\00 \00i\006\004\00 \00=\00=\00 \000\00x\00A\00B\00C\00D\00E\00F\000\001\00 \00a\00s\00 \00i\006\004")
 (data $36 (i32.const 695) "N\00\00\00i\003\002\00.\00l\00o\00a\00d\00(\00y\00)\00 \00a\00s\00 \00u\006\004\00 \00=\00=\00 \000\00x\00A\00B\00C\00D\00E\00F\000\001\00 \00a\00s\00 \00u\006\004")
 (data $37 (i32.const 778) "2\00\00\00u\008\00.\00l\00o\00a\00d\00(\00y\00)\00 \00a\00s\00 \00i\003\002\00 \00=\00=\00 \000\00x\000\001")
 (data $38 (i32.const 833) "@\00\00\00u\008\00.\00l\00o\00a\00d\00(\00y\00,\00 \005\00 \00a\00s\00 \00u\003\002\00)\00 \00a\00s\00 \00i\003\002\00 \00=\00=\00 \005")
 (data $39 (i32.const 902) "(\00\00\00s\00e\00t\00 \00v\00a\00l\00u\00e\00s\00 \00i\00n\00 \00s\00t\00r\00u\00c\00t")
 (data $40 (i32.const 947) "4\00\00\00g\00e\00t\00t\00e\00r\00s\00 \00o\00f\00 \00t\00h\00e\00 \00c\00o\00n\00s\00t\00r\00u\00c\00t\00o\00r")
 (data $41 (i32.const 1004) "\16\00\00\00a\00 \00i\00s\00 \00C\00a\00t\00B\00a\00g")
 (data $42 (i32.const 1031) "\18\00\00\00a\00.\00f\00 \00i\00s\00 \00C\00o\00l\00o\00r")
 (data $43 (i32.const 1060) "\18\00\00\00a\00.\00g\00 \00i\00s\00 \00C\00o\00l\00o\00r")
 (data $44 (i32.const 1089) "\14\00\00\00a\00.\00f\00 \00i\00s\00 \00R\00e\00d")
 (data $45 (i32.const 1114) "\14\00\00\00a\00.\00g\00 \00i\00s\00 \00R\00e\00d")
 (data $46 (i32.const 1139) "\0e\00\00\00s\00e\00t\00t\00e\00r\00s")
 (data $47 (i32.const 1158) "&\00\00\00y\00.\00h\00e\00x\00 \00=\00=\00 \000\00x\00A\00A\00B\00B\00C\00C\00D\00D")
 (data $48 (i32.const 1201) "\0c\00\00\00y\00 \00=\00=\00 \00y")
 (data $49 (i32.const 1218) "\10\00\00\00t\00m\00p\00 \00=\00=\00 \00y")
 (data $50 (i32.const 1239) "\10\00\00\00a\00.\00f\00 \00=\00=\00 \00y")
 (data $51 (i32.const 1260) "\14\00\00\00a\00.\00f\00 \00=\00=\00 \00t\00m\00p")
 (data $52 (i32.const 1285) "\14\00\00\00a\00.\00g\00 \00i\00s\00 \00R\00e\00d")
 (data $53 (i32.const 1310) " \00\00\00v\00a\00l\00i\00d\00a\00t\00e\00 \00s\00e\00t\00t\00e\00r\00s")
 (data $54 (i32.const 1347) "\1a\00\00\00a\00.\00f\00 \00i\00s\00 \00C\00u\00s\00t\00o\00m")
 (data $55 (i32.const 1378) "\14\00\00\00a\00.\00g\00 \00i\00s\00 \00R\00e\00d")
 (data $56 (i32.const 1403) "\18\00\00\00a\00.\00f\00 \00i\00s\00 \00C\00o\00l\00o\00r")
 (data $57 (i32.const 1432) "\18\00\00\00a\00.\00g\00 \00i\00s\00 \00C\00o\00l\00o\00r")
 (data $58 (i32.const 1461) "&\00\00\00x\00.\00h\00e\00x\00 \00=\00=\00 \000\00x\00A\00A\00B\00B\00C\00C\00D\00D")
 (data $59 (i32.const 1504) "\"\00\00\00h\00e\00x\00 \00=\00=\00 \000\00x\00A\00A\00B\00B\00C\00C\00D\00D")
 (data $60 (i32.const 1543) "J\00\00\00a\00.\00f\00 \00i\00s\00 \00n\00o\00t\00 \00C\00u\00s\00t\00o\00m\00 \00i\00n\00 \00p\00a\00t\00t\00e\00r\00n\00 \00m\00a\00t\00c\00h\00i\00n\00g")
 (export "memory" (memory $0))
 (export "test_getMaxMemory" (func $0))
 (export "test_getLastErrorMessage" (func $7))
 (export "main" (func $11))
 (start $12)
 (func $0 (result i32)
  (global.get $global$6)
 )
 (func $1 (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (if
   (i32.eqz
    (local.tee $0
     (local.tee $4
      (i32.mul
       (local.get $0)
       (local.get $1)
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
    (global.get $global$3)
    (local.get $0)
   )
   (then
    (unreachable)
   )
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
         (i32.const 16)
         (local.get $0)
         (i32.le_u
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
   (then
    (drop
     (memory.grow
      (select
       (local.get $2)
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
       (i32.gt_u
        (local.get $2)
        (local.get $3)
       )
      )
     )
    )
   )
  )
  (global.set $global$6
   (local.get $0)
  )
  (local.set $2
   (i32.add
    (local.get $4)
    (local.tee $0
     (local.tee $1
      (i32.add
       (local.get $1)
       (i32.const 16)
      )
     )
    )
   )
  )
  (loop $label
   (if
    (i32.ne
     (local.get $0)
     (local.get $2)
    )
    (then
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
     (br $label)
    )
   )
  )
  (local.get $1)
 )
 (func $2 (param $0 i64) (param $1 i32)
  (call $fimport$4
   (i32.wrap_i64
    (local.get $0)
   )
   (local.get $1)
  )
 )
 (func $3 (param $0 i64) (param $1 i32)
  (call $fimport$4
   (i32.wrap_i64
    (local.get $0)
   )
   (local.get $1)
  )
 )
 (func $4 (param $0 i64) (param $1 i64) (param $2 i64)
  (call $9
   (i64.eq
    (local.get $0)
    (local.get $1)
   )
   (local.get $2)
  )
  (if
   (i64.ne
    (local.get $0)
    (local.get $1)
   )
   (then
    (call $3
     (i64.const 12884903829)
     (i32.wrap_i64
      (i64.shr_s
       (local.get $0)
       (i64.const 32)
      )
     )
    )
    (call $3
     (i64.const 12884903864)
     (i32.wrap_i64
      (i64.shr_s
       (local.get $1)
       (i64.const 32)
      )
     )
    )
    (call $3
     (i64.const 12884903905)
     (i32.wrap_i64
      (local.get $0)
     )
    )
    (call $3
     (i64.const 12884903940)
     (i32.wrap_i64
      (local.get $1)
     )
    )
   )
  )
 )
 (func $5 (param $0 i32) (param $1 i32) (param $2 i64)
  (call $9
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
    (call $3
     (i64.const 12884903981)
     (local.get $0)
    )
    (call $3
     (i64.const 12884904008)
     (local.get $1)
    )
   )
  )
 )
 (func $6 (param $0 i32) (param $1 i32) (param $2 i64)
  (call $9
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
    (call $2
     (i64.const 12884904041)
     (local.get $0)
    )
    (call $2
     (i64.const 12884904068)
     (local.get $1)
    )
   )
  )
 )
 (func $7 (result i32)
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
 (func $8 (param $0 i64)
  (call $fimport$1
   (i32.wrap_i64
    (local.get $0)
   )
  )
 )
 (func $9 (param $0 i32) (param $1 i64)
  (call $fimport$2
   (local.get $0)
   (i32.wrap_i64
    (local.get $1)
   )
  )
 )
 (func $10 (result i64)
  (local $0 i64)
  (i32.store
   (i32.wrap_i64
    (local.tee $0
     (i64.or
      (i64.extend_i32_u
       (call $1
        (i32.const 1)
        (i32.const 8)
       )
      )
      (i64.const 21474836480)
     )
    )
   )
   (i32.const 0)
  )
  (i32.store
   (i32.add
    (i32.wrap_i64
     (local.get $0)
    )
    (i32.const 4)
   )
   (i32.const 0)
  )
  (local.get $0)
 )
 (func $11
  (local $0 i64)
  (local $1 i64)
  (local $2 i64)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (call $8
   (i64.const 12884902790)
  )
  (i64.store
   (i32.wrap_i64
    (local.tee $0
     (i64.or
      (i64.extend_i32_u
       (call $1
        (i32.const 1)
        (i32.const 16)
       )
      )
      (i64.const 17179869184)
     )
    )
   )
   (i64.const 8589934592)
  )
  (i64.store
   (i32.add
    (i32.wrap_i64
     (local.get $0)
    )
    (i32.const 8)
   )
   (i64.const 4294967296)
  )
  (call $fimport$0
   (i32.wrap_i64
    (local.get $0)
   )
   (i32.const 16)
  )
  (call $8
   (i64.const 12884902835)
  )
  (call $9
   (i32.eq
    (i32.wrap_i64
     (i64.shr_u
      (local.get $0)
      (i64.const 32)
     )
    )
    (i32.const 4)
   )
   (i64.const 12884902892)
  )
  (call $9
   (i32.or
    (i32.eq
     (local.tee $4
      (i32.wrap_i64
       (i64.shr_u
        (i64.load
         (local.tee $3
          (i32.wrap_i64
           (local.get $0)
          )
         )
        )
        (i64.const 32)
       )
      )
     )
     (i32.const 3)
    )
    (i32.or
     (i32.eq
      (local.get $4)
      (i32.const 1)
     )
     (i32.eq
      (local.get $4)
      (i32.const 2)
     )
    )
   )
   (i64.const 12884902919)
  )
  (call $9
   (i32.or
    (i32.eq
     (local.tee $4
      (i32.wrap_i64
       (i64.shr_u
        (i64.load
         (local.tee $5
          (i32.add
           (local.get $3)
           (i32.const 8)
          )
         )
        )
        (i64.const 32)
       )
      )
     )
     (i32.const 3)
    )
    (i32.or
     (i32.eq
      (local.get $4)
      (i32.const 1)
     )
     (i32.eq
      (local.get $4)
      (i32.const 2)
     )
    )
   )
   (i64.const 12884902948)
  )
  (call $9
   (i32.eq
    (i32.wrap_i64
     (i64.shr_u
      (i64.load
       (i32.wrap_i64
        (local.get $0)
       )
      )
      (i64.const 32)
     )
    )
    (i32.const 2)
   )
   (i64.const 12884902977)
  )
  (call $9
   (i32.eq
    (i32.wrap_i64
     (i64.shr_u
      (i64.load
       (i32.add
        (i32.wrap_i64
         (local.get $0)
        )
        (i32.const 8)
       )
      )
      (i64.const 32)
     )
    )
    (i32.const 1)
   )
   (i64.const 12884903002)
  )
  (call $fimport$3)
  (call $8
   (i64.const 12884903027)
  )
  (i32.store
   (i32.wrap_i64
    (local.tee $1
     (i64.or
      (i64.extend_i32_u
       (call $1
        (i32.const 1)
        (i32.const 4)
       )
      )
      (i64.const 12884901888)
     )
    )
   )
   (i32.const -1430532899)
  )
  (call $9
   (i32.eq
    (i32.load
     (i32.wrap_i64
      (local.get $1)
     )
    )
    (i32.const -1430532899)
   )
   (i64.const 12884903046)
  )
  (i64.store
   (local.get $3)
   (local.get $1)
  )
  (call $9
   (i32.const 1)
   (i64.const 12884903089)
  )
  (call $9
   (i64.eq
    (local.get $1)
    (local.tee $2
     (i64.load
      (i32.wrap_i64
       (local.get $0)
      )
     )
    )
   )
   (i64.const 12884903106)
  )
  (call $9
   (i64.eq
    (local.get $1)
    (i64.load
     (i32.wrap_i64
      (local.get $0)
     )
    )
   )
   (i64.const 12884903127)
  )
  (call $9
   (i64.eq
    (local.get $2)
    (i64.load
     (i32.wrap_i64
      (local.get $0)
     )
    )
   )
   (i64.const 12884903148)
  )
  (i64.store
   (local.get $5)
   (i64.const 8589934592)
  )
  (call $9
   (i32.eq
    (i32.wrap_i64
     (i64.shr_u
      (i64.load
       (i32.add
        (i32.wrap_i64
         (local.get $0)
        )
        (i32.const 8)
       )
      )
      (i64.const 32)
     )
    )
    (i32.const 2)
   )
   (i64.const 12884903173)
  )
  (call $fimport$3)
  (call $8
   (i64.const 12884903198)
  )
  (call $9
   (i32.eq
    (i32.wrap_i64
     (i64.shr_u
      (i64.load
       (i32.wrap_i64
        (local.get $0)
       )
      )
      (i64.const 32)
     )
    )
    (i32.const 3)
   )
   (i64.const 12884903235)
  )
  (call $9
   (i32.eq
    (i32.wrap_i64
     (i64.shr_u
      (i64.load
       (i32.add
        (i32.wrap_i64
         (local.get $0)
        )
        (i32.const 8)
       )
      )
      (i64.const 32)
     )
    )
    (i32.const 2)
   )
   (i64.const 12884903266)
  )
  (call $9
   (i32.or
    (i32.eq
     (local.tee $3
      (i32.wrap_i64
       (i64.shr_u
        (i64.load
         (i32.wrap_i64
          (local.get $0)
         )
        )
        (i64.const 32)
       )
      )
     )
     (i32.const 3)
    )
    (i32.or
     (i32.eq
      (local.get $3)
      (i32.const 1)
     )
     (i32.eq
      (local.get $3)
      (i32.const 2)
     )
    )
   )
   (i64.const 12884903291)
  )
  (call $9
   (i32.or
    (i32.eq
     (local.tee $3
      (i32.wrap_i64
       (i64.shr_u
        (i64.load
         (i32.add
          (i32.wrap_i64
           (local.get $0)
          )
          (i32.const 8)
         )
        )
        (i64.const 32)
       )
      )
     )
     (i32.const 3)
    )
    (i32.or
     (i32.eq
      (local.get $3)
      (i32.const 1)
     )
     (i32.eq
      (local.get $3)
      (i32.const 2)
     )
    )
   )
   (i64.const 12884903320)
  )
  (block $block
   (if
    (i32.ne
     (i32.wrap_i64
      (i64.shr_u
       (local.tee $0
        (i64.load
         (i32.wrap_i64
          (local.get $0)
         )
        )
       )
       (i64.const 32)
      )
     )
     (i32.const 3)
    )
    (then
     (call $9
      (i32.const 0)
      (i64.const 12884903431)
     )
     (br $block)
    )
   )
   (call $9
    (i32.eq
     (local.tee $3
      (i32.load
       (i32.wrap_i64
        (local.get $0)
       )
      )
     )
     (i32.const -1430532899)
    )
    (i64.const 12884903349)
   )
   (call $9
    (i32.eq
     (local.get $3)
     (i32.const -1430532899)
    )
    (i64.const 12884903392)
   )
  )
  (call $fimport$3)
  (call $8
   (i64.const 12884902022)
  )
  (call $6
   (i32.const -1)
   (i32.const -1)
   (i64.const 12884902049)
  )
  (call $5
   (i32.const -1)
   (i32.const -1)
   (i64.const 12884902086)
  )
  (call $8
   (i64.const 12884901904)
  )
  (call $6
   (i32.load
    (i32.wrap_i64
     (global.get $global$8)
    )
   )
   (i32.const 0)
   (i64.const 12884901925)
  )
  (call $6
   (i32.load
    (i32.wrap_i64
     (global.get $global$9)
    )
   )
   (i32.const 0)
   (i64.const 12884901962)
  )
  (call $fimport$3)
  (call $8
   (i64.const 12884901999)
  )
  (i32.store
   (i32.wrap_i64
    (global.get $global$8)
   )
   (i32.const 3)
  )
  (i32.store
   (local.tee $3
    (i32.wrap_i64
     (global.get $global$9)
    )
   )
   (i32.const -1412567295)
  )
  (i32.store
   (i32.add
    (local.get $3)
    (i32.const 5)
   )
   (i32.const 5)
  )
  (call $fimport$3)
  (call $2
   (i64.const 12884902151)
   (i32.load
    (i32.wrap_i64
     (global.get $global$8)
    )
   )
  )
  (call $2
   (i64.const 12884902184)
   (i32.load
    (i32.wrap_i64
     (global.get $global$9)
    )
   )
  )
  (call $4
   (i64.const 2882400001)
   (i64.const 2882400001)
   (i64.const 12884902217)
  )
  (call $6
   (i32.load
    (i32.wrap_i64
     (global.get $global$8)
    )
   )
   (i32.const 3)
   (i64.const 12884902298)
  )
  (call $5
   (i32.load
    (i32.wrap_i64
     (global.get $global$9)
    )
   )
   (i32.const -1412567295)
   (i64.const 12884902335)
  )
  (call $6
   (i32.load
    (i32.wrap_i64
     (global.get $global$9)
    )
   )
   (i32.const -1412567295)
   (i64.const 12884902404)
  )
  (call $4
   (i64.load32_s
    (i32.wrap_i64
     (global.get $global$9)
    )
   )
   (i64.const -1412567295)
   (i64.const 12884902473)
  )
  (call $4
   (i64.load32_s
    (i32.wrap_i64
     (global.get $global$9)
    )
   )
   (i64.const -1412567295)
   (i64.const 12884902500)
  )
  (call $9
   (i64.eq
    (local.tee $0
     (i64.load32_s
      (i32.wrap_i64
       (global.get $global$9)
      )
     )
    )
    (i64.const -1412567295)
   )
   (i64.const 12884902583)
  )
  (if
   (i64.ne
    (local.get $0)
    (i64.const -1412567295)
   )
   (then
    (call $3
     (i64.const 12884903677)
     (i32.wrap_i64
      (i64.shr_s
       (local.get $0)
       (i64.const 32)
      )
     )
    )
    (call $3
     (i64.const 12884903712)
     (i32.const -1)
    )
    (call $3
     (i64.const 12884903753)
     (i32.wrap_i64
      (local.get $0)
     )
    )
    (call $3
     (i64.const 12884903788)
     (i32.const -1412567295)
    )
   )
  )
  (call $6
   (i32.load8_u
    (i32.wrap_i64
     (global.get $global$9)
    )
   )
   (i32.const 1)
   (i64.const 12884902666)
  )
  (call $6
   (i32.load8_u
    (i32.add
     (i32.wrap_i64
      (global.get $global$9)
     )
     (i32.const 5)
    )
   )
   (i32.const 5)
   (i64.const 12884902721)
  )
  (call $fimport$3)
  (call $fimport$3)
 )
 (func $12
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
  (global.set $global$8
   (call $10)
  )
  (global.set $global$9
   (call $10)
  )
 )
)
