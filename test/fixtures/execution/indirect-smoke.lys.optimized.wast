(module
 (type $none_=>_none (func))
 (type $i32_i32_=>_none (func (param i32 i32)))
 (type $none_=>_i32 (func (result i32)))
 (type $i32_=>_none (func (param i32)))
 (type $i32_i32_i64_=>_none (func (param i32 i32 i64)))
 (type $i64_=>_none (func (param i64)))
 (type $i64_i32_=>_none (func (param i64 i32)))
 (import "test" "pushTest" (func $fimport$0 (param i32)))
 (import "test" "registerAssertion" (func $fimport$1 (param i32 i32)))
 (import "test" "popTest" (func $fimport$2))
 (import "env" "printf" (func $fimport$3 (param i32 i32)))
 (memory $0 1)
 (data (i32.const 245) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 272) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 305) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 332) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 365) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 400) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 441) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 476) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 517) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 552) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 593) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 628) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 669) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00X")
 (data (i32.const 696) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00X")
 (data (i32.const 729) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 756) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 789) "\1a\00\00\00a\00s\00s\00e\00r\00t\00(\00f\00a\00l\00s\00e\00)")
 (data (i32.const 203) "\08\00\00\00t\00r\00u\00e")
 (data (i32.const 216) "\n\00\00\00f\00a\00l\00s\00e")
 (data (i32.const 231) "\02\00\00\000")
 (data (i32.const 238) "\02\00\00\000")
 (data (i32.const 16) "H\00\00\00T\00e\00s\00t\00 \00i\00n\00d\00i\00r\00e\00c\00t\00 \00c\00a\00l\00l\00 \00w\00i\00t\00h\00 \00n\00o\00 \00a\00r\00g\00u\00m\00e\00n\00t\00s")
 (data (i32.const 93) "\02\00\00\00A")
 (data (i32.const 100) "\02\00\00\00B")
 (data (i32.const 107) "H\00\00\00T\00e\00s\00t\00 \00i\00n\00d\00i\00r\00e\00c\00t\00 \00c\00a\00l\00l\00 \00w\00i\00t\00h\00 \00o\00n\00e\00 \00a\00r\00g\00u\00m\00e\00n\00t")
 (data (i32.const 184) "\02\00\00\00A")
 (data (i32.const 191) "\02\00\00\00B")
 (global $global$0 (mut i32) (i32.const 0))
 (global $global$1 (mut i64) (i64.const 0))
 (export "memory" (memory $0))
 (export "test_getMaxMemory" (func $1))
 (export "test_getLastErrorMessage" (func $3))
 (export "main" (func $5))
 (start $6)
 (func $0 (param $0 i64) (param $1 i32)
  (call $fimport$3
   (i32.wrap_i64
    (local.get $0)
   )
   (local.get $1)
  )
 )
 (func $1 (result i32)
  (global.get $global$0)
 )
 (func $2 (param $0 i32) (param $1 i32) (param $2 i64)
  (call $fimport$1
   (i32.eq
    (local.get $0)
    (local.get $1)
   )
   (i32.wrap_i64
    (local.get $2)
   )
  )
  (if
   (i32.ne
    (local.get $0)
    (local.get $1)
   )
   (block
    (call $0
     (i64.const 12884902617)
     (local.get $0)
    )
    (call $0
     (i64.const 12884902644)
     (local.get $1)
    )
   )
  )
 )
 (func $3 (result i32)
  (local $0 i64)
  (block $label$1 (result i32)
   (drop
    (br_if $label$1
     (i32.const 0)
     (i32.ne
      (i32.wrap_i64
       (i64.shr_u
        (local.tee $0
         (global.get $global$1)
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
 (func $4 (param $0 i64)
  (call $fimport$0
   (i32.wrap_i64
    (local.get $0)
   )
  )
 )
 (func $5
  (call $4
   (i64.const 12884901904)
  )
  (call $2
   (i32.const 1)
   (i32.const 1)
   (i64.const 12884901981)
  )
  (call $2
   (i32.const 2)
   (i32.const 2)
   (i64.const 12884901988)
  )
  (call $fimport$2)
  (call $4
   (i64.const 12884901995)
  )
  (call $2
   (i32.const 2)
   (i32.const 2)
   (i64.const 12884902072)
  )
  (call $2
   (i32.const 3)
   (i32.const 3)
   (i64.const 12884902079)
  )
  (call $fimport$2)
 )
 (func $6
  (global.set $global$0
   (i32.const 65536)
  )
  (global.set $global$1
   (i64.const 8589934592)
  )
 )
)
