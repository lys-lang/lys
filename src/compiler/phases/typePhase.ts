import { TypeResolutionContext } from '../types/TypePropagator';
import { TypeGraphBuilder } from '../types/TypeGraphBuilder';
import { Nodes, PhaseFlags } from '../nodes';
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
import { getDocument, fixParents } from './helpers';

const initializeTypes = walkPreOrder<Nodes.Node>(
  (_node, _phase) => {
    // stub
  },
  (node, parsingContext: ParsingContext) => {
    if (node instanceof Nodes.TypeDirectiveNode) {
      if (node.valueType instanceof Nodes.StructTypeNode) {
        node.valueType.ofType = TypeType.of(
          createTypeAlias(node.variableName, new StructType(node.valueType.parameters), parsingContext)
        );
        node.variableName.ofType = node.valueType.ofType;
      } else if (node.valueType instanceof Nodes.StackTypeNode) {
        const lowLevelType = node.valueType.metadata['lowLevelType'];
        const byteSize = node.valueType.metadata['byteSize'];

        let hasError = false;

        if (!lowLevelType) {
          parsingContext.messageCollector.error(`Missing lowLevelType schema`, node.valueType);
          node.variableName.ofType = InjectableTypes.never;
          hasError = true;
        } else if (!(lowLevelType instanceof Nodes.StringLiteral)) {
          node.variableName.ofType = InjectableTypes.never;
          parsingContext.messageCollector.error(`lowLevelType must be a string`, lowLevelType);
          hasError = true;
        }

        if (!byteSize) {
          parsingContext.messageCollector.error(`Missing byteSize schema`, node.valueType);
          node.variableName.ofType = InjectableTypes.never;
          return;
        } else if (!(byteSize instanceof Nodes.IntegerLiteral)) {
          node.variableName.ofType = InjectableTypes.never;
          parsingContext.messageCollector.error(`byteSize must be a number`, lowLevelType);
          hasError = true;
        }

        if (!hasError) {
          const type: NativeTypes = lowLevelType.value as any;

          if (type in NativeTypes) {
            node.variableName.ofType = TypeType.of(
              createTypeAlias(
                node.variableName,
                StackType.of(node.variableName.name!, type, byteSize.value),
                parsingContext
              )
            );
          } else {
            node.variableName.ofType = InjectableTypes.never;
            parsingContext.messageCollector.error(`Unknown lowLevelType ${lowLevelType.value}`, lowLevelType);
          }
        }
      } else if (node.valueType instanceof Nodes.InjectedTypeNode) {
        if (node.variableName.name in InjectableTypes) {
          node.variableName.ofType = TypeType.of(
            createTypeAlias(node.variableName, (InjectableTypes as any)[node.variableName.name], parsingContext)
          );
        } else {
          parsingContext.messageCollector.error(`Unknown injectable type`, node.valueType);
          node.variableName.ofType = TypeType.of(
            createTypeAlias(node.variableName, InjectableTypes.never, parsingContext)
          );
        }
      } else if (node.valueType instanceof Nodes.UnionTypeNode) {
        node.variableName.ofType = TypeType.of(createTypeAlias(node.variableName, new UnionType(), parsingContext));
      } else if (node.valueType instanceof Nodes.IntersectionTypeNode) {
        node.variableName.ofType = TypeType.of(
          createTypeAlias(node.variableName, new IntersectionType(), parsingContext)
        );
      } else if (node.valueType instanceof Nodes.ReferenceNode) {
        node.variableName.ofType = TypeType.of(createTypeAlias(node.variableName, new UnionType(), parsingContext));
      } else if (!node.valueType) {
        parsingContext.messageCollector.error(`Missing type`, node);
      }
    }
  }
);

export function executeTypePhase(document: Nodes.DocumentNode, parsingContext: ParsingContext, printGraph = false) {
  if (document.phasesRun & PhaseFlags.TypeCheck) return;

  fixParents(document, parsingContext);
  initializeTypes(document, parsingContext);

  try {
    const graphBuilder = new TypeGraphBuilder(parsingContext, parsingContext.typeGraph);

    const typeGraph = (document.typeGraph = graphBuilder.build(document));
    const typeResolutionContext = new TypeResolutionContext(typeGraph, parsingContext);

    const executor = typeResolutionContext.newExecutorWithContext(document.closure!, typeGraph, parsingContext);

    // TODO: find similar signature decl in same scopes

    try {
      executor.run();
    } catch (e) {
      if (printGraph) {
        console.log(print(typeGraph));
      }
      throw e;
    }
  } catch (e) {
    if (e instanceof AstNodeError) {
      parsingContext.messageCollector.error(e);
    } else {
      console.error(e);
      throw e;
    }
  }

  document.phasesRun |= PhaseFlags.TypeCheck;
}

function createTypeAlias(name: Nodes.NameIdentifierNode, value: Type, parsingContext: ParsingContext) {
  const document = getDocument(name);
  if (!document) throw new AstNodeError('Cannot find document', name);
  const discriminant = parsingContext.getTypeDiscriminant(document.moduleName, name.name);
  const alias = new TypeAlias(name, value);
  alias.discriminant = discriminant;
  return alias;
}
