(module
 (type $0 (func (param i32) (result i32)))
 (type $1 (func (result i32)))
 (type $2 (func (param i32 i32) (result i32)))
 (type $3 (func))
 (type $4 (func (param i32) (result i32)))
 (memory $0 1)
 (global $global$0 (mut i32) (i32.const 0))
 (global $global$1 (mut i32) (i32.const 0))
 (global $global$2 (mut i32) (i32.const 0))
 (global $global$3 (mut i32) (i32.const 0))
 (global $global$4 (mut i32) (i32.const 0))
 (global $global$5 (mut i32) (i32.const 0))
 (global $global$6 (mut i32) (i32.const 0))
 (global $global$7 (mut i32) (i32.const 0))
 (export "memory" (memory $0))
 (export "main" (func $8))
 (start $9)
 (func $0 (; 0 ;) (type $0) (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (if
   (call $6
    (local.get $0)
    (i32.const 0)
   )
   (block
    (if
     (call $6
      (local.get $0)
      (global.get $global$3)
     )
     (unreachable)
    )
    (if
     (call $6
      (local.tee $0
       (call $1
        (call $2
         (call $2
          (local.tee $3
           (global.get $global$6)
          )
          (local.get $0)
         )
         (global.get $global$2)
        )
        (call $4
         (global.get $global$2)
        )
       )
      )
      (call $5
       (local.tee $1
        (current_memory)
       )
       (i32.const 16)
      )
     )
     (block
      (local.set $2
       (local.get $1)
      )
      (local.set $4
       (local.tee $1
        (i32.shr_u
         (call $1
          (call $2
           (call $3
            (local.get $0)
            (local.get $3)
           )
           (i32.const 65535)
          )
          (call $4
           (i32.const 65535)
          )
         )
         (i32.const 16)
        )
       )
      )
      (if
       (i32.eqz
        (call $6
         (local.get $2)
         (local.get $1)
        )
       )
       (local.set $2
        (local.get $4)
       )
      )
      (if
       (call $7
        (grow_memory
         (local.get $2)
        )
       )
       (if
        (call $7
         (grow_memory
          (local.get $1)
         )
        )
        (unreachable)
       )
      )
     )
    )
    (global.set $global$6
     (local.get $0)
    )
   )
  )
  (local.get $3)
 )
 (func $1 (; 1 ;) (type $2) (param $0 i32) (param $1 i32) (result i32)
  (i32.and
   (local.get $0)
   (local.get $1)
  )
 )
 (func $2 (; 2 ;) (type $2) (param $0 i32) (param $1 i32) (result i32)
  (i32.add
   (local.get $0)
   (local.get $1)
  )
 )
 (func $3 (; 3 ;) (type $2) (param $0 i32) (param $1 i32) (result i32)
  (i32.sub
   (local.get $0)
   (local.get $1)
  )
 )
 (func $4 (; 4 ;) (type $0) (param $0 i32) (result i32)
  (i32.xor
   (local.get $0)
   (i32.const -1)
  )
 )
 (func $5 (; 5 ;) (type $2) (param $0 i32) (param $1 i32) (result i32)
  (i32.shl
   (local.get $0)
   (local.get $1)
  )
 )
 (func $6 (; 6 ;) (type $2) (param $0 i32) (param $1 i32) (result i32)
  (i32.gt_s
   (local.get $0)
   (local.get $1)
  )
 )
 (func $7 (; 7 ;) (type $4) (param $0 i32) (result i32)
  (i32.lt_s
   (local.get $0)
   (i32.const 0)
  )
 )
 (func $8 (; 8 ;) (type $1) (result i32)
  (drop
   (call $0
    (i32.const 1)
   )
  )
  (i32.const 9)
 )
 (func $9 (; 9 ;) (type $3)
  (global.set $global$0
   (i32.const 3)
  )
  (global.set $global$1
   (call $5
    (i32.const 1)
    (global.get $global$0)
   )
  )
  (global.set $global$2
   (call $3
    (global.get $global$1)
    (i32.const 1)
   )
  )
  (global.set $global$3
   (call $5
    (i32.const 1)
    (i32.const 30)
   )
  )
  (global.set $global$4
   (i32.const 0)
  )
  (global.set $global$5
   (call $1
    (call $2
     (global.get $global$4)
     (global.get $global$2)
    )
    (call $4
     (global.get $global$2)
    )
   )
  )
  (global.set $global$6
   (global.get $global$5)
  )
  (global.set $global$7
   (i32.const 0)
  )
 )
)
