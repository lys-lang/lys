# Test

Ensure that types from other modules can be accessed via inline fully qualified names.

This test contains a straight forward dependency tree without cycles or crossed dependencies.

#### main.lys

```lys
import support::test

#[export]
fun main(): void = {
  START("Test inline FQN")

  mustEqual(lib::test(lib::types::Some(12)), 12, "validate return value")

  END()
}
```

#### lib.lys

```lys
fun test(a: lib::types::Some): i32 =
  lib::helpers::getValueOf(a)
```

#### lib/helpers.lys

```lys
fun getValueOf(a: lib::types::Some): i32 = a.value
```

#### lib/types.lys

```lys
struct Some(value: i32)
```
