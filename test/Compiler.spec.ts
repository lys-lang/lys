declare var describe;

import { folderBasedTest, PhasesResult } from './TestHelpers';

import { CodeGenerationPhaseResult } from '../dist/compiler/phases/codeGenerationPhase';
import { ParsingContext } from '../dist/compiler/ParsingContext';
import { printAST } from '../dist/utils/astPrinter';
import { failWithErrors } from '../dist/compiler/findAllErrors';
import { nodeSystem } from '../dist/support/NodeSystem';

const compilerTestParsingContext = new ParsingContext(nodeSystem);
compilerTestParsingContext.paths.push(nodeSystem.resolvePath(__dirname, '../stdlib'));

const compilationPhases = function(txt: string, fileName: string): PhasesResult {
  compilerTestParsingContext.reset();
  const moduleName = compilerTestParsingContext.getModuleFQNForFile(fileName);
  compilerTestParsingContext.getParsingPhaseForContent(fileName, moduleName, txt);
  const compiler = compilerTestParsingContext.getCompilationPhase(moduleName);
  failWithErrors('Compilation phase', compilerTestParsingContext);
  return { parsingContext: compilerTestParsingContext, document: compiler };
};

const phases = function(txt: string, fileName: string) {
  const compiler = compilationPhases(txt, fileName);
  return new CodeGenerationPhaseResult(compiler.document, compilerTestParsingContext);
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

  describe('Compilation-execution-tests-optimized-ast', () => {
    folderBasedTest(
      '**/execution/*.lys',
      phases,
      async (result, e) => {
        if (e) throw e;

        return printAST(result.document);
      },
      '.ast'
    );
  });
});
