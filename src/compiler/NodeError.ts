import { Nodes } from './nodes';
import { Type, IntersectionType, TraitType } from './types';

export interface IPositionCapable {
  readonly start: number;
  readonly end: number;
  readonly moduleName: string;
}

export type IErrorPositionCapable = {
  readonly message: string;
  readonly node?: Nodes.Node;
  readonly warning?: boolean;
  readonly position: IPositionCapable;
} & Error;

export function isSamePosition(lhs: IPositionCapable, rhs: IPositionCapable) {
  return lhs === rhs || (lhs.moduleName === rhs.moduleName && lhs.end === rhs.end && lhs.start === rhs.start);
}

export function isSamePositionOrInside(parent: IPositionCapable, child: IPositionCapable) {
  return (
    isSamePosition(parent, child) ||
    (parent.moduleName === child.moduleName && parent.end >= child.end && parent.start <= child.start)
  );
}

export class PositionCapableError extends Error implements IErrorPositionCapable {
  constructor(public message: string, public readonly position: IPositionCapable, public warning: boolean = false) {
    super(message);
    if (!position) {
      console.trace();
      throw new Error('position is required');
    }
  }
}

export abstract class AstNodeError extends PositionCapableError implements IErrorPositionCapable {
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

export class LysScopeError extends AstNodeError {}
export class LysTypeError extends AstNodeError {}
export class LysSemanticError extends AstNodeError {}
export class LysCompilerError extends AstNodeError {}

export class TypeMismatch extends LysTypeError {
  constructor(public givenType: Type, public expectedType: Type, node: Nodes.Node) {
    super(
      expectedType instanceof TraitType
        ? `Type mismatch: Type "${givenType}" does not implement "${expectedType}"`
        : `Type mismatch: Type "${givenType}" is not assignable to "${expectedType}"`,
      node
    );
  }
}

export class CannotInferReturnType extends LysTypeError {
  constructor(node: Nodes.Node) {
    super(`Cannot infer return type`, node);
  }
}

export class NotAValidType extends LysTypeError {
  constructor(node: Nodes.Node, type: Type | null) {
    super(type ? `${type.inspect(100)} is not a type` : `This is not a type`, node);
  }
}

export class UnexpectedType extends LysTypeError {
  constructor(public type: Type, node: Nodes.Node) {
    super(`${type} ${type.inspect(100)} is not a value, constructor or function.`, node);
  }
}

export class InvalidOverload extends LysTypeError {
  constructor(public functionType: IntersectionType, public givenTypes: Type[], node: Nodes.Node) {
    super(
      `Could not find a valid overload for function of type ${functionType} with the arguments of type (${givenTypes.join(
        ', '
      )})`,
      node
    );
  }
}

export class InvalidCall extends LysTypeError {
  constructor(public expectedTypes: Type[], public givenTypes: Type[], node: Nodes.Node) {
    super(
      `Invalid signature. Expecting arguments type (${expectedTypes.join(', ')}) but got (${givenTypes.join(', ')})`,
      node
    );
  }
}

export class UnreachableCode extends LysSemanticError {
  constructor(node: Nodes.Node) {
    super(`Unreachable code`, node);
  }
}

export class NotAFunction extends LysTypeError {
  constructor(public givenType: Type, node: Nodes.Node) {
    super(`Type mismatch: Type "${givenType.inspect(100)}" is not a function`, node);
  }
}
