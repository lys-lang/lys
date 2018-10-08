import { Nodes } from '../nodes';
import { walkPreOrder } from '../walker';
import { annotations } from '../annotations';
import { failIfErrors } from './findAllErrors';
import { PhaseResult } from './PhaseResult';
import { SemanticPhaseResult } from './semanticPhase';
import { AstNodeError } from '../NodeError';
import { ParsingContext } from '../closure';

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
        node.functionReturnType instanceof Nodes.TypeReferenceNode && node.functionReturnType.variable.text === 'void';
    }

    if (!returnsVoidValue) {
      node.body.annotate(new annotations.IsValueNode());
    }
  }

  if (node instanceof Nodes.BinaryExpressionNode) {
    node.lhs.annotate(new annotations.IsValueNode());
    node.rhs.annotate(new annotations.IsValueNode());
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

    if (node instanceof Nodes.VariableReferenceNode) {
      node.closure = node.closure.newChildClosure();
    }

    if (node instanceof Nodes.TypeReferenceNode) {
      node.closure = node.closure.newChildClosure();
    }

    if (node instanceof Nodes.VarDeclarationNode) {
      node.value.closure = node.closure.newChildClosure();
      node.closure.set(node.variableName);
    }

    if (node instanceof Nodes.TypeDirectiveNode) {
      node.closure.set(node.variableName);
    }

    if (node instanceof Nodes.StructDeclarationNode) {
      node.closure.set(node.declaredName);
      if (!node.internalIdentifier) {
        node.internalIdentifier = node.closure.getInternalIdentifier(node);
      }
    }

    if (node instanceof Nodes.FunctionNode) {
      if (!node.body) {
        throw new AstNodeError('Function has no value', node);
      }

      if (!(parent instanceof Nodes.DirectiveNode)) {
        node.closure.set(node.functionName);
      }

      if (!node.internalIdentifier) {
        node.internalIdentifier = node.closure.getInternalIdentifier(node);
      }

      node.body.closure = node.closure.newChildClosure();

      node.parameters.forEach($ => {
        node.body.closure.set($.parameterName);
      });

      node.processParameters();
    }
  }
});

const resolveVariables = walkPreOrder((node: Nodes.Node, phaseResult: ScopePhaseResult) => {
  if (node instanceof Nodes.VariableReferenceNode) {
    if (!node.closure.canResolveQName(node.variable)) {
      throw new AstNodeError(`Cannot resolve variable "${node.variable.text}"`, node.variable);
    }
    const resolved = node.closure.getQName(node.variable);
    const isGlobal = !resolved.isLocalReference || resolved.scope == phaseResult.document.closure;
    node.isLocal = !isGlobal;
    node.closure.incrementUsageQName(node.variable);
  } else if (node instanceof Nodes.TypeReferenceNode) {
    if (!node.closure.canResolveQName(node.variable)) {
      throw new AstNodeError(`Cannot resolve type named "${node.variable.text}"`, node.variable);
    }
    node.closure.incrementUsageQName(node.variable);
  }
});

const findImplicitImports = walkPreOrder((node: Nodes.Node, scopePhaseResult: ScopePhaseResult) => {
  if (node instanceof Nodes.VariableReferenceNode) {
    if (node.variable.names.length > 1) {
      const { moduleName, variable } = node.variable.deconstruct();
      node.closure.registerImport(moduleName, new Set([variable]));
      scopePhaseResult.importedModules.add(moduleName);
    }
  } else if (node instanceof Nodes.TypeReferenceNode) {
    if (node.variable.names.length > 1) {
      const { moduleName, variable } = node.variable.deconstruct();
      node.closure.registerImport(moduleName, new Set([variable]));
      scopePhaseResult.importedModules.add(moduleName);
    }
  }
});

function injectCoreImport(document: Nodes.DocumentNode) {
  // TODO: Fix this horrible hack, check correctly if we are in a stdlib
  // context. If so, do not inject the system::core import

  if (document.file && document.file.endsWith('stdlib/system/core.ro')) return;

  const coreModuleImport = new Nodes.ImportDirectiveNode();

  coreModuleImport.allItems = true;
  coreModuleImport.module = Nodes.QNameNode.fromString('system::core');

  document.directives.unshift(coreModuleImport);
}

export class ScopePhaseResult extends PhaseResult {
  importedModules = new Set<string>();

  get document() {
    return this.semanticPhaseResult.document;
  }

  get parsingContext(): ParsingContext {
    return this.semanticPhaseResult.parsingContext;
  }

  constructor(public semanticPhaseResult: SemanticPhaseResult) {
    super();
    this.execute();
  }

  private registerImportedModules() {
    this.document.directives
      .filter($ => $ instanceof Nodes.ImportDirectiveNode)
      .forEach(($: Nodes.ImportDirectiveNode) => {
        const importAll = $.allItems ? new Set(['*']) : new Set();
        this.importedModules.add($.module.text);
        this.document.closure.registerImport($.module.text, importAll);
      });
  }

  protected execute() {
    injectCoreImport(this.document);

    createClosures(this.document, this, null);

    this.registerImportedModules();

    findImplicitImports(this.document, this, null);

    resolveVariables(this.document, this, null);
    findValueNodes(this.document, this, null);

    failIfErrors('Scope phase', this.document, this);
  }
}
