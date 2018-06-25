(module
  (export "test" (func $test))
  (export "test2" (func $test2))
  (func $test (param $a i32) (result i32)
    (local $var$1 i32)
    (block $B1 (result i32)
      (set_local $var$1 (i32.add (get_local $a) (i32.const 1)))
      (block $B1_0
          (block $B1_1
              (br_if $B1_0 (i32.eq (i32.const 1) (get_local $var$1)))
            )
          (i32.const 1)
          (br $B1)
        )
      (i32.const 0)
      (br $B1)
    )
  )
  (func $test2 (param $a i32) (result i32)
    (if $a_wild_if (result i32) (i32.eq (i32.add (get_local $a) (i32.const 1)) (i32.const 1))
      (then
        (i32.const 0)
      )
      (else
        (i32.const 1)
      )
    )
  )
)
