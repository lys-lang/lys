import { Nodes } from '../nodes';
import { PositionCapableError } from '../NodeError';
import { walkPreOrder } from '../walker';
import { TokenError, IToken } from 'ebnf';
import { parser } from '../../grammar';
import { ParsingContext } from '../ParsingContext';
import { annotations } from '../annotations';

/// --- PARSING PHASE ---

const process = walkPreOrder((token: IToken, parsingContext: ParsingContext) => {
  if (token.errors && token.errors.length) {
    token.errors.forEach(($: TokenError) => {
      if ($) {
        parsingContext.messageCollector.error(new PositionCapableError($.message, token as any));
      }
    });
  }
});

const setModuleName = (moduleName: string) =>
  walkPreOrder((token: any) => {
    token.moduleName = moduleName;
  });

const parsingCache = new Map<string /** hash */, IToken>();

function DJB2(input: string) {
  let hash = 5381;

  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) + hash + input.charCodeAt(i);
  }

  return hash;
}

function getParsingTree(moduleName: string, content: string, parsingContext: ParsingContext) {
  const hash = moduleName + '+' + content.length.toString(16) + '_' + DJB2(content).toString(16);

  let ret = parsingCache.get(hash);

  if (!ret) {
    ret = parser.getAST(content, 'Document');
    parsingCache.set(hash, ret);
    setModuleName(moduleName)(ret as any, parsingContext);
  }

  return (ret as any) as Nodes.ASTNode;
}

/// --- CANONICAL ---

function binaryOpVisitor(astNode: Nodes.ASTNode) {
  let ret = visit(astNode.children[0]) as
    | Nodes.BinaryExpressionNode
    | Nodes.AsExpressionNode
    | Nodes.IsExpressionNode
    | Nodes.AssignmentNode;

  for (let i = 1; i < astNode.children.length; i += 2) {
    const oldRet = ret;
    const opertator = astNode.children[i].text;

    const lhs = oldRet;
    const rhs = visit(astNode.children[i + 1]);

    if (opertator === 'as') {
      ret = new Nodes.AsExpressionNode(astNode, lhs, rhs);
    } else if (opertator === 'is') {
      ret = new Nodes.IsExpressionNode(astNode, lhs, rhs);
    } else if (opertator === '=') {
      ret = new Nodes.AssignmentNode(astNode, lhs, rhs);
    } else {
      const operator = new Nodes.NameIdentifierNode(astNode.children[i], opertator);
      ret = new Nodes.BinaryExpressionNode(astNode, operator, lhs, rhs);
    }
  }

  return ret;
}

