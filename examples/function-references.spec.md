# Test

This test walks a tree structure using a predicate function.

#### lib/data.lys

```lys

enum Tree {
  Nil
  Node(name: string)
  Cons(left: Tree, right: Tree)
}


fun walk(
  enter: fun(Tree) -> Tree,
  leave: fun(Tree) -> Tree,
  term: Tree
): Tree = {
  val e = enter(term)
  leave(match e {
    case cons is Cons(left, right) -> {
      val newLeft = walk(enter, leave, left)
      val newRight = walk(enter, leave, right)
      if (newLeft != left || newRight != right) {
        Cons(newLeft, newRight)
      } else {
        cons
      }
    }
    else -> e
  })
}

fun identity(x: Tree): Tree = x

```

#### main.lys

```lys
import support::test
import support::env
import lib::data

fun print(node: Tree): Tree = {
  match node {
    case is Node(name) -> printf("Node: " ++ name)
    case is Cons -> printf("Cons")
    case is Nil -> printf("Nil")
  }
  node
}

fun replaceNames(node: Tree): Tree = match node {
  case is Node(name) -> Node("NewName: " ++ name)
  else -> node
}

#[export]
fun main(): void = {
  {
    START("Print node preorder")

    var data = Cons(Cons(Cons(Cons(Node("1"), Node("+")), Node("2")), Node("*")), Node("4"))

    val r = walk(print, lib::data::identity, data)

    verify(r == data, "Data must remain untouched in print")

    END()
  }

  {
    START("Print node postorder")

    var data = Cons(Cons(Cons(Cons(Node("1"), Node("+")), Node("2")), Node("*")), Node("4"))

    val r = walk(lib::data::identity, print, data)

    verify(r == data, "Data must remain untouched in print")

    END()
  }

  {
    START("Replace names")

    var data = Cons(Cons(Cons(Cons(Node("1"), Node("+")), Node("2")), Node("*")), Node("4"))

    printf("Before:")
    walk(lib::data::identity, print, data)
    val r = walk(lib::data::identity, replaceNames, data)
    walk(lib::data::identity, print, r)
    printf("After:")

    verify(r != data, "Data must return a new tree")

    END()
  }
}
```
