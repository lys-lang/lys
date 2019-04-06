import { Nodes } from '../nodes';
import { AstNodeError } from '../NodeError';
import { walkPreOrder } from '../walker';

export function getDocument(node: Nodes.Node): Nodes.DocumentNode {
  let current = node;

  while (current.parent) {
    current = current.parent;
  }

  if (current instanceof Nodes.DocumentNode) {
    return current;
  }

  throw new AstNodeError('cannot find parent document', node);
}

export const fixParents = walkPreOrder<Nodes.Node>((node, _, parent) => {
  if (parent) {
    node.parent = parent;
  }
});
