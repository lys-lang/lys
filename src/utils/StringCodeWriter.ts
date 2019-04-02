export class StringCodeWriter {
  private _indent: number = 0;
  private _content = '';
  private _newLineCallBacks: ((x: StringCodeWriter) => void)[] = [];

  constructor(public indentSpaces: number = 2) {
    // stub
  }

  println(code?: string): StringCodeWriter {
    if (code !== undefined) {
      this._content = this._content + code;
      this.println();
    } else {
      this.callNewLineCallbacks();
      this._content = this._content + '\n';
    }
    return this;
  }

  indent(): StringCodeWriter {
    this._indent += 1;
    return this;
  }

  printSpace(code: string = ''): StringCodeWriter {
    return this.append(code).append(' ');
  }

  printIndent(): StringCodeWriter {
    this._content =
      this._content +
      Array(this._indent * this.indentSpaces)
        .fill(' ')
        .join('');
    return this;
  }

  print(code: string): StringCodeWriter {
    return this.append(code);
  }

  printQuoted(text: string): StringCodeWriter {
    this.append('"')
      .append(text)
      .append('"');
    return this;
  }

  printForeachWithSeparator<A>(separator: string, elements: A[], code: (a: A) => void): StringCodeWriter {
    elements.forEach((element, index) => {
      if (index >= 1) {
        this.print(separator);
      }
      code(element);
    });
    return this;
  }

  dedent(): StringCodeWriter {
    this._indent -= 1;
    return this;
  }

  onNewLine(callback: (a: StringCodeWriter) => void) {
    this._newLineCallBacks.push(callback);
    return this;
  }

  hasNewLineListener(): boolean {
    return this._newLineCallBacks.length !== 0;
  }

  codeContent(): string {
    return this._content;
  }

  toString() {
    return this.codeContent();
  }

  private append(code: string): StringCodeWriter {
    if (this._content && this._content.endsWith('\n')) {
      this.printIndent();
    }
    this._content = this._content + code;
    return this;
  }

  private callNewLineCallbacks() {
    const buffer = this._newLineCallBacks.slice();
    this._newLineCallBacks.length = 0;
    buffer.forEach(callback => callback(this));
  }
}
