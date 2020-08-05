import { readFileSync, existsSync, writeFileSync } from 'fs';
declare var require: any, it: any, console: any;
import * as expect from 'expect';
import glob = require('glob');
import { failWithErrors } from '../dist/compiler/findAllErrors';
import { Nodes } from '../dist/compiler/nodes';
import { ParsingContext } from '../dist/compiler/ParsingContext';

const writeToFile = process.env.UPDATE_AST === 'true';

let inspect = require('util').inspect;

export type PhasesResult = { document: Nodes.DocumentNode; parsingContext: ParsingContext };

export function testParseToken<V extends PhasesResult = PhasesResult>(
  txt: string,
  fileName: string,
  customTest: (document: V | void, error?: Error) => Promise<void>,
  phases: (txt: string, fileName: string) => V,
  debug?: boolean
) {
  testParseTokenFailsafe(
    txt,
    fileName,
    async (result: V | void, e) => {
      if (result && result.parsingContext.messageCollector.hasErrors()) {
        failWithErrors('testParseToken', result.parsingContext);
      }

      if (customTest) {
        await customTest(result, e);
      } else if (e) {
        throw e;
      }
    },
    phases,
    debug
  );
}

export function testParseTokenFailsafe<V extends PhasesResult = PhasesResult>(
  txt: string,
  fileName: string,
  customTest: (document: V | void, error?: Error) => Promise<any>,
  phases: (txt: string, fileName: string) => V,
  debug?: boolean
) {
  it(fileName || inspect(txt, false, 1, true) + ' must resolve', async function(
    this: any
  ) {
    this.timeout(10000);

    debug && console.log('      ---------------------------------------------------');

    let result: V | void = void 0;

    try {
      result = phases(txt, fileName);
    } catch (e) {
      if (customTest) {
        await customTest(void 0, e);
      } else {
        throw e;
      }
    }

    if (customTest && result) {
      await customTest(result);
    }
  });
}

export function folderBasedTest<V extends PhasesResult = PhasesResult>(
  grep: string,
  phases: (txt: string, fileName: string) => V,
  fn: (x: V | void, err?: Error) => Promise<string | null>,
  extension: string | null = '.wast',
  shouldFail = false
) {
  function testFile(fileName: string) {
    const content = readFileSync(fileName).toString();
    testParseTokenFailsafe(
      content,
      fileName,
      async (resultNode: V | void, err) => {
        if (!resultNode && !err) throw new Error('WTF');

        if (shouldFail) {
          if (!err && resultNode && !resultNode.parsingContext.messageCollector.hasErrors()) {
            throw new Error('Test did not fail');
          }
        } else {
          if (resultNode && resultNode.parsingContext.messageCollector.hasErrors()) {
            failWithErrors('testFile', resultNode.parsingContext);
          }
          if (err) {
            throw err;
          }
        }

        let result = await fn(resultNode, err);

        if (result !== null && extension !== null) {
          const compareToFileName = fileName + extension;
          const compareFileExists = existsSync(compareToFileName);
          const compareTo = compareFileExists ? readFileSync(compareToFileName).toString() : '';
          if (writeToFile || !compareFileExists) {
            writeFileSync(compareToFileName, result);
          }
          expect(compareTo.trim().length > 0 || !compareFileExists).toEqual(true);
          expect(result.trim()).toEqual(compareTo.trim());
        }
      },
      phases,
      false
    );
  }

  glob.sync(grep).map(testFile);
}

process.on('uncaughtException', function(err) {
  console.log('UncaughtException');
  console.error(err);
  console.log(err.stack);
  process.exit(1);
});

process.on('unhandledRejection', function(reason: {} | null | undefined, promise: Promise<any>) {
  console.log('unhandledRejection');
  console.log(promise);
  console.error(reason);
  process.exit(1);
});
