import { TokenError } from 'ebnf';
import { Closure } from './Closure';
import { Type, NativeTypes, FunctionType } from './types';
import { Annotation, IAnnotationConstructor, annotations } from './annotations';
import { Reference } from './Reference';

export interface LocalGlobalHeapReference {
  type?: Type;
  name: string;
  declarationNode?: Nodes.Node;
}

export class Global implements LocalGlobalHeapReference {
  type?: Type;
  name: string;
  constructor(public declarationNode: Nodes.NameIdentifierNode) {
    this.name = declarationNode.internalIdentifier!;
  }
}

export class Local implements LocalGlobalHeapReference {
  type?: Type;
  /** index in the function */
  constructor(public index: number, public name: string, public declarationNode?: Nodes.Node) {}
}

export enum PhaseFlags {
  Semantic = 1,
  NameInitialization = 2,
  Scope = 4,
  TypeInitialization = 8,
  TypeGraph = 16,
  TypeCheck = 32,
  Compilation = 64
}

export namespace Nodes {
  export interface ASTNode {
    readonly type: string;
    readonly text: string;
    readonly start: number;
    readonly end: number;
    readonly errors: TokenError[];
    readonly moduleName: string;
    readonly children: ReadonlyArray<ASTNode>;
  }

  export abstract class Node {
    hasParentheses: boolean = false;
    closure?: Closure;
    parent?: Node;
    ofType?: Type;
    typeNode?: any; // TypeNode

    private annotations?: Set<Annotation>;

    constructor(public astNode: ASTNode) {}

    /** Name of the node constructor */
    get nodeName(): string {
      return this.constructor.name;
    }

    get children(): Node[] {
      return this.childrenOrEmpty.filter($ => !!$) as Node[];
    }

    abstract get childrenOrEmpty(): (Node | void)[];

    hasAnnotation<T extends Annotation = Annotation>(name: Annotation | IAnnotationConstructor<T>) {
      if (!this.annotations) return false;

      if (typeof name === 'object') {
        return this.annotations.has(name);
      } else {
        return !!this.getAnnotation(name);
      }
    }

    getAnnotationsByClass<T extends Annotation>(klass: IAnnotationConstructor<T>): T[] {
      const ret: T[] = [];
      if (this.annotations) {
        this.annotations.forEach($ => {
          if ($ instanceof klass) ret.push($);
        });
      }
      return ret;
    }

    getAnnotation<T extends Annotation>(klass: IAnnotationConstructor<T>): T {
      const ret: T[] = [];
      if (this.annotations) {
        this.annotations.forEach($ => {
          if ($ instanceof klass) ret.push($);
        });
      }
      return ret[ret.length - 1];
    }

    removeAnnotation<T extends Annotation = Annotation>(name: Annotation | IAnnotationConstructor<T>) {
      if (typeof name === 'object') {
        this.annotations && this.annotations.delete(name);
      } else {
        this.annotations &&
          this.getAnnotationsByClass(name).forEach($ => this.annotations && this.annotations.delete($));
      }
    }

    annotate(annotation: Annotation) {
      if (!this.annotations) this.annotations = new Set();
      this.annotations.add(annotation);
    }

    getAnnotations(): Annotation[];
    getAnnotations<T extends Annotation>(klass: IAnnotationConstructor<T>): T[];
    getAnnotations<T extends Annotation>(klass?: IAnnotationConstructor<T>): T[] {
      const ret: T[] = [];
      if (this.annotations) {
        this.annotations.forEach($ => {
          if (!klass || $ instanceof klass) ret.push($ as T);
        });
      }
      return ret;
    }

    toString(): string {
      console.trace();
      throw new Error('Cannot print nodes with toString');
    }
  }

  export abstract class ExpressionNode extends Node {}

  export class NameIdentifierNode extends Node {
    internalIdentifier?: string;
    namespaceNames?: Map<string, NameIdentifierNode>;

    get childrenOrEmpty(): Node[] {
      return [];
    }

    constructor(astNode: ASTNode, public name: string) {
      super(astNode);
    }

    static fromString(name: string, astNode: ASTNode) {
      const r = new NameIdentifierNode(astNode, name);
      return r;
    }

    getSelfReference() {
      // TODO: Review this
      return this.closure!.get(this.name, false);
    }
  }

  export class QNameNode extends Node {
    constructor(astNode: ASTNode, public readonly names: NameIdentifierNode[]) {
      super(astNode);
    }

    static fromString(name: string, astNode: ASTNode): QNameNode {
      const names = name.split('::').map($ => NameIdentifierNode.fromString($, astNode));
      const r = new QNameNode(astNode, names);
      return r;
    }

