### Every markdown file in this folder is a test suite.

The execution is performed automatically in the CI by `make md-tests`

Manual execution is possible with the lys CLI

```bash
lys my-test.spec.md
```

# File format

<pre>

# Some test name

Some description

# Files

#### main.lys
```lys
#[export]
fun main(): i32 = 12
```

#### assertions.js
```js
async getInstance => {
  console.assert(getInstance().exports.main() == 12)
}
```

</pre>

# Rules

- The parser only pays attention to files. A file is a title followed by a code block.
- A `main.lys` file is required as entry point
- Every `*.js` file must return a function, that function receives a `getInstance(): any` argument
- Only the file `assertions.js` runs after compilation.
- Other `*.js` files can be used as JS libraries and can be imported from Lys
