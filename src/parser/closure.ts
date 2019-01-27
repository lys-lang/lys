import { Nodes } from './nodes';
import { AstNodeError, PositionCapableError, IErrorPositionCapable } from './NodeError';
import { ScopePhaseResult } from './phases/scopePhase';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { SemanticPhaseResult } from './phases/semanticPhase';
import { CanonicalPhaseResult } from './phases/canonicalPhase';
import { ParsingPhaseResult } from './phases/parsingPhase';
import { TypePhaseResult } from './phases/typePhase';
import { CompilationPhaseResult } from './phases/compilationPhase';
import { assert } from 'console';
import { TypeGraph } from './types/TypeGraph';

export type ReferenceType = 'TYPE' | 'VALUE' | 'FUNCTION';

export class ParsingContext {
  messageCollector = new MessageCollector();

  private typeNumbers = new Set<Nodes.TypeDirectiveNode>();
  private programTakenNames = new Set<string>();
  private modulesInContext: string[] = [];
  private moduleScopes = new Map<string, ScopePhaseResult>();
  private moduleTypes = new Map<string, TypePhaseResult>();
  private moduleCompilation = new Map<string, CompilationPhaseResult>();
  public registeredParsingPhase = new Map<string, ParsingPhaseResult>();

  public typeGraph = new TypeGraph([], null);

  private ensureModule(moduleName: string) {
    if (!this.modulesInContext.includes(moduleName)) {
      this.modulesInContext.push(moduleName);
      this.parseModule(moduleName);
    }
  }

  reset() {
    this.typeNumbers.clear();
    this.programTakenNames.clear();
    this.messageCollector.errors.length = 0;
  }

  private resolveModule(moduleName: string) {
    const relative = moduleName.replace(/::/g, '/') + '.ro';

    let x = resolve(process.cwd(), relative);

    if (existsSync(x)) {
      return x;
    }

    x = resolve(process.cwd(), 'stdlib', relative);

    if (existsSync(x)) {
      return x;
    }

    return null;
  }

  getUnusedName(prefix: string): string {
    let i = 0;
    while (true) {
      const newName = `${prefix}${i ? '_' + i : ''}`;
      if (!this.programTakenNames.has(newName)) {
        this.programTakenNames.add(newName);
        return newName;
      }
      i++;
    }
  }

  registerType(struct: Nodes.TypeDirectiveNode) {
    if (this.typeNumbers.has(struct)) return;
    assert(!struct.typeDeterminant, `type ${struct} already had a number`);
    struct.typeDeterminant = this.typeNumbers.size + 1;
    if (!struct.variableName.internalIdentifier) {
      struct.variableName.internalIdentifier = this.getUnusedName(struct.variableName.name + 'Type');
    }
    this.typeNumbers.add(struct);
  }

  parseModule(moduleName: string) {
    const modulePath = this.resolveModule(moduleName);

    if (!modulePath) {
      throw new Error(`Cannot find module ${moduleName}`);
    }

    const parsing = this.getParsingPhaseForFile(modulePath);

    const canonical = new CanonicalPhaseResult(parsing);
    const semantic = new SemanticPhaseResult(canonical, moduleName);
    const scope = new ScopePhaseResult(semantic);

    this.moduleScopes.set(moduleName, scope);
  }

  getParsingPhaseForFile(fileName: string) {
    if (this.registeredParsingPhase.has(fileName)) {
      return this.registeredParsingPhase.get(fileName);
    } else {
      const content = readFileSync(fileName).toString();
      return this.getParsingPhaseForContent(fileName, content);
    }
  }

  getParsingPhaseForContent(fileName: string, content: string) {
    const parsing = new ParsingPhaseResult(fileName, content, this, true);
    this.registeredParsingPhase.set(fileName, parsing);
    parsing.execute();
    return parsing;
  }

  getScopePhase(moduleName: string): ScopePhaseResult {
    this.ensureModule(moduleName);

    const x = this.moduleScopes.get(moduleName);

    if (x) {
      return x;
    }
  }

