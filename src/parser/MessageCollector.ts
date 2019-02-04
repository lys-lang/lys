import { IErrorPositionCapable, AstNodeError, PositionCapableError } from './NodeError';
import { Nodes } from './nodes';

export class MessageCollector {
  errors: IErrorPositionCapable[] = [];

  error(error: IErrorPositionCapable);
  error(message: string, node: Nodes.Node);
  error(error: string | Error, node?: Nodes.Node) {
    if (error instanceof AstNodeError || error instanceof PositionCapableError) {
      if (
        error instanceof PositionCapableError ||
        !this.errors.some($ => $.message == error.message && $.node == error.node)
      ) {
        this.errors.push(error);
      }
    } else {
      if (!this.errors.some($ => $.message == error && $.node == node)) {
        const err = new AstNodeError(error.toString(), node);
        if (error instanceof Error && error.stack) {
          err.stack = error.stack;
        }

        this.errors.push(err);
      }
    }
  }

  warning(message: string, node: Nodes.Node) {
    if (!this.errors.some($ => $.message == message && $.node == node)) {
      this.errors.push(new AstNodeError(message, node, true));
    }
  }

  hasErrorFor(node: Nodes.Node): any {
    return this.errors.some($ => $.node === node);
  }

  hasErrorForBranch(node: Nodes.Node): any {
    return this.errors.some($ => $.node === node) || node.children.some($ => this.hasErrorForBranch($));
  }

  hasErrors() {
    return this.errors.some($ => !$.warning);
  }

  /**
   * Takes the content of other message collector into this instance. The other instance will be purged.
   * @param otherMessageCollector
   */
  mergeWith(otherMessageCollector: MessageCollector) {
    this.errors = this.errors.concat(otherMessageCollector.errors);
    otherMessageCollector.errors.length = 0;
  }
}
