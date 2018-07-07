declare var describe, it, require, console;

import { testParseToken, describeTree, printBNF, testParseTokenFailsafe } from './TestHelpers';
import { parser } from '../dist/grammar';
import * as expect from 'expect';

let inspect = require('util').inspect;

describe('Parser', () => {
  describe('Basic sanity tests', function() {
    printBNF(parser);

    function test(literals, ...placeholders) {
      let result = '';

      // interleave the literals with the placeholders
      for (let i = 0; i < placeholders.length; i++) {
        result += literals[i];
        result += placeholders[i];
      }

      // add the last literal
      result += literals[literals.length - 1];
      testParseToken(parser, result);
    }

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
        type Boolean {
          True
          False
        }
        type colors {
          Red
          Green
          Blue
        }
      `;

      test`
        type Maybe {
          None
          Some(a: T)
        }
      `;

      test`
        type Maybe {
          Some(a: T, b: X, c: asd)
        }
      `;

      test`
        struct Some(a: T, b: X, c: asd)
      `;

      test`
        // 8 bit
        cotype byte

        // 16 bit
        type short
        rectype ushort

        // 32 bit
        private type int32
        type float
        private rectype uint32

        // 64 bit
        type int64
        type double
        type uint64e
      `;
    });

    describe('Effects', () => {
      test`
        effect byte
        private effect byte
        effect byte
      `;

      test`
        private effect byte
      `;

      test`
        type void
        type i32

        effect state {
          get(): i32
          put(x: i32): void
        }
      `;

      test`
        type void
        type i32

        effect state<T> {
          get(): T
          put(x: T): void
        }
      `;
    });

    describe('Literals', () => {
      test`
        var a = 1
        var b = 2.0
        var c = true
        var d = false
        var e = null
        var f = "a string 'single' quote"
        var g = 'a string "double" quote'
      `;
    });

    test`fun test() = 1`;
    test`fun test() = {}`;
    test`fun test() = {    }`;
    test`fun test() = {  \n\n  }`;

    test`private fun test(  a: MBER,      b   : NumBer) = 1`;

    test`fun test() = 2`;

    test`private var test: Double = 1`;
    test`private var test = 1`;
    test`var test = 1`;

    test`val test: Number = 1`;
    test`val test = 1`;

    test`val test = 1 * 1 - 2 / 4 and 1 == 3 or 4 <= 4`;

    test`val test = 1`;

    test`val test = 1 mul 4`;

    test`val floatingNumber: Number = 1.0`;
    test`val floatingNumber: Number = 0.0`;

    test`private val test = 1`;
    test`val test = true`;
    test`val test = false`;
    test`val test = null`;

    test`fun test(): Number = 1`;

    test`fun test(): Number = /*asd*/ 1`;
    test`fun test(): Number = /**/ 1`;

    test`private fun test(a: Number) = 2`;
    test`private fun test(a: Number, b: Type) = 2`;

    test`val test = 1 + (4 + 1)`;
    test`val test = (1 + 4) + 1`;

    test`
      private var test = 1
      var test2 = 1
      val test2 = 1
    `;

    test`
    var test = 1
    fun getTest() = test
    `;

    test`var test = 1    fun pointerOfTest() = &test    `;

    test`var test: Entity* = 1 fun valueOfTest() = *test`;

    test`var test: Struct* = 1`;
    test`var test: Struct**** = 1`;

    test`var test: Struct[] = 1`;
    test`var test: Struct*[] = 1`;
    test`var test: Int64**[] = 1`;

    // test`
    // private struct Entity {
    //   a: Number,
    //   b: Entity*,
    //   c: Number*[]
    // }
    // private var entities: Entity* = 1
    // private fun getTest() = test
    // `;

    test`val test = 1 match {}`;
    test`val test = 1 match { else -> 1 }`;
    test`val test = {1 match { else -> 1 }}`;
    test`
      val test = 1 match {
        case 2 -> true
        else -> false
      }
    `;

    test`
      var a = {null}
      var b = { null }
      var c = {
        null
      }
      var d = {
        null
        null
      }
    `;

    test`val test = 1 match { case 2 -> true else -> false }`;

    test`
      val test = 1 match {
        case 2->true
        else->false
      }
    `;

    test`
      val test = 1 match {
        case 2 -> true
        else -> false
      }
    `;

    test`
      val test = 1 match {
        case x if true -> true
        case x if x < 1 and x < 10 -> true
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
          elseifo() elsiso 3
        else
          ifa()
    `;

    test`val test = 1 match { case x if x < 1 and x < 10 -> true }`;
    test`var a = x match { else -> 1 } map 1 * 2`;

    test`var a = !x()`;
    test`var a = x()`;

    testParseTokenFailsafe(parser, `private fun test(a: ) = 2`, null, async doc => {
      expect(doc.errors[0].token.type).toEqual('SyntaxError');
      expect(doc.errors[0].token.text).toEqual(') = 2');
    });
    testParseTokenFailsafe(parser, `private struct Entity asd val x = 1`, null, async doc => {
      expect(doc.errors[0].token.type).toEqual('SyntaxError');
      expect(doc.errors[0].token.text).toEqual('asd ');
    });
    testParseTokenFailsafe(parser, `private struct Entity asd`, null, async doc => {
      expect(doc.errors[0].message).toEqual('Unexpected end of input: \nasd');
    });
    testParseTokenFailsafe(parser, `struct Entity asd val x = 1`, null, async doc => {
      expect(doc.errors[0].token.type).toEqual('SyntaxError');
      expect(doc.errors[0].token.text).toEqual('asd ');
    });
    testParseTokenFailsafe(parser, `struct Entity asd`, null, async doc => {
      expect(doc.errors[0].message).toEqual('Unexpected end of input: \nasd');
    });

    testParseTokenFailsafe(parser, `private fun test(a: ,b: AType) = 2`, null, async doc => {
      expect(doc.errors[0].token.type).toEqual('SyntaxError');
      expect(doc.errors[0].token.text).toEqual(',b: AType) = 2');
    });

    testParseTokenFailsafe(parser, `private fun test() = 2 /*`, null, async doc => {
      expect(doc.errors[0].token.type).toEqual('SyntaxError');
      expect(doc.errors[0].token.text).toEqual('');
    });

    testParseTokenFailsafe(parser, `private fun test(a: 1) = 2`, null, async doc => {
      expect(doc.errors[0].token.type).toEqual('SyntaxError');
      expect(doc.errors[0].message).toEqual('Unexpected input: "1" Expecting: OfType');
      expect(doc.errors[0].token.text).toEqual('1');
    });

    testParseTokenFailsafe(parser, 'private fun () = 1', null, async doc => {
      expect(doc.errors[0].token.type).toEqual('SyntaxError');
      expect(doc.errors[0].token.text).toEqual('() = 1');
    });

    testParseTokenFailsafe(parser, 'var a = .0', null, async doc => {
      expect(doc.errors[0].token.type).toEqual('SyntaxError');
      expect(doc.errors[0].token.text).toEqual('.0');
    });

    testParseTokenFailsafe(parser, 'var a = x match { else } map 1', null, async doc => {
      expect(doc.errors[0].token.type).toEqual('SyntaxError');
      expect(doc.errors[0].token.text).toEqual('else } map 1');
    });

    testParseTokenFailsafe(parser, 'var a = x match { else -> } map 1', null, async doc => {
      expect(doc.errors[0].token.type).toEqual('SyntaxError');
      expect(doc.errors[0].token.text).toEqual('} map 1');
    });

    testParseTokenFailsafe(parser, 'var a = match', null, async doc => {
      expect(doc.errors[0].token.type).toEqual('SyntaxError');
      expect(doc.errors[0].token.text).toEqual('match');
    });

    test`val test = 1 map 1 map 2 map 3`;
    test`val test = x(1)`;
    test`val test = x(1,2)`;
    test`val test = (x)(1,2)`;
    test`val test = (x())(1,2)`;
    test`val test = x( 1 , 2 /* sdgf */)`;
    test`
      private fun compare(a: Color, b: Color): bool = {
        a == b
      }
    `;
  });
});
