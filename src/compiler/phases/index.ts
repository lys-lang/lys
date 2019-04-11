import { Nodes, PhaseFlags } from '../nodes';
import { ParsingContext } from '../ParsingContext';
import { executeSemanticPhase } from './semanticPhase';
import { executeScopePhase, executeNameInitializationPhase } from './scopePhase';
import { executeTypeCheck, executeTypeGraph } from './typePhase';
import { executeCompilationPhase } from './compilationPhase';

export function analyze(
  node: Nodes.DocumentNode,
  parsingContext: ParsingContext,
  desiredPhase: PhaseFlags,
  debug = false
) {
  if (PhaseFlags.Semantic <= desiredPhase) executeSemanticPhase(node, parsingContext);
  if (PhaseFlags.NameInitialization <= desiredPhase) executeNameInitializationPhase(node, parsingContext);
  if (PhaseFlags.Scope <= desiredPhase) executeScopePhase(node, parsingContext);
  if (PhaseFlags.TypeGraph <= desiredPhase) executeTypeGraph(node, parsingContext);
  if (PhaseFlags.TypeCheck <= desiredPhase) executeTypeCheck(node, parsingContext, debug);
  if (PhaseFlags.Compilation <= desiredPhase) executeCompilationPhase(node, parsingContext);
}
