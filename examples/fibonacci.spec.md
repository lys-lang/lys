# Test

Recursive Fibonacci series. Using if and pattern matching.

#### lib/fibonacci_if.lys

```lys

private fun fibonacci(n: i64, x1: i64, x2: i64): i64 = {
  if (n > 0) {
    fibonacci(n - 1, x2, x1 + x2)
  } else {
    x1
  }
}

fun fibonacciIf(n: i64): i64 =
  fibonacci(n, 0, 1)

```

#### lib/fibonacci_match.lys

```lys

private fun fibonacci(n: i64, a: i64, b: i64): i64 =
  match n {
    case 0 -> a
    case 1 -> b
    else   -> fibonacci(n - 1, b, a + b)
  }

fun fibonacciMatch(n: i64): i64 =
  fibonacci(n, 0, 1)

```

#### main.lys

```lys
import support::test
import lib::fibonacci_if
import lib::fibonacci_match

#[export]
fun main(): void = {
  START("Recursive Fibonacci")

  mustEqual(
    fibonacciIf(46), 1836311903,
    "fibonacciIf(46) must equal 1836311903"
  )

  mustEqual(
    fibonacciMatch(46), 1836311903,
    "fibonacciMatch(46) must equal 1836311903"
  )

  END()
}
```
