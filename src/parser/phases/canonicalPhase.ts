import { IToken, TokenError } from 'ebnf';
import { Nodes } from '../nodes';
import { failIfErrors } from './findAllErrors';
import { PhaseResult } from './PhaseResult';
import { ParsingPhaseResult } from './parsingPhase';
import { ParsingContext } from '../closure';

function binaryOpVisitor(astNode: IToken) {
  let ret = visit(astNode.children[0]) as Nodes.BinaryExpressionNode | Nodes.AsExpressionNode | Nodes.IsExpressionNode;

  for (let i = 1; i < astNode.children.length; i += 2) {
    const oldRet = ret;
    const opertator = astNode.children[i].text;

    if (opertator === 'as') {
      ret = new Nodes.AsExpressionNode(astNode);
    } else if (opertator === 'is') {
      ret = new Nodes.IsExpressionNode(astNode);
    } else {
      const op = (ret = new Nodes.BinaryExpressionNode(astNode));
      op.operator = new Nodes.NameIdentifierNode(astNode.children[i]);
      op.operator.name = opertator;
    }

    ret.lhs = oldRet;
    ret.rhs = visit(astNode.children[i + 1]);
  }

  return ret;
}

const visitor = {
  ImportDirective(astNode: IToken) {
    const ret = new Nodes.ImportDirectiveNode(astNode);
    ret.module = visitChildTypeOrNull(astNode, 'QName') as Nodes.QNameNode;
    ret.alias = visitChildTypeOrNull(astNode, 'NameIdentifier') as Nodes.NameIdentifierNode;
    return ret;
  },
  VarDirective(astNode: IToken) {
    const ret = new Nodes.VarDirectiveNode(astNode);

    ret.isExported = !findChildrenType(astNode, 'PrivateModifier');

    ret.decl = visit(findChildrenType(astNode, 'VarDeclaration'));

    return ret;
  },
  ValDirective(astNode: IToken) {
    const ret = new Nodes.ValDirectiveNode(astNode);

    ret.isExported = !findChildrenType(astNode, 'PrivateModifier');
    ret.decl = visit(findChildrenType(astNode, 'ValDeclaration'));

    return ret;
  },
  EffectDirective(astNode: IToken) {
    const ret = new Nodes.EffectDirectiveNode(astNode);

    ret.isExported = !findChildrenType(astNode, 'PrivateModifier');
    ret.effect = visit(findChildrenType(astNode, 'EffectDeclaration'));

    return ret;
  },
  EffectDeclaration(astNode: IToken) {
    const ret = new Nodes.EffectDeclarationNode(astNode);

    ret.name = visit(findChildrenType(astNode, 'NameIdentifierNode'));

    const list = findChildrenType(astNode, 'EffectElementList');

    ret.elements = list.children.map($ => visit($));

    return ret;
  },
  EffectMemberDeclaration(astNode: IToken) {
    const ret = new Nodes.EffectMemberDeclarationNode(astNode);

    ret.name = visit(findChildrenType(astNode, 'NameIdentifierNode'));

    const params = findChildrenType(astNode, 'FunctionParamsList');

    if (!params) {
      throw new TokenError('Missing param list in function declaration', astNode);
    }

    ret.parameters = params.children.map($ => visit($));

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

    child; // this is the type kind "type, rectype, cotype"

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

    fun.functionName = visit(findChildrenType(astNode, 'FunctionName').children[0]);
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
  BitOrExpression: binaryOpVisitor,
  BitXorExpression: binaryOpVisitor,
  BitAndExpression: binaryOpVisitor,
  AsExpression: binaryOpVisitor,
  IsExpression: binaryOpVisitor,
  RelExpression: binaryOpVisitor,
  EqExpression: binaryOpVisitor,
  ShiftExpression: binaryOpVisitor,
  MulExpression: binaryOpVisitor,
  ParenExpression(astNode: IToken) {
    const ret = visitLastChild(astNode);
    ret.hasParentheses = true;
    return ret;
  },
  AtomicExpression(astNode: IToken) {
    let ret = visit(astNode.children[0]);

    for (let i = 1; i < astNode.children.length; i += 2) {
      const oldRet = ret;

      const doesItHaveCallArguments = !!astNode.children[i + 1];

      if (doesItHaveCallArguments) {
        const x = (ret = new Nodes.FunctionCallNode(astNode.children[i]));
        x.isInfix = true;
        const vrn = (x.functionNode = new Nodes.VariableReferenceNode(astNode.children[i]));
        vrn.variable = new Nodes.QNameNode(astNode.children[i]);
        const varName = new Nodes.NameIdentifierNode(astNode.children[i]);
        vrn.variable.names = [varName];

        varName.name = astNode.children[i].text;

        x.argumentsNode = [oldRet, ...astNode.children[i + 1].children.map($ => visit($))];
      } else {
        // it is a member selection
      }
    }

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
          vrn.variable = new Nodes.QNameNode(astNode.children[i]);
          const varName = new Nodes.NameIdentifierNode(astNode.children[i]);
          vrn.variable.names = [varName];

          varName.name = astNode.children[i].text;

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
    ret.variable = visit(astNode.children[0]);
    return ret;
  },
  FunOperator(astNode: IToken) {
    const ret = new Nodes.NameIdentifierNode(astNode);
    ret.name = astNode.text.trim();
    ret.hasParentheses = true;
    return ret;
  },
  NameIdentifier(astNode: IToken) {
    const ret = new Nodes.NameIdentifierNode(astNode);
    ret.name = astNode.text.trim();
    return ret;
  },
  QName(astNode: IToken) {
    const ret = new Nodes.QNameNode(astNode);
    ret.names = astNode.children.map(visit) as any;
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
  TypeReference(astNode: IToken) {
    const ret = new Nodes.TypeReferenceNode(astNode);
    ret.variable = visit(astNode.children[0]);
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
  CaseIs(x: IToken) {
    const ret = new Nodes.MatchCaseIsNode(x);
    ret.declaredName = visitChildTypeOrNull(x, 'NameIdentifier') as Nodes.NameIdentifierNode;
    ret.typeReference = visitChildTypeOrNull(x, 'TypeReference') as Nodes.TypeReferenceNode;

    const deconstruct = findChildrenType(x, 'DeconstructStruct');

    if (deconstruct) {
      ret.deconstructorNames = deconstruct.children.map($ => visit($));
    }

    ret.rhs = visitLastChild(x);
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
  HexLiteral(x: IToken) {
    return new Nodes.HexLiteral(x);
  },
  StringLiteral(x: IToken) {
    const ret = new Nodes.StringLiteral(x);
    ret.value = x.text; // TODO: Parse string correctly
    return ret;
  },
  BinNegExpression(x: IToken) {
    const ret = new Nodes.UnaryExpressionNode(x);
    ret.rhs = visit(x.children[0]);
    ret.operator = Nodes.NameIdentifierNode.fromString('~');
    return ret;
  },
  NegExpression(x: IToken) {
    const ret = new Nodes.UnaryExpressionNode(x);
    ret.rhs = visit(x.children[0]);
    ret.operator = Nodes.NameIdentifierNode.fromString('!');
    return ret;
  },
  UnaryMinus(x: IToken) {
    const ret = new Nodes.UnaryExpressionNode(x);
    ret.rhs = visit(x.children[0]);
    ret.operator = Nodes.NameIdentifierNode.fromString('-');
    return ret;
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
  },
  StructDirective(astNode: IToken) {
    return visit(astNode.children[0]) as Nodes.StructDeclarationNode;
  },
  UnknownExpression(astNode: IToken) {
    return new Nodes.UnknownExpressionNode(astNode);
  },
  StructDeclaration(astNode: IToken) {
    const ret = new Nodes.StructDeclarationNode(astNode);

    ret.declaredName = visitChildTypeOrNull(astNode, 'NameIdentifier') as Nodes.NameIdentifierNode;
    const params = findChildrenType(astNode, 'FunctionParamsList');
    if (params) {
      ret.parameters = params.children.map($ => visit($));
    } else {
      ret.parameters = [];
    }

    return ret;
  },
  TypeDeclaration(astNode: IToken) {
    const ret = new Nodes.TypeDeclarationNode(astNode);
    const typeDeclElements = findChildrenType(astNode, 'TypeDeclElements');
    ret.declarations = typeDeclElements.children.map($ => visit($));
    // TODO
    return ret;
  },
  UnionType(astNode: IToken) {
    const ret = new Nodes.UnionTypeNode(astNode);
    ret.of = astNode.children.map($ => visit($));
    return ret;
  },
  IntersectionType(astNode: IToken) {
    const ret = new Nodes.IntersectionTypeNode(astNode);
    ret.of = astNode.children.map($ => visit($));
    return ret;
  },
  TypeParen(astNode: IToken) {
    const ret = visit(astNode.children[0]);
    ret.hasParentheses = true;
    return ret;
  },
  WasmExpression(astNode: IToken) {
    const ret = new Nodes.WasmExpressionNode(astNode);
    ret.atoms = astNode.children.map($ => visit($));
    return ret;
  },
  SExpression(astNode: IToken) {
    const ret = new Nodes.WasmAtomNode(astNode);
    const children = astNode.children.slice();
    const symbol = children.shift();

    ret.symbol = symbol.text;

    const newChildren = children.map($ => visit($) as Nodes.ExpressionNode);
    ret.arguments = ret.arguments.concat(newChildren);

    if (ret.symbol == 'call' || ret.symbol == 'get_global' || ret.symbol == 'set_global') {
      if (ret.arguments[0] instanceof Nodes.QNameNode) {
        const varRef = new Nodes.VariableReferenceNode(children[0]);
        varRef.variable = ret.arguments[0] as Nodes.QNameNode;

        if (varRef.variable.names[0].name.startsWith('$')) {
          // TODO: fix horrible hack $
          varRef.variable.names[0].name = varRef.variable.names[0].name.replace(/^\$/, '');
        }

        ret.arguments[0] = varRef;
      }
    }

    return ret;
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

  get parsingContext(): ParsingContext {
    return this.parsingPhaseResult.parsingContext;
  }

  constructor(public parsingPhaseResult: ParsingPhaseResult) {
    super();
    this.execute();
  }

  protected execute() {
    this.document = visit(this.parsingPhaseResult.document);
    this.document.file = this.parsingPhaseResult.fileName;
    failIfErrors('Canonical phase', this.document, this);
  }

  static fromString(code: string) {
    return new CanonicalPhaseResult(ParsingPhaseResult.fromString(code));
  }
}
