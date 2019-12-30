import {
  IErrorPositionCapable,
  PositionCapableError,
  isSamePosition,
  isSamePositionOrInside,
  LysCompilerError,
  IPositionCapable
} from './NodeError';
import { Nodes } from './nodes';

export class MessageCollector {
  errors: IErrorPositionCapable[] = [];

  error(error: IErrorPositionCapable): void;
  error(message: string | Error, position: IPositionCapable): void;
  error(error: string | Error, position?: IPositionCapable): void {
    if (error instanceof PositionCapableError) {
      if (!this.errors.some($ => $.message === error.message && isSamePosition($.position, error.position))) {
        this.errors.push(error);
      }
    } else {
      const message = error instanceof Error ? error.message : error;
      if (position) {
        if (!this.errors.some($ => $.message === message && isSamePosition($.position, position))) {
          const err = new PositionCapableError(message, position);
          if (error instanceof Error && error.stack) {
            err.stack = error.stack;
          }

          this.errors.push(err);
        }
      } else {
        const err = error instanceof Error ? error : new Error(error);
        this.errors.push(err as any);

        if (error instanceof Error && error.stack) {
          err.stack = error.stack;
        }
      }
    }
  }

  errorIfBranchDoesntHaveAny(message: PositionCapableError): void;
  errorIfBranchDoesntHaveAny(message: string, node: Nodes.Node): void;
  errorIfBranchDoesntHaveAny(message: string | PositionCapableError, node?: Nodes.Node) {
    const position = (message instanceof PositionCapableError && message.position) || (node && node.astNode);

    if (!this.hasErrorForBranch(position!)) {
      this.error(message, position!);
    }
  }

  warning(message: string, node: Nodes.Node) {
    if (!this.errors.some($ => $.message === message && isSamePosition($.position, node.astNode))) {
      this.errors.push(new LysCompilerError(message, node, true));
    }
  }

  removeErrorsFromModule(moduleName: string) {
    this.errors = this.errors.filter($ => $.position && $.position.moduleName !== moduleName);
  }

  hasErrorForBranch(position: IPositionCapable): any {
    return this.errors.some($ => isSamePositionOrInside(position, $.position) && !$.warning);
  }

  hasErrors() {
    return this.errors.some($ => !$.warning);
  }

  /**
   * Takes the content of other message collector into this instance. The other instance will be purged.
   * @param otherMessageCollector
   */
  mergeWith(otherMessageCollector: MessageCollector) {
    otherMessageCollector.errors.forEach(error => this.error(error));
    otherMessageCollector.errors.length = 0;
  }
}
