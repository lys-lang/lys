- VoidType functions should drop the returned value if any
  ```
   17│   fun add(): void = {
   18│     counter = counter + 1
   19│   } // "i32" is not assignable to "void"
  ```
- OR binary op should stop evaluation after the first non-zero result is yielded
- AND binary op should stop evaluation after the first zero result is yielded
