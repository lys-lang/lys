declare var describe;

import { testParseToken, printAST, folderBasedTest } from './TestHelpers';
import { CanonicalPhaseResult } from '../dist/parser/phases/canonicalPhase';
import { ParsingContext } from '../dist/parser/ParsingContext';

const phases = function(txt: string): CanonicalPhaseResult {
  const parsingContext = new ParsingContext();
  const parsing = parsingContext.getParsingPhaseForContent('test.ro', txt);
  const canonical = new CanonicalPhaseResult(parsing);
  return canonical;
};

describe('FileBasedCanonical', () => {
  folderBasedTest('test/fixtures/canonical/*.ro', phases, result => printAST(result.document), '.ast');
});

describe('Canonical', function() {
  let testCount = 0;

  function getFileName() {
    return `canonical_tests_${testCount++}.ro`;
  }

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

  test`var a = 1`;
  test`var a: Number = 1`;
  test`var a: Number = 0x0`;
  test`var a: Number = 0x1facbeda0192830190238019283`;
  test`var a: Number = -0x1facbeda0192830190238019283`;
  test`var a = false`;

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

  test`
    var a = false
    var b = false
    var c = false

    var d = {
      1
      false
    }

    fun x(): void = a
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
    fun gte(a: Float, b: Float): boolean = a >= b && b < a || a > b || 1 <= 3 == 1111 != 3333
  `;
  test`
    fun gte(a: Float, b: Float): boolean = a || b || c || d
  `;

  test`
    fun gte(a: Float, b: Float): boolean = a.XX(b).XX(c).XX(d)
  `;

  test`
    fun gte(a: Float, b: Float): boolean = a.XX
  `;

  test`
    fun gte(a: Float, b: Float): boolean = a.XX()
  `;

  test`
    fun fn(): Int  = match a {else -> 1}
  `;

  test`
    fun fn(): Int = match a {case 1 -> 2 else -> 1}
  `;

  test`
    fun fn(): Int = { match {a} {case 1 -> {2} else -> {1}} }
  `;

  test`
    fun fn(): Int = { match 1 + 2 {case 1 -> {2} else -> {1}} }
  `;

  test`
    fun fn(): Int = { match a {case 1 -> 2 else -> 1} }
  `;

  test`
    fun fn(): Int = match a {
      case 1 -> 2
      case a if a < 3 -> 3.1
      else -> 1
    }
  `;
});
