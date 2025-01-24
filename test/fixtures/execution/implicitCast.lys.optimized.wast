(module
 (type $0 (func))
 (type $1 (func (result i32)))
 (type $2 (func (param i32)))
 (type $3 (func (param i32 i32)))
 (type $4 (func (param i64)))
 (import "test" "pushTest" (func $fimport$0 (param i32)))
 (import "test" "registerAssertion" (func $fimport$1 (param i32 i32)))
 (import "test" "popTest" (func $fimport$2))
 (global $global$0 (mut i32) (i32.const 0))
 (global $global$1 (mut i64) (i64.const 0))
 (memory $0 1)
 (data $0 (i32.const 214) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data $1 (i32.const 241) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data $2 (i32.const 274) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data $3 (i32.const 301) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data $4 (i32.const 334) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data $5 (i32.const 369) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data $6 (i32.const 410) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data $7 (i32.const 445) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data $8 (i32.const 486) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data $9 (i32.const 521) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data $10 (i32.const 562) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data $11 (i32.const 597) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data $12 (i32.const 638) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00X")
 (data $13 (i32.const 665) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00X")
 (data $14 (i32.const 698) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data $15 (i32.const 725) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data $16 (i32.const 758) "\1a\00\00\00a\00s\00s\00e\00r\00t\00(\00f\00a\00l\00s\00e\00)")
 (data $17 (i32.const 172) "\08\00\00\00t\00r\00u\00e")
 (data $18 (i32.const 185) "\n\00\00\00f\00a\00l\00s\00e")
 (data $19 (i32.const 200) "\02\00\00\000")
 (data $20 (i32.const 207) "\02\00\00\000")
 (data $21 (i32.const 16) ".\00\00\00I\00m\00p\00l\00i\00c\00i\00t\00 \00n\00u\00m\00b\00e\00r\00 \00c\00a\00s\00t\00i\00n\00g")
 (data $22 (i32.const 67) "$\00\00\00e\00q\00(\001\000\00_\00u\001\006\00,\00 \001\000\00_\00i\003\002\00)")
 (data $23 (i32.const 108) "\0e\00\00\00m\00a\00t\00c\00h\00 \000")
 (data $24 (i32.const 127) "\0e\00\00\00m\00a\00t\00c\00h\00 \001")
 (data $25 (i32.const 146) "\10\00\00\000\00.\000\00 \00=\00=\00 \000")
 (export "memory" (memory $0))
 (export "test_getMaxMemory" (func $0))
 (export "test_getLastErrorMessage" (func $1))
 (export "main" (func $3))
 (start $4)
 (func $0 (result i32)
  (global.get $global$0)
 )
 (func $1 (result i32)
  (local $0 i64)
  (if (result i32)
   (i32.eq
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
 (func $2 (param $0 i64)
  (call $fimport$1
   (i32.const 1)
   (i32.wrap_i64
    (local.get $0)
   )
  )
 )
 (func $3
  (call $fimport$0
   (i32.const 16)
  )
  (call $2
   (i64.const 12884901955)
  )
  (call $2
   (i64.const 12884901996)
  )
  (call $2
   (i64.const 12884902015)
  )
  (call $2
   (i64.const 12884902034)
  )
  (call $fimport$2)
 )
 (func $4
  (global.set $global$0
   (i32.const 65536)
  )
  (global.set $global$1
   (i64.const 8589934592)
  )
 )
)
