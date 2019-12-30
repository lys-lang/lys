import * as arg from 'arg';
import { ParsingContext } from './compiler/ParsingContext';
import { dirname, basename, relative } from 'path';
import { generateTestInstance } from './utils/testEnvironment';
import { getTestResults, TestDescription } from './utils/libs/test';
import { nodeSystem } from './support/NodeSystem';
import { writeFileSync, watch } from 'fs';
import { ForegroundColors, formatColorAndReset } from './utils/colors';
import { LysError } from './utils/errorPrinter';
import { compile } from './index';
import { loadFromMD } from './utils/loadFromMD';
import { printNode } from './utils/nodePrinter';

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

function getParsingContext(cwd: string, argv: string[]) {
  nodeSystem.cwd = cwd;
  const parsingContext = new ParsingContext(nodeSystem);
  parsingContext.paths.push(nodeSystem.resolvePath(__dirname, '../stdlib'));

  let libs: Array<(getInstance: Function) => any> = [];
  let libPaths: Array<string> = [];

  const args = arg(
    {
      '--output': String,
      '-o': '--output',
      '--no-optimize': Boolean,
      '--wast': Boolean,
      '--lib': [String],
      '--test': Boolean,
      '--debug': Boolean,
      '--desugar': Boolean,
      '--watch': Boolean,
      '--run': '--test'
    },
    {
      permissive: true,
      argv
    }
  );

  args['--lib'] = args['--lib'] || [];

  const DEBUG = !!args['--debug'];
  const DESUGAR = !!args['--desugar'];
  const WAST = !!args['--wast'];
  const WATCH = !!args['--watch'];
  const OPTIMIZE = !args['--no-optimize'];

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

  if (!args['--output']) {
    args['--output'] = 'build/' + basename(file, '.lys');
  }

  const outFileFullWithoutExtension = nodeSystem.resolvePath(nodeSystem.getCurrentDirectory(), args['--output']);
  const outPath = dirname(outFileFullWithoutExtension);
  mkdirRecursive(outPath);

  return Object.assign(parsingContext, {
    mainModule,
    options: {
      DEBUG,
      DESUGAR,
      WAST,
      OPTIMIZE,
      WATCH,
      TEST: args['--test']
    },
    outFileFullWithoutExtension,
    outPath,
    libPaths,
    libs,
    customAssertions
  });
}

async function emit(parsingContext: ReturnType<typeof getParsingContext>): Promise<boolean> {
  const codeGen = compile(parsingContext, parsingContext.mainModule, parsingContext.options.DEBUG);

  await codeGen.validate(parsingContext.options.OPTIMIZE, parsingContext.options.DEBUG || parsingContext.options.WAST);

  if (parsingContext.options.WAST) {
    nodeSystem.writeFile(parsingContext.outFileFullWithoutExtension + '.wast', codeGen.emitText());
  }

  if (codeGen.sourceMap) {
    nodeSystem.writeFile(nodeSystem.resolvePath(parsingContext.outPath, 'sourceMap.map'), codeGen.sourceMap);
  }

  if (!codeGen.buffer) {
    throw new LysError('Could not generate WASM binary');
  }

  writeFileSync(parsingContext.outFileFullWithoutExtension + '.wasm', codeGen.buffer);

  let src = [];

  src.push('Object.defineProperty(exports, "__esModule", { value: true });');
  src.push('const modules = [];');

  for (let i in parsingContext.libPaths) {
    const path = parsingContext.libPaths[i];
    src.push(
      `modules.push(require(${JSON.stringify(
        relative(dirname(parsingContext.outFileFullWithoutExtension), path)
      )}).default);`
    );
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

  nodeSystem.writeFile(parsingContext.outFileFullWithoutExtension + '.js', src.join('\n'));

  if (parsingContext.options.DESUGAR) {
    parsingContext.modulesInContext.forEach(module => {
      if (module.fileName.startsWith(nodeSystem.cwd)) {
        const relativePath = nodeSystem.relative(nodeSystem.cwd, module.fileName);
        const targetFile = nodeSystem.resolvePath(parsingContext.outPath + '/desugar/', relativePath);
        mkdirRecursive(dirname(targetFile));
        nodeSystem.writeFile(targetFile, printNode(module));
      }
    });
  }

  if (parsingContext.options.TEST) {
    const testInstance = await generateTestInstance(codeGen.buffer, parsingContext.libs);

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

    for (let path in parsingContext.customAssertions) {
      const startTime = Date.now();
      try {
        parsingContext.customAssertions[path](() => testInstance);

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

    let totalTime = 0;
    let totalTests = 0;
    let totalPass = 0;

    const summarizeItem = (result: TestDescription) => {
      totalTime += result.endTime - result.startTime;
      totalTests++;
      if (result.passed) {
        totalPass++;
      }
      result.tests && result.tests.forEach(summarizeItem);
    };

    const summarize = (results: TestDescription[]) => {
      results.forEach(summarizeItem);
    };

    if (testResults && testResults.length) {
      summarize(testResults);

      nodeSystem.writeFile('_lys_test_results.json', JSON.stringify(testResults, null, 2));
      if (totalPass !== totalTests) {
        console.error(
          formatColorAndReset(
            `\n\n  Some tests failed. Passed: ${totalPass} Failed: ${totalTests - totalPass} (${(
              totalTime / 1000
            ).toFixed(2)}s)\n\n`,
            ForegroundColors.Red
          )
        );
        return false;
      } else {
        console.error(
          formatColorAndReset(
            `\n\n  All tests passed. Passed: ${totalPass} Failed: ${totalTests - totalPass} (${(
              totalTime / 1000
            ).toFixed(2)}s)\n\n`,
            ForegroundColors.Green
          )
        );
        return true;
      }
    }
  }
  return parsingContext.messageCollector.errors.length === 0;
}

export async function main(cwd: string, argv: string[]) {
  const parsingContext = getParsingContext(cwd, argv);

  if (parsingContext.options.WATCH) {
    let invalidated = true;
    let running = false;

    watch(cwd, { recursive: true }, (event, fileName) => {
      const fqn = parsingContext.getModuleFQNForFile(fileName);
      const inContext = parsingContext.modulesInContext.has(fqn);

      if (inContext) {
        console.log(event, fileName);
        parsingContext.invalidateModule(fqn);
        invalidated = true;
      }
    });

    setInterval(async () => {
      if (invalidated && !running) {
        invalidated = false;

        const start = Date.now();
        console.log('Starting incremental compilation...');
        running = true;
        emit(parsingContext)
          .then(() => {
            running = false;
            console.log(formatColorAndReset('[OK] ' + (Date.now() - start).toFixed(1) + 'ms', ForegroundColors.Green));
          })
          .catch(() => {
            running = false;
            console.log(formatColorAndReset('[ERROR] ' + (Date.now() - start).toFixed(1) + 'ms', ForegroundColors.Red));
          });
      }
    }, 2000);

    await new Promise(() => void 0); // wait forever
  } else {
    if ((await emit(parsingContext)) === false) {
      process.exit(1);
    }
  }
}
