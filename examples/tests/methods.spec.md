# Test

This test ensures annotated methods, getters and setters are called correctly.

#### lib/iterator.lys

```lys
import lib::maybe

struct Iterator(current: i32, target: i32)

impl Iterator {
  #[method]
  fun next(self: Iterator): Maybe = {
    if (self.current <= self.target) {
      var r = Some(self.current)
      self.current = self.current + 1
      r
    } else {
      None
    }
  }
}
```

#### lib/maybe.lys

```lys
enum Maybe {
  None
  Some(value: i32)
}
```

#### main.lys

```lys
import support::test
import lib::iterator
import lib::maybe

fun test(from: i32, to: i32): i32 = {
  /**
    * This is a candidate sugar syntax for
    *
    * var ret = 0
    * for (value in Iterator(from, to)) {
    *   ret = ret + value
    * }
    */
  var ret = 0

  val $iter$ = Iterator(from, to)
  loop {
    match $iter$.next() {
      case is Some(value) -> {
        ret = ret + value

        continue
      }
      case is None -> break
    }
  }

  ret
}

#[export]
fun main(): void = {
  START("Test iterator sum, it adds every number in a range from-to")

  mustEqual(test(1, 4), 10, "first assertion")
  mustEqual(test(1, 5), 15, "second assertion")

  END()
}
```