  getTypePhase(moduleName: string): TypePhaseResult {
    this.ensureModule(moduleName);

    let typePhaseResult = this.moduleTypes.get(moduleName);

    if (!typePhaseResult) {
      typePhaseResult = new TypePhaseResult(this.moduleScopes.get(moduleName));
      this.moduleTypes.set(moduleName, typePhaseResult);
      typePhaseResult.execute();
    }

    return typePhaseResult;
  }

  getCompilationPhase(moduleName: string): CompilationPhaseResult {
    this.getTypePhase(moduleName);

    let compilationPhaseResult = this.moduleCompilation.get(moduleName);

    if (!compilationPhaseResult) {
      compilationPhaseResult = new CompilationPhaseResult(this.moduleTypes.get(moduleName));
      this.moduleCompilation.set(moduleName, compilationPhaseResult);
    }

    return compilationPhaseResult;
  }
}

export class MessageCollector {
  errors: IErrorPositionCapable[] = [];

  error(error: IErrorPositionCapable);
  error(message: string, node: Nodes.Node);
  error(error: string | Error, node?: Nodes.Node) {
    if (error instanceof AstNodeError || error instanceof PositionCapableError) {
      if (
        error instanceof PositionCapableError ||
        !this.errors.some($ => $.message == error.message && $.node == error.node)
      ) {
        this.errors.push(error);
      }
    } else {
      if (!this.errors.some($ => $.message == error && $.node == node)) {
        const err = new AstNodeError(error.toString(), node);
        if (error instanceof Error && error.stack) {
          err.stack = error.stack;
        }

        this.errors.push(err);
      }
    }
  }

  warning(message: string, node: Nodes.Node) {
    if (!this.errors.some($ => $.message == message && $.node == node)) {
      this.errors.push(new AstNodeError(message, node, true));
    }
  }

  hasErrorFor(node: Nodes.Node): any {
    return this.errors.some($ => $.node === node);
  }

  hasErrorForBranch(node: Nodes.Node): any {
    return this.errors.some($ => $.node === node) || node.children.some($ => this.hasErrorForBranch($));
  }

  hasErrors() {
    return this.errors.some($ => !$.warning);
  }

  /**
   * Takes the content of other message collector into this instance. The other instance will be purged.
   * @param otherMessageCollector
   */
  mergeWith(otherMessageCollector: MessageCollector) {
    this.errors = this.errors.concat(otherMessageCollector.errors);
    otherMessageCollector.errors.length = 0;
  }
}

export class Closure {
  localScopeDeclares: Set<string> = new Set();
  nameMappings: Record<string, Reference> = {};
  localUsages: Record<string, number> = {};

  importedModules = new Map<string, Set<string>>();

  childrenScopes: Closure[] = [];

  readonly name: string;

  constructor(
    public parsingContext: ParsingContext,
    public parent: Closure = null,
    public readonly moduleName: string = null,
    public nameHint: string = ''
  ) {
    this.name = this.parsingContext.getUnusedName(nameHint + '_scope');
  }

  registerForeginModule(moduleName: string) {
    if (moduleName && !this.importedModules.has(moduleName)) {
      this.importedModules.set(moduleName, new Set<string>());
    }
    return this.importedModules.get(moduleName);
  }

  registerImport(moduleName: string, names: Set<string>) {
    const mod = this.registerForeginModule(moduleName);
    names.forEach($ => mod.add($));
  }

  getInternalIdentifier(node: Nodes.Node) {
    let prefix = '__identifier';

    if (node instanceof Nodes.FunctionNode) {
      prefix = node.functionName.name || 'anonFun';
    } else if (node instanceof Nodes.StructDeclarationNode) {
      prefix = node.declaredName.name || 'anonType';
    } else if (node instanceof Nodes.NameIdentifierNode) {
      prefix = node.name || 'anonName';
    }

    if (this.nameHint && this.nameHint.endsWith('#')) {
      prefix = this.nameHint + prefix;
    }

    return this.parsingContext.getUnusedName(`${this.moduleName ? this.moduleName + '::' : ''}${prefix}`);
  }

