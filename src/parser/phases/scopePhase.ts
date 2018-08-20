import { Nodes } from '../nodes';
import { walkPreOrder } from '../walker';
import { annotations } from '../annotations';
import { failIfErrors } from './findAllErrors';
import { PhaseResult } from './PhaseResult';
import { SemanticPhaseResult } from './semanticPhase';
import { IErrorPositionCapable, AstNodeError } from '../NodeError';

const findValueNodes = walkPreOrder((node: Nodes.Node) => {
  /**
   * This phase traverses all nodes and adds an annotation to the value nodes, value nodes are those nodes that
   * must have a value.
   * Value nodes are usually the RHS of an assigment node, the LHS of match nodes, function call arguments and so on.
   */

  if (node instanceof Nodes.FunctionCallNode) {
    node.argumentsNode.forEach($ => $.annotate(new annotations.IsValueNode()));
  }

  if (node instanceof Nodes.VarDeclarationNode) {
    node.value.annotate(new annotations.IsValueNode());
  }

  if (node instanceof Nodes.AssignmentNode) {
    node.value.annotate(new annotations.IsValueNode());
  }

  if (node instanceof Nodes.FunctionNode) {
    let returnsVoidValue = false;

    if (node.functionReturnType) {
      returnsVoidValue =
        node.functionReturnType instanceof Nodes.TypeReferenceNode && node.functionReturnType.name.name === 'void';
    }

    if (!returnsVoidValue) {
      node.body.annotate(new annotations.IsValueNode());
    }
  }

  if (node instanceof Nodes.IfNode) {
    node.condition.annotate(new annotations.IsValueNode());

    if (node.falsePart) {
      if (node.hasAnnotation(annotations.IsValueNode)) {
        node.truePart.annotate(new annotations.IsValueNode());
        node.falsePart.annotate(new annotations.IsValueNode());
      }
    }
  }

  if (node instanceof Nodes.PatternMatcherNode) {
    node.lhs.annotate(new annotations.IsValueNode());
    if (node.hasAnnotation(annotations.IsValueNode)) {
      node.matchingSet.forEach($ => {
        $.annotate(new annotations.IsValueNode());
        $.rhs.annotate(new annotations.IsValueNode());
      });
    }
  }

  if (node instanceof Nodes.BlockNode) {
    if (node.hasAnnotation(annotations.IsValueNode) && node.statements.length > 0) {
      node.statements[node.statements.length - 1].annotate(new annotations.IsValueNode());
    }
  }
});

const createClosures = walkPreOrder((node: Nodes.Node, _: ScopePhaseResult, parent: Nodes.Node) => {
  if (parent) {
    if (!node.closure) {
      node.closure = parent.closure;
    }

    if (node instanceof Nodes.MatchCaseIsNode) {
      node.rhs.closure = node.closure.newChildClosure();

      if (node.declaredName) {
        node.rhs.closure.set(node.declaredName);
      }

      if (node.deconstructorNames) {
        node.deconstructorNames.forEach($ => {
          if ($.name !== '_') {
            node.rhs.closure.set($);
          }
        });
      }
    }

    if (node instanceof Nodes.MatchConditionNode && parent instanceof Nodes.PatternMatcherNode) {
      node.rhs.closure = node.closure.newChildClosure();
      node.rhs.closure.set(node.declaredName);
    }

    if (node instanceof Nodes.OverloadedFunctionNode) {
      node.closure.set(node.functionName);
    }

    if (node instanceof Nodes.VarDeclarationNode) {
      node.value.closure = node.closure.newChildClosure();
      node.closure.set(node.variableName);
    }

    if (node instanceof Nodes.TypeDirectiveNode) {
      node.closure.set(node.variableName);
    }

    if (node instanceof Nodes.TypeDeclarationNode) {
      node.declarations.forEach($ => {
        node.closure.set($.declaredName);
      });
    }

    if (node instanceof Nodes.FunctionNode) {
      if (!node.body) {
        throw new AstNodeError('Function has no value', node);
      }

      if (!(parent instanceof Nodes.DirectiveNode)) {
        node.closure.set(node.functionName);
      }

      node.internalIdentifier = node.closure.getInternalIdentifier(node);

      node.closure = node.closure.newChildClosure();

      node.parameters.forEach($ => {
        node.closure.set($.parameterName);
        node.closure.localsMap.set($, node.closure.localsMap.size);
      });

      node.processParameters();
    }
  }
});

const resolveVariables = walkPreOrder((node: Nodes.Node, phaseResult: ScopePhaseResult) => {
  if (node instanceof Nodes.VariableReferenceNode) {
    if (!node.closure.canResolveName(node.variable.name)) {
      throw new AstNodeError(`Cannot resolve variable "${node.variable.name}"`, node.variable);
    }
    const resolved = node.closure.get(node.variable.name);
    const isGlobal = !resolved.isLocalReference || resolved.scope == phaseResult.document.closure;
    node.isLocal = !isGlobal;
    node.closure.incrementUsage(node.variable.name);
  }
  if (node instanceof Nodes.TypeReferenceNode) {
    if (!node.closure.canResolveName(node.name.name)) {
      throw new AstNodeError(`Cannot resolve type named "${node.name.name}"`, node.name);
    }
    node.closure.incrementUsage(node.name.name);
  }
});

export class ScopePhaseResult extends PhaseResult {
  get document() {
    return this.semanticPhaseResult.document;
  }

  get errors() {
    return this.semanticPhaseResult.parsingContext.messageCollector.errors;
  }

  set errors(val: IErrorPositionCapable[]) {
    if (val.length) throw new Error('cannot set errors property');
  }

  constructor(public semanticPhaseResult: SemanticPhaseResult) {
    super();
    this.execute();
  }

  protected execute() {
    createClosures(this.document, this, null);
    resolveVariables(this.document, this, null);
    findValueNodes(this.document, this, null);

    failIfErrors('Scope phase', this.document, this);
  }
}
