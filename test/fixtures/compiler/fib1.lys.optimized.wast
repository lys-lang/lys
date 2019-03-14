(module
 (type $0 (func (param i32) (result i32)))
 (type $1 (func (param i32 i32 i32) (result i32)))
 (memory $0 1)
 (export "memory" (memory $0))
 (export "fib" (func $1))
 (func $0 (; 0 ;) (type $1) (param $0 i32) (param $1 i32) (param $2 i32) (result i32)
  (block $label$1 (result i32)
   (if
    (local.get $0)
    (block
     (if
      (i32.ne
       (local.get $0)
       (i32.const 1)
      )
      (br $label$1
       (call $0
        (i32.sub
         (local.get $0)
         (i32.const 1)
        )
        (local.get $2)
        (i32.add
         (local.get $1)
         (local.get $2)
        )
       )
      )
     )
     (br $label$1
      (local.get $2)
     )
    )
   )
   (local.get $1)
  )
 )
 (func $1 (; 1 ;) (type $0) (param $0 i32) (result i32)
  (call $0
   (local.get $0)
   (i32.const 0)
   (i32.const 1)
  )
 )
)
