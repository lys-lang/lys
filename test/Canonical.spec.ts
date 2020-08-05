declare var describe: any, it: any;

import { testParseToken, folderBasedTest, PhasesResult } from './TestHelpers';
import { printAST } from '../dist/utils/astPrinter';
import { ParsingContext } from '../dist/compiler/ParsingContext';
import { nodeSystem } from '../dist/support/NodeSystem';

const phases = function(txt: string, fileName: string): PhasesResult {
  const parsingContext = new ParsingContext(nodeSystem);
  parsingContext.paths.push(nodeSystem.resolvePath(__dirname, '../stdlib'));
  const moduleName = parsingContext.getModuleFQNForFile(fileName);
  parsingContext.invalidateModule(moduleName);

  return {
    parsingContext,
    document: parsingContext.getParsingPhaseForContent(fileName, moduleName, txt)
  };
};

describe('FileBasedCanonical', () => {
  folderBasedTest(
    'test/fixtures/canonical/*.lys',
    phases,
    async result => {
      if (!result) throw new Error('No result');
      return printAST(result.document);
    },
    '.ast'
  );
});

describe('FileBasedCanonical', () => {
  folderBasedTest(
    'test/fixtures/canonical/*.lys',
    phases,
    async result => {
      if (!result) throw new Error('No result');
      return printAST(result.document);
    },
    '.ast'
  );
});

describe('Canonical', function() {
  let testCount = 0;

  function getFileName() {
    return `tests/canonical_tests_${testCount++}.lys`;
  }

  function test(literals: any, ...placeholders: any[]) {
    let result = '';

    // interleave the literals with the placeholders
    for (let i = 0; i < placeholders.length; i++) {
      result += literals[i];
      result += placeholders[i];
    }

    // add the last literal
    result += literals[literals.length - 1];
    testParseToken(result, getFileName(), async () => void 0, phases);
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

describe.skip('Canonical perf', () => {
  it('summarizes the data', () => {
    const perf: { rule: string; start: number; end: number; success: boolean }[] = (global as any).ebnfPerfMetrics;

    type X = { rule: string; callCount: number; totalTime: number; avg: number; success: number };
    const proc: Record<string, X> = {};

    perf.forEach($ => {
      if (!$.end) return;

      if (false === $.rule in proc) {
        proc[$.rule] = {
          rule: $.rule,
          callCount: 1,
          totalTime: $.end - $.start,
          avg: 0,
          success: $.success ? 1 : 0
        };
      } else {
        proc[$.rule].callCount += 1;
        proc[$.rule].totalTime += $.end - $.start;
        proc[$.rule].success += $.success ? 1 : 0;
      }
    });

    const table: X[] = [];

    for (let rule in proc) {
      proc[rule].success = (((100 * proc[rule].success) / proc[rule].callCount).toFixed(2).toString() + '%') as any;
      proc[rule].avg = proc[rule].totalTime / proc[rule].callCount;
      table.push(proc[rule]);
    }

    table.sort((a, b) => {
      if (a.avg < b.avg) return 1;
      return -1;
    });

    console.table(table.slice(0, 100));

    table.sort((a, b) => {
      if (a.totalTime < b.totalTime) return 1;
      return -1;
    });

    console.table(table.slice(0, 100));
  });
});
