declare var describe, it, require, console;

import { folderBasedTest, testParseToken } from './TestHelpers';
import { CanonicalPhaseResult } from '../dist/parser/phases/canonicalPhase';
import { expect } from 'chai';
import { ParsingContext } from '../dist/parser/ParsingContext';
import { printAST } from '../dist/utils/astPrinter';

describe('Parser', () => {
  const phases = function(txt: string, fileName: string): CanonicalPhaseResult {
    const parsingContext = new ParsingContext();
    const parsing = parsingContext.getParsingPhaseForContent(fileName, txt);

    return new CanonicalPhaseResult(parsing);
  };
  describe('Failing examples', () => {
    folderBasedTest(
      '**/parser-error/*.lys',
      phases,
      async (result, e) => {
        if (!e && result && result.isSuccess()) {
          throw new Error('The test did not fail');
        }
        return (e || result.parsingContext.messageCollector.errors[0]).message;
      },
      '.txt',
      true
    );
  });

  let testCount = 0;

  function getFileName() {
    return `parser_tests_${testCount++}.lys`;
  }

  describe('Basic sanity tests', function() {
    function test(literals, ...placeholders) {
      let result = '';

      // interleave the literals with the placeholders
      for (let i = 0; i < placeholders.length; i++) {
        result += literals[i];
        result += placeholders[i];
      }

      // add the last literal
      result += literals[literals.length - 1];
      testParseToken(result, getFileName(), 'Document', null, phases);
    }

    function testEquivalence(a: string, b: string) {
      let aDocument: CanonicalPhaseResult = null;

      testParseToken(
        a,
        getFileName(),
        'Document',
        async (doc, err) => {
          if (err) throw err;
          aDocument = doc;
        },
        phases
      );
      testParseToken(
        b,
        getFileName(),
        'Document',
        async (doc, err) => {
          if (err) throw err;
          expect(printAST(aDocument.document)).to.eq(printAST(doc.document));
        },
        phases
      );
    }

    describe('operator precedence', () => {
      testEquivalence(`val z = (HEAP_BASE + AL_MASK) & ~AL_MASK`, `val z = (HEAP_BASE + AL_MASK) & (~AL_MASK)`);
      testEquivalence(`val z = newPtr > pagesBefore << 16`, `val z = newPtr > (pagesBefore << 16)`);
      testEquivalence(
        `var x = if (a) 1 else match b { else -> 1 }`,
        `var x = (   if(a) (1) else (match (b) { else -> 1 })   )`
      );
      testEquivalence(
        `var x = a | b ^ c & d | e || f && g || h && y && j & 5`,
        `var x = (a | (b ^ (c & d)) | e) || (f && g) || (h && y && (j & 5))`
      );
      testEquivalence(`var x = a ~= b !== c == b === c`, `var x = ((((a ~= b) !== c) == b) === c)`);
      testEquivalence(`var x = a as int`, `var x = (a) as int`);
      testEquivalence(`var x = a is int`, `var x = (a) is int`);
      testEquivalence(`var x = -1 as int`, `var x = (-1) as int`);
      testEquivalence(`var x = -1 is int`, `var x = (-1) is int`);
      testEquivalence(`var x = -a as int`, `var x = (-a) as int`);
      testEquivalence(`var x = ~a as int`, `var x = (~a) as int`);
      testEquivalence(`var x = ~a is int`, `var x = (~a) is int`);
      testEquivalence(`var x = 123 + a as int`, `var x = 123 + (a as int)`);
      testEquivalence(`var x = 123 + a is int`, `var x = 123 + (a is int)`);
      testEquivalence(`var x = 1 + 2`, `var x = (1 + 2)`);
      testEquivalence(`var x = 1 + 2 * 3`, `var x = (1 + (2 * 3))`);
      testEquivalence(`var x = 1 + 2 * 3 - 4`, `var x = (1 + (2 * 3)) - 4`);
      testEquivalence(`var x = 1 + 2 * 3 - 4 / 5`, `var x = (1 + (2 * 3)) - (4 / 5)`);
      testEquivalence(`var x = 1 + 2 * 3 - 4 / 5`, `var x = (1 + (2 * 3)) - (4 / 5)`);
      testEquivalence(`var x = -test.a().b()`, `var x = -((test.a()).b())`);
      testEquivalence(`var x = -test.a() - 3`, `var x = (-(test.a())) - 3`);
      testEquivalence(`var x = ~test.a() - 3`, `var x = (~(test.a())) - 3`);
      testEquivalence(`var x = ~test - 3`, `var x = (~test) - 3`);
      testEquivalence(`var x = 1 - -test - 3`, `var x = (1 - (-test)) - 3`);
      testEquivalence(`var x = a.b.c.d.e + 1 * 3`, `var x = (a.b.c.d.e + (1 * 3))`);
      testEquivalence(
        `var x =    color.r  * (2^16)  |   color.g  * (2^8)  |  color.b`,
        `var x = (((color.r) * (2^16)) | ((color.g) * (2^8)) | (color.b))`
      );
      testEquivalence(
        `var x =   r * (2^16)  |  g * (2^8)  | b                               `,
        `var x = ((r * (2^16)) | (g * (2^8)) | b)                              `
      );
      testEquivalence(
        `fun main(color: Color): i32 =
            color.r * 0x10000 |
            color.g * 0x100 |
            color.b`,
        `fun main(color: Color): i32 = (color.r * 0x10000) | (color.g * 0x100) | (color.b)`
      );
    });

    describe('imports', () => {
      test`
        import * from module
        import * from module2
        import * from module::submodule
        import * from github::menduz::aureum
      `;

      test`
        import module
        import module2
        import module::submodule
        import github::menduz::aureum
      `;

      test`
        import module as X
        import module2 as Y
        import module::submodule as Z
        import github::menduz::aureum as W
      `;
    });

    describe('loop', () => {
      test`
        fun a(): void = {
          continue
        }
        `;
      test`
        fun b(): void = {
          break
        }
        `;
      test`
        fun c(): void = {
          loop { continue }
        }
        `;
      test`
        fun d(): void = {
          loop { break }
        }
        `;
      test`
        fun e(): void = {
          loop {
            continue
            break
          }
        }
        `;
      test`
        fun f(): void = {
          loop {
            break
            continue
          }
        }
        `;
      test`
        fun g(): void = {
          loop
          continue
        }
        `;
      test`
        fun h(): void = {
          loop
          break
        }
        `;
      test`
        fun i(): void = {
          var x = 1
          loop {
            x = {
              if (x == 1) continue
              x + 1
            }
          }
        }
        `;
      test`
        fun j(e: i32): void = {
          var x = 1
          loop {
            x = {
              match e {
                case 1 -> {
                  if (x >= 1) {
                    match x {
                      case 1 -> {
                        continue
                        4
                      }
                      else -> {
                        break
                        3
                      }
                    }
                  }
                }
                else -> continue
              }
              x + 1
            }
          }
        }
      `;
    });
    describe('namespaces', () => {
      test`
        type void    = %stack { lowLevel="void" asd="asd" ddd=0x12313 }
        type void    = %stack {}
        type void    = %stack { }
        type void    = %stack{ }
        type void    = %stack{ a=false }
      `;
      test`type Enum = %struct{a: i32}`;
      test`type Enum = %struct{}`;
      test`type Enum = %struct{a,b,c}`;
      test`type Enum = %struct{a:i32,b: string}`;
      test`
            type Enum = %struct{a: i32}
            type Enum = %struct{}
            type Enum = %struct{a,b,c}
            type Enum = %struct{a:i32,b: string}
      `;
      test`
        type Enum
        type Enum= %struct{}
        type Enum = %struct{}
        type Enum =                    %struct{}
        impl Enum {

        } // a
        type Enum =%struct{} impl Enum {}
        type Enum impl Enum {}
        type Enum impl Enum {
          //
        } // b
        type Enum impl Enum{
          //
        } // c
        type Enum impl Enum
        {

        } // d
      `;
      test`
        impl Enum {
          val test = 1
        }
      `;
      test`
        type AA = BB | CC
        type BB
        type CC
      `;
      test`
        impl Enum {
          val test = 1
        }

        fun as(self: Test): X = {
          x() as X
        }
      `;
      test`
        impl Enum {
          val test = 1

          private fun x(): int = test

          fun as(self: Test): X = {
            x() as X
          }
        }
      `;
    });

    describe('operator definition', () => {
      test`
        fun as(x: i32, y: boolean): void = {}
        fun is(x: i32, y: boolean): void = {}
        fun +(x: i32, y: boolean): void = {}
        fun -(x: i32, y: boolean): void = {}
        fun >>(x: i32, y: boolean): void = {}
        fun <<(x: i32, y: boolean): void = {}
        fun ==(x: i32, y: boolean): void = {}
        fun !=(x: i32, y: boolean): void = {}
        fun +(x: i32, y: boolean): void = {}
        fun *(x: i32, y: boolean): void = {}
        fun **(x: i32, y: boolean): void = {}
        fun /(x: i32, y: boolean): void = {}
        fun %(x: i32, y: boolean): void = {}
        fun >(x: i32, y: boolean): void = {}
        fun <(x: i32, y: boolean): void = {}
        fun >=(x: i32, y: boolean): void = {}
        fun <=(x: i32, y: boolean): void = {}
        fun ~=(x: i32, y: boolean): void = {}
      `;
    });
    describe('code blocks', () => {
      test`
        fun main(): void = {}
      `;
      test`
        fun main(): i32 = {
          var a: i32 = 1
          var a = 2
          val a = 3
          val a: i32 = 4
          a = 5
          a
        }
      `;
    });

    describe('WasmExpression', () => {
      test`
        private fun test(): void = %wasm {}
      `;
      test`
        fun malloc(size: i32): i32 = %wasm {
          (local $address i32)
          (set_local $address (get_global freeblock))
          (set_global
            $freeblock
            (i32.add
              (get_local $address)
              (get_local $size)
            )
          )
          (get_local $address)
        }
      `;
      test`
        fun malloc(size: i32): i32 = %wasm {
          (local $address i32)
        }
      `;
      test`
      fun strAdd(a: i32, b: i32): i32 = %wasm {
        (local $sum i32)
        (local $aSize i32)
        (local $newStr i32)
        (return
          (set_local $aSize (i32.load8_u a))
          (set_local $sum
            (i32.sub
              (i32.add
                (get_local $aSize)
                (i32.load8_u b)
              )
              (i32.const 1)
            )
          )
          (set_local $newStr
            (call malloc
              (i32.add
                (get_local $sum)
                (i32.const 1)
              )
            )
          )
          (i32.store8
            (get_local $newStr)
            (get_local $sum)
          )
          (call string_copy (get_local $a) (get_local $newStr))
          (call string_copy
            (get_local $b)
            (i32.sub
              (i32.add
                (get_local $newStr)
                (get_local $aSize)
              )
              (i32.const 1)
            )
          )
          (get_local $newStr)
        )
      }
      `;
      test`
        private fun test(): void = %wasm {

        }

        private fun test(): void = %wasm { }
        private fun test(): void =%wasm{}

        var freeblock = 0

        fun malloc(size: i32): i32 = %wasm {
          (local $address i32)
          (set_local $address (get_global freeblock))
          (set_global
            $freeblock
            (i32.add
              (get_local $address)
              (get_local $size)
            )
          )
          (get_local $address)
        }

        fun strAdd(a: i32, b: i32): i32 = %wasm {
          (local $sum i32)
          (local $aSize i32)
          (local $newStr i32)
          (return
            (set_local $aSize (i32.load8_u a))
            (set_local $sum
              (i32.sub
                (i32.add
                  (get_local $aSize)
                  (i32.load8_u b)
                )
                (i32.const 1)
              )
            )
            (set_local $newStr
              (call malloc
                (i32.add
                  (get_local $sum)
                  (i32.const 1)
                )
              )
            )
            (i32.store8
              (get_local $newStr)
              (get_local $sum)
            )
            (call string_copy (get_local $a) (get_local $newStr))
            (call string_copy
              (get_local $b)
              (i32.sub
                (i32.add
                  (get_local $newStr)
                  (get_local $aSize)
                )
                (i32.const 1)
              )
            )
            (get_local $newStr)
          )
        }

      `;
    });
    describe('Types', () => {
      test`
        // 8 bit
        type byte

        // 16 bit
        type short
        type ushort

        // 32 bit
        type int32
        type float
        type uint32

        // 64 bit
        type int64
        type double
        type uint64
      `;
      test`
        // 8 bit
        type byte

        // 16 bit
        type short
        type ushort

        // 32 bit
        private type int32
        type float
        private type uint32

        // 64 bit
        type int64
        type double
        type uint64
      `;

      test`
        enum Boolean {
          True
          False
        }
        enum colors {
          Red
          Green
          Blue
        }
      `;

      test`
        enum Maybe {
          None
          Some(a: T)
        }
      `;

      test`
        enum Maybe {
          Some(a: T, b: X, c: asd)
        }
      `;

      test`
        struct Some(a: T, b: X, c: asd)
      `;

      test`
        // 8 bit
        type byte

        // 16 bit
        type short
        enum ushort {
          asd
        }

        // 32 bit
        private type int32
        type float
        private enum uint32 {}

        // 64 bit
        type int64
        type double
        type uint64e
      `;
    });

    describe('Effects', () => {
      test`
        effect byte {}
        private effect byte {}
        effect byte {}
      `;

      test`
        private effect byte {}
      `;

      test`
        type void = %injected
        type i32 = %stack { lowLevelType="i32" byteSize=4 }

        effect state {
          get(): i32
          put(x: i32): void
        }
      `;

      test`
        type void = %injected
        type i32 = %stack { lowLevelType="i32" byteSize=4 }

        effect state<T> {
          get(): T
          put(x: T): void
        }
      `;

      test`
        effect total {}
        fun sqr(x: i32): <total> i32 = x * x
        fun sqr(x: i32): <total|_> i32 = x * x
        fun sqr(x: i32): <total> i32 = x * x
        fun sqr(x: i32): <> i32 = x * x
        fun sqr(x: i32): i32 = x * x
      `;
    });

    describe('Literals', () => {
      test`
        var a = 1
        var b = 2.0
        var c = true
        var d = false
        var f = "a string 'single' quote"
        var g = 'a string "double" quote'
      `;
    });

    describe('bin op', () => {
      test`
        var a = 1 + 2
        var b = a.b.c + 2
        var c = a + 3
        var d = a == 4
        var f = sarasa::sarasanga( a.b.c == b.c.d )
        var g = sarasa::sarasanga( a.b.c == 1 )
        var g = sarasa::sarasanga( a.b.c() == 1 )
      `;
    });

    describe('decorators', () => {
      test`
        fun aNormalFunction(): a = 1

        #[inline]
        fun printf(str: u32, extra: i32): void = never
      `;

      test`
        #[inline]
        fun printf(str: u32, extra: i32): void = never
      `;

      test`
        #[   inline     ]
        fun printf(str: u32, extra: i32): void = never
      `;

      test`
        #[export]
        #[   inline     ]
        fun printf(str: u32, extra: i32): void = never
      `;
      test`
        #[export] #[   inline     ] fun printf(str: u32, extra: i32): void = never
      `;

      test`
        #[export]fun printf(str: u32, extra: i32): void = never
      `;

      test`
        #[export] // Xomment
        #[   inline     ] /* multiline
        */ fun printf(str: u32, extra: i32): void = never
      `;

      test`
        fun aNormalFunction(): a = 1

        #[extern "env" "printf"]
        fun printf(str: u32, extra: i32): void = never

        #[extern "env" "putchar"]
        fun putchar(char: u32): void = never

        #[explicit]
        #[explicit]
        fun as(): void = never

        #[a 123 false]
        fun a(): void = never
      `;
    });

    test`fun test(): i32 = 1`;
    test`fun test(): void = {}`;
    test`fun test(): void = {    }`;
    test`fun test(): void = {  \n\n  }`;

    test`private fun test(  a: MBER,      b   : NumBer): i32 = 1`;

    test`fun test(): i32 = 2`;

    test`private var test: Double = 1`;
    test`private var test = 1`;
    test`var test = 1`;

    test`val test: Number = 1`;
    test`val test = 1`;

    test`val test = 1 * 1 - 2 / 4 && 1 == 3 || 4 <= 4`;

    test`val test = 1`;

    test`val test = 1.mul(4)`;

    test`val floatingNumber: Number = 1.0`;
    test`val floatingNumber: Number = 0.0`;

    test`private val test = 1`;
    test`val test = true`;
    test`val test = false`;

    test`fun test(): Number = 1`;

    test`fun test(): Number = /*asd*/ 1`;
    test`fun test(): Number = /**/ 1`;

    test`private fun test(a: Number): i32 = 2`;
    test`private fun test(a: Number, b: Type): i32 = 2`;

    test`val test = 1 + (4 + 1)`;
    test`val test = (1 + 4) + 1`;

    test`
      private var test = 1
      var test2 = 1
      val test2 = 1
    `;

    test`
    var test = 1
    fun getTest(): i32 = test
    `;

    test`var test: Entity = 1 fun valueOfTest(): Entity = test`;

    test`var test: Struct = 1`;
    test`var test: Struct = 1`;
    test`var test: Int64 = 1`;
    test`var test: _ = 1`;
    test`var test: _|_ = 1`;
    test`var test: a|b& c | d & b = 1`;
    test`var test: fun() -> void = 1`;
    test`var test: fun() -> void & fun(i32) -> i32 = 1`;
    test`var test: fun() -> void & fun(a: i32) -> i32 = 1`;
    test`var test: fun() -> void & fun( a : i32) -> i32 = 1`;
    test`var test: fun() -> (void & fun( a : i32) -> i32) = 1`;
    test`var test: (fun() -> void) | fun ( a : i32) -> i32 = 1`;

    // test`
    // private struct Entity {
    //   a: Number,
    //   b: Entity*,
    //   c: Number*[]
    // }
    // private var entities: Entity* = 1
    // private fun getTest() = test
    // `;

    test`val test = match 1 {}`;
    test`val test = match 1 { else -> 1 }`;
    test`val test = {match 1 { else -> 1 }}`;
    test`
      val test = match 1 {
        case 2 -> true
        else -> false
      }
    `;

    test`
      var a = {false}
      var b = { false }
      var c = {
        false
      }
      var d = {
        false
        false
      }
    `;

    test`val test = match 1 { case 2 -> true else -> false }`;

    test`
      val test = match 1 {
        case 2->true
        else->false
      }
    `;

    test`
      val test = match 1 {
        case 2 -> true
        else -> false
      }
    `;

    test`
      val test = match 1 {
        case x if true -> true
        case x if x < 1 && x < 10 -> true
        case 2 -> true
        else -> false
      }
    `;

    test`
      var x =
        if (x > y)
          gcd(x - y, y)
        else if (x < y)
          gcd(x, y - x)
        else
          x
    `;

    test`
      fun ifWithoutElse(x: i32): i32 = {
        if (x == 1) {
          a = 3
        }
      }
      fun ifWithoutElse2(x: i32): i32 = {
        if (x == 1) asd()
      }
    `;

    test`
      var x =
        if (x)
          elseifo()
          .elsiso(3)
          else
          ifa()
          `;

    test`val test = match 1 { case x if x < 1 && x < 10 -> true }`;
    test`var a = (match x { else -> 1 }).map(1 * 2)`;

    test`var a = !x()`;
    test`var a = x()`;
    test`val test = (1).map(1).map(2).map(3)`;
    test`val test = x(1)`;
    test`val test = x(1,2)`;
    test`val test = x(1, asd)`;
    test`val test = nnn( 1 ,   \n asd )`;
    test`val test = x( 1 , 2 /* sdgf */)`;
    test`
      private fun compare(a: Color, b: Color): bool = {
        a == b
      }
    `;
  });
});
