import { canonicalPhase } from '../dist/parser/phases/canonicalPhase';
import { semanticPhase } from '../dist/parser/phases/semanticPhase';
import { scopePhase } from '../dist/parser/phases/scopePhase';
import { typePhase } from '../dist/parser/phases/typePhase';
import { compilationPhase } from '../dist/parser/phases/compilationPhase';
import { findAllErrors } from '../dist/parser/phases/findAllErrors';
import { Parser } from 'ebnf';
import { parser } from '../dist/grammar';

import * as comp from '../dist/compiler/compiler';

const phases = [canonicalPhase, semanticPhase, scopePhase, typePhase, compilationPhase, findAllErrors];
declare var it;

export function test(name: string, src: string, customTest?: (document: any, error?: Error) => Promise<any>) {
  it(name, async () => {
    let result;

    try {
      result = parser.getAST(src, 'Document');

      if (!result) throw new Error('Did not resolve');

      if (result.text.length == 0) throw new Error('Empty text result');

      if (phases && phases.length) {
        result = phases.reduce(($, reducer, i) => {
          return (reducer as any)($);
        }, result);
      }

      if (customTest) {
        const x = await comp.generateBinary(await comp.validateModule(await comp.compileModule(result)));

        await customTest(x);
      }

      if (customTest) {
        const y = await comp.validateModule(await comp.compileModule(result));
        y.module.optimize();

        const x = await comp.generateBinary(Object.assign(y, { buffer: y.module.emitBinary() }));

        await customTest(x);
      }
    } catch (e) {
      console.error(e);

      throw e;
    }
  });
}
