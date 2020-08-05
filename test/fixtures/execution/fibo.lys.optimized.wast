(module
 (type $none_=>_none (func))
 (type $i32_i32_=>_none (func (param i32 i32)))
 (type $none_=>_i32 (func (result i32)))
 (type $i32_=>_none (func (param i32)))
 (type $i32_i32_i64_=>_none (func (param i32 i32 i64)))
 (type $i64_=>_none (func (param i64)))
 (type $i64_i32_=>_none (func (param i64 i32)))
 (type $i32_=>_i32 (func (param i32) (result i32)))
 (type $i32_i32_i32_=>_i32 (func (param i32 i32 i32) (result i32)))
 (import "test" "pushTest" (func $fimport$0 (param i32)))
 (import "test" "registerAssertion" (func $fimport$1 (param i32 i32)))
 (import "test" "popTest" (func $fimport$2))
 (import "env" "printf" (func $fimport$3 (param i32 i32)))
 (memory $0 1)
 (data (i32.const 316) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 343) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 376) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 403) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 436) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 471) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 512) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 547) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 588) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 623) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 664) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 699) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 740) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00X")
 (data (i32.const 767) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00X")
 (data (i32.const 800) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 827) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 860) "\1a\00\00\00a\00s\00s\00e\00r\00t\00(\00f\00a\00l\00s\00e\00)")
 (data (i32.const 274) "\08\00\00\00t\00r\00u\00e")
 (data (i32.const 287) "\n\00\00\00f\00a\00l\00s\00e")
 (data (i32.const 302) "\02\00\00\000")
 (data (i32.const 309) "\02\00\00\000")
 (data (i32.const 16) "\12\00\00\00f\00i\00b\00o\00n\00a\00c\00c\00i")
 (data (i32.const 39) "4\00\00\00f\00i\00b\00(\004\006\00)\00 \00m\00u\00s\00t\00 \00b\00e\00 \001\008\003\006\003\001\001\009\000\003")
 (data (i32.const 96) "R\00\00\00f\00i\00b\00P\00a\00t\00t\00e\00r\00n\00M\00a\00t\00c\00h\00i\00n\00g\00(\004\006\00)\00 \00m\00u\00s\00t\00 \00b\00e\00 \001\008\003\006\003\001\001\009\000\003")
 (data (i32.const 183) "\12\00\00\00f\00a\00c\00t\00o\00r\00i\00a\00l")
 (data (i32.const 206) ":\00\00\00f\00a\00c\00t\00o\00r\00i\00a\00l\00(\001\000\00)\00 \00m\00u\00s\00t\00 \00b\00e\00 \003\006\002\008\008\000\000")
 (global $global$0 (mut i32) (i32.const 0))
 (global $global$1 (mut i64) (i64.const 0))
 (export "memory" (memory $0))
 (export "test_getMaxMemory" (func $1))
 (export "test_getLastErrorMessage" (func $3))
 (export "main" (func $7))
 (start $8)
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
     (i64.const 12884902688)
     (local.get $0)
    )
    (call $0
     (i64.const 12884902715)
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
 (func $5 (param $0 i32) (param $1 i32) (param $2 i32) (result i32)
  (if (result i32)
   (i32.gt_s
    (local.get $0)
    (i32.const 0)
   )
   (call $5
    (i32.sub
     (local.get $0)
     (i32.const 1)
    )
    (local.get $2)
    (i32.add
     (local.get $1)
     (local.get $2)
    )
   )
   (local.get $1)
  )
 )
 (func $6 (param $0 i32) (result i32)
  (if (result i32)
   (i32.ge_s
    (local.get $0)
    (i32.const 1)
   )
   (i32.mul
    (call $6
     (i32.sub
      (local.get $0)
      (i32.const 1)
     )
    )
    (local.get $0)
   )
   (i32.const 1)
  )
 )
 (func $7
  (call $4
   (i64.const 12884901904)
  )
  (call $2
   (call $5
    (i32.const 46)
    (i32.const 0)
    (i32.const 1)
   )
   (i32.const 1836311903)
   (i64.const 12884901927)
  )
  (call $2
   (call $5
    (i32.const 45)
    (i32.const 1)
    (i32.const 1)
   )
   (i32.const 1836311903)
   (i64.const 12884901984)
  )
  (call $fimport$2)
  (call $4
   (i64.const 12884902071)
  )
  (call $2
   (call $6
    (i32.const 10)
   )
   (i32.const 3628800)
   (i64.const 12884902094)
  )
  (call $fimport$2)
 )
 (func $8
  (global.set $global$0
   (i32.const 65536)
  )
  (global.set $global$1
   (i64.const 8589934592)
  )
 )
)
