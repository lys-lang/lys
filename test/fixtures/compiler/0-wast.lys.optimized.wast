(module
 (type $0 (func))
 (type $1 (func (result i32)))
 (type $2 (func))
 (memory $0 1)
 (data (i32.const 16) "\08\00\00\00t\00r\00u\00e\00\00")
 (data (i32.const 29) "\n\00\00\00f\00a\00l\00s\00e\00\00")
 (data (i32.const 44) "\02\00\00\000\00\00")
 (data (i32.const 51) "\02\00\00\000\00\00")
 (global $global$0 (mut i32) (i32.const 0))
 (global $global$1 (mut i32) (i32.const 0))
 (global $global$2 (mut i32) (i32.const 0))
 (global $global$3 (mut i32) (i32.const 0))
 (global $global$4 (mut i32) (i32.const 0))
 (global $global$5 (mut i32) (i32.const 0))
 (global $global$6 (mut i32) (i32.const 0))
 (export "memory" (memory $0))
 (export "test_getMaxMemory" (func $0))
 (export "main" (func $2))
 (start $3)
 (func $0 (; 0 ;) (type $1) (result i32)
  (global.get $global$6)
 )
 (func $1 (; 1 ;) (type $2)
  (local $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (if
   (i32.gt_u
    (i32.const 1)
    (global.get $global$3)
   )
   (unreachable)
  )
  (if
   (i32.gt_u
    (local.tee $1
     (i32.and
      (i32.add
       (global.get $global$2)
       (i32.add
        (local.tee $0
         (global.get $global$6)
        )
        (i32.const 8)
       )
      )
      (i32.xor
       (global.get $global$2)
       (i32.const -1)
      )
     )
    )
    (i32.shl
     (local.tee $2
      (current_memory)
     )
     (i32.const 16)
    )
   )
   (if
    (i32.lt_u
     (grow_memory
      (select
       (local.get $2)
       (local.tee $3
        (local.tee $0
         (i32.shr_s
          (i32.and
           (i32.add
            (i32.sub
             (local.get $1)
             (local.get $0)
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
        (local.get $2)
        (local.get $3)
       )
      )
     )
     (i32.const 0)
    )
    (if
     (i32.lt_u
      (grow_memory
       (local.get $0)
      )
      (i32.const 0)
     )
     (unreachable)
    )
   )
  )
  (global.set $global$6
   (local.get $1)
  )
 )
 (func $2 (; 2 ;) (type $1) (result i32)
  (call $1)
  (i32.const 9)
 )
 (func $3 (; 3 ;) (type $0)
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
