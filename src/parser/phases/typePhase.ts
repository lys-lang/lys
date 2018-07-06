import { Nodes } from '../nodes';
import { walkPostOrder } from '../walker';
import { Type, IntersectionType, FunctionType, UnionType, VoidType } from '../types';
import { findBuiltInTypedBinaryOperation } from '../../compiler/languageOperations';
import { Closure } from '../closure';
import { annotations } from '../annotations';
import { last } from '../helpers';

function resolveTypeByName(node: Nodes.Node, name: string) {
  const typeNode = node.closure.getType(name).node as Nodes.TypeDirectiveNode;

  if (!typeNode.ofType) {
    throw new Error(`Cannot resolve type ${name}`);
  }

  return typeNode.ofType;
}

function resolveBinaryOpType(node: Nodes.BinaryExpressionNode): Type {
  node.binaryOperation = findBuiltInTypedBinaryOperation(node.operator, node.lhs.ofType, node.rhs.ofType);

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

  if (node instanceof Nodes.BlockNode) {
    if (node.hasAnnotation(annotations.IsValueNode) && node.statements.length > 0) {
      node.statements.forEach($ => resolveType($));
      node.ofType = last(node.statements).ofType;
    } else {
      node.ofType = new VoidType();
    }
  }

  if (node instanceof Nodes.TypeReferenceNode) {
    node.ofType = resolveTypeByName(node, node.name);
  }

  if (node instanceof Nodes.BooleanLiteral) {
    node.ofType = resolveTypeByName(node, 'boolean');
  }

  if (node instanceof Nodes.FloatLiteral) {
    node.ofType = resolveTypeByName(node, 'f32');
  }

  if (node instanceof Nodes.IntegerLiteral) {
    node.ofType = resolveTypeByName(node, 'i32');
  }

  if (node instanceof Nodes.MatcherNode) {
    node.ofType = node.rhs.ofType;
  }

  if (node instanceof Nodes.MatchNode) {
    const union = new UnionType();
    resolveType(node.lhs);

    union.of = node.matchingSet.map($ => $.ofType);
    node.ofType = union.simplify();

    node.matchingSet.forEach($ => {
      if ($ instanceof Nodes.MatchConditionNode) {
        $.declaredName.ofType = node.lhs.ofType;
      }
    });
  }

  if (node instanceof Nodes.IfNode) {
    if (node.hasAnnotation(annotations.IsValueNode)) {
      const union = new UnionType();
      union.of = [node.truePart.ofType, node.falsePart.ofType];
      node.ofType = union.simplify();
    } else {
      node.ofType = new VoidType();
    }
  }

  if (node instanceof Nodes.VariableReferenceNode) {
    const decl = node.closure.getVariable(node.variable.name);
    node.ofType = decl.node.ofType;
  }

  if (node instanceof Nodes.VarDeclarationNode) {
    resolveType(node.variableType);
    node.ofType = node.variableType.ofType;
  }

  if (node instanceof Nodes.VarDirectiveNode) {
    resolveType(node.decl.variableType);
    node.ofType = node.decl.variableType.ofType;
  }

  if (node instanceof Nodes.ParameterNode) {
    resolveType(node.parameterType);
    node.ofType = node.parameterType.ofType;
  }

  if (node instanceof Nodes.AssignmentNode) {
    resolveType(node.value);
    node.ofType = node.value.ofType;
  }

  if (node instanceof Nodes.FunctionNode) {
    const fnType = (node.ofType = new FunctionType(node.internalIdentifier));

    fnType.parameterTypes = new Array(node.parameters.length).fill(null);

    node.parameters.forEach(($, $$) => {
      const ofType = resolveScopeType(node.closure, $.parameterType.name);
      node.localsByIndex[$$].type = fnType.parameterTypes[$$] = $.ofType = ofType;
    });

    if (node.functionReturnType) {
      fnType.returnType = resolveScopeType(node.closure, node.functionReturnType.name);
    }
  }

  if (node instanceof Nodes.FunctionCallNode) {
    resolveType(node.functionNode);

    node.argumentsNode.forEach($ => resolveType($));

    const argumentTypes = node.argumentsNode.map($ => $.ofType);

    let fnType = node.functionNode.ofType;

    let overloadFunctions: FunctionType[] = [];

    if (fnType instanceof FunctionType) {
      overloadFunctions = [fnType];
    } else if (fnType instanceof IntersectionType) {
      overloadFunctions = fnType.of as FunctionType[];
    } else {
      throw new Error(`Expression is not a function`);
    }

    // find matching overload
    node.functionNode.ofType = overloadFunctions.find(($: FunctionType) => $.acceptsTypes(argumentTypes));

    if (!node.functionNode.ofType) {
      const overloads = overloadFunctions.map(($: FunctionType) => '  (' + $.parameterTypes.join(',') + ')').join('\n');
      node.ofType = new VoidType();
      throw new Error(`No overload found for arguments\n  (${argumentTypes.join(',')})\ngot:\n${overloads}`);
    }

    node.ofType = (node.functionNode.ofType as FunctionType).returnType;
  }

  if (!node.ofType && failOnError) {
    throw new Error(`Cannot resolve type of node ${node.nodeName}`);
  }
}

const resolveDeclarations = walkPostOrder((node: Nodes.Node) => {
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

const resolveOverloads = walkPostOrder((node: Nodes.Node) => {
  if (node instanceof Nodes.OverloadedFunctionNode) {
    const ofType: IntersectionType = node.ofType as any;
    ofType.of = node.functions.map($ => $.ofType);
  }
});

const resolveVariables = walkPostOrder((node: Nodes.Node) => {
  if (
    node instanceof Nodes.VarDirectiveNode ||
    node instanceof Nodes.ParameterNode ||
    node instanceof Nodes.VarDeclarationNode
  ) {
    resolveType(node);
  }
});

const checkTypes = walkPostOrder((node: Nodes.Node) => {
  resolveType(node, false);
  if (node instanceof Nodes.FunctionNode) {
    if (!node.functionReturnType) {
      throw new Error('Function has no return type');
    }
  }
});

const ensureReturnTypes = walkPostOrder((node: Nodes.Node) => {
  if (node instanceof Nodes.AssignmentNode) {
    if (!node.variableName.ofType.canAssign(node.value.ofType)) {
      throw new Error(`Type "${node.value.ofType}" cannot be assigned to "${node.variableName.ofType}"`);
    }
  }

  if (node instanceof Nodes.FunctionNode) {
    if (!node.body.ofType) {
      throw new Error('Cannot infer function return type');
    } else if (node.functionReturnType) {
      if (!node.functionReturnType.ofType.canAssign(node.body.ofType)) {
        throw new Error(`Type "${node.body.ofType}" cannot be assigned to "${node.functionReturnType.ofType}"`);
      }
    }
  }

  if (node.hasAnnotation(annotations.IsValueNode) && !node.ofType) {
    throw new Error('Cannot infer type of node ' + node.nodeName);
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
