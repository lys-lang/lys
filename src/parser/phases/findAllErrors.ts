import * as Nodes from '../nodes';
import { walkPreOrder } from '../walker';

const process = walkPreOrder((token: Nodes.Node, doc: Nodes.DocumentNode) => {
  if (token.astNode && token.astNode.errors && token.astNode.errors.length) {
    doc.errors.push(...token.astNode.errors);
  }
  if (token.errors && token.errors.length) {
    doc.errors.push(...(token.errors as any));
  }
});

export function findAllErrors(node: Nodes.DocumentNode) {
  node.directives.forEach($ => process($, node));

  return node;
}
