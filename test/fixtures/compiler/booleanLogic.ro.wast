(module
  (memory 0 1)
  (export "test" (func $test::test))
  (func $test::test (param $a i32) (param $b i32) (result i32)
    (i32.and (i32.ne (get_local $a) (i32.const 0)) (i32.ne (get_local $b) (i32.const 0)))
  )
)
