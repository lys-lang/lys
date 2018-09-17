(module
 (type $0 (func (param i32 i32) (result i32)))
 (type $1 (func (param i32) (result i32)))
 (export "test" (func $1))
 (export "test2" (func $2))
 (func $0 (; 0 ;) (type $0) (param $0 i32) (param $1 i32) (result i32)
  (i32.eq
   (get_local $0)
   (get_local $1)
  )
 )
 (func $1 (; 1 ;) (type $1) (param $0 i32) (result i32)
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
 (func $2 (; 2 ;) (type $1) (param $0 i32) (result i32)
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
)
