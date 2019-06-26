import { Nodes, Local, Global, PhaseFlags } from '../nodes';
import { walkPreOrder } from '../walker';
import { findParentType } from '../nodeHelpers';
import { ParsingContext } from '../ParsingContext';
import { LysCompilerError } from '../NodeError';
import { annotations } from '../annotations';
import { FunctionType, TypeHelpers } from '../types';
import { last } from '../helpers';
import { fixParents } from './helpers';
import assert = require('assert');

const resolveLocals = walkPreOrder(
  (node: Nodes.Node, _: ParsingContext, _parent: Nodes.Node | null) => {
    if (node instanceof Nodes.PatternMatcherNode) {
      // create a local for lhs of MatchNode

      /**
       *   match aFunction(123) { ... }
       *         ^^^^^^^^^^^^^^ this part will get its own local
       */
      const fn = findParentType(node, Nodes.FunctionNode);
      if (fn) {
        const type = TypeHelpers.getNodeType(node.lhs);
        if (type) {
          const localAnnotation = new annotations.LocalIdentifier(fn.getTempLocal(type));
          node.annotate(localAnnotation);

          node.matchingSet.forEach($ => {
            $.annotate(localAnnotation);
          });
        } else {
          throw new LysCompilerError('node.lhs.ofType is undefined', node.lhs);
        }
      } else {
        // TODO: what if we reach here?
      }
    }
  },
  (node: Nodes.Node) => {
    if (node instanceof Nodes.PatternMatcherNode) {
      // release the local for lhs of MatchNode

      const nodeLocal = node.getAnnotation(annotations.LocalIdentifier);

      if (nodeLocal && nodeLocal.local instanceof Local) {
        const fn = findParentType(node, Nodes.FunctionNode);
        if (fn) {
          fn.freeTempLocal(nodeLocal.local);
        } else {
          // TODO: error
        }
      }
    }
  }
);

const resolveVariables = walkPreOrder((node: Nodes.Node, parsingContext: ParsingContext) => {
  if (node instanceof Nodes.ReferenceNode || node instanceof Nodes.MemberNode) {
    if (node.resolvedReference) {
      if (node.resolvedReference.type === 'VALUE') {
        const decl = node.resolvedReference.referencedNode.parent; // NameIdentifierNode#parent
        if (
          decl instanceof Nodes.ParameterNode ||
          decl instanceof Nodes.VarDeclarationNode ||
          decl instanceof Nodes.MatcherNode
        ) {
          const declLocal = decl.getAnnotation(annotations.LocalIdentifier);

          if (!declLocal) {
            throw new LysCompilerError(`Node ${decl.nodeName} has no .local`, decl);
          }

          node.annotate(declLocal);
        } else {
          throw new LysCompilerError(`Value node has no local`, decl!);
        }
      }
    } else {
      if (node instanceof Nodes.ReferenceNode) {
        parsingContext.messageCollector.errorIfBranchDoesntHaveAny(
          new LysCompilerError(`Reference was not resolved`, node)
        );
      }
    }
  }
});

const resolveDeclarations = walkPreOrder((node: Nodes.Node, parsingContext, parent: Nodes.Node | null) => {
  if (node instanceof Nodes.VarDeclarationNode) {
    if (parent instanceof Nodes.DirectiveNode) {
      node.annotate(new annotations.LocalIdentifier(new Global(node.variableName)));
    } else {
      const fn = findParentType(node, Nodes.FunctionNode);

      if (fn) {
        node.annotate(
          new annotations.LocalIdentifier(fn.addLocal(TypeHelpers.getNodeType(node.value)!, node.variableName))
        );
      } else {
        parsingContext.messageCollector.errorIfBranchDoesntHaveAny("Don't know how to generate a local for this", node);
      }
    }
  }
});

export const detectTailCall = walkPreOrder((node: Nodes.Node) => {
  if (node instanceof Nodes.FunctionNode && node.body) {
    const isTailRec = isRecursiveCallExpression(node, node.body);

    if (isTailRec) {
      node.annotate(new annotations.IsTailRec());
    }
  }
});

