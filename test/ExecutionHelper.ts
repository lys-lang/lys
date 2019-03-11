import { print } from '@webassemblyjs/wast-printer';

import { CompilationPhaseResult } from '../dist/parser/phases/compilationPhase';
import { CanonicalPhaseResult } from '../dist/parser/phases/canonicalPhase';
import { SemanticPhaseResult } from '../dist/parser/phases/semanticPhase';
import { ScopePhaseResult } from '../dist/parser/phases/scopePhase';
import { TypePhaseResult } from '../dist/parser/phases/typePhase';
import { CodeGenerationPhaseResult } from '../dist/parser/phases/codeGenerationPhase';
import { ParsingContext } from '../dist/parser/ParsingContext';
import { printNode } from '../dist/utils/nodePrinter';
import { printErrors } from '../dist/utils/errorPrinter';
import { printAST } from '../dist/utils/astPrinter';
import glob = require('glob');
import path = require('path');
import { readFileSync } from 'fs';
const colors = require('colors/safe');

declare var it, WebAssembly;

const parsingContext = new ParsingContext();

parsingContext.cwd = path.resolve(__dirname, 'fixtures', 'execution');

const phases = function(txt: string, filename = 'test.lys'): CodeGenerationPhaseResult {
  parsingContext.reset();
  const parsing = parsingContext.getParsingPhaseForContent(filename, txt);

  const canonical = new CanonicalPhaseResult(parsing);
  const semantic = new SemanticPhaseResult(canonical, 'test');
  const scope = new ScopePhaseResult(semantic);
  const types = new TypePhaseResult(scope);
  types.execute();
  types.ensureIsValid();
  const compilation = new CompilationPhaseResult(types);
  return new CodeGenerationPhaseResult(compilation);
};

export function readString(memory: ArrayBuffer, offset: number) {
  const dv = new DataView(memory, offset);
  let len = dv.getUint32(0, true);

  if (len == 0) {
    return '';
  }

  let currentOffset = 4;
  len += 4;

  const sb: string[] = [];

  while (currentOffset < len) {
    const r = dv.getUint16(currentOffset, true);
    sb.push(String.fromCharCode(r));
    currentOffset += 2;
  }

  return sb.join('');
}

