import { IToken, Parser, Grammars } from 'ebnf';
import { parser } from '../dist/grammar';
import { printErrors } from '../dist/parser/printer';

import { readFileSync, existsSync, writeFileSync } from 'fs';
declare var require, it, console;
import * as expect from 'expect';
import glob = require('glob');
import { Node } from '../dist/parser/nodes';
export const printBNF = (parser: Parser) => console.log(parser.emitSource());

const writeToFile = process.env.UPDATE_AST === 'true';

let inspect = require('util').inspect;

export function testParseToken(
  parser: Parser,
  txt: string,
  target?: string,
  customTest?: (document: IToken, error?: Error) => void,
  phases?: ((a: any) => any)[],
  debug?: boolean,
  itName?: string
) {
  testParseTokenFailsafe(
    parser,
    txt,
    target,
    (doc: IToken, e) => {
      if (doc && doc.errors && doc.errors.length) throw doc.errors[0];

      const astNode = doc && doc['astNode'];

      if (astNode) {
        if (astNode.errors && astNode.errors.length) {
          console.dir(astNode.errors);
          throw astNode.errors[0];
        }
        if (astNode.rest.length != 0) throw new Error('Got rest: ' + astNode.rest);
      }

      customTest && customTest(doc, e);
    },
    phases,
    debug,
    itName
  );
}

export function testParseTokenFailsafe(
  parser: Parser,
  txt: string,
  target?: string,
  customTest?: (document: IToken, error?: Error) => void,
  phases?: ((a: any) => any)[],
  debug?: boolean,
  itName?: string
) {
  it(itName || inspect(txt, false, 1, true) + ' must resolve into ' + (target || '(FIRST RULE)'), () => {
    debug && console.log('      ---------------------------------------------------');

    let result;

    try {
      result = parser.getAST(txt, target);

      if (!result) throw new Error('Did not resolve');

      if (target && result.type != target) throw new Error("Type doesn't match. Got: " + result.type);

      if (result.text.length == 0) throw new Error('Empty text result');

      if (phases && phases.length) {
        debug && console.log(`      Phase ${0}:`);
        try {
          result = phases.reduce(($, reducer, i) => {
            debug && describeTree($);
            debug && console.log(`      Phase ${i + 1}:`);
            return reducer($);
          }, result);
        } catch (e) {
          customTest(null, e);
          return;
        }
      }

      if (customTest) customTest(result);
    } catch (e) {
      console.error(e);
      // parser.debug = true;
      // try {
      //   // result = parser.getAST(txt, target);
      //   console.log(txt + '\n' + inspect(result, false, 20, true));
      // } catch (ee) {
      //   console.(ee);
      // }
      // parser.debug = false;
      if (result) {
        try {
          printErrors(result);
          describeTree(result);
        } catch {}
      }
      throw e;
    }

    if (result && debug) describeTree(result);
  });
}

export function printAST(token: IToken | Node, level = 0) {
  if (token instanceof Node) {
    return (
      '\n' +
      '  '.repeat(level) +
      `|-${token.nodeName}${token.text ? '=' + token.text : ''}${
        token.ofType ? ' type=' + token.ofType.toString() : ''
      }` +
      (token.children || []).map(c => printAST(c, level + 1)).join('')
    );
  }

  return (
    '\n' +
    '  '.repeat(level) +
    `|-${token.type}${token.text ? '=' + token.text : ''}` +
    (token.children || []).map(c => printAST(c, level + 1)).join('')
  );
}

export function describeTree(token: IToken) {
  console.log(printAST(token));
}

export function folderBasedTest(
  grep: string,
  phases: any[],
  fn: (x, err?) => string,
  extension = '.wast',
  shouldFail = false
) {
  function testFile(file: string) {
    const content = readFileSync(file).toString();
    testParseToken(
      parser,
      content,
      'Document',
      (resultNode: any, err) => {
        if (shouldFail) {
          if (!err) throw new Error('Test did not fail');
        }

        let result = fn(resultNode, err);

        const compareToFileName = file + extension;
        const compareFileExists = existsSync(compareToFileName);
        const compareTo = compareFileExists ? readFileSync(compareToFileName).toString() : '';
        if (writeToFile || !compareFileExists) {
          writeFileSync(compareToFileName, result);
        }
        expect(result).toEqual(compareTo);
      },
      phases,
      false,
      file
    );
  }

  glob.sync(grep).map(testFile);
}
