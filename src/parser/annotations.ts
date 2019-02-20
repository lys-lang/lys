import { Local, Nodes, Global } from './nodes';
import { FunctionType } from './types';

export abstract class Annotation {
  get name(): string {
    return this.constructor.name;
  }
  toString() {
    return this.name;
  }
}
export type IAnnotationConstructor<T extends Annotation> = { new (...args): T };

export namespace annotations {
  export class IsTailRec extends Annotation {}
  export class Injected extends Annotation {}

  export class LabelId extends Annotation {
    constructor(public label: string) {
      super();
      //stub
    }
  }
  export class LocalIdentifier extends Annotation {
    constructor(public local: Local | Global) {
      super();
      //stub
    }

    toString() {
      if (this.local instanceof Local) {
        return `Local(${this.local.name}:${this.local.type || '<no-type>'}#${this.local.index})`;
      } else {
        return `Global(${this.local.name}:${this.local.type || '<no-type>'})`;
      }
    }
  }

  export class IsTailRecCall extends Annotation {}

  export class ImplicitCall extends Annotation {
    constructor(public functionType: FunctionType, public args: Nodes.ExpressionNode[]) {
      super();
    }
  }

  export class IsValueNode extends Annotation {}
  export class IsTypeNode extends Annotation {}

  export class IsReturnExpression extends Annotation {
    targetLocal: null | Local = null;

    toString() {
      if (this.targetLocal === null) return super.toString();
      return super.toString() + `[${this.targetLocal.index}]`;
    }
  }
}
