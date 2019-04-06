/**
 * I needed a markdown parser that could be translated to Lys.
 * So I built this markdown parser. It is actually a subset of it.
 */

export type Header = {
  type: 'header';
  text: string | null;
};

export type FileBlock = {
  type: 'file';
  codeBlock: CodeBlock;
  fileName: Title;
};

export type CodeBlock = {
  type: 'code';
  language: string;
  text: string | null;
};

export type Title = {
  type: 'title';
  level: number;
  text: string;
};

export type RawText = {
  type: 'text';
  text: string;
};

export type Content = Header | FileBlock | CodeBlock | Title | RawText;

let currentPosition = 0;
let lines: string[] = [];

function readFile(): FileBlock | null {
  const initialPosition = currentPosition;

  const title = readTitle();

  if (title) {
    readWS();

    const codeBlock = readBlock();

    if (codeBlock) {
      return {
        type: 'file',
        fileName: title,
        codeBlock
      };
    }
  }

  currentPosition = initialPosition;

  return null;
}

function readWS() {
  while (true) {
    const line = peekLine();
    if (line === null) break;
    if (line.trim().length === 0) {
      eatLine();
    } else break;
  }
}

function readBlock(): CodeBlock | null {
  const initialPosition = currentPosition;
  const codeOpening = /^```(\S*)$/;
  const codeClosing = /^```$/;
  const line = eatLine();

  if (line !== null) {
    const opening = codeOpening.exec(line);

    if (opening) {
      return {
        type: 'code',
        text: eatUntil(codeClosing),
        language: opening[1].trim()
      };
    }
  }
  currentPosition = initialPosition;
  return null;
}

function readHeader(): Header | null {
  const initialPosition = currentPosition;
  const headerMark = /^---$/;

  const line = eatLine();

  if (line !== null) {
    const opening = headerMark.exec(line);

    if (opening) {
      return {
        type: 'header',
        text: eatUntil(headerMark)
      };
    }
  }

  currentPosition = initialPosition;
  return null;
}

function eatUntil(token: RegExp): string | null {
  let content = null;
  while (true) {
    const line = eatLine();
    if (line === null) break;
    if (token.test(line)) break;
    content = content === null ? line : content + '\n' + line;
  }
  return content;
}

function parseFile(): Content[] {
  const result: Content[] = [];

  const header = readHeader();

  if (header) result.push(header);

  while (currentPosition < lines.length) {
    const ret = readFile() || readBlock() || readTitle();

    if (ret) {
      result.push(ret);
      continue;
    }

    const text = eatLine();

    if (text !== null) {
      if (text.trim().length) {
        result.push({ type: 'text', text });
      }
    } else {
      break;
    }
  }

  return result;
}

function readTitle(): Title | null {
  const initialState = currentPosition;
  readWS();

  const titleRE = /^\s*(#+)(.+)(#*)$/;

  const line = eatLine();

  if (line !== null) {
    const title = titleRE.exec(line);
    if (title) {
      return {
        type: 'title',
        level: title[1].length,
        text: title[2]
          .trim()
          .replace(/(#+)$/, '')
          .trim()
      };
    }
  }

  currentPosition = initialState;
  return null;
}

function eatLine(): string | null {
  if (currentPosition >= lines.length) return null;
  const ret = lines[currentPosition];
  currentPosition++;
  return ret;
}

function peekLine(forward: number = 0): string | null {
  if (currentPosition + forward >= lines.length) return null;
  return lines[currentPosition + forward];
}

export function parseMD(document: string) {
  lines = document.split(/\r\n|\r|\n/gm);
  currentPosition = 0;
  return parseFile();
}
