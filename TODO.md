- automatically coerce based on implicit `as`
  - remove hardcoded ref type -> traits
- reuse string literals in memory
- let constructs (scope)
- methods
- type alias
- emit text should be parsed and emited again correctly, final result must be the same as the begin
- OR binary op should stop evaluation after the first non-zero result is yielded
- AND binary op should stop evaluation after the first zero result is yielded
- test file with self reference
- figure out private fields structs
- for loops sugar syntax
- for in sugar syntax
- robust type alias use cases and test suites

```lys
// this should yield an error
match x {
  case 1 -> ???
  case 1 -> ???
  case 1 -> ???
  case 1 -> ???
}
```

```lys
// doesnt work
match x {
  else char -> ...
}
```

```lys
// assignment as firts code block stmt dowsnt work
match parse(rule, ruleName, parser, level + 1) {
  case is Nil -> break
  case ast is AST -> {
    ret = match ret {
      case is Nil -> ast
      else -> AstCons(ret, ast)
    }
    continue
  }
}
```

every declaration with the same name of different impl must have the same visibility

exhaustive test of implicit coercion

ensure "is" always returns a boolean

internal variables/state are only accessible via getters/setters

arrays
strings
closure functions

```lys
// doesnt work
var x = if(cond) 1 else 2
// does work
var x = if(cond) {1} else {2}
```

```lys
// test parsing
enum test {}
```

```lys
// test parsing:
fun malloc(size: i32): i32 = {
  if (size > 0) {
    val sizeToAlloc = size + 8 /* asd */
    if (sizeToAlloc > MAX_SIZE_32) {
      panic()
    }
  }
}
```

---

parser fails with

```lys
match x {
  case None -> 123
  case is Some -> 123
}
```

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

grammar changes:

```
# privatefun is tokenized as two tokens

# comments are not allowed between function parameters
# comments are not allowed between struct parameters
# comments are not allowed between enum parameters

# ??? is invalid

# index selectors and function name

16u32
```

porque si dallta checkeo de tipos sigue de largo para ExecutionHelper#testSrc?


```lys
fun externalEat(): UnsafeCPointer = eat() // fails horribly with wasm validation errors
fun externalEat(): UnsafeCPointer = eat() as UnsafeCPointer // doesn't fail
```