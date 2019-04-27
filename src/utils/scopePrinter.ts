import { ParsingContext } from '..';
import { PhaseFlags } from '../compiler/nodes';

export function printScopes(parsingContext: ParsingContext) {
  const ret: string[] = [];

  parsingContext.modulesInContext.forEach($ => {
    if ($.closure) {
      ret.push($.moduleName + ' Next Phase: ' + PhaseFlags[$.analysis.nextPhase]);
      ret.push($.closure.inspect());
    }
  });

  return ret.join('\n');
}
