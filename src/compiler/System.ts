export interface System {
  args: string[];
  newLine: string;
  useCaseSensitiveFileNames: boolean;
  write(s: string): void;
  writeOutputIsTTY?(): boolean;
  readFile(path: string, encoding?: string): string | void;
  getFileSize?(path: string): number;
  writeFile(path: string, data: string, writeByteOrderMark?: boolean): void;
  resolvePath(...path: string[]): string;
  fileExists(path: string): boolean;
  directoryExists(path: string): boolean;
  createDirectory(path: string): void;
  getCurrentDirectory(): string;
  getDirectories?(path: string): string[];
  relative(from: string, to: string): string;
}
