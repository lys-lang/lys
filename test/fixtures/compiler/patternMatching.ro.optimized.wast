(module
 (type $0 (func (param i32) (result i32)))
 (type $1 (func (param i32 i32) (result i32)))
 (type $2 (func (param i64) (result i32)))
 (type $3 (func))
 (global $global$0 (mut i32) (i32.const 0))
 (global $global$1 (mut i32) (i32.const 0))
 (global $global$2 (mut i32) (i32.const 0))
 (global $global$3 (mut i32) (i32.const 0))
 (global $global$4 (mut i32) (i32.const 0))
 (global $global$5 (mut i32) (i32.const 0))
 (global $global$6 (mut i32) (i32.const 0))
 (global $global$7 (mut i32) (i32.const 0))
 (export "test" (func $6))
 (export "test2" (func $7))
 (export "test3" (func $8))
 (start $9)
 (func $0 (; 0 ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (i32.eq
   (get_local $0)
   (get_local $1)
  )
 )
 (func $1 (; 1 ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (i32.add
   (get_local $0)
   (get_local $1)
  )
 )
 (func $2 (; 2 ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (i32.sub
   (get_local $0)
   (get_local $1)
  )
 )
 (func $3 (; 3 ;) (type $0) (param $0 i32) (result i32)
  (i32.xor
   (get_local $0)
   (i32.const -1)
  )
 )
 (func $4 (; 4 ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (i32.shl
   (get_local $0)
   (get_local $1)
  )
 )
 (func $5 (; 5 ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (i32.and
   (get_local $0)
   (get_local $1)
  )
 )
 (func $6 (; 6 ;) (type $0) (param $0 i32) (result i32)
  (block $label$1 (result i32)
   (drop
    (br_if $label$1
     (i32.const 0)
     (i32.eqz
      (call $0
       (i32.const 1)
       (get_local $0)
      )
     )
    )
   )
   (i32.const 1)
  )
 )
 (func $7 (; 7 ;) (type $0) (param $0 i32) (result i32)
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
              (call $0
               (i32.const 10)
               (get_local $0)
              )
             )
             (br_if $label$3
              (call $0
               (i32.const 20)
               (get_local $0)
              )
             )
             (br_if $label$4
              (call $0
               (i32.const 30)
               (get_local $0)
              )
             )
             (br_if $label$5
              (call $0
               (i32.const 40)
               (get_local $0)
              )
             )
             (br_if $label$6
              (call $0
               (i32.const 50)
               (get_local $0)
              )
             )
             (br_if $label$7
              (call $0
               (i32.const 60)
               (get_local $0)
              )
             )
             (br_if $label$8
              (call $0
               (i32.const 70)
               (get_local $0)
              )
             )
             (br_if $label$9
              (call $0
               (i32.const 80)
               (get_local $0)
              )
             )
             (br_if $label$10
              (call $0
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
 (func $8 (; 8 ;) (type $2) (param $0 i64) (result i32)
  (block $label$1 (result i32)
   (block $label$2
    (block $label$3
     (br_if $label$2
      (i64.eq
       (i64.and
        (get_local $0)
        (i64.const -4294967296)
       )
       (i64.const 8589934592)
      )
     )
     (br_if $label$3
      (i64.eq
       (i64.and
        (get_local $0)
        (i64.const -4294967296)
       )
       (i64.const 4294967296)
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
 (func $9 (; 9 ;) (type $3)
  (set_global $global$0
   (i32.const 3)
  )
  (set_global $global$1
   (call $4
    (i32.const 1)
    (get_global $global$0)
   )
  )
  (set_global $global$2
   (call $2
    (get_global $global$1)
    (i32.const 1)
   )
  )
  (set_global $global$3
   (call $4
    (i32.const 1)
    (i32.const 30)
   )
  )
  (set_global $global$4
   (i32.const 0)
  )
  (set_global $global$5
   (call $5
    (call $1
     (get_global $global$4)
     (get_global $global$2)
    )
    (call $3
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
