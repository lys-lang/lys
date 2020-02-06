import { Nodes } from './nodes';
import { Type, IntersectionType, TraitType } from './types';

export const DEBUG_TYPES = process.env.DEBUG_TYPES === '1' || process.env.DEBUG_TYPES === 'true';

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

export function printDebugType(type?: Type | null | undefined | void) {
  if (type) {
    return `"${type}"${DEBUG_TYPES ? ' ' + type.inspect(1) : ''}`;
  }
  return `<Type ${type}>`;
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
        ? `Type mismatch: Type ${printDebugType(givenType)} does not implement ${printDebugType(expectedType)}`
        : `Type mismatch: Type ${printDebugType(givenType)} is not assignable to ${printDebugType(expectedType)}`,
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
    super(type ? `${printDebugType(type)} is not a type` : `This is not a type`, node);
  }
}

export class UnexpectedType extends LysTypeError {
  constructor(public type: Type, node: Nodes.Node) {
    super(`${printDebugType(type)} is not a value, constructor or function.`, node);
  }
}

export class InvalidOverload extends LysTypeError {
  constructor(public functionType: IntersectionType, public givenTypes: Type[], node: Nodes.Node) {
    super(
      `Could not find a valid overload for function of type ${printDebugType(
        functionType
      )} with the arguments of type (${givenTypes.join(', ')})`,
      node
    );
  }
}

export class InvalidCall extends LysTypeError {
  constructor(public expectedTypes: Type[], public givenTypes: Type[], node: Nodes.Node) {
    super(
      `Invalid signature. Expecting arguments type:\n  (${expectedTypes.join(', ')})\nbut got:\n  (${givenTypes.join(
        ', '
      )})`,
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
  constructor(public type: Type, node: Nodes.Node) {
    super(`Type mismatch: Type ${printDebugType(type)} is not a function`, node);
  }
}
