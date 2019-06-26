# Reference counting

In order to release unused memory allocations, count references is a pretty good mechanism, it is also easier than multi state garbage collectors. To implement it, it is necessary to add a header to every dynamic allocation. The header will be prepended to the allocated size and remain aligned to 16 bytes. The size of the header will be 16 bytes too. The returned ref will be the `address + header_size`

The allocation algorithm will be modified as follows:

```diff
    // pseudo

    fun malloc(size): ref = {
      val ptr = malloc(size + 16)
+     setUpHeader(ptr, size)
+     ref(ptr + 16)
-     ref(ptr)
    }

+   fun setUpHeader(ptr, size) = {
+     // write allocation size in ptr
+   }
```

## Header

The header will contain information about the size of the allocation and the reference counter.

## Counting references

The algorithm uses two functions: `retain(ref)` and `release(ref)`. `retain` increments the reference counter by one. `release` decrements the reference counter by one.

The functions are located in the module `system::core::rtti`

## Scopes

A list of retained references will be added to the scopes. A statement to release all the retained references of the scope will be generated and called whenever the scope is left.

## Heuristics about reference counting

- If `retain` or `release` receive static allocations (strings or nullary structs) a short circuit is triggered.
- Allocators DO NOT call to `retain`
- Setters call to `release(old)` and `retain(new)`
- Variable assignations call to `release(old)` and `retain(new)`
- Variable declarations call `retain(value)`
- Variable declarations are registered in the current scope
- At the end of the scope a `release(V) for each declaration V in SCOPE` must be executed
- When a `break` or `continue` is executed, the code to release the variables of the scopes up until the loop declaration's scope (not inclusive) must be called
- BlockNode now produce scopes
- IfNode branches now produce new scopes
- MatcherNode now produce scopes
- Entering a function will retain every argument, leaving the function will release every argument
