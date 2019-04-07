import { Nodes, PhaseFlags } from '../nodes';
import { walkPreOrder } from '../walker';
import { annotations } from '../annotations';
import { AstNodeError, UnreachableCode } from '../NodeError';
import { ParsingContext } from '../ParsingContext';
import { InjectableTypes } from '../types';
import { findParentDelegate } from '../nodeHelpers';
import { getDocument, fixParents } from './helpers';
import { Closure } from '../Closure';

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
    node.rhs.annotate(valueNodeAnnotation);
  }

  if (node instanceof Nodes.MemberNode) {
    if (node.lhs instanceof Nodes.MemberNode) {
      node.lhs.annotate(valueNodeAnnotation);
    }
  }

  if (node instanceof Nodes.FunctionNode) {
    let returnsVoidValue = false;

    if (node.functionReturnType) {
      returnsVoidValue =
        node.functionReturnType instanceof Nodes.ReferenceNode && node.functionReturnType.variable.text === 'void';
    }

    if (!returnsVoidValue) {
      if (node.body) {
        node.body.annotate(valueNodeAnnotation);
      } else {
        // TODO: warn
      }
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

const createClosures = walkPreOrder((node: Nodes.Node, parsingContext: ParsingContext, parent: Nodes.Node | null) => {
  if (parent) {
    if (!node.closure) {
      node.closure = parent.closure;
    }

    if (node instanceof Nodes.MatcherNode) {
      node.rhs.closure = node.closure!.newChildClosure('MatcherRHS');

      if (node.declaredName) {
        node.rhs.closure.set(node.declaredName, 'VALUE');
      }

      if (node instanceof Nodes.MatchCaseIsNode) {
        if (node.deconstructorNames) {
          const takenNames = new Map<string, Nodes.Node>();

          node.deconstructorNames.forEach($ => {
            if ($.name !== '_') {
              if (takenNames.has($.name)) {
                parsingContext.messageCollector.error(new AstNodeError('Duplicated name', $));
              } else {
                takenNames.set($.name, $);
                node.rhs.closure!.set($, 'VALUE');
              }
            }
          });
        }
      }
    } else if (node instanceof Nodes.OverloadedFunctionNode) {
      node.closure!.set(node.functionName, 'FUNCTION');
    } else if (node instanceof Nodes.VarDeclarationNode) {
      if (node.variableName.name in InjectableTypes) {
        parsingContext.messageCollector.error(
          new AstNodeError('Cannot declare a variable with the name of an system type', node.variableName)
        );
      }
      node.value.closure = node.closure!.newChildClosure(node.variableName.name + '_VarDeclaration');
      node.closure!.set(node.variableName, 'VALUE');
    } else if (node instanceof Nodes.ImplDirective) {
      node.closure = node.closure!.newChildClosure(node.reference.variable.text + '.');
    } else if (node instanceof Nodes.TypeDirectiveNode) {
      node.closure!.set(node.variableName, 'TYPE');
    } else if (node instanceof Nodes.FunctionNode) {
      if (node.functionName) {
        if (!(parent instanceof Nodes.DirectiveNode)) {
          node.closure!.set(node.functionName, 'VALUE');
        } else if (!node.functionName.internalIdentifier) {
          node.functionName.internalIdentifier = node.closure!.getInternalIdentifier(node.functionName);
        }
      }

      if (!node.body) {
        parsingContext.messageCollector.error(new AstNodeError('Function has no body', node));
      } else {
        if (node.functionName) {
          node.body.closure = node.closure!.newChildClosure(node.functionName.name + '_Body');
        } else {
          node.body.closure = node.closure!.newChildClosure('Body');
        }

        node.parameters.forEach($ => {
          node.body!.closure!.set($.parameterName, 'VALUE');
        });
      }

      node.processParameters();
    } else if (node instanceof Nodes.BlockNode) {
      node.closure = node.closure!.newChildClosure('Block');
    }
  }
});

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
        namespaceNames.get(nameNode.name)!
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

const resolveVariables = walkPreOrder(undefined, (node: Nodes.Node, parsingContext: ParsingContext) => {
  if (node instanceof Nodes.ReferenceNode) {
    if (!node.closure!.canResolveQName(node.variable, true)) {
      throw new AstNodeError(`Cannot find name '${node.variable.text}'`, node.variable);
    }
    const resolved = node.closure!.getQName(node.variable, true);
    const document = getDocument(node);
    const isGlobal = !resolved.isLocalReference || resolved.scope === document.closure;
    node.isLocal = !isGlobal;
    node.resolvedReference = resolved;
    node.closure!.incrementUsageQName(node.variable);
  } else if (node instanceof Nodes.ImplDirective) {
    if (node.reference.resolvedReference) {
      collectNamespaces(node.reference.resolvedReference.referencedNode, node.directives, parsingContext);
    }
  } else if (node instanceof Nodes.ImportDirectiveNode) {
    try {
      parsingContext.getPhase(node.module.text, PhaseFlags.NameInitialization);
    } catch (e) {
      parsingContext.messageCollector.error(`Unable to load module ${node.module.text}: ` + e, node);
    }
  }
});

const findImplicitImports = walkPreOrder((node: Nodes.Node, _: ParsingContext) => {
  if (node instanceof Nodes.ImportDirectiveNode) {
    const importAll = node.allItems ? new Set(['*']) : new Set();
    node.closure!.registerImport(node.module.text, importAll);
  } else if (node instanceof Nodes.ReferenceNode) {
    if (node.variable.names.length > 1) {
      const { moduleName, variable } = node.variable.deconstruct();
      node.closure!.registerImport(moduleName, new Set([variable]));
    }
  }
});

const injectImplicitCalls = walkPreOrder((node: Nodes.Node, _: ParsingContext) => {
  if (node instanceof Nodes.FunctionCallNode && node.functionNode instanceof Nodes.ReferenceNode) {
    if (node.functionNode.resolvedReference && node.functionNode.resolvedReference.type === 'TYPE') {
      const member = new Nodes.MemberNode(
        node.functionNode.astNode,
        node.functionNode,
        '.',
        new Nodes.NameIdentifierNode(node.functionNode.astNode, 'apply')
      );
      node.functionNode = member;
    }
  }
});

function injectCoreImport(document: Nodes.DocumentNode) {
  // TODO: Fix this horrible hack, check correctly if we are in a stdlib
  // context. If so, do not inject the system::core import

  if (document.moduleName === 'system::core') return;

  const module = Nodes.QNameNode.fromString('system::core', document.astNode);
  const coreModuleImport = new Nodes.ImportDirectiveNode(document.astNode, module);

  coreModuleImport.allItems = true;

  document.directives.unshift(coreModuleImport);
}

const unreachableAnnotation = new annotations.IsUnreachable();

const validateLoops = walkPreOrder(
  (node: Nodes.Node, parsingContext: ParsingContext) => {
    if (node instanceof Nodes.ContinueNode || node instanceof Nodes.BreakNode) {
      const relevantParent = findParentDelegate(node, $ => {
        return (
          $ instanceof Nodes.LoopNode || $ instanceof Nodes.FunctionNode || $.hasAnnotation(annotations.IsValueNode)
        );
      });

      if (relevantParent instanceof Nodes.LoopNode) {
        node.annotate(new annotations.CurrentLoop(relevantParent));
      } else {
        if (relevantParent instanceof Nodes.FunctionNode) {
          parsingContext.messageCollector.error(`Invalid location: No loop was found`, node);
        } else {
          parsingContext.messageCollector.error(`Invalid location. Parent block must return a value`, node);
          if (relevantParent) {
            parsingContext.messageCollector.error(`Not all paths return a value`, relevantParent);
          }
        }
      }
    }
  },
  (node, parsingContext) => {
    if (node instanceof Nodes.BlockNode) {
      let nextAreUnreachable = false;

      node.statements.forEach($ => {
        if (nextAreUnreachable) {
          parsingContext.messageCollector.error(new UnreachableCode($));
          $.annotate(unreachableAnnotation);
        }
        if ($ instanceof Nodes.ContinueNode || $ instanceof Nodes.BreakNode) {
          if ($.hasAnnotation(annotations.CurrentLoop)) {
            nextAreUnreachable = true;
          }
        }
      });
    }
  }
);

export function executeNameInitializationPhase(document: Nodes.DocumentNode, parsingContext: ParsingContext) {
  if (document.phasesRun & PhaseFlags.NameInitialization) return;

  document.closure = new Closure(parsingContext, document.moduleName, null, '[DocumentScope]');

  injectCoreImport(document);

  createClosures(document, parsingContext, null);

  fixParents(document, parsingContext);

  findImplicitImports(document, parsingContext, null);

  document.phasesRun |= PhaseFlags.NameInitialization;

  return;
}

export function executeScopePhase(document: Nodes.DocumentNode, parsingContext: ParsingContext) {
  if (document.phasesRun & PhaseFlags.Scope) return;

  executeNameInitializationPhase(document, parsingContext);

  resolveVariables(document, parsingContext, null);
  findValueNodes(document, parsingContext, null);
  injectImplicitCalls(document, parsingContext, null);
  validateLoops(document, parsingContext);

  document.phasesRun |= PhaseFlags.Scope;
}
