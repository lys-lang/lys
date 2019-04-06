import { TypeGraph, TypeNode, Edge } from './TypeGraph';
import { Closure } from '../Closure';
import { Nodes } from '../nodes';
import { Type } from '../types';
import { TypeGraphBuilder } from './TypeGraphBuilder';
import { ParsingContext } from '../ParsingContext';
import { MessageCollector } from '../MessageCollector';

function top<T>(stack: Array<T>): T | null {
  if (stack.length) {
    return stack[stack.length - 1];
  }
  return null;
}

export class TypeResolutionContext {
  /**
   * Returns the current executor that is being used for execution of the graph
   *
   * @return
   */
  get currentExecutor(): TypePropagator {
    return top(this._executors)!.propagator;
  }

  /**
   * Returns the graph that is being currently under execution
   *
   * @return
   */
  get currentGraph(): TypeGraph {
    return top(this._executors)!.dataGraph;
  }

  /**
   * Return the
   *
   * @return
   */
  get currentScopeNavigator(): Closure {
    return top(this._executors)!.scope;
  }

  get currentParsingContext(): ParsingContext {
    return top(this._executors)!.parsingContext;
  }
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

  constructor(public rootGraph: TypeGraph, public parsingContext: ParsingContext) {}

  newExecutorWithContext(scope: Closure, dataGraph: TypeGraph, parsingContext: ParsingContext): TypePropagator {
    const propagator: TypePropagator = new TypePropagator(this);
    this._executors.push({ dataGraph, propagator, scope, parsingContext });
    return propagator;
  }

  endContext(): void {
    this._executors.pop();
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
    const ret = this._functionSubGraphs.find($ => $.functionNode === functionNode);
    if (!ret) return null;
    return ret.list;
  }

  removeFunctionSubGraph(functionNode: Nodes.FunctionNode, parameterTypes: Array<Type>, _graph: TypeGraph): void {
    const x = this.getFunctionGraph(functionNode);
    if (x) {
      const theFn = x.findIndex(graph => graph.graph === _graph || this.matches(graph.seq, parameterTypes));
      if (theFn === -1) {
        throw new Error('Could not delete function subgraph');
      }
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

  private matches(expected: Array<Type>, actual: Array<Type>): boolean {
    if (expected.length === actual.length) {
      return !expected.some((type, $$) => !type.equals(actual[$$]));
    } else {
      return false;
    }
  }
}

export class TypePropagator {
  executionStack: Array<TypeNode> = [];
  constructor(public ctx: TypeResolutionContext) {}

  scheduleNode(node: TypeNode): void {
    if (!this.executionStack.some(n => n === node)) {
      this.executionStack.push(node);
    }
  }

  run(): void {
    try {
      this.scheduleNodes();
      this.start();
    } finally {
      this.ctx.endContext();
    }
  }

  private start(): void {
    while (this.executionStack.length !== 0) {
      const nodeToExecute = this.executionStack.shift();
      nodeToExecute!.execute(this.ctx);
    }
  }

  private scheduleNodes(): void {
    this.ctx.currentGraph.nodes.forEach(node => {
      if (node.allDependenciesResolved()) {
        this.scheduleNode(node);
      } else {
        const incomingEdges = node.incomingEdges();

        if (incomingEdges.some($ => $.crossGraphEdge())) {
          const crossGraph = incomingEdges.filter(edge => edge.crossGraphEdge());
          crossGraph.forEach($ => this.scheduleDependencies($, []));
        }
      }
    });
  }

  private scheduleDependencies(edge: Edge, stack: Array<TypeNode>): void {
    if (!edge.incomingTypeDefined()) {
      if (edge.source.resultType()) {
        edge.propagateType(edge.source.resultType()!, this.ctx);
      } else if (edge.source.incomingEdges().length === 0) {
        this.scheduleNode(edge.source);
      } else {
        if (!stack.includes(edge.source)) {
          stack.push(edge.source);
          edge.source.incomingEdges().forEach(incomingEdge => {
            // Avoid self reference loop
            if (incomingEdge.source !== edge.target) {
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
}

export function resolveReturnType(
  typeGraph: TypeGraph,
  functionNode: Nodes.FunctionNode,
  argTypes: Type[],
  ctx: TypeResolutionContext
): Type | null {
  const subGraph = ctx.getFunctionSubGraph(functionNode, argTypes);

  if (subGraph) {
    const result = subGraph.findNode(functionNode.body!)!.resultType();

    return result;
  } else {
    const context = ctx.currentParsingContext;
    const messageCollector = new MessageCollector();

    const dataGraph: TypeGraph = new TypeGraphBuilder(context, typeGraph, messageCollector).buildFunctionNode(
      functionNode,
      argTypes
    );

    ctx.addFunctionSubGraph(functionNode, argTypes, dataGraph);
    const functionName = functionNode.functionName!.internalIdentifier + '(' + argTypes.join(',') + ')';
    ctx.rootGraph.addSubGraph(dataGraph, functionName);
    const propagator = ctx.newExecutorWithContext(functionNode.closure!, dataGraph, context);

    try {
      propagator.run();
    } catch (e) {
      context.messageCollector.error(e, functionNode);
    }

    const value = dataGraph.findNode(functionNode.body!);

    if (value) {
      const result = value.resultType();

      if (!result && messageCollector.hasErrors()) {
        ctx.removeFunctionSubGraph(functionNode, argTypes, dataGraph);
        ctx.rootGraph.removeSubGraph(dataGraph, functionName);
      } else {
        context.messageCollector.mergeWith(messageCollector);
      }
      return result;
    }

    return null;
  }
}

export function resolveNode(node: Nodes.Node, ctx: TypeResolutionContext): Type | null {
  if (node.ofType) {
    return node.ofType;
  }

  const graphName = 'expression';
  const context = ctx.currentParsingContext;
  const messageCollector = new MessageCollector();

  const dataGraph: TypeGraph = ctx.currentGraph.createNameResolverFor(node);

  ctx.rootGraph.addSubGraph(dataGraph, graphName);
  const propagator = ctx.newExecutorWithContext(node.closure!, dataGraph, context);
  propagator.run();

  const value = dataGraph.findNode(node);

  if (value) {
    const result = value.resultType();

    if (!result && messageCollector.hasErrors()) {
      ctx.rootGraph.removeSubGraph(dataGraph, graphName);
    } else {
      context.messageCollector.mergeWith(messageCollector);
    }

    return result;
  }

  return null;
}
