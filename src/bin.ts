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
import { dirname, basename, resolve, relative } from 'path';
import { generateTestInstance } from './utils/testEnvironment';
import { getTestResults } from './utils/libs/test';
const colors = require('colors/safe');

export class LysError extends Error {}

const args = arg(
  {
    '--output': String,
    '-o': '--output',
    '--no-optimize': Boolean,
    '--wast': Boolean,
    '--lib': [String],
    '--test': Boolean,
    '--debug': Boolean,
    '--run': '--test'
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

let libs: Array<(getInstance: Function) => any> = [];
let libPaths: Array<string> = [];

args['--lib'] = args['--lib'] || [];

if (args['--test']) {
  args['--lib'].push(resolve(__dirname, 'utils/libs/env.js'));
  args['--lib'].push(resolve(__dirname, 'utils/libs/test.js'));
}

if (args['--lib'] && args['--lib'].length) {
  for (let libPath of args['--lib']) {
    const lib = resolve(libPath);

    if (!existsSync(lib)) {
      throw new LysError(`Cannot find lib: ${lib}`);
    }

    const r = require(lib);

    if (!r.default) {
      throw new LysError(`Library ${lib} has no "default" export`);
    }

    if (typeof r.default !== 'function') {
      throw new LysError(`"default" is not a function in ${lib}`);
    }

    libPaths.push(lib);
    libs.push(r.default);
  }
}

const parsingContext = new ParsingContext();

async function main() {
  parsingContext.cwd = process.cwd();

  const file = args._[0];

  if (!file) {
    throw new LysError('Error: You did not specify an input file. \n\n  Usage: $ lys mainFile.lys');
  }

  if (!existsSync(file)) {
    throw new LysError(`Error: File ${file} does not exist.`);
  }

  if (!args['--output']) {
    args['--output'] = 'build/' + basename(file, '.lys');
  }

  const outFileFullWithoutExtension = resolve(parsingContext.cwd, args['--output']);
  const outPath = dirname(outFileFullWithoutExtension);
  mkdirRecursive(outPath);

  const phaseCount = 10;

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

  await codeGen.validate(optimize, !optimize);

  if (args['--wast']) {
    writeFileSync(outFileFullWithoutExtension + '.wast', codeGen.emitText());
  }

  writeFileSync(outFileFullWithoutExtension + '.wasm', codeGen.buffer);

  let src = [];

  src.push('Object.defineProperty(exports, "__esModule", { value: true });');
  src.push('const modules = [];');

  for (let i in libPaths) {
    const path = libPaths[i];
    src.push(`modules.push(require(${JSON.stringify(relative(dirname(outFileFullWithoutExtension), path))}).default);`);
  }

  const values = [];
  codeGen.buffer.forEach($ => values.push($));

  src.push(`const buffer = new Uint8Array(${JSON.stringify(values)})`);

  src.push(`
exports.default = async function() {
  let instance = null;

  const getInstance = () => instance;

  let injectedModules = {};

  modules.forEach($ => {
    const generatedModule = $(getInstance);

    if (generatedModule) {
      injectedModules = { ...injectedModules, ...generatedModule };
    }
  });

  const compiled = await WebAssembly.compile(buffer);

  instance = new WebAssembly.Instance(compiled, injectedModules);

  return instance;
}
  `);

  writeFileSync(outFileFullWithoutExtension + '.js', src.join('\n'));

  if (args['--test']) {
    const testInstance = await generateTestInstance(codeGen.buffer, libs);

    if (typeof testInstance.exports.test !== 'function') {
      if (typeof testInstance.exports.main !== 'function') {
        throw new LysError('There is no exported function named "main" or "test"');
      } else {
        testInstance.exports.main();
      }
    } else {
      testInstance.exports.test();
    }

    const testResults = getTestResults(testInstance);

    if (testResults && testResults.length) {
      writeFileSync('_lys_test_results.json', JSON.stringify(testResults, null, 2));
      if (testResults.some($ => !$.passed)) {
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
    if (args['--debug']) {
      console.error($);
    } else {
      console.error($.toString());
    }
    process.exit(1);
  });

process.on('unhandledRejection', e => {
  throw e;
});
