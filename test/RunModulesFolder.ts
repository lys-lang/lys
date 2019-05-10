import glob = require('glob');
import { resolve, dirname } from 'path';
import { main } from '../dist/index-bin';

let didSomethingFail = false;

async function test(globPath: string) {
  const tests = glob.sync(globPath);

  for (let file of tests) {
    try {
      const argv = [file, '--test', '--debug'];

      console.log(`> lys ` + argv.join(' '));

      await main(dirname(file), argv);
    } catch (e) {
      didSomethingFail = true;
      console.error(e);
    }
  }

  if (didSomethingFail) throw new Error('Some tests failed');
}

test(resolve(__dirname, '..') + '/**/*.spec.md')
  .then(_ => process.exit(0))
  .catch(e => {
    console.error(e);
    process.exit(1);
  });

process.on('unhandledRejection', e => {
  throw e;
});