const visitor = {
  ImportDirective(astNode: Nodes.ASTNode) {
    const module = visitChildTypeOrNull(astNode, 'QName') as Nodes.QNameNode;
    const ret = new Nodes.ImportDirectiveNode(astNode, module);
    ret.alias = visitChildTypeOrNull(astNode, 'NameIdentifier') as Nodes.NameIdentifierNode;
    return ret;
  },
  VarDirective(astNode: Nodes.ASTNode) {
    const decl = visit(findChildrenTypeOrFail(astNode, 'VarDeclaration'));
    const ret = new Nodes.VarDirectiveNode(astNode, decl);

    ret.isPublic = !findChildrenType(astNode, 'PrivateModifier');

    return ret;
  },
  ValDirective(astNode: Nodes.ASTNode) {
    const decl = visit(findChildrenTypeOrFail(astNode, 'ValDeclaration'));
    const ret = new Nodes.VarDirectiveNode(astNode, decl);

    ret.isPublic = !findChildrenType(astNode, 'PrivateModifier');

    return ret;
  },
  EffectDirective(astNode: Nodes.ASTNode) {
    const ret = new Nodes.EffectDirectiveNode(astNode);

    ret.isPublic = !findChildrenType(astNode, 'PrivateModifier');
    ret.effect = visit(findChildrenTypeOrFail(astNode, 'EffectDeclaration'));

    return ret;
  },
  ImplDirective(astNode: Nodes.ASTNode) {
    const references = astNode.children.filter(($) => $.type === 'Reference');

    // the last Reference is the target
    const target = visit(references.pop()!);

    const directivesNode = findChildrenType(astNode, 'NamespaceElementList');

    let directives: Nodes.DirectiveNode[] = directivesNode
      ? (directivesNode.children.map(visit) as Nodes.DirectiveNode[])
      : [];
    // TODO: warn

    const ret = new Nodes.ImplDirective(astNode, target, directives);

    if (references.length) {
      ret.baseImpl = visit(references.pop()!);
    }

    ret.isPublic = !findChildrenType(astNode, 'PrivateModifier');

    return ret;
  },
  EffectDeclaration(astNode: Nodes.ASTNode) {
    const name = visit(findChildrenTypeOrFail(astNode, 'NameIdentifier', 'A name is required'));
    const ret = new Nodes.EffectDeclarationNode(astNode, name);

    const list = findChildrenType(astNode, 'EffectElementList');

    if (list) {
      ret.elements = list.children.map(($) => visit($));
    } else {
      // TODO: warn
    }

    return ret;
  },
  EffectMemberDeclaration(astNode: Nodes.ASTNode) {
    const ret = new Nodes.EffectMemberDeclarationNode(astNode);

    ret.name = visit(findChildrenTypeOrFail(astNode, 'NameIdentifier'));

    const params = findChildrenType(astNode, 'FunctionParamsList');

    if (!params) {
      throw new PositionCapableError('Missing param list in function declaration', astNode);
    }

    ret.parameters = params.children.map(($) => visit($));

    return ret;
  },
  VarDeclaration(astNode: Nodes.ASTNode) {
    const variableName = visit(findChildrenTypeOrFail(astNode, 'NameIdentifier'));
    const value = visitLastChild(astNode);
    const ret = new Nodes.VarDeclarationNode(astNode, variableName, value);
    ret.variableName.annotate(new annotations.MutableDeclaration());

    const type = findChildrenType(astNode, 'Type');
    if (type) {
      ret.variableType = visit(type);
    } else {
      // TODO: warn
    }

    return ret;
  },
  ValDeclaration(astNode: Nodes.ASTNode) {
    const variableName = visit(findChildrenTypeOrFail(astNode, 'NameIdentifier'));
    const value = visitLastChild(astNode);
    const ret = new Nodes.VarDeclarationNode(astNode, variableName, value);

    const type = findChildrenType(astNode, 'Type');
    if (type) {
      ret.variableType = visit(type);
    } else {
      // TODO: warn
    }

    return ret;
  },
  TypeDirective(astNode: Nodes.ASTNode) {
    const children = astNode.children.slice();

    let isPublic = true;

    let child = children.shift()!;

    if (child.type === 'PrivateModifier') {
      isPublic = false;
      child = children.shift()!;
    }

    const variableName = visit(child);

    console.assert(!!variableName, 'missing variable name');

    const ret = new Nodes.TypeDirectiveNode(astNode, variableName);

    ret.isPublic = isPublic;

    if (children.length) {
      ret.valueType = visitLastChild(astNode) as Nodes.TypeNode;
    }

    return ret;
  },
  EnumDirective(astNode: Nodes.ASTNode) {
    const children = astNode.children.slice();

    let child = children.shift()!;
    let isPublic = true;
    if (child.type === 'PrivateModifier') {
      isPublic = false;
      child = children.shift()!;
    }

    const variableName = visit(child);

    const typeDeclElements = findChildrenType(astNode, 'TypeDeclElements');

    const declarations = typeDeclElements ? typeDeclElements.children.map(($) => visit($)) : [];

    const ret = new Nodes.EnumDirectiveNode(astNode, variableName, declarations);
    ret.isPublic = isPublic;

    return ret;
  },
  TraitDirective(astNode: Nodes.ASTNode) {
    const children = astNode.children.slice();

    let child = children.shift()!;
    let isPublic = true;

    if (child.type === 'PrivateModifier') {
      isPublic = false;
      child = children.shift()!;
    }

    const variableName = visit(child);

    const typeDeclElements = findChildrenType(astNode, 'TraitDeclElements');

    const declarations = typeDeclElements ? typeDeclElements.children.map(($) => visit($)) : [];

    declarations.forEach(($) => {
      if ($ instanceof Nodes.FunDirectiveNode && !$.functionNode.body) {
        $.functionNode.annotate(new annotations.SignatureDeclaration());
      }
    });

    const ret = new Nodes.TraitDirectiveNode(astNode, variableName, declarations);
    ret.isPublic = isPublic;

    return ret;
  },
  FunDeclaration(astNode: Nodes.ASTNode) {
    const functionName = visit(
      findChildrenTypeOrFail(astNode, 'FunctionName', 'A function name is required').children[0]
    );
    const fun = new Nodes.FunctionNode(astNode, functionName);

    const retType = findChildrenType(astNode, 'Type');

    if (retType) {
      fun.functionReturnType = visit(retType);
    } else {
      // TODO: warn
    }

    const params = findChildrenType(astNode, 'FunctionParamsList');

    if (!params) {
      throw new PositionCapableError('Missing param list in function declaration', astNode);
    }

    fun.parameters = params.children.map(($) => visit($));

    const body = findChildrenType(astNode, 'FunAssignExpression');

    if (body) {
      fun.body = visitLastChild(body);
    }

    return fun;
  },
  Decorator(astNode: Nodes.ASTNode) {
    const children = astNode.children.slice();
    const name = children.shift();

    if (!name) {
      throw new PositionCapableError('Missing decorator name', astNode);
    }

    const decoratorName = visit(name);

    const args = children.map(visit) as Nodes.LiteralNode<any>[];

    const ret = new Nodes.DecoratorNode(astNode, decoratorName, args);

    return ret;
  },
  FunctionDirective(astNode: Nodes.ASTNode) {
    const decoratorsNode = findChildrenType(astNode, 'Decorators');

    const decorators = decoratorsNode ? (decoratorsNode.children.map(visit) as Nodes.DecoratorNode[]) : [];

    const functionNode = visit(findChildrenTypeOrFail(astNode, 'FunDeclaration')) as Nodes.FunctionNode;
    const ret = new Nodes.FunDirectiveNode(astNode, functionNode, decorators);
    ret.isPublic = !findChildrenType(astNode, 'PrivateModifier');

    return ret;
  },
  CodeBlock(astNode: Nodes.ASTNode) {
    const statements = astNode.children.map(($) => visit($)).filter(($) => !!$);
    return new Nodes.BlockNode(astNode, statements);
  },
  Parameter(astNode: Nodes.ASTNode) {
    const parameterName = visit(findChildrenTypeOrFail(astNode, 'NameIdentifier', 'A parameter name is required'));
    const ret = new Nodes.ParameterNode(astNode, parameterName);
    const type = findChildrenType(astNode, 'Type');

    if (type) {
      ret.parameterType = visit(type);
    } else {
      // TODO: warn
    }
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
      const currentNode = astNode.children[currentChildren];

      const doesItHaveCallArguments = currentNode && currentNode.type === 'CallArguments';
      const doesItHaveIndexExpression = currentNode && currentNode.type === 'IndexExpression';
      const doesItHaveMemberExpression = currentNode && currentNode.type === 'MemberExpression';

      if (doesItHaveCallArguments) {
        const argumentsNode = currentNode.children.map(($) => visit($));
        const fnCall = new Nodes.FunctionCallNode(currentNode, ret, argumentsNode);
        fnCall.isInfix = true;
        ret = fnCall;
      } else if (doesItHaveIndexExpression) {
        const argument = visit(currentNode.children[0]);
        const indexSelector = new Nodes.BinaryExpressionNode(
          currentNode,
          Nodes.NameIdentifierNode.fromString('[]', currentNode),
          ret,
          argument
        );
        ret = indexSelector;
      } else if (doesItHaveMemberExpression) {
        ret = new Nodes.MemberNode(astNode, ret, currentNode.children[0].text, visit(currentNode.children[1]));
      } else {
        if (currentNode) {
          throw new PositionCapableError("Don't know what to do with " + currentNode.type, currentNode);
        }
      }
    }

    return ret;
  },
  MatchExpression(astNode: Nodes.ASTNode) {
    const lhs = visit(astNode.children[0]);
    const matchingSet = astNode.children[1].children.map(($) => visit($));

    return new Nodes.PatternMatcherNode(astNode, lhs, matchingSet);
  },
  Reference(astNode: Nodes.ASTNode) {
    return new Nodes.ReferenceNode(astNode, visit(astNode.children[0]));
  },
  FunOperator(astNode: Nodes.ASTNode) {
    return new Nodes.NameIdentifierNode(astNode, astNode.text.trim());
  },
  NameIdentifier(astNode: Nodes.ASTNode) {
    return new Nodes.NameIdentifierNode(astNode, astNode.text.trim());
  },
  QName(astNode: Nodes.ASTNode) {
    const names = astNode.children.map(visit) as any;
    return new Nodes.QNameNode(astNode, names);
  },
  FunctionTypeParameter(astNode: Nodes.ASTNode) {
    const type = visitChildTypeOrFail(astNode, 'Type') as Nodes.TypeNode;
    const ret = new Nodes.SignatureParameterNode(astNode, type);

    ret.parameterName = visitChildTypeOrNull(astNode, 'NameIdentifier') as Nodes.NameIdentifierNode;

    return ret;
  },
  FunctionTypeLiteral(child: Nodes.ASTNode) {
    const parametersNode = findChildrenType(child, 'FunctionTypeParameters');

    const ret = new Nodes.FunctionTypeNode(child, parametersNode ? parametersNode.children.map(($) => visit($)) : []);

    ret.returnType = visitChildTypeOrNull(child, 'Type') as Nodes.TypeNode;

    return ret;
  },
  Type(astNode: Nodes.ASTNode) {
    const ret = visit(astNode.children[0]);
    if (false === ret instanceof Nodes.TypeNode && false === ret instanceof Nodes.ReferenceNode) {
      console.error('Node ' + astNode.type + ' did not yield a type node');
      console.log(ret);
    }
    return ret;
  },
  CaseLiteral(x: Nodes.ASTNode) {
    const literal = visit(x.children[0]);
    const rhs = visit(x.children[1]);
    return new Nodes.MatchLiteralNode(x, literal, rhs);
  },
  CaseCondition(x: Nodes.ASTNode) {
    const condition = visit(x.children[1]);
    const rhs = visit(x.children[2]);
    const ret = new Nodes.MatchConditionNode(x, condition, rhs);
    ret.declaredName = visit(x.children[0]) as Nodes.NameIdentifierNode;
    return ret;
  },
  CaseIs(x: Nodes.ASTNode) {
    const rhs = visitLastChild(x);
    const typeReference = visitChildTypeOrFail(x, 'Reference') as Nodes.ReferenceNode;
    const ret = new Nodes.MatchCaseIsNode(x, typeReference, rhs);

    ret.declaredName = visitChildTypeOrNull(x, 'NameIdentifier') as Nodes.NameIdentifierNode;

    const deconstruct = findChildrenType(x, 'DeconstructStruct');

    if (deconstruct) {
      ret.deconstructorNames = deconstruct.children.map(($) => visit($));
    }

    return ret;
  },
  CaseElse(x: Nodes.ASTNode) {
    return new Nodes.MatchDefaultNode(x, visit(x.children[0]));
  },
  LoopExpression(x: Nodes.ASTNode) {
    return new Nodes.LoopNode(x, visit(x.children[0]));
  },

  ContinueStatement(x: Nodes.ASTNode) {
    return new Nodes.ContinueNode(x);
  },

  BreakStatement(x: Nodes.ASTNode) {
    return new Nodes.BreakNode(x);
  },
  PostfixNumber(x: Nodes.ASTNode) {
    const literal = visit(x.children[0]) as Nodes.IntegerLiteral | Nodes.HexLiteral | Nodes.FloatLiteral;
    literal.suffixReference = visit(x.children[1]);
    return literal;
  },
  NumberLiteral(x: Nodes.ASTNode) {
    if (x.text.includes('.') || x.text.includes('E') || x.text.includes('e')) {
      return new Nodes.FloatLiteral(x, 'f32');
    } else {
      let type = 'i64';

      // tslint:disable-next-line:radix
      const intValue = parseInt(x.text);
      if (intValue >= -2147483648 && intValue <= 4294967295) {
        type = 'i32';
      }

      return new Nodes.IntegerLiteral(x, type);
    }
  },
  NegNumberLiteral(x: Nodes.ASTNode) {
    if (x.text.includes('.') || x.text.includes('E') || x.text.includes('e')) {
      return new Nodes.FloatLiteral(x, 'f32');
    } else {
      return new Nodes.IntegerLiteral(x, 'i32');
    }
  },
  HexLiteral(x: Nodes.ASTNode) {
    const typeName = x.text.length > '0x00000000'.length ? 'u64' : 'u32';
    return new Nodes.HexLiteral(x, typeName);
  },
  StringLiteral(x: Nodes.ASTNode) {
    try {
      const ret = new Nodes.StringLiteral(x, 'string');
      ret.value = JSON.parse(x.text);
      return ret;
    } catch (e) {
      const err = 'Cannot parse string: ' + x.text;
      console.log(err);
      return new PositionCapableError(err, x);
    }
  },
  BinNegExpression(x: Nodes.ASTNode) {
    return new Nodes.UnaryExpressionNode(x, Nodes.NameIdentifierNode.fromString('~', x), visit(x.children[0]));
  },
  NegExpression(x: Nodes.ASTNode) {
    return new Nodes.UnaryExpressionNode(x, Nodes.NameIdentifierNode.fromString('!', x), visit(x.children[0]));
  },
  UnaryMinus(x: Nodes.ASTNode) {
    return new Nodes.UnaryExpressionNode(x, Nodes.NameIdentifierNode.fromString('-', x), visit(x.children[0]));
  },
  BooleanLiteral(x: Nodes.ASTNode) {
    return new Nodes.BooleanLiteral(x, 'boolean');
  },
  Document(astNode: Nodes.ASTNode) {
    const doc = new Nodes.DocumentNode(astNode);
    astNode.children.forEach(($) => doc.directives.push(visit($)));

    return doc;
  },
  IfExpression(astNode: Nodes.ASTNode) {
    const condition = visit(astNode.children[0]);
    const truePart = visit(astNode.children[1]);

    if (astNode.children[2]) {
      const falsePart = visit(astNode.children[2]);
      return new Nodes.IfNode(astNode, condition, truePart, falsePart);
    } else {
      return new Nodes.IfNode(astNode, condition, truePart);
    }
  },
  SyntaxError(node: Nodes.ASTNode) {
    return new PositionCapableError(node.errors[0].message, node);
  },
  StructDirective(astNode: Nodes.ASTNode) {
    const children = astNode.children.slice();

    let child = children[0];
    let isPublic = true;

    if (child.type === 'PrivateModifier') {
      isPublic = false;
      child = children.shift()!;
    }

    const ret = visit(child) as Nodes.StructDeclarationNode;
    ret.isPublic = isPublic;

    return ret;
  },
  UnknownExpression(astNode: Nodes.ASTNode) {
    return new Nodes.UnknownExpressionNode(astNode);
  },
  StructLiteral(astNode: Nodes.ASTNode) {
    const parametersNode = findChildrenTypeOrFail(astNode, 'StructParamsList');
    const parameters = parametersNode.children.filter(($) => $.type === 'Parameter').map(($) => visit($));
    return new Nodes.StructTypeNode(astNode, parameters);
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
    const declaredName = visitChildTypeOrNull(astNode, 'NameIdentifier') as Nodes.NameIdentifierNode;

    const params = findChildrenType(astNode, 'FunctionParamsList');

    return new Nodes.StructDeclarationNode(astNode, declaredName, params ? params.children.map(($) => visit($)) : []);
  },
  UnionType(astNode: Nodes.ASTNode) {
    const ret = new Nodes.UnionTypeNode(astNode);
    ret.of = astNode.children.map(($) => visit($));
    return ret;
  },
  IntersectionType(astNode: Nodes.ASTNode) {
    const ret = new Nodes.IntersectionTypeNode(astNode);
    ret.of = astNode.children.map(($) => visit($));
    return ret;
  },
  TypeParen(astNode: Nodes.ASTNode) {
    const ret = visit(astNode.children[0]);
    ret.hasParentheses = true;
    return ret;
  },
  WasmExpression(astNode: Nodes.ASTNode) {
    const atoms = astNode.children.map(($) => visit($));
    return new Nodes.WasmExpressionNode(astNode, atoms);
  },
  SExpression(astNode: Nodes.ASTNode) {
    const children = astNode.children.slice();
    const symbol = children.shift() as any;

    const newChildren = children.map(($) => visit($) as Nodes.ExpressionNode);

    const ret = new Nodes.WasmAtomNode(astNode, symbol.text, newChildren);

    if (
      ret.symbol === 'call' ||
      ret.symbol === 'global.get' ||
      ret.symbol === 'global.set' ||
      ret.symbol === 'get_global' ||
      ret.symbol === 'set_global'
    ) {
      if (ret.args[0] instanceof Nodes.QNameNode) {
        const qname = ret.args[0] as Nodes.QNameNode;

        const varRef = new Nodes.ReferenceNode(ret.args[0].astNode, qname);

        if (qname.names[0].name.startsWith('$')) {
          // TODO: fix horrible hack $
          qname.names[0].name = qname.names[0].name.replace(/^\$/, '');
        }

        ret.args[0] = varRef;
      }
    }

    return ret;
  },
};

