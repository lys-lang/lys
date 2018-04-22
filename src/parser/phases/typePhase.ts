import * as Nodes from '../nodes';
import { walker } from '../walker';
import { Type } from '../types';
import { binaryOperations } from '../../compiler/languageOperations';

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
  if (!node.ofType && failOnError) {
    throw new Error(`Cannot resolve type of node ${node.nodeName}`);
  }
}

const resolveDeclarations = walker((node: Nodes.Node) => {
  if (node instanceof Nodes.TypeDirectiveNode) {
    resolveType(node);
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

export function typePhase(node: Nodes.DocumentNode): Nodes.DocumentNode {
  resolveDeclarations(node, node, null);
  resolveVariables(node, node, null);
  checkTypes(node, node, null);

  return node;
}
