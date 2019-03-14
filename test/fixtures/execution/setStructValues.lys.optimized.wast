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
 (type $9 (func (param i64)))
 (type $10 (func (param i32 i64)))
 (import "test" "printMemory" (func $fimport$0 (param i32 i32)))
 (import "test" "pushTest" (func $fimport$1 (param i32)))
 (import "test" "registerAssertion" (func $fimport$2 (param i32 i32)))
 (import "test" "popTest" (func $fimport$3))
 (memory $0 1)
 (data (i32.const 1187) "\08\00\00\00t\00r\00u\00e")
 (data (i32.const 1200) "\n\00\00\00f\00a\00l\00s\00e")
 (data (i32.const 1215) "\02\00\00\000")
 (data (i32.const 1222) "\02\00\00\000")
 (data (i32.const 736) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 763) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 796) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 823) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 856) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 883) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 916) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 943) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 976) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 1003) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 1036) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 1063) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 1096) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 1123) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 1156) "\1a\00\00\00a\00s\00s\00e\00r\00t\00(\00f\00a\00l\00s\00e\00)")
 (data (i32.const 16) "(\00\00\00s\00e\00t\00 \00v\00a\00l\00u\00e\00s\00 \00i\00n\00 \00s\00t\00r\00u\00c\00t")
 (data (i32.const 61) "4\00\00\00g\00e\00t\00t\00e\00r\00s\00 \00o\00f\00 \00t\00h\00e\00 \00c\00o\00n\00s\00t\00r\00u\00c\00t\00o\00r")
 (data (i32.const 118) "\16\00\00\00a\00 \00i\00s\00 \00C\00a\00t\00B\00a\00g")
 (data (i32.const 145) "\18\00\00\00a\00.\00f\00 \00i\00s\00 \00C\00o\00l\00o\00r")
 (data (i32.const 174) "\18\00\00\00a\00.\00g\00 \00i\00s\00 \00C\00o\00l\00o\00r")
 (data (i32.const 203) "\14\00\00\00a\00.\00f\00 \00i\00s\00 \00R\00e\00d")
 (data (i32.const 228) "\14\00\00\00a\00.\00g\00 \00i\00s\00 \00R\00e\00d")
 (data (i32.const 253) "\0e\00\00\00s\00e\00t\00t\00e\00r\00s")
 (data (i32.const 272) "&\00\00\00y\00.\00h\00e\00x\00 \00=\00=\00 \000\00x\00A\00A\00B\00B\00C\00C\00D\00D")
 (data (i32.const 315) "\0c\00\00\00y\00 \00=\00=\00 \00y")
 (data (i32.const 332) "\10\00\00\00t\00m\00p\00 \00=\00=\00 \00y")
 (data (i32.const 353) "\10\00\00\00a\00.\00f\00 \00=\00=\00 \00y")
 (data (i32.const 374) "\14\00\00\00a\00.\00f\00 \00=\00=\00 \00t\00m\00p")
 (data (i32.const 399) "\14\00\00\00a\00.\00g\00 \00i\00s\00 \00R\00e\00d")
 (data (i32.const 424) " \00\00\00v\00a\00l\00i\00d\00a\00t\00e\00 \00s\00e\00t\00t\00e\00r\00s")
 (data (i32.const 461) "\1a\00\00\00a\00.\00f\00 \00i\00s\00 \00C\00u\00s\00t\00o\00m")
 (data (i32.const 492) "\14\00\00\00a\00.\00g\00 \00i\00s\00 \00R\00e\00d")
 (data (i32.const 517) "\18\00\00\00a\00.\00f\00 \00i\00s\00 \00C\00o\00l\00o\00r")
 (data (i32.const 546) "\18\00\00\00a\00.\00g\00 \00i\00s\00 \00C\00o\00l\00o\00r")
 (data (i32.const 575) "&\00\00\00x\00.\00h\00e\00x\00 \00=\00=\00 \000\00x\00A\00A\00B\00B\00C\00C\00D\00D")
 (data (i32.const 618) "\"\00\00\00h\00e\00x\00 \00=\00=\00 \000\00x\00A\00A\00B\00B\00C\00C\00D\00D")
 (data (i32.const 657) "J\00\00\00a\00.\00f\00 \00i\00s\00 \00n\00o\00t\00 \00C\00u\00s\00t\00o\00m\00 \00i\00n\00 \00p\00a\00t\00t\00e\00r\00n\00 \00m\00a\00t\00c\00h\00i\00n\00g")
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
 (export "main" (func $9))
 (start $10)
 (func $0 (; 4 ;) (type $5) (result i32)
  (global.get $global$6)
 )
 (func $1 (; 5 ;) (type $7) (param $0 i32) (param $1 i32) (result i32)
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
 (func $2 (; 6 ;) (type $6) (param $0 i32) (result i32)
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
 (func $3 (; 7 ;) (type $8) (param $0 i32) (param $1 i32) (param $2 i32)
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
 (func $4 (; 8 ;) (type $5) (result i32)
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
 (func $5 (; 9 ;) (type $9) (param $0 i64)
  (call $fimport$1
   (i32.wrap_i64
    (local.get $0)
   )
  )
 )
 (func $6 (; 10 ;) (type $10) (param $0 i32) (param $1 i64)
  (call $fimport$2
   (local.get $0)
   (i32.wrap_i64
    (local.get $1)
   )
  )
 )
 (func $7 (; 11 ;) (type $3) (param $0 i64) (result i32)
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
 (func $8 (; 12 ;) (type $4) (param $0 i64) (param $1 i64) (result i64)
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
 (func $9 (; 13 ;) (type $2)
  (local $0 i32)
  (local $1 i64)
  (local $2 i64)
  (local $3 i64)
  (local $4 i32)
  (call $5
   (i64.const 16)
  )
  (call $fimport$0
   (i32.wrap_i64
    (local.tee $1
     (call $8
      (i64.const 12884901888)
      (i64.const 8589934592)
     )
    )
   )
   (i32.const 16)
  )
  (call $5
   (i64.const 61)
  )
  (call $6
   (i64.eq
    (i64.and
     (local.get $1)
     (i64.const -4294967296)
    )
    (i64.const 21474836480)
   )
   (i64.const 118)
  )
  (call $6
   (call $7
    (i64.load
     (i32.wrap_i64
      (local.get $1)
     )
    )
   )
   (i64.const 145)
  )
  (call $6
   (call $7
    (i64.load
     (i32.add
      (i32.wrap_i64
       (local.get $1)
      )
      (i32.const 8)
     )
    )
   )
   (i64.const 174)
  )
  (call $6
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
   (i64.const 203)
  )
  (call $6
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
   (i64.const 228)
  )
  (call $fimport$3)
  (call $5
   (i64.const 253)
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
  (call $6
   (i32.eq
    (i32.load
     (i32.wrap_i64
      (local.get $2)
     )
    )
    (i32.const -1430532899)
   )
   (i64.const 272)
  )
  (i64.store
   (i32.wrap_i64
    (local.get $1)
   )
   (local.get $2)
  )
  (call $6
   (i32.const 1)
   (i64.const 315)
  )
  (call $6
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
   (i64.const 332)
  )
  (call $6
   (i64.eq
    (local.get $2)
    (i64.load
     (i32.wrap_i64
      (local.get $1)
     )
    )
   )
   (i64.const 353)
  )
  (call $6
   (i64.eq
    (local.get $3)
    (i64.load
     (i32.wrap_i64
      (local.get $1)
     )
    )
   )
   (i64.const 374)
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
  (call $6
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
   (i64.const 399)
  )
  (call $fimport$3)
  (call $5
   (i64.const 424)
  )
  (call $6
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
   (i64.const 461)
  )
  (call $6
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
   (i64.const 492)
  )
  (call $6
   (call $7
    (i64.load
     (i32.wrap_i64
      (local.get $1)
     )
    )
   )
   (i64.const 517)
  )
  (call $6
   (call $7
    (i64.load
     (i32.add
      (i32.wrap_i64
       (local.get $1)
      )
      (i32.const 8)
     )
    )
   )
   (i64.const 546)
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
     (call $6
      (i32.const 0)
      (i64.const 657)
     )
     (br $label$1)
    )
   )
   (call $6
    (i32.eq
     (block (result i32)
      (local.set $4
       (i32.load
        (i32.wrap_i64
         (local.get $1)
        )
       )
      )
      (call $6
       (i32.eq
        (i32.load
         (i32.wrap_i64
          (local.get $1)
         )
        )
        (i32.const -1430532899)
       )
       (i64.const 575)
      )
      (local.get $4)
     )
     (i32.const -1430532899)
    )
    (i64.const 618)
   )
  )
  (call $fimport$3)
  (call $fimport$3)
 )
 (func $10 (; 14 ;) (type $2)
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
