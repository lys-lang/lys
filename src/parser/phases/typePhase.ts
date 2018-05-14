import * as Nodes from '../nodes';
import { walker } from '../walker';
import { Type, IntersectionType, FunctionType } from '../types';
import { binaryOperations } from '../../compiler/languageOperations';
import { Closure } from '../closure';

function resolveTypeByName(node: Nodes.Node, name: string) {
  const typeNode = node.closure.getType(name).node as Nodes.TypeDirectiveNode;

  if (!typeNode.ofType) {
    throw new Error(`Cannot resolve type ${name}`);
  }
  return typeNode.ofType;
}

function resolveBinaryOpType(node: Nodes.BinaryExpressionNode): Type {
  const lhsType = node.lhs.ofType;
  const rhsType = node.rhs.ofType;

  const subset = binaryOperations.filter($ => $.operator == node.operator);

  node.binaryOperation = subset.find($ => lhsType.equals($.lhsType) && rhsType.equals($.rhsType));

  if (!node.binaryOperation) throw new Error(`Cannot resolve type of ${lhsType} "${node.operator}" ${rhsType}`);

  return (node.ofType = node.binaryOperation.outputType);
}

function resolveScopeType(closure: Closure, name: string) {
  const node = closure.getType(name).node as Nodes.TypeDirectiveNode;
  return node.ofType;
}

// function findOverloadFunction(inputTypes: Nodes.ExpressionNode[], functions: Nodes.FunctionNode[]) {
//   console.log(inputTypes);
//   console.log(functions);
// }

function resolveType(node: Nodes.Node, failOnError = true): void {
  if (node.ofType) return;

  if (node instanceof Nodes.BinaryExpressionNode) {
    resolveType(node.lhs);
    resolveType(node.rhs);

    node.ofType = resolveBinaryOpType(node);
  }

  if (node instanceof Nodes.TypeReferenceNode) {
    node.ofType = resolveTypeByName(node, node.name);
  }

  if (node instanceof Nodes.BooleanLiteral) {
    node.ofType = resolveTypeByName(node, 'boolean');
  }

  if (node instanceof Nodes.FloatLiteral) {
    node.ofType = resolveTypeByName(node, 'float');
  }

  if (node instanceof Nodes.IntegerLiteral) {
    node.ofType = resolveTypeByName(node, 'int');
  }

  if (node instanceof Nodes.VariableReferenceNode) {
    const decl = node.closure.getVariable(node.variable.name);
    node.ofType = decl.node.ofType;
  }

  if (node instanceof Nodes.ParameterNode) {
    resolveType(node.parameterType);
    node.ofType = node.parameterType.ofType;
  }

  if (node instanceof Nodes.FunctionNode) {
    const fnType = (node.ofType = new FunctionType(node.internalIdentifier));

    fnType.parameterTypes = new Array(node.parameters.length).fill(null);

    node.parameters.forEach(($, $$) => {
      const ofType = resolveScopeType(node.closure, $.parameterType.name);
      fnType.parameterTypes[$$] = $.ofType = ofType;
    });

    if (node.functionReturnType) {
      fnType.returnType = resolveScopeType(node.closure, node.functionReturnType.name);
    }
  }

  if (node instanceof Nodes.FunctionCallNode) {
    resolveType(node.functionNode);

    node.argumentsNode.forEach($ => resolveType($));

    let fnType = node.functionNode.ofType;

    if (fnType instanceof FunctionType) {
      node.functionNode.ofType = fnType;
    } else if (fnType instanceof IntersectionType) {
      // find matching overload
      node.functionNode.ofType = fnType.of[0] as FunctionType;

      // findOverloadFunction(node.argumentsNode, node.functionNode.closure.getVariable(node.functionNode.text).node);
    } else {
      throw new Error(`Expression is not a function`);
    }

    node.ofType = (node.functionNode.ofType as FunctionType).returnType;
  }

  if (!node.ofType && failOnError) {
    throw new Error(`Cannot resolve type of node ${node.nodeName}`);
  }
}

const resolveDeclarations = walker((node: Nodes.Node) => {
  if (node instanceof Nodes.TypeDirectiveNode) {
    resolveType(node);
  }

  if (node instanceof Nodes.OverloadedFunctionNode) {
    node.ofType = new IntersectionType();
  }

  if (node instanceof Nodes.FunDirectiveNode) {
    resolveType(node.functionNode);
    node.ofType = node.functionNode.ofType;
  }
});

const resolveOverloads = walker((node: Nodes.Node) => {
  if (node instanceof Nodes.OverloadedFunctionNode) {
    const ofType: IntersectionType = node.ofType as any;
    ofType.of = node.functions.map($ => $.ofType);
  }
});

const resolveVariables = walker((node: Nodes.Node) => {
  if (node instanceof Nodes.VarDirectiveNode || node instanceof Nodes.ParameterNode) {
    resolveType(node);
  }
});

const checkTypes = walker((node: Nodes.Node) => {
  resolveType(node, false);
  if (node instanceof Nodes.FunctionNode) {
    if (!node.functionReturnType) {
      throw new Error('Function has no return type');
    }
  }
});

const ensureReturnTypes = walker((node: Nodes.Node) => {
  if (node instanceof Nodes.FunctionNode) {
    if (node.functionReturnType) {
      if (!node.functionReturnType.ofType.canAssign(node.value.ofType)) {
        throw new Error(`Type "${node.value.ofType}" cannot be assigned to "${node.functionReturnType.ofType}"`);
      }
    }
  }
});

export function typePhase(node: Nodes.DocumentNode): Nodes.DocumentNode {
  resolveDeclarations(node, node, null);
  resolveOverloads(node, node, null);
  resolveVariables(node, node, null);
  checkTypes(node, node, null);
  ensureReturnTypes(node, node, null);

  return node;
}
