import * as t from '@webassemblyjs/ast';
import { print } from '@webassemblyjs/wast-printer';

global['Binaryen'] = {
  TOTAL_MEMORY: 16777216 * 8
};

import * as binaryen from 'binaryen';
import _wabt = require('wabt');
import { annotations } from '../annotations';
import { flatten } from '../helpers';
import { Nodes, findNodesByType } from '../nodes';
import { failIfErrors } from './findAllErrors';
import { findParentType } from './helpers';
import { FunctionType, StructType, Type } from '../types';
import { CompilationPhaseResult } from './compilationPhase';
import { PhaseResult } from './PhaseResult';
import { AstNodeError } from '../NodeError';
import { ParsingContext } from '../ParsingContext';
import { assert } from 'console';

type CompilationModuleResult = {
  compilationPhase: CompilationPhaseResult;
  moduleParts: any[];
  starters: any[];
  endMemory: number;
};

const wabt: typeof _wabt = (_wabt as any)();

const starterName = t.identifier('%%START%%');
declare var WebAssembly, console;

(binaryen as any).setOptimizeLevel(5);
(binaryen as any).setShrinkLevel(5);

const secSymbol = Symbol('secuentialId');
function getModuleSecuentialId(module) {
  let num = module[secSymbol] || 0;
  num++;
  module[secSymbol] = num;
  return num;
}

function getStarterFunction(statements: any[]) {
  const fnType = t.signature([], []);

  return t.func(
    starterName, // name
    fnType, //signature
    statements // body
  );
}

function getTypeForFunction(fn: Nodes.FunctionNode) {
  const fnType = fn.ofType;

  if (fnType && fnType instanceof FunctionType) {
    const ret = fnType.returnType;

    const retType = ret.binaryenType ? [ret.binaryenType] : [];

    return t.signature(
      fn.parameters.map(($, $$) => ({
        id: $.parameterName.name,
        valtype: fnType.parameterTypes[$$].binaryenType
      })),
      retType
    );
  } else {
    throw new Error(fnType + ' is not afunction');
  }
}

function emitFunction(fn: Nodes.FunctionNode, document: Nodes.DocumentNode) {
  const fnType = getTypeForFunction(fn);

  const locals = fn.additionalLocals.map($ =>
    t.instruction('local', [t.identifier($.name), t.valtypeLiteral($.type.binaryenType)])
  );

  const moduleFun = t.func(
    t.identifier(fn.functionName.internalIdentifier), // name
    fnType, // signature
    [...locals, ...emitList(fn.body, document)] // body
  );

  return moduleFun;
}

function emitTailCall(node: Nodes.TailRecLoopNode, document: Nodes.DocumentNode) {
  const label = 'TailCallLoop' + getModuleSecuentialId(document);
  node.annotate(new annotations.LabelId(label));
  return t.loopInstruction(t.identifier(label), void 0, emitList(node.body, document));
}

function emitFunctionCall(node: Nodes.FunctionCallNode, document: Nodes.DocumentNode) {
  if (node.hasAnnotation(annotations.IsTailRecCall)) {
    const tailCallLoopNode = findParentType(node, Nodes.TailRecLoopNode);

    const fn = findParentType(node, Nodes.FunctionNode);

    const setArgsStatements = node.argumentsNode.map(($, $$) => {
      return t.instruction('set_local', [t.identifier(fn.localsByIndex[$$].name), emit($, document)]);
    });

    const labelAnnotation = tailCallLoopNode.getAnnotation(annotations.LabelId);

    setArgsStatements.push(t.instruction('br', [t.identifier(labelAnnotation.label)]));

    return setArgsStatements;
  } else {
    const ofType = node.resolvedFunctionType;

    assert(ofType.name.internalIdentifier, `${ofType}.internalIdentifier is falsy`);

    return t.callInstruction(
      t.identifier(ofType.name.internalIdentifier),
      node.argumentsNode.map($ => emit($, document))
    );
  }
}

