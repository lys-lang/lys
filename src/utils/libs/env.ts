import { readString } from '../execution';

const tmpArrayBuffer = new DataView(new ArrayBuffer(1024));

function printHexInt(x: number) {
  tmpArrayBuffer.setInt32(0, x);

  return [0, 1, 2, 3].map($ => printHexByte(tmpArrayBuffer.getUint8($))).join('');
}

function printHexByte(x: number) {
  return ('00' + x.toString(16)).substr(-2);
}

export default function(getInstance: () => any) {
  return {
    env: {
      printf: function(offset: number, ...args: number[]) {
        try {
          let str = readString(getInstance().exports.memory.buffer, offset);

          let ix = 0;

          str = str.replace(/(%(.))/g, function(substr, _, group2) {
            const extra = args[ix];

            ix++;
            switch (group2) {
              case 'd':
                return extra.toString();
              case 'x':
                return '0x' + printHexInt(extra);
              case 'X':
                return '0x' + printHexInt(extra).toUpperCase();
            }
            return substr;
          });

          console.log(str);
        } catch (e) {
          console.log(e.message, 'offset:', offset, 'extra:', args);
        }
      },
      segfault: function() {
        throw new Error('Segmentation fault');
      }
    }
  };
}
