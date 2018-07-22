import { TypeGraph, TypeNode, Edge } from './TypeGraph';
import { ParsingContext, Closure } from '../closure';
import { Nodes } from '../nodes';
import { Type } from '../types';
import { TypeGraphBuilder } from './TypeGraphBuilder';

function top<T>(stack: Array<T>): T | null {
  if (stack.length) {
    return stack[stack.length - 1];
  }
  return null;
}

export class TypeResolutionContext {
  constructor(public rootGraph: TypeGraph, public parsingContext: ParsingContext) {}

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
      const ret = x.find(graph => this.matches(graph.seq, parameterTypes));
      if (!ret) return null;
      return ret.graph;
    }
    return null;
  }

  getFunctionGraph(functionNode: Nodes.FunctionNode): null | Array<{ seq: Array<Type>; graph: TypeGraph }> {
    const ret = this._functionSubGraphs.find($ => $.functionNode == functionNode);
    if (!ret) return null;
    return ret.list;
  }

  private matches(expected: Array<Type>, actual: Array<Type>): boolean {
    if (expected.length == actual.length) {
      return !expected.some((type, $$) => !type.equals(actual[$$]));
    } else {
      return false;
    }
  }

  removeFunctionSubGraph(functionNode: Nodes.FunctionNode, parameterTypes: Array<Type>, _graph: TypeGraph): void {
    const x = this.getFunctionGraph(functionNode);
    if (x) {
      const theFn = x.findIndex(graph => this.matches(graph.seq, parameterTypes));
      x.splice(theFn, 1);
    }
  }

  addFunctionSubGraph(functionNode: Nodes.FunctionNode, parameterTypes: Type[], graph: TypeGraph): void {
    const x = this.getFunctionGraph(functionNode);

    if (x) {
      x.push({ seq: parameterTypes, graph });
    } else {
      this._functionSubGraphs.push({
        functionNode,
        list: [{ seq: parameterTypes, graph }]
      });
    }
  }
}

export class TypePropagator {
  executionStack: Array<TypeNode> = [];
  constructor(public ctx: TypeResolutionContext) {}

  scheduleNode(node: TypeNode): void {
    if (!this.executionStack.some(n => n == node)) {
      this.executionStack.push(node);
    }
  }

  private start(): void {
    while (this.executionStack.length !== 0) {
      const nodeToExecute = this.executionStack.pop();
      nodeToExecute.execute(this.ctx);
    }
  }

  private scheduleNodes(): void {
    this.ctx.currentGraph.nodes.forEach(node => {
      if (!node.allDependenciesResolved()) {
        const incomingEdges = node.incomingEdges();

        if (incomingEdges.some($ => $.crossGraphEdge())) {
          const crossGraph = incomingEdges.filter(edge => edge.crossGraphEdge());
          crossGraph.forEach($ => this.scheduleDependencies($, []));
        }
      }
    });
    this.ctx.currentGraph.nodes.forEach(node => {
      if (node.allDependenciesResolved()) {
        this.scheduleNode(node);
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

export function resolveReturnType(
  typeGraph: TypeGraph,
  functionNode: Nodes.FunctionNode,
  argTypes: Type[],
  returnType: Type | null,
  ctx: TypeResolutionContext
): Type | null {
  const subGraph: TypeGraph = ctx.getFunctionSubGraph(functionNode, argTypes);

  if (subGraph) {
    return subGraph.findNode(functionNode).resultType();
  } else {
    const context = ctx.currentParsingContext;

    const dataGraphBuilder = new TypeGraphBuilder(ctx.parsingContext, typeGraph, returnType);

    const dataGraph: TypeGraph = dataGraphBuilder.buildFunctionNode(functionNode, argTypes);

    ctx.addFunctionSubGraph(functionNode, argTypes, dataGraph);
    const functionName = functionNode.functionName.name + '(' + argTypes.join(',') + ')';
    ctx.rootGraph.addSubGraph(dataGraph, functionName);
    ctx.newExecutorWithContext(functionNode.closure, dataGraph, context).run();
    const value = dataGraph.findNode(functionNode);

    const result = value.resultType();

    // if (result && ctx.parsingContext.hasErrors()) {
    //   ctx.removeFunctionSubGraph(functionNode, argTypes, dataGraph);
    //   ctx.rootGraph.removeSubGraph(dataGraph, functionName);
    // }

    return result;
  }
}
