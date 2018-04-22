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
import { typePhase } from '../dist/parser/phases/typePhase';

import { readFileSync, writeFileSync, existsSync } from 'fs';
import * as comp from '../dist/compiler/compiler';
import { scopePhase } from '../dist/parser/phases/scopePhase';

let inspect = require('util').inspect;

const writeToFile = process.env.UPDATE_AST === 'true';

describe('Compiler', function() {
  const phases = [canonicalPhase, semanticPhase, scopePhase, typePhase, findAllErrors];
  describe('AST', () => {
    folderBasedTest('**/compiler/*.ro', phases, (result: any) => printAST(result), '.ast');
  });
  describe('Compilation', () => {
    folderBasedTest('**/compiler/*.ro', phases, (result: any) => {
      const module = comp.compile(result);
      return module.emitText();
    });
  });
});
