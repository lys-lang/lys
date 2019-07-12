import { Nodes, PhaseFlags } from '../nodes';
import { walkPreOrder } from '../walker';
import { ParsingContext } from '../ParsingContext';
import {
  InjectableTypes,
  StackType,
  NativeTypes,
  StructType,
  TypeHelpers,
  TraitType,
  SelfType,
  TypeType
} from '../types';
import { AstNodeError, DEBUG_TYPES } from '../NodeError';
import { fixParents } from './helpers';
import { TypeAnalyzer, MaxAnalysisPassCount } from '../types/TypeAnalyzer';
import assert = require('assert');

const initializeTypes = walkPreOrder<Nodes.Node>(
  (node, parsingContext) => {
    if (node instanceof Nodes.ImplDirective) {
      if (node.targetImpl.resolvedReference) {
        if (node.baseImpl && node.baseImpl.resolvedReference) {
          for (let impl of node.targetImpl.resolvedReference.referencedNode.impls) {
            if (
              impl.baseImpl &&
              impl.baseImpl.resolvedReference &&
              impl.baseImpl.resolvedReference.referencedNode === node.baseImpl.resolvedReference.referencedNode
            ) {
              parsingContext.messageCollector.error(
                `This trait is already implemented for the target type`,
                node.baseImpl.astNode
              );
            }
          }
        }

        node.targetImpl.resolvedReference.referencedNode.impls.add(node);
      }
    }
  },
  (node, parsingContext: ParsingContext, parent: Nodes.Node | null) => {
    if (node instanceof Nodes.StructTypeNode) {
      TypeHelpers.setNodeType(node, new StructType(node.parameters));
    } else if (node instanceof Nodes.StackTypeNode) {
      const lowLevelType = node.metadata['lowLevelType'];
      const byteSize = node.metadata['byteSize'];

      if (!lowLevelType) {
        parsingContext.messageCollector.error(`Missing lowLevelType schema`, node.astNode);
        TypeHelpers.setNodeType(node, InjectableTypes.never);
        return;
      } else if (!(lowLevelType instanceof Nodes.StringLiteral)) {
        TypeHelpers.setNodeType(node, InjectableTypes.never);
        parsingContext.messageCollector.error(`lowLevelType must be a string`, lowLevelType.astNode);
        return;
      }

      if (!byteSize) {
        parsingContext.messageCollector.error(`Missing byteSize schema`, node.astNode);
        TypeHelpers.setNodeType(node, InjectableTypes.never);
        return;
      } else if (!(byteSize instanceof Nodes.IntegerLiteral)) {
        TypeHelpers.setNodeType(node, InjectableTypes.never);
        parsingContext.messageCollector.error(`byteSize must be a number`, lowLevelType.astNode);
        return;
      }

      let typeName = '???';

      if (parent instanceof Nodes.TypeDirectiveNode) {
        typeName = parent.variableName.name;
      } else {
        parsingContext.messageCollector.error(`%stack can only be used in type directives`, node.astNode);
        TypeHelpers.setNodeType(node, InjectableTypes.never);
        return;
      }

      const type: NativeTypes = lowLevelType.value as any;

      if (type in NativeTypes) {
        const newType = StackType.of(typeName, type, byteSize.value);
        TypeHelpers.setNodeType(node, newType);
      } else {
        parsingContext.messageCollector.error(`Unknown lowLevelType ${lowLevelType.value}`, lowLevelType.astNode);
        TypeHelpers.setNodeType(node, InjectableTypes.never);
      }
    } else if (node instanceof Nodes.InjectedTypeNode) {
      let typeName = '???';

      if (parent instanceof Nodes.TypeDirectiveNode) {
        typeName = parent.variableName.name;
      } else {
        parsingContext.messageCollector.error(`%injected can only be used in type directives`, node.astNode);
        TypeHelpers.setNodeType(node, InjectableTypes.never);
        return;
      }

      if (typeName in InjectableTypes) {
        TypeHelpers.setNodeType(node, (InjectableTypes as any)[typeName]);
      } else {
        parsingContext.messageCollector.error(`Unknown injectable type`, node.astNode);
        TypeHelpers.setNodeType(node, InjectableTypes.never);
      }
    }

    if (node instanceof Nodes.TraitDirectiveNode) {
      const traitType = new TraitType(node);
      TypeHelpers.setNodeType(node.traitName, traitType);
      TypeHelpers.setNodeType(node.selfTypeName!, TypeType.of(new SelfType(traitType)));
    }

    if (node instanceof Nodes.TypeDirectiveNode) {
      if (!node.valueType) {
        parsingContext.messageCollector.error(`Missing type`, node.astNode);
      }
    }
  }
);

/// ---

