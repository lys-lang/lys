import { Nodes } from './nodes';
import { Reference } from './Reference';
import { ParsingContext } from './ParsingContext';
import { AstNodeError } from './NodeError';

export type ReferenceType = 'TYPE' | 'VALUE' | 'FUNCTION';

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

    if (this.nameHint && (this.nameHint.endsWith('#') || this.nameHint.endsWith('.'))) {
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
      throw new AstNodeError(`"${localName}" is already declared`, nameNode);
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
