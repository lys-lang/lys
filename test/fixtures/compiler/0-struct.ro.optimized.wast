(module
 (type $0 (func (param i32) (result i32)))
 (type $2 (func (param i32 i32) (result i32)))
 (type $6 (func (param i32)))
 (type $7 (func))
 (type $15 (func (param i64) (result i32)))
 (type $19 (func (param i32 i32 i32) (result i64)))
 (global $global$0 (mut i32) (i32.const 0))
 (global $global$1 (mut i32) (i32.const 0))
 (global $global$2 (mut i32) (i32.const 0))
 (global $global$3 (mut i32) (i32.const 0))
 (global $global$4 (mut i32) (i32.const 0))
 (global $global$5 (mut i32) (i32.const 0))
 (global $global$6 (mut i32) (i32.const 0))
 (global $global$7 (mut i32) (i32.const 0))
 (memory $0 0 1)
 (export "isRed" (func $113))
 (export "testColors" (func $114))
 (start $123)
 (func $3 (; 0 ;) (; has Stack IR ;) (type $0) (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (if
   (call $81
    (get_local $0)
    (i32.const 0)
   )
   (block
    (if
     (call $81
      (get_local $0)
      (get_global $global$3)
     )
     (unreachable)
    )
    (if
     (call $81
      (tee_local $0
       (call $98
        (call $22
         (call $22
          (tee_local $3
           (get_global $global$6)
          )
          (get_local $0)
         )
         (get_global $global$2)
        )
        (call $47
         (get_global $global$2)
        )
       )
      )
      (call $59
       (tee_local $1
        (current_memory)
       )
       (i32.const 16)
      )
     )
     (block
      (set_local $2
       (get_local $1)
      )
      (set_local $4
       (tee_local $1
        (i32.shr_u
         (call $98
          (call $22
           (call $28
            (get_local $0)
            (get_local $3)
           )
           (i32.const 65535)
          )
          (call $47
           (i32.const 65535)
          )
         )
         (i32.const 16)
        )
       )
      )
      (if
       (i32.eqz
        (call $81
         (get_local $2)
         (get_local $1)
        )
       )
       (set_local $2
        (get_local $4)
       )
      )
      (if
       (call $87
        (grow_memory
         (get_local $2)
        )
        (i32.const 0)
       )
       (if
        (call $87
         (grow_memory
          (get_local $1)
         )
         (i32.const 0)
        )
        (unreachable)
       )
      )
     )
    )
    (set_global $global$6
     (get_local $0)
    )
   )
  )
  (get_local $3)
 )
 (func $10 (; 1 ;) (; has Stack IR ;) (type $6) (param $0 i32)
  (if
   (call $13
    (get_local $0)
    (i32.const 0)
   )
   (unreachable)
  )
 )
 (func $13 (; 2 ;) (; has Stack IR ;) (type $2) (param $0 i32) (param $1 i32) (result i32)
  (i32.eq
   (i32.eqz
    (get_local $0)
   )
   (i32.eqz
    (get_local $1)
   )
  )
 )
 (func $22 (; 3 ;) (; has Stack IR ;) (type $2) (param $0 i32) (param $1 i32) (result i32)
  (i32.add
   (get_local $0)
   (get_local $1)
  )
 )
 (func $28 (; 4 ;) (; has Stack IR ;) (type $2) (param $0 i32) (param $1 i32) (result i32)
  (i32.sub
   (get_local $0)
   (get_local $1)
  )
 )
 (func $47 (; 5 ;) (; has Stack IR ;) (type $0) (param $0 i32) (result i32)
  (i32.xor
   (get_local $0)
   (i32.const -1)
  )
 )
 (func $59 (; 6 ;) (; has Stack IR ;) (type $2) (param $0 i32) (param $1 i32) (result i32)
  (i32.shl
   (get_local $0)
   (get_local $1)
  )
 )
 (func $81 (; 7 ;) (; has Stack IR ;) (type $2) (param $0 i32) (param $1 i32) (result i32)
  (i32.gt_s
   (get_local $0)
   (get_local $1)
  )
 )
 (func $87 (; 8 ;) (; has Stack IR ;) (type $2) (param $0 i32) (param $1 i32) (result i32)
  (i32.lt_s
   (get_local $0)
   (get_local $1)
  )
 )
 (func $98 (; 9 ;) (; has Stack IR ;) (type $2) (param $0 i32) (param $1 i32) (result i32)
  (i32.and
   (get_local $0)
   (get_local $1)
  )
 )
 (func $113 (; 10 ;) (; has Stack IR ;) (type $15) (param $0 i64) (result i32)
  (block $label$2 (result i32)
   (drop
    (br_if $label$2
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
 (func $114 (; 11 ;) (; has Stack IR ;) (type $7)
  (call $10
   (call $13
    (call $113
     (i64.const 4294967296)
    )
    (i32.const 1)
   )
  )
  (call $10
   (call $13
    (call $113
     (i64.const 8589934592)
    )
    (i32.const 0)
   )
  )
  (call $10
   (call $13
    (call $113
     (i64.const 12884901888)
    )
    (i32.const 0)
   )
  )
  (call $10
   (call $13
    (call $113
     (call $122
      (i32.const 5)
      (i32.const 5)
      (i32.const 5)
     )
    )
    (i32.const 0)
   )
  )
  (call $10
   (call $13
    (call $113
     (i64.const 4294967296)
    )
    (i32.const 1)
   )
  )
  (call $10
   (call $13
    (call $113
     (i64.const 8589934592)
    )
    (i32.const 0)
   )
  )
  (call $10
   (call $13
    (call $113
     (i64.const 12884901888)
    )
    (i32.const 0)
   )
  )
  (call $10
   (call $13
    (call $113
     (call $122
      (i32.const 5)
      (i32.const 5)
      (i32.const 5)
     )
    )
    (i32.const 0)
   )
  )
 )
 (func $122 (; 12 ;) (; has Stack IR ;) (type $19) (param $0 i32) (param $1 i32) (param $2 i32) (result i64)
  (i64.or
   (i64.extend_u/i32
    (call $3
     (i32.const 8)
    )
   )
   (i64.const 17179869184)
  )
 )
 (func $123 (; 13 ;) (; has Stack IR ;) (type $7)
  (set_global $global$0
   (i32.const 3)
  )
  (set_global $global$1
   (call $59
    (i32.const 1)
    (get_global $global$0)
   )
  )
  (set_global $global$2
   (call $28
    (get_global $global$1)
    (i32.const 1)
   )
  )
  (set_global $global$3
   (call $59
    (i32.const 1)
    (i32.const 30)
   )
  )
  (set_global $global$4
   (i32.const 0)
  )
  (set_global $global$5
   (call $98
    (call $22
     (get_global $global$4)
     (get_global $global$2)
    )
    (call $47
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
