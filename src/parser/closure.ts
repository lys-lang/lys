import { Nodes } from './nodes';
import { AstNodeError } from './NodeError';
import { ScopePhaseResult } from './phases/scopePhase';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { SemanticPhaseResult } from './phases/semanticPhase';
import { CanonicalPhaseResult } from './phases/canonicalPhase';
import { ParsingPhaseResult } from './phases/parsingPhase';
import { TypePhaseResult } from './phases/typePhase';
import { CompilationPhaseResult } from './phases/compilationPhase';
import { assert } from 'console';

export interface IDictionary<T> {
  [key: string]: T;
}

export interface IOverloadedInfix {
  [operator: string]: {
    [lhs: number]: {
      [rhs: number]: {
        fn: Nodes.FunDirectiveNode;
        directive: Nodes.DirectiveNode;
        executionContext: ParsingContext;
      };
    };
  };
}

export class ParsingContext {
  messageCollector = new MessageCollector();

  private typeNumbers = new Set<Nodes.StructDeclarationNode | Nodes.TypeDeclarationNode>();
  private programTakenNames = new Set<string>();
  private modulesInContext: string[] = [];
  private moduleScopes = new Map<string, ScopePhaseResult>();
  private moduleTypes = new Map<string, TypePhaseResult>();
  private moduleCompilation = new Map<string, CompilationPhaseResult>();

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

  registerTypeDeclaration(typeDecl: Nodes.TypeDeclarationNode) {
    if (this.typeNumbers.has(typeDecl)) return;
    assert(!typeDecl.typeNumber, `type ${typeDecl} already had a number`);
    typeDecl.typeNumber = this.typeNumbers.size + 1;
    this.typeNumbers.add(typeDecl);
  }

  registerType(struct: Nodes.StructDeclarationNode) {
    if (struct.parent instanceof Nodes.TypeDeclarationNode) {
      this.registerTypeDeclaration(struct.parent);
    }

    if (this.typeNumbers.has(struct)) return;
    assert(!struct.typeNumber, `type ${struct} already had a number`);
    struct.typeNumber = this.typeNumbers.size + 1;
    struct.internalIdentifier = this.getUnusedName(struct.declaredName.name + 'Type');
    this.typeNumbers.add(struct);
  }

  parseModule(moduleName: string) {
    const modulePath = this.resolveModule(moduleName);

    if (!modulePath) {
      throw new Error(`Cannot find module ${moduleName}`);
    }

    const content = readFileSync(modulePath);

    const parsing = new ParsingPhaseResult(modulePath, content.toString(), this);
    const canonical = new CanonicalPhaseResult(parsing);
    const semantic = new SemanticPhaseResult(canonical, moduleName);
    const scope = new ScopePhaseResult(semantic);

    this.moduleScopes.set(moduleName, scope);
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
  errors: AstNodeError[] = [];

  error(error: AstNodeError);
  error(message: string, node: Nodes.Node);
  error(error: string | AstNodeError, node?: Nodes.Node) {
    if (error instanceof AstNodeError) {
      if (!this.errors.some($ => $.message == error.message && $.node == error.node)) {
        this.errors.push(error);
      }
    } else {
      if (!this.errors.some($ => $.message == error && $.node == node)) {
        this.errors.push(new AstNodeError(error, node));
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
  nameMappings: IDictionary<Reference> = {};
  localUsages: IDictionary<number> = {};

  importedModules = new Map<string, Set<string>>();

  constructor(
    public parsingContext: ParsingContext,
    public parent: Closure = null,
    public readonly moduleName: string = null
  ) {}

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
    }

    return this.parsingContext.getUnusedName(`${this.moduleName ? this.moduleName + '::' : ''}${prefix}`);
  }

  incrementUsage(name: string) {
    const reference = this.get(name);
    this.localUsages[name] = (this.localUsages[name] || 0) + 1;
    reference.usages++;
  }

  incrementUsageQName(name: Nodes.QNameNode) {
    this.incrementUsage(name.text);
  }

  set(nameNode: Nodes.NameIdentifierNode) {
    const localName = nameNode.name;

    if (localName === '_') return;

    if (localName in this.localUsages && this.localUsages[localName] > 0) {
      throw new Error(`Cannot reasign ${localName} because it was used`);
    }

    if (this.localScopeDeclares.has(localName)) {
      throw new Error(`"${localName}" is already declared`);
    }

    this.nameMappings[localName] = new Reference(nameNode, this, null);

    this.localScopeDeclares.add(localName);

    return this.nameMappings[localName];
  }

  canResolveName(localName: string) {
    try {
      return !!this.get(localName);
    } catch {
      return false;
    }
  }

  canResolveQName(qname: Nodes.QNameNode) {
    return this.canResolveName(qname.text);
  }

  getQName(qname: Nodes.QNameNode): Reference {
    return this.get(qname.text);
  }

  get(localName: string): Reference {
    if (localName in this.nameMappings) {
      return this.nameMappings[localName];
    }

    if (localName.includes('::')) {
      const parts = localName.split('::');
      const moduleName = parts.slice(0, -1).join('::');
      const name = parts[parts.length - 1];
      const ref = this.parsingContext.getScopePhase(moduleName).document.closure.get(name);

      return ref.withModule(moduleName);
    }

    for (let [moduleName, importsSet] of this.importedModules) {
      if (importsSet.has(localName)) {
        const ref = this.parsingContext.getScopePhase(moduleName).document.closure.get(localName);

        return ref.withModule(moduleName);
      } else if (
        importsSet.has('*') &&
        this.parsingContext.getScopePhase(moduleName).document.closure.canResolveName(localName)
      ) {
        const ref = this.parsingContext.getScopePhase(moduleName).document.closure.get(localName);

        return ref.withModule(moduleName);
      }
    }

    if (this.parent && this.parent.canResolveName(localName)) {
      return this.parent.get(localName);
    }

    if (localName in this.nameMappings) {
      return this.nameMappings[localName];
    }

    throw new Error('Cannot resolve name "' + localName + '"');
  }

  inspect(content: string = '') {
    let localContent = `Scope:\n${Object.keys(this.nameMappings)
      .map($ => 'let ' + $)
      .join('\n')
      .replace(/^(.*)/gm, '  $1')}`;

    if (content) {
      localContent = localContent + `\n${content.replace(/^(.*)/gm, '  $1')}`;
    }

    if (this.parent) {
      return this.parent.inspect(localContent);
    } else {
      return localContent;
    }
    return (
      'Closure [' +
      '\n  ' +
      Object.keys(this.nameMappings)
        .map($ => 'let ' + $)
        .join('\n  ') +
      '\n  parent = ' +
      (this.parent ? '\n' + this.parent.inspect().replace(/^(.*)/gm, '    $1') : 'null') +
      '\n]'
    );
  }

  newChildClosure(): Closure {
    return new Closure(this.parsingContext, this, this.moduleName);
  }
}

export class Reference {
  usages = 0;

  constructor(
    public readonly referencedNode: Nodes.NameIdentifierNode,
    public readonly scope: Closure,
    public readonly moduleSource: string | null = null
  ) {}

  get isLocalReference(): boolean {
    return !this.moduleSource;
  }

  withModule(moduleName: string) {
    return new Reference(this.referencedNode, this.scope, moduleName);
  }
}
