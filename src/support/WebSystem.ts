import { System } from '../compiler/System';
import { resolve, relative } from 'path';

export interface IVirtualFile {
  content: string;
}

export class WebSystem implements System {
  args: string[] = [];
  newLine: string = '\n';
  useCaseSensitiveFileNames: boolean = true;

  files = new Map<string, IVirtualFile>();

  write(s: string): void {
    console.log(s);
  }

  writeOutputIsTTY?(): boolean {
    return false;
  }

  readFile(path: string): string | void {
    const file = this.files.get(this.resolvePath(path));
    if (file) {
      return file.content;
    }
    return undefined;
  }

  getFileSize(path: string) {
    const file = this.files.get(this.resolvePath(path));
    if (file) {
      return file.content.length;
    }
    return 0;
  }

  writeFile(path: string, data: string, _writeByteOrderMark?: boolean): void {
    const file = this.files.get(this.resolvePath(path));
    if (file) {
      file.content = data;
    } else {
      this.files.set(this.resolvePath(path), {
        content: data
      });
    }
    return;
  }

  resolvePath(...path: string[]): string {
    return resolve(...path);
  }

  relative(from: string, to: string): string {
    return relative(from, to);
  }

  fileExists(path: string): boolean {
    return this.files.has(this.resolvePath(path));
  }

  directoryExists(path: string): boolean {
    for (let [key] of this.files) {
      if (key.startsWith(this.resolvePath(path))) return true;
    }
    return false;
  }

  createDirectory(): void {
    // stub
  }

  getCurrentDirectory(): string {
    return '/';
  }
}
