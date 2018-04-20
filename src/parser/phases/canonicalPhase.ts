import { IToken, TokenError } from 'ebnf';
import * as Nodes from '../nodes';

const visitor = {
  VarDirective(astNode: IToken) {
    const ret = new Nodes.VarDirectiveNode(astNode);

    ret.isExported = !!findChildrenType(astNode, 'ExportModifier');
    ret.variableName = visit(findChildrenType(astNode, 'NameIdentifier'));
    ret.variableType = visit(findChildrenType(astNode, 'Type'));
    ret.value = visitLastChild(astNode);

    return ret;
  },
  ValDirective(astNode: IToken) {
    const ret = new Nodes.ValDirectiveNode(astNode);

    ret.isExported = !!findChildrenType(astNode, 'ExportModifier');
    ret.variableName = visit(findChildrenType(astNode, 'NameIdentifier'));
    ret.variableType = visit(findChildrenType(astNode, 'Type'));
    ret.value = visitLastChild(astNode);

    return ret;
  },
  FunctionDirective(astNode: IToken) {
    const ret = new Nodes.FunDirectiveNode(astNode);

    ret.isExported = !!findChildrenType(astNode, 'ExportModifier');
    ret.functionName = visit(findChildrenType(astNode, 'NameIdentifier'));
    ret.functionReturnType = visit(findChildrenType(astNode, 'Type'));
    ret.value = visitLastChild(astNode);

    return ret;
  },
  VariableReference(astNode: IToken) {
    const ret = new Nodes.VariableReferenceNode(astNode);
    ret.variable = visit(findChildrenType(astNode, 'NameIdentifier'));
    return ret;
  },
  NameIdentifier(astNode: IToken) {
    const ret = new Nodes.NameIdentifierNode(astNode);
    ret.name = astNode.text.trim();
    return ret;
  },
  Type(astNode: IToken) {
    const ret = new Nodes.TypeReferenceNode(astNode);
    ret.name = findChildrenType(astNode, 'NameIdentifier').text.trim();
    ret.isPointer = findChildrenType(astNode, 'IsPointer') ? 1 : 0;
    ret.isArray = !!findChildrenType(astNode, 'IsArray');
    return ret;
  },
  NumberLiteral(x: IToken) {
    if (x.text.includes('.') || x.text.includes('E') || x.text.includes('e')) {
      return new Nodes.FloatLiteral(x);
    } else {
      return new Nodes.IntegerLiteral(x);
    }
  },
  BooleanLiteral(x: IToken) {
    return new Nodes.BooleanLiteral(x);
  },
  NullLiteral(x: IToken) {
    return new Nodes.NullLiteral(x);
  },
  Document(astNode: IToken) {
    const doc = new Nodes.DocumentNode(astNode);

    doc.directives = astNode.children.map($ => visit($));

    return doc;
  }
};

function visit(astNode: IToken): any {
  if (!astNode) return null;
  if (visitor[astNode.type]) {
    return visitor[astNode.type](astNode);
  } else {
    throw new TokenError(`Visitor not implemented for ${astNode.type}`, astNode);
  }
}

function findChildrenType(token: IToken, type: string) {
  return token.children.find($ => $.type == type);
}

function visitLastChild(token: IToken) {
  return visit(token.children[token.children.length - 1]);
}

export function canonicalPhase(astNode: IToken): Nodes.DocumentNode {
  return visit(astNode);
}
