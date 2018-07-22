declare var describe, it, require, console;

import { testParseToken, testParseTokenFailsafe, folderBasedTest, printAST } from './TestHelpers';

import { ParsingPhaseResult } from '../dist/parser/phases/parsingPhase';
import { CanonicalPhaseResult } from '../dist/parser/phases/canonicalPhase';
import { SemanticPhaseResult } from '../dist/parser/phases/semanticPhase';
import { TypePhaseResult } from '../dist/parser/phases/typePhase';
import { ScopePhaseResult } from '../dist/parser/phases/scopePhase';
import { print } from '../dist/utils/typeGraphPrinter';
import { expect } from 'chai';

const phases = function(txt: string): ScopePhaseResult {
  const parsing = new ParsingPhaseResult('test.ro', txt);
  const canonical = new CanonicalPhaseResult(parsing);
  const semantic = new SemanticPhaseResult(canonical);
  const scope = new ScopePhaseResult(semantic);
  return scope;
};

describe.only('Types', function() {
  let n = 0;

  function normalizeResult(input: string) {
    return input
      .split('\n')
      .map($ => $.trim())
      .filter($ => $.length)
      .join('\n');
  }
  function checkMainType(literals, ...placeholders) {
    function test(program: string, expectedType: string) {
      it(`type inference test #${n++}`, async () => {
        const phaseResult = phases(program);

        const typePhase = new TypePhaseResult(phaseResult);

        const expectedResult = normalizeResult(expectedType);
        const givenResult = normalizeResult(typePhase.document.directives.map($ => $.ofType).join('\n'));

        try {
          expect(givenResult).to.eq(expectedResult);
        } catch (e) {
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

    test(parts[0], parts[1]);
  }

  describe('unit', () => {
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
      type f32

      fun x() =
        if (1.2)
          1.0
        else
          0.0
      ---
      fun() -> f32
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

        try {
          const typePhase = new TypePhaseResult(result);
          typePhase.ensureIsValid();
          debugger;
        } catch (e) {
          return (
            (result.semanticPhaseResult.canonicalPhaseResult.parsingPhaseResult.content || '(no source)') +
            '\n---\n' +
            e.message
          );
        }

        throw new Error('Type phase did not fail');
      },
      '.txt'
    );
  });
});
