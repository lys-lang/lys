(module
  (memory 0 1)
  (export "x" (func $test::x))
  (func $test::x
    (block $unknown_block_1
      (nop)
    )
  )
)
