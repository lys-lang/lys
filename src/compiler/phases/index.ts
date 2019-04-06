import { Nodes, PhaseFlags } from '../nodes';
import { ParsingContext } from '../ParsingContext';
import { executeSemanticPhase } from './semanticPhase';
import { executeScopePhase } from './scopePhase';
import { executeTypePhase } from './typePhase';
import { executeCompilationPhase } from './compilationPhase';

export function analyze(
  node: Nodes.DocumentNode,
  parsingContext: ParsingContext,
  desiredPhase: PhaseFlags,
  debug = false
) {
  switch (desiredPhase) {
    case PhaseFlags.Semantic:
      executeSemanticPhase(node, parsingContext);
      return;
    case PhaseFlags.Scope:
      executeSemanticPhase(node, parsingContext);
      executeScopePhase(node, parsingContext);
      return;
    case PhaseFlags.TypeCheck:
      executeSemanticPhase(node, parsingContext);
      executeScopePhase(node, parsingContext);
      executeTypePhase(node, parsingContext, debug);
      return;
    case PhaseFlags.Compilation:
      executeSemanticPhase(node, parsingContext);
      executeScopePhase(node, parsingContext);
      executeTypePhase(node, parsingContext, debug);
      executeCompilationPhase(node, parsingContext);
      return;
  }
}
