import { failWithErrors } from './findAllErrors';
import { PhaseResult } from './PhaseResult';
import { ScopePhaseResult } from './scopePhase';
import { TypeResolutionContext } from '../types/TypePropagator';
import { TypeGraph } from '../types/TypeGraph';
import { TypeGraphBuilder } from '../types/TypeGraphBuilder';
import { AstNodeError } from '../NodeError';
import { Nodes } from '../nodes';
import { walkPreOrder } from '../walker';

const fixParents = walkPreOrder<Nodes.Node>((node, _, parent) => {
  node.parent = parent;
});

export class TypePhaseResult extends PhaseResult {
  typeGraph: TypeGraph;
  typeResolutionContext: TypeResolutionContext;

  get document(): Nodes.DocumentNode {
    return this.scopePhaseResult.document;
  }

  get errors() {
    return this.scopePhaseResult.semanticPhaseResult.parsingContext.messageCollector.errors;
  }

  set errors(val: AstNodeError[]) {
    if (val.length) throw new Error('cannot set errors property');
  }

  constructor(public scopePhaseResult: ScopePhaseResult) {
    super();

    fixParents(this.document, this);

    const graphBuilder = new TypeGraphBuilder(this.scopePhaseResult.semanticPhaseResult.parsingContext);

    this.typeGraph = graphBuilder.build(this.document);
    this.typeResolutionContext = new TypeResolutionContext(
      this.typeGraph,
      this.scopePhaseResult.semanticPhaseResult.parsingContext
    );
  }

  ensureIsValid() {
    failWithErrors(
      'Type phase',
      this.scopePhaseResult.semanticPhaseResult.parsingContext.messageCollector.errors,
      this
    );
  }

  execute() {
    const executor = this.typeResolutionContext.newExecutorWithContext(
      this.document.closure,
      this.typeGraph,
      this.scopePhaseResult.semanticPhaseResult.parsingContext
    );

    executor.run();
    // failWithErrors('Type phase', this.scopePhaseResult.semanticPhaseResult.parsingContext.errors, this);
  }
}