function emitMatchingNode(match: Nodes.PatternMatcherNode, document: Nodes.DocumentNode) {
  const matchers = match.matchingSet.slice(0);
  const ixDefaultBranch = matchers.findIndex($ => $ instanceof Nodes.MatchDefaultNode);
  const lhs = t.instruction('set_local', [t.identifier(match.local.name), emit(match.lhs, document)]);

  if (ixDefaultBranch !== -1) {
    // the default branch must be the last element
    const defaultMatcher = matchers[ixDefaultBranch];
    matchers.splice(ixDefaultBranch, 1);
    matchers.push(defaultMatcher);
  }

  const blocks = matchers
    .map(function emitNode(node: Nodes.MatcherNode): { condition; body } {
      if (node instanceof Nodes.MatchDefaultNode) {
        const body = emit(node.rhs, document);
        return { condition: null, body };
      } else if (node instanceof Nodes.MatchLiteralNode) {
        const ofType = node.resolvedFunctionType;

        const condition = t.callInstruction(t.identifier(ofType.name.internalIdentifier), [
          emit(node.literal, document),
          t.instruction('get_local', [t.identifier(match.local.name)])
        ]);

        const body = emit(node.rhs, document);
        return {
          condition,
          body
        };
      } else if (node instanceof Nodes.MatchCaseIsNode) {
        const ofType = node.resolvedFunctionType;

        const condition = t.callInstruction(t.identifier(ofType.name.internalIdentifier), [
          t.instruction('get_local', [t.identifier(match.local.name)])
        ]);

        const body = emit(node.rhs, document);
        return {
          condition,
          body
        };
      }
    })
    .filter($ => !!$);
  const exitBlock = 'B' + getModuleSecuentialId(document);
  const exitLabel = t.identifier(exitBlock);

  const breaks = blocks
    .filter($ => !!$.condition)
    .map(($, $$) => t.instruction('br_if', [t.identifier(`${exitBlock}_${$$}`), $.condition]));

  const ret = blocks.reduceRight((prev, curr, ix) => {
    const label = t.identifier(`${exitBlock}_${ix}`);

    const newBlock = t.blockInstruction(label, flatten(prev));

    const ret = flatten([newBlock, curr.body]);

    ret.push(t.instruction('br', [exitLabel]));

    return ret;
  }, breaks);

  return t.blockInstruction(t.identifier(exitBlock), flatten([lhs, ret]), match.ofType.binaryenType);
}

function emitList(nodes: Nodes.Node[] | Nodes.Node, document: Nodes.DocumentNode) {
  if (nodes instanceof Array) {
    return flatten(nodes.map($ => emit($, document)));
  } else {
    return flatten([emit(nodes, document)]);
  }
}

function emitWast(node: Nodes.WasmAtomNode, document: Nodes.DocumentNode) {
  if (node instanceof Nodes.ReferenceNode) {
    const ofType = node.ofType as StructType | FunctionType | Type;

    if (ofType && 'name' in ofType) {
      return t.identifier(ofType.name.internalIdentifier);
    } else {
      return t.identifier(node.variable.text);
    }
  }

  if (node instanceof Nodes.QNameNode) {
    return t.valtypeLiteral(node.text);
  }

  if (node instanceof Nodes.HexLiteral) {
    return t.numberLiteralFromRaw(node.astNode.text);
  }

  if (node instanceof Nodes.IntegerLiteral) {
    return t.numberLiteralFromRaw(node.value);
  }

  if (node instanceof Nodes.FloatLiteral) {
    return t.numberLiteralFromRaw(node.value);
  }

  return t.instruction(node.symbol, (node.arguments || []).map($ => emitWast($ as any, document)));
}

function emitImplicitCall(implicitCallData: annotations.ImplicitCall, document: Nodes.DocumentNode) {
  const ofType = implicitCallData.functionType;

  assert(ofType instanceof FunctionType, 'implicit call is not a function');

  return t.callInstruction(
    t.identifier(ofType.name.internalIdentifier),
    implicitCallData.args.map($ => emit($, document))
  );
}

