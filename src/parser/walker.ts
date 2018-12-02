import { IToken } from 'ebnf';
import { PhaseResult } from './phases/PhaseResult';

export function walkPreOrder<T extends { errors: any[]; children: any[] } = IToken, D extends PhaseResult = any>(
  cbEnter?: (node: T, phaseResult: D, parent: T) => void,
  cbLeave?: (node: T, phaseResult: D, parent: T) => void
) {
  const leFn = function(node: T, phaseResult?: D, parent: T = null) {
    if (node) {
      if (cbEnter) {
        try {
          cbEnter.call(this, node, phaseResult, parent);
        } catch (e) {
          node.errors.push(e);
        }
      }

      if (node.children) {
        for (let i = 0; i < node.children.length; i++) {
          if (node.children[i]) {
            leFn.call(this, node.children[i], phaseResult, node);
          }
        }
      }

      if (cbLeave) {
        try {
          cbLeave.call(this, node, phaseResult, parent);
        } catch (e) {
          node.errors.push(e);
        }
      }
    }
  };

  return leFn;
}
