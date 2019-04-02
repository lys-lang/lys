import { IToken } from 'ebnf';
import { PhaseResult } from './phases/PhaseResult';
import { AstNodeError } from './NodeError';
import { Nodes } from './nodes';

export function walkPreOrder<T extends { children: any[] } = IToken, D extends PhaseResult = any>(
  cbEnter?: (node: T, phaseResult: D, parent: T | null) => void,
  cbLeave?: (node: T, phaseResult: D, parent: T | null) => void
) {
  const leFn = function(node: T, phaseResult: D, parent: T | null = null) {
    if (node) {
      if (cbEnter) {
        try {
          cbEnter.call(null, node, phaseResult, parent);
        } catch (e) {
          if (phaseResult.parsingContext.messageCollector && e instanceof AstNodeError) {
            phaseResult.parsingContext.messageCollector.error(e);
          } else if (phaseResult.parsingContext.messageCollector && node instanceof Nodes.Node) {
            phaseResult.parsingContext.messageCollector.error(e, node);
            console.error(e);
          } else throw e;
        }
      }

      if (node.children) {
        for (let i = 0; i < node.children.length; i++) {
          if (node.children[i]) {
            leFn.call(null, node.children[i], phaseResult, node);
          }
        }
      }

      if (cbLeave) {
        try {
          cbLeave.call(null, node, phaseResult, parent);
        } catch (e) {
          if (phaseResult.parsingContext.messageCollector && e instanceof AstNodeError) {
            phaseResult.parsingContext.messageCollector.error(e);
          } else if (phaseResult.parsingContext.messageCollector && node instanceof Nodes.Node) {
            phaseResult.parsingContext.messageCollector.error(e, node);
            console.error(e);
          } else throw e;
        }
      }
    }
  };

  return leFn;
}
