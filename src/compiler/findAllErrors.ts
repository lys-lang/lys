import { Nodes } from './nodes';
import { walkPreOrder } from './walker';
import { printErrors } from '../utils/errorPrinter';
import { ParsingContext } from './ParsingContext';
import { PositionCapableError, LysScopeError } from './NodeError';
import { indent, printAST } from '../utils/astPrinter';
import { printScopes } from '../utils/scopePrinter';

const process = walkPreOrder((token: Nodes.Node, parsingContext: ParsingContext) => {
  if (token.astNode && token.astNode.errors && token.astNode.errors.length) {
    token.astNode.errors.forEach(($: any) => {
      if ($ && !parsingContext.messageCollector.errors.includes($)) {
        parsingContext.messageCollector.error($);
      }
    });
  }
});

export function findAllErrors(document: Nodes.DocumentNode, phase: ParsingContext) {
  document.children.forEach($ => process($, phase));

  return document;
}

export function failIfErrors(phaseName: string, document: Nodes.DocumentNode, parsingContext: ParsingContext) {
  findAllErrors(document, parsingContext);
  failWithErrors(phaseName, parsingContext);
}

export function failWithErrors(phaseName: string, pc: ParsingContext, debug = false) {
  if (!pc.messageCollector.hasErrors()) return;

  if (pc && pc.messageCollector.errors.length) {
    pc.system.write(printErrors(pc) + '\n');

    if (debug) {
      const hasScopeErrors = pc.messageCollector.errors.some($ => $ instanceof LysScopeError);

      if (hasScopeErrors) {
        pc.system.write(printScopes(pc) + '\n');
      }

      const modulesWithErrors = new Set<Nodes.DocumentNode>();

      pc.messageCollector.errors.forEach($ => {
        const doc = pc.getExistingParsingPhaseForModule($.position.moduleName);
        if (doc) {
          modulesWithErrors.add(doc);
        }
      });

      const doc = pc.getExistingParsingPhaseForModule('lib::Color');
      if (doc) {
        modulesWithErrors.add(doc);
      }

      modulesWithErrors.forEach($ => {
        pc.system.write($.moduleName + ':\n' + printAST($) + '\n');
      });

      pc.modulesInContext.forEach($ => {
        if (!$.moduleName.includes('#')) {
          console.dir({
            module: $.moduleName,
            analysis: $.analysis,
            importedBy: $.importedBy,
            imports: $.importedModules
          });
        }
      });
      console.log(pc.outline());
    }
  }

  throw Object.assign(
    new Error(
      `${phaseName} failed. ${pc.messageCollector.errors.length} errors found:\n` +
        indent(
          pc.messageCollector.errors
            .map(($: Error, $$) => {
              let msg = $ instanceof PositionCapableError ? '' + $.message : $.toString() + '\n';

              if (debug && $.stack) {
                msg = msg + '\n' + $.stack;
              }

              return indent(msg, '    ').replace(/^\s+(.*)/m, ($$ + 1).toString() + ')  $1');
            })
            .join('\n')
        )
    ),
    { phase: pc }
  );
}
