import { ParsingContext } from '../closure';

export abstract class PhaseResult {
  abstract get parsingContext(): ParsingContext;

  isSuccess() {
    return this.parsingContext.messageCollector.errors.length === 0;
  }
}
