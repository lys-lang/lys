# Traits

Traits are an approach to polymorphism. Functions are defined in the trait and then a type can implement the trait.

In traits, functions may or may not have a function body. If the body is absent, then it will be required in the type's implementation of the trait. If the body is present in the trait, the whole implementation of the function can be skipped.

Inside the trait's scope there is a declared type called `Self`. It acts as a type parameter for the type used in the implementation of the trait.

```lys
trait Printable {
  fun toString(self: Self): string
}

impl Printable for i32 {
  #[method]
  fun toString(self: Self): string = ???
  //                 ^^^^ Here "Self" is literally "i32"
}
```

## Implementation strategy

### First implementation

The immediate of objective of this first implementation is to correctly implement some functions like `fun is(self: ref): boolean` and also to annotate types with "tag traits" for reference types. That will be used by the compiler to detect and inject reference counting in references.

- Traits are only used to ensure interfaces in the implemented types.
- No default implementations are allowed, every trait implementation must be verbose.
- No decorations are allowed in the trait's declaration.

### Future

- Traits with default implementations.
- Annotations in trait functions.
- Traits as type references, it will require dynamic dispatch.
- `ref is SomeTrait`
