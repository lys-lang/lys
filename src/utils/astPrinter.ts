import { Nodes } from '../compiler/nodes';
import { TypeHelpers } from '../compiler/types';

export function printAST(token: Nodes.Node, level = 0, printedNodes = new Set<Nodes.Node>()): string {
  if (!token) return '<no token was provided>';
  if (printedNodes.has(token)) {
    return '  '.repeat(level) + `|-${token.nodeName}$- THIS NODE HAS BEEN PRINTED`;
  }
  printedNodes.add(token);
  const nodeType = TypeHelpers.getNodeType(token);
  const ofType = nodeType ? ' type=' + nodeType.inspect(10) : '';
  let text = '';

  const resolvedReference =
    token instanceof Nodes.ReferenceNode
      ? ' resolvedReference=' + (token.resolvedReference ? token.resolvedReference.toString() : '<null>')
      : '';

  if (token instanceof Nodes.QNameNode) {
    text = '=' + token.text.replace(/\n/g, '\\n');
  } else if (token instanceof Nodes.NameIdentifierNode) {
    text = '=' + JSON.stringify(token.name);
  } else if (
    token instanceof Nodes.IntegerLiteral ||
    token instanceof Nodes.HexLiteral ||
    token instanceof Nodes.FloatLiteral
  ) {
    text =
      '=' +
      JSON.stringify(token.value) +
      (token.suffixReference && token.suffixReference.variable ? token.suffixReference.variable.text : '');
  } else if (token instanceof Nodes.LiteralNode) {
    text = '=' + JSON.stringify(token.value);
  } else if (token instanceof Nodes.AbstractFunctionCallNode) {
    text = token.resolvedFunctionType ? '=' + token.resolvedFunctionType.inspect(10) : '';
  }

  const annotations =
    token.getAnnotations().length > 0
      ? ' annotations=' +
        token
          .getAnnotations()
          .map($ => $.toString())
          .join(',')
      : '';
  return (
    '\n' +
    '  '.repeat(level) +
    `|-${token.nodeName}${text}${resolvedReference}${ofType}${annotations}` +
    (token.children || []).map(c => printAST(c, level + 1)).join('')
  );
}

export function indent(str: string, indentation: string = '  ') {
  if (!str.replace) {
    console.trace();
  }
  return str.replace(/^(.*)$/gm, indentation + '$1').replace(/^\s+$/gm, '');
}
