import { IToken } from 'ebnf';

export function walkPreOrder<T extends { errors: any[]; children: any[] } = IToken, D = any>(
  cb: (node: T, document: D, parent: T) => void
) {
  const leFn = function(node: T, document?: D, parent: T = null) {
    if (node) {
      try {
        cb.call(this, node, document, parent);
      } catch (e) {
        node.errors.push(e);
      }

      if (node.children) {
        for (let i = 0; i < node.children.length; i++) {
          if (node.children[i]) {
            leFn.call(this, node.children[i], document, node);
          }
        }
      }
    }
  };

  return leFn;
}

export function walkPostOrder<T extends { errors: any[]; children: any[] } = IToken, D = any>(
  cb: (node: T, document: D, parent: T) => void
) {
  const leFn = function(node: T, document?: D, parent: T = null) {
    if (node) {
      if (node.children) {
        for (let i = 0; i < node.children.length; i++) {
          if (node.children[i]) {
            leFn.call(this, node.children[i], document, node);
          }
        }
      }

      try {
        cb.call(this, node, document, parent);
      } catch (e) {
        node.errors.push(e);
      }
    }
  };

  return leFn;
}
