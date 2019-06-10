# DJB2 Hashing algorithm

http://www.cse.yorku.ca/~oz/hash.html

This algorithm `(k=33)` was first reported by dan bernstein many years ago in `comp.lang.c`. another version of this algorithm (now favored by bernstein) uses `xor: hash(i) = hash(i - 1) * 33 ^ str[i];` the magic of number `33` (why it works better than many other constants, prime or not) has never been adequately explained.

#### hash/DJB2.lys

```lys
fun DJB2(input: bytes): u64 = {
  var hash = 5381 as u64
  var i = 0 as u32

  loop {
    if (i >= input.length) break

    hash = ((hash << 5) + hash) + input[i]

    i = i + 1 as u32
    continue
  }

  hash
}

fun DJB2(input: string): u64 = {
  var hash = 5381 as u64
  var i = 0 as u32

  loop {
    if (i >= input.length) break

    hash = ((hash << 5) + hash) + input[i]

    i = i + 1 as u32
    continue
  }

  hash
}
```

#### main.lys

```lys
import support::test
import hash::DJB2
import system::core::memory

#[export]
fun main(): void = {
  START("Test hashing function")

  mustEqual(
    DJB2(bytes.fromString("")),
    5381,
    "empty string hash"
  )

  mustEqual(
    DJB2("1234567890 abcdefghijklmnopq"),
    0xE2D2EA72F299758B as u64,
    "long string hash"
  )

  {
    var mutableBytes = bytes(0 as u32)
    mustEqual(DJB2(mutableBytes), 5381, "empty mutable string hash")
  }

  {
    var mutableBytes = bytes(1 as u32)
    mutableBytes[0 as u32] = 65 as u8
    mustEqual(DJB2(mutableBytes), 177638, "[1: 65]")
  }

  {
    var mutableBytes = bytes(2 as u32)
    mutableBytes[0 as u32] = 65 as u8
    mutableBytes[1 as u32] = 99 as u8
    mustEqual(DJB2(mutableBytes), 5862153, "[2: 65 99]")
  }

  {
    var mutableBytes = bytes(256 as u32)
    mutableBytes[0 as u32] = 65 as u8
    mutableBytes[1 as u32] = 99 as u8
    mustEqual(DJB2(mutableBytes), 0xC831703075A63CC9 as u64, "[256: 65 99 00 .. 00]")
  }

  END()
}
```
