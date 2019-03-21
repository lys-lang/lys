import { Nodes } from '../compiler/nodes';

export function printAST(token: Nodes.Node, level = 0) {
  if (!token) return '<no token was provided>';
  const ofType = token.ofType ? ' type=' + token.ofType.inspect(100) : '';
  let text = '';

  if (token instanceof Nodes.QNameNode) {
    text = '=' + token.text.replace(/\n/g, '\\n');
  } else if (token instanceof Nodes.NameIdentifierNode) {
    text = '=' + JSON.stringify(token.name);
  } else if (
    token instanceof Nodes.IntegerLiteral ||
    token instanceof Nodes.HexLiteral ||
    token instanceof Nodes.FloatLiteral
  ) {
    text = '=' + JSON.stringify(token.value) + (token.suffixReference ? token.suffixReference.variable.text : '');
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
    `|-${token.nodeName}${text}${ofType}${annotations}` +
    (token.children || []).map(c => printAST(c, level + 1)).join('')
  );
}

export function indent(str: string, indentation: string = '  ') {
  return str.replace(/^(.*)$/gm, indentation + '$1').replace(/^\s+$/gm, '');
}
