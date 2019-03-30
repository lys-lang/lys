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
    const modulePath = this.resolveModule(moduleName);

    if (!modulePath) {
      throw new Error(`Cannot find module ${moduleName}`);
    }

    const parsing = this.getParsingPhaseForFile(modulePath);

    const canonical = new CanonicalPhaseResult(parsing);
    const semantic = new SemanticPhaseResult(canonical, moduleName);
    const scope = new ScopePhaseResult(semantic);

    this.moduleScopes.set(moduleName, scope);
  }

  getParsingPhaseForFile(fileName: string) {
    if (this.registeredParsingPhase.has(fileName)) {
      return this.registeredParsingPhase.get(fileName)!;
    } else {
      const content = this.system.readFile(fileName);

      if (content === undefined) {
        throw new Error(`File ${fileName} does not exist`);
      }

      return this.getParsingPhaseForContent(fileName, content);
    }
  }

  getParsingPhaseForContent(fileName: string, content: string) {
    const parsing = new ParsingPhaseResult(fileName, content, this);
    this.registeredParsingPhase.set(fileName, parsing);
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

  private resolveModule(moduleName: string) {
    const relative = moduleName.replace(/::/g, '/') + '.lys';

    const paths = [this.system.getCurrentDirectory(), ...this.paths];

    for (let path of paths) {
      if (path) {
        let x = this.system.resolvePath(path, relative);

        if (this.system.fileExists(x)) {
          return x;
        }
      }
    }

    return null;
  }
  private ensureModule(moduleName: string) {
    if (!this.modulesInContext.includes(moduleName)) {
      this.modulesInContext.push(moduleName);
      this.parseModule(moduleName);
    }
  }
}
