import { IToken, TokenError } from 'ebnf';
import { Closure, Context, ITapeElement } from './closure';
import { Type } from './types';

export abstract class Node {
  hasParentheses: boolean = false;
  errors: Error[] = [];
  closure: Closure;

  constructor(public astNode?: IToken) {}

  get type(): string {
    return this.constructor.name;
  }

  get children(): Node[] {
    let accumulator: Node[] = [];

    Object.keys(this).forEach($ => {
      if (this[$] && this[$] instanceof Node) {
        accumulator.push(this[$]);
      }
      if (this[$] && this[$] instanceof Array && this[$].length && this[$][0] instanceof Node) {
        accumulator.push(...this[$]);
      }
    });

    return accumulator;
  }

  get text() {
    return '';
  }
}

export class ExpressionNode extends Node {}

export class NameIdentifierNode extends Node {
  name: string;
  get text() {
    return JSON.stringify(this.name);
  }
}

export class TypeReferenceNode extends NameIdentifierNode {
  isPointer: number = 0;
  isArray: boolean = false;
  resolvedTapeElement: ITapeElement;
}

export class VariableReferenceNode extends ExpressionNode {
  variable: NameIdentifierNode;
  resolvedTapeElement: ITapeElement;
}

export abstract class DirectiveNode extends Node {
  isExported: boolean = false;
}

export class DocumentNode extends Node {
  directives: DirectiveNode[];
  errors: TokenError[] = [];
  context: Context;
}

export class ParameterNode extends Node {
  parameterName: NameIdentifierNode;
  parameterType: TypeReferenceNode;
  defaultValue: ExpressionNode;
}

export class FunctionNode extends ExpressionNode {
  injected: boolean = false;
  functionName: NameIdentifierNode;
  functionReturnType: TypeReferenceNode;
  parameters: ParameterNode[] = [];
  value: ExpressionNode;
}

export class ContextAwareFunction extends FunctionNode {
  constructor(public baseFunction: FunctionNode, public closure: Closure) {
    super(baseFunction.astNode);
    this.injected = true;
    this.functionName = baseFunction.functionName;
    this.functionReturnType = baseFunction.functionReturnType;
    this.parameters = baseFunction.parameters;
    this.value = baseFunction.value;
  }
}

export class FunDirectiveNode extends DirectiveNode {
  functionNode: FunctionNode;
}

export class OverloadedFunctionNode extends DirectiveNode {
  injected = true;
  name: string;
  functions: FunDirectiveNode[] = [];
}

export class VarDirectiveNode extends DirectiveNode {
  mutable = true;
  variableName: NameIdentifierNode;
  variableType: TypeReferenceNode;
  value: ExpressionNode;
}

export class TypeDirectiveNode extends DirectiveNode {
  variableName: NameIdentifierNode;
  valueType: TypeNode;
  resolvedType: Type;
}

export class TypeNode extends Node {
  nativeType: Type;
}

export class ValDirectiveNode extends VarDirectiveNode {
  mutable = false;
}

export abstract class LiteralNode<T> extends ExpressionNode {
  value: T;
  get text() {
    return JSON.stringify(this.value);
  }
}

export class FloatLiteral extends LiteralNode<number> {
  get value(): number {
    return parseFloat(this.astNode.text);
  }
  set value(value: number) {
    this.astNode.text = value.toString();
  }
}

export class IntegerLiteral extends LiteralNode<number> {
  get value(): number {
    return parseInt(this.astNode.text);
  }
  set value(value: number) {
    this.astNode.text = value.toString();
  }
}

export class BooleanLiteral extends LiteralNode<boolean> {
  get value(): boolean {
    return this.astNode.text.trim() == 'true';
  }
  set value(value: boolean) {
    this.astNode.text = value.toString();
  }
}

export class NullLiteral extends LiteralNode<null> {
  value: null = null;
}

export class FunctionCallNode extends ExpressionNode {
  isInfix: boolean = false;
  functionNode: ExpressionNode;
  argumentsNode: ExpressionNode[];
}

export class BinaryExpressionNode extends ExpressionNode {
  lhs: ExpressionNode;
  rhs: ExpressionNode;
  operator: string;

  get text() {
    if (!this.operator) throw new Error('BinaryExpressionNode w/o operator');
    return JSON.stringify(this.operator);
  }
}

export class UnaryExpressionNode extends ExpressionNode {
  lhs: ExpressionNode;
  operator: string;

  get text() {
    return JSON.stringify(this.operator);
  }
}

export class BooleanNegNode extends ExpressionNode {
  lhs: ExpressionNode;
}

export class NumberNegNode extends ExpressionNode {
  lhs: ExpressionNode;
}

export abstract class MatcherNode extends ExpressionNode {}

export class MatchConditionNode extends ExpressionNode {
  declaredName: NameIdentifierNode;
  condition: ExpressionNode;
  rhs: ExpressionNode;
}

export class MatchLiteralNode extends ExpressionNode {
  literal: LiteralNode<any>;
  rhs: ExpressionNode;
}

export class MatchDefaultNode extends ExpressionNode {
  rhs: ExpressionNode;
}

export class MatchNode extends ExpressionNode {
  lhs: ExpressionNode;
  matchingSet: MatcherNode[];
}
