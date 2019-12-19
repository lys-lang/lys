# Test

Tests of the `system::string` namespace

#### main.lys

```lys
import support::test
import system::charset::utf8

#[export]
fun test(): void = {
  START("string#==")
  verify("A" == "A", "Ensure string comparation works 'A' == 'A'")
  verify("A" != "B", "Ensure string comparation works 'A' != 'B'")
  verify("" != "A", "Ensure string comparation works '' != 'A'")
  verify("A" != "", "Ensure string comparation works 'A' != ''")
  verify("" == "", "Ensure string comparation works '' == ''")

  mustEqual("A", "A", "Ensure mustEqual works with strings")
  mustEqual("", "", "Ensure mustEqual works with empty strings")
  END()

  START("string#substring")
  val str = "abcdefghijklmn"
  mustEqual(str.substring(0), "abcdefghijklmn", "substring(0) == abcdefghijklmn")
  mustEqual(str.substring(-1), "abcdefghijklmn", "substring(-1) == abcdefghijklmn")
  mustEqual(str.substring(-5), "abcdefghijklmn", "substring(-5) == abcdefghijklmn")
  mustEqual(str.substring(2, 7), "cdefg", "substring(2, 7) == cdefg")
  mustEqual(str.substring(-11, -6), "", "substring(-11, -6) == ''")
  mustEqual(str.substring(0, -1), "", "substring(0, -1) == ''")
  mustEqual(str.substring(4, 3), "d", "substring(4, 3) == d")
  mustEqual(str.substring(0, 100), "abcdefghijklmn", "substring(0, 100) == abcdefghijklmn")
  mustEqual(str.substring(4, 4), "", "substring(4, 4) == ''")
  mustEqual(str.substring(4, -3), "abcd", "substring(4, -3) == abcd")
  END()
}
```
