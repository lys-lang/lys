(module
 (type $0 (func (param i32) (result i32)))
 (type $1 (func (param i32 i32) (result i32)))
 (type $2 (func (param i64) (result i64)))
 (type $3 (func (param i64) (result i32)))
 (type $4 (func))
 (type $5 (func (result i32)))
 (type $6 (func (param i32) (result i32)))
 (global $global$0 (mut i32) (i32.const 0))
 (global $global$1 (mut i32) (i32.const 0))
 (global $global$2 (mut i32) (i32.const 0))
 (global $global$3 (mut i32) (i32.const 0))
 (global $global$4 (mut i32) (i32.const 0))
 (global $global$5 (mut i32) (i32.const 0))
 (global $global$6 (mut i32) (i32.const 0))
 (global $global$7 (mut i32) (i32.const 0))
 (memory $0 0 1)
 (export "test" (func $9))
 (export "test2" (func $10))
 (export "test3" (func $11))
 (export "test4" (func $12))
 (start $15)
 (func $0 (; 0 ;) (type $5) (result i32)
  (local $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (if
   (call $6
    (i32.const 8)
    (i32.const 0)
   )
   (block
    (if
     (call $6
      (i32.const 8)
      (get_global $global$3)
     )
     (unreachable)
    )
    (if
     (call $6
      (tee_local $3
       (call $8
        (call $2
         (call $2
          (tee_local $2
           (get_global $global$6)
          )
          (i32.const 8)
         )
         (get_global $global$2)
        )
        (call $4
         (get_global $global$2)
        )
       )
      )
      (call $5
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
         (call $8
          (call $2
           (call $3
            (get_local $3)
            (get_local $2)
           )
           (i32.const 65535)
          )
          (call $4
           (i32.const 65535)
          )
         )
         (i32.const 16)
        )
       )
      )
      (if
       (i32.eqz
        (call $6
         (get_local $1)
         (get_local $0)
        )
       )
       (set_local $1
        (get_local $4)
       )
      )
      (if
       (call $7
        (grow_memory
         (get_local $1)
        )
       )
       (if
        (call $7
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
 (func $1 (; 1 ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (i32.eq
   (get_local $0)
   (get_local $1)
  )
 )
 (func $2 (; 2 ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (i32.add
   (get_local $0)
   (get_local $1)
  )
 )
 (func $3 (; 3 ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (i32.sub
   (get_local $0)
   (get_local $1)
  )
 )
 (func $4 (; 4 ;) (type $0) (param $0 i32) (result i32)
  (i32.xor
   (get_local $0)
   (i32.const -1)
  )
 )
 (func $5 (; 5 ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (i32.shl
   (get_local $0)
   (get_local $1)
  )
 )
 (func $6 (; 6 ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (i32.gt_s
   (get_local $0)
   (get_local $1)
  )
 )
 (func $7 (; 7 ;) (type $6) (param $0 i32) (result i32)
  (i32.lt_s
   (get_local $0)
   (i32.const 0)
  )
 )
 (func $8 (; 8 ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (i32.and
   (get_local $0)
   (get_local $1)
  )
 )
 (func $9 (; 9 ;) (type $0) (param $0 i32) (result i32)
  (block $label$1 (result i32)
   (drop
    (br_if $label$1
     (i32.const 0)
     (i32.eqz
      (call $1
       (i32.const 1)
       (get_local $0)
      )
     )
    )
   )
   (i32.const 1)
  )
 )
 (func $10 (; 10 ;) (type $0) (param $0 i32) (result i32)
  (tee_local $0
   (block $label$1 (result i32)
    (block $label$2
     (block $label$3
      (block $label$4
       (block $label$5
        (block $label$6
         (block $label$7
          (block $label$8
           (block $label$9
            (block $label$10
             (br_if $label$2
              (call $1
               (i32.const 10)
               (get_local $0)
              )
             )
             (br_if $label$3
              (call $1
               (i32.const 20)
               (get_local $0)
              )
             )
             (br_if $label$4
              (call $1
               (i32.const 30)
               (get_local $0)
              )
             )
             (br_if $label$5
              (call $1
               (i32.const 40)
               (get_local $0)
              )
             )
             (br_if $label$6
              (call $1
               (i32.const 50)
               (get_local $0)
              )
             )
             (br_if $label$7
              (call $1
               (i32.const 60)
               (get_local $0)
              )
             )
             (br_if $label$8
              (call $1
               (i32.const 70)
               (get_local $0)
              )
             )
             (br_if $label$9
              (call $1
               (i32.const 80)
               (get_local $0)
              )
             )
             (br_if $label$10
              (call $1
               (i32.const 90)
               (get_local $0)
              )
             )
             (br $label$1
              (i32.const 0)
             )
            )
            (br $label$1
             (i32.const 9)
            )
           )
           (br $label$1
            (i32.const 8)
           )
          )
          (br $label$1
           (i32.const 7)
          )
         )
         (br $label$1
          (i32.const 6)
         )
        )
        (br $label$1
         (i32.const 5)
        )
       )
       (br $label$1
        (i32.const 4)
       )
      )
      (br $label$1
       (i32.const 3)
      )
     )
     (br $label$1
      (i32.const 2)
     )
    )
    (i32.const 1)
   )
  )
 )
 (func $11 (; 11 ;) (type $3) (param $0 i64) (result i32)
  (block $label$1 (result i32)
   (block $label$2
    (block $label$3
     (br_if $label$2
      (call $14
       (get_local $0)
      )
     )
     (br_if $label$3
      (call $13
       (get_local $0)
      )
     )
    )
    (br $label$1
     (i32.const 0)
    )
   )
   (i32.const 1)
  )
 )
 (func $12 (; 12 ;) (type $2) (param $0 i64) (result i64)
  (block $label$1
   (block $label$2
    (br_if $label$1
     (call $14
      (get_local $0)
     )
    )
    (br_if $label$2
     (call $13
      (get_local $0)
     )
    )
   )
   (set_local $0
    (i64.or
     (i64.extend_u/i32
      (call $0)
     )
     (i64.const 8589934592)
    )
   )
  )
  (get_local $0)
 )
 (func $13 (; 13 ;) (type $3) (param $0 i64) (result i32)
  (i64.eq
   (i64.and
    (get_local $0)
    (i64.const -4294967296)
   )
   (i64.const 4294967296)
  )
 )
 (func $14 (; 14 ;) (type $3) (param $0 i64) (result i32)
  (i64.eq
   (i64.and
    (get_local $0)
    (i64.const -4294967296)
   )
   (i64.const 8589934592)
  )
 )
 (func $15 (; 15 ;) (type $4)
  (set_global $global$0
   (i32.const 3)
  )
  (set_global $global$1
   (call $5
    (i32.const 1)
    (get_global $global$0)
   )
  )
  (set_global $global$2
   (call $3
    (get_global $global$1)
    (i32.const 1)
   )
  )
  (set_global $global$3
   (call $5
    (i32.const 1)
    (i32.const 30)
   )
  )
  (set_global $global$4
   (i32.const 0)
  )
  (set_global $global$5
   (call $8
    (call $2
     (get_global $global$4)
     (get_global $global$2)
    )
    (call $4
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
