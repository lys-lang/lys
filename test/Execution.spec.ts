declare var describe;

import { test } from './ExecutionHelper';
import { expect } from 'chai';
import { assert } from 'expect';

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
  describe('loops', () => {
    test(
      'loop one',
      `
        fun sumTimes(i: i32): i32 = {
          var current = i
          var ret = 0
          loop {
            ret = ret + 1
            current = current - 1
            if (current == 0)
              break
            else
              continue
          }
          ret
        }
      `,
      async (x, err) => {
        if (err) throw err;
        expect(x.exports.sumTimes(10)).to.eq(10);
      }
    );
  });

  describe('strings', () => {
    test(
      'str len',
      `
          fun len(): i32 = "asd".length

          fun b(x: i32): i32 = x match {
            case 0 -> "".length
            case 1 -> "1".length
            case 2 -> "11".length
            case 3 -> "⨔⨔⨔".length
            else -> {
              panic()
              0
            }
          }
      `,
      async (x, err) => {
        if (err) throw err;
        expect(x.exports.len()).to.eq(6);
        expect(x.exports.b(0)).to.eq(0);
        expect(x.exports.b(1)).to.eq(2);
        expect(x.exports.b(2)).to.eq(4);
        expect(x.exports.b(3)).to.eq(6);
        expect(() => x.exports.b(92)).to.throw();
      }
    );
    test(
      'str concat',
      `
          fun concat(lhs: bytes, rhs: bytes): bytes = {
            var $ret = system::memory::allocBytes(lhs.length + rhs.length)
            system::memory::memcpy($ret.ptr, lhs.ptr, lhs.length)
            system::memory::memcpy($ret.ptr + lhs.length, rhs.ptr, rhs.length)
            $ret
          }

          fun main(): i32 = concat("asd", "dsa").length
      `,
      async (x, err) => {
        if (err) throw err;
        expect(x.exports.main()).to.eq(12);
      }
    );
    test(
      'String concat',
      `
          import system::string

          fun strLen(): i32 = String("asd").length
          fun byteLen(): i32 = String("dsa").data.length
          fun concatStrLen(): i32 = (String("ds") + String("sa")).length
      `,
      async (x, err) => {
        if (err) throw err;
        expect(x.exports.strLen()).to.eq(3);
        expect(x.exports.byteLen()).to.eq(6);
        expect(x.exports.concatStrLen()).to.eq(4);
      }
    );
    test(
      'charAt',
      `
          import system::string

          val str = String("asd❮𝐑")

          fun charAt(at: i32): u16 = String.charAt(str, at)
          fun len(): i32 = str.length
      `,
      async (x, err) => {
        if (err) throw err;
        expect(x.exports.len()).to.eq(6);

        let str = String.fromCodePoint(...[0, 1, 2, 3, 4, 5].map($ => x.exports.charAt($)));

        expect(str).to.eq('asd❮𝐑');

        expect(() => x.exports.charAt(100)).to.throw();
      }
    );

    function readString(memory: ArrayBuffer, offset: number) {
      const dv = new DataView(memory);
      let len = dv.getUint32(offset);
      if (len == 0) return '';

      let currentOffset = offset + 4;

      const sb: string[] = [];

      while (len > 1) {
        sb.push(String.fromCharCode(dv.getUint16(currentOffset)));
        currentOffset += 2;
        len -= 2;
      }

      if (len == 1) assert(dv.getInt8(currentOffset) == 0, 'string must end in 0');

      return sb.join('');
    }

    function readBytes(memory: ArrayBuffer, offset: number) {
      const dv = new DataView(memory, offset);
      let len = dv.getUint32(0, true);

      if (len == 0) return [];

      let currentOffset = 4;
      len += 4;

      const sb: number[] = [];
      while (currentOffset < len) {
        const r = dv.getUint8(currentOffset);

        sb.push(r);
        currentOffset += 1;
      }

      return sb;
    }

    test(
      'keccak',
      `
        import system::string
        import system::hash::keccak

        fun someTests(ix: i32): i32 = keccak("").ptr - 4
      `,
      async (x, err) => {
        if (err) throw err;

        const ret = x.exports.someTests(0);

        expect(ret).to.not.eq(-1);

        const bytes = readBytes(x.exports.memory.buffer, ret);
        expect(bytes.length).to.eq(32);

        expect(bytes.map($ => ('00' + $.toString(16)).substr(-2)).join('')).to.eq(
          'c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470'
        );
      }
    );
  });

  describe.skip('named types', () => {
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
      'recursive types forest',
      `
        type Tree {
          Empty
          Node(a: Tree | Forest)
        }

        type Forest {
          Nil
          Cons(tree: Tree | Forest)
        }

        fun testPassing(): void = {
          var a = Nil
          var b = Cons(Empty)
          var c = Cons(Nil)
          var d = Cons(Node(Empty))
          var e = Node(Nil)

          support::test::assert( a is Nil            == true )
          support::test::assert( a is Forest         == true )
          support::test::assert( b is Forest         == true )
          support::test::assert( c is Cons           == true )
          support::test::assert( e is Node           == true )
          support::test::assert( e is Tree           == true )
        }
      `,
      async (x, err) => {
        if (err) throw err;
        x.exports.testPassing();
      }
    );

    test(
      'get struct values',
      `
        struct Vector3(x: i32, y: i32, z: i32)

        fun testPassing(): void = {
          var a = Vector3(1, 2, 3)

          support::test::assert( a is Vector3 )
          support::test::assert( Vector3.property_x(a)    == 1 )
          support::test::assert( Vector3.property_y(a)    == 2 )
          support::test::assert( Vector3.property_z(a)    == 3 )
        }

        fun testFailing(): void = {
          var a = Vector3(1, 2, 3)
          support::test::assert( Vector3.property_x(a)    == 999 )
        }
      `,
      async (x, err) => {
        if (err) throw err;
        x.exports.testPassing();

        expect(() => x.exports.testFailing()).to.throw();
      }
    );

    test(
      'set struct values',
      `
        type Color {
          None
          Red
          Green
          Blue
          Custom(hex: i32)
        }

        struct CatBag(a: i32, b: boolean, c: f32, d: i64, e: f64, f: Color, g: Red | None)

        fun testPassing(): void = {
          var a = CatBag(1, true, 3.0, 0x8 as i64, 0.4 as f64, Red, Red)

          support::test::assert( a is CatBag )
          support::test::assert( CatBag.property_a(a)    == 1 )
          support::test::assert( CatBag.property_b(a)    == true )
          support::test::assert( CatBag.property_c(a)    == 3.0 )
          support::test::assert( CatBag.property_d(a)    == 0x8 )
          support::test::assert( CatBag.property_e(a)    == 0.4 as f64 )
          support::test::assert( CatBag.property_f(a)    is Red )
          support::test::assert( CatBag.property_g(a)    is Red )
          support::test::assert( CatBag.property_f(a)    is Color )
          support::test::assert( CatBag.property_g(a)    is Color )

          CatBag.property_a(a, 5)
          CatBag.property_b(a, false)
          CatBag.property_c(a, -999.0)
          CatBag.property_d(a, 0xdeadbeef as i64)
          CatBag.property_e(a, 6.08e23 as f64)
          CatBag.property_f(a, Custom(333))
          CatBag.property_g(a, None)

          support::test::assert( CatBag.property_a(a)    == 5 )
          support::test::assert( CatBag.property_b(a)    == false )
          support::test::assert( CatBag.property_c(a)    == -999.0 )
          support::test::assert( CatBag.property_d(a)    == 0xdeadbeef as i64 )
          support::test::assert( CatBag.property_e(a)    == 6.08e23 as f64 )
          support::test::assert( CatBag.property_f(a)    is Custom )
          support::test::assert( CatBag.property_g(a)    is None )
          support::test::assert( CatBag.property_f(a)    is Color )
          support::test::assert( CatBag.property_g(a)    is Color )

          var custom = CatBag.property_f(a)

          support::test::assert( custom is Custom )

          custom match {
            case x is Custom -> support::test::assert( Custom.property_hex(x) == 333 )
            else -> panic()
          }
        }
      `,
      async (x, err) => {
        if (err) throw err;
        x.exports.testPassing();
      }
    );

    test(
      'chained getters',
      `
        type Tree {
          Leaf(value: i32)
          Branch(left: Leaf)
        }

        fun testPassing(): void = {
          var a = Branch(Leaf(1))

          support::test::assert( a      is Branch )
          support::test::assert( a.left is Leaf )
          support::test::assert( a.left.value == 1 )
          a.left.value = 2
          support::test::assert( a.left.value == 2 )
        }


        fun testFailing(): void = {
          var a = Branch(Leaf(1))
          a.left.value = 2
          support::test::assert( a.left.value == 1 )
        }
      `,
      async (x, err) => {
        if (err) throw err;
        x.exports.testPassing();
        expect(() => x.exports.testFailing()).to.throw();
      }
    );

    test(
      'set struct values with getters and setters',
      `
        type Color {
          None
          Red
          Green
          Blue
          Custom(hex: i32)
        }

        struct CatBag(a: i32, b: boolean, c: f32, d: i64, e: f64, f: Color, g: Red | None)

        fun testPassing(): void = {
          var a = CatBag(1, true, 3.0, 0x8 as i64, 0.4 as f64, Red, Red)

          support::test::assert( a   is CatBag )
          support::test::assert( a.a == 1 )
          support::test::assert( a.b == true )
          support::test::assert( a.c == 3.0 )
          support::test::assert( a.d == 0x8 )
          support::test::assert( a.e == 0.4 as f64 )
          support::test::assert( a.f is Red )
          support::test::assert( a.g is Red )
          support::test::assert( a.f is Color )
          support::test::assert( a.g is Color )

          a.a = 5
          a.b = false
          a.c = -999.0
          a.d = 0xdeadbeef as i64
          a.e = 6.08e23 as f64
          a.f = Custom(333)
          a.g = None

          support::test::assert( a.a == 5 )
          support::test::assert( a.b == false )
          support::test::assert( a.c == -999.0 )
          support::test::assert( a.d == 0xdeadbeef as i64 )
          support::test::assert( a.e == 6.08e23 as f64 )
          support::test::assert( a.f is Custom )
          support::test::assert( a.g is None )
          support::test::assert( a.f is Color )
          support::test::assert( a.g is Color )

          support::test::assert( a.f is Custom )

          a.f match {
            case x is Custom -> support::test::assert( Custom.property_hex(x) == 333 )
            else -> panic()
          }
        }
      `,
      async (x, err) => {
        if (err) throw err;
        x.exports.testPassing();
      }
    );

    test(
      'varidic n-ary and pattern matching',
      `
        type Enum {
          None
          Custom(hex: i32)
        }

        fun testPassing(): void = {
          var custom: Enum = Custom(333)

          custom match {
            case x is Custom -> support::test::assert( Custom.property_hex(x) == 333 )
            else -> panic()
          }
        }

        fun testFailing(): void = {
          var custom: Enum = None

          custom match {
            case x is Custom -> support::test::assert( Custom.property_hex(x) == 333 )
            else -> panic()
          }
        }
      `,
      async (x, err) => {
        if (err) throw err;
        expect(() => x.exports.testFailing()).to.throw();
      }
    );

    test(
      'is with pattern matchin',
      `
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

        fun isA(x: ref): boolean = {
          x match {
            case is A -> true
            else -> false
          }
        }

        fun isB(x: ref): boolean = {
          x match {
            case is B -> true
            else -> false
          }
        }

        fun isEnum(x: ref): boolean = {
          x match {
            case is Enum -> true
            else -> false
          }
        }

        fun isRed(x: ref): boolean = {
          x match {
            case is Red -> true
            else -> false
          }
        }

        fun isColor(x: ref): boolean = {
          x match {
            case is Color -> true
            else -> false
          }
        }

        fun isCustom(x: ref): boolean = {
          x match {
            case is Custom -> true
            else -> false
          }
        }

        fun testPassing(): void = {
          support::test::assert( isA(A)              == true  )
          support::test::assert( isEnum(A)           == true  )
          support::test::assert( isB(B)              == true  )
          support::test::assert( isA(B)              == false )
          support::test::assert( isEnum(B)           == true  )
          support::test::assert( isB(B)              == true  )
          support::test::assert( isA(C)              == false )
          support::test::assert( isEnum(C)           == true  )
          support::test::assert( isB(C)              == false )

          support::test::assert( isA(value1)         == true  )
          support::test::assert( isB(value1)         == false )
          support::test::assert( isEnum(value1)      == true  )
          support::test::assert( isA(value2)         == true  )
          support::test::assert( isB(value2)         == false )
          support::test::assert( isEnum(value2)      == true  )
          support::test::assert( isA(value3)         == true  )
          support::test::assert( isB(value3)         == false )
          support::test::assert( isEnum(value3)      == true  )

          support::test::assert( isRed(value3)       == false )
          support::test::assert( isRed(Red)          == true  )
          support::test::assert( isColor(Custom(1))  == true  )
          support::test::assert( isCustom(Custom(1)) == true  )
          support::test::assert( isRed(Custom(1))    == false )
          support::test::assert( isB(Custom(1))      == false )
        }
      `,
      async (x, err) => {
        if (err) throw err;
        x.exports.testPassing();
      }
    );

    test(
      'is',
      `
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
      'type alloc and basic pattern match, deconstruct',
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
            case is Custom(r, g, b) -> r == 255 && g == 0 && b == 0
            else -> false
          }
        }

        fun testColors(): void = {
          support::test::assert(isRed(Red) == true)
          support::test::assert(isRed(Green) == false)
          support::test::assert(isRed(Blue) == false)
          support::test::assert(isRed(Custom(255,0,0)) == true)
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
        struct Custom(r: i32, g: i32)

        val x = Custom(0,0)
        val y = Custom(0,0)

        fun getX(): u32 = addressFromRef(x)
        fun getY(): u32 = addressFromRef(y)

        fun testLoad(): void = {
          support::test::assert(i32.load(x) == 0)
          support::test::assert(i32.load(y) == 0)
        }

        fun testStore(): void = {
          i32.store(x, 3)
          i32.store(y, 2882400001) // 0xabcdef01
          i32.store(y, 5, 5)
        }

        fun assert(): void = {
          support::test::assert(i32.load(x) == 3)
          support::test::assert(i32.load(y) == 0xABCDEF01)
          support::test::assert(u8.load(y) as i32 == 0x01)
          support::test::assert(u8.load(y, 5) as i32 == 5)
        }
      `,
      async (x, err) => {
        if (err) throw err;
        x.exports.testLoad();
        x.exports.testStore();
        x.exports.assert();
      }
    );

    test(
      'store values 2',
      `
        type x {
          Custom(r: i32, g: i32)
        }

        fun testColors(): void = {
          val x = Custom(0,0)
          val y = Custom(0,0)

          support::test::assert(i32.load(x) == 0)
          support::test::assert(i32.load(y) == 0)

          i32.store(x, 3)
          i32.store(y, 2882400001) // 0xabcdef01
          i32.store(y, 5, 5)

          support::test::assert(i32.load(x) == 3)
          support::test::assert(i32.load(y) == 0xABCDEF01)
          support::test::assert(u8.load(y) as i32 == 0x01)
          support::test::assert(u8.load(y, 5) as i32 == 5)
        }

        fun retRef(): u32 = addressFromRef(Custom(0, 0))
      `,
      async (x, err) => {
        if (err) throw err;
        x.exports.testColors();
        const a = x.exports.retRef();
        const b = x.exports.retRef();
        const c = x.exports.retRef();
        expect(b).to.eq(a + 16, 'a + 16 = b');
        expect(c).to.eq(b + 16, 'b + 16 = c');
      }
    );
  });
  describe('operators', () => {
    test(
      'single addition, overrides core',
      `
        type i32
        type f32

        impl f32 {
          fun +(a: f32, b: i32): i32 = 0
        }

        impl i32 {
          fun +(a: i32, b: i32): i32 = 1
          fun +(a: i32, b: f32): i32 = 4
        }

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
      'factorial',
      `
        fun factorial(n: i32): i32 =
          if (n >= 1)
            n * factorial(n - 1)
          else
            1
      `,
      async x => {
        expect(x.exports.factorial(10)).to.eq(3628800);
      }
    );

    test(
      'fibo pattern matchin',
      `

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

        private fun sum(a: f32, b: f32): f32 = a + b
        private fun sum(a: i32, b: i32): i32 = a + b
        private fun sum(a: i32): i32 = a + 100
        private fun sum(a: f32): f32 = a + 100.0

        fun testInt(a: i32, b: i32): i32 = sum(a,b)
        fun testFloat(a: f32, b: f32): f32 = sum(a,b)

        fun testInt2(a: i32): i32 = sum(a)
        fun testFloat2(a: f32): f32 = sum(a)
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
