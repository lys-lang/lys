# Test

Tests UCS convertion to UTF-8

#### main.lys

```lys
import support::test
import system::charset::utf8

#[export]
fun test(): void = {
  START("UTF8 Encode")

  {
    val message = "😀"
    val decoded = toUtf8(message)
    mustEqual(message[0x0], 0xd83d, "message[0] 0xd83d")
    mustEqual(message[0x1], 0xde00, "message[1] 0xde00")

    mustEqual(decoded[0x0], 0xf0, "0xf0")
    mustEqual(decoded[0x1], 0x9f, "0x9f")
    mustEqual(decoded[0x2], 0x98, "0x98")
    mustEqual(decoded[0x3], 0x80, "0x80")
    mustEqual(decoded.length, 0x5, "decoded.length == 5")
    mustEqual(message.length, 0x2, "message.length == 2")
  }

  {
    val message = "[☉,☼]"
    val decoded = toUtf8(message)
    mustEqual(decoded[0x0], 0x5b, "0x5b")
    mustEqual(decoded[0x1], 0xe2, "0xe2")
    mustEqual(decoded[0x2], 0x98, "0x98")
    mustEqual(decoded[0x3], 0x89, "0x89")
    mustEqual(decoded[0x4], 0x2c, "0x2c")
    mustEqual(decoded[0x5], 0xe2, "0xe2")
    mustEqual(decoded[0x6], 0x98, "0x98")
    mustEqual(decoded[0x7], 0xbc, "0xbc")
    mustEqual(decoded[0x8], 0x5d, "0x5d")
    mustEqual(decoded.length, 0xA, "decoded.length == 10")
  }

  // {
  //   val message = "\uD834\uDF06"
  //   val decoded = toUtf8(message)
  //   mustEqual(decoded[0x0], 0xf0, "0xf0")
  //   mustEqual(decoded[0x1], 0x9d, "0x9d")
  //   mustEqual(decoded[0x2], 0x8c, "0x8c")
  //   mustEqual(decoded[0x3], 0x86, "0x86")
  //   mustEqual(decoded.length, 0x4, "decoded.length == 4")
  // }

  // {
  //   val message = "\uD835\uDC01"
  //   val decoded = toUtf8(message)
  //   mustEqual(decoded[0x0], 0xf0, "0xf0")
  //   mustEqual(decoded[0x1], 0x9d, "0x9d")
  //   mustEqual(decoded[0x2], 0x90, "0x90")
  //   mustEqual(decoded[0x3], 0x81, "0x81")
  //   mustEqual(decoded.length, 0x4, "decoded.length == 4")
  // }

  END()
}
```
