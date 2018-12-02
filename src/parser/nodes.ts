import { IToken, TokenError } from 'ebnf';
import { Closure, Reference } from './closure';
import { Type, NativeTypes, FunctionType, StructType } from './types';
import { Annotation, IAnnotationConstructor } from './annotations';
import { indent } from '../utils/astPrinter';

export namespace Nodes {
  export abstract class Node {
    hasParentheses: boolean = false;
    errors: Error[] = [];
    closure: Closure;
    parent: Node;
    ofType: Type = null;

    private annotations: Set<Annotation>;

    constructor(public astNode?: IToken) {}

    /** Name of the node constructor */
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

      if (typeof name === 'object') {
        return this.annotations.has(name);
      } else {
        return !!this.getAnnotation(name);
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
      if (typeof name === 'object') {
        this.annotations.delete(name);
      } else {
        this.getAnnotationsByClass(name).forEach($ => this.annotations.delete($));
      }
    }

    annotate(annotation: Annotation) {
      if (!this.annotations) this.annotations = new Set();
      this.annotations.add(annotation);
    }

    getAnnotations(): Annotation[];
    getAnnotations<T extends Annotation>(klass: IAnnotationConstructor<T>): T[];
    getAnnotations<T extends Annotation>(klass?: IAnnotationConstructor<T>): T[] {
      const ret = [];
      if (this.annotations) {
        this.annotations.forEach($ => {
          if (!klass || $ instanceof klass) ret.push($);
        });
      }
      return ret;
    }
  }

  export abstract class ExpressionNode extends Node {}

  export class NameIdentifierNode extends Node {
    name: string;

    namespaceNames: Map<string, NameIdentifierNode>;

    get text() {
      return JSON.stringify(this.name);
    }

    static fromString(name: string) {
      const r = new NameIdentifierNode();
      r.name = name;
      return r;
    }

    toString() {
      return this.name;
    }

    getSelfReference() {
      // TODO: Review this
      return this.closure.get(this.name, false);
    }
  }

  export class QNameNode extends Node {
    names: NameIdentifierNode[];

    deconstruct() {
      const moduleName = this.names
        .slice(0, -1)
        .map($ => $.name)
        .join('::');
      const variable = this.names[this.names.length - 1].name;
      return { moduleName, variable };
    }

    get text() {
      return this.names.map($ => $.name).join('::');
    }

    toString() {
      return this.text;
    }

    static fromString(name: string): QNameNode {
      const r = new QNameNode();
      r.names = name.split('::').map($ => NameIdentifierNode.fromString($));
      return r;
    }
  }

  export class TypeNode extends Node {}

  export class TypeReducerNode extends Node {}

  export class FunctionParameterTypeNode extends TypeNode {
    name?: NameIdentifierNode;
    parameterType: TypeNode;

    toString() {
      if (this.name) {
        return `${this.name}: ${this.parameterType}`;
      } else {
        return `${this.parameterType}`;
      }
    }
  }

  export class FunctionTypeNode extends TypeNode {
    typeParameters: string[];
    parameters: FunctionParameterTypeNode[];
    effect: TypeNode;
    returnType: TypeNode;

    toString() {
      return `fun(${this.parameters.join(', ')}) -> ${this.returnType}`;
    }
  }

  export class EffectMemberDeclarationNode extends TypeNode {
    name: NameIdentifierNode;
    typeParameters: string[];
    parameters: FunctionParameterTypeNode[];
    returnType: TypeNode;
  }

  export class ReferenceNode extends ExpressionNode {
    variable: QNameNode;
    /** local index in the function's scope */
    local: LocalGlobalHeapReference;
    isLocal: boolean = false;

    resolvedReference: Reference;

    toString() {
      return this.variable.toString();
    }
  }

  export class BlockNode extends ExpressionNode {
    label: string;
    statements: Node[];

    toString() {
      if (this.statements.length) return '{}';
      return '{\n' + indent(this.statements.join('\n')) + '\n}';
    }
  }

  export class MemberNode extends ExpressionNode {
    lhs: Node;
    memberName: NameIdentifierNode;
    operator: string;

