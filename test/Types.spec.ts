declare var describe, it, require, console;

import { testParseToken, testParseTokenFailsafe, folderBasedTest, printAST } from './TestHelpers';

import { ParsingPhaseResult } from '../dist/parser/phases/parsingPhase';
import { CanonicalPhaseResult } from '../dist/parser/phases/canonicalPhase';
import { SemanticPhaseResult } from '../dist/parser/phases/semanticPhase';
import { TypePhaseResult } from '../dist/parser/phases/typePhase';
import { ScopePhaseResult } from '../dist/parser/phases/scopePhase';
import { print } from '../dist/utils/typeGraphPrinter';
import { printErrors } from '../dist/parser/printer';
import { expect } from 'chai';

const phases = function(txt: string): ScopePhaseResult {
  const parsing = new ParsingPhaseResult('test.ro', txt);
  const canonical = new CanonicalPhaseResult(parsing);
  const semantic = new SemanticPhaseResult(canonical);
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
  });

  describe('Resolution', () => {
    folderBasedTest(
      '**/types/*.ro',
      phases,
      async (result, e) => {
        if (e) throw e;
        const typePhase = new TypePhaseResult(result);

        try {
          typePhase.ensureIsValid();
        } catch (e) {
          console.log(printErrors(typePhase.document, typePhase.errors, false));
        }

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
        if (e) throw e;
        const typePhase = new TypePhaseResult(result);

        return printAST(typePhase.document);
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
