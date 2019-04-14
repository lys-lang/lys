import { Nodes, PhaseFlags } from './nodes';
import { Reference } from './Reference';
import { ParsingContext } from './ParsingContext';
import { AstNodeError } from './NodeError';
import { indent } from '../utils/astPrinter';

export type ReferenceType = 'TYPE' | 'VALUE' | 'FUNCTION';

export class Closure {
  localScopeDeclares: Set<string> = new Set();
  exportedNames: Set<string> = new Set();
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
    return this.importedModules.get(moduleName)!;
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

    prefix = prefix.replace(/([^A-Za-z:0-9_\.<>!+*^&%$@~/=|-])/g, '_');

    return this.parsingContext.getInternalName(this.moduleName, prefix);
  }

  incrementUsage(name: string) {
    const reference = this.get(name);
    this.localUsages[name] = (this.localUsages[name] || 0) + 1;
    reference.usages++;
  }

  incrementUsageQName(name: Nodes.QNameNode) {
    this.incrementUsage(name.text);
  }

  set(nameNode: Nodes.NameIdentifierNode, type: ReferenceType, exported: boolean): Reference | null {
    const localName = nameNode.name;

    if (localName === '_') return null;

    if (this.localScopeDeclares.has(localName)) {
      throw new AstNodeError(`"${localName}" is already declared`, nameNode);
    }

    this.nameMappings[localName] = new Reference(nameNode, this, type, null);

    if (exported) {
      this.exportedNames.add(localName);
    }

    this.localScopeDeclares.add(localName);

    if (!nameNode.internalIdentifier) {
      nameNode.internalIdentifier = this.getInternalIdentifier(nameNode);
    }

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

  canGetFromOutside(localName: string) {
    return this.exportedNames.has(localName);
  }

  getFromOutside(localName: string): Reference | null {
    if (!this.canGetFromOutside(localName)) {
      throw new Error(`Name ${localName} is private in module ${this.name}`);
    }
    if (localName in this.nameMappings) {
      return this.nameMappings[localName];
    }
    return null;
  }

  get(localName: string): Reference {
    if (localName in this.nameMappings) {
      return this.nameMappings[localName];
    }

    if (localName.includes('::')) {
      const parts = localName.split('::');
      const moduleName = parts.slice(0, -1).join('::');
      const name = parts[parts.length - 1];
      const moduleDocument = this.parsingContext.getPhase(moduleName, PhaseFlags.NameInitialization);
      const ref = moduleDocument.closure!.getFromOutside(name);
      if (ref) {
        this.registerForeginModule(moduleName);
        return ref.withModule(moduleName);
      }
    }

    if (this.parent && this.parent.canResolveName(localName)) {
      return this.parent.get(localName);
    }

    for (let [moduleName, importsSet] of this.importedModules) {
      const moduleDocument = this.parsingContext.getPhase(moduleName, PhaseFlags.NameInitialization);

      if (importsSet.has(localName)) {
        const ref = moduleDocument.closure!.getFromOutside(localName);
        if (ref) {
          return ref.withModule(moduleName);
        }
      } else if (importsSet.has('*') && moduleDocument.closure!.canGetFromOutside(localName)) {
        const ref = moduleDocument.closure!.getFromOutside(localName);
        if (ref) {
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

  inspectExportedNames(voidIfEmpty = false) {
    let exportedNames: string[] = [];

    this.exportedNames.forEach($ => exportedNames.push('let ' + $));

    this.childrenScopes.forEach($ => {
      const ret = $.inspectExportedNames(true);
      if (ret.trim().length) {
        exportedNames.push(ret);
      }
    });

    if (!exportedNames.length && voidIfEmpty) return '';

    return `${this.name}: {\n${indent(exportedNames.join('\n'))}\n}`;
  }

  newChildClosure(nameHint: string): Closure {
    const newScope = new Closure(this.parsingContext, this.moduleName, this, nameHint);
    this.childrenScopes.push(newScope);
    return newScope;
  }
}
