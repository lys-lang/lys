declare var describe, it, require, console;

import { testParseToken, testParseTokenFailsafe, folderBasedTest } from './TestHelpers';

import { ParsingPhaseResult } from '../dist/parser/phases/parsingPhase';
import { CanonicalPhaseResult } from '../dist/parser/phases/canonicalPhase';
import { SemanticPhaseResult } from '../dist/parser/phases/semanticPhase';
import { TypePhaseResult } from '../dist/parser/phases/typePhase';
import { ScopePhaseResult } from '../dist/parser/phases/scopePhase';

let inspect = require('util').inspect;

const writeToFile = process.env.UPDATE_AST === 'true';

const phases = function(txt: string): ScopePhaseResult {
  const parsing = new ParsingPhaseResult('test.ro', txt);
  const canonical = new CanonicalPhaseResult(parsing);
  const semantic = new SemanticPhaseResult(canonical);
  const scope = new ScopePhaseResult(semantic);
  return scope;
};

describe('Types', function() {
  describe('Compiler errors', () => {
    folderBasedTest(
      '**/type-error/*.ro',
      phases,
      async (result, e) => {
        if (e) throw e;

        try {
          const typePhase = new TypePhaseResult(result);
          debugger;
        } catch (e) {
          return (
            (result.semanticPhaseResult.canonicalPhaseResult.parsingPhaseResult.content || '(no source)') +
            '\n---\n' +
            e.message
          );
        }

        throw new Error('Type phase did not fail');
      },
      '.txt'
    );
  });
});
