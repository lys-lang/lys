import { IErrorPositionCapable } from '../NodeError';
import { ParsingContext } from '../closure';

export abstract class PhaseResult {
  get errors(): IErrorPositionCapable[] {
    return this.parsingContext.messageCollector.errors;
  }

  abstract get parsingContext(): ParsingContext;

  isSuccess() {
    return this.errors.length === 0;
  }
}
