(module
 (type $2 (func (param i32 i32 i32)))
 (type $3 (func (param i32)))
 (type $4 (func (param i32 i32)))
 (type $5 (func (param i32 i32 i32 i32) (result i32)))
 (type $6 (func (param i32 i32) (result i32)))
 (type $10 (func))
 (global $global$0 (mut i32) (i32.const 0))
 (global $global$1 (mut i32) (i32.const 0))
 (global $global$2 (mut i32) (i32.const 0))
 (global $global$3 (mut i32) (i32.const 0))
 (global $global$4 (mut i32) (i32.const 0))
 (memory $0 0 1)
 (export "keccak" (func $71))
 (start $72)
 (func $3 (; 0 ;) (; has Stack IR ;) (type $2) (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (set_local $3
   (i32.add
    (get_local $0)
    (get_local $2)
   )
  )
  (block $label$1
   (loop $label$2
    (br_if $label$1
     (i32.eq
      (get_local $0)
      (get_local $3)
     )
    )
    (i32.store8
     (get_local $1)
     (i32.load8_u
      (get_local $0)
     )
    )
    (set_local $0
     (i32.add
      (get_local $0)
      (i32.const 1)
     )
    )
    (set_local $1
     (i32.add
      (get_local $1)
      (i32.const 1)
     )
    )
    (br $label$2)
   )
  )
 )
 (func $4 (; 1 ;) (; has Stack IR ;) (type $2) (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (set_local $3
   (i32.add
    (get_local $0)
    (get_local $2)
   )
  )
  (block $label$1
   (loop $label$2
    (br_if $label$1
     (i32.eq
      (get_local $0)
      (get_local $3)
     )
    )
    (i32.store8
     (get_local $0)
     (i32.load8_u
      (get_local $1)
     )
    )
    (set_local $0
     (i32.add
      (get_local $0)
      (i32.const 1)
     )
    )
    (br $label$2)
   )
  )
 )
 (func $5 (; 2 ;) (; has Stack IR ;) (type $3) (param $0 i32)
  (local $1 i64)
  (local $2 i64)
  (local $3 i64)
  (local $4 i64)
  (local $5 i64)
  (local $6 i64)
  (local $7 i64)
  (set_local $1
   (i64.xor
    (tee_local $4
     (i64.xor
      (i64.load
       (i32.add
        (get_local $0)
        (i32.const 32)
       )
      )
      (i64.xor
       (i64.load
        (i32.add
         (get_local $0)
         (i32.const 72)
        )
       )
       (i64.xor
        (i64.load
         (i32.add
          (get_local $0)
          (i32.const 112)
         )
        )
        (i64.xor
         (i64.load
          (i32.add
           (get_local $0)
           (i32.const 152)
          )
         )
         (i64.load
          (i32.add
           (get_local $0)
           (i32.const 192)
          )
         )
        )
       )
      )
     )
    )
    (i64.rotl
     (tee_local $2
      (i64.xor
       (i64.load
        (i32.add
         (get_local $0)
         (i32.const 8)
        )
       )
       (i64.xor
        (i64.load
         (i32.add
          (get_local $0)
          (i32.const 48)
         )
        )
        (i64.xor
         (i64.load
          (i32.add
           (get_local $0)
           (i32.const 88)
          )
         )
         (i64.xor
          (i64.load
           (i32.add
            (get_local $0)
            (i32.const 128)
           )
          )
          (i64.load
           (i32.add
            (get_local $0)
            (i32.const 168)
           )
          )
         )
        )
       )
      )
     )
     (i64.const 1)
    )
   )
  )
  (set_local $3
   (i64.xor
    (tee_local $5
     (i64.xor
      (i64.load
       (get_local $0)
      )
      (i64.xor
       (i64.load
        (i32.add
         (get_local $0)
         (i32.const 40)
        )
       )
       (i64.xor
        (i64.load
         (i32.add
          (get_local $0)
          (i32.const 80)
         )
        )
        (i64.xor
         (i64.load
          (i32.add
           (get_local $0)
           (i32.const 120)
          )
         )
         (i64.load
          (i32.add
           (get_local $0)
           (i32.const 160)
          )
         )
        )
       )
      )
     )
    )
    (i64.rotl
     (tee_local $6
      (i64.xor
       (i64.load
        (i32.add
         (get_local $0)
         (i32.const 16)
        )
       )
       (i64.xor
        (i64.load
         (i32.add
          (get_local $0)
          (i32.const 56)
         )
        )
        (i64.xor
         (i64.load
          (i32.add
           (get_local $0)
           (i32.const 96)
          )
         )
         (i64.xor
          (i64.load
           (i32.add
            (get_local $0)
            (i32.const 136)
           )
          )
          (i64.load
           (i32.add
            (get_local $0)
            (i32.const 176)
           )
          )
         )
        )
       )
      )
     )
     (i64.const 1)
    )
   )
  )
  (set_local $2
   (i64.xor
    (get_local $2)
    (i64.rotl
     (tee_local $7
      (i64.xor
       (i64.load
        (i32.add
         (get_local $0)
         (i32.const 24)
        )
       )
       (i64.xor
        (i64.load
         (i32.sub
          (get_local $0)
          (i32.const -64)
         )
        )
        (i64.xor
         (i64.load
          (i32.add
           (get_local $0)
           (i32.const 104)
          )
         )
         (i64.xor
          (i64.load
           (i32.add
            (get_local $0)
            (i32.const 144)
           )
          )
          (i64.load
           (i32.add
            (get_local $0)
            (i32.const 184)
           )
          )
         )
        )
       )
      )
     )
     (i64.const 1)
    )
   )
  )
  (i64.store
   (get_local $0)
   (i64.xor
    (i64.load
     (get_local $0)
    )
    (get_local $1)
   )
  )
  (i64.store
   (i32.add
    (get_local $0)
    (i32.const 40)
   )
   (i64.xor
    (i64.load
     (i32.add
      (get_local $0)
      (i32.const 40)
     )
    )
    (get_local $1)
   )
  )
  (i64.store
   (i32.add
    (get_local $0)
    (i32.const 80)
   )
   (i64.xor
    (i64.load
     (i32.add
      (get_local $0)
      (i32.const 80)
     )
    )
    (get_local $1)
   )
  )
  (i64.store
   (i32.add
    (get_local $0)
    (i32.const 120)
   )
   (i64.xor
    (i64.load
     (i32.add
      (get_local $0)
      (i32.const 120)
     )
    )
    (get_local $1)
   )
  )
  (i64.store
   (i32.add
    (get_local $0)
    (i32.const 160)
   )
   (i64.xor
    (i64.load
     (i32.add
      (get_local $0)
      (i32.const 160)
     )
    )
    (get_local $1)
   )
  )
  (i64.store
   (i32.add
    (get_local $0)
    (i32.const 8)
   )
   (i64.xor
    (i64.load
     (i32.add
      (get_local $0)
      (i32.const 8)
     )
    )
    (get_local $3)
   )
  )
  (i64.store
   (i32.add
    (get_local $0)
    (i32.const 48)
   )
   (i64.xor
    (i64.load
     (i32.add
      (get_local $0)
      (i32.const 48)
     )
    )
    (get_local $3)
   )
  )
  (i64.store
   (i32.add
    (get_local $0)
    (i32.const 88)
   )
   (i64.xor
    (i64.load
     (i32.add
      (get_local $0)
      (i32.const 88)
     )
    )
    (get_local $3)
   )
  )
  (i64.store
   (i32.add
    (get_local $0)
    (i32.const 128)
   )
   (i64.xor
    (i64.load
     (i32.add
      (get_local $0)
      (i32.const 128)
     )
    )
    (get_local $3)
   )
  )
  (i64.store
   (i32.add
    (get_local $0)
    (i32.const 168)
   )
   (i64.xor
    (i64.load
     (i32.add
      (get_local $0)
      (i32.const 168)
     )
    )
    (get_local $3)
   )
  )
  (i64.store
   (i32.add
    (get_local $0)
    (i32.const 16)
   )
   (i64.xor
    (i64.load
     (i32.add
      (get_local $0)
      (i32.const 16)
     )
    )
    (get_local $2)
   )
  )
  (i64.store
   (i32.add
    (get_local $0)
    (i32.const 56)
   )
   (i64.xor
    (i64.load
     (i32.add
      (get_local $0)
      (i32.const 56)
     )
    )
    (get_local $2)
   )
  )
  (i64.store
   (i32.add
    (get_local $0)
    (i32.const 96)
   )
   (i64.xor
    (i64.load
     (i32.add
      (get_local $0)
      (i32.const 96)
     )
    )
    (get_local $2)
   )
  )
  (i64.store
   (i32.add
    (get_local $0)
    (i32.const 136)
   )
   (i64.xor
    (i64.load
     (i32.add
      (get_local $0)
      (i32.const 136)
     )
    )
    (get_local $2)
   )
  )
  (i64.store
   (i32.add
    (get_local $0)
    (i32.const 176)
   )
   (i64.xor
    (i64.load
     (i32.add
      (get_local $0)
      (i32.const 176)
     )
    )
    (get_local $2)
   )
  )
  (i64.store
   (i32.add
    (get_local $0)
    (i32.const 24)
   )
   (i64.xor
    (i64.load
     (i32.add
      (get_local $0)
      (i32.const 24)
     )
    )
    (tee_local $1
     (i64.xor
      (get_local $6)
      (i64.rotl
       (get_local $4)
       (i64.const 1)
      )
     )
    )
   )
  )
  (i64.store
   (i32.sub
    (get_local $0)
    (i32.const -64)
   )
   (i64.xor
    (i64.load
     (i32.sub
      (get_local $0)
      (i32.const -64)
     )
    )
    (get_local $1)
   )
  )
  (i64.store
   (i32.add
    (get_local $0)
    (i32.const 104)
   )
   (i64.xor
    (i64.load
     (i32.add
      (get_local $0)
      (i32.const 104)
     )
    )
    (get_local $1)
   )
  )
  (i64.store
   (i32.add
    (get_local $0)
    (i32.const 144)
   )
   (i64.xor
    (i64.load
     (i32.add
      (get_local $0)
      (i32.const 144)
     )
    )
    (get_local $1)
   )
  )
  (i64.store
   (i32.add
    (get_local $0)
    (i32.const 184)
   )
   (i64.xor
    (i64.load
     (i32.add
      (get_local $0)
      (i32.const 184)
     )
    )
    (get_local $1)
   )
  )
  (i64.store
   (i32.add
    (get_local $0)
    (i32.const 32)
   )
   (i64.xor
    (i64.load
     (i32.add
      (get_local $0)
      (i32.const 32)
     )
    )
    (tee_local $1
     (i64.xor
      (get_local $7)
      (i64.rotl
       (get_local $5)
       (i64.const 1)
      )
     )
    )
   )
  )
  (i64.store
   (i32.add
    (get_local $0)
    (i32.const 72)
   )
   (i64.xor
    (i64.load
     (i32.add
      (get_local $0)
      (i32.const 72)
     )
    )
    (get_local $1)
   )
  )
  (i64.store
   (i32.add
    (get_local $0)
    (i32.const 112)
   )
   (i64.xor
    (i64.load
     (i32.add
      (get_local $0)
      (i32.const 112)
     )
    )
    (get_local $1)
   )
  )
  (i64.store
   (i32.add
    (get_local $0)
    (i32.const 152)
   )
   (i64.xor
    (i64.load
     (i32.add
      (get_local $0)
      (i32.const 152)
     )
    )
    (get_local $1)
   )
  )
  (i64.store
   (i32.add
    (get_local $0)
    (i32.const 192)
   )
   (i64.xor
    (i64.load
     (i32.add
      (get_local $0)
      (i32.const 192)
     )
    )
    (get_local $1)
   )
  )
 )
 (func $6 (; 3 ;) (; has Stack IR ;) (type $4) (param $0 i32) (param $1 i32)
  (local $2 i32)
  (local $3 i32)
  (block $label$1
   (loop $label$2
    (br_if $label$1
     (i32.ge_u
      (get_local $2)
      (i32.const 24)
     )
    )
    (i64.store
     (tee_local $3
      (i32.add
       (get_local $0)
       (i32.shl
        (i32.add
         (get_local $2)
         (i32.const 1)
        )
        (i32.const 3)
       )
      )
     )
     (i64.rotl
      (i64.load
       (get_local $3)
      )
      (i64.load8_u
       (i32.add
        (get_local $1)
        (get_local $2)
       )
      )
     )
    )
    (set_local $2
     (i32.add
      (get_local $2)
      (i32.const 1)
     )
    )
    (br $label$2)
   )
  )
 )
 (func $7 (; 4 ;) (; has Stack IR ;) (type $3) (param $0 i32)
  (local $1 i64)
  (set_local $1
   (i64.load
    (i32.add
     (get_local $0)
     (i32.const 8)
    )
   )
  )
  (i64.store
   (i32.add
    (get_local $0)
    (i32.const 8)
   )
   (i64.load
    (i32.add
     (get_local $0)
     (i32.const 48)
    )
   )
  )
  (i64.store
   (i32.add
    (get_local $0)
    (i32.const 48)
   )
   (i64.load
    (i32.add
     (get_local $0)
     (i32.const 72)
    )
   )
  )
  (i64.store
   (i32.add
    (get_local $0)
    (i32.const 72)
   )
   (i64.load
    (i32.add
     (get_local $0)
     (i32.const 176)
    )
   )
  )
  (i64.store
   (i32.add
    (get_local $0)
    (i32.const 176)
   )
   (i64.load
    (i32.add
     (get_local $0)
     (i32.const 112)
    )
   )
  )
  (i64.store
   (i32.add
    (get_local $0)
    (i32.const 112)
   )
   (i64.load
    (i32.add
     (get_local $0)
     (i32.const 160)
    )
   )
  )
  (i64.store
   (i32.add
    (get_local $0)
    (i32.const 160)
   )
   (i64.load
    (i32.add
     (get_local $0)
     (i32.const 16)
    )
   )
  )
  (i64.store
   (i32.add
    (get_local $0)
    (i32.const 16)
   )
   (i64.load
    (i32.add
     (get_local $0)
     (i32.const 96)
    )
   )
  )
  (i64.store
   (i32.add
    (get_local $0)
    (i32.const 96)
   )
   (i64.load
    (i32.add
     (get_local $0)
     (i32.const 104)
    )
   )
  )
  (i64.store
   (i32.add
    (get_local $0)
    (i32.const 104)
   )
   (i64.load
    (i32.add
     (get_local $0)
     (i32.const 152)
    )
   )
  )
  (i64.store
   (i32.add
    (get_local $0)
    (i32.const 152)
   )
   (i64.load
    (i32.add
     (get_local $0)
     (i32.const 184)
    )
   )
  )
  (i64.store
   (i32.add
    (get_local $0)
    (i32.const 184)
   )
   (i64.load
    (i32.add
     (get_local $0)
     (i32.const 120)
    )
   )
  )
  (i64.store
   (i32.add
    (get_local $0)
    (i32.const 120)
   )
   (i64.load
    (i32.add
     (get_local $0)
     (i32.const 32)
    )
   )
  )
  (i64.store
   (i32.add
    (get_local $0)
    (i32.const 32)
   )
   (i64.load
    (i32.add
     (get_local $0)
     (i32.const 192)
    )
   )
  )
  (i64.store
   (i32.add
    (get_local $0)
    (i32.const 192)
   )
   (i64.load
    (i32.add
     (get_local $0)
     (i32.const 168)
    )
   )
  )
  (i64.store
   (i32.add
    (get_local $0)
    (i32.const 168)
   )
   (i64.load
    (i32.sub
     (get_local $0)
     (i32.const -64)
    )
   )
  )
  (i64.store
   (i32.sub
    (get_local $0)
    (i32.const -64)
   )
   (i64.load
    (i32.add
     (get_local $0)
     (i32.const 128)
    )
   )
  )
  (i64.store
   (i32.add
    (get_local $0)
    (i32.const 128)
   )
   (i64.load
    (i32.add
     (get_local $0)
     (i32.const 40)
    )
   )
  )
  (i64.store
   (i32.add
    (get_local $0)
    (i32.const 40)
   )
   (i64.load
    (i32.add
     (get_local $0)
     (i32.const 24)
    )
   )
  )
  (i64.store
   (i32.add
    (get_local $0)
    (i32.const 24)
   )
   (i64.load
    (i32.add
     (get_local $0)
     (i32.const 144)
    )
   )
  )
  (i64.store
   (i32.add
    (get_local $0)
    (i32.const 144)
   )
   (i64.load
    (i32.add
     (get_local $0)
     (i32.const 136)
    )
   )
  )
  (i64.store
   (i32.add
    (get_local $0)
    (i32.const 136)
   )
   (i64.load
    (i32.add
     (get_local $0)
     (i32.const 88)
    )
   )
  )
  (i64.store
   (i32.add
    (get_local $0)
    (i32.const 88)
   )
   (i64.load
    (i32.add
     (get_local $0)
     (i32.const 56)
    )
   )
  )
  (i64.store
   (i32.add
    (get_local $0)
    (i32.const 56)
   )
   (i64.load
    (i32.add
     (get_local $0)
     (i32.const 80)
    )
   )
  )
  (i64.store
   (i32.add
    (get_local $0)
    (i32.const 80)
   )
   (get_local $1)
  )
 )
 (func $8 (; 5 ;) (; has Stack IR ;) (type $3) (param $0 i32)
  (local $1 i32)
  (local $2 i64)
  (local $3 i64)
  (block $label$1
   (loop $label$2
    (br_if $label$1
     (i32.ge_u
      (get_local $1)
      (i32.const 25)
     )
    )
    (set_local $2
     (i64.load
      (i32.add
       (get_local $0)
       (i32.shl
        (get_local $1)
        (i32.const 3)
       )
      )
     )
    )
    (i64.store
     (i32.add
      (get_local $0)
      (i32.shl
       (get_local $1)
       (i32.const 3)
      )
     )
     (i64.xor
      (i64.load
       (i32.add
        (get_local $0)
        (i32.shl
         (get_local $1)
         (i32.const 3)
        )
       )
      )
      (i64.and
       (i64.xor
        (tee_local $3
         (i64.load
          (i32.add
           (get_local $0)
           (i32.shl
            (i32.add
             (get_local $1)
             (i32.const 1)
            )
            (i32.const 3)
           )
          )
         )
        )
        (i64.const -1)
       )
       (i64.load
        (i32.add
         (get_local $0)
         (i32.shl
          (i32.add
           (get_local $1)
           (i32.const 2)
          )
          (i32.const 3)
         )
        )
       )
      )
     )
    )
    (i64.store
     (i32.add
      (get_local $0)
      (i32.shl
       (i32.add
        (get_local $1)
        (i32.const 1)
       )
       (i32.const 3)
      )
     )
     (i64.xor
      (i64.load
       (i32.add
        (get_local $0)
        (i32.shl
         (i32.add
          (get_local $1)
          (i32.const 1)
         )
         (i32.const 3)
        )
       )
      )
      (i64.and
       (i64.xor
        (i64.load
         (i32.add
          (get_local $0)
          (i32.shl
           (i32.add
            (get_local $1)
            (i32.const 2)
           )
           (i32.const 3)
          )
         )
        )
        (i64.const -1)
       )
       (i64.load
        (i32.add
         (get_local $0)
         (i32.shl
          (i32.add
           (get_local $1)
           (i32.const 3)
          )
          (i32.const 3)
         )
        )
       )
      )
     )
    )
    (i64.store
     (i32.add
      (get_local $0)
      (i32.shl
       (i32.add
        (get_local $1)
        (i32.const 2)
       )
       (i32.const 3)
      )
     )
     (i64.xor
      (i64.load
       (i32.add
        (get_local $0)
        (i32.shl
         (i32.add
          (get_local $1)
          (i32.const 2)
         )
         (i32.const 3)
        )
       )
      )
      (i64.and
       (i64.xor
        (i64.load
         (i32.add
          (get_local $0)
          (i32.shl
           (i32.add
            (get_local $1)
            (i32.const 3)
           )
           (i32.const 3)
          )
         )
        )
        (i64.const -1)
       )
       (i64.load
        (i32.add
         (get_local $0)
         (i32.shl
          (i32.add
           (get_local $1)
           (i32.const 4)
          )
          (i32.const 3)
         )
        )
       )
      )
     )
    )
    (i64.store
     (i32.add
      (get_local $0)
      (i32.shl
       (i32.add
        (get_local $1)
        (i32.const 3)
       )
       (i32.const 3)
      )
     )
     (i64.xor
      (i64.load
       (i32.add
        (get_local $0)
        (i32.shl
         (i32.add
          (get_local $1)
          (i32.const 3)
         )
         (i32.const 3)
        )
       )
      )
      (i64.and
       (i64.xor
        (i64.load
         (i32.add
          (get_local $0)
          (i32.shl
           (i32.add
            (get_local $1)
            (i32.const 4)
           )
           (i32.const 3)
          )
         )
        )
        (i64.const -1)
       )
       (get_local $2)
      )
     )
    )
    (i64.store
     (i32.add
      (get_local $0)
      (i32.shl
       (i32.add
        (get_local $1)
        (i32.const 4)
       )
       (i32.const 3)
      )
     )
     (i64.xor
      (i64.load
       (i32.add
        (get_local $0)
        (i32.shl
         (i32.add
          (get_local $1)
          (i32.const 4)
         )
         (i32.const 3)
        )
       )
      )
      (i64.and
       (i64.xor
        (get_local $2)
        (i64.const -1)
       )
       (get_local $3)
      )
     )
    )
    (set_local $1
     (i32.add
      (get_local $1)
      (i32.const 5)
     )
    )
    (br $label$2)
   )
  )
 )
 (func $9 (; 6 ;) (; has Stack IR ;) (type $3) (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (set_local $2
   (i32.add
    (get_local $0)
    (i32.const 400)
   )
  )
  (set_local $3
   (i32.add
    (get_local $0)
    (i32.const 592)
   )
  )
  (block $label$1
   (loop $label$2
    (br_if $label$1
     (i32.ge_u
      (get_local $1)
      (i32.const 24)
     )
    )
    (call $5
     (get_local $0)
    )
    (call $6
     (get_local $0)
     (get_local $3)
    )
    (call $7
     (get_local $0)
    )
    (call $8
     (get_local $0)
    )
    (i64.store
     (get_local $0)
     (i64.xor
      (i64.load
       (get_local $0)
      )
      (i64.load
       (i32.add
        (get_local $2)
        (i32.shl
         (get_local $1)
         (i32.const 3)
        )
       )
      )
     )
    )
    (set_local $1
     (i32.add
      (get_local $1)
      (i32.const 1)
     )
    )
    (br $label$2)
   )
  )
 )
 (func $10 (; 7 ;) (; has Stack IR ;) (type $2) (param $0 i32) (param $1 i32) (param $2 i32)
  (i64.store
   (get_local $2)
   (i64.xor
    (i64.load
     (get_local $2)
    )
    (i64.load
     (get_local $0)
    )
   )
  )
  (i64.store
   (i32.add
    (get_local $2)
    (i32.const 8)
   )
   (i64.xor
    (i64.load
     (i32.add
      (get_local $2)
      (i32.const 8)
     )
    )
    (i64.load
     (i32.add
      (get_local $0)
      (i32.const 8)
     )
    )
   )
  )
  (i64.store
   (i32.add
    (get_local $2)
    (i32.const 16)
   )
   (i64.xor
    (i64.load
     (i32.add
      (get_local $2)
      (i32.const 16)
     )
    )
    (i64.load
     (i32.add
      (get_local $0)
      (i32.const 16)
     )
    )
   )
  )
  (i64.store
   (i32.add
    (get_local $2)
    (i32.const 24)
   )
   (i64.xor
    (i64.load
     (i32.add
      (get_local $2)
      (i32.const 24)
     )
    )
    (i64.load
     (i32.add
      (get_local $0)
      (i32.const 24)
     )
    )
   )
  )
  (i64.store
   (i32.add
    (get_local $2)
    (i32.const 32)
   )
   (i64.xor
    (i64.load
     (i32.add
      (get_local $2)
      (i32.const 32)
     )
    )
    (i64.load
     (i32.add
      (get_local $0)
      (i32.const 32)
     )
    )
   )
  )
  (i64.store
   (i32.add
    (get_local $2)
    (i32.const 40)
   )
   (i64.xor
    (i64.load
     (i32.add
      (get_local $2)
      (i32.const 40)
     )
    )
    (i64.load
     (i32.add
      (get_local $0)
      (i32.const 40)
     )
    )
   )
  )
  (i64.store
   (i32.add
    (get_local $2)
    (i32.const 48)
   )
   (i64.xor
    (i64.load
     (i32.add
      (get_local $2)
      (i32.const 48)
     )
    )
    (i64.load
     (i32.add
      (get_local $0)
      (i32.const 48)
     )
    )
   )
  )
  (i64.store
   (i32.add
    (get_local $2)
    (i32.const 56)
   )
   (i64.xor
    (i64.load
     (i32.add
      (get_local $2)
      (i32.const 56)
     )
    )
    (i64.load
     (i32.add
      (get_local $0)
      (i32.const 56)
     )
    )
   )
  )
  (i64.store
   (i32.sub
    (get_local $2)
    (i32.const -64)
   )
   (i64.xor
    (i64.load
     (i32.sub
      (get_local $2)
      (i32.const -64)
     )
    )
    (i64.load
     (i32.sub
      (get_local $0)
      (i32.const -64)
     )
    )
   )
  )
  (i64.store
   (i32.add
    (get_local $2)
    (i32.const 72)
   )
   (i64.xor
    (i64.load
     (i32.add
      (get_local $2)
      (i32.const 72)
     )
    )
    (i64.load
     (i32.add
      (get_local $0)
      (i32.const 72)
     )
    )
   )
  )
  (i64.store
   (i32.add
    (get_local $2)
    (i32.const 80)
   )
   (i64.xor
    (i64.load
     (i32.add
      (get_local $2)
      (i32.const 80)
     )
    )
    (i64.load
     (i32.add
      (get_local $0)
      (i32.const 80)
     )
    )
   )
  )
  (i64.store
   (i32.add
    (get_local $2)
    (i32.const 88)
   )
   (i64.xor
    (i64.load
     (i32.add
      (get_local $2)
      (i32.const 88)
     )
    )
    (i64.load
     (i32.add
      (get_local $0)
      (i32.const 88)
     )
    )
   )
  )
  (i64.store
   (i32.add
    (get_local $2)
    (i32.const 96)
   )
   (i64.xor
    (i64.load
     (i32.add
      (get_local $2)
      (i32.const 96)
     )
    )
    (i64.load
     (i32.add
      (get_local $0)
      (i32.const 96)
     )
    )
   )
  )
  (i64.store
   (i32.add
    (get_local $2)
    (i32.const 104)
   )
   (i64.xor
    (i64.load
     (i32.add
      (get_local $2)
      (i32.const 104)
     )
    )
    (i64.load
     (i32.add
      (get_local $0)
      (i32.const 104)
     )
    )
   )
  )
  (i64.store
   (i32.add
    (get_local $2)
    (i32.const 112)
   )
   (i64.xor
    (i64.load
     (i32.add
      (get_local $2)
      (i32.const 112)
     )
    )
    (i64.load
     (i32.add
      (get_local $0)
      (i32.const 112)
     )
    )
   )
  )
  (i64.store
   (i32.add
    (get_local $2)
    (i32.const 120)
   )
   (i64.xor
    (i64.load
     (i32.add
      (get_local $2)
      (i32.const 120)
     )
    )
    (i64.load
     (i32.add
      (get_local $0)
      (i32.const 120)
     )
    )
   )
  )
  (i64.store
   (i32.add
    (get_local $2)
    (i32.const 128)
   )
   (i64.xor
    (i64.load
     (i32.add
      (get_local $2)
      (i32.const 128)
     )
    )
    (i64.load
     (i32.add
      (get_local $0)
      (i32.const 128)
     )
    )
   )
  )
  (call $9
   (get_local $2)
  )
 )
 (func $11 (; 8 ;) (; has Stack IR ;) (type $3) (param $0 i32)
  (local $1 i32)
  (call $4
   (get_local $0)
   (i32.const 0)
   (i32.const 400)
  )
  (i64.store
   (tee_local $1
    (i32.add
     (get_local $0)
     (i32.const 400)
    )
   )
   (i64.const 1)
  )
  (i64.store
   (i32.add
    (get_local $1)
    (i32.const 8)
   )
   (i64.const 32898)
  )
  (i64.store
   (i32.add
    (get_local $1)
    (i32.const 16)
   )
   (i64.const -9223372036854742902)
  )
  (i64.store
   (i32.add
    (get_local $1)
    (i32.const 24)
   )
   (i64.const -9223372034707259392)
  )
  (i64.store
   (i32.add
    (get_local $1)
    (i32.const 32)
   )
   (i64.const 32907)
  )
  (i64.store
   (i32.add
    (get_local $1)
    (i32.const 40)
   )
   (i64.const 2147483649)
  )
  (i64.store
   (i32.add
    (get_local $1)
    (i32.const 48)
   )
   (i64.const -9223372034707259263)
  )
  (i64.store
   (i32.add
    (get_local $1)
    (i32.const 56)
   )
   (i64.const -9223372036854743031)
  )
  (i64.store
   (i32.sub
    (get_local $1)
    (i32.const -64)
   )
   (i64.const 138)
  )
  (i64.store
   (i32.add
    (get_local $1)
    (i32.const 72)
   )
   (i64.const 136)
  )
  (i64.store
   (i32.add
    (get_local $1)
    (i32.const 80)
   )
   (i64.const 2147516425)
  )
  (i64.store
   (i32.add
    (get_local $1)
    (i32.const 88)
   )
   (i64.const 2147483658)
  )
  (i64.store
   (i32.add
    (get_local $1)
    (i32.const 96)
   )
   (i64.const 2147516555)
  )
  (i64.store
   (i32.add
    (get_local $1)
    (i32.const 104)
   )
   (i64.const -9223372036854775669)
  )
  (i64.store
   (i32.add
    (get_local $1)
    (i32.const 112)
   )
   (i64.const -9223372036854742903)
  )
  (i64.store
   (i32.add
    (get_local $1)
    (i32.const 120)
   )
   (i64.const -9223372036854743037)
  )
  (i64.store
   (i32.add
    (get_local $1)
    (i32.const 128)
   )
   (i64.const -9223372036854743038)
  )
  (i64.store
   (i32.add
    (get_local $1)
    (i32.const 136)
   )
   (i64.const -9223372036854775680)
  )
  (i64.store
   (i32.add
    (get_local $1)
    (i32.const 144)
   )
   (i64.const 32778)
  )
  (i64.store
   (i32.add
    (get_local $1)
    (i32.const 152)
   )
   (i64.const -9223372034707292150)
  )
  (i64.store
   (i32.add
    (get_local $1)
    (i32.const 160)
   )
   (i64.const -9223372034707259263)
  )
  (i64.store
   (i32.add
    (get_local $1)
    (i32.const 168)
   )
   (i64.const -9223372036854742912)
  )
  (i64.store
   (i32.add
    (get_local $1)
    (i32.const 176)
   )
   (i64.const 2147483649)
  )
  (i64.store
   (i32.add
    (get_local $1)
    (i32.const 184)
   )
   (i64.const -9223372034707259384)
  )
  (i32.store8
   (tee_local $0
    (i32.add
     (get_local $0)
     (i32.const 592)
    )
   )
   (i32.const 1)
  )
  (i32.store8
   (i32.add
    (get_local $0)
    (i32.const 1)
   )
   (i32.const 62)
  )
  (i32.store8
   (i32.add
    (get_local $0)
    (i32.const 2)
   )
   (i32.const 28)
  )
  (i32.store8
   (i32.add
    (get_local $0)
    (i32.const 3)
   )
   (i32.const 27)
  )
  (i32.store8
   (i32.add
    (get_local $0)
    (i32.const 4)
   )
   (i32.const 36)
  )
  (i32.store8
   (i32.add
    (get_local $0)
    (i32.const 5)
   )
   (i32.const 44)
  )
  (i32.store8
   (i32.add
    (get_local $0)
    (i32.const 6)
   )
   (i32.const 6)
  )
  (i32.store8
   (i32.add
    (get_local $0)
    (i32.const 7)
   )
   (i32.const 55)
  )
  (i32.store8
   (i32.add
    (get_local $0)
    (i32.const 8)
   )
   (i32.const 20)
  )
  (i32.store8
   (i32.add
    (get_local $0)
    (i32.const 9)
   )
   (i32.const 3)
  )
  (i32.store8
   (i32.add
    (get_local $0)
    (i32.const 10)
   )
   (i32.const 10)
  )
  (i32.store8
   (i32.add
    (get_local $0)
    (i32.const 11)
   )
   (i32.const 43)
  )
  (i32.store8
   (i32.add
    (get_local $0)
    (i32.const 12)
   )
   (i32.const 25)
  )
  (i32.store8
   (i32.add
    (get_local $0)
    (i32.const 13)
   )
   (i32.const 39)
  )
  (i32.store8
   (i32.add
    (get_local $0)
    (i32.const 14)
   )
   (i32.const 41)
  )
  (i32.store8
   (i32.add
    (get_local $0)
    (i32.const 15)
   )
   (i32.const 45)
  )
  (i32.store8
   (i32.add
    (get_local $0)
    (i32.const 16)
   )
   (i32.const 15)
  )
  (i32.store8
   (i32.add
    (get_local $0)
    (i32.const 17)
   )
   (i32.const 21)
  )
  (i32.store8
   (i32.add
    (get_local $0)
    (i32.const 18)
   )
   (i32.const 8)
  )
  (i32.store8
   (i32.add
    (get_local $0)
    (i32.const 19)
   )
   (i32.const 18)
  )
  (i32.store8
   (i32.add
    (get_local $0)
    (i32.const 20)
   )
   (i32.const 2)
  )
  (i32.store8
   (i32.add
    (get_local $0)
    (i32.const 21)
   )
   (i32.const 61)
  )
  (i32.store8
   (i32.add
    (get_local $0)
    (i32.const 22)
   )
   (i32.const 56)
  )
  (i32.store8
   (i32.add
    (get_local $0)
    (i32.const 23)
   )
   (i32.const 14)
  )
 )
 (func $13 (; 9 ;) (; has Stack IR ;) (type $2) (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (set_local $5
   (i32.add
    (get_local $0)
    (i32.const 208)
   )
  )
  (if
   (tee_local $3
    (i32.load
     (tee_local $6
      (i32.add
       (get_local $0)
       (i32.const 200)
      )
     )
    )
   )
   (block
    (if
     (i32.lt_u
      (get_local $2)
      (tee_local $4
       (i32.sub
        (i32.const 136)
        (get_local $3)
       )
      )
     )
     (set_local $4
      (get_local $2)
     )
    )
    (call $3
     (i32.add
      (get_local $5)
      (get_local $3)
     )
     (get_local $1)
     (get_local $4)
    )
    (if
     (i32.eq
      (tee_local $3
       (i32.add
        (get_local $3)
        (get_local $4)
       )
      )
      (i32.const 136)
     )
     (call $10
      (get_local $1)
      (i32.const 136)
      (get_local $0)
     )
     (set_local $3
      (i32.const 0)
     )
    )
    (i32.store
     (get_local $6)
     (get_local $3)
    )
    (set_local $2
     (i32.sub
      (get_local $2)
      (get_local $4)
     )
    )
   )
  )
  (block $label$5
   (loop $label$6
    (br_if $label$5
     (i32.lt_u
      (get_local $2)
      (i32.const 136)
     )
    )
    (call $10
     (get_local $1)
     (i32.const 136)
     (get_local $0)
    )
    (set_local $1
     (i32.add
      (get_local $1)
      (i32.const 136)
     )
    )
    (set_local $2
     (i32.sub
      (get_local $2)
      (i32.const 136)
     )
    )
    (br $label$6)
   )
  )
  (if
   (i32.gt_u
    (get_local $2)
    (i32.const 0)
   )
   (block
    (call $3
     (i32.add
      (get_local $5)
      (get_local $3)
     )
     (get_local $1)
     (get_local $2)
    )
    (i32.store
     (get_local $6)
     (i32.add
      (get_local $3)
      (get_local $2)
     )
    )
   )
  )
 )
 (func $14 (; 10 ;) (; has Stack IR ;) (type $4) (param $0 i32) (param $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (call $4
   (i32.add
    (tee_local $3
     (i32.add
      (get_local $0)
      (i32.const 208)
     )
    )
    (tee_local $2
     (tee_local $4
      (i32.load
       (i32.add
        (get_local $0)
        (i32.const 200)
       )
      )
     )
    )
   )
   (i32.const 0)
   (i32.sub
    (i32.const 136)
    (get_local $2)
   )
  )
  (i32.store8
   (tee_local $2
    (i32.add
     (get_local $3)
     (get_local $4)
    )
   )
   (i32.or
    (i32.load8_u
     (get_local $2)
    )
    (i32.const 1)
   )
  )
  (i32.store8
   (tee_local $2
    (i32.add
     (get_local $3)
     (i32.const 135)
    )
   )
   (i32.or
    (i32.load8_u
     (get_local $2)
    )
    (i32.const 128)
   )
  )
  (call $10
   (get_local $3)
   (i32.const 136)
   (get_local $0)
  )
  (i64.store
   (get_local $1)
   (i64.load
    (get_local $0)
   )
  )
  (i64.store
   (i32.add
    (get_local $1)
    (i32.const 8)
   )
   (i64.load
    (i32.add
     (get_local $0)
     (i32.const 8)
    )
   )
  )
  (i64.store
   (i32.add
    (get_local $1)
    (i32.const 16)
   )
   (i64.load
    (i32.add
     (get_local $0)
     (i32.const 16)
    )
   )
  )
  (i64.store
   (i32.add
    (get_local $1)
    (i32.const 24)
   )
   (i64.load
    (i32.add
     (get_local $0)
     (i32.const 24)
    )
   )
  )
 )
 (func $43 (; 11 ;) (; has Stack IR ;) (type $6) (param $0 i32) (param $1 i32) (result i32)
  (i32.shl
   (get_local $0)
   (get_local $1)
  )
 )
 (func $71 (; 12 ;) (; has Stack IR ;) (type $5) (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (result i32)
  (local $4 i32)
  (call $11
   (tee_local $4
    (get_local $0)
   )
  )
  (call $13
   (get_local $4)
   (get_local $1)
   (get_local $2)
  )
  (call $14
   (get_local $4)
   (get_local $3)
  )
  (get_local $3)
 )
 (func $72 (; 13 ;) (; has Stack IR ;) (type $10)
  (set_global $global$0
   (i32.const 3)
  )
  (set_global $global$1
   (call $43
    (i32.const 1)
    (get_global $global$0)
   )
  )
  (set_global $global$2
   (i32.sub
    (get_global $global$1)
    (i32.const 1)
   )
  )
  (set_global $global$3
   (call $43
    (i32.const 1)
    (i32.const 30)
   )
  )
  (set_global $global$4
   (i32.const 0)
  )
 )
)
