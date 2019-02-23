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
import {
  InjectableTypes,
  StructType,
  UnionType,
  TypeType,
  TypeAlias,
  IntersectionType,
  StackType,
  NativeTypes
} from '../types';

const fixParents = walkPreOrder<Nodes.Node>((node, _, parent) => {
  node.parent = parent;
});

const initializeTypes = walkPreOrder<Nodes.Node>(
  (_node, _phase) => {},
  (node, phase: TypePhaseResult) => {
    if (node instanceof Nodes.TypeDirectiveNode) {
      if (node.valueType instanceof Nodes.StructTypeNode) {
        node.variableName.ofType = TypeType.of(
          new TypeAlias(node.variableName, new StructType(node.variableName.name, node.valueType.names))
        );
      } else if (node.valueType instanceof Nodes.StackTypeNode) {
        const lowLevelType = node.valueType.metadata['lowLevelType'];

        if (!lowLevelType) {
          phase.parsingContext.messageCollector.error(`Missing lowLevelType schema`, node.valueType);
          node.variableName.ofType = InjectableTypes.never;
          return;
        }

        if (lowLevelType instanceof Nodes.StringLiteral) {
          const type: NativeTypes = lowLevelType.value as any;

          if (type in NativeTypes) {
            node.variableName.ofType = TypeType.of(
              new TypeAlias(node.variableName, new StackType(node.variableName.name, type))
            );
          } else {
            node.variableName.ofType = InjectableTypes.never;
            phase.parsingContext.messageCollector.error(`Unknown lowLevelType ${lowLevelType.value}`, lowLevelType);
          }
        } else {
          node.variableName.ofType = InjectableTypes.never;
          phase.parsingContext.messageCollector.error(`lowLevelType must be a string`, lowLevelType);
        }
      } else if (node.valueType instanceof Nodes.InjectedTypeNode) {
        if (node.variableName.name in InjectableTypes) {
          node.variableName.ofType = TypeType.of(
            new TypeAlias(node.variableName, InjectableTypes[node.variableName.name])
          );
        } else {
          phase.parsingContext.messageCollector.error(`Unknown injectable type`, node.valueType);
          node.variableName.ofType = TypeType.of(new TypeAlias(node.variableName, InjectableTypes.never));
        }
      } else if (node.valueType instanceof Nodes.UnionTypeNode) {
        node.variableName.ofType = TypeType.of(new TypeAlias(node.variableName, new UnionType()));
      } else if (node.valueType instanceof Nodes.IntersectionTypeNode) {
        node.variableName.ofType = TypeType.of(new TypeAlias(node.variableName, new IntersectionType()));
      } else if (!node.valueType) {
        phase.parsingContext.messageCollector.error(`Missing type`, node);
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
