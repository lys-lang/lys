// @lys-require=support::ffi

export function readString(memory: ArrayBuffer, offset: number) {
  const dv = new DataView(memory, offset);
  let len = dv.getUint32(0, true);

  if (len === 0) {
    return '';
  }

  let currentOffset = 4;
  len += 4;

  const sb: string[] = [];

  while (currentOffset < len) {
    const r = dv.getUint16(currentOffset, true);
    sb.push(String.fromCharCode(r));
    currentOffset += 2;
  }

  return sb.join('');
}

export function writeStringToHeap(instance: any, value: string) {
  const allocatedString = instance.exports.ffi_allocateString(value.length);

  // UCS2
  const dv = new DataView(instance.exports.memory.buffer, allocatedString);
  const len = value.length;

  let i = 0;
  while (i < len) {
    dv.setUint16(i * 2, value.charCodeAt(i), true);
    i++;
  }

  return allocatedString;
}

export function readStringFromHeap(instance: any, unsafeCPointer: number): string {
  const dv = new DataView(instance.exports.memory.buffer, unsafeCPointer - 4);
  let len = dv.getUint32(0, true);

  if (len === 0) {
    return '';
  }

  let currentOffset = 4;
  len += 4;

  const sb: string[] = [];

  while (currentOffset < len) {
    const r = dv.getUint16(currentOffset, true);
    if (r === 0) break; // Break if we find a null character
    sb.push(String.fromCharCode(r));
    currentOffset += 2;
  }

  return sb.join('');
}

export function readBytes(memory: ArrayBuffer, offset: number) {
  const dv = new DataView(memory, offset);
  let len = dv.getUint32(0, true);

  if (len === 0) return [];

  let currentOffset = 4;
  len += 4;

  const sb: number[] = [];
  while (currentOffset < len) {
    const r = dv.getUint8(currentOffset);

    sb.push(r);
    currentOffset += 1;
  }

  return sb;
}

const BLOCK_SIZE = 16;
const DUMP_LIMIT = 1024 * 64;

function padStart8(str: string) {
  return ('x00000000' + str).substr(-8);
}

function padStart2(str: string) {
  return ('x00' + str).substr(-2);
}

export function hexDump(memory: ArrayBuffer, max = DUMP_LIMIT, start = 0) {
  const buffer = new Uint8Array(memory);

  let lines = [];

  for (let i = start; i < buffer.byteLength && i < max; i += BLOCK_SIZE) {
    let address = padStart8(i.toString(16)); // address
    let hexArray = [];
    let asciiArray = [];

    for (let b = 0; b < BLOCK_SIZE; b += 1) {
      const value = buffer[i + b];
      hexArray.push(padStart2(value.toString(16)));
      asciiArray.push(value >= 0x20 && value < 0x7f ? String.fromCharCode(value) : '.');
    }

    let hexString = hexArray.join(' ');
    let asciiString = asciiArray.join('');

    lines.push(`${address}  ${hexString}  |${asciiString}|`);
  }

  return lines.join('\n');
}
