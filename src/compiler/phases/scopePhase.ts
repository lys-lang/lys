import { Nodes, PhaseFlags } from '../nodes';
import { walkPreOrder } from '../walker';
import { annotations } from '../annotations';
import { UnreachableCode, LysScopeError } from '../NodeError';
import { ParsingContext } from '../ParsingContext';
import { InjectableTypes } from '../types';
import { findParentDelegate } from '../nodeHelpers';
import { getDocument, fixParents, collectImports } from './helpers';
import { Scope } from '../Scope';
import assert = require('assert');
import { LysError } from '../../utils/errorPrinter';

const CORE_LIB = 'system::core';

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
    node.lhs.annotate(new annotations.IsAssignationLHS());
  }

  if (node instanceof Nodes.MemberNode) {
    if (node.lhs instanceof Nodes.MemberNode) {
      node.lhs.annotate(valueNodeAnnotation);
    }
  }

  if (node instanceof Nodes.FunctionNode) {
    let returnsVoidValue = false;

    if (node.functionReturnType) {
      // TODO: dehardcode this... Unit type may be a good approach
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

const createScopes = walkPreOrder((node: Nodes.Node, parsingContext: ParsingContext, parent: Nodes.Node | null) => {
  if (parent) {
    if (!node.scope) {
      node.scope = parent.scope;
    }

    if (node instanceof Nodes.MatcherNode) {
      node.rhs.scope = node.scope!.newChildScope('MatcherRHS');

      if (node.declaredName) {
        node.rhs.scope.set(node.declaredName, 'VALUE', false);
      }

      if (node instanceof Nodes.MatchCaseIsNode) {
        if (node.deconstructorNames) {
          const takenNames = new Map<string, Nodes.Node>();

          node.deconstructorNames.forEach($ => {
            if ($.name !== '_') {
              if (takenNames.has($.name)) {
                parsingContext.messageCollector.error(new LysScopeError('Duplicated name', $));
              } else {
                takenNames.set($.name, $);
                node.rhs.scope!.set($, 'VALUE', false);
              }
            }
          });
        }
      }
    } else if (node instanceof Nodes.OverloadedFunctionNode) {
      node.scope!.set(node.functionName, 'FUNCTION', node.isPublic);
    } else if (node instanceof Nodes.TraitDirectiveNode) {
      node.scope!.set(node.traitName, 'TRAIT', node.isPublic);
      node.scope = node.scope!.newChildScope(node.traitName.name + '.');
      node.selfTypeName = new Nodes.NameIdentifierNode(node.traitName.astNode, 'Self');
      node.scope.set(node.selfTypeName, 'TYPE', false);
    } else if (node instanceof Nodes.VarDeclarationNode) {
      if (node.variableName.name in InjectableTypes) {
        parsingContext.messageCollector.error(
          new LysScopeError('Cannot declare a variable with the name of an system type', node.variableName)
        );
      }
      node.value.scope = node.scope!.newChildScope(node.variableName.name + '_Declaration');
      node.scope!.set(node.variableName, 'VALUE', parent instanceof Nodes.VarDirectiveNode && parent.isPublic);
    } else if (node instanceof Nodes.ImplDirective) {
      node.scope = node.scope!.newChildScope(node.targetImpl.variable.text + '.');

      if (node.baseImpl) {
        node.selfTypeName = new Nodes.NameIdentifierNode(node.targetImpl.astNode, 'Self');
        node.scope.set(node.selfTypeName, 'TYPE', false);
      }
    } else if (node instanceof Nodes.TypeDirectiveNode) {
      node.scope!.set(node.variableName, 'TYPE', node.isPublic);
    } else if (node instanceof Nodes.FunctionNode) {
      if (node.functionName) {
        if (!(parent instanceof Nodes.DirectiveNode)) {
          node.scope!.set(node.functionName, 'VALUE', false);
        } else if (!node.functionName.internalIdentifier) {
          node.functionName.internalIdentifier = node.scope!.getInternalIdentifier(node.functionName);
        }
      }

      if (node.body) {
        // if (node.body == false) a message is emited in the semantic phase
        const functionBody = node.body;

        if (node.functionName) {
          node.body.scope = node.scope!.newChildScope(node.functionName.name + '_Body');
        } else {
          node.body.scope = node.scope!.newChildScope('Body');
        }

        node.parameters.forEach($ => {
          functionBody.scope!.set($.parameterName, 'VALUE', false);
        });
      }

      node.processParameters();
    } else if (node instanceof Nodes.BlockNode) {
      node.scope = node.scope!.newChildScope('Block');
    }
  }
});

function collectNamespaces(
  namespace: Nodes.ImplDirective | Nodes.TraitDirectiveNode,
  directives: Nodes.DirectiveNode[],
  parsingContext: ParsingContext
) {
  const { namespaceNames } = namespace;

  const nameToShow =
    namespace instanceof Nodes.ImplDirective ? namespace.targetImpl.variable.text : namespace.traitName.name;

  function registerNameIdentifier(nameNode: Nodes.NameIdentifierNode) {
    if (namespaceNames.has(nameNode.name) && namespaceNames.get(nameNode.name) !== nameNode) {
      parsingContext.messageCollector.error(
        `The name "${nameNode.name}" is already registered in the impl "${nameToShow}"`,
        nameNode.astNode
      );
      parsingContext.messageCollector.error(
        `This is the registered name "${nameNode.name}" of "${nameToShow}"`,
        namespaceNames.get(nameNode.name)!.astNode
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
      parsingContext.messageCollector.error(`Don't know how to register this directive ${node.nodeName}`, node.astNode);
    }
  });
}

const resolveVariables = walkPreOrder(undefined, (node: Nodes.Node, parsingContext: ParsingContext) => {
  if (node instanceof Nodes.IsExpressionNode || node instanceof Nodes.IfNode || node instanceof Nodes.MatcherNode) {
    const typeName = 'boolean';
    try {
      node.scope!.get(typeName);
    } catch (e) {
      throw new LysScopeError(e.toString(), node);
    }

    const resolved = node.scope!.get(typeName);
    node.booleanReference = resolved;
    node.scope!.incrementUsage(typeName);
  } else if (node instanceof Nodes.LiteralNode) {
    try {
      node.scope!.get(node.typeName);
    } catch (e) {
      throw new LysScopeError(e.toString(), node);
    }

    const resolved = node.scope!.get(node.typeName);
    node.resolvedReference = resolved;
    node.scope!.incrementUsage(node.typeName);
  } else if (node instanceof Nodes.ReferenceNode) {
    try {
      node.scope!.getQName(node.variable);
    } catch (e) {
      throw new LysScopeError(e.toString(), node.variable);
    }

    const resolved = node.scope!.getQName(node.variable);
    const document = getDocument(node);
    const isGlobal = !resolved.isLocalReference || resolved.scope === document.scope;
    node.isLocal = !isGlobal;
    node.resolvedReference = resolved;
    node.scope!.incrementUsageQName(node.variable);
  } else if (node instanceof Nodes.ImplDirective) {
    if (node.targetImpl.resolvedReference) {
      collectNamespaces(node, node.directives, parsingContext);
    } else {
      throw new LysScopeError(`Impl is not resolved`, node);
    }
  } else if (node instanceof Nodes.TraitDirectiveNode) {
    collectNamespaces(node, node.directives, parsingContext);
  } else if (node instanceof Nodes.ImportDirectiveNode) {
    try {
      parsingContext.getPhase(node.module.text, PhaseFlags.NameInitialization);
    } catch (e) {
      parsingContext.messageCollector.error(`Unable to load module ${node.module.text}: ` + e, node.astNode);
    }
  }
});

const findImplicitImports = walkPreOrder((node: Nodes.Node, parsingContext: ParsingContext) => {
  if (node instanceof Nodes.ImportDirectiveNode) {
    const document = getDocument(node);
    if (node.module.text === document.moduleName) {
      // TODO: test this
      parsingContext.messageCollector.error('Self import is not allowed', node.astNode);
    }
    const importAll = node.allItems ? new Set(['*']) : new Set<string>();
    node.scope!.registerImport(node.module.text, importAll);
  } else if (node instanceof Nodes.ReferenceNode) {
    if (node.variable.names.length > 1) {
      const { moduleName, variable } = node.variable.deconstruct();
      const document = getDocument(node);
      if (moduleName === document.moduleName) {
        // TODO: test this
        parsingContext.messageCollector.error('Self import is not allowed', node.astNode);
      }
      node.scope!.registerImport(moduleName, new Set([variable]));
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
      member.scope = node.functionNode.scope;
      node.functionNode = member;
    }
  }
});

function injectCoreImport(document: Nodes.DocumentNode, parsingContext: ParsingContext) {
  if (document.moduleName.startsWith(CORE_LIB)) {
    return;
  }

  if (document.hasAnnotation(annotations.NoStd)) {
    return;
  }

  const coreLib = parsingContext.getPhase(CORE_LIB, PhaseFlags.Semantic, false);

  coreLib.directives.reverse().forEach(directive => {
    if (directive instanceof Nodes.ImportDirectiveNode) {
      const newDirective = new Nodes.ImportDirectiveNode(directive.astNode, directive.module);
      newDirective.allItems = directive.allItems;
      newDirective.alias = directive.alias;
      document.directives.unshift(newDirective);
    } else {
      throw new LysError('Only import directives are allowed in system::core, found: ' + directive.nodeName);
    }
  });
}

function summarizeImports(document: Nodes.DocumentNode, parsingContext: ParsingContext) {
  collectImports(document.importedModules, document, parsingContext);
  document.importedModules.delete(document.moduleName);
  document.importedModules.forEach(moduleName => {
    const requiredDocument = parsingContext.getPhase(moduleName, PhaseFlags.Semantic);
    if (requiredDocument !== document) {
      requiredDocument.importedBy.add(document.moduleName);
    }
  });
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
          parsingContext.messageCollector.error(`Invalid location: No loop was found`, node.astNode);
        } else {
          parsingContext.messageCollector.error(`Invalid location. Parent block must return a value`, node.astNode);
          if (relevantParent) {
            parsingContext.messageCollector.error(`Not all paths return a value`, relevantParent.astNode);
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

const validateMutability = walkPreOrder((node: Nodes.Node, parsingContext: ParsingContext) => {
  if (node instanceof Nodes.AssignmentNode) {
    if (node.lhs instanceof Nodes.ReferenceNode && node.lhs.resolvedReference) {
      if (!node.lhs.resolvedReference.referencedNode.hasAnnotation(annotations.MutableDeclaration)) {
        parsingContext.messageCollector.error(
          `${node.lhs.resolvedReference.referencedNode.name} is immutable, reassignment is not allowed.`,
          node.lhs.astNode
        );
      }
    }
  }
});

export function executeNameInitializationPhase(moduleName: string, parsingContext: ParsingContext) {
  const document = parsingContext.getPhase(moduleName, PhaseFlags.NameInitialization - 1);
  assert(document.analysis.nextPhase === PhaseFlags.NameInitialization);
  assert(document.moduleName === moduleName);

  document.scope = new Scope(parsingContext, document.moduleName, null, '');

  injectCoreImport(document, parsingContext);

  createScopes(document, parsingContext, null);

  fixParents(document, parsingContext);

  findImplicitImports(document, parsingContext, null);

  document.analysis.nextPhase++;

  return;
}

export function executeScopePhase(moduleName: string, parsingContext: ParsingContext) {
  const document = parsingContext.getPhase(moduleName, PhaseFlags.Scope - 1);
  assert(document.analysis.nextPhase === PhaseFlags.Scope);

  resolveVariables(document, parsingContext, null);
  findValueNodes(document, parsingContext, null);
  injectImplicitCalls(document, parsingContext, null);
  validateLoops(document, parsingContext);
  validateMutability(document, parsingContext);
  summarizeImports(document, parsingContext);

  document.analysis.nextPhase++;
}
