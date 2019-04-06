(module
 (type $0 (func (param i32)))
 (type $1 (func (param i32 i32)))
 (type $2 (func))
 (type $3 (func (param i64 i32)))
 (type $4 (func (param i64)))
 (type $5 (func (result i32)))
 (type $6 (func (param i32) (result i32)))
 (type $7 (func (param i32 i32 i32) (result i32)))
 (type $8 (func (param i32 i32 i64)))
 (import "test" "pushTest" (func $fimport$0 (param i32)))
 (import "test" "registerAssertion" (func $fimport$1 (param i32 i32)))
 (import "test" "popTest" (func $fimport$2))
 (import "env" "printf" (func $fimport$3 (param i32 i32)))
 (memory $0 1)
 (data (i32.const 844) "\08\00\00\00t\00r\00u\00e")
 (data (i32.const 857) "\n\00\00\00f\00a\00l\00s\00e")
 (data (i32.const 872) "\02\00\00\000")
 (data (i32.const 879) "\02\00\00\000")
 (data (i32.const 269) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 296) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 329) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 356) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 389) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 424) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 465) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 500) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 541) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 576) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data (i32.const 617) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 652) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data (i32.const 693) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00X")
 (data (i32.const 720) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00X")
 (data (i32.const 753) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data (i32.const 780) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data (i32.const 813) "\1a\00\00\00a\00s\00s\00e\00r\00t\00(\00f\00a\00l\00s\00e\00)")
 (data (i32.const 16) "\12\00\00\00f\00i\00b\00o\00n\00a\00c\00c\00i")
 (data (i32.const 39) "4\00\00\00f\00i\00b\00(\004\006\00)\00 \00m\00u\00s\00t\00 \00b\00e\00 \001\008\003\006\003\001\001\009\000\003")
 (data (i32.const 96) "R\00\00\00f\00i\00b\00P\00a\00t\00t\00e\00r\00n\00M\00a\00t\00c\00h\00i\00n\00g\00(\004\006\00)\00 \00m\00u\00s\00t\00 \00b\00e\00 \001\008\003\006\003\001\001\009\000\003")
 (data (i32.const 183) "\12\00\00\00f\00a\00c\00t\00o\00r\00i\00a\00l")
 (data (i32.const 206) ":\00\00\00f\00a\00c\00t\00o\00r\00i\00a\00l\00(\001\000\00)\00 \00m\00u\00s\00t\00 \00b\00e\00 \003\006\002\008\008\000\000")
 (global $global$0 (mut i32) (i32.const 0))
 (global $global$1 (mut i32) (i32.const 0))
 (global $global$2 (mut i32) (i32.const 0))
 (global $global$3 (mut i32) (i32.const 0))
 (global $global$4 (mut i32) (i32.const 0))
 (global $global$5 (mut i32) (i32.const 0))
 (global $global$6 (mut i32) (i32.const 0))
 (global $global$7 (mut i64) (i64.const 0))
 (export "memory" (memory $0))
 (export "test_getMaxMemory" (func $1))
 (export "test_getLastErrorMessage" (func $3))
 (export "main" (func $7))
 (start $8)
 (func $0 (; 4 ;) (type $3) (param $0 i64) (param $1 i32)
  (call $fimport$3
   (i32.wrap_i64
    (local.get $0)
   )
   (local.get $1)
  )
 )
 (func $1 (; 5 ;) (type $5) (result i32)
  (global.get $global$6)
 )
 (func $2 (; 6 ;) (type $8) (param $0 i32) (param $1 i32) (param $2 i64)
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
     (i64.const 753)
     (local.get $0)
    )
    (call $0
     (i64.const 780)
     (local.get $1)
    )
   )
  )
 )
 (func $3 (; 7 ;) (type $5) (result i32)
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
      (i64.const 77309411328)
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
 (func $4 (; 8 ;) (type $4) (param $0 i64)
  (call $fimport$0
   (i32.wrap_i64
    (local.get $0)
   )
  )
 )
 (func $5 (; 9 ;) (type $7) (param $0 i32) (param $1 i32) (param $2 i32) (result i32)
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
 (func $6 (; 10 ;) (type $6) (param $0 i32) (result i32)
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
 (func $7 (; 11 ;) (type $2)
  (call $4
   (i64.const 16)
  )
  (call $2
   (call $5
    (i32.const 46)
    (i32.const 0)
    (i32.const 1)
   )
   (i32.const 1836311903)
   (i64.const 39)
  )
  (call $2
   (call $5
    (i32.const 45)
    (i32.const 1)
    (i32.const 1)
   )
   (i32.const 1836311903)
   (i64.const 96)
  )
  (call $fimport$2)
  (call $4
   (i64.const 183)
  )
  (call $2
   (call $6
    (i32.const 10)
   )
   (i32.const 3628800)
   (i64.const 206)
  )
  (call $fimport$2)
 )
 (func $8 (; 12 ;) (type $2)
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
   (i64.const 73014444032)
  )
 )
)
