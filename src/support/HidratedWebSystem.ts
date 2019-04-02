import { WebSystem } from './WebSystem';
import * as std from './std.json';

if ('\u0000' in std) {
  throw new Error('Hidrated system not correctly built');
}

export class HidratedWebSystem extends WebSystem {
  constructor() {
    super();
    for (let i in std) {
      this.writeFile(this.resolvePath(i), (std as any)[i]);
    }
  }
}
