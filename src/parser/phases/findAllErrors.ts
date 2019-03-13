import { Nodes } from '../nodes';
import { walkPreOrder } from '../walker';
import { PhaseResult } from './PhaseResult';
import { printErrors } from '../../utils/errorPrinter';
import { ParsingContext } from '../ParsingContext';
import { AstNodeError } from '../NodeError';
import { indent } from '../../utils/astPrinter';

declare var console;

const process = walkPreOrder((token: Nodes.Node, doc: PhaseResult) => {
  if (token.astNode && token.astNode.errors && token.astNode.errors.length) {
    token.astNode.errors.forEach($ => {
      if ($ && !doc.parsingContext.messageCollector.errors.includes($ as any)) {
        doc.parsingContext.messageCollector.error($ as any);
      }
    });
  }
});

export function findAllErrors(document: Nodes.DocumentNode, phase: PhaseResult) {
  document.children.forEach($ => process($, phase));

  return document;
}

export function failIfErrors(phaseName: string, document: Nodes.DocumentNode, phase: PhaseResult) {
  findAllErrors(document, phase);
  failWithErrors(phaseName, phase.parsingContext);
}

export function failWithErrors(phaseName: string, pc: ParsingContext) {
  if (pc.messageCollector.errors.length === 0) return;

  if (pc && pc.messageCollector.errors.length) {
    console.log(printErrors(pc));
  }

  throw Object.assign(
    new Error(
      `${phaseName} failed. ${pc.messageCollector.errors.length} errors found:\n` +
        indent(
          pc.messageCollector.errors
            .map(($: Error, $$) => {
              let msg = $ instanceof AstNodeError ? $.message : $.toString() + '\n';
              let stack = '';
              // if ($.stack) stack = '\n' + indent($.stack || '(no stack)');

              return indent(msg, '    ').replace(/^\s+(.*)/m, ($$ + 1).toString() + ')  $1') + stack;
            })
            .join('\n')
        )
    ),
    { phase: pc }
  );
}
