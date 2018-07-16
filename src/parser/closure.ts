import { Nodes } from './nodes';

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
  programTakenNames = new Set<string>();

  errors: Error[] = [];

  error(message: string, node: Nodes.Node) {
    this.errors.push(Object.assign(new Error(message), { node }));
  }

  warning(message: string, node: Nodes.Node) {
    this.errors.push(Object.assign(new Error(message), { node }));
  }
}

export class Closure {
  localsMap: Map<Nodes.Node, number> = new Map();

  localScopeDeclares: Set<string> = new Set();
  nameMappings: IDictionary<Reference> = {};
  localUsages: IDictionary<number> = {};

  constructor(public parsingContext: ParsingContext, public parent: Closure = null) {
    if (parent) {
      Object.assign(this.nameMappings, parent.nameMappings);
    }
  }

  getInternalIdentifier(node: Nodes.Node) {
    let prefix = 'identifier_';

    if (node instanceof Nodes.FunctionNode) {
      prefix = node.functionName.name || 'anonFun';
    }

    let i = 0;
    while (true) {
      const newName = i ? `${prefix}${i}` : prefix;
      if (!this.parsingContext.programTakenNames.has(newName)) {
        this.parsingContext.programTakenNames.add(newName);
        return newName;
      }
      i++;
    }
  }

  incrementUsage(name: string) {
    const x = this.get(name);
    this.localUsages[name] = (this.localUsages[name] || 0) + 1;
    x.usages++;
  }

  set(nameNode: Nodes.NameIdentifierNode, valueNode: Nodes.ExpressionNode) {
    const localName = nameNode.name;

    if (localName in this.localUsages && this.localUsages[localName] > 0) {
      throw new Error(`Cannot reasign ${localName} because it was used`);
    }

    if (this.localScopeDeclares.has(localName)) {
      throw new Error(`"${localName}" is already declared`);
    }

    this.nameMappings[localName] = new Reference(nameNode, this, null, valueNode);

    this.localScopeDeclares.add(localName);

    return this.nameMappings[localName];
  }

  canResolveName(localName: string) {
    return localName in this.nameMappings;
  }

  get(localName: string): Reference {
    if (localName in this.nameMappings) {
      return this.nameMappings[localName];
    }

    throw new Error('Cannot resolve name "' + localName + '"');
  }

  inspect() {
    return (
      'Closure [' +
      '\n  ' +
      Object.keys(this.nameMappings).join('\n  ') +
      '\n  parent = ' +
      (this.parent ? '\n' + this.parent.inspect().replace(/^(.*)/gm, '    $1') : 'null') +
      '\n]'
    );
  }

  newChildClosure(): Closure {
    return new Closure(this.parsingContext, this);
  }
}

export class Reference {
  usages = 0;

  constructor(
    public referencedNode: Nodes.NameIdentifierNode,
    public scope: Closure,
    public moduleSource: Nodes.NameIdentifierNode = null,
    public valueNode: Nodes.ExpressionNode
  ) {}

  get isLocalReference(): boolean {
    return !!this.moduleSource;
  }
}
