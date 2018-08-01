(module
  (memory 0 1)
  (export "test" (func $test))
  (func $test (param $a i32) (param $b i32) (result i32)
    (i32.ne (i32.and (get_local $a) (get_local $b)) (i32.const 0))
  )
)
