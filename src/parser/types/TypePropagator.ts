import { TypeGraph, TypeNode, Edge } from './TypeGraph';
import { ParsingContext, Closure } from '../closure';
import { Nodes } from '../nodes';
import { Type } from '../types';

function top<T>(stack: Array<T>): T | null {
  if (stack.length) {
    return stack[stack.length - 1];
  }
  return null;
}

export class TypeResolutionContext {
  constructor(public rootGraph: TypeGraph) {}

  private _executors = new Array<{
    dataGraph: TypeGraph;
    propagator: TypePropagator;
    scope: Closure;
    parsingContext: ParsingContext;
  }>();

  private _functionSubGraphs = new Array<{
    functionNode: Nodes.FunctionNode;
    list: Array<{ seq: Array<Type>; graph: TypeGraph }>;
  }>();

  error(message: string, node: TypeNode): void {
    node.astNode.errors.push(new Error(message));
  }

  warning(message: string, node: TypeNode): void {
    node.astNode.errors.push(new Error(message));
  }

  newExecutorWithContext(scope: Closure, dataGraph: TypeGraph, parsingContext: ParsingContext): TypePropagator {
    const propagator: TypePropagator = new TypePropagator(this);
    this._executors.push({ dataGraph, propagator, scope, parsingContext });
    return propagator;
  }

  endContext(): void {
    this._executors.pop();
  }

  /**
   * Returns the current executor that is being used for execution of the graph
   *
   * @return
   */
  get currentExecutor(): TypePropagator {
    return top(this._executors).propagator;
  }

  /**
   * Returns the graph that is being currently under execution
   *
   * @return
   */
  get currentGraph(): TypeGraph {
    return top(this._executors).dataGraph;
  }

  /**
   * Return the
   *
   * @return
   */
  get currentScopeNavigator(): Closure {
    return top(this._executors).scope;
  }

  get currentParsingContext(): ParsingContext {
    return top(this._executors).parsingContext;
  }

  getFunctionSubGraph(functionNode: Nodes.FunctionNode, parameterTypes: Array<Type>): TypeGraph | null {
    const x = this.getFunctionGraph(functionNode);
    if (x) {
      return x.find(graph => this.matches(graph.seq, parameterTypes)).graph;
    }
    return null;
  }

  getFunctionGraph(functionNode: Nodes.FunctionNode): null | Array<{ seq: Array<Type>; graph: TypeGraph }> {
    return this._functionSubGraphs.find($ => $.functionNode == functionNode).list;
  }

  private matches(expected: Array<Type>, actual: Array<Type>): boolean {
    if (expected.length == actual.length) {
      return !expected.some((type, $$) => !type.equals(actual[$$]));
    } else {
      return false;
    }
  }

  // removeFunctionSubGraph(functionNode: Nodes.FunctionNode, parameterTypes: Array<Type>): void {
  //   const x = this.getFunctionGraph(functionNode)
  //   if(x){
  //  //   x.find((graph) => this.matches(graph.seq, parameterTypes)).map((function) => x.-=(function))
  //   }

  // }

  // addFunctionSubGraph(functionNode: Nodes.FunctionNode, parameterTypes: Seq[Type], graph: TypeGraph): void {
  //   getFunctionGraph(functionNode) match {
  //     case Some(x) => {
  //       x.+=((parameterTypes, graph))
  //     }
  //     case None => {
  //       const tuple = (functionNode, ListBuffer((parameterTypes, graph)))
  //       _functionSubGraphs.+=(tuple)
  //     }
  //   }
  // }
}

export class TypePropagator {
  executionStack: Array<TypeNode> = [];
  constructor(public ctx: TypeResolutionContext) {}

  scheduleNode(node: TypeNode): void {
    if (!this.executionStack.some(n => n == node)) this.executionStack.push(node);
  }

  private start(): void {
    while (this.executionStack.length !== 0) {
      const nodeToExecute = this.executionStack.pop();
      nodeToExecute.execute(this.ctx);
    }
  }

  private scheduleNodes(): void {
    this.ctx.currentGraph.nodes.forEach(node => {
      const incomingEdges = node.incomingEdges();
      if (node.allDependenciesResolved()) {
        this.scheduleNode(node);
      } else if (incomingEdges.some($ => $.crossGraphEdge())) {
        const crossGraph = incomingEdges.filter(edge => edge.crossGraphEdge());
        crossGraph.forEach($ => this.scheduleDependencies($, []));
      }
    });
  }

  private scheduleDependencies(edge: Edge, stack: Array<TypeNode>): void {
    if (!edge.incomingTypeDefined()) {
      if (edge.source.resultType()) {
        edge.propagateType(edge.source.resultType(), this.ctx);
      } else if (edge.source.incomingEdges().length == 0) {
        this.scheduleNode(edge.source);
      } else {
        if (!stack.includes(edge.source)) {
          stack.push(edge.source);
          edge.source.incomingEdges().forEach(incomingEdge => {
            //Avoid self reference loop
            if (incomingEdge.source != edge.target) {
              this.scheduleDependencies(incomingEdge, stack);
            }
          });
          stack.pop();
        }
      }
    } else {
      this.ctx.currentExecutor.scheduleNode(edge.target);
    }
  }

  run(): void {
    this.scheduleNodes();
    this.start();
    this.ctx.endContext();
  }
}
