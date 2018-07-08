import { CompilationPhaseResult } from '../dist/parser/phases/compilationPhase';
import { ParsingPhaseResult } from '../dist/parser/phases/parsingPhase';
import { CanonicalPhaseResult } from '../dist/parser/phases/canonicalPhase';
import { SemanticPhaseResult } from '../dist/parser/phases/semanticPhase';
import { ScopePhaseResult } from '../dist/parser/phases/scopePhase';
import { TypePhaseResult } from '../dist/parser/phases/typePhase';
import { CodeGenerationPhaseResult } from '../dist/parser/phases/codeGenerationPhase';

declare var it;

const phases = function(txt: string): CodeGenerationPhaseResult {
  const parsing = new ParsingPhaseResult('test.ro', txt);
  const canonical = new CanonicalPhaseResult(parsing);
  const semantic = new SemanticPhaseResult(canonical);
  const scope = new ScopePhaseResult(semantic);
  const types = new TypePhaseResult(scope);
  const compilation = new CompilationPhaseResult(types);
  return new CodeGenerationPhaseResult(compilation);
};

export function test(name: string, src: string, customTest?: (document: any, error?: Error) => Promise<any>) {
  it(name, async () => {
    let result;
    let compilationPhaseResult: CodeGenerationPhaseResult;

    try {
      compilationPhaseResult = phases(src);

      await compilationPhaseResult.validate(false);

      if (customTest) {
        await customTest(await compilationPhaseResult.toInstance());
      }

      await compilationPhaseResult.validate(true);

      if (customTest) {
        await customTest(await compilationPhaseResult.toInstance());
      }
    } catch (e) {
      if (customTest) {
        await customTest(compilationPhaseResult, e);
      } else {
        throw e;
      }
    }
  });
}
