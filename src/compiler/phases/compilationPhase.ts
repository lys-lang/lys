import { Nodes, Local, Global, PhaseFlags } from '../nodes';
import { walkPreOrder } from '../walker';
import { findParentType } from '../nodeHelpers';
import { ParsingContext } from '../ParsingContext';
import { AstNodeError } from '../NodeError';
import { annotations } from '../annotations';
import { FunctionType } from '../types';
import { last } from '../helpers';
import { fixParents } from './helpers';

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
        if (node.lhs.ofType) {
          const localAnnotation = new annotations.LocalIdentifier(fn.getTempLocal(node.lhs.ofType));
          node.annotate(localAnnotation);

          node.matchingSet.forEach($ => {
            $.annotate(localAnnotation);
          });
        } else {
          throw new AstNodeError('node.lhs.ofType is undefined', node.lhs);
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
  if (node instanceof Nodes.ReferenceNode) {
    if (node.resolvedReference) {
      if (node.resolvedReference.type === 'VALUE') {
        const decl = node.resolvedReference!.referencedNode.parent; // NameIdentifierNode#parent
        if (
          decl instanceof Nodes.ParameterNode ||
          decl instanceof Nodes.VarDeclarationNode ||
          decl instanceof Nodes.ValDeclarationNode ||
          decl instanceof Nodes.MatcherNode
        ) {
          const declLocal = decl.getAnnotation(annotations.LocalIdentifier);

          if (!declLocal) {
            throw new AstNodeError(`Node ${decl.nodeName} has no .local`, decl);
          }

          node.annotate(declLocal);
        } else {
          throw new AstNodeError(`Value node has no local`, decl!);
        }
      }
    } else {
      if (!parsingContext.messageCollector.hasErrorForBranch(node)) {
        throw new AstNodeError(`Reference was not resolved`, node);
      }
    }
  }
});

const resolveDeclarations = walkPreOrder((node: Nodes.Node) => {
  if (node instanceof Nodes.VarDeclarationNode) {
    if (node.parent instanceof Nodes.DirectiveNode) {
      node.annotate(new annotations.LocalIdentifier(new Global(node.variableName)));
    } else {
      const fn = findParentType(node, Nodes.FunctionNode);

      if (fn) {
        node.annotate(new annotations.LocalIdentifier(fn.addLocal(node.value.ofType!, node.variableName)));
      }
    }
  }
});

export const detectTailCall = walkPreOrder((node: Nodes.Node) => {
  if (node instanceof Nodes.FunctionNode) {
    const isTailRec = isRecursiveCallExpression(node, node.body!);

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
    const referencedType = fcn.functionNode.ofType;

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

export function executeCompilationPhase(document: Nodes.DocumentNode, parsingContext: ParsingContext) {
  if (document.phasesRun & PhaseFlags.Compilation) return;

  fixParents(document, parsingContext, null);

  detectReturnExpressions(document, parsingContext, null);
  detectTailCall(document, parsingContext, null);

  resolveDeclarations(document, parsingContext, null);
  resolveLocals(document, parsingContext, null);
  resolveVariables(document, parsingContext, null);

  fixParents(document, parsingContext, null);

  document.phasesRun |= PhaseFlags.Compilation;
}
