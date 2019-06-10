# Test

Recursive Fibonacci series. Using if and pattern matching.

#### lib/tree.lys

```lys
import lib::forest

enum Tree {
  Empty
  Node(a: Tree | Forest)
}
```

#### lib/forest.lys

```lys
import lib::tree

enum Forest {
  Nil
  Cons(tree: Tree | Forest)
}
```

#### main.lys

```lys
import support::test
import lib::tree
import lib::forest

#[export]
fun main(): void = {
  START("Forest & Tree tests")

  var a = Nil
  var b = Cons(Empty)
  var c = Cons(Nil)
  var d = Cons(Node(Empty))
  var e = Node(Nil)

  verify(a is Nil, "a is Nil")
  verify(a is Forest, "a is Fores")
  verify(b is Forest, "b is Fores")
  verify(c is Cons, "c is Cons")
  verify(e is Node, "e is Node")
  verify(e is Tree, "e is Tree")

  END()
}
```
