import { Nodes } from './nodes';
import { Type, IntersectionType } from './types';

export interface IPositionCapable {
  readonly start: number;
  readonly end: number;
}

export interface IErrorPositionCapable extends IPositionCapable {
  readonly message: string;
}

export class AstNodeError extends Error implements IErrorPositionCapable {
  get start() {
    return this.node.astNode.start;
  }

  get end() {
    return this.node.astNode.end;
  }

  constructor(public message: string, public node: Nodes.Node, public warning: boolean = false) {
    super(message);
  }
}

export class TypeMismatch extends AstNodeError {
  constructor(public givenType: Type, public expectedType: Type, node: Nodes.Node) {
    super(`Type mismatch: Type "${givenType}" is not assignable to "${expectedType}"`, node);
  }
}

export class InvalidOverload extends AstNodeError {
  constructor(public functionType: IntersectionType, public givenTypes: Type[], node: Nodes.Node) {
    super(
      `Could not find a valid overload for function of type ${functionType} with the arguments of type (${givenTypes.join(
        ', '
      )})`,
      node
    );
  }
}

export class NotAFunction extends AstNodeError {
  constructor(public givenType: Type, node: Nodes.Node) {
    super(`Type mismatch: Type "${givenType}" is not a function`, node);
  }
}
