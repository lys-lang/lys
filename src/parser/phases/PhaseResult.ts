export abstract class PhaseResult {
  errors: Error[] = [];

  isSuccess() {
    return this.errors.length === 0;
  }
}
