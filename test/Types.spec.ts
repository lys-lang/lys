declare var describe, it, console;

import { folderBasedTest, printAST } from './TestHelpers';
import { ParsingPhaseResult } from '../dist/parser/phases/parsingPhase';
import { CanonicalPhaseResult } from '../dist/parser/phases/canonicalPhase';
import { SemanticPhaseResult } from '../dist/parser/phases/semanticPhase';
import { TypePhaseResult } from '../dist/parser/phases/typePhase';
import { ScopePhaseResult } from '../dist/parser/phases/scopePhase';
import { print } from '../dist/utils/typeGraphPrinter';
import { printErrors } from '../dist/utils/errorPrinter';
import { expect } from 'chai';

const phases = function(txt: string): ScopePhaseResult {
  const parsing = new ParsingPhaseResult('test.ro', txt);
  const canonical = new CanonicalPhaseResult(parsing);
  const semantic = new SemanticPhaseResult(canonical, 'test');
  const scope = new ScopePhaseResult(semantic);
  return scope;
};

describe('Types', function() {
  let n = 0;

  function normalizeResult(input: string) {
    return input
      .split('\n')
      .map($ => $.trim())
      .filter($ => $.length)
      .join('\n');
  }
  function checkMainType(literals, ...placeholders) {
    function test(program: string, expectedType: string, expectedError: string) {
      it(`type inference test #${n++}`, async () => {
        const phaseResult = phases(program);

        const typePhase = new TypePhaseResult(phaseResult);

        try {
          typePhase.execute();
        } catch (e) {
          console.log(print(typePhase.typeGraph));
          throw e;
        }

        const expectedResult = normalizeResult(expectedType);
        const givenResult = normalizeResult(typePhase.document.directives.map($ => $.ofType).join('\n'));

        try {
          expect(givenResult).to.eq(expectedResult);

          if (expectedError) {
            try {
              typePhase.ensureIsValid();
              throw new Error('x');
            } catch (e) {
              if (e.message === 'x') {
                throw new Error("Didn't fail");
              } else {
                expect(e.message).to.contain(expectedError.trim());
              }
            }
          } else {
            typePhase.ensureIsValid();
          }
        } catch (e) {
          console.log(printErrors(typePhase.document, typePhase.errors));
          console.log(print(typePhase.typeGraph));
          throw e;
        }
      });
    }
    let result = '';
    // interleave the literals with the placeholders
    for (let i = 0; i < placeholders.length; i++) {
      result += literals[i];
      result += placeholders[i];
    }

    // add the last literal
    result += literals[literals.length - 1];

    const parts = result.split('---');

    test(parts[0], parts[1], parts[2]);
  }

  describe('unit', () => {
    describe('assign', () => {
      checkMainType`
        fun main() = 1.0
        ---
        fun() -> f32
      `;

      checkMainType`
        struct TEST()

        fun main() = TEST
        ---
        fun() -> TEST
      `;

      checkMainType`
        type x {
          TEST
          XXX(a: i32)
        }

        fun main1() = TEST
        fun main2(): x = TEST
        fun main3(): x = XXX(1)
        fun main4() = XXX(1)
        ---
        fun() -> TEST
        fun() -> x
        fun() -> x
        fun() -> XXX
      `;

      checkMainType`
        struct TEST()

        fun main() = TEST()
        ---
        fun() -> TEST
      `;

      checkMainType`
        type x {
          TEST
        }

        fun main() = TEST()
        fun main2(): x = TEST()
        ---
        fun() -> TEST
        fun() -> x
      `;

      checkMainType`
        private fun test(a: f32) = a
        private fun main() = test(f32)
        ---
        fun(a: f32) -> f32
        fun() -> f32
        ---
        Unexpected type Type<f32>, a value expression is required.
      `;

      checkMainType`
        private fun main() = f32
        ---
        fun() -> UNKNOWN
        ---
        Unexpected type Type<f32>, a value expression is required.
      `;
      checkMainType`
        fun main(): f32 = f32
        ---
        fun() -> f32
        ---
        Unexpected type Type<f32>, a value expression is required.
      `;
    });

    describe('types', () => {
      checkMainType`
        type BOOLEAN {
          TRUE
          FALSE
          NONE
        }

        fun test1(a: BOOLEAN): void = { test2(a) }
        fun test2(a: FALSE): void = ???
        ---
        fun(a: BOOLEAN) -> void
        fun(a: FALSE) -> void
        ---
        Expecting arguments type (FALSE) but got (BOOLEAN)
      `;

      checkMainType`
        type BOOLEAN {
          TRUE
          FALSE
          NONE
        }

        fun test1(a: TRUE | FALSE): void = { test2(a) }
        fun test2(a: FALSE): void = ???
        ---
        fun(a: TRUE | FALSE) -> void
        fun(a: FALSE) -> void
        ---
        Expecting arguments type (FALSE) but got (TRUE | FALSE)
      `;

      checkMainType`
        type BOOLEAN {
          TRUE
          FALSE
          NONE
        }

        fun test1(a: TRUE): void = {
          test2(a)
        }
        fun test2(a: FALSE): void = ???
        ---
        fun(a: TRUE) -> void
        fun(a: FALSE) -> void
        ---
        Expecting arguments type (FALSE) but got (TRUE)
      `;

      checkMainType`
        // Ok, this one is fun. it is actually quite complicated to infer that a UnionType
        // TRUE | FALSE | NONE satisfies all the subtypes of BOOLEAN.
        // so, BOOLEAN is not assignable to TRUE | FALSE | NONE. So far.

        type BOOLEAN {
          TRUE
          FALSE
          NONE
        }

        fun test1(a: BOOLEAN): void = {
          test5(a)
        }
        fun test2(a: FALSE): void = {
          test1(a)
          test3(a)
          test4(a)
          test5(a)
        }
        fun test3(a: TRUE | FALSE): void = {
          test1(a)
          test5(a)
        }
        fun test4(a: NONE | FALSE): void = {
          test1(a)
          test5(a)
        }
        fun test5(a: NONE | FALSE | TRUE): void = {
          test5(a)
        }

        fun main(): void = {
          test1(TRUE())
          test1(FALSE())
          test1(NONE())
          test2(FALSE())
          test3(TRUE())
          test3(FALSE())
          test4(NONE())
          test4(FALSE())
          test5(TRUE())
          test5(FALSE())
          test5(NONE())
        }
        ---
        fun(a: BOOLEAN) -> void
        fun(a: FALSE) -> void
        fun(a: TRUE | FALSE) -> void
        fun(a: NONE | FALSE) -> void
        fun(a: NONE | FALSE | TRUE) -> void
        fun() -> void
        ---
        Expecting arguments type (NONE | FALSE | TRUE) but got (BOOLEAN)
      `;

      checkMainType`
        type BOOLEAN {
          TRUE
          FALSE
          NONE
        }

        fun test1(a: BOOLEAN): void = ???
        fun test2(a: FALSE): void = ???
        fun test3(a: TRUE | FALSE): void = ???
        fun test4(a: NONE | FALSE): void = ???
        fun test5(a: NONE | FALSE | TRUE): void = ???

        fun main(): void = {
          test1(TRUE())
          test1(FALSE())
          test1(NONE())
          test2(FALSE())
          test3(TRUE())
          test3(FALSE())
          test4(NONE())
          test4(FALSE())
          test5(TRUE())
          test5(FALSE())
          test5(NONE())
        }
        ---
        fun(a: BOOLEAN) -> void
        fun(a: FALSE) -> void
        fun(a: TRUE | FALSE) -> void
        fun(a: NONE | FALSE) -> void
        fun(a: NONE | FALSE | TRUE) -> void
        fun() -> void
      `;
      return;
      checkMainType`
        struct A()
        fun test(x: ref): boolean = x == A()
        ---
        fun(x: ref) -> boolean
      `;

      checkMainType`
        struct A()

        fun test1(x: ref): boolean = x == A()
        fun test2(x: A) = test1(x)

        ---
        fun(x: ref) -> boolean
        fun(x: A) -> boolean
      `;

      checkMainType`
        struct X()

        type Y {
          X1
        }

        fun test1(x1: X1): boolean = x1 == X1()
        fun test2(x: X1): boolean = test1(x)

        ---
        fun(x1: X1) -> boolean
        fun(x: X1) -> boolean
      `;

      checkMainType`
        struct X()

        type Y {
          Z
        }

        fun test1(x: Z): boolean = x == Z()
        fun test2(x: X) = test1(x)
        ---
        fun(x: Z) -> boolean
        fun(x: X) -> INVALID_TYPE
        ---
        Invalid signature. Expecting arguments type (Z) but got (X)
      `;

      checkMainType`
        type BOOLEAN {
          TRUE
          FALSE
          NONE
        }

        fun test1() = TRUE()
        fun test2() = FALSE()
        fun test3(): BOOLEAN = FALSE()
        fun test4(a: boolean) = if(a) TRUE() else FALSE()

        ---
        fun() -> TRUE
        fun() -> FALSE
        fun() -> BOOLEAN
        fun(a: boolean) -> BOOLEAN
      `;
    });
    describe('operators', () => {
      checkMainType`
        fun AL_BITS() = 3
        fun AL_SIZE() = 1 << AL_BITS()
        fun AL_MASK() = AL_SIZE() - 1
        fun MAX_SIZE_32() = 1 << 30 // 1G
        fun HEAP_BASE() = 0
        fun startOffset() = (HEAP_BASE() + AL_MASK()) & ~(AL_MASK())
        fun offset() = startOffset
        fun max(a: i32, b: i32) = if (a>b) a else b
        fun currentMemory(): i32 = %wasm {(current_memory)}
        fun main() = {
          val ptr = offset()
          val newPtr = (ptr + 1 + AL_MASK()) & ~(AL_MASK())
          val pagesNeeded = ((newPtr - ptr + 0xffff) & ~0xffff) >>> 16
          val pagesBefore = currentMemory()
          max(pagesBefore, pagesNeeded)
        }
        ---
        fun() -> i32
        fun() -> i32
        fun() -> i32
        fun() -> i32
        fun() -> i32
        fun() -> i32
        fun() -> i32
        fun(a: i32, b: i32) -> i32
        fun() -> i32
        fun() -> i32
      `;

      checkMainType`
        fun max(a: i32, b: i32) = if (a>b) a else b
        fun currentMemory(): i32 = %wasm {(current_memory)}
        fun main() = {
          val pagesNeeded = 1
          val pagesBefore = currentMemory()
          max(pagesBefore, pagesNeeded)
        }
        ---
        fun(a: i32, b: i32) -> i32
        fun() -> i32
        fun() -> i32
      `;

      checkMainType`
        fun (+)(x: boolean, y: i32): f32 = 1.0

        fun main() = true + 3
        ---
        fun(x: boolean, y: i32) -> f32
        fun() -> f32
      `;

      checkMainType`
        fun (+)(x: boolean, y: i32): i32 = 1
        fun (+)(x: i32, y: f32): f32 = 1.0

        fun main(): f32 = true + 3 + 1.0
        ---
        fun(x: boolean, y: i32) -> i32 & fun(x: i32, y: f32) -> f32
        fun() -> f32
      `;

      checkMainType`
        fun (+)(x: boolean, y: i32): i32 = 1

        fun main(): f32 = true + 3
        ---
        fun(x: boolean, y: i32) -> i32
        fun() -> f32
        ---
        Type "i32" is not assignable to "f32"
      `;

      checkMainType`
        fun main() = ~1
        ---
        fun() -> i32
      `;

      checkMainType`
        fun max(a: i32, b: i32) = if (a>b) a else b
        fun main() = max(c(), -1)
        fun c() = 0xffff
        ---
        fun(a: i32, b: i32) -> i32
        fun() -> i32
        fun() -> i32
      `;

      checkMainType`
        /** Number of alignment bits. */
        val AL_BITS: i32 = 3

        /** Number of possible alignment values. */
        val AL_SIZE: i32 = 1 << AL_BITS

        /** Mask to obtain just the alignment bits. */
        val AL_MASK: i32 = AL_SIZE - 1

        /** Maximum 32-bit allocation size. */
        val MAX_SIZE_32: i32 = 1 << 30 // 1G

        val HEAP_BASE = 0

        private var startOffset: i32 = (HEAP_BASE + AL_MASK) & ~AL_MASK
        private var offset: i32 = startOffset

        private var lastPtr: i32 = 0

        private fun growMemory(pages: i32): i32 = %wasm {
          (grow_memory (get_local $pages))
        }

        private fun currentMemory(): i32 = %wasm {
          (current_memory)
        }

        private fun max(a: i32, b: i32): i32 = if (a>b) a else b

        fun malloc(size: i32): i32 = {
          if (size > 0) {
            if (size > MAX_SIZE_32) panic()
            val ptr = offset * currentMemory() - system::memory::malloc(currentMemory())
            val newPtr1 = (currentMemory() + size + AL_MASK) & ~system::memory::malloc(1)
            val newPtr = (ptr + newPtr1 + AL_MASK) & ~AL_MASK
            val pagesBefore = currentMemory()
            if (newPtr > pagesBefore << 16) {
              val ptrx = ptr + 0xffff & ~(3 ^ -0xffff + ~(~ptr)) >>> 16
              val pagesNeeded = ((newPtr - ~ptrx) & ~(3 ^ -0xffff + ~(~ptrx))) >>> 16
              val pagesWanted = max(pagesBefore, pagesNeeded) // double memory
              if (growMemory(pagesWanted) < 0) {
                if (growMemory(pagesNeeded) < 0) {
                  panic() // out of memory
                }
              }
            }
            offset = newPtr + system::memory::malloc(system::memory::malloc(size))
            ptr
          } else {
            0
          }
        }
        ---
        fun(pages: i32) -> i32
        fun() -> i32
        fun(a: i32, b: i32) -> i32
        fun(size: i32) -> i32
      `;

      describe('imports', () => {
        checkMainType`
        import * from system::random

        fun main(): f32 = nextInt()
        ---
        fun() -> f32
        ---
        Type "i32" is not assignable to "f32"
      `;
        checkMainType`
        private var lastPtr: i32 = 0

        fun malloc(size: i32) = {
          val ptr = lastPtr
          lastPtr = lastPtr + size
          ptr
        }
        ---
        fun(size: i32) -> i32
      `;

        checkMainType`
        fun testBool(i: i32): boolean = i match {
          case 0 -> true
          case 1 -> true
          case 2 -> true
          case 3 -> true
          case 4 -> true
          case 5 -> true
          case 6 -> true
          case 7 -> true
          case 8 -> true
          case 9 -> true
          case 10 -> true
          case 11 -> true
          case 12 -> true
          else ->    true
        }
        ---
        fun(i: i32) -> boolean
      `;

        checkMainType`
        fun main(): f32 = system::random::nextInt()
        ---
        fun() -> f32
        ---
        Type "i32" is not assignable to "f32"
      `;
        checkMainType`
        fun matcher(x: i32) =
          x match {
            case 1.5 -> 1
            else -> 2
          }
        ---
        fun(x: i32) -> i32
        ---
        Type "f32" is not assignable to "i32"
      `;
      });
      checkMainType`
      type i32

      private fun innerFunctionArgs(a: i32): i32 = a
      private fun innerFunction(): i32 = innerFunctionArgs(3)

      private fun over(): i32 = 1
      private fun over(a: i32): i32 = a

      fun outerFunction(): i32 = innerFunction() + over()
      ---
      fun(a: i32) -> i32
      fun() -> i32
      fun() -> i32 & fun(a: i32) -> i32
      fun() -> i32
    `;

      checkMainType`
      type i32

      fun matcher(x: i32) =
        x match {
          case 1 -> 1
          else -> 2
        }
      ---
      fun(x: i32) -> i32
    `;

      checkMainType`
      type i32
      type f32

      fun matcher(x: i32) =
        x match {
          case 1.5 -> 1
          else -> 2
        }
      ---
      fun(x: i32) -> i32
      ---
      Type "f32" is not assignable to "i32"
    `;

      checkMainType`
      type void

      fun matcher() = {}
      ---
      fun() -> void
    `;

      checkMainType`
      type i32

      type Boolean {
        True()
        False()
      }

      fun gt0(x: i32): Boolean =
        if (x > 0)
          True()
        else
          False()
      ---
      fun(x: i32) -> Boolean
    `;

      checkMainType`
      type i32


      fun malloc(size: i32): i32 = %wasm {
        (get_local $size)
      }

      fun main() = malloc(1)
      ---
      fun(size: i32) -> i32
      fun() -> i32
    `;

      checkMainType`
      type i32

      type Boolean {
        True()
        False()
      }

      type Boolean2 {
        True2()
      }

      fun gt0(x: i32) =
        if (x > 0)
          True()
        else
          True2()
      ---
      fun(x: i32) -> True | True2
    `;

      checkMainType`
      type i32

      private fun fibo(n: i32, x1: i32, x2: i32): i32 = {
        if (n > 0) {
          fibo(n - 1, x2, x1 + x2)
        } else {
          x1
        }
      }

      fun fib(n: i32) = {
        fibo(n, 0, 1)
      }

      fun test() = {
        fib(46) // must be 1836311903
      }
      ---
      fun(n: i32, x1: i32, x2: i32) -> i32
      fun(n: i32) -> i32
      fun() -> i32
    `;

      checkMainType`
      type i32

      type Boolean {
        True()
        False()
      }

      type Boolean2 {
        True2()
      }

      fun gt0(x: i32): True | Boolean2 =
        if (x > 0)
          True()
        else
          True2()
      ---
      fun(x: i32) -> True | Boolean2
    `;

      checkMainType`
      type i32

      type Boolean {
        True()
        False()
      }

      fun gt0(x: i32) =
        if (x > 0)
          True()
        else
          False()
      ---
      fun(x: i32) -> Boolean
    `;

      checkMainType`
      type i32
      type f32

      fun x1() = {
        fun Y() = 1.0
        Y()
      }

      fun x2() = {
        var n = 1
        fun Y() = n
        Y()
      }

      fun x3() = {
        x2()
        x1() + x1()
      }
      ---
      fun() -> f32
      fun() -> i32
      fun() -> f32
    `;

      checkMainType`
      type i32
      type f32

      fun matcher(x: i32) =
        x match {
          case 1 -> 1
          else -> 2.1
        }
      ---
      fun(x: i32) -> i32 | f32
    `;

      checkMainType`
      type i32
      type boolean
      fun gte(x: i32, y: i32) = {
        val test = x >= y
        test
      }
      ---
      fun(x: i32, y: i32) -> boolean
    `;

      checkMainType`
      type i32
      type boolean
      fun gte(x: i32, y: i32): i32 = {
        val test = x >= y
        test
      }
      ---
      fun(x: i32, y: i32) -> i32
      ---
      Type "boolean" is not assignable to "i32"
    `;

      checkMainType`
      type f32

      fun x() =
        if (1.2)
          1.0
        else
          0.0
      ---
      fun() -> f32
      ---
      Type "f32" is not assignable to "boolean"
    `;

      checkMainType`
      type i32
      type boolean

      fun x() = 1 > 2
      ---
      fun() -> boolean
    `;

      checkMainType`
      type i32
      type boolean

      fun x() = { 1 > 2 }
      ---
      fun() -> boolean
    `;

      checkMainType`
      type i32
      type boolean

      fun x() = {
        1 > 2
        1
      }
      ---
      fun() -> i32
    `;

      checkMainType`
      type i32

      fun gte(x: i32) = {
        var test = 0
        test = 1 + x
        test
      }
      ---
      fun(x: i32) -> i32
    `;

      checkMainType`
      type i32

      private fun fibo(n: i32, x1: i32, x2: i32): i32 =
        if (n > 0)
          fibo(n - 1, x2, x1 + x2)
        else
          x1

      fun fib(n: i32): i32 = fibo(n, 0, 1)

      fun test(): i32 = fib(46) // must be 1836311903
      ---
      fun(n: i32, x1: i32, x2: i32) -> i32
      fun(n: i32) -> i32
      fun() -> i32
    `;

      checkMainType`
      type i32

      fun gte(x: i32) = {
        var test = 0
        test = test + x
        test
      }
      ---
      fun(x: i32) -> i32
    `;

      checkMainType`
      type i32

      fun gte(x: i32): i32 = {
        var test = 0
        test = test + x
        test
      }
      ---
      fun(x: i32) -> i32
    `;

      checkMainType`
      type i32
      var x = 1
      fun getX() = x
      ---
      fun() -> i32
    `;

      // TYPE ALIAS
      // checkMainType`
      //   type i32
      //   type int = i32
      //   var x = 1
      //   fun getX(): int = x
      //   ---
      //   fun() -> int
      // `;

      checkMainType`
      type void
      type i32
      fun getX(x: i32) = {}
      ---
      fun(x: i32) -> void
    `;

      checkMainType`
      type i32
      fun getX(x: i32): i32 = x
      ---
      fun(x: i32) -> i32
    `;

      checkMainType`
      type i32
      fun getX(x: i32): i32 = {
        x
        x
        x
        x
        x
      }
      ---
      fun(x: i32) -> i32
    `;

      checkMainType`
      type i32
      type f32
      fun getX(): i32 = {
        1.0
        1.0
        1
      }
      ---
      fun() -> i32
    `;

      checkMainType`
      type i32
      type boolean
      fun gte(x: i32, y: i32) = x >= y
      ---
      fun(x: i32, y: i32) -> boolean
    `;

      checkMainType`
      type i32
      type void

      fun getX(x: i32): void =
        if (x > 0) {
          x
        }
      ---
      fun(x: i32) -> void
    `;

      checkMainType`
      type i32
      type void

      fun getX(): void = {
        if (1 > 0) {
          1
        }
      }
      ---
      fun() -> void
    `;

      checkMainType`
      type i32
      type void

      fun getX(): void =
        if (1 > 0) {
          1
        }
      ---
      fun() -> void
    `;

      checkMainType`
      type i32
      type void

      var x = 1

      fun getX(): void =
        if (x > 0) {
          x
        }
      ---
      fun() -> void
    `;

      checkMainType`
      type i32
      type void

      var x = 1

      fun addOne(): i32 = {
        var y = x
        y = y + 1
        x = y
      }

      fun addOneNoReturn(): void = {
        x = x + 1
      }
      ---
      fun() -> i32
      fun() -> void
    `;
    });
  });

  describe('Resolution', () => {
    folderBasedTest(
      '**/types/*.ro',
      phases,
      async (result, e) => {
        if (e) throw e;
        const typePhase = new TypePhaseResult(result);
        typePhase.execute();
        typePhase.ensureIsValid();

        return print(typePhase.typeGraph);
      },
      '.dot'
    );
  });

  describe('Resolution-ast', () => {
    folderBasedTest(
      '**/types/*.ro',
      phases,
      async (result, e) => {
        if (e) {
          if (result) {
            console.log(printErrors(result.document, [e as any]));
          }
          throw e;
        }

        try {
          const typePhase = new TypePhaseResult(result);
          typePhase.execute();
          return printAST(typePhase.document);
        } catch (e) {
          console.log(printErrors(result.document, [e]));
          throw e;
        }
      },
      '.ast'
    );
  });

  describe('Compiler errors', () => {
    folderBasedTest(
      '**/type-error/*.ro',
      phases,
      async (result, e) => {
        if (e) throw e;

        const typePhase = new TypePhaseResult(result);

        try {
          typePhase.execute();
          typePhase.ensureIsValid();
          debugger;
        } catch (e) {
          return printErrors(typePhase.document, typePhase.errors, true);
        }

        throw new Error('Type phase did not fail');
      },
      '.txt'
    );
  });
});
