import { StringCodeWriter } from './StringCodeWriter';
import { TypeGraph, Edge, TypeNode } from '../compiler/types/TypeGraph';
import { Nodes } from '../compiler/nodes';

export function print(rootGraph: TypeGraph): string {
  const documents = new Set<string | void>();

  function findDocuments(graph: TypeGraph) {
    graph.nodes.forEach(node => {
      const document = (node.astNode.astNode && node.astNode.astNode.document) || void 0;
      documents.add(document);
    });
    graph.subGraphs.forEach((_, graph) => {
      findDocuments(graph);
    });
  }

  findDocuments(rootGraph);

  const writer: StringCodeWriter = new StringCodeWriter();

  writer.println(`digraph LYS {`);
  writer.indent();
  writer.println('  node [shape=box,fontsize=10];');

  const printedNodes = getPrintedNodes(rootGraph);

  documents.forEach(document => {
    printDocument(writer, rootGraph, document, printedNodes, rootGraph);
  });

  function printGraphEdges(graph: TypeGraph) {
    printEdges(writer, graph, printedNodes, rootGraph);
    graph.subGraphs.forEach((_, graph) => {
      printGraphEdges(graph);
    });
  }

  printGraphEdges(rootGraph);

  writer.printIndent();
  writer.println('label="LYS";');
  writer.dedent();
  writer.println('}');

  resetPrint(rootGraph);

  return writer.codeContent();
}

