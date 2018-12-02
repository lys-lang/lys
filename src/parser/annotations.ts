import { Local } from './nodes';

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

  export class IsTailRecCall extends Annotation {}
  export class ImplicitCall extends Annotation {}

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
