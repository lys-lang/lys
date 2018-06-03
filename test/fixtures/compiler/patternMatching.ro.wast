(module
 (type $f_boolean_i32 (func (param i32) (result i32)))
 (table 2 2 anyfunc)
 (elem (i32.const 0) $test $test2)
 (export "test" (func $test))
 (export "test2" (func $test2))
 (func $test (; 0 ;) (type $f_boolean_i32) (param $0 i32) (result i32)
  (local $1 i32)
  (return
   (block $B (result i32)
    (set_local $1
     (get_local $0)
    )
    (block $B0
     (block $B1
      (br_if $B0
       (i32.eq
        (i32.const 1)
        (get_local $1)
       )
      )
     )
     (i32.const 0)
     (br $B)
    )
    (i32.const -1)
    (br $B)
   )
  )
 )
 (func $test2 (; 1 ;) (type $f_boolean_i32) (param $0 i32) (result i32)
  (local $1 i32)
  (return
   (block $B (result i32)
    (set_local $1
     (get_local $0)
    )
    (block $B0
     (block $B1
      (block $B2
       (block $B3
        (block $B4
         (block $B5
          (block $B6
           (block $B7
            (block $B8
             (block $B9
              (br_if $B0
               (i32.eq
                (i32.const 10)
                (get_local $1)
               )
              )
              (br_if $B1
               (i32.eq
                (i32.const 20)
                (get_local $1)
               )
              )
              (br_if $B2
               (i32.eq
                (i32.const 30)
                (get_local $1)
               )
              )
              (br_if $B3
               (i32.eq
                (i32.const 40)
                (get_local $1)
               )
              )
              (br_if $B4
               (i32.eq
                (i32.const 50)
                (get_local $1)
               )
              )
              (br_if $B5
               (i32.eq
                (i32.const 60)
                (get_local $1)
               )
              )
              (br_if $B6
               (i32.eq
                (i32.const 70)
                (get_local $1)
               )
              )
              (br_if $B7
               (i32.eq
                (i32.const 80)
                (get_local $1)
               )
              )
              (br_if $B8
               (i32.eq
                (i32.const 90)
                (get_local $1)
               )
              )
             )
             (i32.const 0)
             (br $B)
            )
            (i32.const 9)
            (br $B)
           )
           (i32.const 8)
           (br $B)
          )
          (i32.const 7)
          (br $B)
         )
         (i32.const 6)
         (br $B)
        )
        (i32.const 5)
        (br $B)
       )
       (i32.const 4)
       (br $B)
      )
      (i32.const 3)
      (br $B)
     )
     (i32.const 2)
     (br $B)
    )
    (i32.const 1)
    (br $B)
   )
  )
 )
)
