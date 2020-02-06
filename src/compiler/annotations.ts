import { Local, Nodes, Global } from './nodes';
import { FunctionSignatureType } from './types';

export abstract class Annotation {
  get name(): string {
    return this.constructor.name;
  }
  toString() {
    return this.name;
  }
}
export type IAnnotationConstructor<T extends Annotation> = { new (...args: any[]): T };

export namespace annotations {
  export class IsTailRec extends Annotation {}
  export class Injected extends Annotation {}
  export class IsOverloaded extends Annotation {}
  export class Inline extends Annotation {}

  export class Getter extends Annotation {}
  export class Setter extends Annotation {}
  export class Method extends Annotation {}
  export class MethodCall extends Annotation {}

  export class SignatureDeclaration extends Annotation {}

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

  export class MutableDeclaration extends Annotation {}

  export class LabelId extends Annotation {
    constructor(public label: string) {
      super();
    }
  }
  export class FunctionInTable extends Annotation {
    constructor(public nameIdentifier: Nodes.NameIdentifierNode) {
      super();
    }

    toString() {
      return `FunctionInTable(${this.nameIdentifier.name})`;
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
      // stub
    }
  }

  export class ImplicitCall extends Annotation {
    constructor(public implicitCall: Nodes.InjectedFunctionCallNode) {
      super();
    }

    toString() {
      return (
        super.toString() +
        (this.implicitCall.resolvedFunctionType ? this.implicitCall.resolvedFunctionType.inspect(1) : 'not-resolved')
      );
    }
  }

  export class IsFunctionReference extends Annotation {
    constructor(public fun: FunctionSignatureType) {
      super();
    }
  }
  export class IsUnreachable extends Annotation {}
  export class IsValueNode extends Annotation {}
  export class IsAssignationLHS extends Annotation {}
  export class IsTypeNode extends Annotation {}
  export class NoStd extends Annotation {}

  export class IsReturnExpression extends Annotation {
    targetLocal: null | Local = null;

    toString() {
      if (this.targetLocal === null) return super.toString();
      return super.toString() + `[${this.targetLocal.index}]`;
    }
  }
}
