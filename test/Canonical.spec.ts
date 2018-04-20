declare var describe, it, require, console;

import { Grammars, Parser, IToken } from 'ebnf';
import { testParseToken, describeTree, printBNF, testParseTokenFailsafe } from './TestHelpers';
import { parser } from '../dist/grammar';
import * as expect from 'expect';
import { canonicalPhase } from '../dist/parser/phases/canonicalPhase';
import { findAllErrors } from '../dist/parser/phases/findAllErrors';

let inspect = require('util').inspect;

describe.only('Canonical', function() {
  function test(literals, ...placeholders) {
    let result = '';

    // interleave the literals with the placeholders
    for (let i = 0; i < placeholders.length; i++) {
      result += literals[i];
      result += placeholders[i];
    }

    // add the last literal
    result += literals[literals.length - 1];
    testParseToken(parser, result, 'Document', null, [canonicalPhase, findAllErrors]);
  }

  test`var a = 1`;
  test`var a: Number = 1`;
  test`var a = null`;
  test`
    var a = null
    var b = null
    var c = null
    fun x() = a
  `;
  test`var a: Double* = null`;
});
