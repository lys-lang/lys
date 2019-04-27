import { IToken } from 'ebnf';
import { PositionCapableError } from './NodeError';
import { Nodes } from './nodes';
import { ParsingContext } from './ParsingContext';

export function walkPreOrder<T extends { children: any[] } = IToken>(
  cbEnter?: (node: T, phaseResult: ParsingContext, parent: T | null) => boolean | void,
  cbLeave?: (node: T, phaseResult: ParsingContext, parent: T | null) => void
) {
  const leFn = function(node: T, phaseResult: ParsingContext, parent: T | null = null) {
    return walk(node, phaseResult, cbEnter, cbLeave, parent);
  };

  return leFn;
}

export function walk<T extends { children: any[] } = IToken>(
  node: T,
  phaseResult: ParsingContext,
  cbEnter?: (node: T, phaseResult: ParsingContext, parent: T | null) => boolean | void,
  cbLeave?: (node: T, phaseResult: ParsingContext, parent: T | null) => void,
  parent: T | null = null
) {
  if (node) {
    let traverseIn = true;
    if (cbEnter) {
      try {
        if (false === cbEnter.call(null, node, phaseResult, parent)) {
          traverseIn = false;
        }
      } catch (e) {
        if (phaseResult.messageCollector && e instanceof PositionCapableError) {
          phaseResult.messageCollector.error(e);
        } else if (phaseResult.messageCollector && node instanceof Nodes.Node) {
          phaseResult.messageCollector.error(e, node.astNode);
          console.error(e);
        } else throw e;
      }
    }

    if (traverseIn) {
      const children = node.children;

      if (children) {
        for (let i = 0; i < children.length; i++) {
          if (children[i]) {
            walk(children[i], phaseResult, cbEnter, cbLeave, node);
          }
        }
      }

      if (cbLeave) {
        try {
          cbLeave.call(null, node, phaseResult, parent);
        } catch (e) {
          if (phaseResult.messageCollector && e instanceof PositionCapableError) {
            phaseResult.messageCollector.error(e);
          } else if (phaseResult.messageCollector && node instanceof Nodes.Node) {
            phaseResult.messageCollector.error(e, node.astNode);
            console.error(e);
          } else throw e;
        }
      }
    }
  }
}
