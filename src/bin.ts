#!/usr/bin/env node

import * as arg from 'arg';
import { ParsingContext } from './compiler/ParsingContext';
import { dirname, basename, relative } from 'path';
import { generateTestInstance } from './utils/testEnvironment';
import { getTestResults } from './utils/libs/test';
import { nodeSystem } from './support/NodeSystem';
import { writeFileSync } from 'fs';
import { ForegroundColors, formatColorAndReset } from './utils/colors';
import { LysError } from './utils/errorPrinter';
import { compile } from './index';
import { loadFromMD } from './utils/loadFromMD';

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
  let sep = '/';

  let segments = dir.split(sep);
  let current = '';
  let i = 0;

  while (i < segments.length) {
    current = current + sep + segments[i];
    nodeSystem.createDirectory(current);
    i++;
  }
}

let libs: Array<(getInstance: Function) => any> = [];
let libPaths: Array<string> = [];

args['--lib'] = args['--lib'] || [];

if (args['--test']) {
  args['--lib'].push(nodeSystem.resolvePath(__dirname, 'utils/libs/env.js'));
  args['--lib'].push(nodeSystem.resolvePath(__dirname, 'utils/libs/test.js'));
}

if (args['--lib'] && args['--lib'].length) {
  for (let libPath of args['--lib']) {
    const lib = nodeSystem.resolvePath(libPath);

    if (!nodeSystem.fileExists(lib)) {
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

const parsingContext = new ParsingContext(nodeSystem);
parsingContext.paths.push(nodeSystem.resolvePath(__dirname, '../stdlib'));

async function main() {
  const file = args._[0];

  let customAssertions: Record<string, (getInstance: Function) => void> = {};

  if (!file) {
    throw new LysError('Error: You did not specify an input file. \n\n  Usage: $ lys mainFile.lys');
  }

  if (!nodeSystem.fileExists(file)) {
    throw new LysError(`Error: File ${file} does not exist.`);
  }

  let mainModule = parsingContext.getModuleFQNForFile(file);

  if (file.endsWith('.md')) {
    const MD = loadFromMD(parsingContext, parsingContext.system.readFile(file) as string);
    mainModule = MD.mainModule;

    for (let path in MD.jsFiles) {
      if (path === 'assertions.js') {
        customAssertions[path] = MD.jsFiles[path];
      } else {
        libs.push(MD.jsFiles[path]);
      }
    }

    args['--test'] = true;
  }

  if (!args['--output']) {
    args['--output'] = 'build/' + basename(file, '.lys');
  }

  const outFileFullWithoutExtension = nodeSystem.resolvePath(nodeSystem.getCurrentDirectory(), args['--output']);
  const outPath = dirname(outFileFullWithoutExtension);
  mkdirRecursive(outPath);

  const codeGen = compile(parsingContext, mainModule);

  const optimize = !args['--no-optimize'];

  await codeGen.validate(optimize, !optimize);

  if (args['--wast']) {
    nodeSystem.writeFile(outFileFullWithoutExtension + '.wast', codeGen.emitText());
  }

  if (!codeGen.buffer) {
    throw new LysError('Could not generate WASM binary');
  }

  writeFileSync(outFileFullWithoutExtension + '.wasm', codeGen.buffer);

  let src = [];

  src.push('Object.defineProperty(exports, "__esModule", { value: true });');
  src.push('const modules = [];');

  for (let i in libPaths) {
    const path = libPaths[i];
    src.push(`modules.push(require(${JSON.stringify(relative(dirname(outFileFullWithoutExtension), path))}).default);`);
  }

  const values: number[] = [];
  codeGen.buffer.forEach(($: number) => values.push($));

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

  nodeSystem.writeFile(outFileFullWithoutExtension + '.js', src.join('\n'));

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

    for (let path in customAssertions) {
      const startTime = Date.now();
      try {
        customAssertions[path](() => testInstance);

        testResults.push({
          title: path,
          endTime: Date.now(),
          startTime,
          passed: true,
          skipped: false
        });
      } catch (e) {
        console.error(e);
        testResults.push({
          title: path,
          endTime: Date.now(),
          startTime,
          passed: false,
          skipped: false
        });
      }
    }

    if (testResults && testResults.length) {
      nodeSystem.writeFile('_lys_test_results.json', JSON.stringify(testResults, null, 2));
      if (testResults.some($ => !$.passed)) {
        console.error(formatColorAndReset('\n\n  Some tests failed.\n\n', ForegroundColors.Red));
        process.exit(1);
      } else {
        console.error(formatColorAndReset('\n\n  All tests passed.\n\n', ForegroundColors.Green));
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
