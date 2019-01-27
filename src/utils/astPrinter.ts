import { Nodes } from '../parser/nodes';

export function printAST(token: Nodes.Node, level = 0) {
  const ofType = token.ofType ? ' type=' + token.ofType.inspect(100) : '';
  const text = token.text ? '=' + token.text.replace(/\n/g, '\\n') : '';
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
  return str.replace(/^(.*)$/gm, indentation + '$1');
}