function emit(node: Nodes.Node, document: Nodes.DocumentNode): any {
  function _emit() {
    // try {
    if (node.hasAnnotation(annotations.ImplicitCall)) {
      return emitImplicitCall(node.getAnnotation(annotations.ImplicitCall), document);
    } else if (node instanceof Nodes.FunctionCallNode) {
      return emitFunctionCall(node, document);
    } else if (node instanceof Nodes.WasmExpressionNode) {
      return flatten(node.atoms.map($ => emitWast($, document)));
    } else if (node instanceof Nodes.IntegerLiteral) {
      return t.objectInstruction('const', 'i32', [t.numberLiteralFromRaw(node.value)]);
    } else if (node instanceof Nodes.BooleanLiteral) {
      return t.objectInstruction('const', 'i32', [t.numberLiteralFromRaw(node.value ? 1 : 0)]);
    } else if (node instanceof Nodes.StringLiteral) {
      const size = '00000000'; // node.length.toString(16);
      const offset = ('00000000' + node.offset.toString(16)).substr(-8);
      return t.objectInstruction('const', 'i64', [t.numberLiteralFromRaw('0x' + size + offset, 'i64')]);
    } else if (node instanceof Nodes.FloatLiteral) {
      return t.objectInstruction('const', 'f32', [t.numberLiteralFromRaw(node.value)]);
    } else if (node instanceof Nodes.PatternMatcherNode) {
      return emitMatchingNode(node, document);
    } else if (node instanceof Nodes.TailRecLoopNode) {
      return emitTailCall(node, document);
    } else if (node instanceof Nodes.VarDeclarationNode) {
      return t.instruction('set_local', [t.identifier(node.local.name), emit(node.value, document)]);
    } else if (node instanceof Nodes.AssignmentNode) {
      if (node.lhs instanceof Nodes.ReferenceNode) {
        const isLocal = node.lhs.isLocal;
        const isValueNode = node.hasAnnotation(annotations.IsValueNode);

        if (isLocal) {
          const instr = isValueNode ? 'tee_local' : 'set_local';
          return t.instruction(instr, [t.identifier(node.lhs.local.name), emit(node.rhs, document)]);
        } else {
          if (isValueNode) {
            return t.blockInstruction(
              t.identifier('tee_global_' + getModuleSecuentialId(document)),
              [
                t.instruction('set_global', [t.identifier(node.lhs.local.name), emit(node.rhs, document)]),
                t.instruction('get_global', [t.identifier(node.lhs.local.name)])
              ],
              node.rhs.ofType.binaryenType
            );
          } else {
            return t.instruction('set_global', [t.identifier(node.lhs.local.name), emit(node.rhs, document)]);
          }
        }
      } else {
        throw new Error('Error emiting AssignmentNode');
      }
    } else if (node instanceof Nodes.BlockNode) {
      // if (!node.label) throw new Error('Block node without label');
      const label = t.identifier(node.label || 'unknown_block_' + getModuleSecuentialId(document));
      const type = node.ofType.binaryenType;
      let instr = [];

      node.statements.forEach($ => {
        instr = instr.concat(emit($, document));
      });

      if (instr.length == 0) {
        instr.push(t.instruction('nop'));
      }

      return t.blockInstruction(label, instr, type);
    } else if (node instanceof Nodes.IfNode) {
      return t.ifInstruction(
        t.identifier('a_wild_if'),
        [emit(node.condition, document)],
        node.ofType.binaryenType,
        emitList(node.truePart, document),
        node.falsePart ? emitList(node.falsePart, document) : []
      );
    } else if (node instanceof Nodes.BinaryExpressionNode) {
      const ofType = node.resolvedFunctionType;

      return t.callInstruction(t.identifier(ofType.name.internalIdentifier), [
        emit(node.lhs, document),
        emit(node.rhs, document)
      ]);
    } else if (node instanceof Nodes.AsExpressionNode) {
      const ofType = node.resolvedFunctionType;

      return t.callInstruction(t.identifier(ofType.name.internalIdentifier), [emit(node.lhs, document)]);
    } else if (node instanceof Nodes.IsExpressionNode) {
      const ofType = node.resolvedFunctionType;

      return t.callInstruction(t.identifier(ofType.name.internalIdentifier), [emit(node.lhs, document)]);
    } else if (node instanceof Nodes.UnaryExpressionNode) {
      const ofType = node.resolvedFunctionType;

      return t.callInstruction(t.identifier(ofType.name.internalIdentifier), [emit(node.rhs, document)]);
    } else if (node instanceof Nodes.ReferenceNode) {
      const instr = node.isLocal ? 'get_local' : 'get_global';
      return t.instruction(instr, [t.identifier(node.local.name)]);
    }

    throw new AstNodeError(`This node cannot be emited ${node.nodeName}`, node);
    // } catch (e) {
    //   node.errors.push(e);
    // }
  }

  const generatedNode = _emit();

  if (!generatedNode) throw new AstNodeError(`Could not emit any code for node ${node.nodeName}`, node);

  const retAnnotation = node.getAnnotation(annotations.IsReturnExpression);

  if (retAnnotation) {
    if (retAnnotation.targetLocal !== null) {
      return t.instruction('set_local', [t.identifier(retAnnotation.targetLocal.name), generatedNode]);
    } else {
      return t.instruction('return', [generatedNode]);
    }
  }

  return generatedNode;
}