export function readBytes(memory: ArrayBuffer, offset: number) {
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

/**
 * Description of a single test's results.
 */
export interface TestDescription {
  startTime: number;
  endTime: number;

  /**
   * Friendly title of the test.
   */
  title: string;

  passed: boolean;
  skipped: boolean;

  tests?: TestDescription[];

  assertions?: { title: string; passed: boolean }[];
}

async function generateInstance(compilationPhaseResult: CodeGenerationPhaseResult) {
  let instance = null;

  const testResults: TestDescription[] = [];
  const testStack: TestDescription[] = [];

  let assertionCount = 0;

  function getTop() {
    if (testStack.length) {
      return testStack[testStack.length - 1];
    }
    return null;
  }

  const lib = {
    env: {
      memoryBase: 0,
      tableBase: 0,
      table: new WebAssembly.Table({ initial: 0, element: 'anyfunc' }),
      printf: (offset: number, extra: number) => {
        try {
          const str = readString(instance.exports.memory.buffer, offset).replace('%d', extra.toString());
          instance.logs.push(str);
          console.log(str);
        } catch (e) {
          console.log(e.message, 'offset:', offset, 'extra:', extra);
        }
      },
      segfault: function() {
        throw new Error('Segmentation fault');
      }
    },
    test: {
      printMemory: (start: number, length: number) => {
        console.log(`Dump from ${start.toString(16)} of ${length} bytes`);

        while (start % 16 != 0 && start !== 0) {
          start--;
        }

        while (length % 16 != 0) {
          length++;
        }

        console.log(hexDump(instance.exports.memory.buffer, start + length, start));
      },
      pushTest: (offset: number) => {
        const title = readString(instance.exports.memory.buffer, offset);
        const top = getTop();
        const suite: TestDescription = {
          title,
          startTime: Date.now(),
          passed: true,
          skipped: false,
          endTime: Date.now()
        };

        if (top) {
          (top.tests = top.tests || []).push(suite);
        } else {
          testResults.push(suite);
        }

        testStack.push(suite);

        const level = testStack.length;
        const indentation = '  '.repeat(level);

        console.log('\n' + indentation + title + ':');
      },
      popTest: () => {
        if (testStack.length) {
          const suite = testStack.pop();
          suite.endTime = Date.now();
        }
      },
      registerAssertion: (passed: number, nameOffset: number) => {
        assertionCount++;
        const title = readString(instance.exports.memory.buffer, nameOffset);
        const didPass = !!passed;

        const suite = getTop();

        if (suite) {
          suite.passed = suite.passed && didPass;
          suite.assertions = suite.assertions || [];
          suite.assertions.push({
            title,
            passed: didPass
          });
        }

        const level = testStack.length;
        const indentation = '  '.repeat(level + 1);

        if (didPass) {
          console.log(indentation + colors.green('✓ ') + colors.grey(title));
        } else {
          console.log(indentation + colors.red('X ') + colors.grey(title));
        }
      },
      printNumber: (x: number) => {
        console.log('printNumber: ' + x);
      },
      printString: (offset: number) => {
        const str = readString(instance.exports.memory.buffer, offset);
        instance.logs.push(str);
        console.log(str);
      }
    }
  };

  instance = await compilationPhaseResult.toInstance(lib);

  instance.logs = [];
  instance.testResults = testResults;

  return instance;
}

async function testSrc(content: string, customTest?: (document: any, error?: Error) => Promise<any>) {
  let compilationPhaseResult: CodeGenerationPhaseResult;

  try {
    compilationPhaseResult = phases(content);

    if (!compilationPhaseResult.isSuccess()) {
      console.log(printErrors(compilationPhaseResult.parsingContext));
      console.log(printNode(compilationPhaseResult.document));
      console.log(printAST(compilationPhaseResult.document));
      console.log(print(compilationPhaseResult.compilationPhaseResult.typePhaseResult.typeGraph));
      throw compilationPhaseResult.parsingContext.messageCollector.errors[0];
    }

    await compilationPhaseResult.validate(false, true);

    const instance = await generateInstance(compilationPhaseResult);

    if (!instance) throw new Error('Invalid compilation');

    if (customTest) {
      try {
        await customTest(instance);
      } catch (e) {
        const maxMemory = instance.exports.test_getMaxMemory();

        console.log(hexDump(instance.exports.memory.buffer, maxMemory));
        console.error(printNode(compilationPhaseResult.document));
        console.error('NON OPTIMIZED VERSION');
        console.log(print(compilationPhaseResult.programAST));
        await compilationPhaseResult.validate(true);
        console.log(compilationPhaseResult.emitText());

        if (e.message.includes('unreachable')) {
          const text = instance.exports.test_getLastErrorMessage();

          if (text != 0) {
            throw new Error(`Execution error: ${JSON.stringify(readString(instance.exports.memory.buffer, text))}`);
          }
        }

        throw e;
      }
    }

    for (let testResult of instance.testResults) {
      if (!testResult.passed) {
        throw new Error('Suite ' + testResult.title + ' failed');
      }
    }

    await compilationPhaseResult.validate(true);

    if (customTest) {
      try {
        const newInstance = await generateInstance(compilationPhaseResult);

        await customTest(newInstance);

        for (let testResult of newInstance.testResults) {
          if (!testResult.passed) throw new Error('Suite ' + testResult.title + ' failed');
        }
      } catch (e) {
        console.error('OPTIMIZED VERSION FAILED');
        throw e;
      }
    }
  } catch (e) {
    if (customTest && customTest.length >= 2) {
      await customTest(null, e);
    } else {
      throw e;
    }
  }
}

export function testFolder() {
  function testFile(fileName: string) {
    const content = readFileSync(fileName).toString();

    it(fileName.replace(parsingContext.cwd, ''), async function() {
      this.timeout(10000);

      await testSrc(content, async (x, err) => {
        if (err) throw err;
        x.exports.main();
      });
    });
  }
  glob.sync(parsingContext.cwd + '/**/*.lys').map(testFile);
}

export function test(name: string, src: string, customTest?: (document: any, error?: Error) => Promise<any>) {
  it(name, async function() {
    this.timeout(10000);

    await testSrc(src, customTest);
  });
}

const BLOCK_SIZE = 16;
const DUMP_LIMIT = 1024 * 64;

function padStart8(str: string) {
  return ('x00000000' + str).substr(-8);
}

function padStart2(str: string) {
  return ('x00' + str).substr(-2);
}

export function hexDump(memory: ArrayBuffer, max = DUMP_LIMIT, start = 0) {
  const buffer = new Uint8Array(memory);

  let lines = [];

  for (let i = start; i < buffer.byteLength && i < max; i += BLOCK_SIZE) {
    let address = padStart8(i.toString(16)); // address
    // let block = buffer.slice(i, i + BLOCK_SIZE); // cut buffer into blocks of 16
    let hexArray = [];
    let asciiArray = [];

    for (let b = 0; b < BLOCK_SIZE; b += 1) {
      const value = buffer[i + b];
      hexArray.push(padStart2(value.toString(16)));
      asciiArray.push(value >= 0x20 && value < 0x7f ? String.fromCharCode(value) : '.');
    }

    let hexString = hexArray.join(' ');
    let asciiString = asciiArray.join('');

    lines.push(`${address}  ${hexString}  |${asciiString}|`);
  }

  return lines.join('\n');
}
