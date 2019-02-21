import { Nodes } from '../nodes';

export function findParentType<T extends Nodes.Node>(node: Nodes.Node, desiredClass: { new (...args): T }): T {
  let parent: T | Nodes.Node = node.parent;

  while (parent && !(parent instanceof desiredClass)) {
    parent = parent.parent;

    // If the element has no parent, stop execution
    if (!parent) return null;
  }

  return (parent as T) || null;
}

export function findParentDelegate(node: Nodes.Node, delegate: (current: Nodes.Node) => boolean): Nodes.Node | null {
  let parent: Nodes.Node = node.parent;

  while (parent && !delegate(parent)) {
    parent = parent.parent;

    // If the element has no parent, stop execution
    if (!parent) return null;
  }

  return parent || null;
}
