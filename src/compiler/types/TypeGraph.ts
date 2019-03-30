import { Nodes } from '../nodes';
import { Type } from '../types';
import { TypeResolutionContext } from './TypePropagator';
import { AstNodeError } from '../NodeError';
import { ParsingContext } from '../ParsingContext';

export abstract class TypeResolver {
  abstract execute(node: TypeNode, ctx: TypeResolutionContext): Type | null;
}

export class LiteralTypeResolver extends TypeResolver {
  constructor(public type: Type) {
    super();
  }
  execute() {
    return this.type;
  }
}

export class TypeGraph {
  private _subGraph: Map<TypeGraph, string> = new Map();
  private uniqueIdCounter = 0;

  constructor(public nodes: Array<TypeNode>, public parentGraph: TypeGraph | null) {
    // Set Parent to the children
    nodes.forEach($ => ($.parentGraph = this));

    if (parentGraph) {
      parentGraph.addSubGraph(this, 'child');
    }
  }

  get rootGraph(): TypeGraph {
    let typeGraph: TypeGraph = this;

    while (typeGraph.parentGraph) {
      typeGraph = typeGraph.parentGraph;
    }

    return typeGraph;
  }

  addSubGraph(subGraph: TypeGraph, name: string): void {
    this._subGraph.set(subGraph, name);
  }

  getNewSubgraphId() {
    if (!this.parentGraph) {
      this.uniqueIdCounter += 1;
      return this.uniqueIdCounter;
    } else {
      return this.rootGraph.getNewSubgraphId;
    }
  }

  removeSubGraph(subGraph: TypeGraph, name: string): void {
    this._subGraph.forEach(($, $$) => {
      if ($ === name && $$ === subGraph) {
        this._subGraph.delete($$);
      }
    });
  }

  get subGraphs() {
    return this._subGraph;
  }

  createNameResolverFor(node: Nodes.Node): TypeGraph {
    const nodes: TypeNode[] = [];

    function traverseUp(base: TypeNode) {
      if (!nodes.includes(base)) {
        if (!base.resultType()) {
          nodes.push(base);

          base
            .incomingEdges()
            .map($ => $.source)
            .forEach(traverseUp);
        }
      }
    }

    const base = this.rootGraph.findNodeInAllGraphs(node);

    if (!base) {
      throw new Error('cannot find node ' + node);
    }

    traverseUp(base[0]);

    return new TypeGraph(nodes, this);
  }

  findNode(astNode: Nodes.Node): TypeNode | null {
    return (
      this.nodes.find(node => node.astNode === astNode) ||
      (this.parentGraph && this.parentGraph.findNode(astNode)) ||
      null
    );
  }

  findNodeInAllGraphs(astNode: Nodes.Node): [TypeNode, TypeGraph] | null {
    const local = this.nodes.find(node => node.astNode === astNode);

    if (local) {
      return [local, this];
    }

    for (let [childGraph] of this.subGraphs) {
      const childResult = childGraph.findNodeInAllGraphs(astNode);
      if (childResult) {
        return childResult;
      }
    }

    return null;
  }
}

export class TypeNode {
  public readonly MAX_ATTEMPTS = 50;

  amount: number = 0;

  parentGraph: TypeGraph | null = null;
  private _outgoingEdges: Array<Edge> = [];
  private _incomingEdges: Array<Edge> = [];
  private succeed: boolean = false;
  constructor(public astNode: Nodes.Node, public typeResolver: TypeResolver) {
    if (!astNode) {
      throw new Error('empty astNode');
    }
  }

  execute(ctx: TypeResolutionContext): void {
    if (this.allDependenciesResolved()) {
      if (this.amount < this.MAX_ATTEMPTS) {
        this.amount = this.amount + 1;

        if (!this.succeed) {
          let newType: Type | null = this.typeResolver.execute(this, ctx);

          if (!(newType instanceof Type)) {
            console.log(this.typeResolver.constructor.name + ' did not return a type', newType);
            return;
          }

          const currentType = this.resultType();

          if (!currentType || !newType.equals(currentType)) {
            if (currentType) {
              ctx.parsingContext.messageCollector.error(
                `${this.typeResolver.constructor.name}: Mutating type ${currentType.inspect(10)} -> ${newType.inspect(
                  10
                )} .equals = ${currentType.equals(newType)} .equals2 = ${newType.equals(
                  currentType
                )} == = ${currentType === newType}`,
                this.astNode
              );
            }

            this.succeed = true;
            // We only add one if the type is new
            this.astNode.ofType = newType;
          }
        }

        if (this.succeed) {
          this._outgoingEdges.forEach(edge => {
            edge.propagateType(this.resultType()!, ctx);
          });
        }
      } else {
        ctx.parsingContext.messageCollector.warning(
          `Unable to infer type as recursion didn't stabilize after ${this.MAX_ATTEMPTS} attempts.`,
          this.astNode
        );
      }
    }
  }

