(module
 (type $0 (func (param i64) (result i32)))
 (type $1 (func))
 (type $2 (func (param i32 i32) (result i32)))
 (type $3 (func (param i64) (result i64)))
 (memory $0 1)
 (global $global$0 (mut i64) (i64.const 0))
 (global $global$1 (mut i64) (i64.const 0))
 (global $global$2 (mut i64) (i64.const 0))
 (export "memory" (memory $0))
 (export "identity" (func $1))
 (export "test" (func $5))
 (start $6)
 (func $0 (; 0 ;) (type $2) (param $0 i32) (param $1 i32) (result i32)
  (i32.or
   (i32.ne
    (local.get $0)
    (i32.const 0)
   )
   (i32.ne
    (local.get $1)
    (i32.const 0)
   )
  )
 )
 (func $1 (; 1 ;) (type $3) (param $0 i64) (result i64)
  (local.get $0)
 )
 (func $2 (; 2 ;) (type $0) (param $0 i64) (result i32)
  (call $0
   (call $0
    (call $3
     (local.get $0)
    )
    (call $4
     (local.get $0)
    )
   )
   (i64.eq
    (i64.and
     (local.get $0)
     (i64.const -4294967296)
    )
    (i64.const 17179869184)
   )
  )
 )
 (func $3 (; 3 ;) (type $0) (param $0 i64) (result i32)
  (i64.eq
   (i64.and
    (local.get $0)
    (i64.const -4294967296)
   )
   (i64.const 8589934592)
  )
 )
 (func $4 (; 4 ;) (type $0) (param $0 i64) (result i32)
  (i64.eq
   (i64.and
    (local.get $0)
    (i64.const -4294967296)
   )
   (i64.const 12884901888)
  )
 )
 (func $5 (; 5 ;) (type $1)
  (drop
   (call $3
    (global.get $global$0)
   )
  )
  (drop
   (call $2
    (global.get $global$0)
   )
  )
  (drop
   (call $4
    (global.get $global$0)
   )
  )
  (drop
   (call $3
    (global.get $global$1)
   )
  )
  (drop
   (call $2
    (global.get $global$1)
   )
  )
  (drop
   (call $4
    (global.get $global$1)
   )
  )
  (drop
   (call $3
    (global.get $global$2)
   )
  )
  (drop
   (call $2
    (global.get $global$2)
   )
  )
  (drop
   (call $4
    (global.get $global$2)
   )
  )
 )
 (func $6 (; 6 ;) (type $1)
  (global.set $global$0
   (i64.const 8589934592)
  )
  (global.set $global$1
   (i64.const 8589934592)
  )
  (global.set $global$2
   (i64.const 8589934592)
  )
 )
)
