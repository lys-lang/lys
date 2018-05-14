import * as Nodes from '../nodes';
import { walker } from '../walker';
import { EStoredName } from '../closure';
import { InjectableTypes } from '../types';

const createClosures = walker((node: Nodes.Node, _: Nodes.DocumentNode, parent: Nodes.Node) => {
  if (parent) {
    if (!node.closure) {
      node.closure = parent.closure;
    }

    if (node instanceof Nodes.OverloadedFunctionNode) {
      node.closure.setVariable(node.name, node);
    }

    if (node instanceof Nodes.VarDirectiveNode) {
      node.value.closure = node.closure.newChildClosure();
      node.closure.setVariable(node.variableName.name, node);
    }

    if (node instanceof Nodes.FunctionNode) {
      if (!node.value) {
        throw new Error('Function has no value');
      }

      node.internalIdentifier = node.closure.getInternalIdentifier(node);

      node.closure = node.closure.newChildClosure();

      node.parameters.forEach($ => {
        node.closure.setVariable($.parameterName.name, $);
      });
    }

    if (node instanceof Nodes.TypeDirectiveNode) {
      if (!node.valueType) {
        if (node.variableName.name in InjectableTypes) {
          const type = new InjectableTypes[node.variableName.name]();
          node.ofType = type;
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

const resolveVariables = walker((node: Nodes.Node) => {
  if (node instanceof Nodes.VariableReferenceNode) {
    if (!node.closure.canResolveName(node.variable.name)) {
      throw new Error(`Cannot resolve variable "${node.variable.name}"`);
    }
    node.closure.incrementUsage(node.variable.name);
  }
  if (node instanceof Nodes.TypeReferenceNode) {
    if (!node.closure.canResolveName(node.name)) {
      throw new Error(`Cannot resolve type "${node.name}"`);
    } else {
      const resolved = node.closure.get(node.name);
      if (resolved.type !== EStoredName.TYPE) {
        throw new Error(`Variable "${node.name}" is not a type`);
      }
    }
  }
});

export function scopePhase(node: Nodes.DocumentNode): Nodes.DocumentNode {
  createClosures(node, node, null);
  resolveVariables(node, node, null);

  return node;
}