    get childrenOrEmpty() {
      return this.names || [];
    }

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
  }

  export abstract class TypeNode extends Node {}

  export class TypeReducerNode extends Node {
    get childrenOrEmpty(): Node[] {
      return [];
    }
  }

  export class FunctionParameterTypeNode extends TypeNode {
    name?: NameIdentifierNode;

    constructor(astNode: ASTNode, public readonly parameterType: TypeNode) {
      super(astNode);
    }

    get childrenOrEmpty() {
      return [this.name, this.parameterType];
    }
  }

  export class FunctionTypeNode extends TypeNode {
    typeParameters?: string[];
    effect?: TypeNode;
    returnType?: TypeNode;

    constructor(astNode: ASTNode, public readonly parameters: FunctionParameterTypeNode[]) {
      super(astNode);
    }

    get childrenOrEmpty() {
      return [...(this.parameters || []), this.returnType, this.effect];
    }
  }

  export class EffectMemberDeclarationNode extends TypeNode {
    name?: NameIdentifierNode;
    typeParameters?: string[];
    parameters?: FunctionParameterTypeNode[];
    returnType?: TypeNode;

    get childrenOrEmpty() {
      return [this.name];
    }
  }

  export class ReferenceNode extends ExpressionNode {
    isLocal: boolean = false;
    resolvedReference?: Reference;

    constructor(astNode: ASTNode, public readonly variable: QNameNode) {
      super(astNode);
    }

    get childrenOrEmpty() {
      return [this.variable];
    }
  }

  export class BlockNode extends ExpressionNode {
    label?: string;

    constructor(astNode: ASTNode, public readonly statements: Node[]) {
      super(astNode);
    }

    get childrenOrEmpty() {
      return this.statements || [];
    }
  }

  export class MemberNode extends ExpressionNode {
    constructor(
      astNode: ASTNode,
      public readonly lhs: Node,
      public readonly operator: string,
      public readonly memberName: NameIdentifierNode
    ) {
      super(astNode);
    }

    get childrenOrEmpty() {
      return [this.lhs, this.memberName];
    }
  }

  export class DecoratorNode extends Node {
    constructor(
      astNode: ASTNode,
      public readonly decoratorName: NameIdentifierNode,
      public readonly args: LiteralNode<any>[]
    ) {
      super(astNode);
    }

    get childrenOrEmpty() {
      return [this.decoratorName, ...(this.args || [])];
    }
  }

  export abstract class DirectiveNode extends Node {
    decorators?: DecoratorNode[];
    isPublic: boolean = false;
  }

  export class DocumentNode extends Node {
    readonly directives: DirectiveNode[] = [];
    moduleName!: string;
    fileName!: string;
    content!: string;

    phasesRun: PhaseFlags = 0;

    // thanks, javascript. TypeGraph cannot me imported because of circular
    // imports
    typeGraph?: any;

    typeNumbers: Map<string, number> = new Map();
    nameIdentifiers: Set<string> = new Set();

    get childrenOrEmpty() {
      return this.directives;
    }
  }

  export class ParameterNode extends Node {
    parameterType?: TypeNode;
    defaultValue?: ExpressionNode;

    constructor(astNode: ASTNode, public readonly parameterName: NameIdentifierNode) {
      super(astNode);
    }

    get childrenOrEmpty() {
      return [this.parameterName, this.parameterType, this.defaultValue];
    }
  }

  export class FunctionNode extends ExpressionNode {
    functionReturnType?: TypeNode;
    parameters: ParameterNode[] = [];
    body?: ExpressionNode;

    get childrenOrEmpty() {
      return [this.functionName, ...this.parameters, this.functionReturnType, this.body];
    }

    /** Array of locals by index. */
    localsByIndex: Local[] = [];

    /** List of additional non-parameter locals. */
    additionalLocals: Local[] = [];

    private tempI32s: Local[] | null = null;
    private tempI64s: Local[] | null = null;
    private tempF32s: Local[] | null = null;
    private tempF64s: Local[] | null = null;

    constructor(astNode: ASTNode, public readonly functionName: NameIdentifierNode) {
      super(astNode);
    }

    processParameters() {
      let localIndex = 0;

      this.parameters.forEach(parameter => {
        let local = new Local(localIndex++, parameter.parameterName.name, parameter.parameterName);
        this.localsByIndex[local.index] = local;
        parameter.annotate(new annotations.LocalIdentifier(local));
      });
    }

