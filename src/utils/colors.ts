export enum ForegroundColors {
  Grey = '\u001b[90m',
  Red = '\u001b[91m',
  Green = '\u001b[92m',
  ErrorLine = '\u001b[41m',
  Yellow = '\u001b[93m',
  Blue = '\u001b[94m',
  Cyan = '\u001b[96m'
}
export const gutterStyleSequence = '\u001b[36m';
export const gutterSeparator = '│ ';
export const resetEscapeSequence = '\u001b[0m';

export function formatColorAndReset(text: string, formatStyle: string) {
  return formatStyle + text + resetEscapeSequence;
}
