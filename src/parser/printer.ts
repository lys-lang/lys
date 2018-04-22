import Nodes = require('./nodes');
declare var require, console;
const colors = require('colors/safe');
import { LineMapper, ITextPosition } from './lineMapper';
import { walker } from './walker';

function collectErrors(root: Nodes.Node) {
  const errorNodes = new Set<Nodes.Node>();
  const collector = walker((node: Nodes.Node) => {
    if (node.errors.length) {
      errorNodes.add(node);
    }
  });
  collector(root);
  return errorNodes;
}

export function printErrors(root: Nodes.DocumentNode) {
  let source = root.textContent;

  const nodesWithErrors = collectErrors(root);
  let lineMapper = new LineMapper(source, Math.random().toString());

  lineMapper.initMapping();

  let lines = source.split(/\r\n|\r|\n/g);

  let errorOnLines: (Error & { start: ITextPosition; end: ITextPosition })[][] = new Array(lines.length + 1).map(
    () => []
  );

  let errors = root.errors;

  nodesWithErrors.forEach(node => {
    if (node.astNode) {
      const token = node.astNode;
      const start = lineMapper.position(token.start);
      const end = lineMapper.position(token.end);
      console.log({ a: token.start, b: token.end, start, end, text: token.text });
      node.errors.forEach(err => {
        if (start.line >= 0 && end.line >= 0 && start.line < end.line) {
          for (let i = start.line; i < end.line; i++) {
            errorOnLines[i - 1] = errorOnLines[i - 1] || [];
            errorOnLines[i - 1].push(Object.assign(err, { start, end }));
          }
        } else if (start.line >= 0) {
          errorOnLines[start.line - 1] = errorOnLines[start.line - 1] || [];
          errorOnLines[start.line - 1].push(Object.assign(err, { start, end }));
        }
      });
    }
  });

  const blackPadding = colors.white(colors.bgBlack('     │'));

  const ln = n => colors.bgBlack(colors.gray(('    ' + (n + 1).toString()).substr(-5)) + '│') + ' ';

  let printableLines = [];

  const linesAbove = 10;

  errorOnLines.forEach((x, line) => {
    if (x && x.length) {
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

  let lastLine = 0;

  let printedErrors: Set<Error> = new Set();
  let printLines = [];

  // if (atl.originalPath) printLines.push(colors.cyan(atl.originalPath));

  printableLines.forEach((printable, i) => {
    if (!printable) return;

    let line = lines[i];

    if (i != lastLine) printLines.push(colors.cyan('  …'));

    lastLine = i + 1;

    if (typeof line == 'string' && errorOnLines[i] && errorOnLines[i].length) {
      printLines.push(
        ln(i) +
          colors.bgRed(line) +
          errorOnLines[i]
            .map(x => {
              let message = '';

              if (i == x.end.line - 1 || x.end.line == x.start.line) {
                message = '\n' + blackPadding + new Array(x.start.column + 1).join(' ');

                if (x.start.column <= x.end.column && x.end.line == x.start.line)
                  message = message + ' ' + new Array(x.end.column + 1 - x.start.column).join('^') + ' ';
                else message = message + ' ^ ';

                message = message + (printedErrors.size + 1).toString() + ') ' + x.message;
                message = colors.red(message);

                printedErrors.add(x);
              }

              return message;
            })
            .join('')
      );
    } else if (typeof line == 'string') {
      printLines.push(ln(i) + line);
    }
  });

  if (lines.length != lastLine - 1) {
    printLines.push(colors.cyan('… ' + (lines.length + 1)));
  }

  printedErrors.forEach(err => {
    printLines.push(colors.red(err.message || (err as any).msg));
  });

  console.log(printLines.join('\n'));
}
