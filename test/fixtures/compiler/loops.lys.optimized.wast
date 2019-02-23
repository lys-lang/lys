(module
 (type $0 (func))
 (type $1 (func (param i32 i32) (result i32)))
 (memory $0 1)
 (export "memory" (memory $0))
 (export "test" (func $2))
 (export "test1" (func $3))
 (export "test2" (func $4))
 (export "test3" (func $5))
 (func $0 (; 0 ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (i32.add
   (local.get $0)
   (local.get $1)
  )
 )
 (func $1 (; 1 ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (i32.gt_s
   (local.get $0)
   (local.get $1)
  )
 )
 (func $2 (; 2 ;) (type $0)
  (nop)
 )
 (func $3 (; 3 ;) (type $0)
  (block $label$1
   (br_if $label$1
    (call $1
     (call $0
      (i32.const 1)
      (i32.const 1)
     )
     (i32.const 10)
    )
   )
  )
 )
 (func $4 (; 4 ;) (type $0)
  (local $0 i32)
  (local.set $0
   (i32.const 1)
  )
  (loop $label$1
   (local.set $0
    (call $0
     (local.get $0)
     (i32.const 1)
    )
   )
   (br $label$1)
  )
 )
 (func $5 (; 5 ;) (type $0)
  (local $0 i32)
  (block $label$1
   (block $label$2
    (br_if $label$2
     (i32.eq
      (local.tee $0
       (call $0
        (i32.const 1)
        (i32.const 1)
       )
      )
      (i32.const 10)
     )
    )
   )
   (br_if $label$1
    (call $1
     (local.get $0)
     (i32.const 100)
    )
   )
  )
 )
)
