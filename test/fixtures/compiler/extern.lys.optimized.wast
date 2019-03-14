(module
 (type $0 (func (param i32 i32)))
 (type $1 (func (param i32)))
 (type $2 (func))
 (import "env" "printf" (func $fimport$0 (param i32 i32)))
 (import "env" "putchar" (func $fimport$1 (param i32)))
 (memory $0 1)
 (export "memory" (memory $0))
 (export "main" (func $0))
 (func $0 (; 2 ;) (type $2)
  (call $fimport$1
   (i32.const 0)
  )
  (call $fimport$0
   (i32.const 0)
   (i32.const 0)
  )
 )
)
