import { ParsingContext } from './compiler/ParsingContext';
import { failWithErrors } from './compiler/findAllErrors';
import { CodeGenerationPhaseResult } from './compiler/phases/codeGenerationPhase';
import { System } from './compiler/System';

export { ParsingContext, System };

export function compile(parsingContext: ParsingContext, moduleName: string) {
  const compilation = parsingContext.getCompilationPhase(moduleName);

  const codeGen = new CodeGenerationPhaseResult(compilation, parsingContext);
  failWithErrors(`Code generation phase`, parsingContext);

  return codeGen;
}
