(module
 (type $0 (func (param i32 i32)))
 (type $1 (func (param i32) (result i32)))
 (type $2 (func (result i32)))
 (type $3 (func (param i32 i32) (result i32)))
 (type $4 (func))
 (type $5 (func))
 (type $6 (func (param i32) (result i32)))
 (import "env" "printf" (func $fimport$0 (param i32 i32)))
 (memory $0 1)
 (data (i32.const 16) "4\00\00\00t\00r\00y\00i\00n\00g\00 \00t\00o\00 \00a\00l\00l\00o\00c\00a\00t\00e\00 \000\00 \00b\00y\00t\00e\00s")
 (global $global$0 (mut i32) (i32.const 0))
 (global $global$1 (mut i32) (i32.const 0))
 (global $global$2 (mut i32) (i32.const 0))
 (global $global$3 (mut i32) (i32.const 0))
 (global $global$4 (mut i32) (i32.const 0))
 (global $global$5 (mut i32) (i32.const 0))
 (global $global$6 (mut i32) (i32.const 0))
 (export "memory" (memory $0))
 (export "test_getMaxMemory" (func $1))
 (export "main" (func $9))
 (start $10)
 (func $0 (; 1 ;) (type $5)
  (local $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (if
   (call $7
    (i32.const 1)
    (i32.const 0)
   )
   (block
    (if
     (call $7
      (i32.const 1)
      (global.get $global$3)
     )
     (unreachable)
    )
    (if
     (call $7
      (local.tee $3
       (call $2
        (call $3
         (call $3
          (local.tee $2
           (global.get $global$6)
          )
          (i32.const 1)
         )
         (global.get $global$2)
        )
        (call $5
         (global.get $global$2)
        )
       )
      )
      (call $6
       (local.tee $0
        (current_memory)
       )
       (i32.const 16)
      )
     )
     (block
      (local.set $1
       (local.get $0)
      )
      (local.set $4
       (local.tee $0
        (i32.shr_u
         (call $2
          (call $3
           (call $4
            (local.get $3)
            (local.get $2)
           )
           (i32.const 65535)
          )
          (call $5
           (i32.const 65535)
          )
         )
         (i32.const 16)
        )
       )
      )
      (if
       (i32.eqz
        (call $7
         (local.get $1)
         (local.get $0)
        )
       )
       (local.set $1
        (local.get $4)
       )
      )
      (if
       (call $8
        (grow_memory
         (local.get $1)
        )
       )
       (if
        (call $8
         (grow_memory
          (local.get $0)
         )
        )
        (unreachable)
       )
      )
     )
    )
    (global.set $global$6
     (local.get $3)
    )
    (drop
     (call $3
      (local.get $2)
      (i32.const 8)
     )
    )
   )
   (block
    (call $fimport$0
     (call $4
      (call $3
       (i32.const 16)
       (i32.const 4)
      )
      (i32.const 4)
     )
     (i32.const 0)
    )
    (unreachable)
   )
  )
 )
 (func $1 (; 2 ;) (type $2) (result i32)
  (global.get $global$6)
 )
 (func $2 (; 3 ;) (type $3) (param $0 i32) (param $1 i32) (result i32)
  (i32.and
   (local.get $0)
   (local.get $1)
  )
 )
 (func $3 (; 4 ;) (type $3) (param $0 i32) (param $1 i32) (result i32)
  (i32.add
   (local.get $0)
   (local.get $1)
  )
 )
 (func $4 (; 5 ;) (type $3) (param $0 i32) (param $1 i32) (result i32)
  (i32.sub
   (local.get $0)
   (local.get $1)
  )
 )
 (func $5 (; 6 ;) (type $1) (param $0 i32) (result i32)
  (i32.xor
   (local.get $0)
   (i32.const -1)
  )
 )
 (func $6 (; 7 ;) (type $3) (param $0 i32) (param $1 i32) (result i32)
  (i32.shl
   (local.get $0)
   (local.get $1)
  )
 )
 (func $7 (; 8 ;) (type $3) (param $0 i32) (param $1 i32) (result i32)
  (i32.gt_s
   (local.get $0)
   (local.get $1)
  )
 )
 (func $8 (; 9 ;) (type $6) (param $0 i32) (result i32)
  (i32.lt_s
   (local.get $0)
   (i32.const 0)
  )
 )
 (func $9 (; 10 ;) (type $2) (result i32)
  (call $0)
  (i32.const 9)
 )
 (func $10 (; 11 ;) (type $4)
  (global.set $global$0
   (i32.const 3)
  )
  (global.set $global$1
   (call $6
    (i32.const 1)
    (global.get $global$0)
   )
  )
  (global.set $global$2
   (call $4
    (global.get $global$1)
    (i32.const 1)
   )
  )
  (global.set $global$3
   (call $6
    (i32.const 1)
    (i32.const 30)
   )
  )
  (global.set $global$4
   (i32.const 65536)
  )
  (global.set $global$5
   (call $2
    (call $3
     (global.get $global$4)
     (global.get $global$2)
    )
    (call $5
     (global.get $global$2)
    )
   )
  )
  (global.set $global$6
   (global.get $global$5)
  )
 )
)
