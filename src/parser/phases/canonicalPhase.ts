import { TokenError } from 'ebnf';
import { Nodes } from '../nodes';
import { failIfErrors } from './findAllErrors';
import { PhaseResult } from './PhaseResult';
import { ParsingPhaseResult } from './parsingPhase';
import { ParsingContext } from '../ParsingContext';

function binaryOpVisitor(astNode: Nodes.ASTNode) {
  let ret = visit(astNode.children[0]) as
    | Nodes.BinaryExpressionNode
    | Nodes.AsExpressionNode
    | Nodes.IsExpressionNode
    | Nodes.AssignmentNode;

  for (let i = 1; i < astNode.children.length; i += 2) {
    const oldRet = ret;
    const opertator = astNode.children[i].text;

    if (opertator === 'as') {
      ret = new Nodes.AsExpressionNode(astNode);
    } else if (opertator === 'is') {
      ret = new Nodes.IsExpressionNode(astNode);
    } else if (opertator === '=') {
      ret = new Nodes.AssignmentNode(astNode);
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
  ImportDirective(astNode: Nodes.ASTNode) {
    const ret = new Nodes.ImportDirectiveNode(astNode);
    ret.module = visitChildTypeOrNull(astNode, 'QName') as Nodes.QNameNode;
    ret.alias = visitChildTypeOrNull(astNode, 'NameIdentifier') as Nodes.NameIdentifierNode;
    return ret;
  },
  VarDirective(astNode: Nodes.ASTNode) {
    const ret = new Nodes.VarDirectiveNode(astNode);

    ret.isPublic = !findChildrenType(astNode, 'PrivateModifier');

    ret.decl = visit(findChildrenType(astNode, 'VarDeclaration'));

    return ret;
  },
  ValDirective(astNode: Nodes.ASTNode) {
    const ret = new Nodes.ValDirectiveNode(astNode);

    ret.isPublic = !findChildrenType(astNode, 'PrivateModifier');
    ret.decl = visit(findChildrenType(astNode, 'ValDeclaration'));

    return ret;
  },
  EffectDirective(astNode: Nodes.ASTNode) {
    const ret = new Nodes.EffectDirectiveNode(astNode);

    ret.isPublic = !findChildrenType(astNode, 'PrivateModifier');
    ret.effect = visit(findChildrenType(astNode, 'EffectDeclaration'));

    return ret;
  },
  ImplDirective(astNode: Nodes.ASTNode) {
    const ret = new Nodes.ImplDirective(astNode);

    ret.isPublic = !findChildrenType(astNode, 'PrivateModifier');
    ret.reference = visit(findChildrenType(astNode, 'Reference'));
    const directivesNode = findChildrenType(astNode, 'NamespaceElementList');
    ret.directives = directivesNode.children.map(visit) as Nodes.DirectiveNode[];

    return ret;
  },
  EffectDeclaration(astNode: Nodes.ASTNode) {
    const ret = new Nodes.EffectDeclarationNode(astNode);

    ret.name = visit(findChildrenType(astNode, 'NameIdentifierNode'));

    const list = findChildrenType(astNode, 'EffectElementList');

    ret.elements = list.children.map($ => visit($));

    return ret;
  },
  EffectMemberDeclaration(astNode: Nodes.ASTNode) {
    const ret = new Nodes.EffectMemberDeclarationNode(astNode);

    ret.name = visit(findChildrenType(astNode, 'NameIdentifierNode'));

    const params = findChildrenType(astNode, 'FunctionParamsList');

    if (!params) {
      throw new TokenError('Missing param list in function declaration', astNode);
    }

    ret.parameters = params.children.map($ => visit($));

    return ret;
  },
  VarDeclaration(astNode: Nodes.ASTNode) {
    const ret = new Nodes.VarDeclarationNode(astNode);

    ret.variableName = visit(findChildrenType(astNode, 'NameIdentifier'));
    ret.variableType = visit(findChildrenType(astNode, 'Type'));
    ret.value = visitLastChild(astNode);

    return ret;
  },
  ValDeclaration(astNode: Nodes.ASTNode) {
    const ret = new Nodes.ValDeclarationNode(astNode);

    ret.variableName = visit(findChildrenType(astNode, 'NameIdentifier'));
    ret.variableType = visit(findChildrenType(astNode, 'Type'));
    ret.value = visitLastChild(astNode);

    return ret;
  },
  TypeDirective(astNode: Nodes.ASTNode) {
    const ret = new Nodes.TypeDirectiveNode(astNode);
    const children = astNode.children.slice();

    let child = children.shift();

    if (child.type === 'PrivateModifier') {
      ret.isPublic = false;
      child = children.shift();
    } else {
      ret.isPublic = true;
    }

    ret.variableName = visit(child);

    if (children.length) {
      ret.valueType = visitLastChild(astNode) as Nodes.TypeNode;
    } else {
      ret.valueType = null;
    }

    return ret;
  },
  EnumDirective(astNode: Nodes.ASTNode) {
    const ret = new Nodes.EnumDirectiveNode(astNode);
    const children = astNode.children.slice();

    let child = children.shift();

    if (child.type === 'PrivateModifier') {
      ret.isPublic = false;
      child = children.shift();
    } else {
      ret.isPublic = true;
    }

    ret.variableName = visit(child);

    const typeDeclElements = findChildrenType(astNode, 'TypeDeclElements');

    if (typeDeclElements) {
      ret.declarations = typeDeclElements.children.map($ => visit($));
    } else {
      ret.declarations = [];
    }

    return ret;
  },
  FunDeclaration(astNode: Nodes.ASTNode) {
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
  Decorator(astNode: Nodes.ASTNode) {
    const ret = new Nodes.DecoratorNode(astNode);

    const name = astNode.children.shift();

    ret.decoratorName = visit(name);

    ret.arguments = astNode.children.map(visit) as Nodes.LiteralNode<any>[];

    return ret;
  },
  FunctionDirective(astNode: Nodes.ASTNode) {
    const ret = new Nodes.FunDirectiveNode(astNode);

    const decorators = findChildrenType(astNode, 'Decorators');

    if (decorators) {
      ret.decorators = decorators.children.map(visit) as Nodes.DecoratorNode[];
    } else {
      ret.decorators = [];
    }

    ret.isPublic = !findChildrenType(astNode, 'PrivateModifier');

    ret.functionNode = visit(findChildrenType(astNode, 'FunDeclaration')) as Nodes.FunctionNode;

    return ret;
  },
  CodeBlock(astNode: Nodes.ASTNode) {
    const ret = new Nodes.BlockNode(astNode);
    ret.statements = astNode.children.map($ => visit($)).filter($ => !!$);
    return ret;
  },
  FunctionCallExpression(astNode: Nodes.ASTNode) {
    const ret = new Nodes.FunctionCallNode(astNode);
    ret.functionNode = visit(astNode.children[0]);
    ret.argumentsNode = astNode.children[1].children.map($ => visit($));

    return ret;
  },
  Parameter(astNode: Nodes.ASTNode) {
    const ret = new Nodes.ParameterNode(astNode);
    ret.parameterName = visit(findChildrenType(astNode, 'NameIdentifier'));
    ret.parameterType = visit(findChildrenType(astNode, 'Type'));
    return ret;
  },
  AssignExpression: binaryOpVisitor,
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
  ParenExpression(astNode: Nodes.ASTNode) {
    const ret = visitLastChild(astNode);
    ret.hasParentheses = true;
    return ret;
  },
  AtomicExpression(astNode: Nodes.ASTNode) {
    let ret = visit(astNode.children[0]);

    for (let currentChildren = 1; currentChildren < astNode.children.length; currentChildren++) {
      const operatorNode = astNode.children[currentChildren];
      currentChildren++;
      const currentNode = astNode.children[currentChildren];

      const nextNode = astNode.children[currentChildren + 1];

      if (currentNode.type === 'NameIdentifier') {
        const member = new Nodes.MemberNode(astNode);
        member.lhs = ret;
        member.memberName = visit(currentNode);
        member.operator = operatorNode.text;
        ret = member;

        const doesItHaveCallArguments = nextNode && nextNode.type === 'CallArguments';

        if (doesItHaveCallArguments) {
          currentChildren++;
          const fnCall = new Nodes.FunctionCallNode(currentNode);
          fnCall.isInfix = true;
          fnCall.functionNode = ret;
          fnCall.argumentsNode = nextNode.children.map($ => visit($));
          ret = fnCall;
        }
      } else {
        console.log('Dont know what to doooo1' + currentNode.text);
      }
    }

    return ret;
  },
  MatchExpression(astNode: Nodes.ASTNode) {
    const match = new Nodes.PatternMatcherNode(astNode);

    match.lhs = visit(astNode.children[0]);
    match.matchingSet = astNode.children[1].children.map($ => visit($));

    return match;
  },
  Reference(astNode: Nodes.ASTNode) {
    const ret = new Nodes.ReferenceNode(astNode);
    ret.variable = visit(astNode.children[0]);
    return ret;
  },
  FunOperator(astNode: Nodes.ASTNode) {
    const ret = new Nodes.NameIdentifierNode(astNode);
    ret.name = astNode.text.trim();
    return ret;
  },
  NameIdentifier(astNode: Nodes.ASTNode) {
    const ret = new Nodes.NameIdentifierNode(astNode);
    ret.name = astNode.text.trim();
    return ret;
  },
  QName(astNode: Nodes.ASTNode) {
    const ret = new Nodes.QNameNode(astNode);
    ret.names = astNode.children.map(visit) as any;
    return ret;
  },
  FunctionTypeParameter(astNode: Nodes.ASTNode) {
    const ret = new Nodes.FunctionParameterTypeNode(astNode);

    ret.name = visitChildTypeOrNull(astNode, 'NameIdentifier') as Nodes.NameIdentifierNode;
    ret.parameterType = visitChildTypeOrNull(astNode, 'Type') as Nodes.TypeNode;

    return ret;
  },
  FunctionTypeLiteral(child: Nodes.ASTNode) {
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
  Type(astNode: Nodes.ASTNode) {
    const ret = visit(astNode.children[0]);
    if (false === ret instanceof Nodes.TypeNode && false == ret instanceof Nodes.ReferenceNode) {
      console.error('Node ' + astNode.type + ' did not yield a type node');
      console.log(ret);
    }
    return ret;
  },
  // MatchBody(x: Nodes.ASTNode) {
  //   return x.children.map($ => visit($));
  // },
  CaseLiteral(x: Nodes.ASTNode) {
    const ret = new Nodes.MatchLiteralNode(x);
    ret.literal = visit(x.children[0]);
    ret.rhs = visit(x.children[1]);
    return ret;
  },
  CaseCondition(x: Nodes.ASTNode) {
    const ret = new Nodes.MatchConditionNode(x);
    ret.declaredName = visit(x.children[0]);
    ret.condition = visit(x.children[1]);
    ret.rhs = visit(x.children[2]);
    return ret;
  },
  CaseIs(x: Nodes.ASTNode) {
    const ret = new Nodes.MatchCaseIsNode(x);
    ret.declaredName = visitChildTypeOrNull(x, 'NameIdentifier') as Nodes.NameIdentifierNode;
    ret.typeReference = visitChildTypeOrNull(x, 'Reference') as Nodes.ReferenceNode;

    const deconstruct = findChildrenType(x, 'DeconstructStruct');

    if (deconstruct) {
      ret.deconstructorNames = deconstruct.children.map($ => visit($));
    }

    ret.rhs = visitLastChild(x);
    return ret;
  },
  CaseElse(x: Nodes.ASTNode) {
    const ret = new Nodes.MatchDefaultNode(x);
    ret.rhs = visit(x.children[0]);
    return ret;
  },

  LoopExpression(x: Nodes.ASTNode) {
    const ret = new Nodes.LoopNode(x);
    ret.body = visit(x.children[0]);
    return ret;
  },

  ContinueStatement(x: Nodes.ASTNode) {
    const ret = new Nodes.ContinueNode(x);
    return ret;
  },

  BreakStatement(x: Nodes.ASTNode) {
    const ret = new Nodes.BreakNode(x);
    return ret;
  },
  PostfixNumber(x: Nodes.ASTNode) {
    const literal = visit(x.children[0]) as Nodes.IntegerLiteral | Nodes.HexLiteral | Nodes.FloatLiteral;
    literal.suffixReference = visit(x.children[1]);
    return literal;
  },
  NumberLiteral(x: Nodes.ASTNode) {
    if (x.text.includes('.') || x.text.includes('E') || x.text.includes('e')) {
      return new Nodes.FloatLiteral(x);
    } else {
      return new Nodes.IntegerLiteral(x);
    }
  },
  NegNumberLiteral(x: Nodes.ASTNode) {
    if (x.text.includes('.') || x.text.includes('E') || x.text.includes('e')) {
      return new Nodes.FloatLiteral(x);
    } else {
      return new Nodes.IntegerLiteral(x);
    }
  },
  HexLiteral(x: Nodes.ASTNode) {
    return new Nodes.HexLiteral(x);
  },
  StringLiteral(x: Nodes.ASTNode) {
    const ret = new Nodes.StringLiteral(x);
    ret.value = JSON.parse(x.text);
    return ret;
  },
  BinNegExpression(x: Nodes.ASTNode) {
    const ret = new Nodes.UnaryExpressionNode(x);
    ret.rhs = visit(x.children[0]);
    ret.operator = Nodes.NameIdentifierNode.fromString('~');
    return ret;
  },
  NegExpression(x: Nodes.ASTNode) {
    const ret = new Nodes.UnaryExpressionNode(x);
    ret.rhs = visit(x.children[0]);
    ret.operator = Nodes.NameIdentifierNode.fromString('!');
    return ret;
  },
  UnaryMinus(x: Nodes.ASTNode) {
    const ret = new Nodes.UnaryExpressionNode(x);
    ret.rhs = visit(x.children[0]);
    ret.operator = Nodes.NameIdentifierNode.fromString('-');
    return ret;
  },
  BooleanLiteral(x: Nodes.ASTNode) {
    return new Nodes.BooleanLiteral(x);
  },
  Document(astNode: Nodes.ASTNode) {
    const doc = new Nodes.DocumentNode(astNode);
    doc.textContent = astNode.text;
    doc.directives = astNode.children.map($ => visit($));

    return doc;
  },
  IfExpression(astNode: Nodes.ASTNode) {
    const ret = new Nodes.IfNode(astNode);
    ret.condition = visit(astNode.children[0]);
    ret.truePart = visit(astNode.children[1]);
    ret.falsePart = visit(astNode.children[2]);
    return ret;
  },
  SyntaxError(_: Nodes.ASTNode) {
    return null;
  },
  StructDirective(astNode: Nodes.ASTNode) {
    return visit(astNode.children[0]) as Nodes.StructDeclarationNode;
  },
  UnknownExpression(astNode: Nodes.ASTNode) {
    return new Nodes.UnknownExpressionNode(astNode);
  },
  StructLiteral(astNode: Nodes.ASTNode) {
    const ret = new Nodes.StructTypeNode(astNode);
    const parameters = findChildrenType(astNode, 'StructParamsList');

    ret.parameters = parameters.children.filter($ => $.type == 'Parameter').map($ => visit($));
    return ret;
  },
  StackLiteral(astNode: Nodes.ASTNode) {
    const ret = new Nodes.StackTypeNode(astNode);
    ret.metadata = Object.create(null);

    for (let namePair of astNode.children) {
      ret.metadata[namePair.children[0].text] = visit(namePair.children[1]);
    }

    return ret;
  },
  InjectedLiteral(astNode: Nodes.ASTNode) {
    const ret = new Nodes.InjectedTypeNode(astNode);
    return ret;
  },
  StructDeclaration(astNode: Nodes.ASTNode) {
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
  UnionType(astNode: Nodes.ASTNode) {
    const ret = new Nodes.UnionTypeNode(astNode);
    ret.of = astNode.children.map($ => visit($));
    return ret;
  },
  IntersectionType(astNode: Nodes.ASTNode) {
    const ret = new Nodes.IntersectionTypeNode(astNode);
    ret.of = astNode.children.map($ => visit($));
    return ret;
  },
  TypeParen(astNode: Nodes.ASTNode) {
    const ret = visit(astNode.children[0]);
    ret.hasParentheses = true;
    return ret;
  },
  WasmExpression(astNode: Nodes.ASTNode) {
    const ret = new Nodes.WasmExpressionNode(astNode);
    ret.atoms = astNode.children.map($ => visit($));
    return ret;
  },
  SExpression(astNode: Nodes.ASTNode) {
    const ret = new Nodes.WasmAtomNode(astNode);
    const children = astNode.children.slice();
    const symbol = children.shift();

    ret.symbol = symbol.text;

    const newChildren = children.map($ => visit($) as Nodes.ExpressionNode);
    ret.arguments = ret.arguments.concat(newChildren);

    if (
      ret.symbol == 'call' ||
      ret.symbol == 'global.get' ||
      ret.symbol == 'global.set' ||
      ret.symbol == 'get_global' ||
      ret.symbol == 'set_global'
    ) {
      if (ret.arguments[0] instanceof Nodes.QNameNode) {
        const varRef = new Nodes.ReferenceNode(children[0]);
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

function visit<T extends Nodes.Node>(astNode: Nodes.ASTNode): T {
  if (!astNode) return null;
  if (visitor[astNode.type]) {
    return visitor[astNode.type](astNode);
  } else {
    throw new TokenError(`Visitor not implemented for ${astNode.type}`, astNode);
  }
}

function findChildrenType(token: Nodes.ASTNode, type: string) {
  return token.children.find($ => $.type == type);
}

function visitChildTypeOrNull(token: Nodes.ASTNode, type: string) {
  const child = findChildrenType(token, type);
  if (!child) return null;
  return visit(child);
}

function visitLastChild(token: Nodes.ASTNode) {
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
}