    toString() {
      return this.lhs.toString() + this.operator + this.memberName.toString();
    }
  }

  export abstract class DirectiveNode extends Node {
    isExported: boolean = false;
  }

  export class DocumentNode extends Node {
    directives: DirectiveNode[];
    errors: TokenError[] = [];
    file?: string;
    moduleName?: string;
    textContent: string;

    toString() {
      return this.directives.join('\n');
    }
  }

  export class ParameterNode extends Node {
    parameterName: NameIdentifierNode;
    parameterType: TypeNode;
    defaultValue: ExpressionNode;
    local: LocalGlobalHeapReference;

    toString() {
      if (this.defaultValue) {
        return this.parameterName.toString() + ': ' + this.parameterType + ' = ' + this.defaultValue;
      }
      return this.parameterName.toString() + ': ' + this.parameterType;
    }
  }

  export class FunctionNode extends ExpressionNode {
    functionName: NameIdentifierNode;
    functionReturnType: TypeNode;
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
        let local = new Local(localIndex++, parameter.parameterName.name, parameter.parameterName);
        this.localsByName.set(local.name, local);
        this.localsByIndex[local.index] = local;
        parameter.local = local;
      });
    }

    /** Adds a local of the specified type, with an optional name. */
    addLocal(type: Type, name: string | null = null, declaration: NameIdentifierNode | null = null): Local {
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
      switch (type.binaryenType) {
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
          console.trace('concrete type expected ' + type.toString());
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
      switch (local.type.binaryenType) {
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
          console.trace('concrete type expected');
          throw new Error('concrete type expected');
      }
      if (local.index < 0) throw new Error('invalid local index');
      temps.push(local);
    }

    /** Gets and immediately frees a temporary local of the specified type. */
    getAndFreeTempLocal(type: Type): Local {
      var temps: Local[];
      switch (type.binaryenType) {
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
          console.trace('concrete type expected');
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

  export class ImportDirectiveNode extends DirectiveNode {
    allItems: boolean = true;
    module: QNameNode;
    alias: NameIdentifierNode | null = null;
  }

  export class FunDirectiveNode extends DirectiveNode {
    functionNode: FunctionNode;
  }

  export class NamespaceDirectiveNode extends DirectiveNode {
    reference: ReferenceNode;
    directives: DirectiveNode[];
  }

  export class EffectDirectiveNode extends DirectiveNode {
    effect: EffectDeclarationNode;
  }

  export class OverloadedFunctionNode extends DirectiveNode {
    functionName: NameIdentifierNode;
    functions: FunDirectiveNode[] = [];
  }

  export class VarDeclarationNode extends Node {
    mutable = true;
    variableName: NameIdentifierNode;
    variableType: ReferenceNode;
    value: ExpressionNode;
    local: LocalGlobalHeapReference;
  }

  export class ValDeclarationNode extends VarDeclarationNode {
    mutable = false;
  }

  export class VarDirectiveNode extends DirectiveNode {
    decl: VarDeclarationNode;
  }

  export class ValDirectiveNode extends VarDirectiveNode {
    decl: ValDeclarationNode;
  }

  export class AssignmentNode extends Node {
    variable: ReferenceNode;
    value: ExpressionNode;
  }

  export class TypeDirectiveNode extends DirectiveNode {
    variableName: NameIdentifierNode;
    valueType: TypeNode;
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

  export class UnknownExpressionNode extends ExpressionNode {}

  export class HexLiteral extends IntegerLiteral {
    // TODO: support bignumber here

    get value(): number {
      return parseInt(this.astNode.text, 16);
    }
    set value(value: number) {
      this.astNode.text = value.toString(16);
    }

    get text() {
      return this.astNode.text;
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

  export class StringLiteral extends LiteralNode<string> {
    value: string;
  }

  export class FunctionCallNode extends ExpressionNode {
    isInfix: boolean = false;
    functionNode: ExpressionNode;
    argumentsNode: ExpressionNode[];
    resolvedFunctionType: FunctionType | StructType;
  }

  export class BinaryExpressionNode extends ExpressionNode {
    lhs: ExpressionNode;
    rhs: ExpressionNode;
    operator: NameIdentifierNode;

    resolvedFunctionType: FunctionType;

    get text() {
      if (!this.operator) throw new Error('BinaryExpressionNode w/o operator');
      return this.operator.text;
    }
  }

  export class AsExpressionNode extends ExpressionNode {
    lhs: ExpressionNode;
    rhs: TypeNode;

    resolvedFunctionType: FunctionType;

    get text() {
      return 'as';
    }
  }

  export class IsExpressionNode extends ExpressionNode {
    lhs: ExpressionNode;
    rhs: TypeNode;

    resolvedFunctionType: FunctionType;

    get text() {
      return 'is';
    }
  }

  export class UnaryExpressionNode extends ExpressionNode {
    rhs: ExpressionNode;
    operator: NameIdentifierNode;

    resolvedFunctionType: FunctionType;

    get text() {
      return this.operator.text;
    }
  }

  export class WasmAtomNode extends ExpressionNode {
    arguments: ExpressionNode[] = [];
    symbol: string;

    get text() {
      return this.symbol;
    }
  }

  export class WasmExpressionNode extends ExpressionNode {
    atoms: WasmAtomNode[];
  }

  export abstract class MatcherNode extends ExpressionNode {
    declaredName?: NameIdentifierNode;
    /** local index in the function's scope */
    local: LocalGlobalHeapReference;
    rhs: ExpressionNode;
  }

  export class IfNode extends ExpressionNode {
    condition: ExpressionNode;
    truePart: ExpressionNode;
    falsePart: ExpressionNode;
  }

  export class MatchConditionNode extends MatcherNode {
    condition: ExpressionNode;
  }

  export class MatchCaseIsNode extends MatcherNode {
    typeReference: ReferenceNode;
    deconstructorNames: NameIdentifierNode[];
    resolvedFunctionType: FunctionType;
  }

  export class MatchLiteralNode extends MatcherNode {
    literal: LiteralNode<any>;
    resolvedFunctionType: FunctionType;
  }

  export class UnionTypeNode extends TypeNode {
    of: TypeNode[];

    toString() {
      return this.of.length > 1 ? '(' + this.of.join(' | ') + ')' : this.of.join(' | ');
    }
  }

  export class IntersectionTypeNode extends TypeNode {
    of: TypeNode[];

    toString() {
      return this.of.length > 1 ? '(' + this.of.join(' & ') + ')' : this.of.join(' & ');
    }
  }

  export class StructDeclarationNode extends TypeNode {
    internalIdentifier: string;
    declaredName: NameIdentifierNode;
    parameters: ParameterNode[];
    typeNumber: number | null = null;
  }

  export class TypeDeclarationNode extends TypeNode {
    typeNumber: number | null = null;
    declarations: StructDeclarationNode[];
  }

  export class EffectDeclarationNode extends Node {
    name: NameIdentifierNode;
    elements: FunctionTypeNode[];
  }

  export class MatchDefaultNode extends MatcherNode {}

  export class PatternMatcherNode extends ExpressionNode {
    lhs: ExpressionNode;
    matchingSet: MatcherNode[];

    /** local index in the function's scope */
    local: LocalGlobalHeapReference;
  }

  /////// Non-grammar nodes

  /** This node replaces the function body */
  export class TailRecLoopNode extends Nodes.ExpressionNode {
    body: Nodes.ExpressionNode;
  }
}

export interface LocalGlobalHeapReference {
  type: Type;
  name: string;
  declarationNode: Nodes.Node;
}

export class Global implements LocalGlobalHeapReference {
  type: Type;
  constructor(public name: string, public declarationNode: Nodes.Node) {}
}

export class Local implements LocalGlobalHeapReference {
  type: Type;
  /** index in the function */
  constructor(public index: number, public name: string, public declarationNode: Nodes.Node) {}
}

export function findNodesByType<T>(astRoot: { children: any[] }, type: { new (...args): T }, list: T[] = []): T[] {
  if (astRoot instanceof type) {
    list.push(astRoot);
  }
  astRoot.children.forEach($ => findNodesByType($, type, list));
  return list;
}
