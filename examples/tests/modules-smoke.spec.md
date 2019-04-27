# Test

This test ensures a that the simple use case for importing modules is working. The files in this test does not use the standard library.

This is a smoke test

#### main.lys

```dwl
// #![no-std]

import lib::core

#[export]
fun main(): void = {
  lib::core::X()
  lib::B::test()
}
```

#### lib/core.lys

```dwl
// #![no-std]

type i32 = %stack { lowLevelType="i32" byteSize=4 }
type boolean = %stack { lowLevelType="i32" byteSize=4 }
type void = %injected

fun X(): i32 = lib::B::Y()
```

#### lib/B.lys

```dwl
// #![no-std]

import lib::core

fun test(): i32 = X()

fun Y(): i32 = 2
```
