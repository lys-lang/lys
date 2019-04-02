import { failWithErrors } from '../findAllErrors';
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
  UnionType,
  TypeType,
  TypeAlias,
  IntersectionType,
  StackType,
  NativeTypes,
  Type,
  StructType
} from '../types';
import { AstNodeError } from '../NodeError';

const fixParents = walkPreOrder<Nodes.Node>((node, _, parent) => {
  if (parent) {
    node.parent = parent;
  }
});

const initializeTypes = walkPreOrder<Nodes.Node>(
  (_node, _phase) => {
    // stub
  },
  (node, phase: TypePhaseResult) => {
    if (node instanceof Nodes.TypeDirectiveNode) {
      if (node.valueType instanceof Nodes.StructTypeNode) {
        node.valueType.ofType = TypeType.of(
          phase.createTypeAlias(node.variableName!, new StructType(node.valueType.parameters))
        );
        node.variableName!.ofType = node.valueType.ofType;
      } else if (node.valueType instanceof Nodes.StackTypeNode) {
        const lowLevelType = node.valueType.metadata['lowLevelType'];
        const byteSize = node.valueType.metadata['byteSize'];

        let hasError = false;

        if (!lowLevelType) {
          phase.parsingContext.messageCollector.error(`Missing lowLevelType schema`, node.valueType);
          node.variableName!.ofType = InjectableTypes.never;
          hasError = true;
        } else if (!(lowLevelType instanceof Nodes.StringLiteral)) {
          node.variableName!.ofType = InjectableTypes.never;
          phase.parsingContext.messageCollector.error(`lowLevelType must be a string`, lowLevelType);
          hasError = true;
        }

        if (!byteSize) {
          phase.parsingContext.messageCollector.error(`Missing byteSize schema`, node.valueType);
          node.variableName!.ofType = InjectableTypes.never;
          return;
        } else if (!(byteSize instanceof Nodes.IntegerLiteral)) {
          node.variableName!.ofType = InjectableTypes.never;
          phase.parsingContext.messageCollector.error(`byteSize must be a number`, lowLevelType);
          hasError = true;
        }

        if (!hasError) {
          const type: NativeTypes = lowLevelType.value as any;

          if (type in NativeTypes) {
            node.variableName!.ofType = TypeType.of(
              phase.createTypeAlias(node.variableName!, StackType.of(node.variableName!.name!, type, byteSize.value))
            );
          } else {
            node.variableName!.ofType = InjectableTypes.never;
            phase.parsingContext.messageCollector.error(`Unknown lowLevelType ${lowLevelType.value}`, lowLevelType);
          }
        }
      } else if (node.valueType instanceof Nodes.InjectedTypeNode) {
        if (node.variableName!.name! in InjectableTypes) {
          node.variableName!.ofType = TypeType.of(
            phase.createTypeAlias(node.variableName!, (InjectableTypes as any)[node.variableName!.name!])
          );
        } else {
          phase.parsingContext.messageCollector.error(`Unknown injectable type`, node.valueType);
          node.variableName!.ofType = TypeType.of(phase.createTypeAlias(node.variableName!, InjectableTypes.never));
        }
      } else if (node.valueType instanceof Nodes.UnionTypeNode) {
        node.variableName!.ofType = TypeType.of(phase.createTypeAlias(node.variableName!, new UnionType()));
      } else if (node.valueType instanceof Nodes.IntersectionTypeNode) {
        node.variableName!.ofType = TypeType.of(phase.createTypeAlias(node.variableName!, new IntersectionType()));
      } else if (node.valueType instanceof Nodes.ReferenceNode) {
        node.variableName!.ofType = TypeType.of(phase.createTypeAlias(node.variableName!, new UnionType()));
      } else if (!node.valueType) {
        phase.parsingContext.messageCollector.error(`Missing type`, node);
      }
    }
  }
);

const validateTypes = walkPreOrder<Nodes.Node>(
  (_node, _phase) => {
    // pre
  },
  (_node, _phase: TypePhaseResult) => {
    // post
  }
);

export class TypePhaseResult extends PhaseResult {
  typeGraph!: TypeGraph;
  typeResolutionContext!: TypeResolutionContext;

  get document(): Nodes.DocumentNode {
    return this.scopePhaseResult.document!;
  }

  get parsingContext(): ParsingContext {
    return this.scopePhaseResult.parsingContext;
  }

  constructor(public scopePhaseResult: ScopePhaseResult) {
    super();

    fixParents(this.document, this);
    initializeTypes(this.document, this);

    try {
      const graphBuilder = new TypeGraphBuilder(this.parsingContext, this.parsingContext.typeGraph);

      this.typeGraph = graphBuilder.build(this.document);
      this.typeResolutionContext = new TypeResolutionContext(
        this.typeGraph,
        this.scopePhaseResult.semanticPhaseResult.parsingContext
      );
    } catch (e) {
      if (e instanceof AstNodeError) {
        this.parsingContext.messageCollector.error(e);
      } else {
        console.error(e);
        throw e;
      }
    }
  }

  createTypeAlias(name: Nodes.NameIdentifierNode, value: Type) {
    const discriminant = this.parsingContext.getTypeDiscriminant(this.document.moduleName!, name.name!);
    const alias = new TypeAlias(name, value);
    alias.discriminant = discriminant;
    return alias;
  }

  ensureIsValid() {
    failWithErrors('Type phase', this.parsingContext);
  }

  execute(printGraph = false) {
    const executor = this.typeResolutionContext.newExecutorWithContext(
      this.document.closure!,
      this.typeGraph,
      this.scopePhaseResult.semanticPhaseResult.parsingContext
    );

    // TODO: find similar signature decl in same scopes

    try {
      executor.run();

      validateTypes(this.document, this);
    } catch (e) {
      if (printGraph) {
        console.log(print(this.typeGraph));
      }
      throw e;
    }
  }
}
