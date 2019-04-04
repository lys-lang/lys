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

function getParsingTree(moduleName: string, content: string) {
  const hash = moduleName + '+' + content.length.toString(16) + '_' + DJB2(content).toString(16);

  let ret = parsingCache.get(hash);

  if (!ret) {
    ret = parser.getAST(content, 'Document');
    parsingCache.set(hash, ret);
    setModuleName(moduleName)(ret as any, null);
  }

  return (ret as any) as Nodes.ASTNode;
}

export class ParsingPhaseResult extends PhaseResult {
  document?: Nodes.ASTNode;

  get parsingContext(): ParsingContext {
    return this._parsingContext;
  }

  constructor(
    public fileName: string,
    public moduleName: string,
    public content: string,
    private _parsingContext: ParsingContext
  ) {
    super();
  }

  execute() {
    this.document = getParsingTree(this.moduleName, this.content);

    process(this.document as any, this);

    failWithErrors('Parsing phase', this.parsingContext);
  }
}
