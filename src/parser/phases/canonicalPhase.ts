import { IToken, TokenError } from 'ebnf';
import { Nodes } from '../nodes';
import { failIfErrors } from './findAllErrors';
import { PhaseResult } from './PhaseResult';
import { ParsingPhaseResult } from './parsingPhase';

function binaryOpVisitor(astNode: IToken) {
  let ret = visit(astNode.children[0]) as Nodes.BinaryExpressionNode;

  for (let i = 1; i < astNode.children.length; i += 2) {
    const oldRet = ret;
    ret = new Nodes.BinaryExpressionNode(astNode);
    ret.lhs = oldRet;
    ret.operator = astNode.children[i].text;
    ret.rhs = visit(astNode.children[i + 1]);
  }

  return ret;
}

const visitor = {
  VarDirective(astNode: IToken) {
    const ret = new Nodes.VarDirectiveNode(astNode);

    ret.isExported = !findChildrenType(astNode, 'PrivateModifier');

    ret.decl = visit(findChildrenType(astNode, 'VarDeclaration'));

    return ret;
  },
  ValDirective(astNode: IToken) {
    const ret = new Nodes.ValDirectiveNode(astNode);

    ret.decl = visit(findChildrenType(astNode, 'ValDeclaration'));

    return ret;
  },
  VarDeclaration(astNode: IToken) {
    const ret = new Nodes.VarDeclarationNode(astNode);

    ret.variableName = visit(findChildrenType(astNode, 'NameIdentifier'));
    ret.variableType = visit(findChildrenType(astNode, 'Type'));
    ret.value = visitLastChild(astNode);

    return ret;
  },
  ValDeclaration(astNode: IToken) {
    const ret = new Nodes.ValDeclarationNode(astNode);

    ret.variableName = visit(findChildrenType(astNode, 'NameIdentifier'));
    ret.variableType = visit(findChildrenType(astNode, 'Type'));
    ret.value = visitLastChild(astNode);

    return ret;
  },
  AssignStatement(astNode: IToken) {
    const ret = new Nodes.AssignmentNode(astNode);
    ret.variable = visit(astNode.children[0]);
    ret.value = visit(astNode.children[1]);
    return ret;
  },
  TypeDirective(astNode: IToken) {
    const ret = new Nodes.TypeDirectiveNode(astNode);
    const children = astNode.children.slice();

    let child = children.shift();

    if (child.type === 'PrivateModifier') {
      ret.isExported = false;
      child = children.shift();
    } else {
      ret.isExported = true;
    }

    child; // this is the type kind

    child = children.shift(); // this is the NameIdentifier

    ret.variableName = visit(child);

    if (children.length) {
      ret.valueType = visitLastChild(astNode) as Nodes.TypeNode;
    } else {
      ret.valueType = null;
    }

    return ret;
  },
  FunDeclaration(astNode: IToken) {
    const fun = new Nodes.FunctionNode(astNode);

    fun.functionName = visit(findChildrenType(astNode, 'NameIdentifier'));
    fun.functionReturnType = visit(findChildrenType(astNode, 'Type'));

    const params = findChildrenType(astNode, 'FunctionParamsList');

    if (!params) {
      throw new TokenError('Missing param list in function declaration', astNode);
    }

    fun.parameters = params.children.map($ => visit($));
    fun.body = visitLastChild(astNode);

    return fun;
  },
  FunctionDirective(astNode: IToken) {
    const ret = new Nodes.FunDirectiveNode(astNode);

    ret.isExported = !findChildrenType(astNode, 'PrivateModifier');

    ret.functionNode = visit(findChildrenType(astNode, 'FunDeclaration')) as Nodes.FunctionNode;

    return ret;
  },
  CodeBlock(astNode: IToken) {
    const ret = new Nodes.BlockNode(astNode);
    ret.statements = astNode.children.map($ => visit($)).filter($ => !!$);
    return ret;
  },
  FunctionCallExpression(astNode: IToken) {
    const ret = new Nodes.FunctionCallNode(astNode);
    ret.functionNode = visit(astNode.children[0]);
    ret.argumentsNode = astNode.children[1].children.map($ => visit($));

    return ret;
  },
  Parameter(astNode: IToken) {
    const ret = new Nodes.ParameterNode(astNode);
    ret.parameterName = visit(findChildrenType(astNode, 'NameIdentifier'));
    ret.parameterType = visit(findChildrenType(astNode, 'Type'));
    return ret;
  },
  AddExpression: binaryOpVisitor,
  OrExpression: binaryOpVisitor,
  AndExpression: binaryOpVisitor,
  RelExpression: binaryOpVisitor,
  EqExpression: binaryOpVisitor,
  ShiftExpression: binaryOpVisitor,
  MulExpression: binaryOpVisitor,
  ParenExpression(astNode: IToken) {
    const ret = visitLastChild(astNode);
    ret.hasParentheses = true;
    return ret;
  },
  Expression(astNode: IToken) {
    let ret = visit(astNode.children[0]);

    for (let i = 1; i < astNode.children.length; i += 2) {
      const oldRet = ret;
      if (astNode.children[i].type === 'MatchKeyword') {
        const match = (ret = new Nodes.PatternMatcherNode(astNode.children[i]));
        match.lhs = oldRet;
        match.matchingSet = astNode.children[i + 1].children.map($ => visit($));
      } else {
        const doesItHaveCallArguments = !!astNode.children[i + 1];

        if (doesItHaveCallArguments) {
          const x = (ret = new Nodes.FunctionCallNode(astNode.children[i]));
          x.isInfix = true;
          const vrn = (x.functionNode = new Nodes.VariableReferenceNode(astNode.children[i]));
          vrn.variable = new Nodes.NameIdentifierNode(astNode.children[i]);
          vrn.variable.name = astNode.children[i].text;

          x.argumentsNode = [oldRet, ...astNode.children[i + 1].children.map($ => visit($))];
        } else {
          // it is a member selection
        }
      }
    }

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
  FunctionTypeParameter(astNode: IToken) {
    const ret = new Nodes.FunctionParameterTypeNode(astNode);

    ret.name = visitChildTypeOrNull(astNode, 'NameIdentifier') as Nodes.NameIdentifierNode;
    ret.parameterType = visitChildTypeOrNull(astNode, 'Type') as Nodes.TypeNode;

    return ret;
  },
  TypeAlias(astNode: IToken) {
    return visitChildTypeOrNull(astNode, 'Type');
  },
  TypeReference(child: IToken) {
    const ret = new Nodes.TypeReferenceNode(child);
    ret.name = visit(findChildrenType(child, 'NameIdentifier'));
    // ret.isPointer = findChildrenType(astNode, 'IsPointer') ? 1 : 0;
    // ret.isArray = !!findChildrenType(astNode, 'IsArray');
    return ret;
  },
  FunctionTypeLiteral(child: IToken) {
    const ret = new Nodes.FunctionTypeNode(child);

    const parametersNode = findChildrenType(child, 'FunctionTypeParameters');

    if (parametersNode) {
      ret.parameters = parametersNode.children.map($ => visit($));
    } else {
      ret.parameters = [];
    }

    ret.returnType = visitChildTypeOrNull(child, 'Type') as Nodes.TypeNode;

    return ret;
  },
  Type(astNode: IToken) {
    return visit(astNode.children[0]);
  },
  // MatchBody(x: IToken) {
  //   return x.children.map($ => visit($));
  // },
  CaseLiteral(x: IToken) {
    const ret = new Nodes.MatchLiteralNode(x);
    ret.literal = visit(x.children[0]);
    ret.rhs = visit(x.children[1]);
    return ret;
  },
  CaseCondition(x: IToken) {
    const ret = new Nodes.MatchConditionNode(x);
    ret.declaredName = visit(x.children[0]);
    ret.condition = visit(x.children[1]);
    ret.rhs = visit(x.children[2]);
    return ret;
  },
  CaseElse(x: IToken) {
    const ret = new Nodes.MatchDefaultNode(x);
    ret.rhs = visit(x.children[0]);
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
    doc.textContent = astNode.text;
    doc.directives = astNode.children.map($ => visit($));

    return doc;
  },
  IfExpression(astNode: IToken) {
    const ret = new Nodes.IfNode(astNode);
    ret.condition = visit(astNode.children[0]);
    ret.truePart = visit(astNode.children[1]);
    ret.falsePart = visit(astNode.children[2]);
    return ret;
  },
  SyntaxError(_: IToken) {
    return null;
  }
};

function visit<T extends Nodes.Node>(astNode: IToken): T {
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

function visitChildTypeOrNull(token: IToken, type: string) {
  const child = findChildrenType(token, type);
  if (!child) return null;
  return visit(child);
}

function visitLastChild(token: IToken) {
  return visit(token.children[token.children.length - 1]);
}

export class CanonicalPhaseResult extends PhaseResult {
  document: Nodes.DocumentNode;

  constructor(public parsingPhaseResult: ParsingPhaseResult) {
    super();
    this.execute();
  }

  protected execute() {
    this.document = visit(this.parsingPhaseResult.document);

    failIfErrors('Canonical phase', this.document, this);
  }
}