function visit<T extends Nodes.Node>(astNode: Nodes.ASTNode): T & any {
  if (!astNode) {
    console.trace();
    throw new Error('astNode is null');
  }
  if ((visitor as any)[astNode.type]) {
    const x = (visitor as any)[astNode.type](astNode);

    if (!x) {
      throw new PositionCapableError('Error visiting node ' + astNode.type, astNode);
    }

    return x;
  } else {
    throw new PositionCapableError(`Visitor not implemented for ${astNode.type}`, astNode);
  }
}

function findChildrenTypeOrFail(token: Nodes.ASTNode, type: string, message?: string) {
  const ret = token.children.find(($) => $.type === type);
  if (!ret) throw new PositionCapableError(message || `Cannot find child node of type ${type}`, token);
  return ret;
}

function findChildrenType(token: Nodes.ASTNode, type: string) {
  return token.children.find(($) => $.type === type);
}

function visitChildTypeOrNull(token: Nodes.ASTNode, type: string) {
  const child = findChildrenType(token, type);
  if (!child) return null;
  return visit(child);
}
function visitChildTypeOrFail(token: Nodes.ASTNode, type: string) {
  const child = findChildrenTypeOrFail(token, type);
  return visit(child);
}

function visitLastChild(token: Nodes.ASTNode) {
  return visit(token.children[token.children.length - 1]);
}

export function getAST(fileName: string, moduleName: string, content: string, parsingContext: ParsingContext) {
  const parsingTree = getParsingTree(moduleName, content, parsingContext);

  if (!parsingTree) {
    throw new Error('parsing phase did not run or failed');
  }

  process(parsingTree as any, parsingContext);

  try {
    let document = visit(parsingTree) as Nodes.DocumentNode;

    document.moduleName = moduleName;
    document.fileName = fileName;
    document.content = content;

    parsingContext.modulesInContext.set(moduleName, document);

    return document;
  } catch (e) {
    if (e instanceof PositionCapableError) {
      let document = new Nodes.DocumentNode(parsingTree);

      document.moduleName = moduleName;
      document.fileName = fileName;
      document.content = content;

      parsingContext.modulesInContext.set(moduleName, document);

      parsingContext.messageCollector.error(e);

      return document;
    }
    throw e;
  }
}
