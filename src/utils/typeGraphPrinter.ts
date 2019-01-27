import { StringCodeWriter } from './StringCodeWriter';
import { TypeGraph, Edge, TypeNode } from '../parser/types/TypeGraph';
import { Nodes } from '../parser/nodes';

export function print(graph: TypeGraph, code: string = '', name: string = 'Document'): string {
  const writer: StringCodeWriter = new StringCodeWriter();
  writer.println(`digraph ${name.replace(/"/g, "'")} {`);
  writer.indent();
  writer.println('  node [shape=box,fixedsize=shape fontsize=10]');
  printNodes(writer, graph);

  let i = 0;
  graph.subGraphs.forEach((str, graph) => {
    writer.printIndent();
    writer.println(`subgraph cluster${i.toString().replace(/"/g, "'")} {`);
    i++;
    writer.indent();
    writer.printIndent();
    writer.println('node [style=filled, fillcolor=grey];');
    printNodes(writer, graph);
    printEdges(writer, graph);
    writer.dedent();
    writer.printIndent();
    writer.println('label = "' + str.replace(/"/g, "'") + '";');
    writer.println('}');
  });

  printEdges(writer, graph);
  writer.printIndent();
  writer.println('label="' + code.replace(/"/g, "'") + '";');
  writer.dedent();
  writer.println('}');

  resetPrint(graph);

  return writer.codeContent();
}

export function printEdges(writer: StringCodeWriter, graph: TypeGraph): void {
  graph.nodes.forEach(node => {
    node.outgoingEdges().forEach(edge => {
      writer.printIndent();
      writer.print(`${id(edge.source, graph)} -> ${id(edge.target, graph)}`);
      const color = edge.error() == null ? 'blue' : edge.error() == true ? 'red' : 'black';

      writer.println(
        '[taillabel=' +
          '"' +
          edgeLabel(edge).replace(/"/g, "'") +
          '"' +
          ' labeldistance="1" fontname="times  italic" fontsize = 10 color="' +
          color +
          '" ];'
      );
    });
  });
}

export function printNodes(writer: StringCodeWriter, graph: TypeGraph) {
  const printedNodes = getPrintedNodes(graph);
  graph.nodes.forEach(node => {
    if (!printedNodes.has(node)) {
      writer.printIndent();
      let label = nodeLabel(node) + (node.resultType() ? '\\n' + node.resultType().inspect(100) : '');

      let color = 'grey';

      if (node.amount > node.MAX_ATTEMPTS / 10) {
        label = label + '\nAmount: ' + node.amount.toString();
        color = 'magenta';
      }

      writer.println(
        `${id(node, graph)} [label="${label.replace(/"/g, "'")}", fillcolor=${color}${
          !node.resultType() ? ', color=red' : ''
        }];`
      );
      printedNodes.add(node);
    }
  });
}

export function edgeLabel(edge: Edge): string {
  if (edge.incomingTypeDefined()) {
    return '';
  } else {
    if (!edge.label) {
      return 'Not Defined';
    } else {
      return `[${edge.label}]`;
    }
  }
}

export function nodeLabel(node: TypeNode): string {
  if (node.astNode instanceof Nodes.ReferenceNode) {
    return `Ref: ${node.astNode.variable.text}`;
  } else if (node.astNode instanceof Nodes.NameIdentifierNode) {
    return `Name: ${node.astNode.name}`;
  } else if (node.astNode instanceof Nodes.BinaryExpressionNode) {
    return `BinOp: ${node.astNode.operator.text}`;
  } else if (node.astNode instanceof Nodes.UnaryExpressionNode) {
    return `Unary: ${node.astNode.operator.text}`;
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
  return node.astNode ? node.astNode.nodeName + node.astNode.text : '<no node>';
}

const idSymbol = Symbol('id');
const printedSymbol = Symbol('printed');

export function resetPrint(typeGraph: TypeGraph) {
  typeGraph = typeGraph.rootGraph;

  typeGraph[idSymbol] = new Map();
  typeGraph[printedSymbol] = new Set();
}

export function getPrintedNodes(typeGraph: TypeGraph) {
  typeGraph = typeGraph.rootGraph;

  return typeGraph[printedSymbol] || (typeGraph[printedSymbol] = new Set());
}

export function id(node: TypeNode, typeGraph: TypeGraph): string {
  typeGraph = typeGraph.rootGraph;

  let map: Map<TypeNode, string>;

  if (typeGraph[idSymbol]) {
    map = typeGraph[idSymbol];
  } else {
    map = typeGraph[idSymbol] = new Map();
  }

  if (!map.has(node)) {
    map.set(node, (map.size + 1).toString());
  }

  return map.get(node);
}
