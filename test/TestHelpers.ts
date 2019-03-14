import { IToken } from 'ebnf';
import { readFileSync, existsSync, writeFileSync } from 'fs';
declare var require, it, console;
import * as expect from 'expect';
import glob = require('glob');
import { Nodes } from '../dist/parser/nodes';
import { PhaseResult } from '../dist/parser/phases/PhaseResult';

const writeToFile = process.env.UPDATE_AST === 'true';

let inspect = require('util').inspect;

export function testParseToken<T extends PhaseResult>(
  txt: string,
  fileName: string,
  target?: string,
  customTest?: (document: T, error?: Error) => Promise<void>,
  phases?: (txt: string, fileName: string) => T,
  debug?: boolean
) {
  testParseTokenFailsafe(
    txt,
    fileName,
    target,
    async (doc: T, e) => {
      if (doc && doc.parsingContext.messageCollector.errors && doc.parsingContext.messageCollector.errors.length) {
        throw doc.parsingContext.messageCollector.errors[0];
      }

      if (customTest) {
        await customTest(doc, e);
      } else if (e) {
        throw e;
      }
    },
    phases,
    debug
  );
}

export function testParseTokenFailsafe<T extends PhaseResult>(
  txt: string,
  fileName: string,
  target?: string,
  customTest?: (document: T, error?: Error) => Promise<any>,
  phases?: (txt: string, fileName: string) => T,
  debug?: boolean
) {
  it(fileName || inspect(txt, false, 1, true) + ' must resolve into ' + (target || '(FIRST RULE)'), async function() {
    this.timeout(10000);

    debug && console.log('      ---------------------------------------------------');

    let result: T;

    try {
      const x: any = (result = phases(txt, fileName));
      if (x.document) {
        x.document.file = fileName;
      }
    } catch (e) {
      if (customTest) {
        await customTest(result, e);
      } else {
        throw e;
      }
    }

    if (customTest && result) {
      await customTest(result);
    }
  });
}

export function folderBasedTest<T extends PhaseResult>(
  grep: string,
  phases: (txt: string, fileName: string) => T,
  fn: (x: T, err?: Error) => Promise<string>,
  extension = '.wast',
  shouldFail = false
) {
  function testFile(fileName: string) {
    const content = readFileSync(fileName).toString();
    testParseTokenFailsafe(
      content,
      fileName,
      'Document',
      async (resultNode: T, err) => {
        if (!resultNode && !err) throw new Error('WTF');

        if (shouldFail) {
          if (!err && resultNode && resultNode.isSuccess()) {
            throw new Error('Test did not fail');
          }
        } else {
          if (err) {
            throw err;
          }
        }

        let result = await fn(resultNode, err);

        if (extension !== null) {
          const compareToFileName = fileName + extension;
          const compareFileExists = existsSync(compareToFileName);
          const compareTo = compareFileExists ? readFileSync(compareToFileName).toString() : '';
          if (writeToFile || !compareFileExists) {
            writeFileSync(compareToFileName, result);
          }
          expect(compareTo.trim().length > 0 || !compareFileExists).toEqual(
            true,
            'comparing against blank file: ' + compareToFileName
          );
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

process.on('unhandledRejection', function(err) {
  console.log('unhandledRejection');
  console.error(err);
  console.log(err.stack);
  process.exit(1);
});
