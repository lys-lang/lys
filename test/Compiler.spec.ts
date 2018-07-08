declare var describe, it, require, console;

import { testParseToken, testParseTokenFailsafe, folderBasedTest, printAST } from './TestHelpers';

import { print } from '@webassemblyjs/wast-printer';

import { ParsingPhaseResult } from '../dist/parser/phases/parsingPhase';
import { CanonicalPhaseResult } from '../dist/parser/phases/canonicalPhase';
import { SemanticPhaseResult } from '../dist/parser/phases/semanticPhase';
import { TypePhaseResult } from '../dist/parser/phases/typePhase';
import { CompilationPhaseResult } from '../dist/parser/phases/compilationPhase';
import { ScopePhaseResult } from '../dist/parser/phases/scopePhase';
import { CodeGenerationPhaseResult } from '../dist/parser/phases/codeGenerationPhase';

let inspect = require('util').inspect;

const writeToFile = process.env.UPDATE_AST === 'true';

const phases = function(txt: string): CodeGenerationPhaseResult {
  const parsing = new ParsingPhaseResult('test.ro', txt);
  const canonical = new CanonicalPhaseResult(parsing);
  const semantic = new SemanticPhaseResult(canonical);
  const scope = new ScopePhaseResult(semantic);
  const types = new TypePhaseResult(scope);
  const compiler = new CompilationPhaseResult(types);
  return new CodeGenerationPhaseResult(compiler);
};

describe('Compiler', function() {
  describe('AST', () => {
    folderBasedTest('**/compiler/*.ro', phases, async result => printAST(result.document), '.ast');
  });
  describe('Compilation', () => {
    folderBasedTest('**/compiler/*.ro', phases, async (result, e) => {
      if (e) throw e;
      await result.validate(false);
      return print(result.programAST);
    });
  });
  describe('Compilation-optimized', () => {
    folderBasedTest(
      '**/compiler/*.ro',
      phases,
      async (result, e) => {
        if (e) throw e;
        await result.validate(true);
        return result.module.emitText();
      },
      '.optimized.wast'
    );
  });
});
