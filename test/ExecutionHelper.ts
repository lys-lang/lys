import { print } from '@webassemblyjs/wast-printer';

import { CompilationPhaseResult } from '../dist/compiler/phases/compilationPhase';
import { CanonicalPhaseResult } from '../dist/compiler/phases/canonicalPhase';
import { SemanticPhaseResult } from '../dist/compiler/phases/semanticPhase';
import { ScopePhaseResult } from '../dist/compiler/phases/scopePhase';
import { TypePhaseResult } from '../dist/compiler/phases/typePhase';
import { CodeGenerationPhaseResult } from '../dist/compiler/phases/codeGenerationPhase';
import { ParsingContext } from '../dist/compiler/ParsingContext';
import { printNode } from '../dist/utils/nodePrinter';
import { printErrors } from '../dist/utils/errorPrinter';
import { printAST } from '../dist/utils/astPrinter';
import { hexDump, readString } from '../dist/utils/execution';
import { generateTestInstance } from '../dist/utils/testEnvironment';
import glob = require('glob');
import path = require('path');
import { readFileSync } from 'fs';
import { failWithErrors } from '../dist/compiler/findAllErrors';

import envLib from '../dist/utils/libs/env';
import testLib, { getTestResults } from '../dist/utils/libs/test';
import { NodeSystem } from '../dist/support/NodeSystem';

declare var it;

const newSystem = new NodeSystem();
newSystem.cwd = path.resolve(__dirname, 'fixtures', 'execution');

const parsingContext = new ParsingContext(newSystem);
parsingContext.paths.push(newSystem.resolvePath(__dirname, '../stdlib'));

const phases = function(txt: string, fileName: string): CodeGenerationPhaseResult {
  parsingContext.reset();

  const parsing = parsingContext.getParsingPhaseForContent(fileName, parsingContext.getModuleFQNForFile(fileName), txt);

  const canonical = new CanonicalPhaseResult(parsing);
  const semantic = new SemanticPhaseResult(canonical);
  const scope = new ScopePhaseResult(semantic);
  const types = new TypePhaseResult(scope);
  types.execute();
  types.ensureIsValid();
  const compilation = new CompilationPhaseResult(types);
  return new CodeGenerationPhaseResult(compilation);
};

async function testSrc(
  content: string,
  customTest?: (document: any, error?: Error) => Promise<any>,
  fileName?: string
) {
  let compilationPhaseResult: CodeGenerationPhaseResult;

  try {
    compilationPhaseResult = phases(content, fileName);

    if (compilationPhaseResult.parsingContext.messageCollector.errors.length) {
      console.log(printErrors(compilationPhaseResult.parsingContext));
    }

    if (!compilationPhaseResult.isSuccess()) {
      console.log(printNode(compilationPhaseResult.document));
      console.log(printAST(compilationPhaseResult.document));
      console.log(print(compilationPhaseResult.compilationPhaseResult.typePhaseResult.typeGraph));
      failWithErrors('ExecutionHelpers.testSrc', compilationPhaseResult.parsingContext);
    }

    await compilationPhaseResult.validate(false, true);

    const instance = await generateTestInstance(compilationPhaseResult.buffer, [envLib, testLib]);

    if (!instance) throw new Error('Invalid compilation');

    if (customTest) {
      try {
        await customTest(instance);
      } catch (e) {
        const maxMemory = instance.exports.test_getMaxMemory();

        console.log(hexDump(instance.exports.memory.buffer, maxMemory));
        console.error(printNode(compilationPhaseResult.document));
        console.error('NON OPTIMIZED VERSION');
        console.log(print(compilationPhaseResult.programAST));
        await compilationPhaseResult.validate(true);
        console.log(compilationPhaseResult.emitText());

        if (e.message.includes('unreachable')) {
          const text = instance.exports.test_getLastErrorMessage();

          if (text != 0) {
            throw new Error(`Execution error: ${JSON.stringify(readString(instance.exports.memory.buffer, text))}`);
          }
        }

        throw e;
      }
    }

    {
      const testResults = getTestResults(instance);
      for (let testResult of testResults) {
        if (!testResult.passed) {
          throw new Error('Suite ' + JSON.stringify(testResult) + ' failed');
        }
      }
    }

    await compilationPhaseResult.validate(true);

    if (customTest) {
      try {
        const newInstance = await generateTestInstance(compilationPhaseResult.buffer, [envLib, testLib]);

        await customTest(newInstance);

        const testResults = getTestResults(newInstance);
        for (let testResult of testResults) {
          if (!testResult.passed) {
            throw new Error('Suite ' + JSON.stringify(testResult) + ' failed');
          }
        }
      } catch (e) {
        console.error('OPTIMIZED VERSION FAILED');
        throw e;
      }
    }
  } catch (e) {
    if (customTest && customTest.length >= 2) {
      await customTest(null, e);
    } else {
      throw e;
    }
  }
}

export function testFolder() {
  function testFile(fileName: string) {
    const content = readFileSync(fileName).toString();

    it(fileName.replace(parsingContext.system.getCurrentDirectory(), ''), async function() {
      this.timeout(10000);

      await testSrc(
        content,
        async (x, err) => {
          if (err) throw err;
          x.exports.main();
        },
        fileName
      );
    });
  }
  glob.sync(parsingContext.system.getCurrentDirectory() + '/**/*.lys').map(testFile);
}

let executionNumber = 0;

export function test(name: string, src: string, customTest?: (document: any, error?: Error) => Promise<any>) {
  it(name, async function() {
    this.timeout(10000);

    await testSrc(src, customTest, 'inline_execution_test' + (++executionNumber).toString());
  });
}
