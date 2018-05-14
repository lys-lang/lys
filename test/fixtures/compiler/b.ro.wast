(module
 (type $f_i32_i32 (func (param i32) (result i32)))
 (type $f_i32_ (func (result i32)))
 (table 5 5 anyfunc)
 (elem (i32.const 0) $innerFunctionArgs $innerFunction $over $over1 $outerFunction)
 (export "outerFunction" (func $outerFunction))
 (func $innerFunctionArgs (; 0 ;) (type $f_i32_i32) (param $0 i32) (result i32)
  (return
   (get_local $0)
  )
 )
 (func $innerFunction (; 1 ;) (type $f_i32_) (result i32)
  (return
   (call $innerFunctionArgs
    (i32.const 3)
   )
  )
 )
 (func $over (; 2 ;) (type $f_i32_) (result i32)
  (return
   (i32.const 1)
  )
 )
 (func $over1 (; 3 ;) (type $f_i32_i32) (param $0 i32) (result i32)
  (return
   (get_local $0)
  )
 )
 (func $outerFunction (; 4 ;) (type $f_i32_) (result i32)
  (return
   (i32.add
    (call $innerFunction)
    (call $over)
   )
  )
 )
)
