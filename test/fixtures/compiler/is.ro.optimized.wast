(module
 (type $0 (func (param i64) (result i64)))
 (type $1 (func (param i64) (result i32)))
 (type $2 (func))
 (global $global$0 (mut i64) (i64.const 0))
 (global $global$1 (mut i64) (i64.const 0))
 (global $global$2 (mut i64) (i64.const 0))
 (export "identity" (func $0))
 (export "test" (func $1))
 (start $5)
 (func $0 (; 0 ;) (type $0) (param $0 i64) (result i64)
  (get_local $0)
 )
 (func $1 (; 1 ;) (type $2)
  (drop
   (call $2
    (get_global $global$0)
   )
  )
  (drop
   (call $4
    (get_global $global$0)
   )
  )
  (drop
   (call $3
    (get_global $global$0)
   )
  )
  (drop
   (call $2
    (get_global $global$1)
   )
  )
  (drop
   (call $4
    (get_global $global$1)
   )
  )
  (drop
   (call $3
    (get_global $global$1)
   )
  )
  (drop
   (call $2
    (get_global $global$2)
   )
  )
  (drop
   (call $4
    (get_global $global$2)
   )
  )
  (drop
   (call $3
    (get_global $global$2)
   )
  )
 )
 (func $2 (; 2 ;) (type $1) (param $0 i64) (result i32)
  (i64.eq
   (i64.and
    (get_local $0)
    (i64.const -4294967296)
   )
   (i64.const 4294967296)
  )
 )
 (func $3 (; 3 ;) (type $1) (param $0 i64) (result i32)
  (i64.eq
   (i64.and
    (get_local $0)
    (i64.const -4294967296)
   )
   (i64.const 8589934592)
  )
 )
 (func $4 (; 4 ;) (type $1) (param $0 i64) (result i32)
  (local $1 i64)
  (i32.or
   (i32.or
    (i64.eq
     (tee_local $1
      (i64.and
       (get_local $0)
       (i64.const -4294967296)
      )
     )
     (i64.const 12884901888)
    )
    (i64.eq
     (get_local $1)
     (i64.const 8589934592)
    )
   )
   (i64.eq
    (get_local $1)
    (i64.const 4294967296)
   )
  )
 )
 (func $5 (; 5 ;) (type $2)
  (set_global $global$0
   (i64.const 4294967296)
  )
  (set_global $global$1
   (i64.const 4294967296)
  )
  (set_global $global$2
   (i64.const 4294967296)
  )
 )
)
