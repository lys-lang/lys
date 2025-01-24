(module
 (type $0 (func))
 (type $1 (func (param i32)))
 (type $2 (func (result i32)))
 (type $3 (func (param f32)))
 (type $4 (func (param i32 i32)))
 (type $5 (func (param i32) (result i32)))
 (type $6 (func (param i32 i64)))
 (type $7 (func (param i64) (result i32)))
 (import "test" "printNumber" (func $fimport$0 (param f32)))
 (import "test" "printNumber" (func $fimport$1 (param i32)))
 (import "test" "pushTest" (func $fimport$2 (param i32)))
 (import "test" "registerAssertion" (func $fimport$3 (param i32 i32)))
 (import "test" "popTest" (func $fimport$4))
 (global $global$0 (mut i32) (i32.const 0))
 (global $global$1 (mut i32) (i32.const 0))
 (global $global$2 (mut i32) (i32.const 0))
 (global $global$3 (mut i64) (i64.const 0))
 (memory $0 1)
 (data $0 (i32.const 266) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data $1 (i32.const 293) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data $2 (i32.const 326) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data $3 (i32.const 353) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data $4 (i32.const 386) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data $5 (i32.const 421) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data $6 (i32.const 462) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data $7 (i32.const 497) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data $8 (i32.const 538) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00L\00S\00B\00:\00 \00%\00X")
 (data $9 (i32.const 573) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00L\00S\00B\00:\00 \00%\00X")
 (data $10 (i32.const 614) "\1e\00\00\00 \00 \00g\00i\00v\00e\00n\00 \00M\00S\00B\00:\00 \00%\00X")
 (data $11 (i32.const 649) "$\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00 \00M\00S\00B\00:\00 \00%\00X")
 (data $12 (i32.const 690) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00X")
 (data $13 (i32.const 717) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00X")
 (data $14 (i32.const 750) "\16\00\00\00 \00 \00g\00i\00v\00e\00n\00:\00 \00%\00d")
 (data $15 (i32.const 777) "\1c\00\00\00 \00 \00e\00x\00p\00e\00c\00t\00e\00d\00:\00 \00%\00d")
 (data $16 (i32.const 810) "\1a\00\00\00a\00s\00s\00e\00r\00t\00(\00f\00a\00l\00s\00e\00)")
 (data $17 (i32.const 224) "\08\00\00\00t\00r\00u\00e")
 (data $18 (i32.const 237) "\n\00\00\00f\00a\00l\00s\00e")
 (data $19 (i32.const 252) "\02\00\00\000")
 (data $20 (i32.const 259) "\02\00\00\000")
 (data $21 (i32.const 16) ",\00\00\00s\00t\00r\00u\00c\00t\00 \00v\00a\00l\00u\00e\00s\00 \00e\00x\00t\00e\00n\00d\00e\00d")
 (data $22 (i32.const 65) "\02\00\00\00A")
 (data $23 (i32.const 72) "\02\00\00\00B")
 (data $24 (i32.const 79) "\02\00\00\00C")
 (data $25 (i32.const 86) "\02\00\00\00D")
 (data $26 (i32.const 93) "\02\00\00\00E")
 (data $27 (i32.const 100) "\02\00\00\00F")
 (data $28 (i32.const 107) "\02\00\00\00G")
 (data $29 (i32.const 114) "\02\00\00\00H")
 (data $30 (i32.const 121) "\02\00\00\00I")
 (data $31 (i32.const 128) "\02\00\00\00J")
 (data $32 (i32.const 135) "\02\00\00\00K")
 (data $33 (i32.const 142) "\02\00\00\00L")
 (data $34 (i32.const 149) "\02\00\00\00M")
 (data $35 (i32.const 156) "\02\00\00\00N")
 (data $36 (i32.const 163) "\02\00\00\00\d1")
 (data $37 (i32.const 170) "\02\00\00\00O")
 (data $38 (i32.const 177) "\02\00\00\00P")
 (data $39 (i32.const 184) "\02\00\00\00Q")
 (data $40 (i32.const 191) "\02\00\00\00V")
 (data $41 (i32.const 198) "\02\00\00\00W")
 (data $42 (i32.const 205) "\02\00\00\00X")
 (data $43 (i32.const 212) "\02\00\00\00Y")
 (export "memory" (memory $0))
 (export "test_getMaxMemory" (func $0))
 (export "test_getLastErrorMessage" (func $2))
 (export "main" (func $5))
 (start $6)
 (func $0 (result i32)
  (global.get $global$2)
 )
 (func $1 (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (if
   (i32.eqz
    (local.get $0)
   )
   (then
    (unreachable)
   )
  )
  (if
   (i32.lt_u
    (global.get $global$1)
    (local.get $0)
   )
   (then
    (unreachable)
   )
  )
  (if
   (i32.gt_u
    (local.tee $2
     (i32.and
      (i32.add
       (global.get $global$0)
       (i32.add
        (i32.add
         (local.tee $1
          (global.get $global$2)
         )
         (i32.const 16)
        )
        (select
         (i32.const 16)
         (local.get $0)
         (i32.le_u
          (local.get $0)
          (i32.const 16)
         )
        )
       )
      )
      (i32.xor
       (global.get $global$0)
       (i32.const -1)
      )
     )
    )
    (i32.shl
     (local.tee $3
      (memory.size)
     )
     (i32.const 16)
    )
   )
   (then
    (drop
     (memory.grow
      (select
       (local.get $3)
       (local.tee $4
        (i32.shr_s
         (i32.and
          (i32.add
           (i32.sub
            (local.get $2)
            (local.get $1)
           )
           (i32.const 65535)
          )
          (i32.const -65536)
         )
         (i32.const 16)
        )
       )
       (i32.gt_u
        (local.get $3)
        (local.get $4)
       )
      )
     )
    )
   )
  )
  (global.set $global$2
   (local.get $2)
  )
  (local.set $0
   (i32.add
    (local.get $0)
    (local.tee $1
     (local.tee $2
      (i32.add
       (local.get $1)
       (i32.const 16)
      )
     )
    )
   )
  )
  (loop $label
   (if
    (i32.ne
     (local.get $0)
     (local.get $1)
    )
    (then
     (i32.store8
      (local.get $1)
      (i32.load8_u
       (i32.const 0)
      )
     )
     (local.set $1
      (i32.add
       (local.get $1)
       (i32.const 1)
      )
     )
     (br $label)
    )
   )
  )
  (local.get $2)
 )
 (func $2 (result i32)
  (local $0 i64)
  (if (result i32)
   (i32.eq
    (i32.wrap_i64
     (i64.shr_u
      (local.tee $0
       (global.get $global$3)
      )
      (i64.const 32)
     )
    )
    (i32.const 3)
   )
   (then
    (i32.wrap_i64
     (i64.load
      (i32.wrap_i64
       (local.get $0)
      )
     )
    )
   )
   (else
    (i32.const 0)
   )
  )
 )
 (func $3 (param $0 i32) (param $1 i64)
  (call $fimport$3
   (local.get $0)
   (i32.wrap_i64
    (local.get $1)
   )
  )
 )
 (func $4 (param $0 i64) (result i32)
  (local $1 i32)
  (i32.or
   (i32.eq
    (local.tee $1
     (i32.wrap_i64
      (i64.shr_u
       (local.get $0)
       (i64.const 32)
      )
     )
    )
    (i32.const 5)
   )
   (i32.or
    (i32.or
     (i32.or
      (i32.eq
       (local.get $1)
       (i32.const 1)
      )
      (i32.eq
       (local.get $1)
       (i32.const 2)
      )
     )
     (i32.eq
      (local.get $1)
      (i32.const 3)
     )
    )
    (i32.eq
     (local.get $1)
     (i32.const 4)
    )
   )
  )
 )
 (func $5
  (local $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i64)
  (call $fimport$2
   (i32.const 16)
  )
  (i32.store
   (i32.wrap_i64
    (local.tee $7
     (i64.or
      (i64.extend_i32_u
       (call $1
        (i32.const 41)
       )
      )
      (i64.const 25769803776)
     )
    )
   )
   (i32.const 1)
  )
  (i32.store8
   (i32.add
    (local.tee $0
     (i32.wrap_i64
      (local.get $7)
     )
    )
    (i32.const 4)
   )
   (i32.const 1)
  )
  (f32.store
   (local.tee $2
    (i32.add
     (local.get $0)
     (i32.const 5)
    )
   )
   (f32.const 3)
  )
  (i64.store
   (local.tee $4
    (i32.add
     (local.get $0)
     (i32.const 9)
    )
   )
   (i64.const 8)
  )
  (f64.store
   (local.tee $5
    (i32.add
     (local.get $0)
     (i32.const 17)
    )
   )
   (f64.const 0.4000000059604645)
  )
  (i64.store
   (local.tee $1
    (i32.add
     (local.get $0)
     (i32.const 25)
    )
   )
   (i64.const 8589934592)
  )
  (i64.store
   (local.tee $3
    (i32.add
     (local.get $0)
     (i32.const 33)
    )
   )
   (i64.const 8589934592)
  )
  (call $3
   (i32.eq
    (i32.wrap_i64
     (i64.shr_u
      (local.get $7)
      (i64.const 32)
     )
    )
    (i32.const 6)
   )
   (i64.const 12884901953)
  )
  (call $3
   (i32.eq
    (i32.load
     (local.get $0)
    )
    (i32.const 1)
   )
   (i64.const 12884901960)
  )
  (call $3
   (i32.ne
    (i32.load8_u
     (local.tee $6
      (i32.add
       (local.get $0)
       (i32.const 4)
      )
     )
    )
    (i32.const 0)
   )
   (i64.const 12884901967)
  )
  (call $3
   (f32.eq
    (f32.load
     (local.get $2)
    )
    (f32.const 3)
   )
   (i64.const 12884901974)
  )
  (call $3
   (i64.eq
    (i64.load
     (local.get $4)
    )
    (i64.const 8)
   )
   (i64.const 12884901981)
  )
  (call $3
   (f64.eq
    (f64.load
     (local.get $5)
    )
    (f64.const 0.4000000059604645)
   )
   (i64.const 12884901988)
  )
  (call $3
   (i32.eq
    (i32.wrap_i64
     (i64.shr_u
      (i64.load
       (local.get $1)
      )
      (i64.const 32)
     )
    )
    (i32.const 2)
   )
   (i64.const 12884901995)
  )
  (call $3
   (i32.eq
    (i32.wrap_i64
     (i64.shr_u
      (i64.load
       (local.get $3)
      )
      (i64.const 32)
     )
    )
    (i32.const 2)
   )
   (i64.const 12884902002)
  )
  (call $3
   (call $4
    (i64.load
     (local.get $1)
    )
   )
   (i64.const 12884902009)
  )
  (call $3
   (call $4
    (i64.load
     (local.get $3)
    )
   )
   (i64.const 12884902016)
  )
  (i32.store
   (local.get $0)
   (i32.const 5)
  )
  (i32.store8
   (local.get $6)
   (i32.const 0)
  )
  (f32.store
   (local.get $2)
   (f32.const -999)
  )
  (i64.store
   (local.get $4)
   (i64.const 3735928559)
  )
  (f64.store
   (local.get $5)
   (f64.const 608000000925854355947520)
  )
  (call $fimport$0
   (f32.load
    (local.get $2)
   )
  )
  (i32.store
   (i32.wrap_i64
    (local.tee $7
     (i64.or
      (i64.extend_i32_u
       (call $1
        (i32.const 4)
       )
      )
      (i64.const 21474836480)
     )
    )
   )
   (i32.const 333)
  )
  (i64.store
   (local.get $1)
   (local.get $7)
  )
  (call $fimport$0
   (f32.load
    (local.get $2)
   )
  )
  (i64.store
   (local.get $3)
   (i64.const 4294967296)
  )
  (call $fimport$1
   (i32.const 0)
  )
  (call $fimport$1
   (i32.load
    (local.get $0)
   )
  )
  (call $3
   (i32.eq
    (i32.load
     (local.get $0)
    )
    (i32.const 5)
   )
   (i64.const 12884902023)
  )
  (call $fimport$1
   (i32.ne
    (i32.load8_u
     (local.get $6)
    )
    (i32.const 0)
   )
  )
  (call $3
   (i32.eqz
    (i32.load8_u
     (local.get $6)
    )
   )
   (i64.const 12884902030)
  )
  (call $fimport$0
   (f32.load
    (local.get $2)
   )
  )
  (call $3
   (f32.eq
    (f32.load
     (local.get $2)
    )
    (f32.const -999)
   )
   (i64.const 12884902037)
  )
  (call $3
   (i64.eq
    (i64.load
     (local.get $4)
    )
    (i64.const 3735928559)
   )
   (i64.const 12884902044)
  )
  (call $3
   (f64.eq
    (f64.load
     (local.get $5)
    )
    (f64.const 608000000925854355947520)
   )
   (i64.const 12884902051)
  )
  (call $3
   (i32.eq
    (i32.wrap_i64
     (i64.shr_u
      (i64.load
       (local.get $1)
      )
      (i64.const 32)
     )
    )
    (i32.const 5)
   )
   (i64.const 12884902058)
  )
  (call $3
   (i32.eq
    (i32.wrap_i64
     (i64.shr_u
      (i64.load
       (local.get $3)
      )
      (i64.const 32)
     )
    )
    (i32.const 1)
   )
   (i64.const 12884902065)
  )
  (call $3
   (call $4
    (i64.load
     (local.get $1)
    )
   )
   (i64.const 12884902072)
  )
  (call $3
   (call $4
    (i64.load
     (local.get $3)
    )
   )
   (i64.const 12884902079)
  )
  (call $3
   (i32.eq
    (i32.wrap_i64
     (i64.shr_u
      (i64.load
       (local.get $1)
      )
      (i64.const 32)
     )
    )
    (i32.const 5)
   )
   (i64.const 12884902086)
  )
  (block $block
   (if
    (i32.ne
     (i32.wrap_i64
      (i64.shr_u
       (local.tee $7
        (i64.load
         (local.get $1)
        )
       )
       (i64.const 32)
      )
     )
     (i32.const 5)
    )
    (then
     (call $3
      (i32.const 0)
      (i64.const 12884902100)
     )
     (br $block)
    )
   )
   (call $3
    (i32.eq
     (i32.load
      (i32.wrap_i64
       (local.get $7)
      )
     )
     (i32.const 333)
    )
    (i64.const 12884902093)
   )
  )
  (call $fimport$4)
 )
 (func $6
  (global.set $global$0
   (i32.const 15)
  )
  (global.set $global$1
   (i32.const 1073741824)
  )
  (global.set $global$2
   (i32.const 65536)
  )
  (global.set $global$3
   (i64.const 8589934592)
  )
 )
)
