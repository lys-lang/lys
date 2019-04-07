import { Nodes, PhaseFlags } from './nodes';
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
    public readonly moduleName: string,
    public parent: Closure | null = null,
    public nameHint: string = ''
  ) {
    this.name = this.parsingContext.getInternalName(moduleName, nameHint + '[child_scope]');
  }

  registerForeginModule(moduleName: string) {
    if (moduleName && !this.importedModules.has(moduleName)) {
      this.importedModules.set(moduleName, new Set<string>());
    }
    return this.importedModules.get(moduleName);
  }

  registerImport(moduleName: string, names: Set<string>) {
    const mod = this.registerForeginModule(moduleName);
    if (!mod) throw new Error('ModuleNotFound:' + moduleName);
    names.forEach($ => mod.add($));
  }

  getInternalIdentifier(node: Nodes.NameIdentifierNode) {
    let prefix = node.name;

    if (this.nameHint && (this.nameHint.endsWith('#') || this.nameHint.endsWith('.'))) {
      prefix = this.nameHint + prefix;
    }

    return this.parsingContext.getInternalName(this.moduleName, prefix);
  }

  incrementUsage(name: string) {
    const reference = this.get(name, true);
    this.localUsages[name] = (this.localUsages[name] || 0) + 1;
    reference.usages++;
  }

  incrementUsageQName(name: Nodes.QNameNode) {
    this.incrementUsage(name.text);
  }

  set(nameNode: Nodes.NameIdentifierNode, type: ReferenceType): Reference | null {
    const localName = nameNode.name;

    if (localName === '_') return null;

    if (this.localScopeDeclares.has(localName)) {
      throw new AstNodeError(`"${localName}" is already declared`, nameNode);
    }

    this.nameMappings[localName] = new Reference(nameNode, this, type, null);

    this.localScopeDeclares.add(localName);

    if (!nameNode.internalIdentifier) {
      nameNode.internalIdentifier = this.getInternalIdentifier(nameNode);
    }

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
        const moduleDocument = this.parsingContext.getPhase(moduleName, PhaseFlags.NameInitialization);
        const ref = moduleDocument.closure!.get(name, recurseParent);

        return ref.withModule(moduleName);
      }

      if (this.parent && this.parent.canResolveName(localName, recurseParent)) {
        return this.parent.get(localName, recurseParent);
      }

      for (let [moduleName, importsSet] of this.importedModules) {
        const moduleDocument = this.parsingContext.getPhase(moduleName, PhaseFlags.NameInitialization);

        if (importsSet.has(localName)) {
          const ref = moduleDocument.closure!.get(localName, recurseParent);

          return ref.withModule(moduleName);
        } else if (importsSet.has('*') && moduleDocument.closure!.canResolveName(localName, recurseParent)) {
          const ref = moduleDocument.closure!.get(localName, recurseParent);

          return ref.withModule(moduleName);
        }
      }
    }

    throw new Error("Cannot find name '" + localName + "'");
  }

  inspect(content: string = '') {
    let imports = '';

    if (this.importedModules.size) {
      imports = '\n';
      this.importedModules.forEach(($, moduleName) => {
        let names: string[] = [];
        $.forEach($ => names.push($));
        imports = imports + '  import ' + names.join(',') + ' from ' + moduleName + '\n';
      });
    }

    let localContent = `${this.name}: {${imports}\n${Object.keys(this.nameMappings)
      .map($ => 'let ' + $)
      .join('\n')
      .replace(/^(.*)/gm, '  $1')}`;

    if (content) {
      localContent = localContent + `\n${content.toString().replace(/^(.*)/gm, '  $1')}`;
    }

    return localContent + '\n}';
  }

  deepInspect(): string {
    return this.inspect(this.childrenScopes.map($ => $.deepInspect()).join('\n'));
  }

  newChildClosure(nameHint: string): Closure {
    const newScope = new Closure(this.parsingContext, this.moduleName, this, nameHint);
    this.childrenScopes.push(newScope);
    return newScope;
  }
}
