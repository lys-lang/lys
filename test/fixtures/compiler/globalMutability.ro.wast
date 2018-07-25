(module
  (export "main" (func $main))
  (func $main (result i32)
    (block $unknown_block_1 (result i32)
      (set_local $x (i32.add (get_local $x) (i32.const 1)))
    )
  )
)
