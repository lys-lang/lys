import glob = require('glob');
import { nodeSystem } from '../support/NodeSystem';

/**
 * This file packs the standard library in a JSON file to be used with
 * portable versions of the compiler where file systems does not exist. i.e:
 * the playground.
 */

const base = nodeSystem.resolvePath(__dirname, '../../stdlib');

const ret: Record<string, string> = {};

glob.sync('**/*.lys', { cwd: base, absolute: false }).forEach($ => {
  const path = nodeSystem.resolvePath(base, $);
  console.log('/' + $);
  const content = nodeSystem.readFile(path);
  if (content) {
    ret['/' + $] = content;
  }
});

nodeSystem.writeFile(nodeSystem.resolvePath(__dirname, '../support/std.json'), JSON.stringify(ret, null, 2));
