import { ParsingContext } from './compiler/ParsingContext';
import { failWithErrors } from './compiler/findAllErrors';
import { CodeGenerationPhaseResult } from './compiler/phases/codeGenerationPhase';
import { System } from './compiler/System';
import { PhaseFlags } from './compiler/nodes';

export { ParsingContext, System };

export function compile(parsingContext: ParsingContext, moduleName: string) {
  const compilation = parsingContext.getPhase(moduleName, PhaseFlags.Compilation);

  const codeGen = new CodeGenerationPhaseResult(compilation, parsingContext);

  failWithErrors(`Code generation`, parsingContext);

  return codeGen;
}
