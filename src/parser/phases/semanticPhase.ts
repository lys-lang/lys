import * as Nodes from '../nodes';
import { walker } from '../walker';
import { TokenError } from 'ebnf';
import { Context, Closure } from '../closure';
import { InjectableTypes } from '../types';

const overloadFunctions = function(document: Nodes.DocumentNode) {
  const overloadedFunctions: Map<string, Nodes.OverloadedFunctionNode | Nodes.FunDirectiveNode> = new Map();

  const process = walker((node: Nodes.Node, _: Nodes.DocumentNode) => {
    if (node instanceof Nodes.FunDirectiveNode) {
      const name = node.functionNode.functionName.name;
      const x = overloadedFunctions.get(name);
      if (x) {
        if (x instanceof Nodes.OverloadedFunctionNode) {
          x.functions.push(node);
        } else {
          const overloaded = new Nodes.OverloadedFunctionNode(node.astNode);
          overloadedFunctions.set(name, overloaded);
          overloaded.functions = [x];
        }
      } else {
        const overloaded = new Nodes.OverloadedFunctionNode(node.astNode);
        overloadedFunctions.set(name, overloaded);
        overloaded.functions = [node];
      }
    }
  });

  process(document);

  document.directives = document.directives.filter($ => !($ instanceof Nodes.FunDirectiveNode));

  overloadedFunctions.forEach($ => {
    document.directives.push($);
  });

  return document;
};

const createClosures = walker((node: Nodes.Node, _: Nodes.DocumentNode, parent: Nodes.Node) => {
  if (parent) {
    if (!node.closure) {
      node.closure = parent.closure;
    }

    if (node instanceof Nodes.OverloadedFunctionNode) {
      node.closure.setVariable(node.name, node);
    }

    if (node instanceof Nodes.FunDirectiveNode) {
      // node.functionNode = new Nodes.ContextAwareFunction(node.functionNode, node.closure.newChildClosure());
      node.closure.setVariable(node.functionNode.functionName.name, node.functionNode);
      node.functionNode.closure = node.closure.newChildClosure();
    }

    if (node instanceof Nodes.VarDirectiveNode) {
      node.value.closure = node.closure.newChildClosure();
      node.closure.setVariable(node.variableName.name, node);
    }

    if (node instanceof Nodes.FunctionNode) {
      if (!node.value) {
        throw new Error('Function has no value');
      }
      const childClosure = (node.value.closure = node.closure.newChildClosure());
      node.parameters.forEach($ => {
        childClosure.setVariable($.parameterName.name, $);
      });
    }

    if (node instanceof Nodes.TypeDirectiveNode) {
      if (!node.valueType) {
        if (node.variableName.name in InjectableTypes) {
          const type = new InjectableTypes[node.variableName.name]();
          node.resolvedType = type;
        } else {
          throw new Error(`Cannot resolve type "${node.variableName.name}"`);
        }
      } else {
        node.valueType.closure = node.closure.newChildClosure();
      }
      node.closure.setType(node.variableName.name, node);
    }
  }
});

const checkDuplicatedNames = walker((node: Nodes.Node, _: Nodes.DocumentNode, parent: Nodes.Node) => {
  if (node instanceof Nodes.FunctionNode) {
    let used = [];
    node.parameters.forEach(param => {
      if (used.indexOf(param.parameterName.name) == -1) {
        used.push(param.parameterName.name);
      } else {
        throw new TokenError(`Duplicated parameter "${param.parameterName.name}"`, node.astNode);
      }
    });
  }

  if (node instanceof Nodes.MatchNode) {
    if (node.matchingSet.length == 0) {
      throw new TokenError(`Invalid match expression, there are no matchers`, node.astNode);
    }
    if (node.matchingSet.length == 1 && node.matchingSet[0] instanceof Nodes.MatchDefaultNode) {
      throw new TokenError(`This match is useless`, node.astNode);
    }
  }

  if (node instanceof Nodes.MatchConditionNode && parent instanceof Nodes.MatchNode) {
    const innerClosure = node.closure.newChildClosure();
    innerClosure.setVariable(node.declaredName.name, parent.lhs);
  }
});

const resolveVariables = walker((node: Nodes.Node) => {
  if (node instanceof Nodes.VariableReferenceNode) {
    const tapeElement = node.closure.getVariable(node.variable.name);
    node.resolvedTapeElement = tapeElement;
  }
  if (node instanceof Nodes.TypeReferenceNode) {
    const tapeElement = node.closure.getType(node.name);
    node.resolvedTapeElement = tapeElement;
  }
});

export function semanticPhase(node: Nodes.DocumentNode): Nodes.DocumentNode {
  node.context = new Context();
  node.closure = new Closure(node.context);
  overloadFunctions(node);
  checkDuplicatedNames(node, node);
  createClosures(node, node, null);
  resolveVariables(node, node, null);

  return node;
}
