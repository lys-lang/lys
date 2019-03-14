(module
 (type $0 (func))
 (type $1 (func (result i32)))
 (type $2 (func (param i32) (result i32)))
 (type $3 (func (param i32 i32) (result i32)))
 (type $4 (func (param i64) (result i64)))
 (type $5 (func (param i32 i32 i32)))
 (type $6 (func (param i32 i32) (result i64)))
 (memory $0 1)
 (global $global$0 (mut i32) (i32.const 0))
 (global $global$1 (mut i32) (i32.const 0))
 (global $global$2 (mut i32) (i32.const 0))
 (global $global$3 (mut i32) (i32.const 0))
 (global $global$4 (mut i32) (i32.const 0))
 (global $global$5 (mut i32) (i32.const 0))
 (global $global$6 (mut i32) (i32.const 0))
 (export "memory" (memory $0))
 (export "test_getMaxMemory" (func $0))
 (export "test" (func $6))
 (start $7)
 (func $0 (; 0 ;) (type $1) (result i32)
  (global.get $global$6)
 )
 (func $1 (; 1 ;) (type $3) (param $0 i32) (param $1 i32) (result i32)
  (call $3
   (local.tee $1
    (call $2
     (local.tee $0
      (i32.mul
       (local.get $0)
       (local.get $1)
      )
     )
    )
   )
   (i32.const 0)
   (local.get $0)
  )
  (local.get $1)
 )
 (func $2 (; 2 ;) (type $2) (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (if
   (i32.eqz
    (local.get $0)
   )
   (unreachable)
  )
  (if
   (i32.gt_u
    (local.get $0)
    (global.get $global$3)
   )
   (unreachable)
  )
  (if
   (i32.gt_u
    (local.tee $0
     (i32.and
      (i32.add
       (global.get $global$2)
       (i32.add
        (local.tee $2
         (global.get $global$6)
        )
        (select
         (local.get $0)
         (i32.const 8)
         (i32.gt_u
          (local.get $0)
          (i32.const 8)
         )
        )
       )
      )
      (i32.xor
       (global.get $global$2)
       (i32.const -1)
      )
     )
    )
    (i32.shl
     (local.tee $1
      (current_memory)
     )
     (i32.const 16)
    )
   )
   (if
    (i32.lt_u
     (grow_memory
      (select
       (local.tee $3
        (local.get $1)
       )
       (local.tee $4
        (local.tee $1
         (i32.shr_s
          (i32.and
           (i32.add
            (i32.sub
             (local.get $0)
             (local.get $2)
            )
            (i32.const 65535)
           )
           (i32.const -65536)
          )
          (i32.const 16)
         )
        )
       )
       (i32.gt_u
        (local.get $3)
        (local.get $4)
       )
      )
     )
     (i32.const 0)
    )
    (if
     (i32.lt_u
      (grow_memory
       (local.get $1)
      )
      (i32.const 0)
     )
     (unreachable)
    )
   )
  )
  (global.set $global$6
   (local.get $0)
  )
  (local.get $2)
 )
 (func $3 (; 3 ;) (type $5) (param $0 i32) (param $1 i32) (param $2 i32)
  (local.set $2
   (i32.add
    (local.get $0)
    (local.get $2)
   )
  )
  (loop $label$1
   (if
    (i32.eqz
     (i32.eq
      (local.get $0)
      (local.get $2)
     )
    )
    (block
     (i32.store8
      (local.get $0)
      (i32.load8_u
       (local.get $1)
      )
     )
     (local.set $0
      (i32.add
       (local.get $0)
       (i32.const 1)
      )
     )
     (br $label$1)
    )
   )
  )
 )
 (func $4 (; 4 ;) (type $6) (param $0 i32) (param $1 i32) (result i64)
  (local $2 i64)
  (i32.store
   (i32.wrap_i64
    (local.tee $2
     (i64.or
      (i64.extend_i32_u
       (call $1
        (i32.const 1)
        (i32.const 8)
       )
      )
      (i64.const 4294967296)
     )
    )
   )
   (local.get $0)
  )
  (i32.store
   (i32.add
    (i32.wrap_i64
     (local.get $2)
    )
    (i32.const 4)
   )
   (local.get $1)
  )
  (local.get $2)
 )
 (func $5 (; 5 ;) (type $4) (param $0 i64) (result i64)
  (local $1 i32)
  (local $2 i64)
  (if (result i64)
   (i32.le_s
    (i32.load
     (i32.wrap_i64
      (local.get $0)
     )
    )
    (i32.load
     (i32.add
      (i32.wrap_i64
       (local.get $0)
      )
      (i32.const 4)
     )
    )
   )
   (block (result i64)
    (local.set $1
     (i32.load
      (i32.wrap_i64
       (local.get $0)
      )
     )
    )
    (i32.store
     (i32.wrap_i64
      (local.tee $2
       (i64.or
        (i64.extend_i32_u
         (call $1
          (i32.const 1)
          (i32.const 4)
         )
        )
        (i64.const 17179869184)
       )
      )
     )
     (local.get $1)
    )
    (i32.store
     (i32.wrap_i64
      (local.get $0)
     )
     (i32.add
      (i32.load
       (i32.wrap_i64
        (local.get $0)
       )
      )
      (i32.const 1)
     )
    )
    (local.get $2)
   )
   (i64.const 12884901888)
  )
 )
 (func $6 (; 6 ;) (type $3) (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i64)
  (local $4 i64)
  (local.set $3
   (call $4
    (local.get $0)
    (local.get $1)
   )
  )
  (loop $label$1
   (if
    (i64.eq
     (i64.and
      (local.tee $4
       (call $5
        (local.get $3)
       )
      )
      (i64.const -4294967296)
     )
     (i64.const 17179869184)
    )
    (block
     (local.set $2
      (i32.add
       (local.get $2)
       (i32.load
        (i32.wrap_i64
         (local.get $4)
        )
       )
      )
     )
     (br $label$1)
    )
   )
  )
  (local.get $2)
 )
 (func $7 (; 7 ;) (type $0)
  (global.set $global$0
   (i32.const 3)
  )
  (global.set $global$1
   (i32.shl
    (i32.const 1)
    (global.get $global$0)
   )
  )
  (global.set $global$2
   (i32.sub
    (global.get $global$1)
    (i32.const 1)
   )
  )
  (global.set $global$3
   (i32.const 1073741824)
  )
  (global.set $global$4
   (i32.const 65536)
  )
  (global.set $global$5
   (i32.and
    (i32.add
     (global.get $global$4)
     (global.get $global$2)
    )
    (i32.xor
     (global.get $global$2)
     (i32.const -1)
    )
   )
  )
  (global.set $global$6
   (global.get $global$5)
  )
 )
)
