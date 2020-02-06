declare var describe: any;

import { test, testFolder } from './ExecutionHelper';
import { expect } from 'chai';
import { readBytes } from '../dist/utils/execution';

const getBytes = require('utf8-bytes');

describe('Execution tests', () => {
  describe('call indirect', () => {
    test(
      'call indirect #1',
      `
        fun a(): i32 = 10
        fun b(): i32 = 20

        fun caller(c: fun() -> i32): i32 = c()

        #[export]
        fun test(x: i32): void = {
          if (x == 1) {
            support::test::assert(caller(a) == 10, "Case a")
          } else {
            support::test::assert(caller(b) == 20, "Case b")
          }
        }
      `,
      async x => {
        x.exports.test(1);
      }
    );
  })

  describe('multiple impl', () => {
    test(
      'two functions with different names',
      `
        struct A()

        impl A {
          fun test1(): i32 = 1
        }

        impl A {
          fun test2(): i32 = 2
        }

        #[export]
        fun test(): void = {
          support::test::assert(A.test1() == 1, "test1")
          support::test::assert(A.test2() == 2, "test2")
        }
      `,
      async x => {
        x.exports.test();
      }
    );

    test(
      'two functions with overloads in different impl',
      `
        struct A()

        impl A {
          fun test(value: i32): i32 = value
        }

        impl A {
          fun test(value: boolean): i32 = -1
        }

        #[export]
        fun test(): void = {
          support::test::assert(A.test(1)     == 1,  "test 1")
          support::test::assert(A.test(2)     == 2,  "test 2")
          support::test::assert(A.test(false) == -1, "test 3")
        }
      `,
      async x => {
        x.exports.test();
      }
    );

    test(
      'implicit and explicit casts overloaded manually',
      `
        struct A()

        impl A {
          fun as(value: A): i32 = 1
        }

        impl A {
          fun as(value: A): boolean = true
        }

        impl A {
          #[explicit]
          fun as(value: A): f32 = 3.0
        }

        #[export]
        fun test(): void = {
          support::test::assert(1 == A,          "test implicit i32 cast")
          support::test::assert(true == A,       "test implicit boolean cast 1")
          support::test::assert(A,               "test implicit boolean cast 2")
          support::test::assert(A as f32 == 3.0, "test implicit f32 cast")
        }
      `,
      async x => {
        x.exports.test();
      }
    );
  });

  describe('traits', () => {

    test(
      'Self\'s discriminant should be equal to Type\'s discriminant',
      `
        trait Checkable {
          fun check(): u32
          fun check2(): u32
        }

        struct A()
        struct B()

        impl Checkable for A {
          fun check(): u32 = Self.^discriminant
          fun check2(): u32 = A.^discriminant
        }

        impl Checkable for B {
          fun check(): u32 = Self.^discriminant
          fun check2(): u32 = B.^discriminant
        }

        #[export] fun A1(): u32 = A.check()
        #[export] fun A2(): u32 = A.check2()
        #[export] fun B1(): u32 = B.check()
        #[export] fun B2(): u32 = B.check2()
      `,
      async x => {
        expect(x.exports.A1()).to.eq(x.exports.A2());
        expect(x.exports.B1()).to.eq(x.exports.B2());
        expect(x.exports.A1()).to.not.eq(x.exports.B1());
      }
    );

    test(
      'concrete type must be assignable to Self in trait',
      `
        trait Sumable {
          fun +(lhs: Self, rhs: Self): Self
        }

        struct A(num: f32)
        struct B(num: i32)

        impl Sumable for A {
          fun +(lhs: Self, rhs: A): A = A(lhs.num + rhs.num)
        }

        impl Sumable for B {
          fun +(lhs: B, rhs: Self): Self = B(lhs.num + rhs.num)
        }

        #[export]
        fun sumA(x: f32, y: f32): f32 = (A(x) + A(y)).num

        #[export]
        fun sumB(x: i32, y: i32): i32 = (B(x) + B(y)).num
      `,
      async x => {
        expect(x.exports.sumA(1.5, 2)).to.eq(3.5);
        expect(x.exports.sumB(1.1, 2.1)).to.eq(3);
      }
    );
  });

  describe('injected wasm', () => {
    test(
      'x + 44',
      `
        #[export] fun otherFunction(): i32 = 44

        #[export] fun main(x: i32): i32 = %wasm {
          (i32.add (local.get $x) (call $otherFunction))
        }
      `,
      async x => {
        expect(x.exports.main(1)).to.eq(45);
        expect(x.exports.main(2)).to.eq(46);
      }
    );
  });

  describe.skip('namespaces', () => {
    test(
      'resolve variable declarations in namespaces',
      `
        type A = %struct { }

        impl A {
          val x: boolean = true
        }

        #[export] fun main(): boolean = A.x
      `,
      async x => {
        expect(x.exports.main()).to.eq(1);
      }
    );
  });

  describe('numbers', () => {
    test(
      'casts',
      `
        import support::test

        #[export] fun i32f32(i: i32): f32 = i as f32
      `,
      async (x, err) => {
        if (err) throw err;
        expect(x.exports.i32f32(44.9)).to.eq(44);
      }
    );
  });

  describe('methods getters setters', () => {
    test(
      'methods',
      `
        import support::test

        struct T()

        impl T {
          #[method] fun a(self: T): i32 = 1
          #[method] fun a(self: T, a: i32): i32 = 2
          #[method] fun a(self: T, a: boolean): i32 = 3
          #[method] fun a(self: T, a: boolean, b: i32): i32 = 4
        }

        #[export] fun a(): i32 = T().a()
        #[export] fun b(): i32 = T().a(1)
        #[export] fun c(): i32 = T().a(false)
        #[export] fun d(): i32 = T().a(false, 1)
      `,
      async (x, err) => {
        if (err) throw err;
        expect(x.exports.a()).to.eq(1);
        expect(x.exports.b()).to.eq(2);
        expect(x.exports.c()).to.eq(3);
        expect(x.exports.d()).to.eq(4);
      }
    );

    test(
      'methods, mutating',
      `
        import support::test

        struct T(value: i32)

        impl T {
          #[method] fun reset(self: T): void = {
            self.value = 0
          }

          #[method] fun next(self: T): i32 = {
            self.value = self.value + 1
            self.value
          }
        }

        var t = T(0)

        #[export] fun next(): i32 = t.next()
        #[export] fun reset(): void = t.reset()
      `,
      async (x, err) => {
        if (err) throw err;
        expect(x.exports.next()).to.eq(1);
        expect(x.exports.next()).to.eq(2);
        expect(x.exports.next()).to.eq(3);
        expect(x.exports.next()).to.eq(4);
        x.exports.reset();
        expect(x.exports.next()).to.eq(1);
        expect(x.exports.next()).to.eq(2);
        expect(x.exports.next()).to.eq(3);
        expect(x.exports.next()).to.eq(4);
      }
    );

    test(
      'index selector getter',
      `
        import support::test

        struct T(value: i32)

        impl T {
          #[getter] fun [](self: T, index: i32): i32 = self.value * index
          #[getter] fun [](self: T, index: boolean): i32 = self.value
        }

        var t = T(123)

        #[export] fun mul(i: i32): i32 = t[i]
        #[export] fun bool(i: boolean): i32 = t[i]
      `,
      async (x, err) => {
        if (err) throw err;
        expect(x.exports.mul(123)).to.eq(123 * 123);
        expect(x.exports.bool(false)).to.eq(123);
      }
    );
  });

  describe('schemas', () => {
    test(
      'discriminant',
      `
        import support::test
        #[export] fun test1(): u32 = never.^discriminant
      `,
      async (x, err) => {
        if (err) throw err;
        expect(x.exports.test1()).to.be.gt(0);
      }
    );
    test(
      'sizes',
      `
        struct Struct1()
        struct Struct2(a: u8)
        struct Struct3(a: u8, b: Struct2)

        enum List {
          Nil
          Cons(a: i64, b: List)
        }

        enum Color {
          None
          Red
          Green
          Blue
          Custom(hex: i32)
        }

        struct CatBag(a: i32, b: boolean, c: f32, d: i64, e: f64, f: Color, g: Red | None)


        #[export] fun int(): u32 = i32.^byteSize
        #[export] fun intAlloc(): u32 = i32.^allocationSize
        #[export] fun byte(): u32 = u8.^byteSize
        #[export] fun byteAlloc(): u32 = u8.^allocationSize
        #[export] fun struct1(): u32 = Struct1.^byteSize
        #[export] fun struct1Alloc(): u32 = Struct1.^allocationSize
        #[export] fun struct2(): u32 = Struct2.^byteSize
        #[export] fun struct2Alloc(): u32 = Struct2.^allocationSize
        #[export] fun struct3(): u32 = Struct3.^byteSize
        #[export] fun struct3Alloc(): u32 = Struct3.^allocationSize

        #[export] fun list(): u32 = List.^byteSize
        #[export] fun nil(): u32 = Nil.^byteSize
        #[export] fun nilAlloc(): u32 = Nil.^allocationSize
        #[export] fun cons(): u32 = Cons.^byteSize
        #[export] fun consAlloc(): u32 = Cons.^allocationSize

        #[export] fun catBagAlloc(): u32 = CatBag.^allocationSize
        #[export] fun catBagOffsets(i: i32): u32 = match i {
          case 0 -> CatBag.^property$0_offset
          case 1 -> CatBag.^property$1_offset
          case 2 -> CatBag.^property$2_offset
          case 3 -> CatBag.^property$3_offset
          case 4 -> CatBag.^property$4_offset
          case 5 -> CatBag.^property$5_offset
          case 6 -> CatBag.^property$6_offset
          else -> -1 as u32
        }
      `,
      async (x, err) => {
        if (err) throw err;

        const results = [
          [x.exports.int(), 4],
          [x.exports.intAlloc(), 4],
          [x.exports.byte(), 1],
          [x.exports.byteAlloc(), 1],
          [x.exports.struct1(), 8],
          [x.exports.struct1Alloc(), 0],
          [x.exports.struct2(), 8],
          [x.exports.struct2Alloc(), 1],
          [x.exports.struct3(), 8],
          [x.exports.struct3Alloc(), 9],
          [x.exports.list(), 8],
          [x.exports.nil(), 8],
          [x.exports.nilAlloc(), 0],
          [x.exports.cons(), 8],
          [x.exports.consAlloc(), 16],
          [x.exports.catBagAlloc(), 41],
          [x.exports.catBagOffsets(0), 0],
          [x.exports.catBagOffsets(1), 4],
          [x.exports.catBagOffsets(2), 5],
          [x.exports.catBagOffsets(3), 9],
          [x.exports.catBagOffsets(4), 17],
          [x.exports.catBagOffsets(5), 25],
          [x.exports.catBagOffsets(6), 33]
        ];

        expect(JSON.stringify(results.map($ => $[0]))).to.eq(JSON.stringify(results.map($ => $[1])));
      }
    );
  });
  describe('loops', () => {
    test(
      'loop one',
      `
        #[export "sumTimes"]
        fun main(i: i32): i32 = {
          var current = i
          var ret = 0
          loop {
            ret = ret + 1

            if (1 == 1){
              current = current - 1
              if (current == 0)
                break
              else
                continue
            }

            panic()
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
      'strings in different memory locations are equal',
      `
          var a = "asd"
          var b = "asd"
          var c = "xxx"

          #[export] fun test(): void = {

            var x = "a" ++ "s" ++ "d"

            support::test::assert(a == b, "a == b")
            support::test::assert(b == b, "b == b")
            support::test::assert(b == a, "b == a")
            support::test::assert(b != c, "b != c")
            support::test::assert(a != c, "a != c")
            support::test::assert(a == x, "a == x")
            support::test::assert(b == x, "b == x")
            support::test::assert(c != x, "c != x")

            support::test::assert(x == a, "x == a")
            support::test::assert(x == b, "x == b")
            support::test::assert(x != c, "x != c")

            support::test::assert(a as ref != b as ref, "a as ref != b as ref")
            support::test::assert(b as ref == b as ref, "b as ref == b as ref")
            support::test::assert(a as ref == a as ref, "a as ref == a as ref")
            support::test::assert(b as ref != a as ref, "b as ref != a as ref")
            support::test::assert(b as ref != c as ref, "b as ref != c as ref")
            support::test::assert(a as ref != c as ref, "a as ref != c as ref")

            support::test::assert(x as ref != a as ref, "x as ref != a as ref")
            support::test::assert(x as ref != b as ref, "x as ref != b as ref")
            support::test::assert(x as ref != c as ref, "x as ref != c as ref")
          }
      `,
      async (x, err) => {
        if (err) throw err;
        x.exports.test();
      }
    );

    test(
      'str len',
      `
          #[export] fun len(): u32 = "asd".length

          #[export] fun b(x: i32): u32 = match x {
            case 0 -> "".length
            case 1 -> "1".length
            case 2 -> "11".length
            case 3 -> "⨔⨔⨔".length
            else -> {
              panic()
              0 as u32
            }
          }
      `,
      async (x, err) => {
        if (err) throw err;
        expect(x.exports.len()).to.eq(3);
        expect(x.exports.b(0)).to.eq(0);
        expect(x.exports.b(1)).to.eq(1);
        expect(x.exports.b(2)).to.eq(2);
        expect(x.exports.b(3)).to.eq(3);
        expect(() => x.exports.b(92)).to.throw();
      }
    );

    test(
      'String.charAt',
      `
        val str = "asd❮𝐑"

        #[export] fun charAt(at: u32): u16 = str[at]
        #[export] fun len(): u32 = str.length
      `,
      async (x, err) => {
        if (err) throw err;
        expect(x.exports.len()).to.eq(6);

        let str = String.fromCodePoint(...[0, 1, 2, 3, 4, 5].map($ => x.exports.charAt($)));

        expect(str).to.eq('asd❮𝐑');

        expect(() => x.exports.charAt(100)).to.throw();
      }
    );

    test(
      'keccak',
      `
        import system::hash::keccak

        var k = Keccak()

        #[export] fun resultAddress(): u32 = {
          k.result.ptr - 4 as u32
        }

        #[export] fun reset(): void = {
          Keccak.reset(k)
        }

        #[export] fun digest(): u32 = {
          Keccak.digest(k).ptr
        }

        #[export] fun update(address: u32, length: u32): void = {
          Keccak.update(k, address, length)
        }

        #[export] fun topMemory(): u32 = {
          system::core::memory::getMaxMemory()
        }
      `,
      async (x, err) => {
        if (err) throw err;

        const dataView = new DataView(x.exports.memory.buffer);

        const update = (data: string) => {
          const safeOffset = x.exports.topMemory(0);
          const bytes = getBytes(data);
          bytes.forEach((value: number, ix: number) => {
            dataView.setUint8(safeOffset + ix, value);
          });
          x.exports.update(safeOffset, bytes.length);
        };

        const getResult = (finalize = true) => {
          if (finalize) {
            x.exports.digest();
          }

          const retAddress = x.exports.resultAddress(0);
          expect(retAddress).to.gt(0, 'retAddress must be > 0');
          return readBytes(x.exports.memory.buffer, retAddress)
            .map($ => ('00' + $.toString(16)).substr(-2))
            .join('');
        };

        const bytes = getResult();
        expect(bytes.length).to.eq(64);
        expect(bytes).to.eq('c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470');

        const testStr = (data: string, hash: string) => {
          x.exports.reset();
          update(data);
          const result = getResult(true);
          expect(result).to.eq(hash, `hash of ${JSON.stringify(data)}`);
        };

        // test asd
        testStr('asd', '87c2d362de99f75a4f2755cdaaad2d11bf6cc65dc71356593c445535ff28f43d');
        // test again to verify we do not let any trash behind
        testStr('asd', '87c2d362de99f75a4f2755cdaaad2d11bf6cc65dc71356593c445535ff28f43d');

        testStr(
          ';lkja;slkdjfa;sdflasldfhaisdfiahlisdfhliasdfhasdhklfaklsdfjkashldf😂🤯🤬😱😨😥',
          'f4cf631d11ba45c1f26071907fd75542494e6a01c24fcae7666422afe1f5ddb8'
        );

        testStr('➙➛➪➸⤃⇏➳⇛⤙⤞⥇', 'ce14f15b91fe58c714ac1ce02497ea2d18d043cab566bb0425ed59531728c4f1');
      }
    );
  });

  describe('type alias', () => {
    test(
      'type alias of native',
      `
        type int = i32
        type Integer = int
        #[export] fun add(a: i32, b: int): int = a + b
        #[export] fun add2(a: i32, b: int): Integer = a + b
      `,
      async (x, err) => {
        if (err) throw err;
        expect(x.exports.add(10, 13)).to.eq(23);
        expect(x.exports.add2(30, 13)).to.eq(43);
      }
    );

    test(
      'alias discriminants',
      `
        type newKindOfString = ref

        #[export] fun d_ref(): u32 = newKindOfString.^discriminant
        #[export] fun d_str(): u32 = ref.^discriminant
      `,
      async (x, err) => {
        if (err) throw err;
        const d_ref = x.exports.d_ref();
        const d_str = x.exports.d_str();

        expect(d_ref).to.gt(0);
        expect(d_str).to.gt(0);

        expect(d_str).to.not.eq(d_ref);
      }
    );
  });

  describe('struct', () => {
    test(
      'get struct values',
      `
        struct Vector3(x: i32, y: i32, z: i32)

        #[export] fun testPassing(): void = {
          var a = Vector3(1, 2, 3)

          support::test::verify( a is Vector3, "a is Vector3" )
          support::test::mustEqual( Vector3.x(a), 1, "x")
          support::test::mustEqual( Vector3.y(a), 2, "y" )
          support::test::mustEqual( Vector3.z(a), 3, "z" )
        }

        #[export] fun testFailing(): void = {
          var a = Vector3(1, 2, 3)
          support::test::assert( Vector3.x(a) == 999, "this one must fail" )
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
        enum Color {
          None
          Red
          Green
          Blue
          Custom(hex: i32)
        }

        struct CatBag(a: i32, b: boolean, c: f32, d: i64, e: f64, f: Color, g: Red | None)

        #[export] fun testPassing(): void = {
          var a = CatBag(1, true, 3.0, 0x8 as i64, 0.4 as f64, Red, Red)

          support::test::assert( a is CatBag )
          support::test::assert( CatBag.a(a)    == 1 )
          support::test::assert( CatBag.b(a)    == true )
          support::test::assert( CatBag.c(a)    == 3.0 )
          support::test::assert( CatBag.d(a)    == 0x8 )
          support::test::assert( CatBag.e(a)    == 0.4 as f64 )
          support::test::assert( CatBag.f(a)    is Red )
          support::test::assert( CatBag.g(a)    is Red )
          support::test::assert( CatBag.f(a)    is Color )
          support::test::assert( CatBag.g(a)    is Color )

          CatBag.a(a, 5)
          CatBag.b(a, false)
          CatBag.c(a, -999.0)
          CatBag.d(a, 0xdeadbeef as i64)
          CatBag.e(a, 6.08e23 as f64)
          CatBag.f(a, Custom(333))
          CatBag.g(a, None)

          support::test::assert( CatBag.a(a)    == 5 )
          support::test::assert( CatBag.b(a)    == false )
          support::test::assert( CatBag.c(a)    == -999.0 )
          support::test::assert( CatBag.d(a)    == 0xdeadbeef as i64 )
          support::test::assert( CatBag.e(a)    == 6.08e23 as f64 )
          support::test::assert( CatBag.f(a)    is Custom )
          support::test::assert( CatBag.g(a)    is None )
          support::test::assert( CatBag.f(a)    is Color )
          support::test::assert( CatBag.g(a)    is Color )

          var custom = CatBag.f(a)

          support::test::assert( custom is Custom )

          match custom {
            case x is Custom -> support::test::assert( Custom.hex(x) == 333 )
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
        enum Tree {
          Leaf(value: i32)
          Branch(left: Leaf)
        }

        #[export] fun testPassing(): void = {
          var a = Branch(Leaf(1))

          support::test::assert( a      is Branch )
          support::test::assert( a.left is Leaf )
          support::test::assert( a.left.value == 1 )
          a.left.value = 2
          support::test::assert( a.left.value == 2 )
        }


        #[export] fun testFailing(): void = {
          var a = Branch(Leaf(1))
          a.left.value = 2
          support::test::assert( a.left.value == 1, "this one MUST fail" )
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
        enum Color {
          None
          Red
          Green
          Blue
          Custom(hex: i32)
        }

        struct CatBag(a: i32, b: boolean, c: f32, d: i64, e: f64, f: Color, g: Red | None)

        #[export] fun testPassing(): void = {
          var a = CatBag(1, true, 3.0, 0x8 as i64, 0.4 as f64, Red, Red)

          support::test::assert( a   is CatBag, "A" )
          support::test::assert( a.a == 1, "B" )
          support::test::assert( a.b == true, "C" )
          support::test::assert( a.c == 3.0, "D" )
          support::test::assert( a.d == 0x8, "E" )
          support::test::assert( a.e == 0.4 as f64, "F" )
          support::test::assert( a.f is Red, "G" )
          support::test::assert( a.g is Red, "H" )
          support::test::assert( a.f is Color, "I" )
          support::test::assert( a.g is Color, "J" )

          a.a = 5
          a.b = false
          a.c = -999.0
          a.d = 0xdeadbeef as i64
          a.e = 6.08e23 as f64
          support::test::printNumber(a.c)
          a.f = Custom(333)
          support::test::printNumber(a.c)
          a.g = None


          support::test::printNumber(0)

          support::test::printNumber(a.a)
          support::test::assert( a.a == 5, "K" )
          support::test::printNumber( if(a.b) 1 else 0 )
          support::test::assert( a.b == false, "L" )
          support::test::printNumber(a.c)
          support::test::assert( a.c == -999.0, "M" )
          support::test::assert( a.d == 0xdeadbeef as i64, "N" )
          support::test::assert( a.e == 6.08e23 as f64, "Ñ" )
          support::test::assert( a.f is Custom, "O" )
          support::test::assert( a.g is None, "P" )
          support::test::assert( a.f is Color, "Q" )
          support::test::assert( a.g is Color, "V" )

          support::test::assert( a.f is Custom, "W" )

          match a.f {
            case x is Custom -> support::test::assert( x.hex == 333, "X" )
            else -> support::test::assert( false, "Y" )
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
        enum Enum {
          None
          Custom(hex: i32)
        }

        #[export] fun testPassing(): void = {
          var custom: Enum = Custom(333)

          match custom {
            case x is Custom -> support::test::assert( x.hex == 333 )
            else -> panic()
          }
        }

        #[export] fun testFailing(): void = {
          var custom: Enum = None

          match custom {
            case x is Custom -> support::test::assert( Custom.hex(x) == 333 )
            else -> panic()
          }
        }
      `,
      async (x, err) => {
        if (err) throw err;
        x.exports.testPassing();
        expect(() => x.exports.testFailing()).to.throw();
      }
    );

    test(
      'automatic coercion in binary operations',
      `
        import support::test

        var a64 = 123 as i64
        var a32 = 123 as i32
        var a16 = 123 as i16
        var a8 = 123 as u8

        var b64 = 99 as i64
        var b32 = 99 as i32
        var b16 = 99 as i16
        var b8 = 99 as u8

        #[export] fun testPassing(): void = {
          assert( a64 == a32, "a64 == a32" )
          assert( a64 == a16, "a64 == a16" )
          assert( a64 == a8,  "a64 == a8"  )
          assert( a64 == a64, "a64 == a64" )

          assert( a64 != b32, "a64 != b32" )
          assert( a64 != b16, "a64 != b16" )
          assert( a64 != b8,  "a64 != b8"  )
          assert( a64 != b64, "a64 != b64" )
        }
      `,
      async (x, err) => {
        if (err) throw err;
        x.exports.testPassing();
      }
    );

    // test(
    //   'automatic coercion in binary operations, automatic cast by declaration',
    //   `
    //     import support::test

    //     var a64: i64 = 123
    //     var a32: i32 = 123
    //     var a16: i16 = 123
    //     var a8: u8 = 123

    //     var b64: i64 = 99
    //     var b32: i32 = 99
    //     var b16: i16 = 99
    //     var b8: u8 = 99

    //     #[export] fun testPassing(): void = {
    //       assert( a64 == a32, "a64 == a32" )
    //       assert( a64 == a16, "a64 == a16" )
    //       assert( a64 == a8,  "a64 == a8"  )
    //       assert( a64 == a64, "a64 == a64" )

    //       assert( a64 != b32, "a64 != b32" )
    //       assert( a64 != b16, "a64 != b16" )
    //       assert( a64 != b8,  "a64 != b8"  )
    //       assert( a64 != b64, "a64 != b64" )
    //     }
    //   `,
    //   async (x, err) => {
    //     if (err) throw err;
    //     x.exports.testPassing();
    //   }
    // );

    test(
      'store values',
      `
        struct Custom(r: i32, g: i32)

        val x = Custom(0,0)
        val y = Custom(0,0)

        fun getX(): u32 = addressFromRef(x)
        fun getY(): u32 = addressFromRef(y)

        #[export] fun testLoad(): void = {
          support::test::assert(i32.load(x) == 0, "i32.load(x) == 0")
          support::test::assert(i32.load(y) == 0, "i32.load(y) == 0")
        }

        #[export] fun testStore(): void = {
          i32.store(x, 3)
          i32.store(y, 2882400001) // 0xabcdef01
          i32.store(y, 5, 5 as u32)
        }

        #[export] fun assert(): void = {
          support::test::assert(i32.load(x) == 3, "i32.load(x) == 3")
          support::test::assert(i32.load(y) as u32 == 0xABCDEF01, "i32.load(y) as u32 == 0xABCDEF01")
          support::test::assert(i32.load(y) == 0xABCDEF01 as i32, "i32.load(y) == 0xABCDEF01 as i32")
          support::test::assert(i32.load(y) as i64 == 0xABCDEF01 as i32 as i64, "i32.load(y) as i64 == 0xABCDEF01 as i64")
          support::test::assert(u8.load(y) as i32 == 0x01 as i32, "u8.load(y) as i32 == 0x01 as i32")
          support::test::assert(u8.load(y, 5 as u32) as i32 == 5, "u8.load(y, 5 as u32) as i32 == 5")
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
        enum x {
          Custom(r: i32, g: i32)
        }

        #[export] fun testColors(): void = {
          val x = Custom(0,0)
          val y = Custom(0,0)

          support::test::assert(i32.load(x) == 0)
          support::test::assert(i32.load(y) == 0)

          i32.store(x, 3)
          i32.store(y, 2882400001) // 0xabcdef01
          i32.store(y, 5, 5 as u32)

          support::test::assert(i32.load(x) == 3)
          support::test::assert(i32.load(y) == 0xABCDEF01 as i32)
          support::test::assert(u8.load(y) as i32 == 0x01 as i32)
          support::test::assert(u8.load(y, 5 as u32) as i32 == 5)
        }

        #[export] fun retRef(): u32 = addressFromRef(Custom(0, 0))
      `,
      async (x, err) => {
        if (err) throw err;
        x.exports.testColors();
        const a = x.exports.retRef();
        const b = x.exports.retRef();
        const c = x.exports.retRef();
        expect(b).to.gt(a);
        expect(c).to.gt(b);
      }
    );
  });
  describe('operators', () => {
    test(
      'single addition, overrides core',
      `
        type i32 = %stack { lowLevelType="i32" byteSize=4 }
        type f32 = %stack { lowLevelType="f32" byteSize=4 }

        impl f32 {
          fun +(a: f32, b: i32): i32 = 0
        }

        impl i32 {
          fun +(a: i32, b: i32): i32 = 1
          fun +(a: i32, b: f32): i32 = 4
        }

        #[export] fun main1(a: i32, b: f32): i32 = {
          a + b
        }

        #[export] fun main2(a: i32, b: f32): i32 = {
          b + a
        }

        #[export] fun main3(a: i32, b: i32): i32 = {
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
        #[export] fun main(a: i32, b: i32): i32 = {
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
        type void = %injected
        #[export] fun main(): void = {
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
        type void = %injected
        #[export] fun main(): void = {}
      `,
      async x => {
        expect(x.exports.main()).to.eq(undefined);
      }
    );
  });

  describe('imports', () => {
    test(
      'panic',
      `
        #[export] fun test(): void = {
          support::test::assert((1 > 0)  == true, "(1 > 0)  == true")
          support::test::assert((0 > 0)  == false, "(0 > 0)  == false")
          support::test::assert((0 > 1)  == false, "(0 > 1)  == false")
          support::test::assert((0 >= 0) == true, "(0 >= 0) == true")
          support::test::assert((1 < 0)  == false, "(1 < 0)  == false")
          support::test::assert((0 < 0)  == false, "(0 < 0)  == false")
          support::test::assert((0 < 1)  == true, "(0 < 1)  == true")
          support::test::assert((0 <= 1) == true, "(0 <= 1) == true")
        }

        #[export] fun testBool(i: i32): boolean = match i {
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

        #[export] fun testBool0():  boolean = 1 > 0  // true
        #[export] fun testBool1():  boolean = 0 > 0  // false
        #[export] fun testBool2():  boolean = 0 > 1  // false
        #[export] fun testBool3():  boolean = 1 >= 0 // true
        #[export] fun testBool4():  boolean = 0 >= 0 // true
        #[export] fun testBool5():  boolean = 0 >= 1 // false
        #[export] fun testBool6():  boolean = 1 < 0  // false
        #[export] fun testBool7():  boolean = 0 < 0  // false
        #[export] fun testBool8():  boolean = 0 < 1  // true
        #[export] fun testBool9():  boolean = 1 <= 0 // false
        #[export] fun testBool10(): boolean = 0 <= 0  // true
        #[export] fun testBool11(): boolean = 0 <= 1  // true
        #[export] fun testBool12(): boolean = false   // false
        #[export] fun testBool99(): boolean = true    // true

        #[export] fun testPanic1(): void = {
          support::test::assert((0 > 0) == true, "this one MUST fail")
        }

        #[export] fun testPanic2(): void = {
          support::test::assert(0 > 0, "this one MUST fail")
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
        type void = %injected

        val bc = 1

        var a: i32 = {
          bc - 2
        }

        #[export] fun retMinusOne(): i32 = 0 - 1

        #[export] fun main(x: i32): void = {
          if (x < 0) {
            a = 0
          } else {
            a = x
          }
        }

        #[export] fun getValue(): i32 = a
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
      #[export] fun main(x: i32): i32 = {
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
        #[export] fun main(x: i32): i32 = {
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
        #[export] fun main(x: i32): i32 = {
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

        #[export] fun add(a: i32, b: i32): i32 = a + b

        #[export] fun add2(a: f32, b: f32): f32 = {
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

        #[export] fun add(a: i32, b: i32): i32 = {{{a}} + {{{b}}}}

        #[export] fun add2(a: f32, b: f32): f32 = {{
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
      'overload infix',
      `

        private fun sum(a: f32, b: f32): f32 = a + b
        private fun sum(a: i32, b: i32): i32 = a + b
        private fun sum(a: i32): i32 = a + 100
        private fun sum(a: f32): f32 = a + 100.0

        #[export] fun testInt(a: i32, b: i32): i32 = sum(a,b)
        #[export] fun testFloat(a: f32, b: f32): f32 = sum(a,b)

        #[export] fun testInt2(a: i32): i32 = sum(a)
        #[export] fun testFloat2(a: f32): f32 = sum(a)
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

        #[export] fun test1(a: i32): boolean =
          match a {
            case 1 -> true
            else -> false
          }

        #[export] fun test2(a: i32): i32 =
          match a {
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

        #[export] fun test3(a: i32): boolean =
          match (a + 1) {
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

  describe('fixtures/execution', () => {
    testFolder('/**/*.lys');
  });

  describe('fixtures/execution/modules', () => {
    testFolder('/modules/*.md');
  });
});
