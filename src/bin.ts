#!/usr/bin/env node

import * as arg from 'arg';
import { ParsingContext } from './compiler/ParsingContext';
import { existsSync, writeFileSync, mkdirSync, statSync } from 'fs';
import { failWithErrors } from './compiler/findAllErrors';
import { CanonicalPhaseResult } from './compiler/phases/canonicalPhase';
import { SemanticPhaseResult } from './compiler/phases/semanticPhase';
import { ScopePhaseResult } from './compiler/phases/scopePhase';
import { TypePhaseResult } from './compiler/phases/typePhase';
import { CompilationPhaseResult } from './compiler/phases/compilationPhase';
import { CodeGenerationPhaseResult } from './compiler/phases/codeGenerationPhase';
import { dirname, basename, resolve } from 'path';
import { generateTestInstance } from './utils/testEnvironment';
const colors = require('colors/safe');

export class LysError extends Error {}

const args = arg(
  {
    '--output': String,
    '-o': '--output',
    '--no-optimize': Boolean,
    '--wast': Boolean,
    '--test': Boolean
  },
  {
    permissive: true
  }
);

function mkdirRecursive(dir: string) {
  // we explicitly don't use `path.sep` to have it platform independent;
  var sep = '/';

  var segments = dir.split(sep);
  var current = '';
  var i = 0;

  while (i < segments.length) {
    current = current + sep + segments[i];
    try {
      statSync(current);
    } catch (e) {
      mkdirSync(current);
    }

    i++;
  }
}

const parsingContext = new ParsingContext();

async function main() {
  parsingContext.paths.unshift(process.cwd());

  const file = args._[0];

  if (!file) {
    throw new LysError('Error: You did not specify an input file. \n\n  Usage: $ lys mainFile.lys');
  }

  if (!existsSync(file)) {
    throw new LysError(`Error: File ${file} does not exist.`);
  }

  if (!args['--output']) {
    args['--output'] = basename(file, '.lys');
  }

  const outFileFullWithoutExtension = resolve(parsingContext.cwd, args['--output']);
  const outPath = dirname(outFileFullWithoutExtension);
  mkdirRecursive(outPath);

  const phaseCount = 10;

  console.log('File ' + file);

  const parsing = parsingContext.getParsingPhaseForFile(file);
  failWithErrors(`Parsing phase (1/${phaseCount})`, parsingContext);

  if (!parsing.document) {
    throw new LysError(`The document ${file} is empty`);
  }

  const canonical = new CanonicalPhaseResult(parsing);
  failWithErrors(`Canonical phase (2/${phaseCount})`, parsingContext);

  const semantic = new SemanticPhaseResult(canonical, 'test');
  failWithErrors(`Semantic phase (3/${phaseCount})`, parsingContext);

  const scope = new ScopePhaseResult(semantic);
  failWithErrors(`Scope phase (4/${phaseCount})`, parsingContext);

  const types = new TypePhaseResult(scope);
  types.execute();
  failWithErrors(`Type phase (5/${phaseCount})`, parsingContext);

  const compilation = new CompilationPhaseResult(types);
  failWithErrors(`Compilation phase (6/${phaseCount})`, parsingContext);

  const codeGen = new CodeGenerationPhaseResult(compilation);
  failWithErrors(`Code generation phase (7/${phaseCount})`, parsingContext);

  const optimize = !args['--no-optimize'];

  await codeGen.validate(optimize, true);

  if (args['--wast']) {
    writeFileSync(outFileFullWithoutExtension + '.wast', codeGen.emitText());
  }

  writeFileSync(outFileFullWithoutExtension + '.wasm', codeGen.buffer);

  if (args['--test']) {
    const testInstance = await generateTestInstance(codeGen.buffer);

    if (typeof testInstance.exports.test !== 'function') {
      throw new LysError('There is no exported function named "test"');
    } else {
      testInstance.exports.test();

      writeFileSync('_lys_test_results.json', JSON.stringify(testInstance.testResults, null, 2));

      if (testInstance.testResults.some($ => !$.passed)) {
        console.error(colors.red('\n\n  Some tests failed.\n\n'));
        process.exit(1);
      } else {
        console.error(colors.green('\n\n  All tests passed.\n\n'));
      }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch($ => {
    if ($ instanceof LysError) {
      console.error($.toString());
    } else {
      console.error($);
    }
    process.exit(1);
  });

process.on('unhandledRejection', e => {
  throw e;
});
