import { PhaseResult } from './PhaseResult';
import { parser } from '../../grammar';
import { walkPreOrder } from '../walker';
import { failWithErrors } from './findAllErrors';
import { ParsingContext } from '../ParsingContext';
import { Nodes } from '../nodes';
import { PositionCapableError } from '../NodeError';

const process = walkPreOrder((token: Nodes.ASTNode, result: PhaseResult) => {
  if (token.errors && token.errors.length) {
    token.errors.forEach(($: any) => {
      if ($ && !result.parsingContext.messageCollector.errors.includes($)) {
        result.parsingContext.messageCollector.error(new PositionCapableError($, token as any));
      }
    });
  }
});

const setDocument = (document: string) =>
  walkPreOrder((token: Nodes.ASTNode) => {
    token.document = document;
  });

export class ParsingPhaseResult extends PhaseResult {
  document: Nodes.ASTNode;

  get parsingContext(): ParsingContext {
    return this._parsingContext;
  }

  constructor(
    public fileName: string,
    public content: string,
    private _parsingContext: ParsingContext = new ParsingContext(),
    doNotExecute = false
  ) {
    super();
    if (!doNotExecute) this.execute();
  }

  execute() {
    this.document = parser.getAST(this.content, 'Document') as any;
    setDocument(this.fileName)(this.document, this);

    process(this.document, this);

    failWithErrors('Parsing phase', this.parsingContext);
  }

  static fromString(code: string) {
    return new ParsingPhaseResult('(injected code)', code);
  }
}
