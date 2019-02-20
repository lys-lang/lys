import { failWithErrors } from './findAllErrors';
import { PhaseResult } from './PhaseResult';
import { ScopePhaseResult } from './scopePhase';
import { TypeResolutionContext } from '../types/TypePropagator';
import { TypeGraph } from '../types/TypeGraph';
import { TypeGraphBuilder } from '../types/TypeGraphBuilder';
import { Nodes } from '../nodes';
import { walkPreOrder } from '../walker';
import { ParsingContext } from '../ParsingContext';
import { print } from '../../utils/typeGraphPrinter';
import { InjectableTypes, StructType, UnionType, TypeType, TypeAlias, IntersectionType } from '../types';

const fixParents = walkPreOrder<Nodes.Node>((node, _, parent) => {
  node.parent = parent;
});

const initializeTypes = walkPreOrder<Nodes.Node>(
  (_node, _phase) => {},
  (node, phase: TypePhaseResult) => {
    if (node instanceof Nodes.TypeDirectiveNode) {
      if (node.valueType instanceof Nodes.StructSignarureNode) {
        node.variableName.ofType = TypeType.of(
          new TypeAlias(node.variableName, new StructType(node.variableName.name, node.valueType.names))
        );
      } else if (!node.valueType) {
        if (node.variableName.name in InjectableTypes) {
          node.variableName.ofType = TypeType.of(
            new TypeAlias(node.variableName, InjectableTypes[node.variableName.name])
          );
        } else {
          node.variableName.ofType = TypeType.of(new TypeAlias(node.variableName, InjectableTypes.never));
        }
      } else if (node.variableName.name in InjectableTypes) {
        node.variableName.ofType = TypeType.of(InjectableTypes.never);
        phase.parsingContext.messageCollector.error(
          `Cannot find built-in type "${node.variableName.name}"`,
          node.variableName
        );
      } else if (node.valueType instanceof Nodes.UnionTypeNode) {
        node.variableName.ofType = TypeType.of(new TypeAlias(node.variableName, new UnionType()));
      } else if (node.valueType instanceof Nodes.IntersectionTypeNode) {
        node.variableName.ofType = TypeType.of(new TypeAlias(node.variableName, new IntersectionType()));
      }
    }
  }
);

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
    initializeTypes(this.document, this);

    const graphBuilder = new TypeGraphBuilder(
      this.scopePhaseResult.semanticPhaseResult.parsingContext,
      this.scopePhaseResult.parsingContext.typeGraph
    );

    this.typeGraph = graphBuilder.build(this.document);
    this.typeResolutionContext = new TypeResolutionContext(
      this.typeGraph,
      this.scopePhaseResult.semanticPhaseResult.parsingContext
    );
  }

  ensureIsValid() {
    failWithErrors('Type phase', this.parsingContext);
  }

  execute(printGraph = false) {
    const executor = this.typeResolutionContext.newExecutorWithContext(
      this.document.closure,
      this.typeGraph,
      this.scopePhaseResult.semanticPhaseResult.parsingContext
    );

    // TODO: find similar signature decl in same scopes

    try {
      executor.run();
    } catch (e) {
      if (printGraph) {
        console.log(print(this.typeGraph));
      }
      throw e;
    }
  }
}
