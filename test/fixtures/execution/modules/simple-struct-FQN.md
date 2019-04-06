# Test

Ensure that types from other modules can be accessed via fully qualified names. (`lib::Some(12)`)

#### main.lys

```dwl
#[export]
fun main(): i32 = lib::test(lib::Some(12))
```

#### lib.lys

```dwl
struct Some(value: i32)
fun test(a: Some): i32 = getValueOf(a)
fun getValueOf(a: Some): i32 = a.value
```

#### assertions.js

```js
getInstance => {
  if (getInstance().exports.main() != 12) {
    throw new Error('main() did not return 12');
  }
};
```
