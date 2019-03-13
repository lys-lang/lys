(module
 (type $0 (func (param i32)))
 (type $1 (func (param i32 i32)))
 (type $2 (func))
 (type $3 (func (result i32)))
 (type $4 (func (param i32) (result i32)))
 (type $5 (func (param i32 i32 i32) (result i32)))
 (type $6 (func (param i64 i64) (result i32)))
 (type $7 (func (param i32 i64)))
 (type $8 (func (param i64 i64) (result i64)))
 (type $9 (func (param i32 i32)))
 (import "test" "pushTest" (func $fimport$0 (param i32)))
 (import "test" "registerAssertion" (func $fimport$1 (param i32 i32)))
 (import "test" "popTest" (func $fimport$2))
 (memory $0 1)
 (data (i32.const 418) "\1a\00\00\00a\00s\00s\00e\00r\00t\00(\00f\00a\00l\00s\00e\00)")
 (data (i32.const 376) "\08\00\00\00t\00r\00u\00e")
 (data (i32.const 389) "\n\00\00\00f\00a\00l\00s\00e")
 (data (i32.const 404) "\02\00\00\000")
 (data (i32.const 411) "\02\00\00\000")
 (data (i32.const 16) "2\00\00\00T\00e\00s\00t\00 \00s\00t\00r\00i\00n\00g\00 \00c\00o\00n\00c\00a\00t\00e\00n\00a\00t\00i\00o\00n")
 (data (i32.const 71) "\06\00\00\00a\00b\00c")
 (data (i32.const 82) "\08\00\00\001\002\003\004")
 (data (i32.const 95) "\1a\00\00\00a\00.\00l\00e\00n\00g\00t\00h\00 \00=\00=\00 \006")
 (data (i32.const 126) "\1a\00\00\00a\00.\00l\00e\00n\00g\00t\00h\00 \00=\00=\00 \006")
 (data (i32.const 157) "\1c\00\00\00c\00.\00l\00e\00n\00g\00t\00h\00 \00=\00=\00 \001\002")
 (data (i32.const 190) "\0e\00\00\00a\00b\00c\001\002\003\004")
 (data (i32.const 209) "$\00\00\00c\00 \00=\00=\00 \00\'\00a\00b\00c\001\002\003\004\00\'\00 \00(\001\00)")
 (data (i32.const 250) "\0e\00\00\00a\00b\00c\001\002\003\004")
 (data (i32.const 269) "$\00\00\00c\00 \00=\00=\00 \00\'\00a\00b\00c\001\002\003\004\00\'\00 \00(\002\00)")
 (data (i32.const 310) "\1c\00\00\00d\00.\00l\00e\00n\00g\00t\00h\00 \00=\00=\00 \002\008")
 (data (i32.const 343) "\1c\00\00\00a\00b\00c\001\002\003\004\00a\00b\00c\001\002\003\004")
 (global $global$0 (mut i32) (i32.const 0))
 (global $global$1 (mut i32) (i32.const 0))
 (global $global$2 (mut i32) (i32.const 0))
 (global $global$3 (mut i32) (i32.const 0))
 (global $global$4 (mut i32) (i32.const 0))
 (global $global$5 (mut i32) (i32.const 0))
 (global $global$6 (mut i32) (i32.const 0))
 (global $global$7 (mut i64) (i64.const 0))
 (export "memory" (memory $0))
 (export "test_getMaxMemory" (func $0))
 (export "test_getLastErrorMessage" (func $4))
 (export "main" (func $8))
 (start $9)
 (func $0 (; 3 ;) (type $3) (result i32)
  (global.get $global$6)
 )
 (func $1 (; 4 ;) (type $4) (param $0 i32) (result i32)
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
 (func $2 (; 5 ;) (type $5) (param $0 i32) (param $1 i32) (param $2 i32) (result i32)
  (local $3 i32)
  (local $4 i64)
  (local $5 i64)
  (local.set $4
   (i64.extend_i32_s
    (local.get $0)
   )
  )
  (local.set $5
   (i64.extend_i32_s
    (local.get $1)
   )
  )
  (loop $label$1
   (if
    (i32.lt_u
     (local.get $3)
     (local.get $2)
    )
    (block
     (i32.store8
      (i32.add
       (local.get $3)
       (i32.wrap_i64
        (local.get $5)
       )
      )
      (i32.load8_u
       (i32.add
        (local.get $3)
        (i32.wrap_i64
         (local.get $4)
        )
       )
      )
     )
     (local.set $3
      (i32.add
       (local.get $3)
       (i32.const 1)
      )
     )
     (br $label$1)
    )
   )
  )
  (i32.add
   (local.get $1)
   (local.get $2)
  )
 )
 (func $3 (; 6 ;) (type $9) (param $0 i32) (param $1 i32)
  (local.set $1
   (i32.add
    (local.get $0)
    (local.get $1)
   )
  )
  (loop $label$1
   (if
    (i32.ne
     (local.get $0)
     (local.get $1)
    )
    (block
     (i32.store8
      (local.get $0)
      (i32.load8_u
       (i32.const 0)
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
 (func $4 (; 7 ;) (type $3) (result i32)
  (local $0 i64)
  (block $label$1 (result i32)
   (drop
    (br_if $label$1
     (i32.const 0)
     (i64.ne
      (i64.and
       (local.tee $0
        (global.get $global$7)
       )
       (i64.const -4294967296)
      )
      (i64.const 38654705664)
     )
    )
   )
   (i32.wrap_i64
    (i64.load
     (i32.wrap_i64
      (local.get $0)
     )
    )
   )
  )
 )
 (func $5 (; 8 ;) (type $7) (param $0 i32) (param $1 i64)
  (call $fimport$1
   (local.get $0)
   (i32.wrap_i64
    (local.get $1)
   )
  )
 )
 (func $6 (; 9 ;) (type $8) (param $0 i64) (param $1 i64) (result i64)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (call $3
   (local.tee $2
    (call $1
     (local.tee $6
      (i32.add
       (local.tee $5
        (i32.add
         (local.tee $3
          (i32.load
           (i32.wrap_i64
            (local.get $0)
           )
          )
         )
         (local.tee $4
          (i32.load
           (i32.wrap_i64
            (local.get $1)
           )
          )
         )
        )
       )
       (i32.const 4)
      )
     )
    )
   )
   (local.get $6)
  )
  (i32.store
   (local.get $2)
   (local.get $5)
  )
  (drop
   (call $2
    (i32.add
     (i32.wrap_i64
      (local.get $1)
     )
     (i32.const 4)
    )
    (call $2
     (i32.add
      (i32.wrap_i64
       (local.get $0)
      )
      (i32.const 4)
     )
     (i32.add
      (i32.wrap_i64
       (local.tee $0
        (i64.extend_i32_u
         (local.get $2)
        )
       )
      )
      (i32.const 4)
     )
     (local.get $3)
    )
    (local.get $4)
   )
  )
  (local.get $0)
 )
 (func $7 (; 10 ;) (type $6) (param $0 i64) (param $1 i64) (result i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (if (result i32)
   (i32.eq
    (i32.load
     (i32.wrap_i64
      (local.get $0)
     )
    )
    (i32.load
     (i32.wrap_i64
      (local.get $1)
     )
    )
   )
   (if (result i32)
    (i32.eq
     (i32.wrap_i64
      (local.get $0)
     )
     (i32.wrap_i64
      (local.get $1)
     )
    )
    (i32.const 1)
    (block (result i32)
     (local.set $2
      (i32.load
       (i32.wrap_i64
        (local.get $0)
       )
      )
     )
     (local.set $3
      (i32.const 1)
     )
     (loop $label$4
      (block $label$5
       (if
        (i32.gt_u
         (local.tee $4
          (local.tee $2
           (i32.sub
            (local.get $2)
            (i32.const 1)
           )
          )
         )
         (i32.load
          (i32.wrap_i64
           (local.get $0)
          )
         )
        )
        (unreachable)
       )
       (if
        (i32.ne
         (block (result i32)
          (local.set $5
           (i32.load8_u
            (i32.add
             (local.get $4)
             (i32.wrap_i64
              (i64.extend_i32_s
               (i32.add
                (i32.wrap_i64
                 (local.get $0)
                )
                (i32.const 4)
               )
              )
             )
            )
           )
          )
          (if
           (i32.gt_u
            (local.get $2)
            (i32.load
             (i32.wrap_i64
              (local.get $1)
             )
            )
           )
           (unreachable)
          )
          (local.get $5)
         )
         (i32.load8_u
          (i32.add
           (local.get $2)
           (i32.wrap_i64
            (i64.extend_i32_s
             (i32.add
              (i32.wrap_i64
               (local.get $1)
              )
              (i32.const 4)
             )
            )
           )
          )
         )
        )
        (block
         (local.set $3
          (i32.const 0)
         )
         (br $label$5)
        )
       )
       (br_if $label$4
        (i32.gt_u
         (local.get $2)
         (i32.const 0)
        )
       )
      )
     )
     (local.get $3)
    )
   )
   (i32.const 0)
  )
 )
 (func $8 (; 11 ;) (type $2)
  (local $0 i64)
  (local $1 i64)
  (call $fimport$0
   (i32.const 16)
  )
  (local.set $0
   (call $6
    (i64.const 71)
    (i64.const 82)
   )
  )
  (call $5
   (i32.eq
    (i32.load
     (i32.const 71)
    )
    (i32.const 6)
   )
   (i64.const 95)
  )
  (call $5
   (i32.eq
    (i32.load
     (i32.const 82)
    )
    (i32.const 8)
   )
   (i64.const 126)
  )
  (call $5
   (i32.eq
    (i32.load
     (i32.wrap_i64
      (local.get $0)
     )
    )
    (i32.const 14)
   )
   (i64.const 157)
  )
  (call $5
   (call $7
    (local.get $0)
    (i64.const 190)
   )
   (i64.const 209)
  )
  (local.set $1
   (call $6
    (local.get $0)
    (local.get $0)
   )
  )
  (call $5
   (call $7
    (local.get $0)
    (i64.const 250)
   )
   (i64.const 269)
  )
  (call $5
   (i32.eq
    (i32.load
     (i32.wrap_i64
      (local.get $1)
     )
    )
    (i32.const 28)
   )
   (i64.const 310)
  )
  (call $5
   (call $7
    (local.get $1)
    (i64.const 343)
   )
   (local.get $1)
  )
  (call $fimport$2)
 )
 (func $9 (; 12 ;) (type $2)
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
  (global.set $global$7
   (i64.const 34359738368)
  )
 )
)
