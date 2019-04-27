import { LineMapper, ITextPosition } from './LineMapper';
import { IErrorPositionCapable } from '../compiler/NodeError';
import { ParsingContext } from '../compiler/ParsingContext';
import { indent } from './astPrinter';
import { gutterStyleSequence, formatColorAndReset, ForegroundColors, gutterSeparator } from './colors';
import { MessageCollector } from '../compiler/MessageCollector';

function mapSet<T, V>(set: Set<T>, fn: (x: T) => V): V[] {
  const out: V[] = [];
  set.forEach($ => out.push(fn($)));
  return out;
}

interface ILocalError {
  message: string;
  start: ITextPosition | null;
  end: ITextPosition | null;
  stack?: string;
  warning?: boolean;
}

export class LysError extends Error {}

const ansiRegex = new RegExp(
  [
    '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[a-zA-Z\\d]*)*)?\\u0007)',
    '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PRZcf-ntqry=><~]))'
  ].join('|'),
  'g'
);

export function printErrors(parsingContext: ParsingContext, stripAnsi = false, messageCollector?: MessageCollector) {
  const errorByFile = new Map<string, IErrorPositionCapable[]>();

  const messageCollectorToPrint = messageCollector || parsingContext.messageCollector;

  messageCollectorToPrint.errors.forEach($ => {
    const document = ($.position && $.position.moduleName) || '(no document)';
    if (!errorByFile.has(document)) {
      errorByFile.set(document, []);
    }
    errorByFile.get(document)!.push($);
  });

  const out: string[] = [];

  errorByFile.forEach((errors, moduleName) => {
    out.push(printErrors_(moduleName, parsingContext, errors, stripAnsi));
  });

  return out.join('\n');
}

function printErrors_(
  moduleName: string,
  parsingContext: ParsingContext,
  errors: IErrorPositionCapable[],
  stripAnsi = false
) {
  const printLines: string[] = [];

  const parsing = parsingContext.getExistingParsingPhaseForModule(moduleName);

  if (!parsing) {
    throw new Error('Cannot find moduleName:' + moduleName);
    errors.forEach((err: IErrorPositionCapable & Error) => {
      printLines.push(formatColorAndReset(err.message, ForegroundColors.Red));
      if (err.stack) {
        printLines.push(indent(formatColorAndReset(err.stack, ForegroundColors.Grey), '  '));
      }
    });

    if (stripAnsi) {
      return printLines.join('\n').replace(ansiRegex, '');
    }

    return printLines.join('\n');
  }

  let fileNameToPrint = parsing.fileName || moduleName;

  fileNameToPrint = fileNameToPrint.replace(parsingContext.system.getCurrentDirectory() + '/', '');
  fileNameToPrint = fileNameToPrint.replace(parsingContext.system.getCurrentDirectory() + '\\', '');

  printLines.push(formatColorAndReset(fileNameToPrint || '(no file)', gutterStyleSequence));

  const source = parsing.content;

  let lineMapper = new LineMapper(source, Math.random().toString());

  if (errors.length === 0) return '';

  lineMapper.initMapping();

  let lines = source.split(/\r\n|\r|\n/g);

  const errorOnLines: Set<ILocalError>[] = new Array(lines.length + 1).fill(null).map(_ => new Set());
  const printableErrors = new Set<ILocalError>();

  errors.forEach((err: IErrorPositionCapable & Error) => {
    try {
      if (!err.position) {
        throw null;
      }

      const start = lineMapper.position(err.position.start);
      const end = lineMapper.position(err.position.end);

      if (start.line >= 0) {
        errorOnLines[start.line] = errorOnLines[start.line] || new Set();

        const error = { start, end, message: err.message || err.toString(), stack: err.stack, warning: err.warning };
        printableErrors.add(error);

        for (let l = start.line; l <= end.line; l++) {
          errorOnLines[l].add(error);
        }
      }
    } catch (e) {
      printableErrors.add({
        start: null,
        end: null,
        message: err.message || err.toString(),
        stack: err.stack,
        warning: false
      });
    }
  });

  const blackPadding = formatColorAndReset('     ' + gutterSeparator, gutterStyleSequence);

  const ln = (n: number) =>
    formatColorAndReset(('    ' + (n + 1).toString()).substr(-5) + '' + gutterSeparator, gutterStyleSequence);
  const printedErrors: Set<ILocalError> = new Set();

  const printableLines: boolean[] = [];
  const linesAbove = 10;

  let lastLine = 0;

  errorOnLines.forEach((x, line) => {
    if (x && x.size) {
      for (let i = 0; i < linesAbove; i++) {
        printableLines[Math.max(line - i, 0)] = true;
        printableLines[Math.min(line + i, lines.length)] = true;
      }

      printableLines[line] = true;
    }
  });

  if (!errors.length) {
    lines.forEach((_, y) => {
      printableLines[y] = true;
    });
  }

  printableLines.forEach((printable, i) => {
    if (!printable) return;

    let line = lines[i] as string | void;

    if (i !== lastLine) {
      printLines.push(formatColorAndReset('  ...' + gutterSeparator, gutterStyleSequence));
    }

    lastLine = i + 1;

    if (typeof line !== 'string') {
      return;
    }

    if (errorOnLines[i] && errorOnLines[i].size) {
      printLines.push(
        ln(i) +
          formatColorAndReset(line, ForegroundColors.ErrorLine) +
          mapSet(errorOnLines[i], x => {
            let message = '';

            const color = x.warning ? ForegroundColors.Yellow : ForegroundColors.Red;

            if (x.end && x.start) {
              if (i === x.end.line || x.end.line === x.start.line) {
                if (x.start.column <= x.end.column && x.end.line === x.start.line) {
                  message = '\n' + blackPadding + new Array(x.start.column + 1).join(' ');
                  message =
                    message + formatColorAndReset(new Array(x.end.column + 1 - x.start.column).join('^'), color) + ' ';
                } else {
                  message = '\n' + blackPadding + new Array(x.end.column).join(' ');
                  message = message + formatColorAndReset('^ ', color);
                }

                message = message + formatColorAndReset(x.message, color);
              }

              printedErrors.add(x);
            }

            return message;
          }).join('')
      );
    } else {
      printLines.push(ln(i) + line);
    }
  });

  if (lines.length !== lastLine - 1) {
    printLines.push(formatColorAndReset('  ...' + gutterSeparator, gutterStyleSequence));
  }

  printableErrors.forEach(err => {
    if (!printedErrors.has(err)) {
      printLines.push(formatColorAndReset(err.message, ForegroundColors.Red));
    }
  });

  if (stripAnsi) {
    return printLines.join('\n').replace(ansiRegex, '');
  }

  return printLines.join('\n');
}
