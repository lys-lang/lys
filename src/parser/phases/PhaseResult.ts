import { IErrorPositionCapable } from '../NodeError';

export abstract class PhaseResult {
  errors: IErrorPositionCapable[] = [];

  isSuccess() {
    return this.errors.length === 0;
  }
}
