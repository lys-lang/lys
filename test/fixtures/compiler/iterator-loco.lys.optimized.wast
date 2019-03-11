(module
 (type $0 (func (param i32 i32)))
 (type $1 (func (param i64 i32)))
 (type $2 (func (param i32) (result i32)))
 (type $3 (func (result i32)))
 (type $4 (func (param i32 i32) (result i32)))
 (type $5 (func (param i64) (result i64)))
 (type $6 (func (param i64) (result i32)))
 (type $7 (func))
 (type $8 (func (param i64 i32 i32)))
 (type $9 (func (param i64 i32) (result i32)))
 (type $10 (func (param i32 i32) (result i64)))
 (type $11 (func (result i32)))
 (type $12 (func (param i32 i32)))
 (type $13 (func (param i32) (result i32)))
 (type $14 (func (param i64) (result i64)))
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
 (export "test_getMaxMemory" (func $3))
 (export "test" (func $19))
 (start $20)
 (func $0 (; 1 ;) (type $11) (result i32)
  (local $0 i32)
  (local $1 i32)
  (call $2
   (local.tee $1
    (call $1
     (local.tee $0
      (call $7
       (i32.const 1)
       (i32.const 8)
      )
     )
    )
   )
   (local.get $0)
  )
  (local.get $1)
 )
 (func $1 (; 2 ;) (type $2) (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (if (result i32)
   (call $10
    (local.get $0)
    (i32.const 0)
   )
   (block (result i32)
    (if
     (call $10
      (local.get $0)
      (global.get $global$3)
     )
     (unreachable)
    )
    (if
     (call $10
      (local.tee $0
       (call $4
        (call $5
         (call $5
          (local.tee $3
           (global.get $global$6)
          )
          (local.get $0)
         )
         (global.get $global$2)
        )
        (call $8
         (global.get $global$2)
        )
       )
      )
      (call $9
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
         (call $4
          (call $5
           (call $6
            (local.get $0)
            (local.get $3)
           )
           (i32.const 65535)
          )
          (call $8
           (i32.const 65535)
          )
         )
         (i32.const 16)
        )
       )
      )
      (if
       (i32.eqz
        (call $10
         (local.get $2)
         (local.get $1)
        )
       )
       (local.set $2
        (local.get $4)
       )
      )
      (if
       (call $11
        (grow_memory
         (local.get $2)
        )
       )
       (if
        (call $11
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
    (call $5
     (local.get $3)
     (i32.const 8)
    )
   )
   (block (result i32)
    (call $fimport$0
     (call $6
      (call $5
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
 (func $2 (; 3 ;) (type $12) (param $0 i32) (param $1 i32)
  (local $2 i32)
  (local.set $2
   (local.get $0)
  )
  (loop $label$1
   (if
    (i32.ne
     (local.get $0)
     (local.get $2)
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
 (func $3 (; 4 ;) (type $3) (result i32)
  (global.get $global$6)
 )
 (func $4 (; 5 ;) (type $4) (param $0 i32) (param $1 i32) (result i32)
  (i32.and
   (local.get $0)
   (local.get $1)
  )
 )
 (func $5 (; 6 ;) (type $4) (param $0 i32) (param $1 i32) (result i32)
  (i32.add
   (local.get $0)
   (local.get $1)
  )
 )
 (func $6 (; 7 ;) (type $4) (param $0 i32) (param $1 i32) (result i32)
  (i32.sub
   (local.get $0)
   (local.get $1)
  )
 )
 (func $7 (; 8 ;) (type $4) (param $0 i32) (param $1 i32) (result i32)
  (i32.mul
   (local.get $0)
   (local.get $1)
  )
 )
 (func $8 (; 9 ;) (type $2) (param $0 i32) (result i32)
  (i32.xor
   (local.get $0)
   (i32.const -1)
  )
 )
 (func $9 (; 10 ;) (type $4) (param $0 i32) (param $1 i32) (result i32)
  (i32.shl
   (local.get $0)
   (local.get $1)
  )
 )
 (func $10 (; 11 ;) (type $4) (param $0 i32) (param $1 i32) (result i32)
  (i32.gt_s
   (local.get $0)
   (local.get $1)
  )
 )
 (func $11 (; 12 ;) (type $13) (param $0 i32) (result i32)
  (i32.lt_s
   (local.get $0)
   (i32.const 0)
  )
 )
 (func $12 (; 13 ;) (type $8) (param $0 i64) (param $1 i32) (param $2 i32)
  (i32.store
   (i32.add
    (i32.wrap_i64
     (local.get $0)
    )
    (local.get $2)
   )
   (local.get $1)
  )
 )
 (func $13 (; 14 ;) (type $9) (param $0 i64) (param $1 i32) (result i32)
  (i32.load
   (i32.add
    (i32.wrap_i64
     (local.get $0)
    )
    (local.get $1)
   )
  )
 )
 (func $14 (; 15 ;) (type $14) (param $0 i64) (result i64)
  (i64.shl
   (local.get $0)
   (i64.const 32)
  )
 )
 (func $15 (; 16 ;) (type $10) (param $0 i32) (param $1 i32) (result i64)
  (local $2 i32)
  (local $3 i64)
  (local.set $2
   (call $0)
  )
  (call $17
   (local.tee $3
    (i64.or
     (call $14
      (i64.const 1)
     )
     (i64.extend_i32_u
      (local.get $2)
     )
    )
   )
   (local.get $0)
  )
  (call $12
   (local.get $3)
   (local.get $1)
   (i32.const 4)
  )
  (local.get $3)
 )
 (func $16 (; 17 ;) (type $6) (param $0 i64) (result i32)
  (call $13
   (local.get $0)
   (i32.const 0)
  )
 )
 (func $17 (; 18 ;) (type $1) (param $0 i64) (param $1 i32)
  (call $12
   (local.get $0)
   (local.get $1)
   (i32.const 0)
  )
 )
 (func $18 (; 19 ;) (type $5) (param $0 i64) (result i64)
  (local $1 i32)
  (local $2 i32)
  (local $3 i64)
  (if
   (i32.le_s
    (call $16
     (local.get $0)
    )
    (call $13
     (local.get $0)
     (i32.const 4)
    )
   )
   (block
    (local.set $1
     (call $16
      (local.get $0)
     )
    )
    (local.set $2
     (call $0)
    )
    (call $17
     (local.tee $3
      (i64.or
       (call $14
        (i64.const 4)
       )
       (i64.extend_i32_u
        (local.get $2)
       )
      )
     )
     (local.get $1)
    )
    (call $17
     (local.get $0)
     (call $5
      (call $16
       (local.get $0)
      )
      (i32.const 1)
     )
    )
   )
   (local.set $3
    (call $14
     (i64.const 3)
    )
   )
  )
  (local.get $3)
 )
 (func $19 (; 20 ;) (type $4) (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i64)
  (local $4 i64)
  (local.set $4
   (call $15
    (local.get $0)
    (local.get $1)
   )
  )
  (loop $label$1
   (local.set $3
    (call $18
     (local.get $4)
    )
   )
   (if
    (i64.ne
     (call $14
      (i64.const 4)
     )
     (i64.and
      (local.get $3)
      (i64.const -4294967296)
     )
    )
    (drop
     (call $14
      (i64.const 3)
     )
    )
    (block
     (local.set $2
      (call $5
       (local.get $2)
       (call $16
        (local.get $3)
       )
      )
     )
     (br $label$1)
    )
   )
  )
  (local.get $2)
 )
 (func $20 (; 21 ;) (type $7)
  (global.set $global$0
   (i32.const 3)
  )
  (global.set $global$1
   (call $9
    (i32.const 1)
    (global.get $global$0)
   )
  )
  (global.set $global$2
   (call $6
    (global.get $global$1)
    (i32.const 1)
   )
  )
  (global.set $global$3
   (call $9
    (i32.const 1)
    (i32.const 30)
   )
  )
  (global.set $global$4
   (call $7
    (i32.const 64)
    (i32.const 1024)
   )
  )
  (global.set $global$5
   (call $4
    (call $5
     (global.get $global$4)
     (global.get $global$2)
    )
    (call $8
     (global.get $global$2)
    )
   )
  )
  (global.set $global$6
   (global.get $global$5)
  )
 )
)
