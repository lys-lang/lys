import { readString, hexDump } from './execution';
const colors = require('colors/safe');

declare var WebAssembly;

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

export async function generateTestInstance(buffer: ArrayBuffer, modules: any = {}) {
  let instance = null;

  const testResults: TestDescription[] = [];
  const testStack: TestDescription[] = [];

  function getTop() {
    if (testStack.length) {
      return testStack[testStack.length - 1];
    }
    return null;
  }

  const tmpArrayBuffer = new DataView(new ArrayBuffer(1024));

  function printHexByte(x: number) {
    return ('00' + x.toString(16)).substr(-2);
  }

  function printHexInt(x: number) {
    tmpArrayBuffer.setInt32(0, x);

    return [0, 1, 2, 3].map($ => printHexByte(tmpArrayBuffer.getUint8($))).join('');
  }

  const lib = {
    ...modules,
    env: {
      ...(modules.env || {}),
      memoryBase: 0,
      tableBase: 0,
      table: new WebAssembly.Table({ initial: 0, element: 'anyfunc' }),
      printf: function(offset: number, ...args: number[]) {
        try {
          let str = readString(instance.exports.memory.buffer, offset);

          let ix = 0;

          str = str.replace(/(%(.))/g, function(substr, _, group2) {
            const extra = args[ix];

            ix++;
            switch (group2) {
              case 'd':
                return extra.toString();
              case 'x':
                return '0x' + printHexInt(extra);
              case 'X':
                return '0x' + printHexInt(extra).toUpperCase();
            }
            return substr;
          });

          instance.logs.push(str);
          console.log(str);
        } catch (e) {
          console.log(e.message, 'offset:', offset, 'extra:', args);
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
          if (
            (suite.tests && suite.tests.some($ => !$.passed)) ||
            (suite.assertions && suite.assertions.some($ => !$.passed))
          ) {
            suite.passed = false;
          }
          suite.endTime = Date.now();
        }
      },
      registerAssertion: (passed: number, nameOffset: number) => {
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

  const compiled = await WebAssembly.compile(buffer);

  instance = new WebAssembly.Instance(compiled, lib);

  instance.logs = [];
  instance.testResults = testResults;

  return instance;
}
