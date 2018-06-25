(module
  (export "gcd" (func $gcd))
  (export "test" (func $test))
  (func $gcd (param $x i32) (param $y i32) (result i32)
    (if $a_wild_if (result i32) (i32.gt_s (get_local $x) (get_local $y))
      (then
        (call $gcd (i32.sub (get_local $x) (get_local $y)) (get_local $y))
      )
      (else
        (if $a_wild_if (result i32) (i32.lt_s (get_local $x) (get_local $y))
            (then
              (call $gcd (get_local $x) (i32.sub (get_local $y) (get_local $x)))
            )
            (else
              (get_local $x)
            )
          )
      )
    )
  )
  (func $test (result i32)
    (call $gcd (i32.const 119) (i32.const 7))
  )
)
