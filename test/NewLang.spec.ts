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

    test`fun test() = 1`;

    test`fun test(  a: MBER,      b   : NumBer) = 1`;

    test`export fun test() = 2`;

    test`var test: Double = 1`;
    test`var test = 1`;
    test`export var test = 1`;

    test`val test: Number = 1`;
    test`val test = 1`;

    test`val test = 1 * 1 - 2 / 4 and 1 == 3 or 4 <= 4`;

    test`val test = 1`;

    test`val test = 1 mul 4`;

    test`val floatingNumber: Number = 1.0`;
    test`val floatingNumber: Number = 0.0`;

    test`export val test = 1`;
    test`val test = true`;
    test`val test = false`;
    test`val test = null`;

    test`fun test(): Number = 1`;

    test`fun test(): Number = /*asd*/ 1`;
    test`fun test(): Number = /**/ 1`;

    test`export fun test(a: Number) = 2`;
    test`export fun test(a: Number, b: Type) = 2`;

    test`val test = 1 + (4 + 1)`;
    test`val test = (1 + 4) + 1`;

    test`
      export var test = 1
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
    // export struct Entity {
    //   a: Number,
    //   b: Entity*,
    //   c: Number*[]
    // }
    // export var entities: Entity* = 1
    // export fun getTest() = test
    // `;

    test`val test = 1 match {}`;
    test`val test = 1 match { else -> 1 }`;
    test`
      val test = 1 match {
        case 2 -> true
        else -> false
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

    test`val test = 1 match { case x if x < 1 and x < 10 -> true }`;
    test`var a = x match { else -> 1 } map 1 * 2`;

    test`var a = !x()`;
    test`var a = x()`;

    testParseTokenFailsafe(parser, `export fun test(a: ) = 2`, null, doc => {
      expect(doc.errors[0].token.type).toEqual('SyntaxError');
      expect(doc.errors[0].token.text).toEqual(') = 2');
    });
    testParseTokenFailsafe(parser, `export struct Entity asd val x = 1`, null, doc => {
      expect(doc.errors[0].token.type).toEqual('SyntaxError');
      expect(doc.errors[0].token.text).toEqual('asd ');
    });
    testParseTokenFailsafe(parser, `export struct Entity asd`, null, doc => {
      expect(doc.errors[0].message).toEqual('Unexpected end of input: \nasd');
    });
    testParseTokenFailsafe(parser, `struct Entity asd val x = 1`, null, doc => {
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

    test`val test = 1 map 1 map 2 map 3`;
    test`val test = x(1)`;
    test`val test = x(1,2)`;
    test`val test = (x)(1,2)`;
    test`val test = (x())(1,2)`;
    test`val test = x( 1 , 2 /* sdgf */)`;
  });
});
