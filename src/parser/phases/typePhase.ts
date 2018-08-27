import { failWithErrors } from './findAllErrors';
import { PhaseResult } from './PhaseResult';
import { ScopePhaseResult } from './scopePhase';
import { TypeResolutionContext } from '../types/TypePropagator';
import { TypeGraph } from '../types/TypeGraph';
import { TypeGraphBuilder } from '../types/TypeGraphBuilder';
import { Nodes } from '../nodes';
import { walkPreOrder } from '../walker';
import { ParsingContext } from '../closure';

const fixParents = walkPreOrder<Nodes.Node>((node, _, parent) => {
  node.parent = parent;
});

export class TypePhaseResult extends PhaseResult {
  typeGraph: TypeGraph;
  typeResolutionContext: TypeResolutionContext;

  get document(): Nodes.DocumentNode {
    return this.scopePhaseResult.document;
  }

  get parsingContext(): ParsingContext {
    return this.scopePhaseResult.parsingContext;
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
  }
}
