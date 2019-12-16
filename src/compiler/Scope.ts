import { Nodes, PhaseFlags } from './nodes';
import { Reference } from './Reference';
import { ParsingContext } from './ParsingContext';
import { LysScopeError } from './NodeError';
import { indent } from '../utils/astPrinter';
import { TypeHelpers } from './types';

export type ReferenceType = 'TYPE' | 'VALUE' | 'FUNCTION' | 'TRAIT';

export class Scope {
  localScopeDeclares: Set<string> = new Set();
  exportedNames: Set<string> = new Set();
  nameMappings: Record<string, Reference> = {};
  localUsages: Record<string, number> = {};

  importedModules = new Map<string, Set<string>>();

  childrenScopes: Scope[] = [];

  readonly name: string;

  constructor(
    public parsingContext: ParsingContext,
    public readonly moduleName: string,
    public parent: Scope | null = null,
    public nameHint: string = ''
  ) {
    this.name = this.parsingContext.getInternalName(moduleName, nameHint + '[child_scope]');
  }

  isDescendantOf(parentScope: Scope): boolean {
    if (this.parent) {
      if (parentScope === this.parent) {
        return true;
      }
      return this.parent.isDescendantOf(parentScope);
    }
    return false;
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
      throw new LysScopeError(`"${localName}" is already declared`, nameNode);
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
    } catch (e) {
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
    if (localName in this.nameMappings) {
      if (!this.canGetFromOutside(localName)) {
        throw new Error(`Name "${localName}" is private in module "${this.moduleName}"`);
      }
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
      const ref = moduleDocument.scope!.getFromOutside(name);
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
        const ref = moduleDocument.scope!.getFromOutside(localName);
        if (ref) {
          return ref.withModule(moduleName);
        }
      } else if (importsSet.has('*') && moduleDocument.scope!.canGetFromOutside(localName)) {
        const ref = moduleDocument.scope!.getFromOutside(localName);
        if (ref) {
          return ref.withModule(moduleName);
        }
      }
    }

    throw new Error("Cannot find name '" + localName + "'");
  }

  inspect(voidIfEmpty = false, includePrivate = false) {
    let ret: string[] = [];

    for (let name in this.nameMappings) {
      const ref = this.nameMappings[name];
      const type = TypeHelpers.getNodeType(ref.referencedNode);

      if (includePrivate || this.exportedNames.has(name)) {
        const priv = this.exportedNames.has(name) ? '' : 'private ';
        const typeStr = type ? ': ' + type.inspect(10) : '';

        ret.push(priv + 'let ' + name + typeStr);
      }
    }

    this.importedModules.forEach((set, $) => {
      let list: string[] = [];
      set.forEach($ => list.push($));
      ret.push('import ' + $ + '::{' + list.join(', ') + '}');
    });

    this.childrenScopes.forEach($ => {
      const childScope = $.inspect(true, includePrivate);
      if (childScope.trim().length) {
        ret.push(childScope);
      }
    });

    if (!ret.length && voidIfEmpty) return '';

    return `${this.name}: {\n${indent(ret.join('\n'))}\n}`;
  }

  newChildScope(nameHint: string): Scope {
    const newScope = new Scope(this.parsingContext, this.moduleName, this, nameHint);
    this.childrenScopes.push(newScope);
    return newScope;
  }
}