  incrementUsage(name: string) {
    const reference = this.get(name, true);
    this.localUsages[name] = (this.localUsages[name] || 0) + 1;
    reference.usages++;
  }

  incrementUsageQName(name: Nodes.QNameNode) {
    this.incrementUsage(name.text);
  }

  set(nameNode: Nodes.NameIdentifierNode, type: ReferenceType) {
    const localName = nameNode.name;

    if (localName === '_') return;

    if (this.localScopeDeclares.has(localName)) {
      throw new Error(`"${localName}" is already declared`);
    }

    this.nameMappings[localName] = new Reference(nameNode, this, type, null);

    this.localScopeDeclares.add(localName);

    return this.nameMappings[localName];
  }

  canResolveName(localName: string, recurseParent: boolean) {
    try {
      return !!this.get(localName, recurseParent);
    } catch {
      return false;
    }
  }

  canResolveQName(qname: Nodes.QNameNode, recurseParent: boolean) {
    return this.canResolveName(qname.text, recurseParent);
  }

  getQName(qname: Nodes.QNameNode, recurseParent: boolean): Reference {
    return this.get(qname.text, recurseParent);
  }

  get(localName: string, recurseParent: boolean): Reference {
    if (localName in this.nameMappings) {
      return this.nameMappings[localName];
    }

    if (recurseParent) {
      if (localName.includes('::')) {
        const parts = localName.split('::');
        const moduleName = parts.slice(0, -1).join('::');
        const name = parts[parts.length - 1];
        const ref = this.parsingContext.getScopePhase(moduleName).document.closure.get(name, recurseParent);

        return ref.withModule(moduleName);
      }

      if (this.parent && this.parent.canResolveName(localName, recurseParent)) {
        return this.parent.get(localName, recurseParent);
      }

      for (let [moduleName, importsSet] of this.importedModules) {
        if (importsSet.has(localName)) {
          const ref = this.parsingContext.getScopePhase(moduleName).document.closure.get(localName, recurseParent);

          return ref.withModule(moduleName);
        } else if (
          importsSet.has('*') &&
          this.parsingContext.getScopePhase(moduleName).document.closure.canResolveName(localName, recurseParent)
        ) {
          const ref = this.parsingContext.getScopePhase(moduleName).document.closure.get(localName, recurseParent);

          return ref.withModule(moduleName);
        }
      }
    }

    throw new Error('Cannot resolve name "' + localName + '"');
  }

  inspect(content: string = '') {
    let localContent = `Scope ${this.name}:\n${Object.keys(this.nameMappings)
      .map($ => 'let ' + $)
      .join('\n')
      .replace(/^(.*)/gm, '  $1')}`;

    if (content) {
      localContent = localContent + `\n${content.toString().replace(/^(.*)/gm, '  $1')}`;
    }

    return localContent;
  }

  deepInspect() {
    return this.inspect(this.childrenScopes.map($ => $.deepInspect()).join('\n'));
  }

  newChildClosure(nameHint: string): Closure {
    const newScope = new Closure(this.parsingContext, this, this.moduleName, nameHint);
    this.childrenScopes.push(newScope);
    return newScope;
  }
}

export class Reference {
  usages = 0;

  constructor(
    public readonly referencedNode: Nodes.NameIdentifierNode,
    public readonly scope: Closure,
    public readonly type: ReferenceType,
    public readonly moduleName: string | null = null
  ) {}

  /** Returns true if the reference points to a declaration in the same module */
  get isLocalReference(): boolean {
    return !this.moduleName;
  }

  /** Returns a copy of the reference with the moduleSource set */
  withModule(moduleName: string) {
    return new Reference(this.referencedNode, this.scope, this.type, moduleName);
  }

  toString() {
    if (this.isLocalReference) {
      return this.referencedNode.toString();
    } else {
      return this.moduleName + '::' + this.referencedNode.toString();
    }
  }
}
