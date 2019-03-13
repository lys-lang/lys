(module
 (type $0 (func (param i32)))
 (type $1 (func (param i32 i32)))
 (type $2 (func))
 (type $3 (func (result i32)))
 (type $4 (func (param i32) (result i32)))
 (type $5 (func (param i32 i32 i32) (result i32)))
 (type $6 (func (param i32 i32 i64)))
 (type $7 (func (param i64)))
 (import "test" "pushTest" (func $fimport$0 (param i32)))
 (import "test" "registerAssertion" (func $fimport$1 (param i32 i32)))
 (import "test" "popTest" (func $fimport$2))
 (memory $0 1)
 (data (i32.const 300) "\08\00\00\00t\00r\00u\00e")
 (data (i32.const 313) "\n\00\00\00f\00a\00l\00s\00e")
 (data (i32.const 328) "\02\00\00\000")
 (data (i32.const 335) "\02\00\00\000")
 (data (i32.const 269) "\1a\00\00\00a\00s\00s\00e\00r\00t\00(\00f\00a\00l\00s\00e\00)")
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
 (export "test_getMaxMemory" (func $0))
 (export "test_getLastErrorMessage" (func $2))
 (export "main" (func $6))
 (start $7)
 (func $0 (; 3 ;) (type $3) (result i32)
  (global.get $global$6)
 )
 (func $1 (; 4 ;) (type $6) (param $0 i32) (param $1 i32) (param $2 i64)
  (call $fimport$1
   (i32.eq
    (local.get $0)
    (local.get $1)
   )
   (i32.wrap_i64
    (local.get $2)
   )
  )
 )
 (func $2 (; 5 ;) (type $3) (result i32)
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
 (func $3 (; 6 ;) (type $7) (param $0 i64)
  (call $fimport$0
   (i32.wrap_i64
    (local.get $0)
   )
  )
 )
 (func $4 (; 7 ;) (type $5) (param $0 i32) (param $1 i32) (param $2 i32) (result i32)
  (if (result i32)
   (i32.gt_s
    (local.get $0)
    (i32.const 0)
   )
   (call $4
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
 (func $5 (; 8 ;) (type $4) (param $0 i32) (result i32)
  (if (result i32)
   (i32.ge_s
    (local.get $0)
    (i32.const 1)
   )
   (i32.mul
    (call $5
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
 (func $6 (; 9 ;) (type $2)
  (call $3
   (i64.const 16)
  )
  (call $1
   (call $4
    (i32.const 46)
    (i32.const 0)
    (i32.const 1)
   )
   (i32.const 1836311903)
   (i64.const 39)
  )
  (call $1
   (call $4
    (i32.const 45)
    (i32.const 1)
    (i32.const 1)
   )
   (i32.const 1836311903)
   (i64.const 96)
  )
  (call $fimport$2)
  (call $3
   (i64.const 183)
  )
  (call $1
   (call $5
    (i32.const 10)
   )
   (i32.const 3628800)
   (i64.const 206)
  )
  (call $fimport$2)
 )
 (func $7 (; 10 ;) (type $2)
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
