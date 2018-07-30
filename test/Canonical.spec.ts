declare var describe;

import { testParseToken, printAST, folderBasedTest } from './TestHelpers';
import { CanonicalPhaseResult } from '../dist/parser/phases/canonicalPhase';
import { ParsingPhaseResult } from '../dist/parser/phases/parsingPhase';

const phases = function(txt: string): CanonicalPhaseResult {
  const parsing = new ParsingPhaseResult('test.ro', txt);
  const canonical = new CanonicalPhaseResult(parsing);
  return canonical;
};

describe('FileBasedCanonical', () => {
  folderBasedTest('test/fixtures/parser/*.ro', phases, result => printAST(result.document), '.ast');
});

describe('Canonical', function() {
  function test(literals, ...placeholders) {
    let result = '';

    // interleave the literals with the placeholders
    for (let i = 0; i < placeholders.length; i++) {
      result += literals[i];
      result += placeholders[i];
    }

    // add the last literal
    result += literals[literals.length - 1];
    testParseToken(result, 'Document', null, phases);
  }

  test`var a = 1`;
  test`var a: Number = 1`;
  test`var a = null`;

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

  test`
    var a = null
    var b = null
    var c = null

    var d = {
      1
      null
    }

    fun x() = a
  `;

  test`
    private fun x(a: Number, b: Number): Int = 1
    fun y(a: Number, b: Number): Int = 1
  `;
  test`
    private fun x(a: Number, b: Number): Int = {
      1
    }
    fun y(a: Number, b: Number): Int = 1
  `;

  test`
    fun y(a: Float, b: Float): Float = a + b
  `;

  test`
    fun y(a: Float, b: Float): Float = a + b - 1 * 2 / 3 % 10 << 3 >> 1 >>> 0
  `;
  test`
    fun gte(a: Float, b: Float) = a >= b and b < a or a > b or 1 <= 3 == 1111 != 3333
  `;
  test`
    fun gte(a: Float, b: Float) = a or b or c or d
  `;

  test`
    fun gte(a: Float, b: Float) = a.XX(b).XX(c).XX(d)
  `;

  test`
    fun gte(a: Float, b: Float) = a.XX
  `;

  test`
    fun gte(a: Float, b: Float) = a.XX()
  `;

  test`
    fun fn() = a match {else -> 1}
  `;

  test`
    fun fn() = a match {case 1 -> 2 else -> 1}
  `;

  test`
    fun fn() = { {a} match {case 1 -> {2} else -> {1}} }
  `;

  test`
    fun fn() = { a match {case 1 -> 2 else -> 1} }
  `;

  test`
    fun fn() = a match {
      case 1 -> 2
      case a if a < 3 -> 3.1
      else -> 1
    }
  `;
});
