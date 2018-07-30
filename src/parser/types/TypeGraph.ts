import { Nodes } from '../nodes';
import { Type } from '../types';
import { TypeResolutionContext } from './TypePropagator';

export abstract class TypeResolver {
  abstract execute(node: TypeNode, ctx: TypeResolutionContext): Type | null;
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
    if (this.allDependenciesResolved()) {
      if (this.amount < this.MAX_ATTEMPTS) {
        this.amount = this.amount + 1;
        let resultType: Type | null = this.typeResolver.execute(this, ctx);

        if (resultType) {
          if (!this.resultType() || !resultType.equals(this.astNode.ofType)) {
            // We only add one if the type is new
            const newType = resultType;
            // this.astNode instanceof Nodes.VariableReferenceNode ? toConcreteType(resultType, ctx) : resultType;

            this.astNode.ofType = newType;
          }

          this._outgoingEdges.forEach(edge => {
            edge.propagateType(this.astNode.ofType, ctx);
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
    this._outgoingEdges = this._outgoingEdges.filter($ => $ != edge);
  }

  removeIncomingEdge(edge: Edge): void {
    this._incomingEdges = this._incomingEdges.filter($ => $ != edge);
  }

  allDependenciesResolved(): boolean {
    return (
      this.incomingEdges().length == 0 ||
      this.typeResolver instanceof LiteralTypeResolver ||
      !this.incomingEdges().some($ => !$.incomingTypeDefined())
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
  private _error: boolean | null = null;

  constructor(public source: TypeNode, public target: TypeNode, public label: string = '') {
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
