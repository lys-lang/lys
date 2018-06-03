import * as Nodes from '../nodes';
import { walkPreOrder } from '../walker';
import { findParentType } from './helpers';

const fixParents = walkPreOrder((node: Nodes.Node, _: Nodes.DocumentNode, parent: Nodes.Node) => {
  node.parent = parent;
  return node;
});

const resolveLocals = walkPreOrder((node: Nodes.Node) => {
  if (node instanceof Nodes.MatchNode) {
    const fn = findParentType(node, Nodes.FunctionNode);
    node.localIndex = fn.locals.push(node.lhs.ofType);
  }
});

export function compilationPhase(node: Nodes.DocumentNode): Nodes.DocumentNode {
  fixParents(node, node, null);
  resolveLocals(node, node, null);

  return node;
}
