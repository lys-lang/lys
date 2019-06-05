import { Nodes, PhaseFlags } from '../nodes';
import { LysSemanticError } from '../NodeError';
import { walkPreOrder, walk } from '../walker';
import { ParsingContext } from '../ParsingContext';

export function getDocument(node: Nodes.Node): Nodes.DocumentNode {
  let current = node;

  while (current.parent) {
    current = current.parent;
  }

  if (current instanceof Nodes.DocumentNode) {
    return current;
  }

  throw new LysSemanticError('cannot find parent document', node);
}

export const fixParents = walkPreOrder<Nodes.Node>((node, _, parent) => {
  if (parent) {
    node.parent = parent;
  }
});

/**
 * This function collects the imports of the scopes of a document.
 * Returns true if it added some new import to the Set
 */
export function collectImports(moduleList: Set<string>, document: Nodes.DocumentNode, parsingContext: ParsingContext) {
  let added = false;

  walk(document, parsingContext, node => {
    if (node.scope && node.scope.importedModules.size) {
      node.scope.importedModules.forEach((_, $) => {
        if (!moduleList.has($)) {
          added = true;
          moduleList.add($);
        }
      });
    }
  });

  return added;
}

/**
 * Returns a list of all the modules that are necessary to compile the given
 * document.
 *
 * This function can be called only after scope phase has been run
 */
export function getModuleSet(document: Nodes.DocumentNode, parsingContext: ParsingContext): Set<string> {
  const moduleList = new Set<string>();

  moduleList.add(document.moduleName);

  collectImports(moduleList, document, parsingContext);

  let added = false;

  do {
    added = false;

    moduleList.forEach($ => {
      try {
        const scope = parsingContext.getPhase($, PhaseFlags.Scope);
        if (scope) {
          added = collectImports(moduleList, scope, parsingContext);
        } else {
          // ERROR
        }
      } catch (e) {
        // ERROR
      }
    });
  } while (added);

  return moduleList;
}

export function forEachModuleWithPhase(
  mainModule: string,
  parsingContext: ParsingContext,
  phase: PhaseFlags,
  debug = false,
  cb?: (node: Nodes.DocumentNode) => void
) {
  const document = parsingContext.getPhase(mainModule, phase, debug);
  const modules = getModuleSet(document, parsingContext);
  modules.forEach($ => {
    const doc = parsingContext.getPhase($, phase, debug);
    if (cb) cb(doc);
  });
}
