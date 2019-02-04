import { Nodes } from '../nodes';
import { walkPreOrder } from '../walker';
import { annotations } from '../annotations';
import { failIfErrors } from './findAllErrors';
import { PhaseResult } from './PhaseResult';
import { SemanticPhaseResult } from './semanticPhase';
import { AstNodeError } from '../NodeError';
import { ParsingContext } from '../closure';

const valueNodeAnnotation = new annotations.IsValueNode();

const findValueNodes = walkPreOrder((node: Nodes.Node) => {
  /**
   * This phase traverses all nodes and adds an annotation to the value nodes, value nodes are those nodes that
   * must have a value.
   * Value nodes are usually the RHS of an assigment node, the LHS of match nodes, function call arguments and so on.
   */

  if (node instanceof Nodes.FunctionCallNode) {
    node.argumentsNode.forEach($ => $.annotate(valueNodeAnnotation));
  }

  if (node instanceof Nodes.VarDeclarationNode) {
    node.value.annotate(valueNodeAnnotation);
  }

  if (node instanceof Nodes.AssignmentNode) {
    node.value.annotate(valueNodeAnnotation);
  }

  if (node instanceof Nodes.FunctionNode) {
    let returnsVoidValue = false;

    if (node.functionReturnType) {
      returnsVoidValue =
        node.functionReturnType instanceof Nodes.ReferenceNode && node.functionReturnType.variable.text === 'void';
    }

    if (!returnsVoidValue) {
      node.body.annotate(valueNodeAnnotation);
    }
  }

  if (node instanceof Nodes.BinaryExpressionNode) {
    node.lhs.annotate(valueNodeAnnotation);
    node.rhs.annotate(valueNodeAnnotation);
  }

  if (node instanceof Nodes.IsExpressionNode) {
    node.lhs.annotate(valueNodeAnnotation);
  }

  if (node instanceof Nodes.AsExpressionNode) {
    node.lhs.annotate(valueNodeAnnotation);
  }

  if (node instanceof Nodes.IfNode) {
    node.condition.annotate(valueNodeAnnotation);

    if (node.falsePart) {
      if (node.hasAnnotation(annotations.IsValueNode)) {
        node.truePart.annotate(valueNodeAnnotation);
        node.falsePart.annotate(valueNodeAnnotation);
      }
    }
  }

  if (node instanceof Nodes.PatternMatcherNode) {
    node.lhs.annotate(valueNodeAnnotation);
    if (node.hasAnnotation(annotations.IsValueNode)) {
      node.matchingSet.forEach($ => {
        $.annotate(valueNodeAnnotation);
        $.rhs.annotate(valueNodeAnnotation);
      });
    }
  }

  if (node instanceof Nodes.BlockNode) {
    if (node.hasAnnotation(annotations.IsValueNode) && node.statements.length > 0) {
      node.statements[node.statements.length - 1].annotate(valueNodeAnnotation);
    }
  }
});

const createClosures = walkPreOrder(
  (node: Nodes.Node, _: ScopePhaseResult, parent: Nodes.Node) => {
    if (parent) {
      if (!node.closure) {
        node.closure = parent.closure;
      }

      if (node instanceof Nodes.MatcherNode) {
        node.rhs.closure = node.closure.newChildClosure('MatcherRHS');

        if (node.declaredName) {
          node.rhs.closure.set(node.declaredName, 'VALUE');
        }

        if (node instanceof Nodes.MatchCaseIsNode) {
          if (node.deconstructorNames) {
            // TODO: check duplicated names
            node.deconstructorNames.forEach($ => {
              if ($.name !== '_') {
                node.rhs.closure.set($, 'VALUE');
              }
            });
          }
        }
      } else if (node instanceof Nodes.OverloadedFunctionNode) {
        node.closure.set(node.functionName, 'FUNCTION');
      } else if (node instanceof Nodes.ReferenceNode) {
        node.closure = node.closure.newChildClosure('Reference');
      } else if (node instanceof Nodes.VarDeclarationNode) {
        node.value.closure = node.closure.newChildClosure('VarDeclaration');
        node.closure.set(node.variableName, 'VALUE');
      } else if (node instanceof Nodes.NameSpaceDirective) {
        node.closure = node.closure.newChildClosure('NSDirective');
      } else if (node instanceof Nodes.TypeDirectiveNode) {
        node.closure.set(node.variableName, 'TYPE');
      } else if (node instanceof Nodes.FunctionNode) {
        if (!node.body) {
          throw new AstNodeError('Function has no value', node);
        }

        if (!(parent instanceof Nodes.DirectiveNode)) {
          node.closure.set(node.functionName, 'VALUE');
        }

        if (!node.functionName.internalIdentifier) {
          node.functionName.internalIdentifier = node.closure.getInternalIdentifier(node);
        }

        node.body.closure = node.closure.newChildClosure('FunctionBody');

        node.parameters.forEach($ => {
          node.body.closure.set($.parameterName, 'VALUE');
        });

        node.processParameters();
      }
    }
  },
  node => {
    if (node instanceof Nodes.NameIdentifierNode) {
      if (!node.internalIdentifier) {
        node.internalIdentifier = node.closure.getInternalIdentifier(node);
      }
    }
  }
);

