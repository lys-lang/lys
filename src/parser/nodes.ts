import { IToken, TokenError } from 'ebnf';
import { Closure } from './Closure';
import { Type, NativeTypes, FunctionType } from './types';
import { Annotation, IAnnotationConstructor, annotations } from './annotations';
import { Reference } from './Reference';

export namespace Nodes {
  export interface ASTNode extends IToken {
    document: string;
    children: Array<ASTNode>;
  }

  export abstract class Node {
    hasParentheses: boolean = false;
    closure: Closure;
    parent: Node;
    ofType: Type = null;

    private annotations: Set<Annotation>;

    constructor(public astNode?: ASTNode) {}

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
      return ret[ret.length - 1];
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

    toString(): never {
      console.trace();
      throw new Error('Cannot print nodes with toString');
    }
  }

  export abstract class ExpressionNode extends Node {}

  export class NameIdentifierNode extends Node {
    internalIdentifier: string;

    name: string;

    namespaceNames: Map<string, NameIdentifierNode>;

    static fromString(name: string) {
      const r = new NameIdentifierNode();
      r.name = name;
      return r;
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

    static fromString(name: string): QNameNode {
      const r = new QNameNode();
      r.names = name.split('::').map($ => NameIdentifierNode.fromString($));
      return r;
    }
  }

  export abstract class TypeNode extends Node {}

  export class TypeReducerNode extends Node {}

  export class FunctionParameterTypeNode extends TypeNode {
    name?: NameIdentifierNode;
    parameterType: TypeNode;
  }

  export class FunctionTypeNode extends TypeNode {
    typeParameters: string[];
    parameters: FunctionParameterTypeNode[];
    effect: TypeNode;
    returnType: TypeNode;
  }

  export class EffectMemberDeclarationNode extends TypeNode {
    name: NameIdentifierNode;
    typeParameters: string[];
    parameters: FunctionParameterTypeNode[];
    returnType: TypeNode;
  }

  export class ReferenceNode extends ExpressionNode {
    variable: QNameNode;

    isLocal: boolean = false;

    resolvedReference: Reference;
  }

  export class BlockNode extends ExpressionNode {
    label: string;
    statements: Node[];
  }

  export class MemberNode extends ExpressionNode {
    lhs: Node;
    memberName: NameIdentifierNode;
    operator: string;
  }

  export class DecoratorNode extends Node {
    decoratorName: NameIdentifierNode;
    arguments: LiteralNode<any>[];
  }

  export abstract class DirectiveNode extends Node {
    decorators: DecoratorNode[];
    isPublic: boolean = false;
  }

  export class DocumentNode extends Node {
    directives: DirectiveNode[];
    errors: TokenError[] = [];
    file?: string;
    moduleName?: string;
    textContent: string;
  }

  export class ParameterNode extends Node {
    parameterName: NameIdentifierNode;
    parameterType: TypeNode;
    defaultValue: ExpressionNode;
  }

  export class FunctionNode extends ExpressionNode {
    functionName: NameIdentifierNode;
    functionReturnType: TypeNode;
    parameters: ParameterNode[] = [];
    body: ExpressionNode;

    /** Array of locals by index. */
    localsByIndex: Local[] = [];

    /** List of additional non-parameter locals. */
    additionalLocals: Local[] = [];

    private tempI32s: Local[] | null = null;
    private tempI64s: Local[] | null = null;
    private tempF32s: Local[] | null = null;
    private tempF64s: Local[] | null = null;

    processParameters() {
      let localIndex = 0;

      this.parameters.forEach(parameter => {
        let local = new Local(localIndex++, parameter.parameterName.name, parameter.parameterName);
        this.localsByIndex[local.index] = local;
        parameter.annotate(new annotations.LocalIdentifier(local));
      });
    }

    /** Adds a local of the specified type. */
    addLocal(type: Type, declaration: NameIdentifierNode | null = null): Local {
      // if it has a name, check previously as this method will throw otherwise
      var localIndex = this.parameters.length + this.additionalLocals.length;

      var local = new Local(
        localIndex,
        declaration ? declaration.internalIdentifier : 'var$' + localIndex.toString(10),
        declaration
      );

      local.type = type;

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
  }

  export class ImplDirective extends DirectiveNode {
    reference: ReferenceNode;
    directives: DirectiveNode[];
  }

  export class ImportDirectiveNode extends DirectiveNode {
    allItems: boolean = true;
    module: QNameNode;
    alias: NameIdentifierNode | null = null;
  }

  export class FunDirectiveNode extends DirectiveNode {
    functionNode: FunctionNode;
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
    variableType: TypeNode;
    value: ExpressionNode;
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
    lhs: ExpressionNode;
    rhs: ExpressionNode;
  }

  export class TypeDirectiveNode extends DirectiveNode {
    variableName: NameIdentifierNode;
    valueType: TypeNode;
  }

