# Test

This test shows how a simple use case of pattern matching and deconstruction of structs.

#### lib/Color.lys

```lys
enum Color {
  Red
  Green
  Blue
  Custom(r: i32, g: i32, b: i32)
}
```

We declare here an enum type, with 3 nullary constructors and a Custom struct.

#### lib/isRed.lys

```lys
import lib::Color

fun isRed(color: Color): boolean = {
  match color {
    case is Red -> true
    case is Custom(r, g, b) ->
      r == 255 && g == 0 && b == 0
    else -> false
  }
}
```

This function returns `true` if the color is either `Red` or `Custom(255, 0, 0)`

#### main.lys

```lys
import support::test
import lib::Color
import lib::isRed

#[export]
fun main(): void = {
  START("pattern matching with deconstruct")

  mustEqual(isRed(Red), true, "isRed(Red)")
  mustEqual(isRed(Green), false, "isRed(Green)")
  mustEqual(isRed(Blue), false, "isRed(Blue)")

  mustEqual(isRed(Custom(255,0,0)), true, "isRed(Custom(255,0,0))")
  mustEqual(isRed(Custom(0,1,3)), false, "isRed(Custom(0,1,3))")
  mustEqual(isRed(Custom(255,1,3)), false, "isRed(Custom(255,1,3))")

  END()
}
```
