import { Nodes } from '../nodes';
import { Type, toConcreteType } from '../types';
import { TypeResolutionContext } from './TypePropagator';
import { TypeMismatch } from '../NodeError';

function exists<T>(set: Array<T>, delegate: (T) => boolean): boolean {
  if (set.length == 0) return false;

  for (let entry of set) {
    if (delegate(entry)) return true;
  }

  return false;
}

export abstract class TypeResolver {
  abstract execute(node: TypeNode, ctx: TypeResolutionContext): Type | null;

  supportsPartialResolution(): boolean {
    return false;
  }
}

export class LiteralTypeResolver extends TypeResolver {
  constructor(public type: Type) {
    super();
  }
  execute(_0, _1) {
    return this.type;
  }
}

export class TypeGraph {
  private _subGraph: Map<TypeGraph, string> = new Map();

  constructor(public nodes: Array<TypeNode>, public parentGraph: TypeGraph = null) {
    //Set Parent to the children
    nodes.forEach($ => ($.parentGraph = this));
  }

  get rootGraph(): TypeGraph {
    return this.parentGraph;
  }

  addSubGraph(subGraph: TypeGraph, name: string): void {
    this._subGraph.set(subGraph, name);
  }

  removeSubGraph(subGraph: TypeGraph, name: string): void {
    this._subGraph.forEach(($, $$) => {
      if ($ == name && $$ == subGraph) {
        this._subGraph.delete($$);
      }
    });
  }

  get subGraphs() {
    return this._subGraph;
  }

  findNode(astNode: Nodes.Node): TypeNode | null {
    return (
      this.nodes.find(node => node.astNode == astNode) ||
      (this.parentGraph && this.parentGraph.findNode(astNode)) ||
      null
    );
  }

  findNodeInSubGraphs(astNode: Nodes.Node): TypeNode | null {
    let ret = this.findNode(astNode);
    if (!ret) {
      const sg = this.subGraphs.entries();
      for (let x of sg) {
        const foundNode = x[0].findNodeInSubGraphs(astNode);
        if (foundNode) {
          ret = foundNode;
          break;
        }
      }
      return ret;
    }
    return ret;
  }
}

export class TypeNode {
  constructor(public astNode: Nodes.Node, public typeResolver: TypeResolver) {
    if (!astNode) {
      throw new Error('empty astNode');
    }
  }

  private MAX_ATTEMPTS = 5;
  private _outgoingEdges: Array<Edge> = [];
  private _incomingEdges: Array<Edge> = [];
  private amount = 0;

  parentGraph: TypeGraph | null = null;

  execute(ctx: TypeResolutionContext): void {
    if (this.typeResolver.supportsPartialResolution() || this.allDependenciesResolved()) {
      if (this.amount < this.MAX_ATTEMPTS) {
        this.amount = this.amount + 1;
        let resultType: Type | null = this.typeResolver.execute(this, ctx);

        if (resultType) {
          if (!this.resultType() || !resultType.equals(this.astNode.ofType)) {
            // We only add one if the type is new
            const newType =
              this.astNode instanceof Nodes.VariableReferenceNode ? toConcreteType(resultType, ctx) : resultType;

            this.astNode.ofType = newType;

            this._outgoingEdges.forEach(edge => {
              edge.propagateType(newType, ctx);
            });
          }
        }
      } else {
        ctx.parsingContext.warning(
          `Unable to infer type as recursion didn't stabilize after ${this.MAX_ATTEMPTS} attempts.`,
          this.astNode
        );
      }
    }
  }

  removeOutputEdge(edge: Edge): void {
    this._outgoingEdges = this._outgoingEdges.filter($ => $ != edge);
  }

  removeIncomingEdge(edge: Edge): void {
    this._incomingEdges = this._incomingEdges.filter($ => $ != edge);
  }

  allDependenciesResolved(): boolean {
    return (
      this.incomingEdges().length == 0 ||
      this.typeResolver instanceof LiteralTypeResolver ||
      !exists(this.incomingEdges(), $ => !$.incomingTypeDefined())
    );
  }

  resultType(): Type | null {
    return this.astNode.ofType || null;
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
    return this._incomingEdges.filter(edge => edge.label == label);
  }
}

export class Edge {
  private _incomingType: Type | null = null;
  private _error = false;

  constructor(
    public source: TypeNode,
    public target: TypeNode,
    public label: string = '',
    public expected: Type | null = null
  ) {
    source.addOutgoingEdge(this);
    target.addIncomingEdge(this);
  }

  /**
   * If this node has an error or not
   * @return
   */
  error(): boolean {
    return this._error;
  }

  /**
   * If this edge is cross different graphs
   *
   * @return
   */
  crossGraphEdge(): boolean {
    return this.source.parentGraph != this.target.parentGraph;
  }

  remove(): void {
    this.source.removeOutputEdge(this);
    this.target.removeIncomingEdge(this);
  }

  propagateType(actualType: Type, ctx: TypeResolutionContext): void {
    actualType = toConcreteType(actualType, ctx);

    if (this.expected) {
      const expectedType: Type = toConcreteType(this.expected, ctx);

      if (!actualType.canBeAssignedTo(expectedType)) {
        this._error = true;
        this._incomingType = actualType;
        ctx.parsingContext.error(new TypeMismatch(actualType, expectedType, this.source.astNode));
      } else {
        this._incomingType = actualType;
        ctx.currentExecutor.scheduleNode(this.target);
      }
    } else {
      this._incomingType = actualType;
      ctx.currentExecutor.scheduleNode(this.target);
    }
  }

  mayBeIncomingType(): Type | null {
    return this._incomingType;
  }

  incomingType(): Type | null {
    if (!this._incomingType) throw new Error('Type not defined');
    return this._incomingType;
  }

  incomingTypeDefined(): boolean {
    return !!this._incomingType;
  }
}
