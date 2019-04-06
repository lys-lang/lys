import { MessageCollector } from './MessageCollector';
import { TypeGraph } from './types/TypeGraph';
import { getAST } from './phases/canonicalPhase';
import { System } from './System';
import { Nodes, PhaseFlags } from './nodes';
import { analyze } from './phases';

export class ParsingContext {
  public messageCollector = new MessageCollector();
  public paths: string[] = [];

  public modulesInContext = new Map<string, Nodes.DocumentNode>();

  public typeGraph = new TypeGraph([], null);

  private typeNumbers = new Map<string, number>();

  constructor(public system: System) {
    // stub
  }

  reset() {
    this.typeNumbers.clear();
    this.modulesInContext.clear();
    this.messageCollector.errors.length = 0;
    this.typeGraph.reset();
  }

  invalidateModule(moduleName: string) {
    this.modulesInContext.delete(moduleName);
  }

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

  getTypeDiscriminant(moduleName: string, typeName: string): number {
    const fqn = moduleName + '::' + typeName;
    let typeNumber = this.typeNumbers.get(fqn);

    if (!typeNumber) {
      typeNumber = this.typeNumbers.size + 1;

      this.typeNumbers.set(fqn, typeNumber);
    }

    return typeNumber;
  }

  getExistingParsingPhaseForModule(moduleName: string) {
    return this.modulesInContext.get(moduleName);
  }

  getParsingPhaseForFile(fileName: string, moduleName: string) {
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

  getParsingPhaseForModule(moduleName: string) {
    if (this.modulesInContext.has(moduleName)) {
      return this.modulesInContext.get(moduleName)!;
    } else {
      const path = this.resolveModule(moduleName);

      return this.getParsingPhaseForFile(path, moduleName);
    }
  }

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

  getSemanticPhase(moduleName: string): Nodes.DocumentNode {
    const document = this.getParsingPhaseForModule(moduleName);
    analyze(document, this, PhaseFlags.Semantic, true);
    return document;
  }

  getScopePhase(moduleName: string): Nodes.DocumentNode {
    const document = this.getParsingPhaseForModule(moduleName);
    analyze(document, this, PhaseFlags.Scope, true);
    return document;
  }

  getTypePhase(moduleName: string): Nodes.DocumentNode {
    const document = this.getParsingPhaseForModule(moduleName);
    analyze(document, this, PhaseFlags.TypeCheck, true);
    return document;
  }

  getCompilationPhase(moduleName: string): Nodes.DocumentNode {
    const document = this.getParsingPhaseForModule(moduleName);
    analyze(document, this, PhaseFlags.Compilation, true);
    return document;
  }

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

  private resolveModule(moduleName: string) {
    const absolutePath = moduleName.replace(/::/g, '/') + '.lys';

    return this.resolveFileInPath(absolutePath);
  }
}
