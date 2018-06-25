import { IToken } from 'ebnf';
import { Nodes } from './nodes';

export function walkPreOrder<T extends { errors: any[]; children: any[] } = IToken, D = any>(
  cbEnter: (node: T, document: D, parent: T) => void,
  cbLeave?: (node: T, document: D, parent: T) => void
) {
  const leFn = function(node: T, document?: D, parent: T = null) {
    if (node) {
      try {
        cbEnter.call(this, node, document, parent);
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

      if (cbLeave) {
        try {
          cbLeave.call(this, node, document, parent);
        } catch (e) {
          node.errors.push(e);
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

export type INodes = typeof Nodes;
export type ICallback<_ extends keyof INodes = 'Node'> = (
  node: Nodes.Node,
  parent: Nodes.Node,
  root: Nodes.Node
) => void;

export class Visitor {
  enter = new Map<string, ICallback>();
  leave = new Map<string, ICallback>();

  setHandler<T extends keyof INodes>(node: T, handler: { enter?: ICallback<T>; leave?: ICallback<T> }) {
    if (handler.enter && this.enter.has(node)) throw new Error('handler for enter ' + node + ' was already defined');
    if (handler.leave && this.leave.has(node)) throw new Error('handler for leave ' + node + ' was already defined');

    if (handler.enter) this.enter.set(node, handler.enter);
    if (handler.leave) this.leave.set(node, handler.leave);
  }

  execute(root: Nodes.Node) {
    const fn = (node: Nodes.Node, parent: Nodes.Node) => {
      const enter = this.enter.get(node.nodeName);
      if (enter) enter(node, parent, root);
      if (node.children) {
        for (let i = 0; i < node.children.length; i++) {
          if (node.children[i]) {
            fn.call(node.children[i], node);
          }
        }
      }
      const leave = this.leave.get(node.nodeName);
      if (leave) leave(node, parent, root);
    };
    fn(root, null);
  }
}
