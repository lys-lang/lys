import { Nodes } from '../nodes';
import { walkPreOrder } from '../walker';
import { annotations } from '../annotations';
import { failIfErrors } from './findAllErrors';
import { PhaseResult } from './PhaseResult';
import { SemanticPhaseResult } from './semanticPhase';
import { fromTypeNode } from '../types/TypeGraphBuilder';
import { TypeReference } from '../types';

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
      const type = fromTypeNode(node.functionReturnType);
      returnsVoidValue = type && type instanceof TypeReference && type.referencedName === 'void';
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
      node.matchingSet.forEach($ => $.annotate(new annotations.IsValueNode()));
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

    if (node instanceof Nodes.MatchConditionNode && parent instanceof Nodes.PatternMatcherNode) {
      const innerClosure = node.closure.newChildClosure();
      innerClosure.set(node.declaredName, parent.lhs);
    }

    // if (node instanceof Nodes.MatchConditionNode) {
    //   node.rhs.closure = node.closure.newChildClosure();
    //   node.closure.setVariable(node.declaredName.name, node);
    // }

    if (node instanceof Nodes.OverloadedFunctionNode) {
      node.closure.set(node.functionName, node);
    }

    if (node instanceof Nodes.VarDeclarationNode) {
      node.value.closure = node.closure.newChildClosure();
      node.closure.set(node.variableName, node);
    }

    if (node instanceof Nodes.FunctionNode) {
      if (!node.body) {
        throw new Error('Function has no value');
      }

      if (!(parent instanceof Nodes.DirectiveNode)) {
        node.closure.set(node.functionName, node);
      }

      node.internalIdentifier = node.closure.getInternalIdentifier(node);

      node.closure = node.closure.newChildClosure();

      node.parameters.forEach($ => {
        node.closure.set($.parameterName, $);
        node.closure.localsMap.set($, node.closure.localsMap.size);
      });

      node.processParameters();
    }

    if (node instanceof Nodes.TypeDirectiveNode) {
      node.closure.set(node.variableName, node);
    }
  }
});

const resolveVariables = walkPreOrder((node: Nodes.Node) => {
  if (node instanceof Nodes.VariableReferenceNode) {
    if (!node.closure.canResolveName(node.variable.name)) {
      throw new Error(`Cannot resolve variable "${node.variable.name}"`);
    }
    node.closure.incrementUsage(node.variable.name);
  }
  if (node instanceof Nodes.TypeReferenceNode) {
    if (!node.closure.canResolveName(node.name.name)) {
      throw new Error(`Cannot resolve type named "${node.name.name}"`);
    }
    node.closure.incrementUsage(node.name.name);
  }
});

export class ScopePhaseResult extends PhaseResult {
  get document() {
    return this.semanticPhaseResult.document;
  }

  constructor(public semanticPhaseResult: SemanticPhaseResult) {
    super();
    this.execute();
  }

  protected execute() {
    findValueNodes(this.document, this, null);
    createClosures(this.document, this, null);
    resolveVariables(this.document, this, null);

    failIfErrors('Scope phase', this.document, this);
  }
}
