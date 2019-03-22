declare var WebAssembly;

export async function generateTestInstance(buffer: ArrayBuffer, modules: Array<(getInstance: Function) => any> = []) {
  let instance = null;

  const getInstance = () => instance;

  let injectedModules: any = {};

  modules.forEach($ => {
    const generatedModule = $(getInstance);

    if (generatedModule) {
      injectedModules = { ...injectedModules, ...generatedModule };
    }
  });

  const compiled = await WebAssembly.compile(buffer);

  instance = new WebAssembly.Instance(compiled, injectedModules);

  return instance;
}
