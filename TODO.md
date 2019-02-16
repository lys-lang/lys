- val variables should not be reassignable
- OR binary op should stop evaluation after the first non-zero result is yielded
- AND binary op should stop evaluation after the first zero result is yielded

rename closures to scopes
arrays
strings
closure functions

change memory things from i32 to usize

fun sizeOf(x: Type<A> | A): usize

test parsing `type test {}`

MESSAGE TO FUTURE AGUS:

struct and poly types should not receive a instance of Reference, they should receive only the nameIdentifier used for the declaration.

---

There are [enum types](https://en.wikipedia.org/wiki/Enumerated_type). The enum type has a name, and it consists of a set of named types which are assignable to the enum type.

This is possible because internaly the enum type is a sugar syntax for a [union type](https://en.wikipedia.org/wiki/Tagged_union).

https://en.wikipedia.org/wiki/Ring_(mathematics)
https://en.wikipedia.org/wiki/Parametric_polymorphism
https://en.wikipedia.org/wiki/Option_type
https://en.wikipedia.org/wiki/Monad_(functional_programming)#Monad_laws
https://en.wikipedia.org/wiki/Standard_ML
https://en.wikipedia.org/wiki/Automated_theorem_proving
https://en.wikipedia.org/wiki/Computer_algebra
https://en.wikipedia.org/wiki/Breadth-first_search
https://en.wikipedia.org/wiki/Enumerated_type
https://en.wikipedia.org/wiki/Union_type
https://en.wikipedia.org/wiki/Tagged_union
https://en.wikipedia.org/wiki/First-class_function
https://en.wikipedia.org/wiki/Namespace
https://en.wikipedia.org/wiki/Entropy_(information_theory)
https://en.wikipedia.org/wiki/Nullary_constructor

```ts
enum Color {
  Red
  Green
  Blue
}

// desugars to:

type Red // nullary type
type Green // nullary type
type Blue // nullary type
type Color = Red | Green | Blue
```

```ts
enum Option<T> {
  Some(value: T)
  None
}

// desugars to:

type None
type Some<T>
type Option<T> = Some<T> | None
```

```ts
enum Option<T> {
  Some(value: T)
  None
}

// desugars to:

type Option<T> = Some<T> | None
type Some<T>
type None

impl Option<T> {
  fun `is`(x: ref) = {
    Some.is(x) || None.is(x)
  }

  fun `as`(x: Some<T>): Option<T> = x
  fun `as`(x: None): Option<Nothing> = x
}

impl None {
  val determinant: usize = 2
  val staticInstance: ref = determinant
  fun `is`(x: ref) = x == staticInstance

  fun apply(): None = staticInstance
}


```

```ts
enum Temp {
  Celcius(mut temperature: f32)
  Kelvin(temperature: f32)
}

// desugars to:

type Temp = Celcius | Kelvin
type Celcius
type Kelvin

impl Temp {
  fun `is`(x: ref) = {
    Celcius.is(x) || Kelvin.is(x)
  }

  fun `as`(x: Kelvin): Temp = x
  fun `as`(x: Celcius): Temp = x
}

impl Celcius {
  val determinant = 1
  val memorySize = ref.memorySize + f32.memorySize /* temperature: f32 */
  fun `is`(x: ref) = x.determinant == determinant

  fun apply(temperature: f32): Celcius = {
    val ptr = core::memory::malloc(memorySize)
    val base = ref.base(ptr)
    f32.store(base + 0, temperature)
    ref as Celcius
  }

  fun get_temperature(ptr: Celcius): f32 = {
    val base = ref.base(ptr)
    f32.read(base + 0)
  }

  fun set_temperature(ptr: Celcius, newValue: f32): void = {
    val base = ref.base(ptr)
    f32.store(base + 0, newValue)
  }
}

impl Kelvin {
  val determinant = 2
  val memorySize = ref.memorySize + f32.memorySize  /* n: f32 */
  fun `is`(x: ref) = x.determinant == determinant

  fun apply(n: f32): Kelvin = {
    val ptr = core::memory::malloc(memorySize)
    val base = ref.base(ptr)
    f32.store(base + 0, n)
    ref as Kelvin
  }

  fun get_temperature(ptr: Celcius): f32 = {
    val base = ref.base(ptr)
    f32.read(base + 0)
  }
}
```
