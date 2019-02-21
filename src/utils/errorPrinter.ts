declare var require;
const colors = require('colors/safe');
import { LineMapper, ITextPosition } from './LineMapper';
import { IErrorPositionCapable } from '../parser/NodeError';
import { ParsingContext } from '../parser/ParsingContext';
import { ParsingPhaseResult } from '../parser/phases/parsingPhase';
import { indent } from './astPrinter';

function mapSet<T, V>(set: Set<T>, fn: (x: T) => V): V[] {
  const out = [];
  set.forEach($ => out.push(fn($)));
  return out;
}

interface ILocalError {
  message: string;
  start: ITextPosition;
  end: ITextPosition;
  stack?: string;
}

const ansiRegex = new RegExp(
  [
    '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[a-zA-Z\\d]*)*)?\\u0007)',
    '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PRZcf-ntqry=><~]))'
  ].join('|'),
  'g'
);

export function printErrors(parsingContext: ParsingContext, stripAnsi = false) {
  const errorByFile = new Map<string, IErrorPositionCapable[]>();

  parsingContext.messageCollector.errors.forEach($ => {
    const document = ($.position && $.position.document) || '(no document)';
    if (!errorByFile.has(document)) {
      errorByFile.set(document, []);
    }
    errorByFile.get(document).push($);
  });

  const out = [];

  errorByFile.forEach((errors, fileName) => {
    out.push(printErrors_(fileName, parsingContext, errors, stripAnsi));
  });

  return out.join('\n');
}
function printErrors_(
  fileName: string,
  parsingContext: ParsingContext,
  errors: IErrorPositionCapable[],
  stripAnsi = false
) {
  const printLines = [];

  printLines.push(colors.cyan(fileName || '(no file)'));

  let parsing: ParsingPhaseResult;

  try {
    parsing = parsingContext.getParsingPhaseForFile(fileName);
  } catch {}

  if (!parsing) {
    errors.forEach((err: IErrorPositionCapable & Error) => {
      printLines.push(colors.red(err.message));
      if (err.stack) {
        printLines.push(indent(colors.gray(err.stack), '  '));
      }
    });

    if (stripAnsi) {
      return printLines.join('\n').replace(ansiRegex, '');
    }

    return printLines.join('\n');
  }

  const source = parsing.content;

  let lineMapper = new LineMapper(source, Math.random().toString());

  if (errors.length == 0) return '';

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

        const error = { start, end, message: err.message || err.toString(), stack: err.stack };
        printableErrors.add(error);

        for (let l = start.line; l <= end.line; l++) {
          errorOnLines[l].add(error);
        }
      }
    } catch (e) {
      printableErrors.add({ start: null, end: null, message: err.message || err.toString(), stack: err.stack });
    }
  });

  const blackPadding = colors.white(colors.bgBlack('     │'));

  const ln = n => colors.bgBlack(colors.gray(('    ' + (n + 1).toString()).substr(-5)) + '│') + ' ';
  const printedErrors: Set<ILocalError> = new Set();

  const printableLines = [];
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

    let line = lines[i];

    if (i != lastLine) {
      printLines.push(colors.cyan('  …'));
    }

    lastLine = i + 1;

    if (typeof line == 'string' && errorOnLines[i] && errorOnLines[i].size) {
      printLines.push(
        ln(i) +
          colors.bgRed(line) +
          mapSet(errorOnLines[i], x => {
            let message = '';

            if (i == x.end.line || x.end.line == x.start.line) {
              if (x.start.column <= x.end.column && x.end.line == x.start.line) {
                message = '\n' + blackPadding + new Array(x.start.column + 1).join(' ');
                message = message + ' ' + new Array(x.end.column + 1 - x.start.column).join('^') + ' ';
              } else {
                message = '\n' + blackPadding + new Array(x.end.column).join(' ');
                message = message + ' ^ ';
              }

              message = message + x.message;
              message = colors.red(message);
            }

            printedErrors.add(x);

            return message;
          }).join('')
      );
    } else if (typeof line == 'string') {
      printLines.push(ln(i) + line);
    }
  });

  if (lines.length != lastLine - 1) {
    printLines.push(colors.cyan('… ' + (lines.length + 1)));
  }

  printableErrors.forEach(err => {
    if (!printedErrors.has(err)) {
      printLines.push(colors.red(err.message));
      // if (err.stack) {
      //   printLines.push(indent(colors.gray(err.stack), '  '));
      // }
    }
  });

  if (stripAnsi) {
    return printLines.join('\n').replace(ansiRegex, '');
  }

  return printLines.join('\n');
}
