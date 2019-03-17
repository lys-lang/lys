declare var describe;

import { folderBasedTest } from './TestHelpers';

import { print } from '@webassemblyjs/wast-printer';

import { CanonicalPhaseResult } from '../dist/parser/phases/canonicalPhase';
import { SemanticPhaseResult } from '../dist/parser/phases/semanticPhase';
import { TypePhaseResult } from '../dist/parser/phases/typePhase';
import { CompilationPhaseResult } from '../dist/parser/phases/compilationPhase';
import { ScopePhaseResult } from '../dist/parser/phases/scopePhase';
import { CodeGenerationPhaseResult } from '../dist/parser/phases/codeGenerationPhase';
import { ParsingContext } from '../dist/parser/ParsingContext';
import { printAST } from '../dist/utils/astPrinter';
import { failWithErrors } from '../dist/parser/phases/findAllErrors';

const compilerTestParsingContext = new ParsingContext();

const compilationPhases = function(txt: string, fileName: string): CompilationPhaseResult {
  compilerTestParsingContext.reset();
  const parsing = compilerTestParsingContext.getParsingPhaseForContent(fileName, txt);
  const canonical = new CanonicalPhaseResult(parsing);
  const semantic = new SemanticPhaseResult(canonical, fileName);
  const scope = new ScopePhaseResult(semantic);
  const types = new TypePhaseResult(scope);
  types.execute(true);
  types.ensureIsValid();
  const compiler = new CompilationPhaseResult(types);
  if (!compiler.isSuccess()) {
    failWithErrors('Compilation phase', compiler.parsingContext);
  }
  return compiler;
};

const phases = function(txt: string, fileName: string): CodeGenerationPhaseResult {
  const compiler = compilationPhases(txt, fileName);
  return new CodeGenerationPhaseResult(compiler);
};

describe('Compiler', function() {
  describe('Core lib', () => {
    folderBasedTest(
      'stdlib/**/*.lys',
      compilationPhases,
      async (_result, e) => {
        if (e) throw e;
        return null;
      },
      null
    );
  });

  describe('AST', () => {
    folderBasedTest('**/compiler/*.lys', phases, async result => printAST(result.document), '.ast');
  });

  describe('Compilation', () => {
    folderBasedTest('**/compiler/*.lys', phases, async (result, e) => {
      if (e) throw e;
      return result.emitText();
    });
  });
  describe('Compilation-optimized', () => {
    folderBasedTest(
      '**/compiler/*.lys',
      phases,
      async (result, e) => {
        if (e) throw e;
        await result.validate(true);
        return result.emitText();
      },
      '.optimized.wast'
    );
  });

  describe('Compilation-execution-tests', () => {
    folderBasedTest('**/execution/*.lys', phases, async (result, e) => {
      if (e) throw e;
      return result.emitText();
    });
  });

  describe('Compilation-execution-tests-optimized', () => {
    folderBasedTest(
      '**/execution/*.lys',
      phases,
      async (result, e) => {
        if (e) throw e;
        await result.validate(true);
        return result.emitText();
      },
      '.optimized.wast'
    );
  });
});
