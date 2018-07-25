import { AstNodeError } from '../NodeError';

export abstract class PhaseResult {
  errors: AstNodeError[] = [];

  isSuccess() {
    return this.errors.length === 0;
  }
}
