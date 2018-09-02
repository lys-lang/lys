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
  target?: string,
  customTest?: (document: T, error?: Error) => Promise<void>,
  phases?: (txt: string) => T,
  debug?: boolean,
  itName?: string
) {
  testParseTokenFailsafe(
    txt,
    target,
    async (doc: T, e) => {
      if (doc && doc.errors && doc.errors.length) {
        throw doc.errors[0];
      }

      if (customTest) {
        await customTest(doc, e);
      } else if (e) {
        throw e;
      }
    },
    phases,
    debug,
    itName
  );
}

export function testParseTokenFailsafe<T extends PhaseResult>(
  txt: string,
  target?: string,
  customTest?: (document: T, error?: Error) => Promise<any>,
  phases?: (txt: string) => T,
  debug?: boolean,
  itName?: string
) {
  it(itName || inspect(txt, false, 1, true) + ' must resolve into ' + (target || '(FIRST RULE)'), async function() {
    this.timeout(10000);

    debug && console.log('      ---------------------------------------------------');

    let result: T;

    try {
      const x: any = (result = phases(txt));
      if (x.document) {
        x.document.file = itName;
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

export function printAST(token: IToken | Nodes.Node, level = 0) {
  if (token instanceof Nodes.Node) {
    const ofType = token.ofType ? ' type=' + token.ofType.toString() : '';
    const text = token.text ? '=' + token.text.replace(/\n/g, '\\n') : '';
    const annotations =
      token.getAnnotations().size > 0
        ? ' annotations=' +
          Array.from(token.getAnnotations().values())
            .map($ => $.toString())
            .join(',')
        : '';
    return (
      '\n' +
      '  '.repeat(level) +
      `|-${token.nodeName}${text}${ofType}${annotations}` +
      (token.children || []).map(c => printAST(c, level + 1)).join('')
    );
  }

  return (
    '\n' +
    '  '.repeat(level) +
    `|-${token.type}${token.text ? '=' + token.text.replace(/\n/g, '\\n') : ''}` +
    (token.children || []).map(c => printAST(c, level + 1)).join('')
  );
}

export function folderBasedTest<T extends PhaseResult>(
  grep: string,
  phases: (txt: string) => T,
  fn: (x: T, err?: Error) => Promise<string>,
  extension = '.wast',
  shouldFail = false
) {
  function testFile(file: string) {
    const content = readFileSync(file).toString();
    testParseTokenFailsafe(
      content,
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
          const compareToFileName = file + extension;
          const compareFileExists = existsSync(compareToFileName);
          const compareTo = compareFileExists ? readFileSync(compareToFileName).toString() : '';
          if (writeToFile || !compareFileExists) {
            writeFileSync(compareToFileName, result);
          }
          expect(result.trim()).toEqual(compareTo.trim());
        }
      },
      phases,
      false,
      file
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
