(module
 (type $0 (func (param i32) (result i32)))
 (type $1 (func (param i32 i32) (result i32)))
 (type $2 (func (param i32)))
 (type $3 (func))
 (type $4 (func (param i64) (result i32)))
 (type $5 (func (result i32)))
 (type $6 (func (param i32) (result i32)))
 (type $7 (func (result i64)))
 (global $global$0 (mut i32) (i32.const 0))
 (global $global$1 (mut i32) (i32.const 0))
 (global $global$2 (mut i32) (i32.const 0))
 (global $global$3 (mut i32) (i32.const 0))
 (global $global$4 (mut i32) (i32.const 0))
 (global $global$5 (mut i32) (i32.const 0))
 (global $global$6 (mut i32) (i32.const 0))
 (global $global$7 (mut i32) (i32.const 0))
 (memory $0 0 1)
 (export "isRed" (func $10))
 (export "testColors" (func $11))
 (start $13)
 (func $0 (; 0 ;) (type $5) (result i32)
  (local $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (if
   (call $7
    (i32.const 8)
    (i32.const 0)
   )
   (block
    (if
     (call $7
      (i32.const 8)
      (get_global $global$3)
     )
     (unreachable)
    )
    (if
     (call $7
      (tee_local $3
       (call $9
        (call $3
         (call $3
          (tee_local $2
           (get_global $global$6)
          )
          (i32.const 8)
         )
         (get_global $global$2)
        )
        (call $5
         (get_global $global$2)
        )
       )
      )
      (call $6
       (tee_local $0
        (current_memory)
       )
       (i32.const 16)
      )
     )
     (block
      (set_local $1
       (get_local $0)
      )
      (set_local $4
       (tee_local $0
        (i32.shr_u
         (call $9
          (call $3
           (call $4
            (get_local $3)
            (get_local $2)
           )
           (i32.const 65535)
          )
          (call $5
           (i32.const 65535)
          )
         )
         (i32.const 16)
        )
       )
      )
      (if
       (i32.eqz
        (call $7
         (get_local $1)
         (get_local $0)
        )
       )
       (set_local $1
        (get_local $4)
       )
      )
      (if
       (call $8
        (grow_memory
         (get_local $1)
        )
       )
       (if
        (call $8
         (grow_memory
          (get_local $0)
         )
        )
        (unreachable)
       )
      )
     )
    )
    (set_global $global$6
     (get_local $3)
    )
   )
  )
  (get_local $2)
 )
 (func $1 (; 1 ;) (type $2) (param $0 i32)
  (if
   (call $2
    (get_local $0)
    (i32.const 0)
   )
   (unreachable)
  )
 )
 (func $2 (; 2 ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (i32.eq
   (i32.eqz
    (get_local $0)
   )
   (i32.eqz
    (get_local $1)
   )
  )
 )
 (func $3 (; 3 ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (i32.add
   (get_local $0)
   (get_local $1)
  )
 )
 (func $4 (; 4 ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (i32.sub
   (get_local $0)
   (get_local $1)
  )
 )
 (func $5 (; 5 ;) (type $0) (param $0 i32) (result i32)
  (i32.xor
   (get_local $0)
   (i32.const -1)
  )
 )
 (func $6 (; 6 ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (i32.shl
   (get_local $0)
   (get_local $1)
  )
 )
 (func $7 (; 7 ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (i32.gt_s
   (get_local $0)
   (get_local $1)
  )
 )
 (func $8 (; 8 ;) (type $6) (param $0 i32) (result i32)
  (i32.lt_s
   (get_local $0)
   (i32.const 0)
  )
 )
 (func $9 (; 9 ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (i32.and
   (get_local $0)
   (get_local $1)
  )
 )
 (func $10 (; 10 ;) (type $4) (param $0 i64) (result i32)
  (block $label$1 (result i32)
   (drop
    (br_if $label$1
     (i32.const 0)
     (i64.ne
      (i64.and
       (get_local $0)
       (i64.const -4294967296)
      )
      (i64.const 4294967296)
     )
    )
   )
   (i32.const 1)
  )
 )
 (func $11 (; 11 ;) (type $3)
  (call $1
   (call $2
    (call $10
     (i64.const 4294967296)
    )
    (i32.const 1)
   )
  )
  (call $1
   (call $2
    (call $10
     (i64.const 8589934592)
    )
    (i32.const 0)
   )
  )
  (call $1
   (call $2
    (call $10
     (i64.const 12884901888)
    )
    (i32.const 0)
   )
  )
  (call $1
   (call $2
    (call $10
     (call $12)
    )
    (i32.const 0)
   )
  )
  (call $1
   (call $2
    (call $10
     (i64.const 4294967296)
    )
    (i32.const 1)
   )
  )
  (call $1
   (call $2
    (call $10
     (i64.const 8589934592)
    )
    (i32.const 0)
   )
  )
  (call $1
   (call $2
    (call $10
     (i64.const 12884901888)
    )
    (i32.const 0)
   )
  )
  (call $1
   (call $2
    (call $10
     (call $12)
    )
    (i32.const 0)
   )
  )
 )
 (func $12 (; 12 ;) (type $7) (result i64)
  (i64.or
   (i64.extend_u/i32
    (call $0)
   )
   (i64.const 17179869184)
  )
 )
 (func $13 (; 13 ;) (type $3)
  (set_global $global$0
   (i32.const 3)
  )
  (set_global $global$1
   (call $6
    (i32.const 1)
    (get_global $global$0)
   )
  )
  (set_global $global$2
   (call $4
    (get_global $global$1)
    (i32.const 1)
   )
  )
  (set_global $global$3
   (call $6
    (i32.const 1)
    (i32.const 30)
   )
  )
  (set_global $global$4
   (i32.const 0)
  )
  (set_global $global$5
   (call $9
    (call $3
     (get_global $global$4)
     (get_global $global$2)
    )
    (call $5
     (get_global $global$2)
    )
   )
  )
  (set_global $global$6
   (get_global $global$5)
  )
  (set_global $global$7
   (i32.const 0)
  )
 )
)
