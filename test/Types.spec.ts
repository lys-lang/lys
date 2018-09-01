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
