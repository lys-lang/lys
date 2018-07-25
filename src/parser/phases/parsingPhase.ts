import { PhaseResult } from './PhaseResult';
import { IToken } from 'ebnf';
import { parser } from '../../grammar';
import { walkPreOrder } from '../walker';
import { failWithErrors } from './findAllErrors';
import { AstNodeError } from '../NodeError';

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
  errors: AstNodeError[] = [];

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
