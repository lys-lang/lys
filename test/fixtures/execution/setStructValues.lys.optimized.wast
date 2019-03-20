(module
 (type $0 (func (param i32)))
 (type $1 (func (param i32 i32)))
 (type $2 (func))
 (type $3 (func (param i64) (result i32)))
 (type $4 (func (param i64 i64) (result i64)))
 (type $5 (func (result i32)))
 (type $6 (func (param i32) (result i32)))
 (type $7 (func (param i32 i32) (result i32)))
 (type $8 (func (param i32 i32 i32)))
 (type $9 (func (param i64 i32)))
 (type $10 (func (param i64)))
 (type $11 (func (param i64 i64 i64)))
 (type $12 (func (param i32 i32 i64)))
 (type $13 (func (param i32 i64)))
 (type $14 (func (param i64 i64)))
 (type $15 (func (param i32 i32)))
 (type $16 (func (result i64)))
 (import "test" "printMemory" (func $fimport$0 (param i32 i32)))
 (import "test" "pushTest" (func $fimport$1 (param i32)))
 (import "test" "registerAssertion" (func $fimport$2 (param i32 i32)))
 (import "test" "popTest" (func $fimport$3))
 (import "env" "printf" (func $fimport$4 (param i32 i32)))
 (import "env" "printf" (func $fimport$5 (param i32 i32)))
 (memory $0 1)
 (data (i32.const 2197) "\08\00\00\00t\00r\00u\00e")
 (data (i32.const 2210) "\n\00\00\00f\00a\00l\00s\00e")
 (data (i32.const 2225) "\02\00\00\000")
 (data (i32.const 2232) "\02\00\00\000")
 (data (i32.const 1622) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 1649) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 1682) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 1709) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 1742) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 1777) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 1818) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 1853) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 1894) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 1929) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 1970) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 2005) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 2046) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00X")
 (data (i32.const 2073) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00X")
 (data (i32.const 2106) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 2133) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 2166) "\1a\00\00\00a\00s\00s\00e\00r\00t\00(\00f\00a\00l\00s\00e\00)")
 (data (i32.const 16) "\10\00\00\00t\00e\00s\00t\00L\00o\00a\00d")
 (data (i32.const 37) " \00\00\00i\003\002\00.\00l\00o\00a\00d\00(\00x\00)\00 \00=\00=\00 \000")
 (data (i32.const 74) " \00\00\00i\003\002\00.\00l\00o\00a\00d\00(\00y\00)\00 \00=\00=\00 \000")
 (data (i32.const 111) "\12\00\00\00t\00e\00s\00t\00S\00t\00o\00r\00e")
 (data (i32.const 134) "\16\00\00\00t\00e\00s\00t\00N\00u\00m\00b\00e\00r\00s")
 (data (i32.const 161) " \00\00\000\00x\00F\00F\00F\00F\00F\00F\00F\00F\00 \00=\00=\00 \00-\001")
 (data (i32.const 198) "<\00\00\000\00x\00F\00F\00F\00F\00F\00F\00F\00F\00 \00a\00s\00 \00u\003\002\00 \00=\00=\00 \00-\001\00 \00a\00s\00 \00u\003\002")
 (data (i32.const 263) "\1c\00\00\00i\003\002\00.\00l\00o\00a\00d\00(\00x\00)\00 \00%\00X")
 (data (i32.const 296) "\1c\00\00\00i\003\002\00.\00l\00o\00a\00d\00(\00y\00)\00 \00%\00X")
 (data (i32.const 329) "L\00\00\000\00x\00A\00B\00C\00D\00E\00F\000\001\00 \00a\00s\00 \00i\006\004\00 \00=\00=\00 \000\00x\00A\00B\00C\00D\00E\00F\000\001\00 \00a\00s\00 \00i\006\004")
 (data (i32.const 410) " \00\00\00i\003\002\00.\00l\00o\00a\00d\00(\00x\00)\00 \00=\00=\00 \003")
 (data (i32.const 447) "@\00\00\00i\003\002\00.\00l\00o\00a\00d\00(\00y\00)\00 \00a\00s\00 \00u\003\002\00 \00=\00=\00 \000\00x\00A\00B\00C\00D\00E\00F\000\001")
 (data (i32.const 516) "@\00\00\00i\003\002\00.\00l\00o\00a\00d\00(\00y\00)\00 \00=\00=\00 \000\00x\00A\00B\00C\00D\00E\00F\000\001\00 \00a\00s\00 \00i\003\002")
 (data (i32.const 585) "\16\00\00\00V\00A\00R\00 \00=\00=\00 \00V\00A\00R\002")
 (data (i32.const 612) "N\00\00\00i\003\002\00.\00l\00o\00a\00d\00(\00y\00)\00 \00a\00s\00 \00i\006\004\00 \00=\00=\00 \000\00x\00A\00B\00C\00D\00E\00F\000\001\00 \00a\00s\00 \00i\006\004")
 (data (i32.const 695) "N\00\00\00i\003\002\00.\00l\00o\00a\00d\00(\00y\00)\00 \00a\00s\00 \00u\006\004\00 \00=\00=\00 \000\00x\00A\00B\00C\00D\00E\00F\000\001\00 \00a\00s\00 \00u\006\004")
 (data (i32.const 778) "2\00\00\00u\008\00.\00l\00o\00a\00d\00(\00y\00)\00 \00a\00s\00 \00i\003\002\00 \00=\00=\00 \000\00x\000\001")
 (data (i32.const 833) "@\00\00\00u\008\00.\00l\00o\00a\00d\00(\00y\00,\00 \005\00 \00a\00s\00 \00u\003\002\00)\00 \00a\00s\00 \00i\003\002\00 \00=\00=\00 \005")
 (data (i32.const 902) "(\00\00\00s\00e\00t\00 \00v\00a\00l\00u\00e\00s\00 \00i\00n\00 \00s\00t\00r\00u\00c\00t")
 (data (i32.const 947) "4\00\00\00g\00e\00t\00t\00e\00r\00s\00 \00o\00f\00 \00t\00h\00e\00 \00c\00o\00n\00s\00t\00r\00u\00c\00t\00o\00r")
 (data (i32.const 1004) "\16\00\00\00a\00 \00i\00s\00 \00C\00a\00t\00B\00a\00g")
 (data (i32.const 1031) "\18\00\00\00a\00.\00f\00 \00i\00s\00 \00C\00o\00l\00o\00r")
 (data (i32.const 1060) "\18\00\00\00a\00.\00g\00 \00i\00s\00 \00C\00o\00l\00o\00r")
 (data (i32.const 1089) "\14\00\00\00a\00.\00f\00 \00i\00s\00 \00R\00e\00d")
 (data (i32.const 1114) "\14\00\00\00a\00.\00g\00 \00i\00s\00 \00R\00e\00d")
 (data (i32.const 1139) "\0e\00\00\00s\00e\00t\00t\00e\00r\00s")
 (data (i32.const 1158) "&\00\00\00y\00.\00h\00e\00x\00 \00=\00=\00 \000\00x\00A\00A\00B\00B\00C\00C\00D\00D")
 (data (i32.const 1201) "\0c\00\00\00y\00 \00=\00=\00 \00y")
 (data (i32.const 1218) "\10\00\00\00t\00m\00p\00 \00=\00=\00 \00y")
 (data (i32.const 1239) "\10\00\00\00a\00.\00f\00 \00=\00=\00 \00y")
 (data (i32.const 1260) "\14\00\00\00a\00.\00f\00 \00=\00=\00 \00t\00m\00p")
 (data (i32.const 1285) "\14\00\00\00a\00.\00g\00 \00i\00s\00 \00R\00e\00d")
 (data (i32.const 1310) " \00\00\00v\00a\00l\00i\00d\00a\00t\00e\00 \00s\00e\00t\00t\00e\00r\00s")
 (data (i32.const 1347) "\1a\00\00\00a\00.\00f\00 \00i\00s\00 \00C\00u\00s\00t\00o\00m")
 (data (i32.const 1378) "\14\00\00\00a\00.\00g\00 \00i\00s\00 \00R\00e\00d")
 (data (i32.const 1403) "\18\00\00\00a\00.\00f\00 \00i\00s\00 \00C\00o\00l\00o\00r")
 (data (i32.const 1432) "\18\00\00\00a\00.\00g\00 \00i\00s\00 \00C\00o\00l\00o\00r")
 (data (i32.const 1461) "&\00\00\00x\00.\00h\00e\00x\00 \00=\00=\00 \000\00x\00A\00A\00B\00B\00C\00C\00D\00D")
 (data (i32.const 1504) "\"\00\00\00h\00e\00x\00 \00=\00=\00 \000\00x\00A\00A\00B\00B\00C\00C\00D\00D")
 (data (i32.const 1543) "J\00\00\00a\00.\00f\00 \00i\00s\00 \00n\00o\00t\00 \00C\00u\00s\00t\00o\00m\00 \00i\00n\00 \00p\00a\00t\00t\00e\00r\00n\00 \00m\00a\00t\00c\00h\00i\00n\00g")
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
 (export "memory" (memory $0))
 (export "test_getMaxMemory" (func $0))
 (export "test_getLastErrorMessage" (func $10))
 (export "main" (func $18))
 (start $19)
 (func $0 (; 6 ;) (type $5) (result i32)
  (global.get $global$6)
 )
 (func $1 (; 7 ;) (type $7) (param $0 i32) (param $1 i32) (result i32)
  (call $3
   (local.tee $1
    (call $2
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
 (func $2 (; 8 ;) (type $6) (param $0 i32) (result i32)
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
 (func $3 (; 9 ;) (type $8) (param $0 i32) (param $1 i32) (param $2 i32)
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
 (func $4 (; 10 ;) (type $9) (param $0 i64) (param $1 i32)
  (call $fimport$4
   (i32.wrap_i64
    (local.get $0)
   )
   (local.get $1)
  )
 )
 (func $5 (; 11 ;) (type $9) (param $0 i64) (param $1 i32)
  (call $fimport$5
   (i32.wrap_i64
    (local.get $0)
   )
   (local.get $1)
  )
 )
 (func $6 (; 12 ;) (type $14) (param $0 i64) (param $1 i64)
  (call $12
   (i64.eq
    (local.get $0)
    (local.get $1)
   )
   (i64.const 695)
  )
  (if
   (i64.ne
    (local.get $0)
    (local.get $1)
   )
   (block
    (call $5
     (i64.const 1742)
     (i32.wrap_i64
      (i64.shr_s
       (local.get $0)
       (i64.const 32)
      )
     )
    )
    (call $5
     (i64.const 1777)
     (i32.wrap_i64
      (i64.shr_s
       (local.get $1)
       (i64.const 32)
      )
     )
    )
    (call $5
     (i64.const 1818)
     (i32.wrap_i64
      (local.get $0)
     )
    )
    (call $5
     (i64.const 1853)
     (i32.wrap_i64
      (local.get $1)
     )
    )
   )
  )
 )
 (func $7 (; 13 ;) (type $11) (param $0 i64) (param $1 i64) (param $2 i64)
  (call $12
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
   (block
    (call $5
     (i64.const 1894)
     (i32.wrap_i64
      (i64.shr_s
       (local.get $0)
       (i64.const 32)
      )
     )
    )
    (call $5
     (i64.const 1929)
     (i32.wrap_i64
      (i64.shr_s
       (local.get $1)
       (i64.const 32)
      )
     )
    )
    (call $5
     (i64.const 1970)
     (i32.wrap_i64
      (local.get $0)
     )
    )
    (call $5
     (i64.const 2005)
     (i32.wrap_i64
      (local.get $1)
     )
    )
   )
  )
 )
 (func $8 (; 14 ;) (type $15) (param $0 i32) (param $1 i32)
  (call $12
   (i32.eq
    (local.get $0)
    (local.get $1)
   )
   (i64.const 198)
  )
  (if
   (i32.ne
    (local.get $0)
    (local.get $1)
   )
   (block
    (call $5
     (i64.const 2046)
     (local.get $0)
    )
    (call $5
     (i64.const 2073)
     (local.get $1)
    )
   )
  )
 )
 (func $9 (; 15 ;) (type $12) (param $0 i32) (param $1 i32) (param $2 i64)
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
    (call $4
     (i64.const 2106)
     (local.get $0)
    )
    (call $4
     (i64.const 2133)
     (local.get $1)
    )
   )
  )
 )
 (func $10 (; 16 ;) (type $5) (result i32)
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
 (func $11 (; 17 ;) (type $10) (param $0 i64)
  (call $fimport$1
   (i32.wrap_i64
    (local.get $0)
   )
  )
 )
 (func $12 (; 18 ;) (type $13) (param $0 i32) (param $1 i64)
  (call $fimport$2
   (local.get $0)
   (i32.wrap_i64
    (local.get $1)
   )
  )
 )
 (func $13 (; 19 ;) (type $3) (param $0 i64) (result i32)
  (if (result i32)
   (i64.eq
    (i64.and
     (local.get $0)
     (i64.const -4294967296)
    )
    (i64.const 17179869184)
   )
   (i32.const 1)
   (i32.ne
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
    (i32.const 0)
   )
  )
 )
 (func $14 (; 20 ;) (type $4) (param $0 i64) (param $1 i64) (result i64)
  (local $2 i64)
  (i64.store
   (i32.wrap_i64
    (local.tee $2
     (i64.or
      (i64.extend_i32_u
       (call $1
        (i32.const 1)
        (i32.const 16)
       )
      )
      (i64.const 21474836480)
     )
    )
   )
   (local.get $0)
  )
  (i64.store
   (i32.add
    (i32.wrap_i64
     (local.get $2)
    )
    (i32.const 8)
   )
   (local.get $1)
  )
  (local.get $2)
 )
 (func $15 (; 21 ;) (type $16) (result i64)
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
      (i64.const 25769803776)
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
 (func $16 (; 22 ;) (type $2)
  (call $11
   (i64.const 111)
  )
  (i32.store
   (i32.wrap_i64
    (global.get $global$8)
   )
   (i32.const 3)
  )
  (i32.store
   (i32.wrap_i64
    (global.get $global$9)
   )
   (i32.const -1412567295)
  )
  (i32.store
   (i32.add
    (i32.wrap_i64
     (global.get $global$9)
    )
    (i32.const 5)
   )
   (i32.const 5)
  )
  (call $fimport$3)
 )
 (func $17 (; 23 ;) (type $2)
  (call $11
   (i64.const 134)
  )
  (call $9
   (i32.const -1)
   (i32.const -1)
   (i64.const 161)
  )
  (call $8
   (i32.const -1)
   (i32.const -1)
  )
  (call $11
   (i64.const 16)
  )
  (call $9
   (i32.load
    (i32.wrap_i64
     (global.get $global$8)
    )
   )
   (i32.const 0)
   (i64.const 37)
  )
  (call $9
   (i32.load
    (i32.wrap_i64
     (global.get $global$9)
    )
   )
   (i32.const 0)
   (i64.const 74)
  )
  (call $fimport$3)
  (call $16)
  (call $4
   (i64.const 263)
   (i32.load
    (i32.wrap_i64
     (global.get $global$8)
    )
   )
  )
  (call $4
   (i64.const 296)
   (i32.load
    (i32.wrap_i64
     (global.get $global$9)
    )
   )
  )
  (call $7
   (i64.const -1412567295)
   (i64.const -1412567295)
   (i64.const 329)
  )
  (call $9
   (i32.load
    (i32.wrap_i64
     (global.get $global$8)
    )
   )
   (i32.const 3)
   (i64.const 410)
  )
  (call $9
   (i32.load
    (i32.wrap_i64
     (global.get $global$9)
    )
   )
   (i32.const -1412567295)
   (i64.const 447)
  )
  (call $9
   (i32.load
    (i32.wrap_i64
     (global.get $global$9)
    )
   )
   (i32.const -1412567295)
   (i64.const 516)
  )
  (call $7
   (i64.extend_i32_s
    (i32.load
     (i32.wrap_i64
      (global.get $global$9)
     )
    )
   )
   (i64.const -1412567295)
   (i64.const 585)
  )
  (call $7
   (i64.extend_i32_s
    (i32.load
     (i32.wrap_i64
      (global.get $global$9)
     )
    )
   )
   (i64.const -1412567295)
   (i64.const 612)
  )
  (call $6
   (i64.extend_i32_s
    (i32.load
     (i32.wrap_i64
      (global.get $global$9)
     )
    )
   )
   (i64.const -1412567295)
  )
  (call $9
   (i32.load8_u
    (i32.wrap_i64
     (global.get $global$9)
    )
   )
   (i32.const 1)
   (i64.const 778)
  )
  (call $9
   (i32.load8_u
    (i32.add
     (i32.wrap_i64
      (global.get $global$9)
     )
     (i32.const 5)
    )
   )
   (i32.const 5)
   (i64.const 833)
  )
  (call $fimport$3)
 )
 (func $18 (; 24 ;) (type $2)
  (local $0 i32)
  (local $1 i64)
  (local $2 i64)
  (local $3 i64)
  (local $4 i32)
  (call $11
   (i64.const 902)
  )
  (call $fimport$0
   (i32.wrap_i64
    (local.tee $1
     (call $14
      (i64.const 12884901888)
      (i64.const 8589934592)
     )
    )
   )
   (i32.const 16)
  )
  (call $11
   (i64.const 947)
  )
  (call $12
   (i64.eq
    (i64.and
     (local.get $1)
     (i64.const -4294967296)
    )
    (i64.const 21474836480)
   )
   (i64.const 1004)
  )
  (call $12
   (call $13
    (i64.load
     (i32.wrap_i64
      (local.get $1)
     )
    )
   )
   (i64.const 1031)
  )
  (call $12
   (call $13
    (i64.load
     (i32.add
      (i32.wrap_i64
       (local.get $1)
      )
      (i32.const 8)
     )
    )
   )
   (i64.const 1060)
  )
  (call $12
   (i64.eq
    (i64.and
     (i64.load
      (i32.wrap_i64
       (local.get $1)
      )
     )
     (i64.const -4294967296)
    )
    (i64.const 12884901888)
   )
   (i64.const 1089)
  )
  (call $12
   (i64.eq
    (i64.and
     (i64.load
      (i32.add
       (i32.wrap_i64
        (local.get $1)
       )
       (i32.const 8)
      )
     )
     (i64.const -4294967296)
    )
    (i64.const 8589934592)
   )
   (i64.const 1114)
  )
  (call $fimport$3)
  (call $11
   (i64.const 1139)
  )
  (i32.store
   (i32.wrap_i64
    (local.tee $2
     (i64.or
      (i64.extend_i32_u
       (call $1
        (i32.const 1)
        (i32.const 4)
       )
      )
      (i64.const 17179869184)
     )
    )
   )
   (i32.const -1430532899)
  )
  (call $12
   (i32.eq
    (i32.load
     (i32.wrap_i64
      (local.get $2)
     )
    )
    (i32.const -1430532899)
   )
   (i64.const 1158)
  )
  (i64.store
   (i32.wrap_i64
    (local.get $1)
   )
   (local.get $2)
  )
  (call $12
   (i32.const 1)
   (i64.const 1201)
  )
  (call $12
   (i64.eq
    (local.get $2)
    (local.tee $3
     (i64.load
      (i32.wrap_i64
       (local.get $1)
      )
     )
    )
   )
   (i64.const 1218)
  )
  (call $12
   (i64.eq
    (local.get $2)
    (i64.load
     (i32.wrap_i64
      (local.get $1)
     )
    )
   )
   (i64.const 1239)
  )
  (call $12
   (i64.eq
    (local.get $3)
    (i64.load
     (i32.wrap_i64
      (local.get $1)
     )
    )
   )
   (i64.const 1260)
  )
  (i64.store
   (i32.add
    (i32.wrap_i64
     (local.get $1)
    )
    (i32.const 8)
   )
   (i64.const 12884901888)
  )
  (call $12
   (i64.eq
    (i64.and
     (i64.load
      (i32.add
       (i32.wrap_i64
        (local.get $1)
       )
       (i32.const 8)
      )
     )
     (i64.const -4294967296)
    )
    (i64.const 12884901888)
   )
   (i64.const 1285)
  )
  (call $fimport$3)
  (call $11
   (i64.const 1310)
  )
  (call $12
   (i64.eq
    (i64.and
     (i64.load
      (i32.wrap_i64
       (local.get $1)
      )
     )
     (i64.const -4294967296)
    )
    (i64.const 17179869184)
   )
   (i64.const 1347)
  )
  (call $12
   (i64.eq
    (i64.and
     (i64.load
      (i32.add
       (i32.wrap_i64
        (local.get $1)
       )
       (i32.const 8)
      )
     )
     (i64.const -4294967296)
    )
    (i64.const 12884901888)
   )
   (i64.const 1378)
  )
  (call $12
   (call $13
    (i64.load
     (i32.wrap_i64
      (local.get $1)
     )
    )
   )
   (i64.const 1403)
  )
  (call $12
   (call $13
    (i64.load
     (i32.add
      (i32.wrap_i64
       (local.get $1)
      )
      (i32.const 8)
     )
    )
   )
   (i64.const 1432)
  )
  (block $label$1
   (if
    (i64.ne
     (i64.and
      (local.tee $1
       (i64.load
        (i32.wrap_i64
         (local.get $1)
        )
       )
      )
      (i64.const -4294967296)
     )
     (i64.const 17179869184)
    )
    (block
     (call $12
      (i32.const 0)
      (i64.const 1543)
     )
     (br $label$1)
    )
   )
   (call $12
    (i32.eq
     (block (result i32)
      (local.set $4
       (i32.load
        (i32.wrap_i64
         (local.get $1)
        )
       )
      )
      (call $12
       (i32.eq
        (i32.load
         (i32.wrap_i64
          (local.get $1)
         )
        )
        (i32.const -1430532899)
       )
       (i64.const 1461)
      )
      (local.get $4)
     )
     (i32.const -1430532899)
    )
    (i64.const 1504)
   )
  )
  (call $fimport$3)
  (call $17)
  (call $fimport$3)
 )
 (func $19 (; 25 ;) (type $2)
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
  (global.set $global$8
   (call $15)
  )
  (global.set $global$9
   (call $15)
  )
 )
)
