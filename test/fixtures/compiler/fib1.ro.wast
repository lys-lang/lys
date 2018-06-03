(module
 (type $f_i32_i32_i32_i32 (func (param i32 i32 i32) (result i32)))
 (type $f_i32_i32 (func (param i32) (result i32)))
 (table 2 2 anyfunc)
 (elem (i32.const 0) $fibo $fib)
 (export "fib" (func $fib))
 (func $fibo (; 0 ;) (type $f_i32_i32_i32_i32) (param $0 i32) (param $1 i32) (param $2 i32) (result i32)
  (local $3 i32)
  (return
   (block $B (result i32)
    (set_local $1
     (get_local $0)
    )
    (block $B0
     (block $B1
      (block $B2
       (br_if $B0
        (i32.eq
         (i32.const 0)
         (get_local $1)
        )
       )
       (br_if $B1
        (i32.eq
         (i32.const 1)
         (get_local $1)
        )
       )
      )
      (call $fibo
       (i32.sub
        (get_local $0)
        (i32.const 1)
       )
       (get_local $2)
       (i32.add
        (get_local $1)
        (get_local $2)
       )
      )
      (br $B)
     )
     (get_local $2)
     (br $B)
    )
    (get_local $1)
    (br $B)
   )
  )
 )
 (func $fib (; 1 ;) (type $f_i32_i32) (param $0 i32) (result i32)
  (return
   (call $fibo
    (get_local $0)
    (i32.const 0)
    (i32.const 1)
   )
  )
 )
)
