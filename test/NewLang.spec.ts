declare var describe, it, require, console;

import { Grammars, Parser, IToken } from 'ebnf';
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

    describe('Types', () => {
      test`
        // 8 bit
        type byte = ???

        // 16 bit
        type short = ???
        type ushort = ???

        // 32 bit
        type int32 = ???
        type float = ???
        type uint32 = ???

        // 64 bit
        type int64 = ???
        type double = ???
        type uint64 = ???
      `;
      test`
        // 8 bit
        type byte = ???

        // 16 bit
        type short = ???
        type ushort = ???

        // 32 bit
        export type int32 = ???
        type float = ???
        export type uint32 = ???

        // 64 bit
        type int64 = ???
        type double = ???
        type uint64 = ???
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
    test`fun test() = ???`;

    test`fun test(  a: MBER,      b   : NumBer) = 1`;

    test`export fun test() = 2`;

    test`var test: Double = 1`;
    test`var test = 1`;
    test`export var test = 1`;

    test`const test: Number = 1`;
    test`const test = 1`;

    test`const test = 1 * 1 - 2 / 4 and 1 == 3 or 4 <= 4`;

    test`const test = 1`;

    test`const test = 1 mul 4`;

    test`const floatingNumber: Number = 1.0`;
    test`const floatingNumber: Number = 0.0`;

    test`export const test = 1`;
    test`const test = true`;
    test`const test = false`;
    test`const test = null`;

    test`fun test(): Number = 1`;

    test`fun test(): Number = /*asd*/ 1`;
    test`fun test(): Number = /**/ 1`;

    test`export fun test(a: Number) = 2`;
    test`export fun test(a: Number, b: Type) = 2`;

    test`const test = 1 + (4 + 1)`;
    test`const test = (1 + 4) + 1`;

    test`
      export var test = 1
      var test2 = 1
      const test2 = 1
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
    // export struct Entity {
    //   a: Number,
    //   b: Entity*,
    //   c: Number*[]
    // }
    // export var entities: Entity* = 1
    // export fun getTest() = test
    // `;

    test`const test = 1 match {}`;
    test`const test = 1 match { else -> 1 }`;
    test`
      const test = 1 match {
        case 2 -> true
        else -> false
      }
    `;

    test`const test = 1 match { case 2 -> true else -> false }`;

    test`
      const test = 1 match {
        case 2->true
        else->false
      }
    `;

    test`
      const test = 1 match {
        case 2 -> true
        else -> false
      }
    `;

    test`
      const test = 1 match {
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
      var x =
        if (x)
          elseifo() elsiso 3
        else
          ifa()
    `;

    test`const test = 1 match { case x if x < 1 and x < 10 -> true }`;
    test`var a = x match { else -> 1 } map 1 * 2`;

    test`var a = !x()`;
    test`var a = x()`;

    testParseTokenFailsafe(parser, `export fun test(a: ) = 2`, null, doc => {
      expect(doc.errors[0].token.type).toEqual('SyntaxError');
      expect(doc.errors[0].token.text).toEqual(') = 2');
    });
    testParseTokenFailsafe(parser, `export struct Entity asd const x = 1`, null, doc => {
      expect(doc.errors[0].token.type).toEqual('SyntaxError');
      expect(doc.errors[0].token.text).toEqual('asd ');
    });
    testParseTokenFailsafe(parser, `export struct Entity asd`, null, doc => {
      expect(doc.errors[0].message).toEqual('Unexpected end of input: \nasd');
    });
    testParseTokenFailsafe(parser, `struct Entity asd const x = 1`, null, doc => {
      expect(doc.errors[0].token.type).toEqual('SyntaxError');
      expect(doc.errors[0].token.text).toEqual('asd ');
    });
    testParseTokenFailsafe(parser, `struct Entity asd`, null, doc => {
      expect(doc.errors[0].message).toEqual('Unexpected end of input: \nasd');
    });

    testParseTokenFailsafe(parser, `export fun test(a: ,b: AType) = 2`, null, doc => {
      expect(doc.errors[0].token.type).toEqual('SyntaxError');
      expect(doc.errors[0].token.text).toEqual(',b: AType) = 2');
    });

    testParseTokenFailsafe(parser, `export fun test() = 2 /*`, null, doc => {
      expect(doc.errors[0].token.type).toEqual('SyntaxError');
      expect(doc.errors[0].token.text).toEqual('');
    });

    testParseTokenFailsafe(parser, `export fun test(a: 1) = 2`, null, doc => {
      expect(doc.errors[0].token.type).toEqual('SyntaxError');
      expect(doc.errors[0].message).toEqual('Unexpected input: "1" Expecting: OfType');
      expect(doc.errors[0].token.text).toEqual('1');
    });

    testParseTokenFailsafe(parser, 'export fun () = 1', null, doc => {
      expect(doc.errors[0].token.type).toEqual('SyntaxError');
      expect(doc.errors[0].token.text).toEqual('() = 1');
    });

    testParseTokenFailsafe(parser, 'var a = .0', null, doc => {
      expect(doc.errors[0].token.type).toEqual('SyntaxError');
      expect(doc.errors[0].token.text).toEqual('.0');
    });

    testParseTokenFailsafe(parser, 'var a = x match { else } map 1', null, doc => {
      expect(doc.errors[0].token.type).toEqual('SyntaxError');
      expect(doc.errors[0].token.text).toEqual('else } map 1');
    });

    testParseTokenFailsafe(parser, 'var a = x match { else -> } map 1', null, doc => {
      expect(doc.errors[0].token.type).toEqual('SyntaxError');
      expect(doc.errors[0].token.text).toEqual('} map 1');
    });

    testParseTokenFailsafe(parser, 'var a = match', null, doc => {
      expect(doc.errors[0].token.type).toEqual('SyntaxError');
      expect(doc.errors[0].token.text).toEqual('match');
    });

    test`const test = 1 map 1 map 2 map 3`;
    test`const test = x(1)`;
    test`const test = x(1,2)`;
    test`const test = (x)(1,2)`;
    test`const test = (x())(1,2)`;
    test`const test = x( 1 , 2 /* sdgf */)`;
  });
});