// Assign types to names, create type references
export function executeTypeInitialization(moduleName: string, parsingContext: ParsingContext) {
  const document = parsingContext.getPhase(moduleName, PhaseFlags.TypeInitialization - 1);
  assert(document.analysis.nextPhase === PhaseFlags.TypeInitialization);

  fixParents(document, parsingContext);
  initializeTypes(document, parsingContext);

  document.analysis.nextPhase++;
}

function findNonFinalizedImportsRecursive(
  moduleName: string,
  parsingContext: ParsingContext,
  queue: Nodes.DocumentNode[],
  visited = new Set<string>()
) {
  if (visited.has(moduleName)) return;
  visited.add(moduleName);
  const document = parsingContext.getPhase(moduleName, PhaseFlags.TypeInitialization);
  document.importedModules.forEach(moduleName => {
    findNonFinalizedImportsRecursive(moduleName, parsingContext, queue, visited);
  });
  if (document.analysis.isTypeAnalysisPassNeeded) {
    if (!queue.includes(document)) {
      queue.push(document);

      if (DEBUG_TYPES) console.log('  Scheduling: ' + document.moduleName);
    }
  }
}

function iterate(moduleName: string, parsingContext: ParsingContext, _debug = false): void {
  let analysisQueue: Nodes.DocumentNode[] = [];

  // Perform type analysis on the files in the analysis queue, which
  // is ordered in a way that should minimize the number of passes
  // we need to perform (with lower-level imports earlier in the list).
  findNonFinalizedImportsRecursive(moduleName, parsingContext, analysisQueue);

  if (analysisQueue.length === 0) {
    return;
  }

  if (DEBUG_TYPES) console.log('Will analyze: ' + analysisQueue.map($ => $.moduleName).join(', '));
  const analyzers = new Map<string, TypeAnalyzer>();

  while (true) {
    let documentToAnalyze = analysisQueue.shift();

    if (!documentToAnalyze) {
      break;
    }
    if (DEBUG_TYPES) {
      console.log('Analyzing: ' + documentToAnalyze.moduleName + ' [' + analysisQueue.length + ' in queue]');
    }
    // Do a type analysis pass and determine if any internal changes occurred
    // during the pass. If so, continue to analyze until it stops changing and
    // mark all of its dependencies as needing to be reanalyzed.
    let didAnalysisChange = false;
    while (true) {
      const analyzer = new TypeAnalyzer(documentToAnalyze, parsingContext);

      analyzers.set(documentToAnalyze.moduleName, analyzer);

      if (!analyzer.analyze()) {
        if (DEBUG_TYPES) console.log('  Nothing changed.');

        if (analyzer.requiresTypeAnalysis()) {
          documentToAnalyze.analysis.isTypeAnalysisPassNeeded = true;
          if (DEBUG_TYPES) console.log('  Requires type analysis.');

          const newQueue: Nodes.DocumentNode[] = [];

          findNonFinalizedImportsRecursive(documentToAnalyze.moduleName, parsingContext, newQueue);

          if (newQueue.length === 1 && newQueue[0] === documentToAnalyze) {
            if (DEBUG_TYPES) console.log("  It won't converge");
          } else {
            newQueue.forEach($ => analysisQueue.push($));
          }
        } else {
          if (documentToAnalyze.analysis.version >= MaxAnalysisPassCount) {
            if (DEBUG_TYPES) console.log('  Analysis limit reached.');
          }
          documentToAnalyze.analysis.isTypeAnalysisPassNeeded = false;
        }

        break;
      } else {
        didAnalysisChange = true;
        if (DEBUG_TYPES) console.log('  Types has changed.');
      }
    }

    // We completed one or more updates to the file in this type
    // analysis pass, so we need to add its dependencies back
    // onto the queue if they're not already on it.
    if (didAnalysisChange) {
      for (let dependency of documentToAnalyze.importedBy) {
        if (!analysisQueue.some($ => $.moduleName === dependency)) {
          const document = parsingContext.getPhase(dependency, PhaseFlags.NameInitialization);

          if (document.analysis.isTypeAnalysisPassNeeded) {
            if (DEBUG_TYPES) {
              console.log('  Scheduling: ' + document.moduleName);
            }
            analysisQueue.push(document);
          }
        }
      }
    }
  }

  analyzers.forEach($ => {
    parsingContext.messageCollector.mergeWith($.messageCollector);
    $.nodeAnnotations.forEach((annotations, node) => {
      annotations.forEach($ => node.annotate($));
    });
  });
}

// Check and infer types
export function executeTypeCheck(moduleName: string, parsingContext: ParsingContext, debug = false) {
  const document = parsingContext.getPhase(moduleName, PhaseFlags.TypeCheck - 1);
  assert(document.analysis.nextPhase === PhaseFlags.TypeCheck);

  try {
    iterate(moduleName, parsingContext, debug);
  } catch (e) {
    if (e instanceof AstNodeError) {
      parsingContext.messageCollector.error(e);
    } else {
      console.error(e);
      throw e;
    }
  }

  document.analysis.nextPhase++;
}
