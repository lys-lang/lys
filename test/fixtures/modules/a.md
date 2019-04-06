---
{
  ENTRY_POINT: src::main,
  ASSERT_MODULE: src::main,
  ASSERT_MODULE: lib::main,
  ASSERT_MODULE: lib::functions,
  ASSERT_MODULE: lib::types
}
---

# Test

# Project

#### src/main.lys

```lys
fun x(): i32 = lib::main::test(lib::types::Some(1))
```

#### lib/main.lys

```lys
import lib::functions
import lib::types

fun test(a: Some): i32 = getValueOf(a)
```

#### lib/functions.lys

```lys
fun getValueOf(a: lib::types::Some): i32 = a.value
```

#### lib/types.lys

```lys
struct Some(value: i32)
```
