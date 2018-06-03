declare var describe, it, require, console;

import { Grammars, Parser, IToken } from 'ebnf';
import {
  testParseToken,
  describeTree,
  printBNF,
  testParseTokenFailsafe,
  folderBasedTest,
  printAST
} from './TestHelpers';
import { parser } from '../dist/grammar';
import * as Nodes from '../dist/parser/nodes';

import { canonicalPhase } from '../dist/parser/phases/canonicalPhase';
import { semanticPhase } from '../dist/parser/phases/semanticPhase';
import { findAllErrors } from '../dist/parser/phases/findAllErrors';
import { scopePhase } from '../dist/parser/phases/scopePhase';
import { typePhase } from '../dist/parser/phases/typePhase';
import { compilationPhase } from '../dist/parser/phases/compilationPhase';

import { readFileSync, writeFileSync, existsSync } from 'fs';
import * as comp from '../dist/compiler/compiler';

let inspect = require('util').inspect;

const writeToFile = process.env.UPDATE_AST === 'true';
const phases = [canonicalPhase, semanticPhase, scopePhase, typePhase, compilationPhase, findAllErrors];

describe('Compiler', function() {
  describe('AST', () => {
    folderBasedTest('**/compiler/*.ro', phases, (result: any) => printAST(result), '.ast');
  });
  describe('Compilation', () => {
    folderBasedTest('**/compiler/*.ro', phases, (result: any) => {
      const module = comp.compile(result);
      return module.emitText();
    });
  });
  describe('Compiler-errors', () => {
    folderBasedTest(
      '**/type-error/*.ro',
      [canonicalPhase, semanticPhase, scopePhase],
      result => {
        const typeResult = findAllErrors(typePhase(result));

        if (typeResult.errors.length == 0) {
          throw new Error('Test did not fail');
        }

        return JSON.stringify(typeResult.errors.map($ => $.message));
      },
      '.json'
    );
  });
});