    /** Adds a local of the specified type. */
    addLocal(type: Type, declaration?: NameIdentifierNode): Local {
      // if it has a name, check previously as this method will throw otherwise
      let localIndex = this.parameters.length + this.additionalLocals.length;
      let local = new Local(
        localIndex,
        declaration ? declaration.internalIdentifier! : 'var$' + localIndex.toString(10),
        declaration
      );

      local.type = type;

      this.localsByIndex[local.index] = local;
      this.additionalLocals.push(local);
      return local;
    }

    /** Gets a free temporary local of the specified type. */
    getTempLocal(type: Type): Local {
      let temps: Local[] | null;
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

      let local: Local;

      if (temps && temps.length) {
        local = temps.pop()!;
        local.type = type;
      } else {
        local = this.addLocal(type);
      }

      return local;
    }

    /** Frees the temporary local for reuse. */
    freeTempLocal(local: Local): void {
      let temps: Local[];
      if (!local.type) throw new Error('type is null'); // internal error
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
      let temps: Local[];
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

      let local: Local;

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
    constructor(
      astNode: ASTNode,
      public readonly reference: ReferenceNode,
      public readonly directives: DirectiveNode[]
    ) {
      super(astNode);
    }

    get childrenOrEmpty() {
      return [...(this.decorators || []), this.reference, ...(this.directives || [])];
    }
  }

  export class ImportDirectiveNode extends DirectiveNode {
    allItems: boolean = true;
    alias: NameIdentifierNode | null = null;

    constructor(astNode: ASTNode, public readonly module: QNameNode) {
      super(astNode);
    }

    get childrenOrEmpty() {
      return [...(this.decorators || []), this.module, this.alias || void 0];
    }
  }

  export class FunDirectiveNode extends DirectiveNode {
    constructor(
      astNode: ASTNode,
      public readonly functionNode: FunctionNode,
      public readonly decorators: DecoratorNode[]
    ) {
      super(astNode);
    }

    get childrenOrEmpty() {
      return [...(this.decorators || []), this.functionNode];
    }
  }

  export class EffectDirectiveNode extends DirectiveNode {
    effect?: EffectDeclarationNode;

    get childrenOrEmpty() {
      return [...(this.decorators || []), this.effect];
    }
  }

  export class OverloadedFunctionNode extends DirectiveNode {
    functions: FunDirectiveNode[] = [];

    constructor(astNode: ASTNode, public readonly functionName: NameIdentifierNode) {
      super(astNode);
    }

    get childrenOrEmpty() {
      return [...(this.decorators || []), this.functionName, ...this.functions];
    }
  }

  export class VarDeclarationNode extends Node {
    mutable = true;
    variableType?: TypeNode;

    constructor(astNode: ASTNode, public readonly variableName: NameIdentifierNode, public value: ExpressionNode) {
      super(astNode);
    }

    get childrenOrEmpty() {
      return [this.variableName, this.variableType, this.value];
    }
  }

  export class ValDeclarationNode extends VarDeclarationNode {
    mutable = false;
  }

  export class VarDirectiveNode extends DirectiveNode {
    constructor(astNode: ASTNode, public readonly decl: VarDeclarationNode) {
      super(astNode);
    }

    get childrenOrEmpty() {
      return [...(this.decorators || []), this.decl];
    }
  }

  export class ValDirectiveNode extends VarDirectiveNode {
    constructor(astNode: ASTNode, public readonly decl: ValDeclarationNode) {
      super(astNode, decl);
    }
  }

  export class AssignmentNode extends Node {
    constructor(astNode: ASTNode, public readonly lhs: ExpressionNode, public readonly rhs: ExpressionNode) {
      super(astNode);
    }

    get childrenOrEmpty() {
      return [this.lhs, this.rhs];
    }
  }

  export class TypeDirectiveNode extends DirectiveNode {
    valueType?: TypeNode;

    constructor(astNode: ASTNode, public readonly variableName: NameIdentifierNode) {
      super(astNode);
    }

    get childrenOrEmpty() {
      return [...(this.decorators || []), this.variableName, this.valueType];
    }
  }

  export class EnumDirectiveNode extends DirectiveNode {
    constructor(
      astNode: ASTNode,
      public readonly variableName: NameIdentifierNode,
      public readonly declarations: StructDeclarationNode[]
    ) {
      super(astNode);
    }

    get childrenOrEmpty() {
      return [...(this.decorators || []), this.variableName, ...(this.declarations || [])];
    }
  }

  export abstract class LiteralNode<T> extends ExpressionNode {
    value?: T;
    rawValue: string = '';

