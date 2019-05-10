declare var WebAssembly: any;

export async function generateTestInstance(buffer: ArrayBuffer, modules: Array<(getInstance: () => any) => any> = []) {
  let instance: any = null;

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
