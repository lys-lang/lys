<p align="center"><br><br>
  <img src="https://user-images.githubusercontent.com/260114/54724904-c7e7d300-4b4b-11e9-8bbd-ec3f9044c86e.png" width="200" /><br><br><br><br></p>

[Lys](https://github.com/lys-lang/lys), a language that compiles to WebAssembly.

Read more about it [in this blog post](https://menduz.com/posts/lys-language-project/).

## Where to start?

- To learn what can be used so far: browse the [standard library](https://github.com/lys-lang/lys/tree/master/stdlib/system)
- To learn how real code looks like: browse the [execution tests](https://github.com/lys-lang/lys/tree/master/test/fixtures/execution)
- To learn how high level constructs get compiled: browse the [sugar syntax tests](https://github.com/lys-lang/lys/tree/master/test/fixtures/semantics)
- To start developing it locally, I do `make watch` and then I run the tests in other terminal with `make snapshot`
- To see an example project: browse the [keccak repo](https://github.com/lys-lang/keccak)

## Getting started

For the time being I'll use npm to distribute the language.

1. `npm i -g lys`
2. Create a folder and a file `main.lys`

   ```dwl
   import support::env

   #[export]
   fun test(): void = {
     support::test::START("This is a test suite")

     printf("Hello %X", 0xDEADBEEF)
     support::test::mustEqual(3 as u8, 3 as u16, "assertion name")

     support::test::END()
   }
   ```

3. Run `lys main.lys --test --wast`. It will create `main.wasm` `main.wast` and will run the exported function named `test`.

## How does it look?

### Structs & Implementing operators

```lys
struct Vector3(x: f32, y: f32, z: f32)

impl Vector3 {
  fun -(lhs: Vector3, rhs: Vector3): Vector3 =
    Vector3(
      lhs.x - rhs.x,
      lhs.y - rhs.y,
      lhs.z - rhs.z
    )

  #[getter]
  fun length(this: Vector3): f32 =
    f32.sqrt(
      this.x * this.x +
      this.y * this.y +
      this.z * this.z
    )
}

fun distance(from: Vector3, to: Vector3): f32 = {
  (from - to).length
}
```

### Pattern matching

```lys
// this snippet is an actual unit test

import support::test

enum Color {
  Red
  Green
  Blue
  Custom(r: i32, g: i32, b: i32)
}

fun isRed(color: Color): boolean = {
  match color {
    case is Red -> true
    case is Custom(r, g, b) -> r == 255 && g == 0 && b == 0
    else -> false
  }
}

#[export]
fun main(): void = {
  mustEqual(isRed(Red), true, "isRed(Red)")
  mustEqual(isRed(Green), false, "isRed(Green)")
  mustEqual(isRed(Blue), false, "isRed(Blue)")

  mustEqual(isRed(Custom(255,0,0)), true, "isRed(Custom(255,0,0))")
  mustEqual(isRed(Custom(0,1,3)), false, "isRed(Custom(0,1,3))")
  mustEqual(isRed(Custom(255,1,3)), false, "isRed(Custom(255,1,3))")
}
```

### Algebraic data types

```lys
// this snippet is an actual unit test

enum Tree {
  Node(value: i32, left: Tree, right: Tree)
  Empty
}

fun sum(arg: Tree): i32 = {
  match arg {
    case is Empty -> 0
    case is Node(value, left, right) -> value + sum(left) + sum(right)
  }
}

#[export]
fun main(): void = {
  val tree = Node(42, Node(3, Empty, Empty), Empty)

  support::test::mustEqual(sum(tree), 45, "sum(tree) returns 45")
}
```

### Types and overloads are created in the language itself

The compiler only knows how to emit functions and how to link function names. I did that so I had fewer things hardcoded into the compiler and allows me to write the language in the language.

To do that, I had to add either a `%wasm { ... }` code block, and a `%stack { ... }` type.

- `%wasm { ... }`: can only be used as a function body, not as an expression. It is **literally** the code that will be emited to WAST. The parameter names remain the same (prefixed with `$` as WAST indicates). Other symbols can be resolved with `fully::qualified::names`.

- `%stack { wasm="i32", size=4 }`: it is a type literal, it indicates how much memory should be allocated in structs (`size`) and what type to use in locals and function parameters (`wasm`, it needs a better name).

```lys
/** We first define the type `int` */
type int = %stack { wasm="i32", size=4 }

/** Implement some operators for the type `int` */
impl int {
  fun +(lhs: int, rhs: int): int = %wasm {
    (i32.add (get_local $lhs) (get_local $rhs))
  }
  fun -(lhs: int, rhs: int): int = %wasm {
    (i32.sub (get_local $lhs) (get_local $rhs))
  }
  fun >(lhs: int, rhs: int): boolean = %wasm {
    (i32.gt_s (get_local $lhs) (get_local $rhs))
  }
}

fun fibo(n: int, x1: int, x2: int): int = {
  if (n > 0) {
    fibo(n - 1, x2, x1 + x2)
  } else {
    x1
  }
}

#[export "fibonacci"] // "fibonacci" is the name of the exported function
fun fib(n: int): int = fibo(n, 0, 1)
```

---

## Some sugar

### Enum types

```lys
enum Tree {
  Node(value: i32, left: Tree, right: Tree)
  Empty
}
```

Is the sugar syntax for

```lys
type Tree = Node | Empty

struct Node(value: i32, left: Tree, right: Tree)
struct Empty()

impl Tree {
  fun is(lhs: Tree): boolean = lhs is Node || lhs is Empty
  // ...
}

impl Node {
  fun as(lhs: Node): Tree = %wasm { (local.get $lhs) }

  // ... many methods were removed for clarity ..
}

impl Empty {
  fun as(lhs: Node): Tree = %wasm { (local.get $lhs) }
  // ...
}

```

### `is` and `as` operators are just functions

```lys
impl u8 {
  /**
   * Given an expression with the shape:
   *
   *   something as Type
   *   ^^^^^^^^^    ^^^^
   *        $lhs    $rhs
   *
   * A function with the signature:
   *     fun as($lhs: LHSType): $rhs = ???
   *
   * Will be searched in the impl of LHSType
   *
   */


  fun as(lhs: u8): f32 = %wasm { (f32.convert_i32_u (get_local $lhs)) }
}

fun byteAsFloat(value: u8): f32 = value as f32
```

```lys
struct CustomColor(rgb: i32)

type Red = void
impl Red {
  fun is(lhs: CustomColor): boolean = match lhs {
    case is Custom(rgb) -> (rgb & 0xFF0000) == 0xFF0000
    else -> false
  }
}

var x = CustomColor(0xFF0000) is Red

// this may not be a good thing, but you get the idea
```

### There are no dragons behind the structs

The `struct` keyword is only a high level construct that creats a type and base implementation of something that behaves like a data type, normally in the heap.

```lys
struct Node(value: i32, left: Tree, right: Tree)
```

Is the sugar syntax for

```lys
// We need to keep the name and order of the fields for deconstructors

type Node = %struct { value, left, right }

impl Node {
  fun as(lhs: Node): Tree = %wasm {
    (local.get $lhs)
  }

  #[explicit]
  fun as(lhs: Node): ref = %wasm {
    (local.get $lhs)
  }

  // the discriminant is the type number assigned by the compiler
  #[inline]
  private fun Node$discriminant(): u64 = {
    val discriminant: u32 = Node.^discriminant
    discriminant as u64 << 32
  }

  // this is the function that gets called when Node is used as a function call
  fun apply(value: i32, left: Tree, right: Tree): Node = {
    // a pointer is allocated. Then using the function `fromPointer` it is converted
    // to a valid Node reference
    var $ref = fromPointer(system::core::memory::calloc(1 as u32, Node.^allocationSize))
    property$0($ref, value)
    property$1($ref, left)
    property$2($ref, right)
    $ref
  }

  // this function converts a raw address into a valid Node type
  private fun fromPointer(ptr: u32): Node = %wasm {
    (i64.or (call Node$discriminant) (i64.extend_u/i32 (local.get $ptr)))
  }

  fun ==(a: Node, b: Node): boolean = %wasm {
    (i64.eq (local.get $a) (local.get $b))
  }

  fun !=(a: Node, b: Node): boolean = %wasm {
    (i64.ne (local.get $a) (local.get $b))
  }

  #[getter]
  fun value(self: Node): i32 = property$0(self)
  #[setter]
  fun value(self: Node, value: i32): void = property$0(self, value)

  #[inline]
  private fun property$0(self: Node): i32 = i32.load(self, Node.^property$0_offset)
  #[inline]
  private fun property$0(self: Node, value: i32): void = i32.store(self, value, Node.^property$0_offset)

  #[getter]
  fun left(self: Node): Tree = property$1(self)
  #[setter]
  fun left(self: Node, value: Tree): void = property$1(self, value)

  #[inline]
  private fun property$1(self: Node): Tree = Tree.load(self, Node.^property$1_offset)
  #[inline]
  private fun property$1(self: Node, value: Tree): void = Tree.store(self, value, Node.^property$1_offset)

  #[getter]
  fun right(self: Node): Tree = property$2(self)
  #[setter]
  fun right(self: Node, value: Tree): void = property$2(self, value)

  #[inline]
  private fun property$2(self: Node): Tree = Tree.load(self, Node.^property$2_offset)
  #[inline]
  private fun property$2(self: Node, value: Tree): void = Tree.store(self, value, Node.^property$2_offset)

  fun is(a: (Node | ref)): boolean = %wasm {
    (i64.eq (i64.and (i64.const 0xffffffff00000000) (local.get $a)) (call Node$discriminant))
  }

  fun store(lhs: ref, rhs: Node, offset: u32): void = %wasm {
    (i64.store (i32.add (local.get $offset) (call addressFromRef (local.get $lhs))) (local.get $rhs))
  }

  fun load(lhs: ref, offset: u32): Node = %wasm {
    (i64.load (i32.add (local.get $offset) (call addressFromRef (local.get $lhs))))
  }
}
```

![Build Status](https://dev.azure.com/lys-lang/Lys/_apis/build/status/lys-lang.lys?branchName=master)
[![Build Status](https://travis-ci.org/lys-lang/lys.svg?branch=master)](https://travis-ci.org/lys-lang/lys)
