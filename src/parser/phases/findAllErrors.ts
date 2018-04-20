import * as Nodes from '../nodes';
import { walker } from '../walker';

const process = walker((token: Nodes.Node, doc: Nodes.DocumentNode) => {
  if (token.astNode && token.astNode.errors && token.astNode.errors.length) {
    doc.errors.push(...token.astNode.errors);
  }
  if (token.errors && token.errors.length) {
    doc.errors.push(...token.errors);
  }
});

export function findAllErrors(node: Nodes.DocumentNode) {
  node.directives.forEach($ => process($, node));

  return node;
}
