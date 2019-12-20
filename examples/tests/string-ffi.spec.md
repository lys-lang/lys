# Test

Ensure basics of functionality of strings ffi.

#### main.lys

```lys
import support::ffi

#[export] fun validateEmptyString(str: UnsafeCPointer): boolean = {
  val received = UCS2.fromPtr(str)
  received == ""
}

#[export] fun validateNonEmptyString(str: UnsafeCPointer): boolean = {
  val received = UCS2.fromPtr(str)
  received == "TesT!\""
}

#[export] fun getEmptyString(): UnsafeCPointer = {
  "" as UnsafeCPointer
}

#[export] fun getNonEmptyString(): UnsafeCPointer = {
  "Agus 🚢 💫 ڞ" as UnsafeCPointer
}

#[export] fun identity(str: UnsafeCPointer): UnsafeCPointer = {
  UCS2.fromPtr(str) as UnsafeCPointer
}

#[export] fun main(): void = {
  // noop
}

```

#### assertions.js

```js
getInstance => {
  const ffi = require('./execution')
  const instance = getInstance()
  const exports = instance.exports

  const errors = []

  function write(str) {
    return ffi.writeStringToHeap(instance, str)
  }

  function read(ptr) {
    const str = ffi.readStringFromHeap(instance, ptr)
    console.log("Read: " + str)
    return str
  }

  if (!exports.validateEmptyString(write(""))) {
    errors.push('validateEmptyString1')
  }

  if (!exports.validateNonEmptyString(write("TesT!\""))) {
    errors.push('validateNonEmptyString1')
  }

  if (!exports.validateEmptyString(write(""))) {
    errors.push('validateEmptyString2')
  }

  if (!exports.validateNonEmptyString(write("TesT!\""))) {
    errors.push('validateNonEmptyString2')
  }

  if (read(exports.getEmptyString()) != "") {
    errors.push('getEmptyString')
  }

  if (read(exports.getNonEmptyString()) != "Agus 🚢 💫 ڞ") {
    errors.push('getNonEmptyString')
  }

  ['', "a", "1234", "௸", "🥶", "\n\r\t\""].forEach(t => {
    if (read(write(t)) != t) {
      errors.push(`read(write(${t}))`)
    }
  });

  ['', "a", "1234", "௸", "🥶", "\n\r\t\""].forEach(t => {
    if (read(exports.identity(write(t))) != t) {
      errors.push(`identity ${t}`)
    }
  })

  if (errors.length) {
    throw new Error(errors.join(', '))
  }
};
```
