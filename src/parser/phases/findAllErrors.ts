import { Nodes } from '../nodes';
import { walkPreOrder } from '../walker';
import { PhaseResult } from './PhaseResult';
import { printErrors } from '../../utils/errorPrinter';
import { IErrorPositionCapable } from '../NodeError';

declare var console;

function indent(str: string, indentation: string = '  ') {
  return str.replace(/^(.*)$/gm, indentation + '$1');
}

const process = walkPreOrder((token: Nodes.Node, doc: PhaseResult) => {
  if (token.astNode && token.astNode.errors && token.astNode.errors.length) {
    token.astNode.errors.forEach($ => {
      if ($ && !doc.errors.includes($ as any)) {
        doc.errors.push($ as any);
        // TODO: coerce to AstNodeError
      }
    });
  }
  if (token.errors && token.errors.length) {
    token.errors.forEach(($: any) => {
      if ($ && !doc.errors.includes($)) {
        doc.errors.push($);
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
  failWithErrors(phaseName, phase.errors, phase);
}

export function failWithErrors(phaseName: string, errors: IErrorPositionCapable[], phase: PhaseResult) {
  if (errors.length === 0) return;

  if (phase && phase.errors.length && 'document' in (phase as any)) {
    try {
      console.log(printErrors((phase as any).document, errors));
    } catch {}
  }

  throw Object.assign(
    new Error(
      `${phaseName} failed. ${errors.length} errors found:\n` +
        indent(
          errors.map(($, $$) => indent($.message, '    ').replace(/^\s+(.*)/, ($$ + 1).toString() + ')  $1')).join('\n')
        )
    ),
    { phase }
  );
}
