(module
 (type $0 (func))
 (memory $0 1)
 (export "memory" (memory $0))
 (export "test" (func $0))
 (export "test1" (func $0))
 (export "test2" (func $1))
 (export "test3" (func $2))
 (func $0 (; 0 ;) (type $0)
  (nop)
 )
 (func $1 (; 1 ;) (type $0)
  (local $0 i32)
  (local.set $0
   (i32.const 1)
  )
  (loop $label$1
   (local.set $0
    (i32.add
     (local.get $0)
     (i32.const 1)
    )
   )
   (br $label$1)
  )
 )
 (func $2 (; 2 ;) (type $0)
  (local $0 i32)
  (block $label$1
   (br_if $label$1
    (i32.eq
     (local.tee $0
      (i32.const 2)
     )
     (i32.const 10)
    )
   )
  )
 )
)