    constructor(astNode: ASTNode) {
      super(astNode);
      if (astNode) {
        this.rawValue = astNode.text;
      }
    }
  }

  export class FloatLiteral extends LiteralNode<number> {
    suffixReference?: ReferenceNode;

    get value(): number {
      return parseFloat(this.rawValue);
    }
    set value(value: number) {
      this.rawValue = value.toString();
    }

    get childrenOrEmpty() {
      return [this.suffixReference];
    }
  }

  export class IntegerLiteral extends LiteralNode<number> {
    suffixReference?: ReferenceNode;
    get value(): number {
      return parseInt(this.rawValue, 10);
    }
    set value(value: number) {
      this.rawValue = value.toString();
    }

    get childrenOrEmpty() {
      return [this.suffixReference];
    }
  }

  export class UnknownExpressionNode extends ExpressionNode {
    get childrenOrEmpty() {
      return [];
    }
  }

  export class StructTypeNode extends TypeNode {
    constructor(astNode: ASTNode, public readonly parameters: ParameterNode[]) {
      super(astNode);
    }

    get childrenOrEmpty() {
      return this.parameters;
    }
  }

  export class StackTypeNode extends TypeNode {
    metadata: Record<string, LiteralNode<any>> = {};

    get childrenOrEmpty() {
      return [];
    }
  }

  export class InjectedTypeNode extends TypeNode {
    get childrenOrEmpty() {
      return [];
    }
  }

  export class HexLiteral extends IntegerLiteral {
    suffixReference?: ReferenceNode;
    get value(): number {
      return parseInt(this.rawValue, 16);
    }
    set value(value: number) {
      this.rawValue = value.toString(16);
    }

    get childrenOrEmpty() {
      return [this.suffixReference];
    }
  }

  export class BooleanLiteral extends LiteralNode<boolean> {
    get value(): boolean {
      return this.rawValue.trim() === 'true';
    }
    set value(value: boolean) {
      this.rawValue = value.toString();
    }

    get childrenOrEmpty() {
      return [];
    }
  }

  export class StringLiteral extends LiteralNode<string> {
    value?: string;
    offset?: number;
    length?: number;

    get childrenOrEmpty() {
      return [];
    }
  }

  export abstract class AbstractFunctionCallNode extends ExpressionNode {
    abstract argumentsNode: ExpressionNode[];
    resolvedFunctionType?: FunctionType;
  }

  export class InjectedFunctionCallNode extends AbstractFunctionCallNode {
    argumentsNode: ExpressionNode[] = [];

    get childrenOrEmpty() {
      return this.argumentsNode;
    }
  }

  export class FunctionCallNode extends AbstractFunctionCallNode {
    isInfix: boolean = false;

    constructor(
      astNode: ASTNode,
      public functionNode: ExpressionNode,
      public readonly argumentsNode: ExpressionNode[]
    ) {
      super(astNode);
    }

    get childrenOrEmpty() {
      return [this.functionNode, ...this.argumentsNode];
    }
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

    argumentsNode: ExpressionNode[] = [];

    constructor(
      astNode: ASTNode,
      public readonly operator: NameIdentifierNode,
      lhs: ExpressionNode,
      rhs: ExpressionNode
    ) {
      super(astNode);
      this.lhs = lhs;
      this.rhs = rhs;
    }

    get childrenOrEmpty() {
      return [this.lhs, this.operator, this.rhs];
    }
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

    constructor(astNode: ASTNode, lhs: ExpressionNode, rhs: TypeNode) {
      super(astNode);
      this.lhs = lhs;
      this.rhs = rhs;
    }

    get childrenOrEmpty() {
      return [this.lhs, this.rhs];
    }
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

    constructor(astNode: ASTNode, lhs: ExpressionNode, rhs: TypeNode) {
      super(astNode);
      this.lhs = lhs;
      this.rhs = rhs;
    }

    get childrenOrEmpty() {
      return [this.lhs, this.rhs];
    }
  }

  export class UnaryExpressionNode extends AbstractFunctionCallNode {
    get rhs() {
      return this.argumentsNode[0];
    }
    set rhs(value: ExpressionNode) {
      this.argumentsNode[0] = value;
    }
    argumentsNode: ExpressionNode[] = [];

    constructor(astNode: ASTNode, public readonly operator: NameIdentifierNode, rhs: TypeNode) {
      super(astNode);

      this.rhs = rhs;
    }

    get childrenOrEmpty() {
      return [this.rhs];
    }
  }

  export class WasmAtomNode extends ExpressionNode {
    constructor(astNode: ASTNode, public readonly symbol: string, public readonly args: ExpressionNode[]) {
      super(astNode);
    }

