import { IToken, TokenError } from 'ebnf';
import { Closure, Context } from './closure';
import { Type, NativeTypes } from './types';
import { BinaryOperation } from '../compiler/languageOperations';
import { Annotation, IAnnotationConstructor } from './annotations';

export interface TypePhaseNode {
  ofType: Type;
}

export namespace Nodes {
  export abstract class Node implements TypePhaseNode {
    ofType: Type;
    hasParentheses: boolean = false;
    errors: Error[] = [];
    closure: Closure;
    parent: Node;

    private annotations: Set<Annotation>;

    constructor(public astNode?: IToken) {}

    get nodeName(): string {
      return this.constructor.name;
    }

    get children(): Node[] {
      let accumulator: Node[] = [];

      Object.keys(this).forEach($ => {
        if ($ == 'parent') return;
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

    hasAnnotation<T extends Annotation = Annotation>(name: Annotation | IAnnotationConstructor<T>) {
      if (!this.annotations) return false;

      if (typeof name === 'function') {
        return !!this.getAnnotation(name);
      } else {
        return this.annotations.has(name);
      }
    }

    getAnnotationsByClass<T extends Annotation>(klass: IAnnotationConstructor<T>): T[] {
      const ret = [];
      if (this.annotations) {
        this.annotations.forEach($ => {
          if ($ instanceof klass) ret.push($);
        });
      }
      return ret;
    }

    getAnnotation<T extends Annotation>(klass: IAnnotationConstructor<T>): T {
      const ret = [];
      if (this.annotations) {
        this.annotations.forEach($ => {
          if ($ instanceof klass) ret.push($);
        });
      }
      return ret[0];
    }

    removeAnnotation<T extends Annotation = Annotation>(name: Annotation | IAnnotationConstructor<T>) {
      if (typeof name === 'function') {
        this.getAnnotationsByClass(name).forEach($ => this.annotations.delete($));
      } else {
        this.annotations.delete(name);
      }
    }

    annotate(annotation: Annotation) {
      if (!this.annotations) this.annotations = new Set();
      this.annotations.add(annotation);
    }

    getAnnotations() {
      if (!this.annotations) {
        this.annotations = new Set();
      }
      return this.annotations;
    }
  }

  export abstract class ExpressionNode extends Node {}

  export class NameIdentifierNode extends Node {
    name: string;
    get text() {
      return JSON.stringify(this.name);
    }
  }

  export class TypeReferenceNode extends NameIdentifierNode {
    isPointer: number = 0;
    isArray: boolean = false;
  }

  export class VariableReferenceNode extends ExpressionNode {
    variable: NameIdentifierNode;
  }

  export class BlockNode extends ExpressionNode {
    label: string;
    statements: Node[];
  }

  export abstract class DirectiveNode extends Node {
    isExported: boolean = false;
  }

  export class DocumentNode extends Node {
    directives: DirectiveNode[];
    errors: TokenError[] = [];
    context: Context;
    file?: string;
    textContent: string;
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
    body: ExpressionNode;

    internalIdentifier: string;

    localsByName: Map<string, Local> = new Map();

    /** Array of locals by index. */
    localsByIndex: Local[] = [];

    /** List of additional non-parameter locals. */
    additionalLocals: Local[] = [];

    /** Current break context label. */
    breakContext: string | null = null;

    /** Contextual type arguments. */
    contextualTypeArguments: Map<string, Type> | null;

    nextInlineId: number = 0;

    private nextBreakId: number = 0;
    private breakStack: number[] | null = null;

    private tempI32s: Local[] | null = null;
    private tempI64s: Local[] | null = null;
    private tempF32s: Local[] | null = null;
    private tempF64s: Local[] | null = null;

    processParameters() {
      let localIndex = 0;

      this.parameters.forEach(parameter => {
        let local = new Local(localIndex++, parameter.parameterName.name, parameter);
        local.type = parameter.ofType;
        this.localsByName.set(local.name, local);
        this.localsByIndex[local.index] = local;
      });
    }

    /** Adds a local of the specified type, with an optional name. */
    addLocal(type: Type, name: string | null = null, declaration: Node | null = null): Local {
      // if it has a name, check previously as this method will throw otherwise
      var localIndex = this.parameters.length + this.additionalLocals.length;

      var local = new Local(localIndex, name ? name : 'var$' + localIndex.toString(10), declaration);
      local.type = type;
      if (name) {
        if (this.localsByName.has(name)) throw new Error('duplicate local name');
        this.localsByName.set(name, local);
      }
      this.localsByIndex[local.index] = local;
      this.additionalLocals.push(local);
      return local;
    }

    /** Gets a free temporary local of the specified type. */
    getTempLocal(type: Type): Local {
      var temps: Local[] | null;
      switch (type.nativeType) {
        case NativeTypes.i32: {
          temps = this.tempI32s;
          break;
        }
        case NativeTypes.i64: {
          temps = this.tempI64s;
          break;
        }
        case NativeTypes.f32: {
          temps = this.tempF32s;
          break;
        }
        case NativeTypes.f64: {
          temps = this.tempF64s;
          break;
        }
        default:
          throw new Error('concrete type expected');
      }

      var local: Local;

      if (temps && temps.length) {
        local = temps.pop();
        local.type = type;
      } else {
        local = this.addLocal(type);
      }

      return local;
    }

    /** Frees the temporary local for reuse. */
    freeTempLocal(local: Local): void {
      var temps: Local[];
      if (local.type === null) throw new Error('type is null'); // internal error
      switch (local.type.nativeType) {
        case NativeTypes.i32: {
          temps = this.tempI32s || (this.tempI32s = []);
          break;
        }
        case NativeTypes.i64: {
          temps = this.tempI64s || (this.tempI64s = []);
          break;
        }
        case NativeTypes.f32: {
          temps = this.tempF32s || (this.tempF32s = []);
          break;
        }
        case NativeTypes.f64: {
          temps = this.tempF64s || (this.tempF64s = []);
          break;
        }
        default:
          throw new Error('concrete type expected');
      }
      if (local.index < 0) throw new Error('invalid local index');
      temps.push(local);
    }

    /** Gets and immediately frees a temporary local of the specified type. */
    getAndFreeTempLocal(type: Type): Local {
      var temps: Local[];
      switch (type.nativeType) {
        case NativeTypes.i32: {
          temps = this.tempI32s || (this.tempI32s = []);
          break;
        }
        case NativeTypes.i64: {
          temps = this.tempI64s || (this.tempI64s = []);
          break;
        }
        case NativeTypes.f32: {
          temps = this.tempF32s || (this.tempF32s = []);
          break;
        }
        case NativeTypes.f64: {
          temps = this.tempF64s || (this.tempF64s = []);
          break;
        }
        default:
          throw new Error('concrete type expected');
      }

      var local: Local;

      if (temps.length) {
        local = temps[temps.length - 1];
        local.type = type;
      } else {
        local = this.addLocal(type);
        temps.push(local);
      }

      return local;
    }

    /** Enters a(nother) break context. */
    enterBreakContext(): string {
      var id = this.nextBreakId++;
      if (!this.breakStack) this.breakStack = [id];
      else this.breakStack.push(id);
      return (this.breakContext = id.toString(10));
    }

    /** Leaves the current break context. */
    leaveBreakContext(): void {
      if (!this.breakStack) throw new Error('there was no breakStack');
      var length = this.breakStack.length;
      if (length == 0) throw new Error('the breakStack is empty');
      this.breakStack.pop();
      if (length > 1) {
        this.breakContext = this.breakStack[length - 2].toString(10);
      } else {
        this.breakContext = null;
        this.breakStack = null;
      }
    }

    /** Finalizes the function once compiled, releasing no longer needed resources. */
    finalize(): void {
      if (this.breakStack && this.breakStack.length) throw new Error('break stack');
      this.breakStack = null;
      this.breakContext = null;
      this.tempI32s = this.tempI64s = this.tempF32s = this.tempF64s = null;
    }
  }

  export class ContextAwareFunction extends FunctionNode {
    constructor(public baseFunction: FunctionNode, public closure: Closure) {
      super(baseFunction.astNode);
      this.injected = true;
      this.functionName = baseFunction.functionName;
      this.functionReturnType = baseFunction.functionReturnType;
      this.parameters = baseFunction.parameters;
      this.body = baseFunction.body;
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

  export class VarDeclarationNode extends Node {
    mutable = true;
    variableName: NameIdentifierNode;
    variableType: TypeReferenceNode;
    value: ExpressionNode;
    local: Local;
  }

  export class ConstDeclarationNode extends VarDeclarationNode {
    mutable = false;
  }

  export class VarDirectiveNode extends DirectiveNode {
    decl: VarDeclarationNode;
  }

  export class ConstDirectiveNode extends VarDirectiveNode {
    decl: ConstDeclarationNode;
  }

  export class AssignmentNode extends Node {
    variableName: VariableReferenceNode;
    value: ExpressionNode;
  }

  export class TypeDirectiveNode extends DirectiveNode {
    variableName: NameIdentifierNode;
    valueType: TypeNode;
  }

  export class TypeNode extends Node {
    nativeType: Type;
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
    binaryOperation: BinaryOperation;

    get text() {
      if (!this.operator) throw new Error('BinaryExpressionNode w/o operator');
      return JSON.stringify(this.operator);
    }
  }

  export class UnaryExpressionNode extends ExpressionNode {
    rhs: ExpressionNode;
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

  export abstract class MatcherNode extends ExpressionNode {
    rhs: ExpressionNode;
  }

  export class IfNode extends ExpressionNode {
    condition: ExpressionNode;
    truePart: ExpressionNode;
    falsePart: ExpressionNode;
  }

  export class MatchConditionNode extends MatcherNode {
    declaredName: NameIdentifierNode;
    condition: ExpressionNode;
  }

  export class MatchLiteralNode extends MatcherNode {
    literal: LiteralNode<any>;
  }

  export class MatchDefaultNode extends MatcherNode {}

  export class MatchNode extends ExpressionNode {
    lhs: ExpressionNode;
    matchingSet: MatcherNode[];

    /** local index in the function's scope */
    local: Local;
  }

  /////// Non-grammar nodes

  export class GetLocalNode extends ExpressionNode {
    local: Local;
  }

  /** This node replaces the function body */
  export class TailRecLoopNode extends Nodes.ExpressionNode {
    body: Nodes.ExpressionNode;
  }
}

export class Local {
  type: Type;
  /** index in the function */
  constructor(public index: number, public name: string, public declarationNode: Nodes.Node) {}
}

export function findNodesByType<T>(astRoot: any, type: { new (...args): T }, list: T[] = []): T[] {
  if (astRoot instanceof type) list.push(astRoot);
  astRoot.children.forEach($ => findNodesByType($, type, list));
  return list;
}
