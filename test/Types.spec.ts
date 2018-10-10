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
import { annotations } from '../dist/parser/annotations';
import { Nodes } from '../dist/parser/nodes';
import { ParsingContext } from '../dist/parser/closure';

const parsingContext = new ParsingContext();

const phases = function(txt: string): ScopePhaseResult {
  parsingContext.reset();
  const parsing = new ParsingPhaseResult('test.ro', txt, parsingContext);
  const canonical = new CanonicalPhaseResult(parsing);
  const semantic = new SemanticPhaseResult(canonical, 'test');
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
    function test(program: string, expectedType: string, expectedError: string) {
      it(`type inference test #${n++}`, async () => {
        const phaseResult = phases(program);

        const typePhase = new TypePhaseResult(phaseResult);

        try {
          typePhase.execute();
        } catch (e) {
          console.log(print(typePhase.typeGraph));
          console.log(printAST(typePhase.document));
          throw e;
        }

        const expectedResult = normalizeResult(expectedType);

        const givenResult = normalizeResult(
          typePhase.document.directives
            .map($ => {
              if (
                $ instanceof Nodes.OverloadedFunctionNode &&
                !$.functions.some($ => $.hasAnnotation(annotations.Injected))
              ) {
                return $.ofType + '';
              } else if ($ instanceof Nodes.VarDirectiveNode) {
                return `${$.decl.variableName.name} := ${$.decl.variableName.ofType}`;
              }
            })
            .filter($ => !!$)
            .join('\n')
        );

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
                const expected = expectedError
                  .trim()
                  .split(/\n/g)
                  .map($ => $.trim())
                  .filter($ => !!$);
                expected.forEach($ => expect(e.message).to.contain($));
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
    describe('numbers', () => {
      checkMainType`
        fun test1(x: u8): u8 = x as u8
        fun test1(x: u8): i16 = x as i16
        fun test1(x: u8): u16 = x as u16
        fun test1(x: u8): i32 = x as i32
        fun test1(x: u8): u32 = x as u32
        fun test1(x: u8): i64 = x as i64
        fun test1(x: u8): u64 = x as u64
        fun test1(x: u8): f32 = x as f32
        fun test1(x: u8): f64 = x as f64

        fun test2(x: i16): u8 = x as u8
        fun test2(x: i16): i16 = x as i16
        fun test2(x: i16): u16 = x as u16
        fun test2(x: i16): i32 = x as i32
        fun test2(x: i16): u32 = x as u32
        fun test2(x: i16): i64 = x as i64
        fun test2(x: i16): u64 = x as u64
        fun test2(x: i16): f32 = x as f32
        fun test2(x: i16): f64 = x as f64

        fun test3(x: u16): u8 = x as u8
        fun test3(x: u16): i16 = x as i16
        fun test3(x: u16): u16 = x as u16
        fun test3(x: u16): i32 = x as i32
        fun test3(x: u16): u32 = x as u32
        fun test3(x: u16): i64 = x as i64
        fun test3(x: u16): u64 = x as u64
        fun test3(x: u16): f32 = x as f32
        fun test3(x: u16): f64 = x as f64

        fun test4(x: i32): u8 = x as u8
        fun test4(x: i32): i16 = x as i16
        fun test4(x: i32): u16 = x as u16
        fun test4(x: i32): i32 = x as i32
        fun test4(x: i32): u32 = x as u32
        fun test4(x: i32): i64 = x as i64
        fun test4(x: i32): u64 = x as u64
        fun test4(x: i32): f32 = x as f32
        fun test4(x: i32): f64 = x as f64

        fun test5(x: u32): u8 = x as u8
        fun test5(x: u32): i16 = x as i16
        fun test5(x: u32): u16 = x as u16
        fun test5(x: u32): i32 = x as i32
        fun test5(x: u32): u32 = x as u32
        fun test5(x: u32): i64 = x as i64
        fun test5(x: u32): u64 = x as u64
        fun test5(x: u32): f32 = x as f32
        fun test5(x: u32): f64 = x as f64

        fun test6(x: i64): u8 = x as u8
        fun test6(x: i64): i16 = x as i16
        fun test6(x: i64): u16 = x as u16
        fun test6(x: i64): i32 = x as i32
        fun test6(x: i64): u32 = x as u32
        fun test6(x: i64): i64 = x as i64
        fun test6(x: i64): u64 = x as u64
        fun test6(x: i64): f32 = x as f32
        fun test6(x: i64): f64 = x as f64

        fun test7(x: u64): u8 = x as u8
        fun test7(x: u64): i16 = x as i16
        fun test7(x: u64): u16 = x as u16
        fun test7(x: u64): i32 = x as i32
        fun test7(x: u64): u32 = x as u32
        fun test7(x: u64): i64 = x as i64
        fun test7(x: u64): u64 = x as u64
        fun test7(x: u64): f32 = x as f32
        fun test7(x: u64): f64 = x as f64

        fun test8(x: f32): u8 = x as u8
        fun test8(x: f32): i16 = x as i16
        fun test8(x: f32): u16 = x as u16
        fun test8(x: f32): i32 = x as i32
        fun test8(x: f32): u32 = x as u32
        fun test8(x: f32): i64 = x as i64
        fun test8(x: f32): u64 = x as u64
        fun test8(x: f32): f32 = x as f32
        fun test8(x: f32): f64 = x as f64

        fun test9(x: f64): u8 = x as u8
        fun test9(x: f64): i16 = x as i16
        fun test9(x: f64): u16 = x as u16
        fun test9(x: f64): i32 = x as i32
        fun test9(x: f64): u32 = x as u32
        fun test9(x: f64): i64 = x as i64
        fun test9(x: f64): u64 = x as u64
        fun test9(x: f64): f32 = x as f32
        fun test9(x: f64): f64 = x as f64
        ---
        fun(x: u8) -> u8 & fun(x: u8) -> i16 & fun(x: u8) -> u16 & fun(x: u8) -> i32 & fun(x: u8) -> u32 & fun(x: u8) -> i64 & fun(x: u8) -> u64 & fun(x: u8) -> f32 & fun(x: u8) -> f64
        fun(x: i16) -> u8 & fun(x: i16) -> i16 & fun(x: i16) -> u16 & fun(x: i16) -> i32 & fun(x: i16) -> u32 & fun(x: i16) -> i64 & fun(x: i16) -> u64 & fun(x: i16) -> f32 & fun(x: i16) -> f64
        fun(x: u16) -> u8 & fun(x: u16) -> i16 & fun(x: u16) -> u16 & fun(x: u16) -> i32 & fun(x: u16) -> u32 & fun(x: u16) -> i64 & fun(x: u16) -> u64 & fun(x: u16) -> f32 & fun(x: u16) -> f64
        fun(x: i32) -> u8 & fun(x: i32) -> i16 & fun(x: i32) -> u16 & fun(x: i32) -> i32 & fun(x: i32) -> u32 & fun(x: i32) -> i64 & fun(x: i32) -> u64 & fun(x: i32) -> f32 & fun(x: i32) -> f64
        fun(x: u32) -> u8 & fun(x: u32) -> i16 & fun(x: u32) -> u16 & fun(x: u32) -> i32 & fun(x: u32) -> u32 & fun(x: u32) -> i64 & fun(x: u32) -> u64 & fun(x: u32) -> f32 & fun(x: u32) -> f64
        fun(x: i64) -> u8 & fun(x: i64) -> i16 & fun(x: i64) -> u16 & fun(x: i64) -> i32 & fun(x: i64) -> u32 & fun(x: i64) -> i64 & fun(x: i64) -> u64 & fun(x: i64) -> f32 & fun(x: i64) -> f64
        fun(x: u64) -> u8 & fun(x: u64) -> i16 & fun(x: u64) -> u16 & fun(x: u64) -> i32 & fun(x: u64) -> u32 & fun(x: u64) -> i64 & fun(x: u64) -> u64 & fun(x: u64) -> f32 & fun(x: u64) -> f64
        fun(x: f32) -> u8 & fun(x: f32) -> i16 & fun(x: f32) -> u16 & fun(x: f32) -> i32 & fun(x: f32) -> u32 & fun(x: f32) -> i64 & fun(x: f32) -> u64 & fun(x: f32) -> f32 & fun(x: f32) -> f64
        fun(x: f64) -> u8 & fun(x: f64) -> i16 & fun(x: f64) -> u16 & fun(x: f64) -> i32 & fun(x: f64) -> u32 & fun(x: f64) -> i64 & fun(x: f64) -> u64 & fun(x: f64) -> f32 & fun(x: f64) -> f64
        ---
        This cast is useless
        Cannot convert type i16 into u8
        This cast is useless
        Cannot convert type i16 into u16
        Cannot convert type i16 into u32
        Cannot convert type i16 into u64
        Cannot convert type u16 into u8
        Cannot convert type u16 into i16
        This cast is useless
        Cannot convert type i32 into u8
        Cannot convert type i32 into i16
        Cannot convert type i32 into u16
        This cast is useless
        Cannot convert type i32 into u32
        Cannot convert type i32 into u64
        Cannot convert type u32 into u8
        Cannot convert type u32 into i16
        Cannot convert type u32 into u16
        Cannot convert type u32 into i32
        This cast is useless
        Cannot convert type i64 into u8
        Cannot convert type i64 into i16
        Cannot convert type i64 into u16
        Cannot convert type i64 into u32
        This cast is useless
        Cannot convert type i64 into u64
        Cannot convert type u64 into u8
        Cannot convert type u64 into i16
        Cannot convert type u64 into u16
        Cannot convert type u64 into i32
        Cannot convert type u64 into i64
        This cast is useless
        Cannot convert type f32 into u8
        Cannot convert type f32 into i16
        Cannot convert type f32 into u16
        This cast is useless
        Cannot convert type f64 into u8
        Cannot convert type f64 into i16
        Cannot convert type f64 into u16
        This cast is useless
      `;
    });
    describe('scope', () => {
      checkMainType`
        import test::test

        var TestingContext = 1
        fun main(): i32 = TestingContext
        ---
        TestingContext := i32
        fun() -> i32
      `;
    });
    describe('recursive types', () => {
      checkMainType`
        type Test {
          Null
          Some(x: ref)
        }

        var b = Some(Null)
        ---
        b := Some
      `;

      checkMainType`
        type Test {
          Null
          Some(x: Test)
        }

        var b = Some(Null)
        ---
        b := Some
      `;

      checkMainType`
        type Test {
          Null
          Some(x: ref)
        }

        var a: Test = Some(Null)
        var b = Some(Null)
        ---
        a := Test
        b := Some
      `;

      checkMainType`
        type Test {
          Null
          Some(x: Test)
        }

        var a: Test = Some(Null)
        var b = Some(Null)
        ---
        a := Test
        b := Some
      `;

      checkMainType`
        type Test {
          Null
          Some(x: Test)
        }

        fun a(): Null = Null
        fun b(): Some = Some(Some(Null))
        fun c(): Test = Null
        fun d(): Test = Some(Some(Null))
        ---
        fun() -> Null
        fun() -> Some
        fun() -> Test
        fun() -> Test
      `;

      checkMainType`
        fun factorial(n: i32): i32 =
          if (n >= 1)
            n * factorial(n - 1)
          else
            1

        fun x(): i32 = factorial(10)
        ---
        fun(n: i32) -> i32
        fun() -> i32
      `;

      checkMainType`
        fun factorial(n: i32): i32 =
          if (n >= 1)
            factorial(n - 1)
          else
            1

        fun x(): i32 = factorial(10)
        ---
        fun(n: i32) -> i32
        fun() -> i32
      `;

      checkMainType`
        private fun a(i: i32): i32 = i
        private fun a(i: boolean): boolean = i

        private fun a(): i32 | boolean =
          if(1 > 0)
            a(1)
          else
            a(false)
        ---
        fun(i: i32) -> i32 & fun(i: boolean) -> boolean & fun() -> i32 | boolean
      `;

      checkMainType`
        fun gcd(x: i32, y: i32): i32 =
          if (x > y)
            gcd(x - y, y)
          else if (x < y)
            gcd(x, y - x)
          else
            x
        ---
        fun(x: i32, y: i32) -> i32
      `;

      checkMainType`
        fun factorial(n: i32): i32 =
          if (n >= 1)
            n * factorial(n - 1)
          else
            1

        fun gcd(x: i32, y: i32): i32 =
          if (x > y)
            gcd(x - y, y)
          else if (x < y)
            gcd(x, y - x)
          else
            factorial(x)
        ---
        fun(n: i32) -> i32
        fun(x: i32, y: i32) -> i32
      `;
    });
    describe('assign', () => {
      describe('enums', () => {
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
          Invalid signature. Expecting arguments type (NONE | FALSE | TRUE) but got (BOOLEAN)
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

        checkMainType`
          type BOOLEAN {
            TRUE
            FALSE
            NONE
          }

          fun test1(): TRUE = TRUE()
          fun test2(): FALSE = FALSE()
          fun test3(): BOOLEAN = FALSE()
          fun test4(a: boolean): TRUE | FALSE = if(a) TRUE() else FALSE()

          ---
          fun() -> TRUE
          fun() -> FALSE
          fun() -> BOOLEAN
          fun(a: boolean) -> TRUE | FALSE
        `;
        describe('unify complete types', () => {
          checkMainType`
            type Boolean {
              True
              False
            }

            var x = if (true) True else False
            ---
            x := Boolean
          `;

          checkMainType`
            type Boolean {
              True(a: i32)
              False(a: i32)
            }

            var x = if (true) True(1) else False(1)
            ---
            x := Boolean
          `;

          checkMainType`
            type Boolean {
              True
              False
            }

            var x = if (true) True else True
            ---
            x := True
          `;

          checkMainType`
            type Boolean {
              True
              False
              None
            }

            var x = if (true) True else False
            ---
            x := True | False
          `;

          checkMainType`
            type Maybe {
              Some(a: i32)
              None
            }

            var x = if (true) Some(1) else None
            ---
            x := Maybe
          `;

          checkMainType`
            type Maybe {
              Some(a: i32)
              None
            }

            var x = if (true) Some(1) else Some(2)
            ---
            x := Some
          `;

          checkMainType`
            type Maybe {
              Some(a: i32)
              None
            }

            var x: Maybe = if (true) Some(1) else Some(2)
            ---
            x := Maybe
          `;

          checkMainType`
            type P {
              A
              B
            }
            var y = if(true) A else B
            fun test1(): P = A
            ---
            y := P
            fun() -> P
          `;

          describe('funny case that doesnt work.', () => {
            checkMainType`
              type P {
                B(x: i32)
                A(x: i32)
              }
              var y = if (true) A(0) else B(0)
              fun test1(): P = A(1)
              ---
              y := P
              fun() -> P
            `;
          });
        });
      });

      checkMainType`
        fun main(): f32 = 1.0
        ---
        fun() -> f32
      `;

      checkMainType`
        type i32
        type x {
          Nila
          Custom(r: i32)
        }

        fun d(i: i32): void = x(Custom(i))
        fun d(t: Nila): void = x(t)
        fun d(): void = x(Nila)
        ---
        fun(i: i32) -> void & fun(t: Nila) -> void & fun() -> void
        ---
        Type<x> is not a value, constructor or function.
      `;

      checkMainType`
        type i32

        fun rec(x: i32): i32 =
          if (x > 0)
            rec(x - 1)
          else
            0
        ---
        fun(x: i32) -> i32
      `;
      describe('sss', () => {
        checkMainType`
          type i32
          type void

          type x {
            Nila
            Custom(r: i32)
          }

          fun testSuperType(x: x): void = ???

          fun test(): void = {
            testSuperType(Custom(1))
            testSuperType(Nila)
          }
          ---
          fun(x: x) -> void
          fun() -> void
        `;

        checkMainType`
          type i32
          type void

          type x {
            Nila
            Custom(r: i32)
          }

          fun testRefType(x: ref): void = ???

          fun testX(y: x): void = {
            testRefType(y)
          }

          fun test(): void = {
            testX(Custom(1))
            testX(Nila)
            testRefType(Custom(1))
            testRefType(Nila)
          }
          ---
          fun(x: ref) -> void
          fun(y: x) -> void
          fun() -> void
        `;

        checkMainType`
          type i32
          type void

          type x {
            Nila
          }

          fun qq(x: ref): void = ???
          fun qq(x: x): f32 = ???

          fun e(t: Nila): f32 = qq(t)
          fun f(): f32 = qq(Nila)
          ---
          fun(x: ref) -> void & fun(x: x) -> f32
          fun(t: Nila) -> f32
          fun() -> f32
        `;

        checkMainType`
          type i32
          type void

          type x {
            Nila
            Custom(r: i32)
          }

          fun qq(x: ref): void = ???
          fun qq(x: x): f32 = ???
          fun qq(x: Custom): i32 = ???

          fun a(): i32 = qq(Custom(1))
          fun b(t: Custom): i32 = qq(t)
          fun c(t: x): f32 = qq(t)
          fun d(i: i32): i32 = qq(Custom(i))
          fun e(t: Nila): f32 = qq(t)
          fun f(): f32 = qq(Nila)
          ---
          fun(x: ref) -> void & fun(x: x) -> f32 & fun(x: Custom) -> i32
          fun() -> i32
          fun(t: Custom) -> i32
          fun(t: x) -> f32
          fun(i: i32) -> i32
          fun(t: Nila) -> f32
          fun() -> f32
        `;

        checkMainType`
          type x {
            Nila
            Custom(r: i32)
          }

          fun qq(x: Custom): i32 = ???
          fun qq(x: ref): void = ???
          fun qq(x: x): f32 = ???

          fun a(): i32 = qq(Custom(1))
          fun b(t: Custom): i32 = qq(t)
          fun c(t: x): f32 = qq(t)
          fun d(i: i32): i32 = qq(Custom(i))
          fun e(t: Nila): f32 = qq(t)
          fun f(): f32 = qq(Nila)
          ---
          fun(x: Custom) -> i32 & fun(x: ref) -> void & fun(x: x) -> f32
          fun() -> i32
          fun(t: Custom) -> i32
          fun(t: x) -> f32
          fun(i: i32) -> i32
          fun(t: Nila) -> f32
          fun() -> f32
        `;
      });
      checkMainType`
        type x {
          Custom(r: i32)
        }

        fun QQ(x: ref): void = ???

        fun a(): void = QQ(Custom(1))
        fun b(t: Custom): void = QQ(t)
        fun c(t: x): void = QQ(t)
        fun d(i: i32): void = QQ(Custom(i))
        ---
        fun(x: ref) -> void
        fun() -> void
        fun(t: Custom) -> void
        fun(t: x) -> void
        fun(i: i32) -> void
      `;

      checkMainType`
        type x {
          TEST
          XXX(a: i32)
        }

        fun main1(): TEST = TEST
        fun main2(): x = TEST
        fun main3(): x = XXX(1)
        fun main4(): XXX = XXX(1)
        ---
        fun() -> TEST
        fun() -> x
        fun() -> x
        fun() -> XXX
      `;

      checkMainType`
        type x {
          TEST
        }

        fun main(): TEST = TEST()
        fun main2(): x = TEST()
        ---
        fun() -> TEST
        fun() -> x
      `;

      checkMainType`
        private fun test(a: f32): f32 = a
        private fun main(): f32 = test(f32)
        ---
        fun(a: f32) -> f32
        fun() -> f32
        ---
        Type<f32> is not a value, constructor or function.
      `;

      checkMainType`
        fun main(): f32 = f32
        ---
        fun() -> f32
        ---
        Type<f32> is not a value, constructor or function.
      `;
    });

    describe.skip('duplicated signature', () => {
      checkMainType`
        fun a(x: f32): void = ???
        fun a(x: f32): void = ???
        ---
        fun(x: f32) -> void
        ---
        Error
      `;

      checkMainType`
        type XX = f32
        fun a(x: f32): void = ???
        fun a(x: XX): void = ???
        ---
        fun(x: f32) -> void & fun(x: XX) -> void
        ---
        Error
      `;

      checkMainType`
        fun (as)(x: f32): boolean = ???
        fun (as)(x: f32): boolean = ???
        ---
        fun(x: f32) -> boolean
        ---
        Error
      `;
    });

    describe('named types', () => {
      checkMainType`
        type Color {
          Red
          Green
          Blue
        }

        fun isRed(color: Color): boolean = ???

        fun test(): void = {
          var x = if(1>0) Red else Green
          isRed(x)
          isRed(Red)
          isRed(Green)
          isRed(Blue)
        }
        ---
        fun(color: Color) -> boolean
        fun() -> void
      `;

      checkMainType`
        type Color {
          Red
          Green
          Blue
        }

        fun isRed(color: Color): void = ???
        ---
        fun(color: Color) -> void
      `;

      checkMainType`
        type int = i32
        type Integer = int
        type Long = i64
        fun add(a: i32, b: int): int = a + b
        fun add2(a: i32, b: int): Integer = a + b
        fun add3(a: Integer, b: int): Integer = a + b
        fun add4(a: Integer, b: i32): i32 = a + b
        fun add5(a: Long, b: i32): i64 = (a + b as i64)
        ---
        fun(a: i32, b: int) -> int
        fun(a: i32, b: int) -> Integer
        fun(a: Integer, b: int) -> Integer
        fun(a: Integer, b: i32) -> i32
        fun(a: Long, b: i32) -> i64
      `;
    });

    describe('struct pattern matching', () => {
      checkMainType`
        type Enum {
          A
          B
          C
        }

        var value: Enum = A

        var x = value match {
          case b is B -> b
          else -> B
        }

        var y = value match {
          case a is A -> a
          case b is B -> b
          else -> B
        }

        var z = value match {
          case a is A -> a
          case b is B -> b
          else -> value
        }
        ---
        value := Enum
        x := B
        y := A | B
        z := Enum
      `;

      checkMainType`
        type Enum {
          A
          B
        }

        fun test(value: Enum): B = {
          value match {
            case b is B -> {
              var x: B = b
              x
            }
            else -> B
          }
        }
        ---
        fun(value: Enum) -> B
      `;

      checkMainType`
        type Color {
          Red
          Custom(r: i32, g: i32, b: i32)
        }

        fun isRed(color: Color): boolean = {
          color match {
            case is Red -> true
            case is Custom(r,g,b) -> r == 255 && g == 0 && b == 0
          }
        }
        ---
        fun(color: Color) -> boolean
      `;
      checkMainType`
        type Color {
          Red
          Custom(a: i32)
        }

        fun isRed(color: Color): i32 = {
          color match {
            case is Red -> 1
            case is Custom(a) -> a
          }
        }
        ---
        fun(color: Color) -> i32
      `;

      checkMainType`
        type Color {
          Red
          Custom(a: i32)
        }

        fun isRed(color: Color): i32 = {
          color match {
            case is Red -> 1
            case is Custom(a, b, c, d) -> a
          }
        }
        ---
        fun(color: Color) -> i32
        ---
        Invalid number of arguments. The type Custom only accepts 1
        Invalid number of arguments. The type Custom only accepts 1
        Invalid number of arguments. The type Custom only accepts 1
      `;

      checkMainType`
        type Color {
          Red
          Blue
          // TODO: check duplicated params in structs
          Custom(
            a: i32,
            b: i32,
            c: i32,
            d: Red,
            e: i32
          )
        }

        fun isRed(color: Color): Red | Blue = {
          color match {
            case is Custom(_,_,_,a) -> a
            else -> Blue
          }
        }
        ---
        fun(color: Color) -> Red | Blue
      `;

      checkMainType`
        type Color {
          Red
          Green
          Blue
          Custom(r: i32, g: i32, b: i32)
        }

        fun isRed(color: Color): boolean = {
          color match {
            case is Red -> true
            case is Custom(r,g,b) -> r == 255 && g == 0 && b == 0
            else -> false
          }
        }

        fun testColors(): void = {
          support::test::assert(isRed(Red) == true)
          support::test::assert(isRed(Green) == false)
          support::test::assert(isRed(Blue) == false)
          support::test::assert(isRed(Custom(5,5,5)) == false)
          support::test::assert(Red.isRed() == true)
          support::test::assert(Green.isRed() == false)
          support::test::assert(Blue.isRed() == false)
          support::test::assert(Custom(5,5,5).isRed() == false)
        }
        ---
        fun(color: Color) -> boolean
        fun() -> void
      `;
    });

    describe('structs', () => {
      checkMainType`
        type BOOLEAN {
          TRUE
          FALSE
          NONE
        }

        fun test1(): TRUE = TRUE()
        fun test2(): FALSE = FALSE()
        fun test3(): BOOLEAN = FALSE()
        fun test4(a: boolean): TRUE | FALSE = if(a) TRUE() else FALSE()

        ---
        fun() -> TRUE
        fun() -> FALSE
        fun() -> BOOLEAN
        fun(a: boolean) -> TRUE | FALSE
      `;

      checkMainType`
        struct Custom(r: i32)

        var x = Custom(1)
        ---
        x := Custom
      `;

      checkMainType`
        struct Custom(r: i32)

        fun a(): Custom = Custom(1)
        fun b(i: i32): Custom = Custom(i)
        ---
        fun() -> Custom
        fun(i: i32) -> Custom
      `;

      checkMainType`
        struct TEST()

        fun main(): TEST = TEST
        ---
        fun() -> TEST
      `;

      checkMainType`
        struct TEST()

        fun main(): TEST = TEST()
        ---
        fun() -> TEST
      `;

      checkMainType`
        struct A()
        fun test(x: ref): boolean = x == A()
        ---
        fun(x: ref) -> boolean
      `;

      checkMainType`
        struct A()

        fun test1(x: ref): boolean = x == A()
        fun test2(x: A): boolean = test1(x)

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
        fun test2(x: X): boolean = test1(x)
        ---
        fun(x: Z) -> boolean
        fun(x: X) -> boolean
        ---
        Invalid signature. Expecting arguments type (Z) but got (X)
      `;
    });

    describe('operators', () => {
      checkMainType`
        fun AL_BITS(): i32 = 3
        fun AL_SIZE(): i32 = 1 << AL_BITS()
        fun AL_MASK(): i32 = AL_SIZE() - 1
        fun MAX_SIZE_32(): i32 = 1 << 30 // 1G
        fun HEAP_BASE(): i32 = 0
        fun startOffset(): i32 = (HEAP_BASE() + AL_MASK()) & ~(AL_MASK())
        fun offset(): i32 = startOffset()
        fun max(a: i32, b: i32): i32 = if (a>b) a else b
        fun currentMemory(): i32 = %wasm {(current_memory)}
        fun main(): i32 = {
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
        fun max(a: i32, b: i32): i32 = if (a>b) a else b
        fun currentMemory(): i32 = %wasm {(current_memory)}
        fun main(): i32 = {
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

        fun main(): f32 = true + 3
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
        fun main(): i32 = ~1
        ---
        fun() -> i32
      `;

      checkMainType`
        fun max(a: i32, b: i32): i32 = if (a>b) a else b
        fun main(): i32 = max(c(), -1)
        fun c(): i32 = 0xffff
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
        AL_BITS := i32
        AL_SIZE := i32
        AL_MASK := i32
        MAX_SIZE_32 := i32
        HEAP_BASE := i32
        startOffset := i32
        offset := i32
        lastPtr := i32
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

          fun malloc(size: i32): i32 = {
            val ptr = lastPtr
            lastPtr = lastPtr + size
            ptr
          }
          ---
          lastPtr := i32
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
          fun matcher(x: i32): i32 =
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

        fun matcher(x: i32): i32 =
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

        fun matcher(x: i32): i32 =
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

        fun matcher(): void = {}
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

        fun main(): i32 = malloc(1)
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

        fun gt0(x: i32): True | True2 =
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

        fun fib(n: i32): i32 = {
          fibo(n, 0, 1)
        }

        fun test(): i32 = {
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
        type f32

        fun x1(): f32 = {
          fun Y(): f32 = 1.0
          Y()
        }

        fun x2(): i32 = {
          var n = 1
          fun Y(): i32 = n
          Y()
        }

        fun x3(): f32 = {
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

        fun matcher(x: i32): i32 | f32 =
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
        fun gte(x: i32, y: i32): boolean = {
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

        fun x(): f32 =
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

        fun x(): boolean = 1 > 2
        ---
        fun() -> boolean
      `;

      checkMainType`
        type i32
        type boolean

        fun x(): boolean = { 1 > 2 }
        ---
        fun() -> boolean
      `;

      checkMainType`
        type i32
        type boolean

        fun x(): i32 = {
          1 > 2
          1
        }
        ---
        fun() -> i32
      `;

      checkMainType`
        type i32

        fun gte(x: i32): i32 = {
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
        fun getX(): i32 = x
        ---
        x := i32
        fun() -> i32
      `;

      checkMainType`
        type void
        type i32
        fun getX(x: i32): void = {}
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
        fun gte(x: i32, y: i32): boolean = x >= y
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
        x := i32
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
        x := i32
        fun() -> i32
        fun() -> void
      `;
    });
  });

  describe('file based tests', () => {
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
});