export class CodeGenerationPhaseResult extends PhaseResult {
  programAST: any;
  buffer: Uint8Array;

  get document() {
    return this.compilationPhaseResult.document;
  }

  get parsingContext(): ParsingContext {
    return this.compilationPhaseResult.parsingContext;
  }

  constructor(public compilationPhaseResult: CompilationPhaseResult) {
    super();
    this.execute();
  }

  async validate(optimize: boolean = true) {
    let text = print(this.programAST);

    const wabtModule = wabt.parseWat(
      this.compilationPhaseResult.typePhaseResult.scopePhaseResult.semanticPhaseResult.canonicalPhaseResult
        .parsingPhaseResult.fileName || 'main.ro',
      text
    );

    try {
      wabtModule.resolveNames();
      wabtModule.validate();
    } catch (e) {
      console.log(text);
      this.parsingContext.messageCollector.error(e, this.document);
      throw e;
    }

    const binary = wabtModule.toBinary({ log: false });
    this.buffer = binary.buffer;

    wabtModule.destroy();

    try {
      const module = binaryen.readBinary(this.buffer);

      if (module.validate() == 0) {
        this.parsingContext.messageCollector.error(new AstNodeError('binaryen validation failed', this.document));
      }

      if (optimize) {
        module.optimize();

        this.buffer = module.emitBinary();
      }

      module.dispose();
    } catch (e) {
      if (e instanceof Error) throw e;
      throw new Error(e);
    }
  }

  emitText() {
    const module = binaryen.readBinary(this.buffer);
    const ret = module.emitText();
    module.dispose();
    return ret;
  }

  optimize() {}

  /** This method only exists for test porpuses */
  async toInstance() {
    if (!this.buffer) throw new Error("You didn't generate a binary yet");
    // Create the imports for the module, including the
    // standard dynamic library imports
    const imports = {
      env: {
        memoryBase: 0,
        tableBase: 0,
        memory: new WebAssembly.Memory({ initial: 256 }),
        table: new WebAssembly.Table({ initial: 0, element: 'anyfunc' })
      }
    };

    // Create the instance.
    const compiled = await WebAssembly.compile(this.buffer);

    return new WebAssembly.Instance(compiled, imports);
  }

