import { PhaseFlags } from '../nodes';
import { ParsingContext } from '../ParsingContext';
import { executeSemanticPhase } from './semanticPhase';
import { executeScopePhase, executeNameInitializationPhase } from './scopePhase';
import { executeTypeCheck, executeTypeInitialization } from './typePhase';
import { executeCompilationPhase, executePreCompilationPhase } from './compilationPhase';

export function analyze(moduleName: string, parsingContext: ParsingContext, desiredPhase: PhaseFlags, debug = false) {
  const document = parsingContext.getExistingParsingPhaseForModule(moduleName)!;
  if (document) {
    while (document.analysis.nextPhase <= desiredPhase) {
      const nextPhase = document.analysis.nextPhase;
      if (PhaseFlags.Semantic === nextPhase) {
        executeSemanticPhase(moduleName, parsingContext);
      } else if (PhaseFlags.NameInitialization === nextPhase) {
        executeNameInitializationPhase(moduleName, parsingContext);
      } else if (PhaseFlags.Scope === nextPhase) {
        executeScopePhase(moduleName, parsingContext);
      } else if (PhaseFlags.TypeInitialization === nextPhase) {
        executeTypeInitialization(moduleName, parsingContext);
      } else if (PhaseFlags.TypeCheck === nextPhase) {
        executeTypeCheck(moduleName, parsingContext, debug);
      } else if (PhaseFlags.PreCompilation === nextPhase) {
        executePreCompilationPhase(moduleName, parsingContext);
      } else if (PhaseFlags.Compilation === nextPhase) {
        executeCompilationPhase(moduleName, parsingContext);
      }
      if (document.analysis.nextPhase === nextPhase) {
        throw new Error(`Error in phase ${PhaseFlags[nextPhase]}`);
      }
    }
  } else {
    throw new Error('Module not found ' + moduleName);
  }
}
