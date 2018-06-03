import { Node } from '../nodes';

export function findParentType<T extends Node>(node: Node, desiredClass: { new (...args): T }): T {
  let parent: T | Node = node.parent;

  while (parent && !(parent instanceof desiredClass)) {
    parent = parent.parent;

    // If the element has no parent, stop execution
    if (!parent) return null;
  }

  return (parent as T) || null;
}
