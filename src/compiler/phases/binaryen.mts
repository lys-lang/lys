declare const globalThis: any;

export async function loadBinaryen() {
  const b = await import('binaryen');
  globalThis['Binaryen'] = {
    TOTAL_MEMORY: 16777216 * 8,
  };

  return b;
}
