import { Nodes } from '../nodes';
import { walkPreOrder } from '../walker';
import { TokenError } from 'ebnf';
import { ParsingContext, Closure } from '../closure';
import { failIfErrors } from './findAllErrors';
import { PhaseResult } from './PhaseResult';
import { CanonicalPhaseResult } from './canonicalPhase';

const overloadFunctions = function(document: Nodes.DocumentNode, phase: SemanticPhaseResult) {
  const overloadedFunctions: Map<string, Nodes.OverloadedFunctionNode | Nodes.FunDirectiveNode> = new Map();

  const process = walkPreOrder((node: Nodes.Node, _: SemanticPhaseResult) => {
    if (node instanceof Nodes.FunDirectiveNode) {
      const name = node.functionNode.functionName.name;
      const x = overloadedFunctions.get(name);
      if (x) {
        if (x instanceof Nodes.OverloadedFunctionNode) {
          x.functions.push(node);
        } else {
          const overloaded = new Nodes.OverloadedFunctionNode(node.astNode);
          overloaded.name = name;
          overloadedFunctions.set(name, overloaded);
          overloaded.functions = [x];
        }
      } else {
        const overloaded = new Nodes.OverloadedFunctionNode(node.astNode);
        overloaded.name = name;
        overloadedFunctions.set(name, overloaded);
        overloaded.functions = [node];
      }
    }
  });

  process(document, phase);

  document.directives = document.directives.filter($ => !($ instanceof Nodes.FunDirectiveNode));

  overloadedFunctions.forEach($ => {
    document.directives.push($);
  });

  return document;
};

const checkDuplicatedNames = walkPreOrder((node: Nodes.Node, _: SemanticPhaseResult, _1: Nodes.Node) => {
  if (node instanceof Nodes.FunctionNode) {
    let used = [];
    node.parameters.forEach(param => {
      if (used.indexOf(param.parameterName.name) == -1) {
        used.push(param.parameterName.name);
      } else {
        throw new TokenError(`Duplicated parameter "${param.parameterName.name}"`, node.astNode);
      }
    });
  }

  if (node instanceof Nodes.MatchNode) {
    if (node.matchingSet.length == 0) {
      throw new TokenError(`Invalid match expression, there are no matchers`, node.astNode);
    }
    if (node.matchingSet.length == 1 && node.matchingSet[0] instanceof Nodes.MatchDefaultNode) {
      throw new TokenError(`This match is useless`, node.astNode);
    }
  }
});

export class SemanticPhaseResult extends PhaseResult {
  get document() {
    return this.canonicalPhaseResult.document;
  }

  constructor(public canonicalPhaseResult: CanonicalPhaseResult, public parsingContext = new ParsingContext()) {
    super();
    this.execute();
  }

  protected execute() {
    this.document.closure = new Closure(this.parsingContext);

    overloadFunctions(this.document, this);
    checkDuplicatedNames(this.document, this);

    failIfErrors('Semantic phase', this.document, this);
  }
}
