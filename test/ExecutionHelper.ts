import { print } from '@webassemblyjs/wast-printer';

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
  const semantic = new SemanticPhaseResult(canonical, 'test');
  const scope = new ScopePhaseResult(semantic);
  const types = new TypePhaseResult(scope);
  types.execute();
  types.ensureIsValid();
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

      const instance = await compilationPhaseResult.toInstance();

      if (!instance) throw new Error('Invalid compilation');

      if (customTest) {
        try {
          await customTest(instance);
        } catch (e) {
          console.error('NON OPTIMIZED VERSION');
          console.log(print(compilationPhaseResult.programAST));
          await compilationPhaseResult.validate(true);
          console.log(compilationPhaseResult.module.emitText());
          throw e;
        }
      }

      await compilationPhaseResult.validate(true);

      if (customTest) {
        try {
          await customTest(await compilationPhaseResult.toInstance());
        } catch (e) {
          console.error('OPTIMIZED VERSION');
          console.log(print(compilationPhaseResult.programAST));
          throw e;
        }
      }
    } catch (e) {
      if (customTest && customTest.length >= 2) {
        await customTest(null, e);
      } else {
        throw e;
      }
    }
  });
}