function printDocument(
  writer: StringCodeWriter,
  graph: TypeGraph,
  document: string | void,
  printedNodes: Set<TypeNode>,
  rootGraph: TypeGraph
) {
  const cluster = JSON.stringify('cluster_' + (document || '<no-document>'));
  const label = JSON.stringify(document || '<no-document>');
  writer.printIndent();
  writer.println(`subgraph ${cluster} {`);
  writer.indent();

  const nodesToPrint = graph.nodes.filter(
    $ => (!$.astNode.astNode && !document) || ($.astNode.astNode && $.astNode.astNode.document === document)
  );

  nodesToPrint.forEach(node => {
    printNode(writer, node, printedNodes, rootGraph);
  });

  let i = 0;

  function printSubGraph(str: string, graph: TypeGraph) {
    const nodesToPrint = graph.nodes.filter(
      $ => (!$.astNode.astNode && !document) || ($.astNode.astNode && $.astNode.astNode.document === document)
    );

    if (nodesToPrint.length === 0 && graph.subGraphs.size === 0) return;

    writer.printIndent();
    writer.println(`subgraph ${JSON.stringify('cluster_' + (document || '<no-document>') + '_' + i)} { rankdir=TB;`);
    i++;
    writer.indent();
    writer.printIndent();
    writer.println('node [style=filled, fillcolor=grey];');
    nodesToPrint.forEach(node => {
      printNode(writer, node, printedNodes, rootGraph);
    });
    writer.printIndent();
    writer.println('label="' + (str || '').replace(/"/g, "'") + '";');
    writer.dedent();
    writer.printIndent();
    writer.println('}');

    graph.subGraphs.forEach(printSubGraph);
  }

  graph.subGraphs.forEach(printSubGraph);

  writer.printIndent();
  writer.println(`label=${label};`);
  writer.dedent();
  writer.printIndent();
  writer.println('}');
}

function printEdges(
  writer: StringCodeWriter,
  graph: TypeGraph,
  printedNodes: Set<TypeNode>,
  rootGraph: TypeGraph
): void {
  graph.nodes.forEach(node => {
    if (!printedNodes.has(node)) {
      printNode(writer, node, printedNodes, rootGraph);
    }

    node.outgoingEdges().forEach(edge => {
      if (!printedNodes.has(edge.source)) {
        printNode(writer, edge.source, printedNodes, rootGraph);
      }

      if (!printedNodes.has(edge.target)) {
        printNode(writer, edge.target, printedNodes, rootGraph);
      }

      writer.printIndent();
      writer.print(`${id(edge.source, rootGraph)} -> ${id(edge.target, rootGraph)}`);
      const color = edge.error() === null ? 'blue' : edge.error() === true ? 'red' : 'black';

      writer.println(
        '[taillabel=' +
          '"' +
          edgeLabel(edge).replace(/"/g, "'") +
          '"' +
          ' fontsize=7 fontname="times" color="' +
          color +
          '" ];'
      );
    });
  });
}

function printNode(writer: StringCodeWriter, node: TypeNode, printedNodes: Set<TypeNode>, rootGraph: TypeGraph) {
  if (!printedNodes.has(node)) {
    writer.printIndent();
    let label = nodeLabel(node) + (node.resultType() ? '\\n' + node.resultType()!.inspect(100) : '');

    let color = 'grey';

    if (node.amount > node.MAX_ATTEMPTS / 10) {
      label = label + '\nAmount: ' + node.amount.toString();
      color = 'magenta';
    }

    writer.println(
      `${id(node, rootGraph)} [label="${label.replace(/"/g, "'")}", fillcolor=${color}${
        !node.resultType() ? ', color=red' : ''
      }];`
    );
    printedNodes.add(node);
  }
}

export function edgeLabel(edge: Edge): string {
  if (edge.incomingTypeDefined()) {
    return `[${edge.label}]`;
  } else {
    if (!edge.label) {
      return 'Not Defined';
    } else {
      return `[${edge.label}]`;
    }
  }
}

function nodeLabel(node: TypeNode): string {
  if (node.astNode instanceof Nodes.ReferenceNode) {
    return `Ref: ${node.astNode.variable.text}`;
  } else if (node.astNode instanceof Nodes.NameIdentifierNode) {
    return `Name: ${node.astNode.name}`;
  } else if (node.astNode instanceof Nodes.BinaryExpressionNode) {
    return `BinOp: ${node.astNode.operator.name}`;
  } else if (node.astNode instanceof Nodes.UnaryExpressionNode) {
    return `Unary: ${node.astNode.operator.name}`;
  } else if (node.astNode instanceof Nodes.IntegerLiteral) {
    return `Int: ${node.astNode.value}`;
  } else if (node.astNode instanceof Nodes.FloatLiteral) {
    return `Float: ${node.astNode.value.toFixed(5)}`;
  } else if (node.astNode instanceof Nodes.ValDeclarationNode) {
    return `ValDecl: ${node.astNode.variableName.name}`;
  } else if (node.astNode instanceof Nodes.VarDeclarationNode) {
    return `VarDecl: ${node.astNode.variableName.name}`;
  } else if (node.astNode instanceof Nodes.OverloadedFunctionNode) {
    return `FunOverload: ${node.astNode.functionName.name}`;
  } else if (node.astNode instanceof Nodes.FunctionNode) {
    return `FunNode: ${node.astNode.functionName.name}`;
  } else if (node.astNode instanceof Nodes.TypeDirectiveNode) {
    return `TypeDirective: ${node.astNode.variableName.name}`;
  } else if (node.astNode instanceof Nodes.FunDirectiveNode) {
    return `!!! FunDirective: ${node.astNode.functionNode.functionName.name}`;
  }
  return node.astNode ? node.astNode.nodeName : '<no node>';
}

const idSymbol = Symbol('id');
const printedSymbol = Symbol('printed');

export function resetPrint(typeGraph: TypeGraph) {
  const parentTypeGraph = typeGraph.rootGraph as any;

  parentTypeGraph[idSymbol] = new Map();
  parentTypeGraph[printedSymbol] = new Set();
}

export function getPrintedNodes(typeGraph: TypeGraph): Set<TypeNode> {
  const parentTypeGraph = typeGraph.rootGraph as any;

  return parentTypeGraph[printedSymbol] || (parentTypeGraph[printedSymbol] = new Set());
}

export function id(node: TypeNode, typeGraph: TypeGraph): string {
  const parentTypeGraph = typeGraph.rootGraph as any;

  let map: Map<TypeNode, string>;

  if (parentTypeGraph[idSymbol]) {
    map = parentTypeGraph[idSymbol];
  } else {
    map = parentTypeGraph[idSymbol] = new Map();
  }

  if (!map.has(node)) {
    map.set(node, (map.size + 1).toString());
  }

  return map.get(node)!;
}