function collectNamespaces(
  namespace: Nodes.NameIdentifierNode,
  directives: Nodes.DirectiveNode[],
  parsingContext: ParsingContext
) {
  if (!namespace.namespaceNames) {
    namespace.namespaceNames = new Map();
  }

  const { namespaceNames } = namespace;

  function registerNameIdentifier(nameNode: Nodes.NameIdentifierNode) {
    if (namespaceNames.has(nameNode.name) && namespaceNames.get(nameNode.name) !== nameNode) {
      parsingContext.messageCollector.error(
        `The name "${nameNode.name}" is already registered in the namespace "${namespace.name}"`,
        nameNode
      );
      parsingContext.messageCollector.error(
        `This is the registered name "${nameNode.name}" of "${namespace.name}"`,
        namespaceNames.get(nameNode.name)
      );
    } else {
      namespaceNames.set(nameNode.name, nameNode);
    }
  }

  directives.forEach(node => {
    if (node instanceof Nodes.OverloadedFunctionNode) {
      registerNameIdentifier(node.functionName);
    } else if (node instanceof Nodes.VarDirectiveNode) {
      registerNameIdentifier(node.decl.variableName);
    } else if (node instanceof Nodes.TypeDirectiveNode) {
      registerNameIdentifier(node.variableName);
    } else {
      parsingContext.messageCollector.error(`Don't know how to register this directive ${node.nodeName}`, node);
    }
  });
}

const resolveVariables = walkPreOrder(undefined, (node: Nodes.Node, phaseResult: ScopePhaseResult) => {
  if (node instanceof Nodes.ReferenceNode) {
    if (!node.closure.canResolveQName(node.variable, true)) {
      throw new AstNodeError(`Cannot resolve reference "${node.variable.text}"`, node.variable);
    }
    const resolved = node.closure.getQName(node.variable, true);
    const isGlobal = !resolved.isLocalReference || resolved.scope == phaseResult.document.closure;
    node.isLocal = !isGlobal;
    node.resolvedReference = resolved;
    node.closure.incrementUsageQName(node.variable);
  } else if (node instanceof Nodes.NameSpaceDirective) {
    collectNamespaces(node.reference.resolvedReference.referencedNode, node.directives, phaseResult.parsingContext);
  }
  // else if (node instanceof Nodes.MemberNode) {
  //   if (node.lhs instanceof Nodes.ReferenceNode && node.lhs.resolvedReference) {
  //     if (node.lhs.resolvedReference.type === 'TYPE') {
  //       const { namespaceNames } = node.lhs.resolvedReference.referencedNode;

  //       if (!namespaceNames || !namespaceNames.has(node.memberName.name)) {
  //         throw new AstNodeError(
  //           `The type "${node.lhs.resolvedReference.referencedNode.toString()}" has no public member "${
  //             node.memberName.name
  //           }"`,
  //           node
  //         );
  //       }
  //     } else if (node.lhs.resolvedReference.type === 'VALUE') {
  //       // const { namespaceNames } = node.lhs.resolvedReference.referencedNode;
  //       // if (!namespaceNames || !namespaceNames.has(node.memberName.name)) {
  //       //   throw new AstNodeError(
  //       //     `The type "${node.lhs.resolvedReference.referencedNode.toString()}" has no public member "${
  //       //       node.memberName.name
  //       //     }"`,
  //       //     node
  //       //   );
  //       // }
  //     } else {
  //       throw new AstNodeError(`Don't know how to resolve this ref: ${node.lhs.resolvedReference.type}`, node.lhs);
  //     }
  //   }
  // }
});

const findImplicitImports = walkPreOrder((node: Nodes.Node, scopePhaseResult: ScopePhaseResult) => {
  if (node instanceof Nodes.ReferenceNode) {
    if (node.variable.names.length > 1) {
      const { moduleName, variable } = node.variable.deconstruct();
      node.closure.registerImport(moduleName, new Set([variable]));
      scopePhaseResult.importedModules.add(moduleName);
    }
  }
});

const injectImplicitCalls = walkPreOrder((node: Nodes.Node, _scopePhaseResult: ScopePhaseResult) => {
  if (node instanceof Nodes.FunctionCallNode && node.functionNode instanceof Nodes.ReferenceNode) {
    if (node.functionNode.resolvedReference && node.functionNode.resolvedReference.type == 'TYPE') {
      const member = new Nodes.MemberNode(node.functionNode.astNode);
      member.lhs = node.functionNode;
      member.memberName = new Nodes.NameIdentifierNode(node.functionNode.astNode);
      member.memberName.name = 'apply';
      node.functionNode = member;
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

    injectImplicitCalls(this.document, this, null);

    failIfErrors('Scope phase', this.document, this);
  }
}
