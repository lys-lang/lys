declare var describe, it, console;

import { folderBasedTest, printAST } from './TestHelpers';
import { CanonicalPhaseResult } from '../dist/parser/phases/canonicalPhase';
import { SemanticPhaseResult } from '../dist/parser/phases/semanticPhase';
import { TypePhaseResult } from '../dist/parser/phases/typePhase';
import { ScopePhaseResult } from '../dist/parser/phases/scopePhase';
import { print } from '../dist/utils/typeGraphPrinter';
import { printErrors } from '../dist/utils/errorPrinter';
import { expect } from 'chai';
import { annotations } from '../dist/parser/annotations';
import { Nodes } from '../dist/parser/nodes';
import { ParsingContext } from '../dist/parser/ParsingContext';
import { UnionType, StructType, RefType, TypeAlias, InjectableTypes, Type } from '../dist/parser/types';
import { printNode } from '../dist/utils/nodePrinter';

const parsingContext = new ParsingContext();

const phases = function(txt: string, fileName: string): ScopePhaseResult {
  parsingContext.reset();
  const parsing = parsingContext.getParsingPhaseForContent(fileName, txt);
  const canonical = new CanonicalPhaseResult(parsing);
  const semantic = new SemanticPhaseResult(canonical, fileName);
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
      const number = n++;
      it(`type inference test #${number}`, async function() {
        this.timeout(5000);

        const phaseResult = phases(program, `types_${number}.ro`);

        const typePhase = new TypePhaseResult(phaseResult);

        try {
          typePhase.execute();
        } catch (e) {
          console.log(print(typePhase.typeGraph));
          console.log(printAST(typePhase.document));
          throw e;
        }

        const expectedResult = normalizeResult(expectedType);
        try {
          const givenResult = normalizeResult(
            typePhase.document.directives
              .map($ => {
                if (
                  $ instanceof Nodes.OverloadedFunctionNode &&
                  !$.functions.some($ => $.hasAnnotation(annotations.Injected))
                ) {
                  return $.ofType + '';
                } else if ($ instanceof Nodes.VarDirectiveNode) {
                  return `${$.decl.variableName.name} := ${
                    $.decl.variableName.ofType ? $.decl.variableName.ofType.inspect(1) : '<ofType is NULL>'
                  }`;
                }
              })
              .filter($ => !!$)
              .join('\n')
          );

          expect(givenResult).to.eq(expectedResult);

          if (expectedError) {
            try {
              typePhase.ensureIsValid();
              throw new Error('x');
            } catch (e) {
              if (e.message === 'x') {
                throw new Error("Didn't fail (expecting " + expectedError + ')');
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
          console.log(printErrors(typePhase.parsingContext));
          console.log(printNode(typePhase.document));
          console.log(printAST(typePhase.document));
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

    // describe('XXX', function() {
    //   const path =
    //     this.fullTitle()
    //       .replace(/\s+/g, '/')
    //       .replace('XXX', n)
    //       .toLowerCase() + '.ro';
    //   const folder = dirname(path);
    //   mkdirSync(folder, { recursive: true } as any);
    //   writeFileSync('fixtures/' + path, result);
    // });
  }

  describe('unit', () => {
    checkMainType`
      fun abc(): void = {/* empty block */}
      ---
      fun() -> void
    `;

    checkMainType`
      var int = 1
      var float = 1.0
      var bool = true
      ---
      int := (alias i32 (native i32))
      float := (alias f32 (native f32))
      bool := (alias boolean (native boolean))
    `;

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
        TestingContext := (alias i32 (native i32))
        fun() -> i32
      `;
    });

    describe('bytes', () => {
      checkMainType`
        var a = "hello"
        var len = a.length
        ---
        a := (alias bytes (native bytes))
        len := (alias i32 (native i32))
      `;
    });

    describe('namespace types', () => {
      describe('apply', () => {
        checkMainType`
          type Test = ???

          impl Test {
            fun apply(): Test = ???
          }

          var a = Test.apply()
          ---
          a := (alias Test (struct Test))
        `;

        checkMainType`
          type Test = ???

          impl Test {
            fun apply(): Test = ???
          }

          var a = Test()
          ---
          a := (alias Test (struct Test))
        `;

        checkMainType`
          type Test = ???

          impl Test {
            fun apply(a: i32): Test = ???
            fun apply(): Test = ???
          }

          var a = Test(1)
          var b = Test()
          ---
          a := (alias Test (struct Test))
          b := (alias Test (struct Test))
        `;

        checkMainType`
          type Test = ???

          impl Test {
            fun apply(a: i32): Test = ???
          }

          var a = Test(1)
          ---
          a := (alias Test (struct Test))
        `;
      });

      describe('resolve static functions', () => {
        checkMainType`
          type Test
          impl Test {
            fun WWW(): boolean = ???
          }

          var a = Test.WWW()
          ---
          a := (alias boolean (native boolean))
        `;
      });

      describe('sugar', () => {
        checkMainType`
          struct Test()
          impl Test {
            fun ZZZ(): boolean = ???
          }

          var z = Test.ZZZ()
          ---
          z := (alias boolean (native boolean))
        `;

        checkMainType`
          type Test { Case1 }
          impl Test {
            fun WWW(x: ref): boolean = x is Test
          }

          var a = Test.WWW(Case1)
          ---
          a := (alias boolean (native boolean))
        `;

        checkMainType`
          type Test { Case1 }

          impl Test {
            fun WWW(x: ref): boolean = x is Test
          }

          fun x(): boolean = Test.WWW(Case1)
          ---
          fun() -> boolean
        `;

        checkMainType`
          type Temperature {
            Kelvin(x: f32)
          }

          impl Kelvin {
            fun xxx(): f32 = ???
          }

          var c = Kelvin.xxx()
          ---
          c := (alias f32 (native f32))
        `;

        checkMainType`
          type Temperature {
            Celcius(x: f32)
            Kelvin(x: f32)
          }
          impl Temperature {
            fun xxx(): boolean = ???
          }
          impl Celcius {
            fun xxx(): i32 = ???
          }
          impl Kelvin {
            fun xxx(): f32 = ???
          }

          var a = Temperature.xxx()
          var b = Celcius.xxx()
          var c = Kelvin.xxx()
          ---
          a := (alias boolean (native boolean))
          b := (alias i32 (native i32))
          c := (alias f32 (native f32))
        `;
      });

      describe('resolve "is" and "as" functions', () => {
        describe('sugar', () => {
          checkMainType`
            type Test {
              A
              B
            }

            var a = A is Test
            var b = A is A
            ---
            a := (alias boolean (native boolean))
            b := (alias boolean (native boolean))
          `;

          checkMainType`
            type Test {
              A
              B
            }

            var a = A as Test
            var b = A
            ---
            a := (alias Test (union (alias A) (alias B)))
            b := (alias A (struct A))
          `;

          checkMainType`
            type Test {
              A
              B
            }

            var a = A
            var b = B
            var c = a as Test
            var d = b as Test
            ---
            a := (alias A (struct A))
            b := (alias B (struct B))
            c := (alias Test (union (alias A) (alias B)))
            d := (alias Test (union (alias A) (alias B)))
          `;
        });

        describe('union types', function() {
          this.bail(true);
          checkMainType`
            struct A()
            struct B()
            struct C()
            type ABC = A | B | C

            var a: A = ???
            var b: B = ???
            var c: C = ???
            var d: ABC = a
            ---
            a := (alias A (struct A))
            b := (alias B (struct B))
            c := (alias C (struct C))
            d := (alias ABC (union (alias A) (alias B) (alias C)))
          `;

          checkMainType`
            type A = ???
            type B = ???
            type C = ???
            type ABC = A | B | C

            impl A {
              fun is(x: A): boolean = ???
            }

            impl B {
              fun is(x: B): boolean = ???
            }

            impl C {
              fun is(x: C): boolean = ???
            }

            var a: A = ???
            var b: B = ???
            var c: C = ???
            var d: ABC = a

            var isA = a is A
            var isB = b is B
            var isC = c is C
            var isAABC = a is ABC
            var isBABC = b is ABC
            var isCABC = c is ABC
            ---
            a := (alias A (struct A))
            b := (alias B (struct B))
            c := (alias C (struct C))
            d := (alias ABC (union (alias A) (alias B) (alias C)))
            isA := (alias boolean (native boolean))
            isB := (alias boolean (native boolean))
            isC := (alias boolean (native boolean))
            isAABC := (alias boolean (native boolean))
            isBABC := (alias boolean (native boolean))
            isCABC := (alias boolean (native boolean))
          `;
        });

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
          fun(x: f64) -> u8 & fun(x: f64) -> i16 & fun(x: f64) -> u16 & fun(x: f64) -> i32 & fun(x: f64) -> u32 & fun(x: f64) -> i64 & fun(x: f64) -> u64 & fun(x: f64) -> f32 & fun(x: f64) -> f64          ---
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
    });

    describe('recursive types', () => {
      checkMainType`
        type Test {
          Null
          Some(x: ref)
        }

        var b = Some(Null)
        ---
        b := (alias Some (struct Some))
      `;

      checkMainType`
        type Test {
          Null
          Some(x: Test)
        }

        var b = Some(Null)
        ---
        b := (alias Some (struct Some))
      `;

      checkMainType`
        type Test {
          Null
          Some(x: ref)
        }

        var a: Test = Some(Null)
        var b = Some(Null)
        ---
        a := (alias Test (union (alias Null) (alias Some)))
        b := (alias Some (struct Some))
      `;

      checkMainType`
        type Test {
          Null
          Some(x: Test)
        }

        var a: Test = Some(Null)
        var b = Some(Null)
        ---
        a := (alias Test (union (alias Null) (alias Some)))
        b := (alias Some (struct Some))
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

      describe('forest', () => {
        checkMainType`
          type Tree {
            Empty
            Node(a: Tree | Forest)
          }

          type Forest {
            Nil
            Cons(tree: Tree | Forest)
          }

          var a = Nil
          var b = Cons(Empty)
          var c = Cons(Nil)
          var d = Cons(Node(Empty))
          var e = Cons(Node(Nil))
          ---
          a := (alias Nil (struct Nil))
          b := (alias Cons (struct Cons))
          c := (alias Cons (struct Cons))
          d := (alias Cons (struct Cons))
          e := (alias Cons (struct Cons))
        `;
      });
    });
    describe('recursive calls', () => {
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
        describe('assign unions', function() {
          // this.bail(true);

          checkMainType`
            type BOOLEAN {
              TRUE
              FALSE
              NONE
            }

            // 1
            fun test1(a: BOOLEAN): void = ???
            fun test2(a: FALSE): void = {
              test1(a)
            }
            ---
            fun(a: BOOLEAN) -> void
            fun(a: FALSE) -> void
          `;

          checkMainType`
            type BOOLEAN {
              TRUE
              FALSE
              NONE
            }

            // 2
            fun test1(a: BOOLEAN): void = {
              test5(a)
            }

            fun test5(a: NONE | FALSE | TRUE): void = {
              test1(a)
            }
            ---
            fun(a: BOOLEAN) -> void
            fun(a: NONE | FALSE | TRUE) -> void
          `;

          checkMainType`
            type BOOLEAN {
              TRUE
              FALSE
              NONE
            }
            // 3
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
            type BOOLEAN {
              TRUE
              FALSE
              NONE
            }
            // 4
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

            // 4
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
          `;

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
        });
        describe('unify complete types', () => {
          checkMainType`
            type Boolean {
              True
              False
            }

            var x = if (true) True else False
            ---
            x := (union (alias True) (alias False))
          `;

          checkMainType`
            type Boolean {
              True(a: i32)
              False(a: i32)
            }

            var x = if (true) True(1) else False(1)
            ---
            x := (union (alias True) (alias False))
          `;

          checkMainType`
            type Boolean {
              True
              False
            }

            var x = if (true) True else True
            ---
            x := (alias True (struct True))
          `;

          checkMainType`
            type Boolean {
              True
              False
              None
            }

            var x = if (true) True else False
            ---
            x := (union (alias True) (alias False))
          `;

          checkMainType`
            type Maybe {
              Some(a: i32)
              None
            }

            var x = if (true) Some(1) else None
            ---
            x := (union (alias Some) (alias None))
          `;

          checkMainType`
            type Maybe {
              Some(a: i32)
              None
            }

            var x = if (true) Some(1) else Some(2)
            ---
            x := (alias Some (struct Some))
          `;

          checkMainType`
            type Maybe {
              Some(a: i32)
              None
            }

            var x: Maybe = if (true) Some(1) else Some(2)
            ---
            x := (alias Maybe (union (alias Some) (alias None)))
          `;

          checkMainType`
            type P {
              A
              B
            }
            var y = if(true) A else B
            fun test1(): P = A
            ---
            y := (union (alias A) (alias B))
            fun() -> P
          `;

          describe('funny case that doesnt work.', () => {
            checkMainType`
              type P {
                B(x: i32)
                A(x: i32)
              }
              var y = if (true) A(0) else B(0)
              var z: P = if (true) A(0) else B(0)
              fun test1(): P = A(1)
              ---
              y := (union (alias A) (alias B))
              z := (alias P (union (alias B) (alias A)))
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
        Cannot find member "apply" in (alias x)
      `;

      checkMainType`

        fun rec(x: i32): i32 =
          if (x > 0)
            rec(x - 1)
          else
            0
        ---
        fun(x: i32) -> i32
      `;
      describe('assign to ref', () => {
        checkMainType`
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
          type x {
            Nila
            Custom(r: i32)
          }

          fun canAnyStructBeAssignedToRef(x: ref): boolean = ???

          fun a(): boolean = canAnyStructBeAssignedToRef(Custom(1))
          fun b(): boolean = canAnyStructBeAssignedToRef(Nila)
          fun c(t: x): boolean = canAnyStructBeAssignedToRef(t)
          ---
          fun(x: ref) -> boolean
          fun() -> boolean
          fun() -> boolean
          fun(t: x) -> boolean
        `;

        checkMainType`
          type void

          type x {
            Nila
            Custom(r: i32)
          }

          fun qq(x: ref): void = ???
          fun qq(x: x): boolean = ???

          fun a(): boolean = qq(Custom(1))
          fun b(t: Custom): boolean = qq(t)
          fun c(t: x): boolean = qq(t)
          fun d(i: i32): boolean = qq(Custom(i))
          fun e(t: Nila): boolean = qq(t)
          fun f(): boolean = qq(Nila)
          ---
          fun(x: ref) -> void & fun(x: x) -> boolean
          fun() -> boolean
          fun(t: Custom) -> boolean
          fun(t: x) -> boolean
          fun(i: i32) -> boolean
          fun(t: Nila) -> boolean
          fun() -> boolean
        `;

        checkMainType`
          type void

          type x {
            Nila
            Custom(r: i32)
          }

          fun qq(x: ref): void = ???
          fun qq(x: Nila): f32 = ???
          fun qq(x: Custom): i32 = ???

          fun a(): i32 = qq(Custom(1))
          fun b(t: Custom): i32 = qq(t)
          fun c(t: x): void = qq(t)
          fun d(i: i32): i32 = qq(Custom(i))
          fun e(t: Nila): f32 = qq(t)
          fun f(): f32 = qq(Nila)
          ---
          fun(x: ref) -> void & fun(x: Nila) -> f32 & fun(x: Custom) -> i32
          fun() -> i32
          fun(t: Custom) -> i32
          fun(t: x) -> void
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
          fun qq(x: Nila): f32 = ???

          fun a(): i32 = qq(Custom(1))
          fun b(t: Custom): i32 = qq(t)
          fun c(t: x): void = qq(t)
          fun d(i: i32): i32 = qq(Custom(i))
          fun e(t: Nila): f32 = qq(t)
          fun f(): f32 = qq(Nila)
          ---
          fun(x: Custom) -> i32 & fun(x: ref) -> void & fun(x: Nila) -> f32
          fun() -> i32
          fun(t: Custom) -> i32
          fun(t: x) -> void
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
        Cannot find member "apply" in (alias f32)
      `;

      checkMainType`
        fun main(): f32 = f32
        ---
        fun() -> f32
        ---
        Cannot find member "apply" in (alias f32)
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
        fun as(x: f32): boolean = ???
        fun as(x: f32): boolean = ???
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
    });

    describe.skip('type alias', () => {
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

    describe('struct "is"', () => {
      checkMainType`
        type Enum {
          A
          B
          C
        }

        var value1: Enum = A
        var value2: A | B = A
        var value3: A = A

        var x1 = value1 is A
        var y1 = value1 is Enum
        var z1 = value1 is B

        var x2 = value2 is A
        var y2 = value2 is Enum
        var z2 = value2 is B

        var x3 = value3 is A
        var y3 = value3 is Enum
        var z3 = value3 is B
        ---
        value1 := (alias Enum (union (alias A) (alias B) (alias C)))
        value2 := (union (alias A) (alias B))
        value3 := (alias A (struct A))
        x1 := (alias boolean (native boolean))
        y1 := (alias boolean (native boolean))
        z1 := (alias boolean (native boolean))
        x2 := (alias boolean (native boolean))
        y2 := (alias boolean (native boolean))
        z2 := (alias boolean (native boolean))
        x3 := (alias boolean (native boolean))
        y3 := (alias boolean (native boolean))
        z3 := (alias boolean (native boolean))
        ---
        This statement is always false, type A can never be B
      `;

      checkMainType`
        type Enum {
          A
        }

        fun x(x: u64): boolean = x is A
        fun x(x: f32): boolean = x is A
        ---
        fun(x: u64) -> boolean & fun(x: f32) -> boolean
        ---
        "is" expression can only be used with reference types,
        "is" expression can only be used with reference types,
      `;
    });

    describe('getters and setters', () => {
      checkMainType`
        struct X(value: i32)

        fun main(a: X): i32 = a.value
        ---
        fun(a: X) -> i32
      `;

      checkMainType`
        struct X(value: i32)

        fun main(): i32 = {
          val x = X(10)
          x.value = 99
          x.value
        }
        ---
        fun() -> i32
      `;

      checkMainType`
        struct X(value: i32)

        fun main(): i32 = {
          val x = X(10)
          x.value = false
          x.value
        }
        ---
        fun() -> i32
        ---
        Could not find a valid overload
      `;
    });

    describe('match is not exhaustive', () => {
      checkMainType`
        fun test(x: i32): void = {
          x match {
            case 1 -> assert(true)
            else -> panic()
          }
        }
        ---
        fun(x: i32) -> void
      `;
      checkMainType`
        type Enum {
          A
          B
        }

        fun x(x: Enum): i32 =
          x match {
            case is A -> 1
            case is Enum -> 1
          }
        ---
        fun(x: Enum) -> i32
      `;

      checkMainType`
        type Enum {
          A
          B
        }

        fun x(x: Enum): i32 =
          x match {
            case is A -> 1
            case is B -> 1
          }
        ---
        fun(x: Enum) -> i32
      `;

      checkMainType`
        type Enum {
          A
          B
        }

        fun x(x: Enum): i32 =
          x match {
            case is Enum -> 1
          }
        ---
        fun(x: Enum) -> i32
      `;

      checkMainType`
        type Enum {
          A
          B
        }

        fun x(x: Enum): i32 =
          x match {
            case is Enum -> 1
            else -> 3
          }
        ---
        fun(x: Enum) -> i32
        ---
        Unreachable
      `;

      checkMainType`
        type Enum {
          A
          B
        }

        fun x(x: Enum): i32 =
          x match {
            case is ref -> 1
            else -> 3
          }
        ---
        fun(x: Enum) -> i32
        ---
        Unreachable
      `;

      checkMainType`
        fun x(x: ref): i32 =
          x match {
            case is ref -> 1
            else -> 3
          }
        ---
        fun(x: ref) -> i32
        ---
        Unreachable
      `;

      checkMainType`
        type Enum {
          A
          B
        }

        fun x(x: ref): i32 =
          x match {
            case is Enum -> 1
            else -> 3
          }
        ---
        fun(x: ref) -> i32
      `;

      checkMainType`
        type Enum {
          A
          B
        }

        fun x(x: ref): i32 =
          x match {
            case is A -> 1
            case is B -> 1
            else -> 3
          }
        ---
        fun(x: ref) -> i32
      `;

      checkMainType`
        type Enum {
          A
          B
        }

        fun x(x: ref): i32 =
          x match {
            case is A -> 1
            case is B -> 1
          }
        ---
        fun(x: ref) -> i32
        ---
        Match is not exhaustive
      `;

      checkMainType`
        type Enum {
          A
          B
        }

        fun x(x: Enum): i32 =
          x match {
            case is A -> 1
            case is B -> 1
            case is Enum -> 1
          }
        ---
        fun(x: Enum) -> i32
        ---
        Unreachable
      `;

      checkMainType`
        type Enum {
          A
          B
        }

        fun x(x: Enum): i32 =
          x match {
            case is A -> 1
          }
        ---
        fun(x: Enum) -> i32
        ---
        Match is not exhaustive
      `;

      checkMainType`
        type Enum {
          A
          B
        }

        fun x(x: A | B): i32 =
          x match {
            case is A -> 1
          }
        ---
        fun(x: A | B) -> i32
        ---
        Match is not exhaustive
      `;

      checkMainType`
        type Enum {
          A
          B
        }

        fun x(x: A | B): i32 =
          x match {
            case is A -> 1
            else -> 1
          }
        ---
        fun(x: A | B) -> i32
      `;

      checkMainType`
        type Enum {
          A
          B
        }

        type Enum2 {
          C
          D
        }

        fun x(x: Enum | Enum2): i32 =
          x match {
            case is A -> 1
            case is B -> 1
            case is C -> 1
          }
        ---
        fun(x: Enum | Enum2) -> i32
        ---
        Match is not exhaustive
      `;

      checkMainType`
        type Enum {
          A
          B
        }

        type Enum2 {
          C
          D
        }

        fun x(x: Enum | Enum2): i32 =
          x match {
            case is A -> 1
            case is B -> 1
            case is C -> 1
            case is D -> 1
          }
        ---
        fun(x: Enum | Enum2) -> i32
      `;

      checkMainType`
        type Enum {
          A
          B
        }

        type Enum2 {
          C
          D
        }

        fun x(x: A | B | C): i32 =
          x match {
            case is A -> 1
            case is B -> 1
            case is C -> 1
          }
        ---
        fun(x: A | B | C) -> i32
      `;

      checkMainType`
        type Enum {
          A
          B
        }

        type Enum2 {
          C
          D
        }

        fun x(x: A | B | C): i32 =
          x match {
            case is A -> 1
            case is B -> 1
            case is C -> 1
          }
        ---
        fun(x: A | B | C) -> i32
      `;

      checkMainType`
        type Enum {
          A
          B
        }

        type Enum2 {
          C
          D
        }

        fun x(x: A | B | C | D): i32 =
          x match {
            case is A -> 1
            case is B -> 1
            case is C -> 1
          }
        ---
        fun(x: A | B | C | D) -> i32
        ---
        Match is not exhaustive
      `;
    });

    describe('never type', () => {
      checkMainType`
        fun a(x: i32): i32 =
          if(x ==0)
            x
          else
            panic()

        fun b(x: i32): i32 =
          x match {
            case 0 -> x
            else -> panic()
          }
        ---
        fun(x: i32) -> i32
        fun(x: i32) -> i32
      `;
    });

    describe('UnionType', () => {
      const aliasOf = (name: string, type: Type) => new TypeAlias(Nodes.NameIdentifierNode.fromString(name), type);
      const struct = (name: string) => new StructType(name);
      const union = (...of: Type[]) => new UnionType(of);
      const namedUnion = (name: string, ...of: Type[]) => aliasOf(name, union(...of));
      const structAlias = (name: string) => aliasOf(name, struct(name));

      describe('expansion', () => {
        it('should expand types recursively', () => {
          const A = structAlias('A');
          const B = structAlias('B');
          const C = structAlias('C');
          const D = structAlias('D');
          const AB = union(A, B);
          const ABC = union(AB, C);

          const simplified = union(
            AB,
            ABC,
            D,
            union(union(union(struct('F'), struct('G')), struct('H')), struct('I'))
          ).expand();

          expect(simplified.inspect(100)).to.eq(
            `(union (alias A (struct A)) (alias B (struct B)) (alias C (struct C)) (alias D (struct D)) (struct F) (struct G) (struct H) (struct I))`.trim()
          );
        });
      });

      describe('subtract', () => {
        it('should subtract elements from non-expanded union', () => {
          const A = structAlias('A');
          const B = structAlias('B');
          const C = structAlias('C');
          const D = structAlias('D');
          const AB = union(A, B);
          const ABC = union(AB, C);

          const newType = union(
            AB,
            ABC,
            D,
            union(union(union(struct('F'), struct('G')), struct('H')), struct('I'))
          ).subtract(D);

          expect(newType.inspect(100)).to.eq(
            `(union (alias A (struct A)) (alias B (struct B)) (alias C (struct C)) (struct F) (struct G) (struct H) (struct I))`.trim()
          );
        });

        it('should yield (never) when subtracting (ref)', () => {
          const A = structAlias('A');
          const B = structAlias('B');
          const C = structAlias('C');
          const D = structAlias('D');
          const AB = union(A, B);
          const ABC = union(AB, C);

          const newType = union(
            AB,
            ABC,
            D,
            union(union(union(struct('F'), struct('G')), struct('H')), struct('I'))
          ).subtract(RefType.instance);

          expect(newType.inspect(100)).to.eq(`(never)`.trim());
        });

        it('should yield (never) when subtracting (ref) and (ref) is present in the union', () => {
          const A = structAlias('A');
          const B = structAlias('B');
          const C = structAlias('C');
          const D = structAlias('D');
          const AB = union(A, B, RefType.instance);
          const ABC = union(AB, C);

          const newType = union(
            AB,
            ABC,
            D,
            union(union(union(struct('F'), struct('G')), struct('H')), struct('I'))
          ).subtract(RefType.instance);

          expect(newType.inspect(100)).to.eq(`(never)`.trim());
        });

        it('should yield (never) when subtracting (alias (ref))', () => {
          const A = structAlias('A');
          const B = structAlias('B');
          const C = structAlias('C');
          const D = structAlias('D');
          const AB = union(A, B);
          const ABC = union(AB, C);

          const newType = union(
            AB,
            ABC,
            D,
            union(union(union(struct('F'), struct('G')), struct('H')), struct('I'))
          ).subtract(aliasOf('ref', RefType.instance));

          expect(newType.inspect(100)).to.eq(`(never)`.trim());
        });

        it('should subtract entire unioimpl from non-expanded union', () => {
          const A = structAlias('A');
          const B = structAlias('B');
          const C = structAlias('C');
          const D = structAlias('D');
          const AB = union(A, B);
          const ABC = union(AB, C);

          const newType = union(
            AB,
            ABC,
            D,
            union(union(union(struct('F'), struct('G')), struct('H')), struct('I'))
          ).subtract(ABC);

          expect(newType.inspect(100)).to.eq(
            `(union (alias D (struct D)) (struct F) (struct G) (struct H) (struct I))`.trim()
          );
        });

        it('should subtract entire unioimpl from non-expanded union', () => {
          const A = structAlias('A');
          const B = structAlias('B');
          const C = structAlias('C');
          const D = structAlias('D');
          const AB = union(A, B);
          const ABC = union(AB, C);

          const simplified = UnionType.of(
            union(AB, ABC, D, union(union(union(struct('F'), struct('G')), struct('H')), struct('I'))).expand()
          );

          expect(simplified.inspect(100)).to.eq(
            `(union (alias A (struct A)) (alias B (struct B)) (alias C (struct C)) (alias D (struct D)) (struct F) (struct G) (struct H) (struct I))`.trim()
          );

          const newType = simplified.subtract(ABC);

          expect(newType.inspect(100)).to.eq(
            `(union (alias D (struct D)) (struct F) (struct G) (struct H) (struct I))`.trim()
          );
        });

        it('subtract A from AB should yield B', () => {
          const A = structAlias('A');
          const B = structAlias('B');
          const AB = union(A, B);

          expect(AB.subtract(A).inspect(100)).to.eq(`(alias B (struct B))`.trim());
          expect(AB.subtract(A).inspect(100)).to.eq(`(alias B (struct B))`.trim());
        });

        it('subtract A and B from AB should yield NeverType', () => {
          const A = structAlias('A');
          const B = structAlias('B');
          const AB = union(A, B);

          expect(AB.subtract(AB).inspect(100)).to.eq(`(never)`.trim());
        });

        it('should subtract elements from expanded union', () => {
          const A = structAlias('A');
          const B = structAlias('B');
          const C = structAlias('C');
          const D = structAlias('D');
          const AB = union(A, B);
          const ABC = union(AB, C);

          const simplified = UnionType.of(
            union(AB, ABC, D, union(union(union(struct('F'), struct('G')), struct('H')), struct('I'))).expand()
          );

          expect(simplified.inspect(100)).to.eq(
            `(union (alias A (struct A)) (alias B (struct B)) (alias C (struct C)) (alias D (struct D)) (struct F) (struct G) (struct H) (struct I))`.trim()
          );

          const newType = simplified.subtract(D);

          expect(newType.inspect(100)).to.eq(
            `(union (alias A (struct A)) (alias B (struct B)) (alias C (struct C)) (struct F) (struct G) (struct H) (struct I))`.trim()
          );
        });
      });

      describe('simplification', () => {
        it('should simplify duplicated types', () => {
          const A = struct('A');
          const B = struct('B');
          const C = struct('C');
          const D = struct('D');

          const union = new UnionType([A, A, A, A, B, C, D, D]);
          const simplified = union.simplify();

          expect(simplified.inspect(100)).to.eq(
            `
              (union (struct A) (struct B) (struct C) (struct D))
            `.trim()
          );
        });

        it('should simplify two equal types into one of them', () => {
          const A = struct('A');

          const union = new UnionType([A, A]);
          const simplified = union.simplify();

          expect(simplified.inspect(100)).to.eq(`(struct A)`.trim());
        });

        it('should simplify deeply nested unions', () => {
          const A = struct('A');
          const B = struct('B');
          const C = struct('C');
          const D = struct('D');
          const AB = namedUnion('AB', A, B);
          const CD = namedUnion('CD', C, D);

          const simplified = union(A, B, C, D, AB, CD, D, D).simplify();

          expect(simplified.inspect(100)).to.eq(
            `(union (alias AB (union (struct A) (struct B))) (alias CD (union (struct C) (struct D))))`.trim()
          );
        });

        it('should simplify deeply nested unioimpl avoiding conflicts', () => {
          const A = struct('A');
          const B = struct('B');
          const C = struct('C');
          const D = struct('D');
          const AB = union(A, B);
          const BC = union(B, C);

          const simplified = union(A, B, C, D, AB, BC, D, D).simplify();

          expect(simplified.inspect(100)).to.eq(
            `
              (union (struct A) (struct B) (struct C) (struct D))
            `.trim()
          );
        });

        it('should simplify deeply nested unioimpl avoiding conflicts with aliases', () => {
          const A = structAlias('A');
          const B = structAlias('B');
          const C = structAlias('C');
          const D = structAlias('D');
          const AB = union(A, B);
          const BC = union(B, C);

          const simplified = union(A, B, C, D, AB, BC, D, D).simplify();

          expect(simplified.inspect(100)).to.eq(
            `
            (union (alias A (struct A)) (alias B (struct B)) (alias C (struct C)) (alias D (struct D)))
            `.trim()
          );
        });

        it('should simplify deeply nested unioimpl avoiding conflicts with aliases and extra type in unions', () => {
          const A = structAlias('A');
          const B = structAlias('B');
          const C = structAlias('C');
          const D = structAlias('D');
          const F = structAlias('F');
          const AB = union(A, B, structAlias('AB1'));
          const BC = union(B, C, structAlias('BC1'));

          const simplified = union(A, B, C, D, AB, BC, D, D, F).simplify();

          expect(simplified.inspect(100)).to.eq(
            `(union (alias A (struct A)) (alias B (struct B)) (alias C (struct C)) (alias D (struct D)) (alias F (struct F)) (alias AB1 (struct AB1)) (alias BC1 (struct BC1)))`.trim()
          );
        });

        it('should not remove ref types', () => {
          const A = struct('A');
          const B = struct('B');
          const C = struct('C');
          const D = struct('D');

          const union = new UnionType([A, A, A, A, B, C, D, D, RefType.instance]);
          const simplified = union.simplify();

          expect(simplified.inspect(100)).to.eq(
            `
              (union (struct A) (struct B) (struct C) (struct D) (ref ?))
            `.trim()
          );
        });

        it('should not simplify aliases to the same type (i32)', () => {
          const A = aliasOf('A', InjectableTypes.i32);
          const B = aliasOf('B', InjectableTypes.i32);

          const union = new UnionType([A, B, B]);
          const simplified = union.simplify();

          expect(simplified.inspect(100)).to.eq(
            `
              (union (alias A (native i32)) (alias B (native i32)))
            `.trim()
          );

          expect(A.canBeAssignedTo(B)).to.eq(true, 'A can be assigned to B');
          expect(B.canBeAssignedTo(A)).to.eq(true, 'B can be assigned to A');
          expect(B.canBeAssignedTo(B)).to.eq(true, 'B can be assigned to B');
          expect(A.canBeAssignedTo(A)).to.eq(true, 'A can be assigned to A');
        });

        it('should not simplify aliases to the same type (ref)', () => {
          const A = aliasOf('A', RefType.instance);
          const B = aliasOf('B', RefType.instance);

          const union = new UnionType([A, B, B]);
          const simplified = union.simplify();

          expect(simplified.inspect(100)).to.eq(
            `
              (union (alias A (ref ?)) (alias B (ref ?)))
            `.trim()
          );

          expect(A.canBeAssignedTo(B)).to.eq(true, 'A can be assigned to B');
          expect(B.canBeAssignedTo(A)).to.eq(true, 'B can be assigned to A');
          expect(B.canBeAssignedTo(B)).to.eq(true, 'B can be assigned to B');
          expect(A.canBeAssignedTo(A)).to.eq(true, 'A can be assigned to A');
        });

        it('should structs are assignable to refs', () => {
          const A = aliasOf('A', struct('A'));
          const B = aliasOf('B', struct('B'));

          const union = new UnionType([A, B, B]);
          const simplified = union.simplify();

          expect(simplified.inspect(100)).to.eq(
            `
              (union (alias A (struct A)) (alias B (struct B)))
            `.trim()
          );

          expect(A.canBeAssignedTo(B)).to.eq(false, 'A cannot be assigned to B');
          expect(B.canBeAssignedTo(A)).to.eq(false, 'B cannot be assigned to A');
          expect(B.canBeAssignedTo(B)).to.eq(true, 'B can be assigned to B');
          expect(A.canBeAssignedTo(A)).to.eq(true, 'A can be assigned to A');
          expect(B.canBeAssignedTo(B.of)).to.eq(true, 'B can be assigned to B');
          expect(B.of.canBeAssignedTo(B)).to.eq(true, 'B can be assigned to B');
          expect(A.canBeAssignedTo(A.of)).to.eq(true, 'A can be assigned to A');
          expect(A.of.canBeAssignedTo(A)).to.eq(true, 'A can be assigned to A');
          expect(B.of.canBeAssignedTo(B.of)).to.eq(true, 'B can be assigned to B');
          expect(A.of.canBeAssignedTo(A.of)).to.eq(true, 'A can be assigned to A');
        });

        it('should not remove alias to ref types', () => {
          const A = struct('A');
          const B = struct('B');
          const C = struct('C');
          const D = struct('D');

          const ref = aliasOf('Ref', RefType.instance);

          const union = new UnionType([A, A, A, A, B, C, D, D, ref]);
          const simplified = union.simplify();

          expect(simplified.inspect(100)).to.eq(
            `
              (union (struct A) (struct B) (struct C) (struct D) (alias Ref (ref ?)))
            `.trim()
          );
        });

        it('should remove types present inside the unions', () => {
          const A = struct('A');
          const B = struct('B');
          const C = struct('C');
          const D = struct('D');

          const unionCD = new UnionType([C, D]);

          const union = new UnionType([A, A, A, A, B, C, unionCD, D, D]);

          const simplified = union.simplify();

          expect(simplified.inspect(100)).to.eq(
            `
              (union (struct A) (struct B) (union (struct C) (struct D)))
            `.trim()
          );
        });

        it('should remove types present inside the unioimpl with aliases', () => {
          const A = struct('A');
          const B = struct('B');
          const C = struct('C');
          const D = struct('D');

          const unionCD = aliasOf('CDUnion', new UnionType([C, D]));

          const union = new UnionType([A, A, A, A, B, C, unionCD, D, D]);

          const simplified = union.simplify();

          expect(simplified.inspect(0)).to.eq(
            `
              (union (struct A) (struct B) (alias CDUnion))
            `.trim()
          );
        });
      });
    });

    describe('struct pattern matching', () => {
      checkMainType`
        type Enum {
          A
        }

        type Color {
          Red
        }

        var x: ref = ???

        var y = x match {
          case x is Enum -> x
          else -> Red
        }
        ---
        x := (alias ref (ref ?))
        y := (union (alias Enum) (alias Red))
      `;

      checkMainType`
        type Enum {
          A
          B
          C
        }

        type Color {
          Red
        }

        fun y(x: ref): Enum | Red = x match {
          case x is Enum -> x
          else -> Red
        }
        ---
        fun(x: ref) -> Enum | Red
      `;

      checkMainType`
        type Enum {
          A
          B
        }

        type Enum2 {
          C
          D
        }

        fun x(x: Enum | Enum2 | A | B | C | D): i32 =
          x match {
            case is A -> 1
            case is B -> 1
            case is B -> 1
            else -> 1
          }
        ---
        fun(x: Enum | Enum2 | A | B | C | D) -> i32
        ---
        Type mismatch: Type "C | D" is not assignable to "B"
        Unreachable code
      `;

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
        value := (alias Enum (union (alias A) (alias B) (alias C)))
        x := (alias B (struct B))
        y := (union (alias A) (alias B))
        z := (alias Enum (union (alias A) (alias B) (alias C)))
      `;

      checkMainType`
        type Enum {
          A
          B
        }

        type Enum2 {
          C
          D
        }

        fun x(x: Enum): i32 =
          x match {
            case is A -> 1
            case is B -> 1
            case is C -> 1
          }
        ---
        fun(x: Enum) -> i32
        ---
        Unreachable
      `;

      checkMainType`
        type Enum {
          A
        }

        fun x(x: u64): i32 =
          x match {
            case is A -> 1
            else -> 1
          }
        ---
        fun(x: u64) -> i32
        ---
        "is" expression can only be used with reference types, used with: u64
      `;

      checkMainType`
        type Enum {
          A
          B
        }

        fun x(x: B): i32 =
          x match {
            case is A -> 1
            else -> 1
          }
        ---
        fun(x: B) -> i32
        ---
        Type mismatch: Type "B" is not assignable to "A"
        Unreachable code
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
      // TODO: Deconstruct
      describe.skip('deconstruct', () => {
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
          }
          ---
          fun(color: Color) -> boolean
          fun() -> void
        `;
      });
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
        x := (alias Custom (struct Custom))
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
        type i32
        type f32
        type boolean

        impl boolean {
          fun +(x: boolean, y: i32): f32 = 1.0
        }

        fun main(): f32 = true + 3
        ---
        fun() -> f32
      `;

      checkMainType`
        type i32
        type f32
        type boolean

        impl boolean {
          fun +(x: boolean, y: i32): i32 = 1
        }
        impl i32 {
          fun +(x: i32, y: f32): f32 = 1.0
        }

        fun main(): f32 = true + 3 + 1.0
        ---
        fun() -> f32
      `;

      checkMainType`
        type i32
        type f32
        type boolean

        impl boolean {
          fun +(x: boolean, y: i32): i32 = 1
        }

        fun main(): f32 = true + 3
        ---
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
        AL_BITS := (alias i32 (native i32))
        AL_SIZE := (alias i32 (native i32))
        AL_MASK := (alias i32 (native i32))
        MAX_SIZE_32 := (alias i32 (native i32))
        HEAP_BASE := (alias i32 (native i32))
        startOffset := (alias i32 (native i32))
        offset := (alias i32 (native i32))
        lastPtr := (alias i32 (native i32))
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
          lastPtr := (alias i32 (native i32))
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

        fun matcher(x: i32): i32 =
          x match {
            case 1 -> 1
            else -> 2
          }
        ---
        fun(x: i32) -> i32
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

      checkMainType`
        type void

        fun matcher(): void = {}
        ---
        fun() -> void
      `;

      checkMainType`

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
        fun malloc(size: i32): i32 = %wasm {
          (get_local $size)
        }

        fun main(): i32 = malloc(1)
        ---
        fun(size: i32) -> i32
        fun() -> i32
      `;

      checkMainType`

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

        fun matcher(x: i32): i32 | f32 =
          x match {
            case 1 -> 1
            else -> 2.1
          }
        ---
        fun(x: i32) -> i32 | f32
      `;

      checkMainType`
        fun gte(x: i32, y: i32): boolean = {
          val test = x >= y
          test
        }
        ---
        fun(x: i32, y: i32) -> boolean
      `;

      checkMainType`
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

        fun x(): boolean = 1 > 2
        ---
        fun() -> boolean
      `;

      checkMainType`

        fun x(): boolean = { 1 > 2 }
        ---
        fun() -> boolean
      `;

      checkMainType`

        fun x(): i32 = {
          1 > 2
          1
        }
        ---
        fun() -> i32
      `;

      checkMainType`

        fun gte(x: i32): i32 = {
          var test = 0
          test = 1 + x
          test
        }
        ---
        fun(x: i32) -> i32
      `;

      checkMainType`

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

        fun gte(x: i32): i32 = {
          var test = 0
          test = test + x
          test
        }
        ---
        fun(x: i32) -> i32
      `;

      checkMainType`

        fun gte(x: i32): i32 = {
          var test = 0
          test = test + x
          test
        }
        ---
        fun(x: i32) -> i32
      `;

      checkMainType`
        var x = 1
        fun getX(): i32 = x
        ---
        x := (alias i32 (native i32))
        fun() -> i32
      `;

      checkMainType`
        type void
        fun getX(x: i32): void = {}
        ---
        fun(x: i32) -> void
      `;

      checkMainType`
        fun getX(x: i32): i32 = x
        ---
        fun(x: i32) -> i32
      `;

      checkMainType`
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
        fun getX(): i32 = {
          1.0
          1.0
          1
        }
        ---
        fun() -> i32
      `;

      checkMainType`
        fun gte(x: i32, y: i32): boolean = x >= y
        ---
        fun(x: i32, y: i32) -> boolean
      `;

      checkMainType`
        type void

        fun getX(x: i32): void =
          if (x > 0) {
            x
          }
        ---
        fun(x: i32) -> void
      `;

      checkMainType`
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
        type void

        fun getX(): void =
          if (1 > 0) {
            1
          }
        ---
        fun() -> void
      `;

      checkMainType`
        type void

        var x = 1

        fun getX(): void =
          if (x > 0) {
            x
          }
        ---
        x := (alias i32 (native i32))
        fun() -> void
      `;

      checkMainType`
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
        x := (alias i32 (native i32))
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
          try {
            typePhase.ensureIsValid();

            return print(typePhase.typeGraph);
          } catch (e) {
            // console.log(print(typePhase.typeGraph));
            throw e;
          }
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
              result.parsingContext.messageCollector.error(e as any);
              console.log(printErrors(result.parsingContext));
            }
            throw e;
          }

          try {
            const typePhase = new TypePhaseResult(result);
            typePhase.execute();
            return printAST(typePhase.document);
          } catch (e) {
            result.parsingContext.messageCollector.error(e);
            console.log(printErrors(result.parsingContext));
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
          } catch (e) {
            if (!typePhase.parsingContext.messageCollector.errors.length) {
              throw e;
            }
            return printErrors(typePhase.parsingContext, true);
          }

          throw new Error('Type phase did not fail');
        },
        '.txt'
      );
    });
  });
});