function annotateReturnExpressions(node: Nodes.Node) {
  if (!node.hasAnnotation(annotations.IsValueNode)) return;

  if (node instanceof Nodes.PatternMatcherNode) {
    node.matchingSet.forEach($ => annotateReturnExpressions($.rhs));
  } else if (node instanceof Nodes.BlockNode) {
    if (node.statements.length > 0) {
      annotateReturnExpressions(last(node.statements));
    }
  } else if (node instanceof Nodes.IfNode) {
    node.annotate(new annotations.IsReturnExpression());
    annotateReturnExpressions(node.truePart);
    if (node.falsePart) {
      annotateReturnExpressions(node.falsePart);
    }
  } else {
    node.annotate(new annotations.IsReturnExpression());
  }
}

// find the last expression of every function body and mark the return expressions
const detectReturnExpressions = walkPreOrder((node: Nodes.Node) => {
  if (node instanceof Nodes.FunctionNode && node.body) {
    annotateReturnExpressions(node.body);
  }
});

/**
 * Returns true if the node is a recursive call to the specified function identifier
 *
 * @param functionNode The function identifier
 * @param node               The node to check
 * @return True if it is a recursive call to that
 */
function isRecursiveCallExpression(functionNode: Nodes.FunctionNode, node: Nodes.ExpressionNode): boolean {
  if (node instanceof Nodes.FunctionCallNode) {
    return isRecursiveFunctionCall(functionNode, node);
  }

  if (node instanceof Nodes.BlockNode) {
    return node.statements.length > 0 && isRecursiveCallExpression(functionNode, last(node.statements));
  }

  if (node instanceof Nodes.IfNode) {
    const truePart = isRecursiveCallExpression(functionNode, node.truePart);
    const falsePart = !!node.falsePart && isRecursiveCallExpression(functionNode, node.falsePart);
    return truePart || falsePart;
  }

  if (node instanceof Nodes.PatternMatcherNode) {
    return node.matchingSet.some(pattern => {
      return isRecursiveCallExpression(functionNode, pattern.rhs);
    });
  }

  return false;
}

function isRecursiveFunctionCall(_functionNode: Nodes.FunctionNode, fcn: Nodes.FunctionCallNode) {
  if (fcn.functionNode instanceof Nodes.ReferenceNode) {
    // Make sure the variable reference points to the same function
    const referencedType = TypeHelpers.getNodeType(fcn.functionNode);

    const functionNode = findParentType(fcn, Nodes.FunctionNode);

    if (functionNode && referencedType instanceof FunctionType) {
      const isTailRec = referencedType.name.internalIdentifier === functionNode.functionName.internalIdentifier;

      if (isTailRec) {
        fcn.annotate(new annotations.IsTailRecCall());
        fcn.removeAnnotation(annotations.IsReturnExpression);
      }

      return isTailRec;
    }
  }
  return false;
}

function findImportedModulesRecursive(
  moduleName: string,
  parsingContext: ParsingContext,
  queue: Nodes.DocumentNode[],
  visited = new Set<string>()
) {
  if (visited.has(moduleName)) return;
  visited.add(moduleName);
  const document = parsingContext.getPhase(moduleName, PhaseFlags.TypeInitialization);
  document.importedModules.forEach(moduleName => {
    findImportedModulesRecursive(moduleName, parsingContext, queue, visited);
  });

  if (!queue.includes(document)) {
    queue.push(document);
  }
}

export function executePreCompilationPhase(moduleName: string, parsingContext: ParsingContext) {
  const document = parsingContext.getPhase(moduleName, PhaseFlags.PreCompilation - 1);

  assert(document.analysis.nextPhase === PhaseFlags.PreCompilation);

  fixParents(document, parsingContext, null);

  detectReturnExpressions(document, parsingContext, null);
  detectTailCall(document, parsingContext, null);

  resolveDeclarations(document, parsingContext, null);

  document.analysis.nextPhase++;
}

export function executeCompilationPhase(moduleName: string, parsingContext: ParsingContext) {
  const document = parsingContext.getPhase(moduleName, PhaseFlags.Compilation - 1);

  const analysisQueue: Nodes.DocumentNode[] = [];

  // Find every dependency
  findImportedModulesRecursive(moduleName, parsingContext, analysisQueue);

  // Ensure every dependency has executed the PreCompilation phase
  analysisQueue.forEach(document => {
    parsingContext.getPhase(document.moduleName, PhaseFlags.PreCompilation);
  });

  assert(document.analysis.nextPhase === PhaseFlags.Compilation);

  resolveLocals(document, parsingContext, null);
  resolveVariables(document, parsingContext, null);

  fixParents(document, parsingContext, null);

  document.analysis.nextPhase++;
}
