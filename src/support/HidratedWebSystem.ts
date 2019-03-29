import { WebSystem } from './WebSystem';
import * as std from './std.json';

export class HidratedWebSystem extends WebSystem {
  constructor() {
    super();
    for (let i in std) {
      this.writeFile(this.resolvePath(i), (std as any)[i]);
    }
  }
}
