(module
 (type $0 (func (param i32)))
 (type $1 (func (param i32 i32)))
 (type $2 (func))
 (type $3 (func (param i64 i32)))
 (type $4 (func (result i32)))
 (type $5 (func (param i32 i64)))
 (type $6 (func (param i32)))
 (import "test" "pushTest" (func $fimport$0 (param i32)))
 (import "test" "registerAssertion" (func $fimport$1 (param i32 i32)))
 (import "test" "popTest" (func $fimport$2))
 (import "env" "printf" (func $fimport$3 (param i32 i32)))
 (memory $0 1)
 (data (i32.const 664) "\08\00\00\00t\00r\00u\00e")
 (data (i32.const 677) "\n\00\00\00f\00a\00l\00s\00e")
 (data (i32.const 692) "\02\00\00\000")
 (data (i32.const 699) "\02\00\00\000")
 (data (i32.const 213) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 240) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 273) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 300) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 333) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 360) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 393) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 420) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 453) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 480) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 513) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 540) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 573) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 600) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 633) "\1a\00\00\00a\00s\00s\00e\00r\00t\00(\00f\00a\00l\00s\00e\00)")
 (data (i32.const 16) ".\00\00\00I\00m\00p\00l\00i\00c\00i\00t\00 \00n\00u\00m\00b\00e\00r\00 \00c\00a\00s\00t\00i\00n\00g")
 (data (i32.const 67) "$\00\00\00e\00q\00(\001\000\00_\00u\001\006\00,\00 \001\000\00_\00i\003\002\00)")
 (data (i32.const 108) "\0e\00\00\00m\00a\00t\00c\00h\00 \000")
 (data (i32.const 127) "\0e\00\00\00m\00a\00t\00c\00h\00 \001")
 (data (i32.const 146) "\12\00\00\00m\00a\00t\00c\00h\00 \001\00.\001")
 (data (i32.const 169) "\12\00\00\00m\00a\00t\00c\00h\00 \001\00.\001")
 (data (i32.const 192) "\10\00\00\000\00.\000\00 \00=\00=\00 \000")
 (global $global$0 (mut i32) (i32.const 0))
 (global $global$1 (mut i32) (i32.const 0))
 (global $global$2 (mut i32) (i32.const 0))
 (global $global$3 (mut i32) (i32.const 0))
 (global $global$4 (mut i32) (i32.const 0))
 (global $global$5 (mut i32) (i32.const 0))
 (global $global$6 (mut i32) (i32.const 0))
 (global $global$7 (mut i64) (i64.const 0))
 (global $global$8 (mut i32) (i32.const 0))
 (export "memory" (memory $0))
 (export "test_getMaxMemory" (func $1))
 (export "test_getLastErrorMessage" (func $3))
 (export "main" (func $5))
 (start $6)
 (func $0 (; 4 ;) (type $3) (param $0 i64) (param $1 i32)
  (call $fimport$3
   (i32.wrap_i64
    (local.get $0)
   )
   (local.get $1)
  )
 )
 (func $1 (; 5 ;) (type $4) (result i32)
  (global.get $global$6)
 )
 (func $2 (; 6 ;) (type $6) (param $0 i32)
  (call $4
   (i32.eq
    (local.get $0)
    (i32.const 10)
   )
   (i64.const 67)
  )
  (if
   (i32.ne
    (local.get $0)
    (i32.const 10)
   )
   (block
    (call $0
     (i64.const 393)
     (local.get $0)
    )
    (call $0
     (i64.const 420)
     (i32.const 10)
    )
   )
  )
 )
 (func $3 (; 7 ;) (type $4) (result i32)
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
 (func $4 (; 8 ;) (type $5) (param $0 i32) (param $1 i64)
  (call $fimport$1
   (local.get $0)
   (i32.wrap_i64
    (local.get $1)
   )
  )
 )
 (func $5 (; 9 ;) (type $2)
  (call $fimport$0
   (i32.const 16)
  )
  (call $2
   (global.get $global$8)
  )
  (call $4
   (i32.const 1)
   (i64.const 108)
  )
  (call $4
   (i32.const 1)
   (i64.const 127)
  )
  (call $4
   (i32.const 1)
   (i64.const 146)
  )
  (call $4
   (i32.const 1)
   (i64.const 169)
  )
  (call $4
   (i32.const 1)
   (i64.const 192)
  )
  (call $fimport$2)
 )
 (func $6 (; 10 ;) (type $2)
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
   (i32.const 10)
  )
 )
)
