# Test

Ensure that types from other modules can be accessed via fully qualified names, without implicit imports. (`lib::Some(12)`)

#### main.lys

```lys
#[export]
fun main(): i32 = lib::test(lib::Some(12))
```

#### lib.lys

```lys
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
