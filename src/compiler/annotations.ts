import { Local, Nodes, Global } from './nodes';

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
  export class IsOverloaded extends Annotation {}
  export class Inline extends Annotation {}
  export class Explicit extends Annotation {}
  export class ByPassFunction extends Annotation {}

  export class Extern extends Annotation {
    constructor(public module: string, public fn: string) {
      super();
    }
  }

  export class Export extends Annotation {
    constructor(public exportedName: string) {
      super();
    }
  }

  export class LabelId extends Annotation {
    constructor(public label: string) {
      super();
    }
  }
  export class LocalIdentifier extends Annotation {
    constructor(public local: Local | Global) {
      super();
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

  export class CurrentLoop extends Annotation {
    constructor(public loop: Nodes.LoopNode) {
      super();
      //stub
    }
  }

  export class ImplicitCall extends Annotation {
    constructor(public implicitCall: Nodes.InjectedFunctionCallNode) {
      super();
    }

    toString() {
      return super.toString() + this.implicitCall.resolvedFunctionType.inspect(1);
    }
  }

  export class IsUnreachable extends Annotation {}
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
