(module
 (type $0 (func (param i32) (result i32)))
 (type $1 (func (param i32 i32) (result i32)))
 (type $2 (func (param i32 i32 i32)))
 (type $3 (func (param i32)))
 (type $4 (func (param i32 i32)))
 (type $5 (func (param i32 i32 i32 i32) (result i32)))
 (type $6 (func))
 (type $7 (func (param i32 i32)))
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
 (export "keccak" (func $16))
 (start $17)
 (func $0 (; 0 ;) (type $2) (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local.set $3
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
      (local.get $3)
     )
    )
    (block
     (i32.store8
      (local.get $1)
      (i32.load8_u
       (local.get $0)
      )
     )
     (local.set $0
      (i32.add
       (local.get $0)
       (i32.const 1)
      )
     )
     (local.set $1
      (i32.add
       (local.get $1)
       (i32.const 1)
      )
     )
     (br $label$1)
    )
   )
  )
 )
 (func $1 (; 1 ;) (type $7) (param $0 i32) (param $1 i32)
  (local $2 i32)
  (local.set $2
   (i32.add
    (local.get $0)
    (local.get $1)
   )
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
 (func $2 (; 2 ;) (type $3) (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 i32)
  (local $12 i32)
  (local $13 i32)
  (local $14 i32)
  (local $15 i32)
  (local $16 i32)
  (local $17 i32)
  (local $18 i32)
  (local $19 i32)
  (local $20 i32)
  (local $21 i32)
  (local $22 i32)
  (local $23 i32)
  (local $24 i32)
  (local $25 i64)
  (local $26 i64)
  (local $27 i64)
  (local $28 i64)
  (local $29 i64)
  (local $30 i64)
  (local.set $26
   (i64.xor
    (i64.load
     (local.tee $1
      (i32.add
       (local.get $0)
       (i32.const 16)
      )
     )
    )
    (i64.xor
     (i64.load
      (local.tee $2
       (i32.add
        (local.get $0)
        (i32.const 56)
       )
      )
     )
     (i64.xor
      (i64.load
       (local.tee $3
        (i32.add
         (local.get $0)
         (i32.const 96)
        )
       )
      )
      (i64.xor
       (i64.load
        (local.tee $4
         (i32.add
          (local.get $0)
          (i32.const 136)
         )
        )
       )
       (i64.load
        (local.tee $5
         (i32.add
          (local.get $0)
          (i32.const 176)
         )
        )
       )
      )
     )
    )
   )
  )
  (local.set $27
   (i64.xor
    (i64.load
     (local.tee $6
      (i32.add
       (local.get $0)
       (i32.const 24)
      )
     )
    )
    (i64.xor
     (i64.load
      (local.tee $7
       (i32.sub
        (local.get $0)
        (i32.const -64)
       )
      )
     )
     (i64.xor
      (i64.load
       (local.tee $8
        (i32.add
         (local.get $0)
         (i32.const 104)
        )
       )
      )
      (i64.xor
       (i64.load
        (local.tee $9
         (i32.add
          (local.get $0)
          (i32.const 144)
         )
        )
       )
       (i64.load
        (local.tee $10
         (i32.add
          (local.get $0)
          (i32.const 184)
         )
        )
       )
      )
     )
    )
   )
  )
  (local.set $28
   (i64.xor
    (i64.load
     (local.get $0)
    )
    (i64.xor
     (i64.load
      (local.tee $11
       (i32.add
        (local.get $0)
        (i32.const 40)
       )
      )
     )
     (i64.xor
      (i64.load
       (local.tee $12
        (i32.add
         (local.get $0)
         (i32.const 80)
        )
       )
      )
      (i64.xor
       (i64.load
        (local.tee $13
         (i32.add
          (local.get $0)
          (i32.const 120)
         )
        )
       )
       (i64.load
        (local.tee $14
         (i32.add
          (local.get $0)
          (i32.const 160)
         )
        )
       )
      )
     )
    )
   )
  )
  (i64.store
   (local.get $0)
   (i64.xor
    (local.tee $25
     (i64.xor
      (local.tee $29
       (i64.xor
        (i64.load
         (local.tee $15
          (i32.add
           (local.get $0)
           (i32.const 32)
          )
         )
        )
        (i64.xor
         (i64.load
          (local.tee $16
           (i32.add
            (local.get $0)
            (i32.const 72)
           )
          )
         )
         (i64.xor
          (i64.load
           (local.tee $17
            (i32.add
             (local.get $0)
             (i32.const 112)
            )
           )
          )
          (i64.xor
           (i64.load
            (local.tee $18
             (i32.add
              (local.get $0)
              (i32.const 152)
             )
            )
           )
           (i64.load
            (local.tee $19
             (i32.add
              (local.get $0)
              (i32.const 192)
             )
            )
           )
          )
         )
        )
       )
      )
      (i64.rotl
       (local.tee $30
        (i64.xor
         (i64.load
          (local.tee $20
           (i32.add
            (local.get $0)
            (i32.const 8)
           )
          )
         )
         (i64.xor
          (i64.load
           (local.tee $21
            (i32.add
             (local.get $0)
             (i32.const 48)
            )
           )
          )
          (i64.xor
           (i64.load
            (local.tee $22
             (i32.add
              (local.get $0)
              (i32.const 88)
             )
            )
           )
           (i64.xor
            (i64.load
             (local.tee $23
              (i32.add
               (local.get $0)
               (i32.const 128)
              )
             )
            )
            (i64.load
             (local.tee $24
              (i32.add
               (local.get $0)
               (i32.const 168)
              )
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
    (i64.load
     (local.get $0)
    )
   )
  )
  (i64.store
   (local.get $11)
   (i64.xor
    (i64.load
     (local.get $11)
    )
    (local.get $25)
   )
  )
  (i64.store
   (local.get $12)
   (i64.xor
    (i64.load
     (local.get $12)
    )
    (local.get $25)
   )
  )
  (i64.store
   (local.get $13)
   (i64.xor
    (i64.load
     (local.get $13)
    )
    (local.get $25)
   )
  )
  (i64.store
   (local.get $14)
   (i64.xor
    (i64.load
     (local.get $14)
    )
    (local.get $25)
   )
  )
  (i64.store
   (local.get $20)
   (i64.xor
    (local.tee $25
     (i64.xor
      (i64.rotl
       (local.get $26)
       (i64.const 1)
      )
      (local.get $28)
     )
    )
    (i64.load
     (local.get $20)
    )
   )
  )
  (i64.store
   (local.get $21)
   (i64.xor
    (i64.load
     (local.get $21)
    )
    (local.get $25)
   )
  )
  (i64.store
   (local.get $22)
   (i64.xor
    (i64.load
     (local.get $22)
    )
    (local.get $25)
   )
  )
  (i64.store
   (local.get $23)
   (i64.xor
    (i64.load
     (local.get $23)
    )
    (local.get $25)
   )
  )
  (i64.store
   (local.get $24)
   (i64.xor
    (i64.load
     (local.get $24)
    )
    (local.get $25)
   )
  )
  (i64.store
   (local.get $1)
   (i64.xor
    (local.tee $25
     (i64.xor
      (i64.rotl
       (local.get $27)
       (i64.const 1)
      )
      (local.get $30)
     )
    )
    (i64.load
     (local.get $1)
    )
   )
  )
  (i64.store
   (local.get $2)
   (i64.xor
    (i64.load
     (local.get $2)
    )
    (local.get $25)
   )
  )
  (i64.store
   (local.get $3)
   (i64.xor
    (i64.load
     (local.get $3)
    )
    (local.get $25)
   )
  )
  (i64.store
   (local.get $4)
   (i64.xor
    (i64.load
     (local.get $4)
    )
    (local.get $25)
   )
  )
  (i64.store
   (local.get $5)
   (i64.xor
    (i64.load
     (local.get $5)
    )
    (local.get $25)
   )
  )
  (i64.store
   (local.get $6)
   (i64.xor
    (local.tee $25
     (i64.xor
      (i64.rotl
       (local.get $29)
       (i64.const 1)
      )
      (local.get $26)
     )
    )
    (i64.load
     (local.get $6)
    )
   )
  )
  (i64.store
   (local.get $7)
   (i64.xor
    (i64.load
     (local.get $7)
    )
    (local.get $25)
   )
  )
  (i64.store
   (local.get $8)
   (i64.xor
    (i64.load
     (local.get $8)
    )
    (local.get $25)
   )
  )
  (i64.store
   (local.get $9)
   (i64.xor
    (i64.load
     (local.get $9)
    )
    (local.get $25)
   )
  )
  (i64.store
   (local.get $10)
   (i64.xor
    (i64.load
     (local.get $10)
    )
    (local.get $25)
   )
  )
  (i64.store
   (local.get $15)
   (i64.xor
    (local.tee $25
     (i64.xor
      (i64.rotl
       (local.get $28)
       (i64.const 1)
      )
      (local.get $27)
     )
    )
    (i64.load
     (local.get $15)
    )
   )
  )
  (i64.store
   (local.get $16)
   (i64.xor
    (i64.load
     (local.get $16)
    )
    (local.get $25)
   )
  )
  (i64.store
   (local.get $17)
   (i64.xor
    (i64.load
     (local.get $17)
    )
    (local.get $25)
   )
  )
  (i64.store
   (local.get $18)
   (i64.xor
    (i64.load
     (local.get $18)
    )
    (local.get $25)
   )
  )
  (i64.store
   (local.get $19)
   (i64.xor
    (i64.load
     (local.get $19)
    )
    (local.get $25)
   )
  )
 )
 (func $3 (; 3 ;) (type $4) (param $0 i32) (param $1 i32)
  (local $2 i32)
  (local $3 i32)
  (loop $label$1
   (if
    (i32.eqz
     (i32.ge_u
      (local.get $2)
      (i32.const 24)
     )
    )
    (block
     (i64.store
      (local.tee $3
       (i32.add
        (i32.shl
         (i32.add
          (local.get $2)
          (i32.const 1)
         )
         (i32.const 3)
        )
        (local.get $0)
       )
      )
      (i64.rotl
       (i64.load
        (local.get $3)
       )
       (i64.load8_u
        (i32.add
         (local.get $1)
         (local.get $2)
        )
       )
      )
     )
     (local.set $2
      (i32.add
       (local.get $2)
       (i32.const 1)
      )
     )
     (br $label$1)
    )
   )
  )
 )
 (func $4 (; 4 ;) (type $3) (param $0 i32)
  (local $1 i32)
  (local $2 i64)
  (local.set $2
   (i64.load
    (local.tee $1
     (i32.add
      (local.get $0)
      (i32.const 8)
     )
    )
   )
  )
  (i64.store
   (local.get $1)
   (i64.load
    (local.tee $1
     (i32.add
      (local.get $0)
      (i32.const 48)
     )
    )
   )
  )
  (i64.store
   (local.get $1)
   (i64.load
    (local.tee $1
     (i32.add
      (local.get $0)
      (i32.const 72)
     )
    )
   )
  )
  (i64.store
   (local.get $1)
   (i64.load
    (local.tee $1
     (i32.add
      (local.get $0)
      (i32.const 176)
     )
    )
   )
  )
  (i64.store
   (local.get $1)
   (i64.load
    (local.tee $1
     (i32.add
      (local.get $0)
      (i32.const 112)
     )
    )
   )
  )
  (i64.store
   (local.get $1)
   (i64.load
    (local.tee $1
     (i32.add
      (local.get $0)
      (i32.const 160)
     )
    )
   )
  )
  (i64.store
   (local.get $1)
   (i64.load
    (local.tee $1
     (i32.add
      (local.get $0)
      (i32.const 16)
     )
    )
   )
  )
  (i64.store
   (local.get $1)
   (i64.load
    (local.tee $1
     (i32.add
      (local.get $0)
      (i32.const 96)
     )
    )
   )
  )
  (i64.store
   (local.get $1)
   (i64.load
    (local.tee $1
     (i32.add
      (local.get $0)
      (i32.const 104)
     )
    )
   )
  )
  (i64.store
   (local.get $1)
   (i64.load
    (local.tee $1
     (i32.add
      (local.get $0)
      (i32.const 152)
     )
    )
   )
  )
  (i64.store
   (local.get $1)
   (i64.load
    (local.tee $1
     (i32.add
      (local.get $0)
      (i32.const 184)
     )
    )
   )
  )
  (i64.store
   (local.get $1)
   (i64.load
    (local.tee $1
     (i32.add
      (local.get $0)
      (i32.const 120)
     )
    )
   )
  )
  (i64.store
   (local.get $1)
   (i64.load
    (local.tee $1
     (i32.add
      (local.get $0)
      (i32.const 32)
     )
    )
   )
  )
  (i64.store
   (local.get $1)
   (i64.load
    (local.tee $1
     (i32.add
      (local.get $0)
      (i32.const 192)
     )
    )
   )
  )
  (i64.store
   (local.get $1)
   (i64.load
    (local.tee $1
     (i32.add
      (local.get $0)
      (i32.const 168)
     )
    )
   )
  )
  (i64.store
   (local.get $1)
   (i64.load
    (local.tee $1
     (i32.sub
      (local.get $0)
      (i32.const -64)
     )
    )
   )
  )
  (i64.store
   (local.get $1)
   (i64.load
    (local.tee $1
     (i32.add
      (local.get $0)
      (i32.const 128)
     )
    )
   )
  )
  (i64.store
   (local.get $1)
   (i64.load
    (local.tee $1
     (i32.add
      (local.get $0)
      (i32.const 40)
     )
    )
   )
  )
  (i64.store
   (local.get $1)
   (i64.load
    (local.tee $1
     (i32.add
      (local.get $0)
      (i32.const 24)
     )
    )
   )
  )
  (i64.store
   (local.get $1)
   (i64.load
    (local.tee $1
     (i32.add
      (local.get $0)
      (i32.const 144)
     )
    )
   )
  )
  (i64.store
   (local.get $1)
   (i64.load
    (local.tee $1
     (i32.add
      (local.get $0)
      (i32.const 136)
     )
    )
   )
  )
  (i64.store
   (local.get $1)
   (i64.load
    (local.tee $1
     (i32.add
      (local.get $0)
      (i32.const 88)
     )
    )
   )
  )
  (i64.store
   (local.get $1)
   (i64.load
    (local.tee $1
     (i32.add
      (local.get $0)
      (i32.const 56)
     )
    )
   )
  )
  (i64.store
   (local.get $1)
   (i64.load
    (local.tee $0
     (i32.add
      (local.get $0)
      (i32.const 80)
     )
    )
   )
  )
  (i64.store
   (local.get $0)
   (local.get $2)
  )
 )
 (func $5 (; 5 ;) (type $3) (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i64)
  (local $5 i64)
  (loop $label$1
   (if
    (i32.eqz
     (i32.ge_u
      (local.get $2)
      (i32.const 25)
     )
    )
    (block
     (local.set $4
      (i64.load
       (local.tee $1
        (i32.add
         (i32.shl
          (local.get $2)
          (i32.const 3)
         )
         (local.get $0)
        )
       )
      )
     )
     (i64.store
      (local.get $1)
      (i64.xor
       (i64.load
        (local.get $1)
       )
       (i64.and
        (i64.load
         (local.tee $1
          (i32.add
           (i32.shl
            (i32.add
             (local.get $2)
             (i32.const 2)
            )
            (i32.const 3)
           )
           (local.get $0)
          )
         )
        )
        (i64.xor
         (local.tee $5
          (i64.load
           (local.tee $3
            (i32.add
             (i32.shl
              (i32.add
               (local.get $2)
               (i32.const 1)
              )
              (i32.const 3)
             )
             (local.get $0)
            )
           )
          )
         )
         (i64.const -1)
        )
       )
      )
     )
     (i64.store
      (local.get $3)
      (i64.xor
       (i64.load
        (local.get $3)
       )
       (i64.and
        (i64.load
         (local.tee $3
          (i32.add
           (i32.shl
            (i32.add
             (local.get $2)
             (i32.const 3)
            )
            (i32.const 3)
           )
           (local.get $0)
          )
         )
        )
        (i64.xor
         (i64.load
          (local.get $1)
         )
         (i64.const -1)
        )
       )
      )
     )
     (i64.store
      (local.get $1)
      (i64.xor
       (i64.load
        (local.get $1)
       )
       (i64.and
        (i64.load
         (local.tee $1
          (i32.add
           (i32.shl
            (i32.add
             (local.get $2)
             (i32.const 4)
            )
            (i32.const 3)
           )
           (local.get $0)
          )
         )
        )
        (i64.xor
         (i64.load
          (local.get $3)
         )
         (i64.const -1)
        )
       )
      )
     )
     (i64.store
      (local.get $3)
      (i64.xor
       (i64.load
        (local.get $3)
       )
       (i64.and
        (i64.xor
         (i64.load
          (local.get $1)
         )
         (i64.const -1)
        )
        (local.get $4)
       )
      )
     )
     (i64.store
      (local.get $1)
      (i64.xor
       (i64.load
        (local.get $1)
       )
       (i64.and
        (i64.xor
         (local.get $4)
         (i64.const -1)
        )
        (local.get $5)
       )
      )
     )
     (local.set $2
      (i32.add
       (local.get $2)
       (i32.const 5)
      )
     )
     (br $label$1)
    )
   )
  )
 )
 (func $6 (; 6 ;) (type $3) (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local.set $2
   (i32.add
    (local.get $0)
    (i32.const 400)
   )
  )
  (local.set $3
   (i32.add
    (local.get $0)
    (i32.const 592)
   )
  )
  (loop $label$1
   (if
    (i32.eqz
     (i32.ge_u
      (local.get $1)
      (i32.const 24)
     )
    )
    (block
     (call $2
      (local.get $0)
     )
     (call $3
      (local.get $0)
      (local.get $3)
     )
     (call $4
      (local.get $0)
     )
     (call $5
      (local.get $0)
     )
     (i64.store
      (local.get $0)
      (i64.xor
       (i64.load
        (local.get $0)
       )
       (i64.load
        (i32.add
         (i32.shl
          (local.get $1)
          (i32.const 3)
         )
         (local.get $2)
        )
       )
      )
     )
     (local.set $1
      (i32.add
       (local.get $1)
       (i32.const 1)
      )
     )
     (br $label$1)
    )
   )
  )
 )
 (func $7 (; 7 ;) (type $7) (param $0 i32) (param $1 i32)
  (local $2 i32)
  (i64.store
   (local.get $1)
   (i64.xor
    (i64.load
     (local.get $1)
    )
    (i64.load
     (local.get $0)
    )
   )
  )
  (i64.store
   (local.tee $2
    (i32.add
     (local.get $1)
     (i32.const 8)
    )
   )
   (i64.xor
    (i64.load
     (local.get $2)
    )
    (i64.load
     (i32.add
      (local.get $0)
      (i32.const 8)
     )
    )
   )
  )
  (i64.store
   (local.tee $2
    (i32.add
     (local.get $1)
     (i32.const 16)
    )
   )
   (i64.xor
    (i64.load
     (local.get $2)
    )
    (i64.load
     (i32.add
      (local.get $0)
      (i32.const 16)
     )
    )
   )
  )
  (i64.store
   (local.tee $2
    (i32.add
     (local.get $1)
     (i32.const 24)
    )
   )
   (i64.xor
    (i64.load
     (local.get $2)
    )
    (i64.load
     (i32.add
      (local.get $0)
      (i32.const 24)
     )
    )
   )
  )
  (i64.store
   (local.tee $2
    (i32.add
     (local.get $1)
     (i32.const 32)
    )
   )
   (i64.xor
    (i64.load
     (local.get $2)
    )
    (i64.load
     (i32.add
      (local.get $0)
      (i32.const 32)
     )
    )
   )
  )
  (i64.store
   (local.tee $2
    (i32.add
     (local.get $1)
     (i32.const 40)
    )
   )
   (i64.xor
    (i64.load
     (local.get $2)
    )
    (i64.load
     (i32.add
      (local.get $0)
      (i32.const 40)
     )
    )
   )
  )
  (i64.store
   (local.tee $2
    (i32.add
     (local.get $1)
     (i32.const 48)
    )
   )
   (i64.xor
    (i64.load
     (local.get $2)
    )
    (i64.load
     (i32.add
      (local.get $0)
      (i32.const 48)
     )
    )
   )
  )
  (i64.store
   (local.tee $2
    (i32.add
     (local.get $1)
     (i32.const 56)
    )
   )
   (i64.xor
    (i64.load
     (local.get $2)
    )
    (i64.load
     (i32.add
      (local.get $0)
      (i32.const 56)
     )
    )
   )
  )
  (i64.store
   (local.tee $2
    (i32.sub
     (local.get $1)
     (i32.const -64)
    )
   )
   (i64.xor
    (i64.load
     (local.get $2)
    )
    (i64.load
     (i32.sub
      (local.get $0)
      (i32.const -64)
     )
    )
   )
  )
  (i64.store
   (local.tee $2
    (i32.add
     (local.get $1)
     (i32.const 72)
    )
   )
   (i64.xor
    (i64.load
     (local.get $2)
    )
    (i64.load
     (i32.add
      (local.get $0)
      (i32.const 72)
     )
    )
   )
  )
  (i64.store
   (local.tee $2
    (i32.add
     (local.get $1)
     (i32.const 80)
    )
   )
   (i64.xor
    (i64.load
     (local.get $2)
    )
    (i64.load
     (i32.add
      (local.get $0)
      (i32.const 80)
     )
    )
   )
  )
  (i64.store
   (local.tee $2
    (i32.add
     (local.get $1)
     (i32.const 88)
    )
   )
   (i64.xor
    (i64.load
     (local.get $2)
    )
    (i64.load
     (i32.add
      (local.get $0)
      (i32.const 88)
     )
    )
   )
  )
  (i64.store
   (local.tee $2
    (i32.add
     (local.get $1)
     (i32.const 96)
    )
   )
   (i64.xor
    (i64.load
     (local.get $2)
    )
    (i64.load
     (i32.add
      (local.get $0)
      (i32.const 96)
     )
    )
   )
  )
  (i64.store
   (local.tee $2
    (i32.add
     (local.get $1)
     (i32.const 104)
    )
   )
   (i64.xor
    (i64.load
     (local.get $2)
    )
    (i64.load
     (i32.add
      (local.get $0)
      (i32.const 104)
     )
    )
   )
  )
  (i64.store
   (local.tee $2
    (i32.add
     (local.get $1)
     (i32.const 112)
    )
   )
   (i64.xor
    (i64.load
     (local.get $2)
    )
    (i64.load
     (i32.add
      (local.get $0)
      (i32.const 112)
     )
    )
   )
  )
  (i64.store
   (local.tee $2
    (i32.add
     (local.get $1)
     (i32.const 120)
    )
   )
   (i64.xor
    (i64.load
     (local.get $2)
    )
    (i64.load
     (i32.add
      (local.get $0)
      (i32.const 120)
     )
    )
   )
  )
  (i64.store
   (local.tee $2
    (i32.add
     (local.get $1)
     (i32.const 128)
    )
   )
   (i64.xor
    (i64.load
     (local.get $2)
    )
    (i64.load
     (i32.add
      (local.get $0)
      (i32.const 128)
     )
    )
   )
  )
  (call $6
   (local.get $1)
  )
 )
 (func $8 (; 8 ;) (type $3) (param $0 i32)
  (local $1 i32)
  (call $1
   (local.get $0)
   (i32.const 400)
  )
  (i64.store
   (local.tee $1
    (i32.add
     (local.get $0)
     (i32.const 400)
    )
   )
   (i64.const 1)
  )
  (i64.store
   (i32.add
    (local.get $1)
    (i32.const 8)
   )
   (i64.const 32898)
  )
  (i64.store
   (i32.add
    (local.get $1)
    (i32.const 16)
   )
   (i64.const -9223372036854742902)
  )
  (i64.store
   (i32.add
    (local.get $1)
    (i32.const 24)
   )
   (i64.const -9223372034707259392)
  )
  (i64.store
   (i32.add
    (local.get $1)
    (i32.const 32)
   )
   (i64.const 32907)
  )
  (i64.store
   (i32.add
    (local.get $1)
    (i32.const 40)
   )
   (i64.const 2147483649)
  )
  (i64.store
   (i32.add
    (local.get $1)
    (i32.const 48)
   )
   (i64.const -9223372034707259263)
  )
  (i64.store
   (i32.add
    (local.get $1)
    (i32.const 56)
   )
   (i64.const -9223372036854743031)
  )
  (i64.store
   (i32.sub
    (local.get $1)
    (i32.const -64)
   )
   (i64.const 138)
  )
  (i64.store
   (i32.add
    (local.get $1)
    (i32.const 72)
   )
   (i64.const 136)
  )
  (i64.store
   (i32.add
    (local.get $1)
    (i32.const 80)
   )
   (i64.const 2147516425)
  )
  (i64.store
   (i32.add
    (local.get $1)
    (i32.const 88)
   )
   (i64.const 2147483658)
  )
  (i64.store
   (i32.add
    (local.get $1)
    (i32.const 96)
   )
   (i64.const 2147516555)
  )
  (i64.store
   (i32.add
    (local.get $1)
    (i32.const 104)
   )
   (i64.const -9223372036854775669)
  )
  (i64.store
   (i32.add
    (local.get $1)
    (i32.const 112)
   )
   (i64.const -9223372036854742903)
  )
  (i64.store
   (i32.add
    (local.get $1)
    (i32.const 120)
   )
   (i64.const -9223372036854743037)
  )
  (i64.store
   (i32.add
    (local.get $1)
    (i32.const 128)
   )
   (i64.const -9223372036854743038)
  )
  (i64.store
   (i32.add
    (local.get $1)
    (i32.const 136)
   )
   (i64.const -9223372036854775680)
  )
  (i64.store
   (i32.add
    (local.get $1)
    (i32.const 144)
   )
   (i64.const 32778)
  )
  (i64.store
   (i32.add
    (local.get $1)
    (i32.const 152)
   )
   (i64.const -9223372034707292150)
  )
  (i64.store
   (i32.add
    (local.get $1)
    (i32.const 160)
   )
   (i64.const -9223372034707259263)
  )
  (i64.store
   (i32.add
    (local.get $1)
    (i32.const 168)
   )
   (i64.const -9223372036854742912)
  )
  (i64.store
   (i32.add
    (local.get $1)
    (i32.const 176)
   )
   (i64.const 2147483649)
  )
  (i64.store
   (i32.add
    (local.get $1)
    (i32.const 184)
   )
   (i64.const -9223372034707259384)
  )
  (i32.store8
   (local.tee $0
    (i32.add
     (local.get $0)
     (i32.const 592)
    )
   )
   (i32.const 1)
  )
  (i32.store8
   (i32.add
    (local.get $0)
    (i32.const 1)
   )
   (i32.const 62)
  )
  (i32.store8
   (i32.add
    (local.get $0)
    (i32.const 2)
   )
   (i32.const 28)
  )
  (i32.store8
   (i32.add
    (local.get $0)
    (i32.const 3)
   )
   (i32.const 27)
  )
  (i32.store8
   (i32.add
    (local.get $0)
    (i32.const 4)
   )
   (i32.const 36)
  )
  (i32.store8
   (i32.add
    (local.get $0)
    (i32.const 5)
   )
   (i32.const 44)
  )
  (i32.store8
   (i32.add
    (local.get $0)
    (i32.const 6)
   )
   (i32.const 6)
  )
  (i32.store8
   (i32.add
    (local.get $0)
    (i32.const 7)
   )
   (i32.const 55)
  )
  (i32.store8
   (i32.add
    (local.get $0)
    (i32.const 8)
   )
   (i32.const 20)
  )
  (i32.store8
   (i32.add
    (local.get $0)
    (i32.const 9)
   )
   (i32.const 3)
  )
  (i32.store8
   (i32.add
    (local.get $0)
    (i32.const 10)
   )
   (i32.const 10)
  )
  (i32.store8
   (i32.add
    (local.get $0)
    (i32.const 11)
   )
   (i32.const 43)
  )
  (i32.store8
   (i32.add
    (local.get $0)
    (i32.const 12)
   )
   (i32.const 25)
  )
  (i32.store8
   (i32.add
    (local.get $0)
    (i32.const 13)
   )
   (i32.const 39)
  )
  (i32.store8
   (i32.add
    (local.get $0)
    (i32.const 14)
   )
   (i32.const 41)
  )
  (i32.store8
   (i32.add
    (local.get $0)
    (i32.const 15)
   )
   (i32.const 45)
  )
  (i32.store8
   (i32.add
    (local.get $0)
    (i32.const 16)
   )
   (i32.const 15)
  )
  (i32.store8
   (i32.add
    (local.get $0)
    (i32.const 17)
   )
   (i32.const 21)
  )
  (i32.store8
   (i32.add
    (local.get $0)
    (i32.const 18)
   )
   (i32.const 8)
  )
  (i32.store8
   (i32.add
    (local.get $0)
    (i32.const 19)
   )
   (i32.const 18)
  )
  (i32.store8
   (i32.add
    (local.get $0)
    (i32.const 20)
   )
   (i32.const 2)
  )
  (i32.store8
   (i32.add
    (local.get $0)
    (i32.const 21)
   )
   (i32.const 61)
  )
  (i32.store8
   (i32.add
    (local.get $0)
    (i32.const 22)
   )
   (i32.const 56)
  )
  (i32.store8
   (i32.add
    (local.get $0)
    (i32.const 23)
   )
   (i32.const 14)
  )
 )
 (func $9 (; 9 ;) (type $2) (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local.set $5
   (i32.add
    (local.get $0)
    (i32.const 208)
   )
  )
  (if
   (local.tee $3
    (i32.load
     (local.tee $6
      (i32.add
       (local.get $0)
       (i32.const 200)
      )
     )
    )
   )
   (block
    (call $0
     (i32.add
      (local.get $3)
      (local.get $5)
     )
     (block (result i32)
      (local.set $7
       (local.get $1)
      )
      (if
       (i32.lt_u
        (local.get $2)
        (local.tee $4
         (i32.sub
          (i32.const 136)
          (local.get $3)
         )
        )
       )
       (local.set $4
        (local.get $2)
       )
      )
      (local.get $7)
     )
     (local.get $4)
    )
    (if
     (i32.eq
      (local.tee $3
       (i32.add
        (local.get $3)
        (local.get $4)
       )
      )
      (i32.const 136)
     )
     (call $7
      (local.get $1)
      (local.get $0)
     )
     (local.set $3
      (i32.const 0)
     )
    )
    (i32.store
     (local.get $6)
     (local.get $3)
    )
    (local.set $2
     (i32.sub
      (local.get $2)
      (local.get $4)
     )
    )
   )
  )
  (loop $label$5
   (if
    (i32.eqz
     (i32.lt_u
      (local.get $2)
      (i32.const 136)
     )
    )
    (block
     (call $7
      (local.get $1)
      (local.get $0)
     )
     (local.set $1
      (i32.add
       (local.get $1)
       (i32.const 136)
      )
     )
     (local.set $2
      (i32.sub
       (local.get $2)
       (i32.const 136)
      )
     )
     (br $label$5)
    )
   )
  )
  (if
   (i32.gt_u
    (local.get $2)
    (i32.const 0)
   )
   (block
    (call $0
     (i32.add
      (local.get $3)
      (local.get $5)
     )
     (local.get $1)
     (local.get $2)
    )
    (i32.store
     (local.get $6)
     (i32.add
      (local.get $2)
      (local.get $3)
     )
    )
   )
  )
 )
 (func $10 (; 10 ;) (type $4) (param $0 i32) (param $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (call $1
   (local.tee $2
    (i32.add
     (local.tee $3
      (i32.add
       (local.get $0)
       (i32.const 208)
      )
     )
     (local.tee $4
      (i32.load
       (i32.add
        (local.get $0)
        (i32.const 200)
       )
      )
     )
    )
   )
   (i32.sub
    (i32.const 136)
    (local.get $4)
   )
  )
  (i32.store8
   (local.get $2)
   (i32.or
    (i32.load8_u
     (local.get $2)
    )
    (i32.const 1)
   )
  )
  (i32.store8
   (local.tee $2
    (i32.add
     (local.get $3)
     (i32.const 135)
    )
   )
   (i32.or
    (i32.load8_u
     (local.get $2)
    )
    (i32.const 128)
   )
  )
  (call $7
   (local.get $3)
   (local.get $0)
  )
  (i64.store
   (local.get $1)
   (i64.load
    (local.get $0)
   )
  )
  (i64.store
   (i32.add
    (local.get $1)
    (i32.const 8)
   )
   (i64.load
    (i32.add
     (local.get $0)
     (i32.const 8)
    )
   )
  )
  (i64.store
   (i32.add
    (local.get $1)
    (i32.const 16)
   )
   (i64.load
    (i32.add
     (local.get $0)
     (i32.const 16)
    )
   )
  )
  (i64.store
   (i32.add
    (local.get $1)
    (i32.const 24)
   )
   (i64.load
    (i32.add
     (local.get $0)
     (i32.const 24)
    )
   )
  )
 )
 (func $11 (; 11 ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (i32.and
   (local.get $0)
   (local.get $1)
  )
 )
 (func $12 (; 12 ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (i32.add
   (local.get $0)
   (local.get $1)
  )
 )
 (func $13 (; 13 ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (i32.sub
   (local.get $0)
   (local.get $1)
  )
 )
 (func $14 (; 14 ;) (type $0) (param $0 i32) (result i32)
  (i32.xor
   (local.get $0)
   (i32.const -1)
  )
 )
 (func $15 (; 15 ;) (type $1) (param $0 i32) (param $1 i32) (result i32)
  (i32.shl
   (local.get $0)
   (local.get $1)
  )
 )
 (func $16 (; 16 ;) (type $5) (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (result i32)
  (call $8
   (local.get $0)
  )
  (call $9
   (local.get $0)
   (local.get $1)
   (local.get $2)
  )
  (call $10
   (local.get $0)
   (local.get $3)
  )
  (local.get $3)
 )
 (func $17 (; 17 ;) (type $6)
  (global.set $global$0
   (i32.const 3)
  )
  (global.set $global$1
   (call $15
    (i32.const 1)
    (global.get $global$0)
   )
  )
  (global.set $global$2
   (call $13
    (global.get $global$1)
    (i32.const 1)
   )
  )
  (global.set $global$3
   (call $15
    (i32.const 1)
    (i32.const 30)
   )
  )
  (global.set $global$4
   (i32.const 0)
  )
  (global.set $global$5
   (call $11
    (call $12
     (global.get $global$4)
     (global.get $global$2)
    )
    (call $14
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
