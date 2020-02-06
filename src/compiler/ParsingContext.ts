import { MessageCollector } from './MessageCollector';
import { getAST } from './phases/canonicalPhase';
import { System } from './System';
import { Nodes, PhaseFlags } from './nodes';
import { analyze } from './phases';

export class ParsingContext {
  public messageCollector = new MessageCollector();
  public paths: string[] = [];

  public modulesInContext = new Map<string, Nodes.DocumentNode>();

  // internalIdentifiers of the functions that should be part of the wasm table
  public functionsInTable = new Set<string>();
  public signatures = new Map<string, any>();

  private typeNumbers = new Map<string, number>();

  constructor(public system: System) {
    // stub
  }

  reset() {
    this.typeNumbers.clear();
    this.functionsInTable.clear();
    this.signatures.clear();
    this.messageCollector.errors.length = 0;
  }

  addFunctionToTable(funInternalIdentifier: string) {
    this.functionsInTable.add(funInternalIdentifier);
  }

  getOrderedTable(): string[] {
    return Array.from(this.functionsInTable);
  }

  getFunctionInTableNumber(funInternalIdentifier: string): number {
    // change my mind
    this.addFunctionToTable(funInternalIdentifier);
    return this.getOrderedTable().indexOf(funInternalIdentifier);
  }

  /**
   * Invalidates a module and it's dependencies. This function should be called
   * after modification of any source file.
   * @param moduleName
   */
  invalidateModule(moduleName: string) {
    const currentModule = this.modulesInContext.get(moduleName);
    if (currentModule) {
      this.modulesInContext.delete(moduleName);
      this.functionsInTable.forEach($ => {
        if ($.startsWith(moduleName + '::')) {
          this.functionsInTable.delete($);
        }
      });
      currentModule.importedBy.forEach(importedBy => {
        this.invalidateModule(importedBy);
      });
      this.messageCollector.removeErrorsFromModule(moduleName);
    }
  }

  /**
   * Gets an internal identifier used for compilation time. It returns a unique
   * name every time.
   * @param moduleName
   * @param name
   */
  getInternalName(moduleName: string, name: string): string {
    const moduleDocument = this.getExistingParsingPhaseForModule(moduleName);
    if (!moduleDocument) throw new Error('There is no ' + moduleName + ' document loaded');

    const fqn = `${moduleName}::${name}`;

    let i = 0;

    while (true) {
      const newName = fqn + (i ? '_' + i : '');
      if (!moduleDocument.nameIdentifiers.has(newName)) {
        moduleDocument.nameIdentifiers.add(newName);
        return newName;
      }

      i++;
    }
  }

  /**
   * Returns a type discriminant number for the specified name
   * @param moduleName
   * @param typeName
   */
  getTypeDiscriminant(moduleName: string, typeName: string): number {
    const fqn = moduleName + '::' + typeName;
    let typeNumber = this.typeNumbers.get(fqn);

    if (!typeNumber) {
      typeNumber = this.typeNumbers.size + 1;

      this.typeNumbers.set(fqn, typeNumber);
    }

    return typeNumber;
  }

  /**
   * Gets the internal representation of the desired moduleName if exists.
   * @param moduleName
   */
  getExistingParsingPhaseForModule(moduleName: string) {
    return this.modulesInContext.get(moduleName);
  }

  /**
   * Loads a module using a moduleName if exists.
   * @param moduleName
   */
  getParsingPhaseForModule(moduleName: string) {
    if (this.modulesInContext.has(moduleName)) {
      return this.modulesInContext.get(moduleName)!;
    } else {
      const path = this.resolveModule(moduleName);

      return this.getParsingPhaseForFile(path, moduleName);
    }
  }

  /**
   * Loads a module into the context using `fileName`, `moduleName` and `content`
   * @param fileName
   * @param moduleName
   * @param content
   */
  getParsingPhaseForContent(fileName: string, moduleName: string, content: string) {
    if (this.modulesInContext.has(moduleName)) {
      return this.modulesInContext.get(moduleName)!;
    } else {
      const newFileName = this.system.resolvePath(fileName);
      const parsing = getAST(newFileName, moduleName, content, this);
      this.modulesInContext.set(moduleName, parsing);
      return parsing;
    }
  }

  getPhase(moduleName: string, phase: PhaseFlags, debug = false): Nodes.DocumentNode {
    if (!this.modulesInContext.has(moduleName)) {
      this.getParsingPhaseForModule(moduleName);
    }
    analyze(moduleName, this, phase, debug);
    return this.getExistingParsingPhaseForModule(moduleName)!;
  }

  /**
   * Obtains the fully qyalified name of a file.
   * @param file
   */
  getModuleFQNForFile(file: string) {
    try {
      const fullFile = this.resolveFileInPath(file);

      const paths = [this.system.getCurrentDirectory(), ...this.paths];

      const results: string[] = [];
      for (let path of paths) {
        if (fullFile.startsWith(path)) {
          // TODO: We may test that this fresh FQN resolves to the same file
          results.push(
            fullFile
              .replace(path, '')
              .replace(/^[\/\\]/, '')
              .replace(/^[A-Z]:\\\\/, '')
              .replace('.lys', '')
              .replace(/(\\|\/)/g, '::')
          );
        }
      }

      if (results.length) {
        // return the shortest result
        return results.sort((a, b) => a.length - b.length)[0];
      }
    } catch {
      // placeholder
    }

    return file
      .replace(/^[\/\\]/, '')
      .replace(/^[A-Z]:\\\\/, '')
      .replace('.lys', '')
      .replace(/(\\|\/)/g, '::');
  }

  outline(): string {
    const ret: string[] = [];

    this.modulesInContext.forEach((v, k) => {
      if (!k.includes('#') && v.scope) {
        ret.push(v.scope.inspect(false));
      }
    });

    return ret.join('\n');
  }

  /**
   * Gets or loads a module by fileName & moduleName.
   *
   * If the module exists in the current context it gets it. Otherwise it is
   * loaded.
   *
   * @param fileName
   * @param moduleName
   */
  private getParsingPhaseForFile(fileName: string, moduleName: string) {
    if (this.modulesInContext.has(moduleName)) {
      return this.modulesInContext.get(moduleName)!;
    } else {
      const content = this.system.readFile(fileName);

      if (content === undefined) {
        throw new Error(`File ${fileName} does not exist`);
      }

      return this.getParsingPhaseForContent(fileName, moduleName, content);
    }
  }

  /**
   * Resolves a file in the context's path list
   * @param file
   */
  private resolveFileInPath(file: string): string {
    const paths = [this.system.getCurrentDirectory(), ...this.paths];

    for (let path of paths) {
      if (path) {
        const resolved = this.system.resolvePath(path, file);

        if (this.system.fileExists(resolved)) {
          return resolved;
        }
      }
    }

    throw new Error(`File ${file} is not part of this project`);
  }

  /**
   * Tries to resolve a fileName using a moduleName as input.
   * @param moduleName
   */
  private resolveModule(moduleName: string) {
    const absolutePath = moduleName.replace(/::/g, '/') + '.lys';

    return this.resolveFileInPath(absolutePath);
  }
}
