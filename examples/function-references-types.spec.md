# Test

This test ensures some basic assignments for function references.

#### main.lys

```lys
import support::test
import support::env

var inc = 0

enum Types {
  BoxedString(value: string)
  BoxedBytes(value: bytes)
}

fun doSomething(arg0: BoxedString | BoxedBytes): void = {
  match arg0 {
    case is BoxedString -> {
      printf("Do something was called with string")
      inc = inc + 1
    }
    case is BoxedBytes -> {
      printf("Do something was called with bytes")
      inc = inc + 2
    }
  }
}

fun formatS(input: string): BoxedString = {
  BoxedString(input)
}

fun formatB(input: string): BoxedBytes = {
  BoxedBytes(system::charset::utf8::toUtf8(input))
}

fun delegate(fn: fun(string) -> (BoxedString | BoxedBytes), x: string): void = {
  doSomething(fn(x))
}

#[export]
fun main(): void = {
  {
    START("Call delegate with a fun: string")

    var nextInc = inc + 1
    delegate(formatS, "test")
    verify(nextInc == inc, "Final function must have been called")

    END()
  }

  {
    START("Call delegate with a fun: bytes")

    var nextInc = inc + 2
    delegate(formatB, "teste")
    verify(nextInc == inc, "Final function must have been called")

    END()
  }
}
```
