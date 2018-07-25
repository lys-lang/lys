import { StringCodeWriter } from './StringCodeWriter';
import { TypeGraph, Edge, TypeNode } from '../parser/types/TypeGraph';
import { Nodes } from '../parser/nodes';

export function print(graph: TypeGraph, code: string = '', name: string = 'Document'): string {
  const writer: StringCodeWriter = new StringCodeWriter();
  writer.println(`digraph ${name.replace(/"/g, "'")} {`);
  writer.indent();
  writer.println('  node [fixedsize=shape fontsize=10]');
  printNodes(writer, graph);

  let i = 0;
  graph.subGraphs.forEach((str, graph) => {
    writer.printIndent();
    writer.println(`subgraph cluster${i.toString().replace(/"/g, "'")} {`);
    i++;
    writer.indent();
    writer.printIndent();
    writer.println('node [style=filled];');
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

  return writer.codeContent();
}

export function printEdges(writer: StringCodeWriter, graph: TypeGraph): void {
  graph.nodes.forEach(node => {
    node.outgoingEdges().forEach(edge => {
      writer.printIndent();
      writer.print(`${id(edge.source, graph)} -> ${id(edge.target, graph)}`);
      writer.println(
        '[taillabel=' +
          '"' +
          edgeLabel(edge).replace(/"/g, "'") +
          '"' +
          ' labeldistance="1" fontname="times  italic" fontsize = 10 ' +
          (edge.error() ? 'color="red"' : '') +
          ' ];'
      );
    });
  });
}

const printedNodes = new Set<TypeNode>();

export function printNodes(writer: StringCodeWriter, graph: TypeGraph) {
  graph.nodes.forEach(node => {
    if (!printedNodes.has(node)) {
      writer.printIndent();
      writer.println(`${id(node, graph)} [label="${nodeLabel(node).replace(/"/g, "'")}"];`);
      printedNodes.add(node);
    }
  });
}

export function edgeLabel(edge: Edge): string {
  if (edge.incomingTypeDefined()) {
    return edge.incomingType().toString();
  } else {
    if (!edge.label) {
      return 'Not Defined';
    } else {
      return `[${edge.label}]`;
    }
  }
}

export function nodeLabel(node: TypeNode): string {
  if (node.astNode instanceof Nodes.VariableReferenceNode) {
    return `Var:\\n${node.astNode.variable.name}`;
  } else if (node.astNode instanceof Nodes.NameIdentifierNode) {
    return `Name:\\n${node.astNode.name}`;
  } else if (node.astNode instanceof Nodes.IntegerLiteral) {
    return `Int:\\n${node.astNode.value}`;
  } else if (node.astNode instanceof Nodes.FloatLiteral) {
    return `Float:\\n${node.astNode.value.toFixed(5)}`;
  } else if (node.astNode instanceof Nodes.ValDeclarationNode) {
    return `Val Decl:\\n${node.astNode.variableName.name}`;
  } else if (node.astNode instanceof Nodes.VarDeclarationNode) {
    return `Var Decl:\\n${node.astNode.variableName.name}`;
  } else if (node.astNode instanceof Nodes.OverloadedFunctionNode) {
    return `OverloadedFun:\\n${node.astNode.functionName.name}`;
  } else if (node.astNode instanceof Nodes.FunctionNode) {
    return `Fun:\\n${node.astNode.functionName.name}`;
  } else if (node.astNode instanceof Nodes.TypeDirectiveNode) {
    return `TypeDirective:\\n${node.astNode.variableName.name}`;
  } else if (node.astNode instanceof Nodes.FunDirectiveNode) {
    return `fun ${node.astNode.functionNode.functionName.name}`;
  }
  return node.astNode ? node.astNode.nodeName + node.astNode.text : '<no node>';
}

const idSymbol = Symbol('id');

export function id(node: TypeNode, typeGraph: TypeGraph): string {
  while (typeGraph.parentGraph) {
    typeGraph = typeGraph.parentGraph;
  }

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