  export class EnumDirectiveNode extends DirectiveNode {
    variableName: NameIdentifierNode;
    declarations: StructDeclarationNode[];
  }

  export abstract class LiteralNode<T> extends ExpressionNode {
    value: T;
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

  export class StructTypeNode extends TypeNode {
    parameters: ParameterNode[] = [];

    constructor(astNode?: ASTNode) {
      super(astNode);
    }
  }

  export class StackTypeNode extends TypeNode {
    metadata: Record<string, LiteralNode<any>> = {};

    constructor(astNode?: ASTNode) {
      super(astNode);
    }
  }

  export class InjectedTypeNode extends TypeNode {
    constructor(astNode?: ASTNode) {
      super(astNode);
    }
  }

  export class HexLiteral extends IntegerLiteral {
    // TODO: support bignumber here

    get value(): number {
      return parseInt(this.astNode.text, 16);
    }
    set value(value: number) {
      this.astNode.text = value.toString(16);
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

  export class StringLiteral extends LiteralNode<string> {
    value: string;
    offset: number;
    length: number;
  }

  export abstract class AbstractFunctionCallNode extends ExpressionNode {
    abstract argumentsNode: ExpressionNode[];
    resolvedFunctionType: FunctionType;
  }

  export class InjectedFunctionCallNode extends AbstractFunctionCallNode {
    argumentsNode: ExpressionNode[] = [];
  }

  export class FunctionCallNode extends AbstractFunctionCallNode {
    isInfix: boolean = false;
    functionNode: ExpressionNode = null;
    argumentsNode: ExpressionNode[] = [];
  }

  export class BinaryExpressionNode extends AbstractFunctionCallNode {
    get lhs() {
      return this.argumentsNode[0];
    }
    set lhs(value: ExpressionNode) {
      this.argumentsNode[0] = value;
    }

    get rhs() {
      return this.argumentsNode[1];
    }
    set rhs(value: ExpressionNode) {
      this.argumentsNode[1] = value;
    }

    operator: NameIdentifierNode = null;
    argumentsNode: ExpressionNode[] = [];
  }

  export class AsExpressionNode extends AbstractFunctionCallNode {
    get lhs() {
      return this.argumentsNode[0];
    }
    set lhs(value: ExpressionNode) {
      this.argumentsNode[0] = value;
    }
    argumentsNode: ExpressionNode[] = [];
    rhs: TypeNode;
  }

  export class IsExpressionNode extends AbstractFunctionCallNode {
    get lhs() {
      return this.argumentsNode[0];
    }
    set lhs(value: ExpressionNode) {
      this.argumentsNode[0] = value;
    }
    argumentsNode: ExpressionNode[] = [];
    rhs: TypeNode;
  }

  export class UnaryExpressionNode extends AbstractFunctionCallNode {
    get rhs() {
      return this.argumentsNode[0];
    }
    set rhs(value: ExpressionNode) {
      this.argumentsNode[0] = value;
    }
    operator: NameIdentifierNode;
    argumentsNode: ExpressionNode[] = [];
  }

  export class WasmAtomNode extends ExpressionNode {
    arguments: ExpressionNode[] = [];
    symbol: string;
  }

  export class WasmExpressionNode extends ExpressionNode {
    atoms: WasmAtomNode[];
  }

  export abstract class MatcherNode extends ExpressionNode {
    declaredName?: NameIdentifierNode;

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
    deconstructorNames?: NameIdentifierNode[];
    typeReference: ReferenceNode;
    resolvedFunctionType: FunctionType;
  }

  export class MatchLiteralNode extends MatcherNode {
    literal: LiteralNode<any>;
    resolvedFunctionType: FunctionType;
  }

  export class UnionTypeNode extends TypeNode {
    of: TypeNode[] = [];
  }

  export class IntersectionTypeNode extends TypeNode {
    of: TypeNode[];
  }

  export class StructDeclarationNode extends TypeNode {
    declaredName: NameIdentifierNode;
    parameters: ParameterNode[];
  }

  export class EffectDeclarationNode extends Node {
    name: NameIdentifierNode;
    elements: FunctionTypeNode[];
  }

  export class MatchDefaultNode extends MatcherNode {}

  export class PatternMatcherNode extends ExpressionNode {
    lhs: ExpressionNode;
    matchingSet: MatcherNode[];
  }

  export class LoopNode extends ExpressionNode {
    body: ExpressionNode;
  }

  export class ContinueNode extends Node {}

  export class BreakNode extends Node {}

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
  name: string;
  constructor(public declarationNode: Nodes.NameIdentifierNode) {
    this.name = declarationNode.internalIdentifier;
  }
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

export function findNodesByTypeInChildren<T>(
  astRoot: { children: any[] },
  type: { new (...args): T },
  list: T[] = []
): T[] {
  astRoot.children.forEach($ => {
    if ($ instanceof type) {
      list.push($);
    }
  });
  return list;
}
