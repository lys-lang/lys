import { System } from '../compiler/System';
import _os = require('os');
import _fs = require('fs');
import _path = require('path');

// NodeJS detects "\uFEFF" at the start of the string and *replaces* it with the actual
// byte order mark from the specified encoding. Using any other byte order mark does
// not actually work.
const byteOrderMarkIndicator = '\uFEFF';

function readFile(fileName: string, _encoding?: string): string | undefined {
  if (!fileExists(fileName)) {
    return undefined;
  }
  const buffer = _fs.readFileSync(fileName);
  let len = buffer.length;
  if (len >= 2 && buffer[0] === 0xfe && buffer[1] === 0xff) {
    // Big endian UTF-16 byte order mark detected. Since big endian is not supported by node.js,
    // flip all byte pairs and treat as little endian.
    len &= ~1; // Round down to a multiple of 2
    for (let i = 0; i < len; i += 2) {
      const temp = buffer[i];
      buffer[i] = buffer[i + 1];
      buffer[i + 1] = temp;
    }
    return buffer.toString('utf16le', 2);
  }
  if (len >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) {
    // Little endian UTF-16 byte order mark detected
    return buffer.toString('utf16le', 2);
  }
  if (len >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    // UTF-8 byte order mark detected
    return buffer.toString('utf8', 3);
  }
  // Default is UTF-8 with no byte order mark
  return buffer.toString('utf8');
}

function writeFile(fileName: string, data: string, writeByteOrderMark?: boolean): void {
  // If a BOM is required, emit one
  if (writeByteOrderMark) {
    data = byteOrderMarkIndicator + data;
  }

  let fd: number | undefined;

  try {
    fd = _fs.openSync(fileName, 'w');
    _fs.writeSync(fd, data, /*position*/ undefined, 'utf8');
  } finally {
    if (fd !== undefined) {
      _fs.closeSync(fd);
    }
  }
}

function isFileSystemCaseSensitive(): boolean {
  // win32\win64 are case insensitive platforms
  if (platform === 'win32' || platform === 'win64') {
    return false;
  }
  // If this file exists under a different case, we must be case-insensitve.
  return !fileExists(swapCase(__filename));
}

/** Convert all lowercase chars to uppercase, and vice-versa */
function swapCase(s: string): string {
  return s.replace(/\w/g, ch => {
    const up = ch.toUpperCase();
    return ch === up ? ch.toLowerCase() : up;
  });
}

function fileExists(path: string): boolean {
  return fileSystemEntryExists(path, FileSystemEntryKind.File);
}

function directoryExists(path: string): boolean {
  return fileSystemEntryExists(path, FileSystemEntryKind.Directory);
}

function getDirectories(path: string): string[] {
  return _fs
    .readdirSync(path)
    .filter(dir => fileSystemEntryExists(nodeSystem.resolvePath(path, dir), FileSystemEntryKind.Directory));
}

function fileSystemEntryExists(path: string, entryKind: FileSystemEntryKind): boolean {
  try {
    const stat = _fs.statSync(path);
    switch (entryKind) {
      case FileSystemEntryKind.File:
        return stat.isFile();
      case FileSystemEntryKind.Directory:
        return stat.isDirectory();
      default:
        return false;
    }
  } catch (e) {
    return false;
  }
}

const enum FileSystemEntryKind {
  File,
  Directory
}

const platform: string = _os.platform();
const useCaseSensitiveFileNames = isFileSystemCaseSensitive();

export interface FileSystemEntries {
  readonly files: ReadonlyArray<string>;
  readonly directories: ReadonlyArray<string>;
}

export const nodeSystem: System = {
  args: process.argv.slice(2),
  newLine: _os.EOL,
  useCaseSensitiveFileNames,
  write(s: string): void {
    process.stdout.write(s);
  },
  writeOutputIsTTY() {
    return process.stdout.isTTY || false;
  },
  readFile,
  writeFile,
  resolvePath: (...paths: string[]) => _path.resolve(...paths),
  fileExists,
  directoryExists,
  getCurrentDirectory() {
    return process.cwd();
  },
  getDirectories,
  createDirectory(directoryName: string) {
    if (!nodeSystem.directoryExists(directoryName)) {
      _fs.mkdirSync(directoryName);
    }
  }
};
