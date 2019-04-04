import { MessageCollector } from './MessageCollector';
import { ScopePhaseResult } from './phases/scopePhase';
import { TypePhaseResult } from './phases/typePhase';
import { CompilationPhaseResult } from './phases/compilationPhase';
import { ParsingPhaseResult } from './phases/parsingPhase';
import { TypeGraph } from './types/TypeGraph';
import { CanonicalPhaseResult } from './phases/canonicalPhase';
import { SemanticPhaseResult } from './phases/semanticPhase';
import { System } from './System';

export class ParsingContext {
  public messageCollector = new MessageCollector();
  public paths: string[] = [];
  public registeredParsingPhase = new Map<string, ParsingPhaseResult>();
  public typeGraph = new TypeGraph([], null);

  private typeNumbers = new Map<string, number>();
  private programTakenNames = new Set<string>();
  private modulesInContext: string[] = [];
  private moduleScopes = new Map<string, ScopePhaseResult>();
  private moduleTypes = new Map<string, TypePhaseResult>();
  private moduleCompilation = new Map<string, CompilationPhaseResult>();

  constructor(public system: System) {
    // stub
  }

  reset() {
    this.typeNumbers.clear();
    this.programTakenNames.clear();
    this.messageCollector.errors.length = 0;
  }

  getUnusedName(prefix: string): string {
    let i = 0;
    while (true) {
      const newName = `${prefix}${i ? '_' + i : ''}`;
      if (!this.programTakenNames.has(newName)) {
        this.programTakenNames.add(newName);
        return newName;
      }
      i++;
    }
  }

  getTypeDiscriminant(module: string, typeName: string): number {
    const fqn = module + '::' + typeName;
    let typeNumber = this.typeNumbers.get(fqn);

    if (!typeNumber) {
      typeNumber = this.typeNumbers.size + 1;

      this.typeNumbers.set(fqn, typeNumber);
    }

    return typeNumber;
  }

  parseModule(moduleName: string) {
    const parsing = this.getParsingPhaseForModule(moduleName);

    const canonical = new CanonicalPhaseResult(parsing);
    const semantic = new SemanticPhaseResult(canonical);
    const scope = new ScopePhaseResult(semantic);

    this.moduleScopes.set(moduleName, scope);
  }

  getExistingParsingPhaseForModule(moduleName: string) {
    return this.registeredParsingPhase.get(moduleName)!;
  }

  getParsingPhaseForFile(fileName: string, moduleName: string) {
    if (this.registeredParsingPhase.has(moduleName)) {
      return this.registeredParsingPhase.get(moduleName)!;
    } else {
      const content = this.system.readFile(fileName);

      if (content === undefined) {
        throw new Error(`File ${fileName} does not exist`);
      }

      return this.getParsingPhaseForContent(fileName, moduleName, content);
    }
  }

  getParsingPhaseForModule(moduleName: string) {
    const path = this.resolveModule(moduleName);

    return this.getParsingPhaseForFile(path, moduleName);
  }

  getParsingPhaseForContent(fileName: string, moduleName: string, content: string) {
    const newFileName = this.system.resolvePath(fileName);
    const parsing = new ParsingPhaseResult(newFileName, moduleName, content, this);
    this.registeredParsingPhase.set(moduleName, parsing);
    parsing.execute();
    return parsing;
  }

  getScopePhase(moduleName: string): ScopePhaseResult | void {
    this.ensureModule(moduleName);

    const x = this.moduleScopes.get(moduleName);

    if (x) {
      return x;
    }
  }

  getTypePhase(moduleName: string): TypePhaseResult {
    this.ensureModule(moduleName);

    let typePhaseResult = this.moduleTypes.get(moduleName);

    if (!typePhaseResult) {
      typePhaseResult = new TypePhaseResult(this.moduleScopes.get(moduleName)!);
      this.moduleTypes.set(moduleName, typePhaseResult);
      typePhaseResult.execute();
    }

    return typePhaseResult;
  }

  getCompilationPhase(moduleName: string): CompilationPhaseResult {
    this.getTypePhase(moduleName);

    let compilationPhaseResult = this.moduleCompilation.get(moduleName);

    if (!compilationPhaseResult) {
      compilationPhaseResult = new CompilationPhaseResult(this.moduleTypes.get(moduleName)!);
      this.moduleCompilation.set(moduleName, compilationPhaseResult);
    }

    return compilationPhaseResult;
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

  private ensureModule(moduleName: string) {
    if (!this.modulesInContext.includes(moduleName)) {
      this.modulesInContext.push(moduleName);
      this.parseModule(moduleName);
    }
  }
}
