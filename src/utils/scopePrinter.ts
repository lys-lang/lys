import { ParsingContext } from '..';
import { PhaseFlags } from '../compiler/nodes';

export function printScopes(parsingContext: ParsingContext) {
  const ret: string[] = [];

  parsingContext.modulesInContext.forEach($ => {
    if ($.scope) {
      ret.push($.moduleName + ' Next Phase: ' + PhaseFlags[$.analysis.nextPhase]);
      ret.push($.scope.inspect());
    }
  });

  return ret.join('\n');
}