    get childrenOrEmpty() {
      return [...this.args];
    }
  }

  export class WasmExpressionNode extends ExpressionNode {
    constructor(astNode: ASTNode, public readonly atoms: WasmAtomNode[]) {
      super(astNode);
    }

    get childrenOrEmpty() {
      return this.atoms || [];
    }
  }

  export abstract class MatcherNode extends ExpressionNode {
    declaredName?: NameIdentifierNode;

    constructor(astNode: ASTNode, public readonly rhs: ExpressionNode) {
      super(astNode);
    }

    get childrenOrEmpty() {
      return [this.declaredName, this.rhs];
    }
  }

  export class IfNode extends ExpressionNode {
    constructor(
      astNode: ASTNode,
      public readonly condition: ExpressionNode,
      public readonly truePart: ExpressionNode,
      public readonly falsePart?: ExpressionNode
    ) {
      super(astNode);
    }

    get childrenOrEmpty() {
      return [this.condition, this.truePart, this.falsePart];
    }
  }

  export class MatchConditionNode extends MatcherNode {
    constructor(astNode: ASTNode, public readonly condition: ExpressionNode, public readonly rhs: ExpressionNode) {
      super(astNode, rhs);
    }

    get childrenOrEmpty() {
      return [...super.childrenOrEmpty, this.condition];
    }
  }

  export class MatchCaseIsNode extends MatcherNode {
    deconstructorNames?: NameIdentifierNode[];
    resolvedFunctionType?: FunctionType;

    constructor(astNode: ASTNode, public readonly typeReference: ReferenceNode, public rhs: ExpressionNode) {
      super(astNode, rhs);
    }

    get childrenOrEmpty() {
      return [...super.childrenOrEmpty, this.typeReference, ...(this.deconstructorNames || [])];
    }
  }

  export class MatchLiteralNode extends MatcherNode {
    resolvedFunctionType?: FunctionType;

    constructor(astNode: ASTNode, public readonly literal: LiteralNode<any>, public readonly rhs: ExpressionNode) {
      super(astNode, rhs);
    }

    get childrenOrEmpty() {
      return [...super.childrenOrEmpty, this.literal];
    }
  }

  export class UnionTypeNode extends TypeNode {
    of: TypeNode[] = [];

    get childrenOrEmpty() {
      return this.of;
    }
  }

  export class IntersectionTypeNode extends TypeNode {
    of: TypeNode[] = [];

    get childrenOrEmpty() {
      return this.of || [];
    }
  }

  export class StructDeclarationNode extends TypeNode {
    isPublic: boolean = true;
    constructor(
      astNode: ASTNode,
      public readonly declaredName: NameIdentifierNode,
      public readonly parameters: ParameterNode[]
    ) {
      super(astNode);
    }

    get childrenOrEmpty() {
      return [this.declaredName, ...(this.parameters || [])];
    }
  }

  export class EffectDeclarationNode extends Node {
    elements?: FunctionTypeNode[];

    constructor(astNode: ASTNode, public readonly name: NameIdentifierNode) {
      super(astNode);
    }

    get childrenOrEmpty() {
      return [this.name, ...(this.elements || [])];
    }
  }

  export class MatchDefaultNode extends MatcherNode {}

  export class PatternMatcherNode extends ExpressionNode {
    constructor(astNode: ASTNode, public readonly lhs: ExpressionNode, public readonly matchingSet: MatcherNode[]) {
      super(astNode);
    }

    get childrenOrEmpty() {
      return [this.lhs, ...(this.matchingSet || [])];
    }
  }

  export class LoopNode extends ExpressionNode {
    constructor(astNode: ASTNode, public readonly body: ExpressionNode) {
      super(astNode);
    }

    get childrenOrEmpty() {
      return [this.body];
    }
  }

  export class ContinueNode extends Node {
    get childrenOrEmpty() {
      return [];
    }
  }

  export class BreakNode extends Node {
    get childrenOrEmpty() {
      return [];
    }
  }
}

export function findNodesByType<T>(
  astRoot: { children: any[] },
  type: { new (...args: any[]): T },
  list: T[] = []
): T[] {
  if (astRoot instanceof type) {
    list.push(astRoot);
  }
  astRoot.children.forEach($ => findNodesByType($, type, list));
  return list;
}

export function findNodesByTypeInChildren<T>(
  astRoot: { children: any[] },
  type: { new (...args: any[]): T },
  list: T[] = []
): T[] {
  astRoot.children.forEach($ => {
    if ($ instanceof type) {
      list.push($);
    }
  });
  return list;
}
