import { PhaseResult } from './PhaseResult';
import { IToken } from 'ebnf';
import { parser } from '../../grammar';
import { walkPreOrder } from '../walker';
import { failWithErrors } from './findAllErrors';
import { ParsingContext } from '../closure';

const process = walkPreOrder((token: IToken, result: PhaseResult) => {
  if (token.errors && token.errors.length) {
    token.errors.forEach(($: any) => {
      if ($ && !result.errors.includes($)) {
        result.errors.push($);
      }
    });
  }
});

export class ParsingPhaseResult extends PhaseResult {
  document: IToken;

  get parsingContext(): ParsingContext {
    return this._parsingContext;
  }

  constructor(
    public fileName: string,
    public content: string,
    private _parsingContext: ParsingContext = new ParsingContext()
  ) {
    super();
    this.execute();
  }

  protected execute() {
    this.document = parser.getAST(this.content, 'Document');

    process(this.document, this);

    failWithErrors('Parsing phase', this.errors, this);
  }

  static fromString(code: string) {
    return new ParsingPhaseResult('injected code', code);
  }
}