  removeOutputEdge(edge: Edge): void {
    this._outgoingEdges = this._outgoingEdges.filter($ => $ !== edge);
  }

  removeIncomingEdge(edge: Edge): void {
    this._incomingEdges = this._incomingEdges.filter($ => $ !== edge);
  }

  allDependenciesResolved(): boolean {
    return (
      this.incomingEdges().length === 0 ||
      this.typeResolver instanceof LiteralTypeResolver ||
      !this.incomingEdges().some($ => !$.incomingTypeDefined())
    );
  }

  resultType(): Type | null {
    if (this.succeed) {
      return this.astNode.ofType || null;
    } else {
      return null;
    }
  }

  addOutgoingEdge(edge: Edge): void {
    this._outgoingEdges.push(edge);
  }

  addIncomingEdge(edge: Edge): void {
    this._incomingEdges.push(edge);
  }

  outgoingEdges(): Array<Edge> {
    return this._outgoingEdges;
  }

  incomingEdges(): Array<Edge> {
    return this._incomingEdges;
  }

  incomingEdgesByName(label: string): Array<Edge> {
    return this._incomingEdges.filter(edge => edge.label === label);
  }
}

export class Edge {
  private _incomingType: Type | null = null;
  private _error: boolean | null = null;

  private constructor(public source: TypeNode, public target: TypeNode, public label: string = '') {
    source.addOutgoingEdge(this);
    target.addIncomingEdge(this);
  }

  static addEdge(ctx: ParsingContext, source: TypeNode, target: TypeNode, label: string = '') {
    if (source.outgoingEdges().some($ => $.target === target)) {
      ctx.messageCollector.error(new AstNodeError('duplicated edge in source', source.astNode));
    }

    if (target.incomingEdges().some($ => $.source === source)) {
      ctx.messageCollector.error(new AstNodeError('duplicated edge in target', target.astNode));
    }

    if (source.incomingEdges().some($ => $.source === target)) {
      ctx.messageCollector.error(new AstNodeError('crossed edges are not allowed 1', source.astNode));
    }

    if (target.outgoingEdges().some($ => $.target === source)) {
      ctx.messageCollector.error(new AstNodeError('crossed edges are not allowed 2', target.astNode));
    }

    // tslint:disable-next-line:no-unused-expression
    new Edge(source, target, label);

    const recStack: TypeNode[] = [];

    if (this.isCyclic(target, new Set(), recStack)) {
      const id = ctx.messageCollector.errors.length.toString(36);

      ctx.messageCollector.error(new AstNodeError(`Cyclic dependency #${id} origin`, source.astNode));
      ctx.messageCollector.error(new AstNodeError(`Cyclic dependency #${id} target`, target.astNode));
    }
  }

  private static isCyclic(node: TypeNode, visited: Set<TypeNode>, recStack: Array<TypeNode>) {
    // Mark the current node as visited and
    // part of recursion stack
    if (recStack.includes(node)) return true;
    if (visited.has(node)) return false;

    visited.add(node);

    recStack.push(node);

    for (let child of node.incomingEdges()) {
      if (this.isCyclic(child.source, visited, recStack)) {
        return true;
      }
    }

    recStack.pop();

    return false;
  }

  /**
   * If this node has an error or not
   * @return
   */
  error(): boolean | null {
    return this._error;
  }

  /**
   * If this edge is cross different graphs
   *
   * @return
   */
  crossGraphEdge(): boolean {
    return this.source.parentGraph !== this.target.parentGraph;
  }

  remove(): void {
    this.source.removeOutputEdge(this);
    this.target.removeIncomingEdge(this);
  }

  propagateType(actualType: Type, ctx: TypeResolutionContext): void {
    this._error = false;
    this._incomingType = actualType;
    ctx.currentExecutor.scheduleNode(this.target);
  }

  mayBeIncomingType(): Type | null {
    return this._incomingType;
  }

  incomingType(): Type | null {
    if (!this._incomingType) {
      throw new Error('Type not defined');
    }
    return this._incomingType;
  }

  incomingTypeDefined(): boolean {
    return !!this._incomingType;
  }
}
