# Test

This test ensures a a basic case of circular references is working. You can think this as an smoke test.

#### main.lys

```lys
import support::test

#[export]
fun main(): void = {
  START("Test cicular dependencies correct behavior")

  mustEqual(lib::A::test(), 2, "test case A")
  mustEqual(lib::B::test(), 1, "test case B")

  END()
}
```

#### lib/A.lys

```lys
import lib::B

fun test(): i32 = Y()

fun X(): i32 = 1
```

#### lib/B.lys

```lys
import lib::A

fun test(): i32 = X()

fun Y(): i32 = 2
```
