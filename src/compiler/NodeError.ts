import { Nodes } from './nodes';
import { Type, IntersectionType } from './types';

export interface IPositionCapable {
  readonly start: number;
  readonly end: number;
  readonly document: string;
}

export type IErrorPositionCapable = {
  readonly message: string;
  readonly node?: Nodes.Node;
  readonly warning?: boolean;
  readonly position: IPositionCapable;
} & Error;

export class PositionCapableError extends Error implements IErrorPositionCapable {
  constructor(public message: string, public readonly position: IPositionCapable, public warning: boolean = false) {
    super(message);
    if (!position) {
      console.trace();
      throw new Error('position is required');
    }
  }
}

export class AstNodeError extends PositionCapableError implements IErrorPositionCapable {
  constructor(public message: string, public node: Nodes.Node, public warning: boolean = false) {
    super(message, AstNodeError.ensureNodePosition(node), warning);
  }
  private static ensureNodePosition(node: Nodes.Node): IPositionCapable {
    if (!node) {
      throw new Error('node is required');
    }
    if (!node.astNode) {
      console.dir(node);
      throw new Error('node.astNode is required');
    }
    return node.astNode;
  }
}

export class TypeMismatch extends AstNodeError {
  constructor(public givenType: Type, public expectedType: Type, node: Nodes.Node) {
    super(`Type mismatch: Type "${givenType}" is not assignable to "${expectedType}"`, node);
  }
}

export class CannotInferReturnType extends AstNodeError {
  constructor(node: Nodes.Node) {
    super(`Cannot infer return type`, node);
  }
}

export class NotAValidType extends AstNodeError {
  constructor(node: Nodes.Node) {
    super(`This is not a type`, node);
  }
}

export class UnexpectedType extends AstNodeError {
  constructor(public type: Type, node: Nodes.Node) {
    super(`${type} ${type.inspect(100)} is not a value, constructor or function.`, node);
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

export class InvalidCall extends AstNodeError {
  constructor(public expectedTypes: Type[], public givenTypes: Type[], node: Nodes.Node) {
    super(
      `Invalid signature. Expecting arguments type (${expectedTypes.join(', ')}) but got (${givenTypes.join(', ')})`,
      node
    );
  }
}

export class UnreachableCode extends AstNodeError {
  constructor(node: Nodes.Node) {
    super(`Unreachable code`, node);
  }
}

export class NotAFunction extends AstNodeError {
  constructor(public givenType: Type, node: Nodes.Node) {
    super(`Type mismatch: Type "${givenType}" is not a function`, node);
  }
}
