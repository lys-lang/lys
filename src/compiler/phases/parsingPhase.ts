import { PhaseResult } from './PhaseResult';
import { parser } from '../../grammar';
import { walkPreOrder } from '../walker';
import { failWithErrors } from '../findAllErrors';
import { ParsingContext } from '../ParsingContext';
import { Nodes } from '../nodes';
import { PositionCapableError } from '../NodeError';
import { IToken, TokenError } from 'ebnf';

const process = walkPreOrder((token: IToken, result: PhaseResult) => {
  if (token.errors && token.errors.length) {
    token.errors.forEach(($: TokenError) => {
      if ($) {
        result.parsingContext.messageCollector.error(new PositionCapableError($.message, token as any));
      }
    });
  }
});

const setDocument = (document: string) =>
  walkPreOrder((token: any) => {
    token.document = document;
  });

const parsingCache = new Map<string /** hash */, IToken>();

function DJB2(input: string) {
  let hash = 5381;

  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) + hash + input.charCodeAt(i);
  }

  return hash;
}

function getParsingTree(salt: string, fileName: string, content: string) {
  const hash = salt + '_' + content.length.toString(16) + DJB2(content).toString(16);

  let ret = parsingCache.get(hash);

  if (!ret) {
    ret = parser.getAST(content, 'Document');
    parsingCache.set(hash, ret);
    setDocument(fileName)(ret as any, null);
  } else {
    console.log(hash);
  }

  return (ret as any) as Nodes.ASTNode;
}

export class ParsingPhaseResult extends PhaseResult {
  document?: Nodes.ASTNode;

  get parsingContext(): ParsingContext {
    return this._parsingContext;
  }

  constructor(public fileName: string, public content: string, private _parsingContext: ParsingContext) {
    super();
  }

  static fromString(code: string, parsingContext: ParsingContext) {
    return new ParsingPhaseResult('(injected code)', code, parsingContext);
  }

  execute() {
    const salt = this.parsingContext.system.relative(
      this.parsingContext.system.getCurrentDirectory(),
      this.parsingContext.system.resolvePath(this.fileName)
    );

    this.document = getParsingTree(salt, this.fileName, this.content);

    process(this.document as any, this);

    failWithErrors('Parsing phase', this.parsingContext);
  }
}
