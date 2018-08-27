(module
  (memory 0 1)
  (export "main" (func $test::main))
  (func $test::main
    (block $unknown_block_1
      (nop)
    )
  )
)
