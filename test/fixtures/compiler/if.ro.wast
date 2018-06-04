(module
 (type $f_i32_i32_i32 (func (param i32 i32) (result i32)))
 (table 1 1 anyfunc)
 (elem (i32.const 0) $gcd)
 (export "gcd" (func $gcd))
 (func $gcd (; 0 ;) (type $f_i32_i32_i32) (param $0 i32) (param $1 i32) (result i32)
  (return
   (if (result i32)
    (i32.gt_s
     (get_local $0)
     (get_local $1)
    )
    (call $gcd
     (i32.sub
      (get_local $0)
      (get_local $1)
     )
     (get_local $1)
    )
    (call $gcd
     (i32.sub
      (get_local $0)
      (get_local $1)
     )
     (get_local $1)
    )
   )
  )
 )
)
