import { IToken, Parser, Grammars } from 'ebnf';

declare var require, it, console;

export const printBNF = (parser: Parser) => console.log(parser.emitSource());

let inspect = require('util').inspect;

export function testParseToken(
  parser: Parser,
  txt: string,
  target?: string,
  customTest?: (document: IToken) => void,
  phases?: ((a: any) => any)[],
  debug?: boolean
) {
  testParseTokenFailsafe(
    parser,
    txt,
    target,
    (doc: IToken) => {
      if (doc.errors.length) throw doc.errors[0];

      const astNode = doc['astNode'];

      if (astNode) {
        if (astNode.errors.length) {
          console.dir(astNode.errors);
          throw astNode.errors[0];
        }
        if (astNode.rest.length != 0) throw new Error('Got rest: ' + astNode.rest);
      }

      customTest && customTest(doc);
    },
    phases,
    debug
  );
}

export function testParseTokenFailsafe(
  parser: Parser,
  txt: string,
  target?: string,
  customTest?: (document: IToken) => void,
  phases?: ((a: any) => any)[],
  debug?: boolean
) {
  it(inspect(txt, false, 1, true) + ' must resolve into ' + (target || '(FIRST RULE)'), () => {
    debug && console.log('      ---------------------------------------------------');

    let result;

    try {
      result = parser.getAST(txt, target);

      if (!result) throw new Error('Did not resolve');

      if (target && result.type != target) throw new Error("Type doesn't match. Got: " + result.type);

      if (result.text.length == 0) throw new Error('Empty text result');

      if (phases && phases.length) {
        debug && console.log(`      Phase ${0}:`);
        result = phases.reduce(($, reducer, i) => {
          debug && describeTree($);
          debug && console.log(`      Phase ${i + 1}:`);
          return reducer($);
        }, result);
        if (!result) throw new Error('Did not resolve');
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
      result && describeTree(result);
      throw e;
    }

    debug && describeTree(result);
  });
}

function printAST(token: IToken, level = 0) {
  console.log('         ' + '  '.repeat(level) + `|-${token.type}${token.text ? '=' + token.text : ''}`);
  token.children &&
    token.children.forEach(c => {
      printAST(c, level + 1);
    });
}

export function describeTree(token: IToken) {
  printAST(token);
}
