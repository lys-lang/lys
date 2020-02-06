import { Nodes } from '../compiler/nodes';
import { indent } from './astPrinter';
import { annotations } from '../compiler/annotations';

function printDecorators(node: Nodes.DirectiveNode) {
  if (node.decorators && node.decorators.length) {
    return node.decorators.map($ => printNode($)).join('');
  }
  return '';
}

function privatePrint(node: Nodes.Node): string {
  if (!node) {
    throw new Error('Trying to print a null node');
  }

  if (node instanceof Nodes.NameIdentifierNode) {
    return node.name;
  } else if (node instanceof Nodes.QNameNode) {
    return node.text;
  } else if (node instanceof Nodes.SignatureParameterNode) {
    if (node.parameterName) {
      return `${printNode(node.parameterName)}: ${printNode(node.parameterType)}`;
    } else {
      return `${printNode(node.parameterType)}`;
    }
  } else if (node instanceof Nodes.FunctionTypeNode) {
    return `fun(${node.parameters.map(printNode).join(', ')}) -> ${printNode(node.returnType!)}`;
  } else if (node instanceof Nodes.ReferenceNode) {
    return printNode(node.variable);
  } else if (node instanceof Nodes.DecoratorNode) {
    return '#[' + printNode(node.decoratorName) + node.args.map($ => ' ' + printNode($)).join('') + ']\n';
  } else if (node instanceof Nodes.BlockNode) {
    if (!node.statements.length) return '{}';
    return '{\n' + indent(node.statements.map(printNode).join('\n')) + '\n}';
  } else if (node instanceof Nodes.MemberNode) {
    const memberName = printNode(node.memberName);

    if (!node.operator && memberName === 'apply') {
      return printNode(node.lhs);
    }

    return printNode(node.lhs) + node.operator + memberName;
  } else if (node instanceof Nodes.DocumentNode) {
    return node.directives.map(printNode).join('\n\n');
  } else if (node instanceof Nodes.FunctionNode) {
    const bodyText = node.body ? printNode(node.body) : '';

    const body =
      bodyText &&
      (node.body instanceof Nodes.BlockNode ||
        node.body instanceof Nodes.WasmExpressionNode ||
        !bodyText.includes('\n'))
        ? ' = ' + bodyText
        : ' =\n' + indent(bodyText);

    const retType = node.functionReturnType ? ': ' + printNode(node.functionReturnType) : '';

    const params = node.parameters.map(printNode).join(', ');

    const functionName = printNode(node.functionName);

    return `fun ${functionName}(${params})${retType}${body}`;
  } else if (node instanceof Nodes.ContinueNode) {
    return 'continue';
  } else if (node instanceof Nodes.BreakNode) {
    return 'break';
  } else if (node instanceof Nodes.LoopNode) {
    const bodyText = printNode(node.body);

    const body =
      node.body instanceof Nodes.BlockNode || node.body instanceof Nodes.WasmExpressionNode || !bodyText.includes('\n')
        ? ' ' + bodyText
        : '\n' + indent(bodyText);

    return `loop${body}`;
  } else if (node instanceof Nodes.ImplDirective) {
    if (node.baseImpl) {
      return `impl ${printNode(node.baseImpl)} for ${printNode(node.targetImpl)} {\n${indent(
        node.directives.map(printNode).join('\n\n')
      )}\n}`;
    } else {
      return `impl ${printNode(node.targetImpl)} {\n${indent(node.directives.map(printNode).join('\n\n'))}\n}`;
    }
  } else if (node instanceof Nodes.ImportDirectiveNode) {
    return `import ${printNode(node.module)}`;
  } else if (node instanceof Nodes.FunDirectiveNode) {
    return printDecorators(node) + (node.isPublic ? '' : 'private ') + printNode(node.functionNode);
  } else if (node instanceof Nodes.EffectDirectiveNode) {
    return printDecorators(node) + (node.isPublic ? '' : 'private ') + printNode(node.effect!);
  } else if (node instanceof Nodes.OverloadedFunctionNode) {
    return node.functions.map(printNode).join('\n');
  } else if (node instanceof Nodes.AssignmentNode) {
    return `${printNode(node.lhs)} = ${printNode(node.rhs)}`;
  } else if (node instanceof Nodes.LiteralNode) {
    return `${node.astNode.text}`;
  } else if (node instanceof Nodes.InjectedFunctionCallNode) {
    return `/* <Injected function call> */\n${indent(
      node.argumentsNode.map(printNode).join('\n')
    )}\n/* </Injected function call> */`;
  } else if (node instanceof Nodes.FunctionCallNode) {
    return printNode(node.functionNode) + '(' + node.argumentsNode.map(printNode).join(', ') + ')';
  } else if (node instanceof Nodes.BinaryExpressionNode) {
    return `${printNode(node.lhs)} ${node.operator.name} ${printNode(node.rhs)}`;
  } else if (node instanceof Nodes.AsExpressionNode) {
    return `${printNode(node.lhs)} as ${printNode(node.rhs)}`;
  } else if (node instanceof Nodes.IsExpressionNode) {
    return `${printNode(node.lhs)} is ${printNode(node.rhs)}`;
  } else if (node instanceof Nodes.UnaryExpressionNode) {
    return `${node.operator.name}${printNode(node.rhs)}`;
  } else if (node instanceof Nodes.WasmAtomNode) {
    return `(${node.symbol}${node.args.map($ => ' ' + printNode($)).join('')})`;
  } else if (node instanceof Nodes.WasmExpressionNode) {
    return `%wasm {\n${indent(node.atoms.map(printNode).join('\n'))}\n}`;
  } else if (node instanceof Nodes.StructTypeNode) {
    return `%struct { ${node.parameters.map(printNode).join(', ')} }`;
  } else if (node instanceof Nodes.InjectedTypeNode) {
    return `%injected`;
  } else if (node instanceof Nodes.StackTypeNode) {
    return `%stack { ${Object.entries(node.metadata)
      .map(([key, value]) => key + '=' + printNode(value))
      .join(' ')} }`;
  } else if (node instanceof Nodes.IfNode) {
    const printTrue = () => {
      if (node.truePart instanceof Nodes.BlockNode) {
        return ' ' + printNode(node.truePart) + (node.falsePart ? ' ' : '');
      } else {
        return '\n' + indent(printNode(node.truePart)) + '\n';
      }
    };

    const printFalse = () => {
      if (node.falsePart instanceof Nodes.IfNode) {
        return ' ' + printNode(node.falsePart);
      } else if (node.falsePart instanceof Nodes.BlockNode) {
        return ' ' + printNode(node.falsePart);
      } else {
        return '\n' + indent(printNode(node.falsePart!)) + '\n';
      }
    };

    if (node.falsePart) {
      return `if (${printNode(node.condition)})${printTrue()}else${printFalse()}`;
    } else {
      return `if (${printNode(node.condition)})${printTrue()}`;
    }
  } else if (node instanceof Nodes.UnknownExpressionNode) {
    return '???';
  } else if (node instanceof Nodes.UnionTypeNode) {
    return node.of.length > 1 ? '(' + node.of.map(printNode).join(' | ') + ')' : node.of.map(printNode).join(' | ');
  } else if (node instanceof Nodes.IntersectionTypeNode) {
    return node.of.length > 1 ? '(' + node.of.map(printNode).join(' & ') + ')' : node.of.map(printNode).join(' & ');
  } else if (node instanceof Nodes.StructDeclarationNode) {
    return `struct ${printNode(node.declaredName)}(${node.parameters.map(printNode).join(', ')})`;
  } else if (node instanceof Nodes.EffectDeclarationNode) {
    return `effect ${printNode(node.name)} {\n${indent(node.elements!.map(printNode).join('\n'))}\n}`;
  } else if (node instanceof Nodes.PatternMatcherNode) {
    return `match ${printNode(node.lhs)} {\n${indent(node.matchingSet.map(printNode).join('\n'))}\n}`;
  } else if (node instanceof Nodes.MatchConditionNode) {
    return `case if ${printNode(node.condition)} -> ${printNode(node.rhs)}`;
  } else if (node instanceof Nodes.MatchDefaultNode) {
    return `else -> ${printNode(node.rhs)}`;
  } else if (node instanceof Nodes.MatchLiteralNode) {
    return `case ${printNode(node.literal)} -> ${printNode(node.rhs)}`;
  } else if (node instanceof Nodes.VarDirectiveNode) {
    return (node.isPublic ? '' : 'private ') + printNode(node.decl);
  } else if (node instanceof Nodes.MatchCaseIsNode) {
    const declaredName = node.declaredName && node.declaredName.name !== '$' ? `${printNode(node.declaredName)} ` : ``;

    if (node.deconstructorNames && node.deconstructorNames.length) {
      return `case ${declaredName}is ${printNode(node.typeReference)}(${node.deconstructorNames
        .map(printNode)
        .join(', ')}) -> ${printNode(node.rhs)}`;
    } else {
      return `case ${declaredName}is ${printNode(node.typeReference)} -> ${printNode(node.rhs)}`;
    }
  } else if (node instanceof Nodes.TypeDirectiveNode) {
    if (node.valueType) {
      return `type ${printNode(node.variableName)} = ${printNode(node.valueType)}`;
    } else {
      return `type ${printNode(node.variableName)}`;
    }
  } else if (node instanceof Nodes.EnumDirectiveNode) {
    const types = indent(node.declarations.map($ => printNode($)).join('\n'));

    return `enum ${printNode(node.variableName)} {\n${types}\n}`;
  } else if (node instanceof Nodes.TraitDirectiveNode) {
    const types = indent(node.directives.map($ => printNode($)).join('\n'));

    return `trait ${printNode(node.traitName)} {\n${types}\n}`;
  } else if (node instanceof Nodes.VarDeclarationNode) {
    return (
      (node.variableName.hasAnnotation(annotations.MutableDeclaration) ? 'var ' : 'val ') +
      printNode(node.variableName) +
      (node.variableType ? ': ' + printNode(node.variableType) : '') +
      ' = ' +
      printNode(node.value)
    );
  } else if (node instanceof Nodes.ParameterNode) {
    if (node.defaultValue) {
      return (
        printNode(node.parameterName) +
        (node.parameterType ? ': ' + printNode(node.parameterType) : '') +
        ' = ' +
        printNode(node.defaultValue)
      );
    }

    if (node.parameterType) {
      return printNode(node.parameterName) + ': ' + printNode(node.parameterType);
    } else {
      return printNode(node.parameterName);
    }
  } else if (node instanceof Nodes.TypeReducerNode) {
    return '';
  }

  throw new Error(node.nodeName + ' cannot be printed');
}

export function printNode(node: Nodes.Node): string {
  if (node.hasParentheses) {
    return `(${privatePrint(node)})`;
  }
  return privatePrint(node);
}
