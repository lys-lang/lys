import { hexDump, readString } from '../execution';
import { ForegroundColors, formatColorAndReset } from '../colors';

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

export function getTestResults(instance: any): TestDescription[] {
  return instance.testResults || (instance.testResults = []);
}

export default function(getInstance: () => any) {
  function getTestStack(): TestDescription[] {
    const instance = getInstance();
    return instance.testStack || (instance.testStack = []);
  }

  function getTopTest() {
    const testStack = getTestStack();
    if (testStack.length) {
      return testStack[testStack.length - 1];
    }
    return null;
  }

  return {
    test: {
      printMemory: (start: number, length: number) => {
        console.log(`Dump from ${start.toString(16)} of ${length} bytes`);

        while (start % 16 !== 0 && start !== 0) {
          // tslint:disable-next-line:no-parameter-reassignment
          start--;
        }

        while (length % 16 !== 0) {
          // tslint:disable-next-line:no-parameter-reassignment
          length++;
        }

        console.log(hexDump(getInstance().exports.memory.buffer, start + length, start));
      },
      pushTest: (offset: number) => {
        const title = readString(getInstance().exports.memory.buffer, offset);
        const top = getTopTest();
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
          getTestResults(getInstance()).push(suite);
        }

        getTestStack().push(suite);

        const level = getTestStack().length;
        const indentation = '  '.repeat(level);

        console.log('\n' + indentation + title + ':');
      },
      popTest: () => {
        if (getTestStack().length) {
          const suite = getTestStack().pop();
          if (suite) {
            if (
              (suite.tests && suite.tests.some($ => !$.passed)) ||
              (suite.assertions && suite.assertions.some($ => !$.passed))
            ) {
              suite.passed = false;
            }
            suite.endTime = Date.now();
          }
        }
      },
      registerAssertion: (passed: number, nameOffset: number) => {
        const title = readString(getInstance().exports.memory.buffer, nameOffset);
        const didPass = !!passed;

        const suite = getTopTest();

        if (suite) {
          suite.passed = suite.passed && didPass;
          suite.assertions = suite.assertions || [];
          suite.assertions.push({
            title,
            passed: didPass
          });
        }

        const level = getTestStack().length;
        const indentation = '  '.repeat(level + 1);

        if (didPass) {
          console.log(
            indentation +
              formatColorAndReset('✓ ', ForegroundColors.Green) +
              formatColorAndReset(title, ForegroundColors.Grey)
          );
        } else {
          console.log(
            indentation +
              formatColorAndReset('X ', ForegroundColors.Red) +
              formatColorAndReset(title, ForegroundColors.Grey)
          );
        }
      },
      printNumber: (x: number) => {
        console.log('printNumber: ' + x);
      },
      printString: (offset: number) => {
        const str = readString(getInstance().exports.memory.buffer, offset);
        console.log(str);
      }
    }
  };
}
