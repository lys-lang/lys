import { Nodes } from '../nodes';
import { walkPreOrder } from '../walker';

function indent(str: string, indentation: string = '  ') {
  return str.replace(/^(.*)$/gm, indentation + '$1');
}

const process = walkPreOrder((token: Nodes.Node, doc: Nodes.DocumentNode) => {
  if (token.astNode && token.astNode.errors && token.astNode.errors.length) {
    token.astNode.errors.forEach($ => {
      if ($ && !doc.errors.includes($)) {
        doc.errors.push($);
      }
    });
  }
  if (token.errors && token.errors.length) {
    token.errors.forEach(($: any) => {
      if ($ && !doc.errors.includes($)) {
        doc.errors.push($);
      }
    });
  }
});

export function findAllErrors(document: Nodes.DocumentNode) {
  document.children.forEach($ => process($, document));

  return document;
}

export function failIfErrors(phaseName: string, document: Nodes.DocumentNode) {
  findAllErrors(document);

  if (document.errors.length) {
    const error = new Error(
      `${phaseName} failed. ${document.errors.length} errors found:\n` +
        indent(
          document.errors
            .map(($, $$) => indent($.message, '    ').replace(/^\s+(.*)/, ($$ + 1).toString() + ')  $1'))
            .join('\n')
        )
    );
    (error as any).document = document;
    throw error;
  }
}
