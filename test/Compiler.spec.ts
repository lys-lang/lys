declare var describe, it, require, console;

import {
  testParseToken,
  describeTree,
  printBNF,
  testParseTokenFailsafe,
  folderBasedTest,
  printAST
} from './TestHelpers';

import { canonicalPhase } from '../dist/parser/phases/canonicalPhase';
import { semanticPhase } from '../dist/parser/phases/semanticPhase';
import { findAllErrors } from '../dist/parser/phases/findAllErrors';
import { scopePhase } from '../dist/parser/phases/scopePhase';
import { typePhase } from '../dist/parser/phases/typePhase';
import { compilationPhase } from '../dist/parser/phases/compilationPhase';
import { print } from '@webassemblyjs/wast-printer';

import * as comp from '../dist/compiler/compiler';

let inspect = require('util').inspect;

const writeToFile = process.env.UPDATE_AST === 'true';
const phases = [canonicalPhase, semanticPhase, scopePhase, typePhase, compilationPhase, findAllErrors];

describe('Compiler', function() {
  describe('AST', () => {
    folderBasedTest('**/compiler/*.ro', phases, async (result: any) => printAST(result), '.ast');
  });
  describe('Compilation', () => {
    folderBasedTest('**/compiler/*.ro', phases, async (result: any) => {
      const x = await comp.compileModule(result);

      return print(x.program);
    });
  });
  describe('Compilation-optimized', () => {
    folderBasedTest(
      '**/compiler/*.ro',
      phases,
      async (result: any) => {
        const x = await comp.validateModule(await comp.compileModule(result));
        x.module.optimize();
        return x.module.emitText();
      },
      '.optimized.wast'
    );
  });
  describe('Compiler-errors', () => {
    folderBasedTest(
      '**/type-error/*.ro',
      [canonicalPhase, semanticPhase, scopePhase],
      async (result, e) => {
        if (e) throw e;

        try {
          const typeResult = typePhase(result);
        } catch (e) {
          return (result.textContent || '(no source)') + '\n---\n' + e.message;
        }

        throw new Error('Type phase did not fail');
      },
      '.txt'
    );
  });
});