  generatePhase(
    compilationPhase: CompilationPhaseResult,
    exports: boolean,
    startMemory: number
  ): CompilationModuleResult {
    const globals = findNodesByType(compilationPhase.document, Nodes.VarDirectiveNode);
    const functions = findNodesByType(compilationPhase.document, Nodes.OverloadedFunctionNode);
    const bytesLiterals = findNodesByType(compilationPhase.document, Nodes.StringLiteral);

    const starters = [];
    const exportedElements = [];
    const createdFunctions = [];
    const dataSection = [];

    const endMemory = bytesLiterals.reduce<number>((offset, literal) => {
      const str = literal.value;
      const bytes: number[] = [];
      const byteSize = str.length * 2;

      bytes.push(byteSize & 0xff);
      bytes.push((byteSize >> 8) & 0xff);
      bytes.push((byteSize >> 16) & 0xff);
      bytes.push((byteSize >> 24) & 0xff);

      for (let index = 0; index < str.length; index++) {
        const char = str.charCodeAt(index);
        bytes.push(char & 0xff);
        bytes.push(char >> 8);
      }

      bytes.push(0);

      const size = bytes.length;
      literal.offset = offset;
      literal.length = size;

      const numberLiteral = t.numberLiteralFromRaw(offset, 'i32');
      const offsetToken = t.objectInstruction('const', 'i32', [numberLiteral]);

      dataSection.push(t.data(t.memIndexLiteral(0), offsetToken, t.byteArray(bytes)));

      return offset + size;
    }, startMemory);

    const createdGlobals = globals.map($ => {
      // TODO: If the value is a literal, do not defer initialization to starters

      const mut = 'var'; // $ instanceof Nodes.ValDeclarationNode ? 'const' : 'var';
      const binaryenType = $.decl.variableName.ofType.binaryenType;
      const identifier = t.identifier($.decl.local.name);

      starters.push(t.instruction('set_global', [identifier, ...emitList($.decl.value, compilationPhase.document)]));

      // if ($.isExported) {
      //   exportedElements.push(t.moduleExport($.decl.variableName.name, t.moduleExportDescr('Global', identifier)));
      // }

      return t.global(
        t.globalType(binaryenType, mut),
        [t.objectInstruction('const', binaryenType, [t.numberLiteralFromRaw(0)])], //emitList($.decl.value, compilationPhase.document),
        identifier
      );
    });

    functions.forEach($ => {
      const canBeExported = $.functions.length === 1;
      const candidateToExport = $.parent == compilationPhase.document;

      $.functions.forEach(fun => {
        createdFunctions.push(emitFunction(fun, compilationPhase.document));
        // TODO: decorate exported functions
        if ($.isExported && exports && !fun.hasAnnotation(annotations.Injected) && candidateToExport) {
          if (canBeExported) {
            exportedElements.push(
              t.moduleExport(
                fun.functionName.name,
                t.moduleExportDescr('Func', t.identifier(fun.functionName.internalIdentifier))
              )
            );
          } else {
            throw new AstNodeError(
              `You cannot export overloaded functions (${fun.functionName.text})`,
              fun.functionName
            );
          }
        }
      });
    });

    return {
      compilationPhase,
      moduleParts: [...dataSection, ...createdGlobals, ...(exports ? exportedElements : []), ...createdFunctions],
      starters,
      endMemory
    };
  }

  protected execute() {
    const exportList = [this.compilationPhaseResult];

    const moduleList = new Set<string>(this.compilationPhaseResult.typePhaseResult.scopePhaseResult.importedModules);

    let added = true;

    while (added) {
      added = false;

      moduleList.forEach($ => {
        const scope = this.parsingContext.getScopePhase($);
        scope.importedModules.forEach($ => {
          if (!moduleList.has($)) {
            added = true;
            moduleList.add($);
          }
        });
      });
    }

    moduleList.forEach($ => {
      const compilation = this.parsingContext.getCompilationPhase($);

      if (!exportList.includes(compilation)) {
        exportList.push(compilation);
      }
    });

    let currentMemory = 16;

    const generatedModules = exportList.map(($, ix) => {
      const ret = this.generatePhase($, ix == 0, currentMemory);
      currentMemory = ret.endMemory;
      return ret;
    });

    const starters = [];
    const moduleParts = [];

    const memory = t.memory(t.limit(1), t.identifier('mem'));

    moduleParts.push(memory);
    moduleParts.push(t.moduleExport('memory', t.moduleExportDescr('Memory', t.identifier('mem'))));

    generatedModules.reverse().forEach(ret => {
      moduleParts.push(...ret.moduleParts);
      starters.push(...ret.starters);
    });

    if (starters.length) {
      const starter = getStarterFunction(starters);
      moduleParts.push(starter);
      moduleParts.push(t.start(starterName));
    }

    // moduleParts.unshift(memory);

    const module = t.module(null, moduleParts);

    this.programAST = t.program([module]);

    failIfErrors('WASM generation', this.document, this);
  }
}
