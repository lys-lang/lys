declare var describe;

import { test } from './ExecutionHelper';
import { expect } from 'chai';

describe('execution tests', () => {
  describe('numbers', () => {
    test(
      'casts',
      `
        fun i32f32(i: i32): f32 = i as f32
      `,
      async (x, err) => {
        if (err) throw err;
        expect(x.exports.i32f32(44.9)).to.eq(44);
      }
    );
  });

  describe('named types', () => {
    test(
      'type alias of native',
      `
        type int = i32
        type Integer = int
        fun add(a: i32, b: int): int = a + b
        fun add2(a: i32, b: int): Integer = a + b
      `,
      async (x, err) => {
        if (err) throw err;
        expect(x.exports.add(10, 13)).to.eq(23);
        expect(x.exports.add2(30, 13)).to.eq(43);
      }
    );
  });

  describe('struct', () => {
    test(
      'is',
      `
        type i32
        type Enum {
          A
          B
          C
        }

        type Color {
          Red
          Green
          Blue
          Custom(a: i32)
        }

        var value1: Enum = A
        var value2: A | B = A
        var value3: A = A

        fun identity(a: ref): ref = a

        fun testPassing(): void = {
          support::test::assert( identity(A) is A              == true  )
          support::test::assert( identity(A) is Enum           == true  )
          support::test::assert( identity(B) is B              == true  )
          support::test::assert( identity(B) is A              == false )
          support::test::assert( identity(B) is Enum           == true  )
          support::test::assert( identity(B) is B              == true  )
          support::test::assert( identity(C) is A              == false )
          support::test::assert( identity(C) is Enum           == true  )
          support::test::assert( identity(C) is B              == false )

          support::test::assert( identity(value1) is A         == true  )
          support::test::assert( identity(value1) is B         == false )
          support::test::assert( identity(value1) is Enum      == true  )
          support::test::assert( identity(value2) is A         == true  )
          support::test::assert( identity(value2) is B         == false )
          support::test::assert( identity(value2) is Enum      == true  )
          support::test::assert( identity(value3) is A         == true  )
          support::test::assert( identity(value3) is B         == false )
          support::test::assert( identity(value3) is Enum      == true  )

          support::test::assert( identity(value3) is Red       == false )
          support::test::assert( identity(Red) is Red          == true  )
          support::test::assert( identity(Custom(1)) is Color  == true  )
          support::test::assert( identity(Custom(1)) is Custom == true  )
          support::test::assert( identity(Custom(1)) is Red    == false )
          support::test::assert( identity(Custom(1)) is B      == false )
        }
      `,
      async (x, err) => {
        if (err) throw err;
        x.exports.testPassing();
      }
    );

    test(
      'is, pattern matching variable',
      `
        type i32
        type Enum {
          A
          B
          C
        }

        type Color {
          Red
          Green
          Blue
          Custom(a: i32)
        }

        struct J()

        var value1: Enum = A
        var value2: A | B = A
        var value3: A = A

        fun toRed(col: ref): Color =
          col match {
            case x is Red -> x
            case x is Enum ->
              x match {
                case is A -> Red
                else -> Green
              }
            else -> Red
          }

        fun testPassing(): void = {
          support::test::assert( toRed(Red)  is Red )
          support::test::assert( toRed(Blue) is Red )
          support::test::assert( toRed(A) is Red )
          support::test::assert( toRed(B) is Green )
          support::test::assert( toRed(J()) is Red )
        }
      `,
      async (x, err) => {
        if (err) throw err;
        x.exports.testPassing();
      }
    );

    test(
      'type alloc and basic pattern match',
      `
        type Color {
          Red
          Green
          Blue
          Custom(r: i32, g: i32, b: i32)
        }

        fun isRed(color: Color): boolean = {
          color match {
            case is Red -> true
            // case Custom(r,g,b) -> r == 255 && g == 0 && b == 0
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
      `,
      async (x, err) => {
        if (err) throw err;
        x.exports.testColors();
      }
    );

    test(
      'store values',
      `
        type x {
          Custom(r: i32, g: i32)
        }

        fun testColors(): void = {
          val x = Custom(0,0)
          val y = Custom(0,0)

          support::test::assert(system::i32::load(x) == 0)
          support::test::assert(system::i32::load(y) == 0)

          system::i32::store(x, 3)
          system::i32::store(y, 2882400001) // 0xabcdef01
          system::i32::store(y, 5, 5)

          support::test::assert(system::i32::load(x) == 3)
          support::test::assert(system::i32::load(y) == 0xABCDEF01)
          support::test::assert(system::u8::load(y) as i32 == 0x01)
          support::test::assert(system::u8::load(y, 5) as i32 == 5)
        }

        fun retRef(): u32 = addressFromRef(Custom(0, 0))
      `,
      async (x, err) => {
        if (err) throw err;
        x.exports.testColors();
        const a = x.exports.retRef();
        const b = x.exports.retRef();
        const c = x.exports.retRef();
        expect(b).to.eq(a + 8, 'a + 8 = b');
        expect(c).to.eq(b + 8, 'b + 8 = c');
      }
    );
  });
  describe('operators', () => {
    test(
      'single addition, overrides core',
      `
        private fun (+)(a: f32, b: i32): i32 = 0
        private fun (+)(a: i32, b: i32): i32 = 1
        private fun (+)(a: i32, b: f32): i32 = 4

        fun main1(a: i32, b: f32): i32 = {
          a + b
        }

        fun main2(a: i32, b: f32): i32 = {
          b + a
        }

        fun main3(a: i32, b: i32): i32 = {
          b + a
        }
      `,
      async x => {
        expect(x.exports.main1(1, 1.0)).to.eq(4);
        expect(x.exports.main2(1, 1.0)).to.eq(0);
        expect(x.exports.main3(1, 1)).to.eq(1);
      }
    );

    test(
      'operators',
      `
        fun main(a: i32, b: i32): i32 = {
          a + b
        }
      `,
      async x => {
        expect(x.exports.main(1, 1)).to.eq(2);
      }
    );
  });

  describe('return types', () => {
    test(
      'void return',
      `
        type void
        fun main(): void = {
          // stub
        }
      `,
      async x => {
        expect(x.exports.main()).to.eq(undefined);
      }
    );
    test(
      'void return 2',
      `
        type void
        fun main(): void = {}
      `,
      async x => {
        expect(x.exports.main()).to.eq(undefined);
      }
    );
  });

  describe('injected wasm', () => {
    test(
      'x + 44',
      `
        type i32
        fun main(x: i32): i32 = %wasm { (i32.add (get_local $x) (i32.const 44)) }
      `,
      async x => {
        expect(x.exports.main(1)).to.eq(45);
        expect(x.exports.main(2)).to.eq(46);
      }
    );
  });

  describe('imports', () => {
    test(
      'panic',
      `
        fun test(): void = {
          support::test::assert((1 > 0)  == true)
          support::test::assert((0 > 0)  == false)
          support::test::assert((0 > 1)  == false)
          support::test::assert((0 >= 0) == true)
          support::test::assert((1 < 0)  == false)
          support::test::assert((0 < 0)  == false)
          support::test::assert((0 < 1)  == true)
          support::test::assert((0 <= 1) == true)
        }

        fun testBool(i: i32): boolean = i match {
          case 0 -> testBool0()
          case 1 -> testBool1()
          case 2 -> testBool2()
          case 3 -> testBool3()
          case 4 -> testBool4()
          case 5 -> testBool5()
          case 6 -> testBool6()
          case 7 -> testBool7()
          case 8 -> testBool8()
          case 9 -> testBool9()
          case 10 -> testBool10()
          case 11 -> testBool11()
          case 12 -> testBool12()
          else ->    testBool99()
        }

        fun testBool0():  boolean = 1 > 0  // true
        fun testBool1():  boolean = 0 > 0  // false
        fun testBool2():  boolean = 0 > 1  // false
        fun testBool3():  boolean = 1 >= 0 // true
        fun testBool4():  boolean = 0 >= 0 // true
        fun testBool5():  boolean = 0 >= 1 // false
        fun testBool6():  boolean = 1 < 0  // false
        fun testBool7():  boolean = 0 < 0  // false
        fun testBool8():  boolean = 0 < 1  // true
        fun testBool9():  boolean = 1 <= 0 // false
        fun testBool10(): boolean = 0 <= 0  // true
        fun testBool11(): boolean = 0 <= 1  // true
        fun testBool12(): boolean = false   // false
        fun testBool99(): boolean = true    // true

        fun testPanic1(): void = {
          support::test::assert((0 > 0) == true)
        }

        fun testPanic2(): void = {
          support::test::assert(0 > 0)
        }
      `,
      async x => {
        x.exports.test();

        expect(
          [
            !!x.exports.testBool0(),
            !!x.exports.testBool1(),
            !!x.exports.testBool2(),
            !!x.exports.testBool3(),
            !!x.exports.testBool4(),
            !!x.exports.testBool5(),
            !!x.exports.testBool6(),
            !!x.exports.testBool7(),
            !!x.exports.testBool8(),
            !!x.exports.testBool9(),
            !!x.exports.testBool10(),
            !!x.exports.testBool11(),
            !!x.exports.testBool12(),
            !!x.exports.testBool99()
          ].map(($, $$) => `fn ${$$} -> ${$}`),
          'fn compare'
        ).to.deep.eq(
          [true, false, false, true, true, false, false, false, true, false, true, true, false, true].map(
            ($, $$) => `fn ${$$} -> ${$}`
          )
        );

        expect(
          [
            x.exports.testBool(0),
            x.exports.testBool(1),
            x.exports.testBool(2),
            x.exports.testBool(3),
            x.exports.testBool(4),
            x.exports.testBool(5),
            x.exports.testBool(6),
            x.exports.testBool(7),
            x.exports.testBool(8),
            x.exports.testBool(9),
            x.exports.testBool(10),
            x.exports.testBool(11),
            x.exports.testBool(12),
            x.exports.testBool(99)
          ].map(($, $$) => `${$$} -> ${$}`),
          'match compare'
        ).to.deep.eq([1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1].map(($, $$) => `${$$} -> ${$}`));

        expect(() => x.exports.testPanic1(), 'testPanic1').to.throw();
        expect(() => x.exports.testPanic2(), 'testPanic2').to.throw();
      }
    );
  });

  describe('mutability', () => {
    test(
      'mutable global',
      `
        type i32
        type void

        val bc = 1

        var a: i32 = {
          bc - 2
        }

        fun retMinusOne(): i32 = 0 - 1

        fun main(x: i32): void = {
          if (x < 0) {
            a = 0
          } else {
            a = x
          }
        }

        fun getValue(): i32 = a
      `,
      async x => {
        expect(x.exports.getValue()).to.eq(-1);

        expect(x.exports.main(1)).to.eq(undefined);
        expect(x.exports.getValue()).to.eq(1);
        expect(x.exports.main(3)).to.eq(undefined);
        expect(x.exports.getValue()).to.eq(3);
        expect(x.exports.main(-3)).to.eq(undefined);
        expect(x.exports.getValue()).to.eq(0);
        expect(x.exports.main(30)).to.eq(undefined);
        expect(x.exports.getValue()).to.eq(30);
      }
    );

    test(
      'void return',
      `
        type i32
        fun main(x: i32): i32 = {
          var a: i32 = 1

          if (x == 1) {
            a = 3
          } else {}

          a
        }
      `,
      async x => {
        expect(x.exports.main(1)).to.eq(3);
        expect(x.exports.main(3)).to.eq(1);
      }
    );

    test(
      'void return, if w/o else',
      `
        type i32
        fun main(x: i32): i32 = {
          var a: i32 = 1

          if (x == 1) {
            a = 3
          }

          a
        }
      `,
      async x => {
        expect(x.exports.main(1)).to.eq(3);
        expect(x.exports.main(3)).to.eq(1);
      }
    );

    test(
      'void return, if w/o else w/o types',
      `
        type i32
        fun main(x: i32): i32 = {
          var a = 1

          if (x == 1) {
            a = 3
          }

          a
        }
      `,
      async x => {
        expect(x.exports.main(1)).to.eq(3);
        expect(x.exports.main(3)).to.eq(1);
      }
    );
  });

  describe('math', () => {
    test(
      'sum',
      `
        type i32
        type f32

        fun add(a: i32, b: i32): i32 = a + b

        fun add2(a: f32, b: f32): f32 = {
          a + b
        }
      `,
      async x => {
        expect(x.exports.add(1, 2)).to.eq(3);
        expect(x.exports.add(-1, 2)).to.eq(1);
        expect(x.exports.add2(1, 2)).to.eq(3);
        expect(x.exports.add2(0.2, 0.3)).to.eq(0.5);
        expect(x.exports.add2(-1, 2)).to.eq(1);
      }
    );

    test(
      'sum 2',
      `
        type i32
        type f32

        fun add(a: i32, b: i32): i32 = {{{a}} + {{{b}}}}

        fun add2(a: f32, b: f32): f32 = {{
          {a} + {b}
        }}
      `,
      async x => {
        expect(x.exports.add(1, 2)).to.eq(3);
        expect(x.exports.add(-1, 2)).to.eq(1);
        expect(x.exports.add2(1, 2)).to.eq(3);
        expect(x.exports.add2(0.2, 0.3)).to.eq(0.5);
        expect(x.exports.add2(-1, 2)).to.eq(1);
      }
    );

    test(
      'fibo',
      `
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
      `,
      async x => {
        expect(x.exports.fib(46)).to.eq(1836311903);
        expect(x.exports.test()).to.eq(1836311903);
      }
    );
    test(
      'fibo pattern matchin',
      `
        type i32

        private fun fibo(n: i32, a: i32, b: i32): i32 =
          n match {
            case 0 -> a
            case 1 -> b
            else   -> fibo(n - 1, b, a + b)
          }

        fun fib(n: i32): i32 = fibo(n, 0, 1)

        fun test(): i32 = {
          fib(46) // must be 1836311903
        }
      `,
      async x => {
        expect(x.exports.fib(46)).to.eq(1836311903);
        expect(x.exports.test()).to.eq(1836311903);
      }
    );

    test(
      'fibo w/o types',
      `
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
      `,
      async x => {
        expect(x.exports.fib(46)).to.eq(1836311903);
        expect(x.exports.test()).to.eq(1836311903);
      }
    );

    test(
      'fibo 2',
      `
        type i32

        private fun fibo(n: i32, x1: i32, x2: i32): i32 =
          if (n > 0)
            fibo(n - 1, x2, x1 + x2)
          else
            x1

        fun fib(n: i32): i32 = fibo(n, 0, 1)

        fun test(): i32 = fib(46) // must be 1836311903
      `,
      async x => {
        expect(x.exports.fib(46)).to.eq(1836311903);
        expect(x.exports.test()).to.eq(1836311903);
      }
    );

    test(
      'fibo 3',
      `
        type i32

        private fun fibo(n: i32, a: i32, b: i32): i32 =
          n match {
            case 0 -> a
            case 1 -> b
            else   -> fibo(n - 1, b, a + b)
          }

        fun fib(n: i32): i32 = fibo(n, 0, 1)

        fun test(): i32 = fib(46) // must be 1836311903
      `,
      async x => {
        expect(x.exports.fib(46)).to.eq(1836311903);
        expect(x.exports.test()).to.eq(1836311903);
      }
    );

    test(
      'overload infix',
      `
        type i32
        type f32

        private fun sum(a: f32, b: f32): f32 = a + b
        private fun sum(a: i32, b: i32): i32 = a + b
        private fun sum(a: i32): i32 = a + 100
        private fun sum(a: f32): f32 = a + 100.0

        fun testInt(a: i32, b: i32): i32 = a.sum(b)
        fun testFloat(a: f32, b: f32): f32 = a.sum(b)

        fun testInt2(a: i32): i32 = a.sum()
        fun testFloat2(a: f32): f32 = a.sum()
      `,
      async x => {
        expect(x.exports.testInt(46, 3)).to.eq(49);
        expect(x.exports.testFloat(0.2, 0.3)).to.eq(0.5);

        expect(x.exports.testInt2(46)).to.eq(146);
        expect(x.exports.testFloat2(0.5)).to.eq(100.5);
      }
    );

    test(
      'pattern matching 1',
      `
        type i32
        type boolean

        fun test1(a: i32): boolean =
          a match {
            case 1 -> true
            else -> false
          }

        fun test2(a: i32): i32 =
          a match {
            case 10 -> 1
            case 20 -> 2
            case 30 -> 3
            case 40 -> 4
            case 50 -> 5
            case 60 -> 6
            case 70 -> 7
            case 80 -> 8
            case 90 -> 9
            else -> 0
          }

        fun test3(a: i32): boolean =
          (a + 1) match {
            case 1 -> true
            else -> false
          }
      `,
      async x => {
        expect(x.exports.test1(1)).to.eq(1);
        expect(x.exports.test1(0)).to.eq(0);
        expect(x.exports.test2(10)).to.eq(1);
        expect(x.exports.test2(20)).to.eq(2);
        expect(x.exports.test2(30)).to.eq(3);
        expect(x.exports.test2(40)).to.eq(4);
        expect(x.exports.test2(50)).to.eq(5);
        expect(x.exports.test2(60)).to.eq(6);
        expect(x.exports.test2(70)).to.eq(7);
        expect(x.exports.test2(80)).to.eq(8);
        expect(x.exports.test2(90)).to.eq(9);
        expect(x.exports.test2(700)).to.eq(0);
        expect(x.exports.test2(71)).to.eq(0);
        expect(x.exports.test2(-170)).to.eq(0);
        expect(x.exports.test2(0)).to.eq(0);
        expect(x.exports.test3(0)).to.eq(1);
        expect(x.exports.test3(-1)).to.eq(0);
      }
    );
  });
});
