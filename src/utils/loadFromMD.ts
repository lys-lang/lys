import { parseMD } from './MDParser';
import { ParsingContext } from '../compiler/ParsingContext';
import { LysError } from './errorPrinter';

export function loadFromMD(parsingContext: ParsingContext, mdContent: string) {
  const parsedMD = parseMD(mdContent);

  parsingContext.reset();

  let mainModule = 'main';

  const jsFiles: Record<string, (getInstance: Function) => void> = {};
  const lysFiles: Record<string, string> = {};

  parsedMD.forEach($ => {
    if ($.type === 'file') {
      if ($.fileName.text.endsWith('.lys')) {
        const moduleName = parsingContext.getModuleFQNForFile($.fileName.text);
        parsingContext.invalidateModule(moduleName);
        lysFiles[$.fileName.text] = moduleName;
        parsingContext.getParsingPhaseForContent($.fileName.text, moduleName, $.codeBlock.text!);
      }
      if ($.fileName.text.endsWith('.js')) {
        // tslint:disable-next-line:no-eval
        jsFiles[$.fileName.text] = eval($.codeBlock.text!);
        if (typeof (jsFiles[$.fileName.text] as any) !== 'function') {
          throw new LysError(`The file ${JSON.stringify($.fileName.text)} is not a function`);
        }
      }
    }
  });

  {
    let mainPresent = false;
    for (let i in lysFiles) {
      if (lysFiles[i] === mainModule) {
        mainPresent = true;
        break;
      }
    }
    if (!mainPresent) {
      throw new LysError(
        `The module ${JSON.stringify(mainModule)} is not present in the Markdown file, got: ${Object.values(lysFiles)}`
      );
    }
  }

  return {
    jsFiles,
    lysFiles,
    mainModule
  };
}
