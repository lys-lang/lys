# Test

Ensure that types from other modules can be accessed via inline fully qualified names.

This test contains a straight forward dependency tree without cycles or crossed dependencies.

#### main.lys

```lys
import support::test

import lib
import lib::types

#[export]
fun main(): void = {
  START("Test import foregin structs and functions")

  mustEqual(test(Some(12)), 12, "validate return value")

  END()
}
```

#### lib.lys

```lys
import lib::types
fun test(a: Some): i32 =
  lib::helpers::getValueOf(a)
```

#### lib/helpers.lys

```lys
import lib::types
fun getValueOf(a: Some): i32 = a.value
```

#### lib/types.lys

```lys
struct Some(value: i32)
```
