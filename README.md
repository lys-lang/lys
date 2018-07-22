# Desirable semantics

#### Types

```
/**
 * Injected system types, they have no explicit type, it is only a delcaration
 */
type i32

/**
 * Type aliases
 */
type int = i32

/**
 * Struct type.
 * Automatically creates a type with the given name and a pascal case constructor
 * for the struct
 */
struct Node(name: string)

// is the same as

type node {
  Node(name: string)
}

/**
 * Every element of the type declaration registers a top level name.
 * So, color is globally available as long with Red Green Blue and Custom
 */
type color {
  Red
  Green
  Blue
  Custom(r: i32, g: i32, b: i32)
}

/**
 * Type values
 * Red is a singleton instance of type Red <: color. That enables us to compare
 * Red == Red in any part of the program
 */
val col: color = Red

/**
 * Type inference
 * the type Red <: color can be inferred
 */
val col = Red

// Custom(r,g,b) is a struct. Equivalent to a case class in scala
// the type of cyan is Custom, and custom extends color
val cyan: Custom = Custom(0, 255, 255)
```

#### Polimorphic types

```
/**
 * Polimorphic types:
 * maybe monad
 */
type maybe<T> {
  None
  Some(x: T)
}
```

#### Pattern matching

```
/**
 * This function "adds the method" isRed to the type `color``
 */
fun isRed(col: color) =
  col match {
    case Red ->             // type match, in this case is a literal match
      true
    case Custom(r,g,b) ->   // deconstruct
      r == 255 &&
      g == 0 &&
      b == 0
    else ->                 // else
      false
  }

/**
 * Monads
 */
fun getOrElse<T>(value: maybe<T>, fn: fun() -> T): T =
  value match {
    case original @ Some(x) ->
      x                     // desonstruct preserving the original value in scope
                            // original type is Some<T>, NOT maybe<T>
    else -> fn()            // else
  }

fun otherScenarios(x: i32) =
  x match {
    case 0 -> 0             // literal pattern matching
    case y if (y > 20) -> y // condition and scoped value
  }
```

#### Partial application leads to type "methods"

We can add methods to a type by setting the first argument of a function with the
desired type

```
// Function application
isRed(Red)                // true
Red.isRed() == isRed(Red) // true

isRed(Custom(1,2,3))      // false
Custom(1,2,3).isRed()     // false

Red == Red                // true
Red != Custom(255, 0, 0)  // true
```

#### Effect handling

```
/**
 * This defines a new effect type exc with a single primitive operation, raise
 * with type string → exc a for any a. The raise operation can be used just like
 * any other function
 */
effect exc {
  raise<a>(s : string): a
}

// Type inference will infer the type (int,int) -> exc int propagating the exception effect.
fun safediv(x: i32, y: i32): i32 =
  if (y == 0)
    raise("divide by zero")
  else
    x / y
```
