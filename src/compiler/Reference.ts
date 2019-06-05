import { Nodes } from './nodes';
import { Scope, ReferenceType } from './Scope';

export class Reference {
  usages = 0;

  constructor(
    public readonly referencedNode: Nodes.NameIdentifierNode,
    public readonly scope: Scope,
    public readonly type: ReferenceType,
    public readonly moduleName: string | null = null
  ) {}

  /** Returns true if the reference points to a declaration in the same module */
  get isLocalReference(): boolean {
    return !this.moduleName;
  }

  /** Returns a copy of the reference with the moduleSource set */
  withModule(moduleName: string) {
    return new Reference(this.referencedNode, this.scope, this.type, moduleName);
  }

  toString() {
    if (this.isLocalReference) {
      return this.referencedNode.name;
    } else {
      return this.moduleName + '::' + this.referencedNode.name;
    }
  }
}
