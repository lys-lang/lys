import { PhaseResult } from './PhaseResult';
import { IToken, TokenError } from 'ebnf';
import { parser } from '../../grammar';
import { walkPreOrder } from '../walker';
import { failWithErrors } from './findAllErrors';

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
  errors: TokenError[] = [];

  constructor(public fileName: string, public content: string) {
    super();
    this.execute();
  }

  protected execute() {
    this.document = parser.getAST(this.content, 'Document');

    process(this.document, this);

    failWithErrors('Parsing phase', this.errors, this);
  }
}
