declare var describe: any, it: any;
import { parseMD } from '../dist/utils/MDParser';
import { expect } from 'chai';

describe('MDParser tests', () => {
  const EQ = (a: any, b: any) => expect(JSON.stringify(a, null, 2)).to.eq(JSON.stringify(b, null, 2));

  it('must parse an empty document', () => {
    const result = parseMD(``);
    EQ(result, []);
  });
  it('must parse titles', () => {
    const result = parseMD(`
# A

### Asd asd ###

#### B

    `);

    EQ(result, [
      { type: 'title', level: 1, text: 'A' },
      { type: 'title', level: 3, text: 'Asd asd' },
      { type: 'title', level: 4, text: 'B' }
    ]);
  });
  it('must parse titles and text', () => {
    const result = parseMD(`---
header content
multi line
---

# A

This is some text

### Asd asd ###

#### B

    `);
    EQ(result, [
      { type: 'header', text: 'header content\nmulti line' },
      { type: 'title', level: 1, text: 'A' },
      { type: 'text', text: 'This is some text' },
      { type: 'title', level: 3, text: 'Asd asd' },
      { type: 'title', level: 4, text: 'B' }
    ]);
  });

  it('must parse titles and text and files', () => {
    const result = parseMD(`
# A

This is some text

### Asd asd ###

#### B

#### lib/functions.lys

\`\`\`lys
"hello world"
\`\`\`
    `);

    EQ(result, [
      { type: 'title', level: 1, text: 'A' },
      { type: 'text', text: 'This is some text' },
      { type: 'title', level: 3, text: 'Asd asd' },
      { type: 'title', level: 4, text: 'B' },
      {
        type: 'file',
        fileName: { type: 'title', level: 4, text: 'lib/functions.lys' },
        codeBlock: {
          type: 'code',
          text: '"hello world"',
          language: 'lys'
        }
      }
    ]);
  });
  it('must parse titles and text and files and code blocks', () => {
    const result = parseMD(`
# A

\`\`\`
this is a code block w/o a language
\`\`\`
\`\`\`lys
this is a code block with a language
\`\`\`

This is some text

### Asd asd ###

\`\`\`lys
this is a code block with a language
\`\`\`

#### B

#### lib/functions.lys

\`\`\`lys
"hello world"
\`\`\`
    `);
    EQ(result, [
      {
        type: 'file',
        fileName: { type: 'title', level: 1, text: 'A' },
        codeBlock: { type: 'code', text: 'this is a code block w/o a language', language: '' }
      },
      { type: 'code', text: 'this is a code block with a language', language: 'lys' },
      { type: 'text', text: 'This is some text' },
      {
        type: 'file',
        fileName: { type: 'title', level: 3, text: 'Asd asd' },
        codeBlock: { type: 'code', text: 'this is a code block with a language', language: 'lys' }
      },
      { type: 'title', level: 4, text: 'B' },
      {
        type: 'file',
        fileName: { type: 'title', level: 4, text: 'lib/functions.lys' },
        codeBlock: { type: 'code', text: '"hello world"', language: 'lys' }
      }
    ]);
  });
});
