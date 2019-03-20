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
import { FunctionType, Type } from '../types';
import { CompilationPhaseResult } from './compilationPhase';
import { PhaseResult } from './PhaseResult';
import { AstNodeError } from '../NodeError';
import { ParsingContext } from '../ParsingContext';
import { assert } from 'console';
import { printAST } from '../../utils/astPrinter';

type CompilationModuleResult = {
  compilationPhase: CompilationPhaseResult;
  moduleParts: any[];
  starters: any[];
  endMemory: number;
  imports: any[];
};

const wabt: typeof _wabt = (_wabt as any)();

const starterName = t.identifier('%%START%%');
declare var WebAssembly, console;

(binaryen as any).setOptimizeLevel(3);
(binaryen as any).setShrinkLevel(0);

const secSymbol = Symbol('secuentialId');

function restartFunctionSeqId(node: Nodes.FunctionNode) {
  node[secSymbol] = 0;
}

function getFunctionSeqId(node: Nodes.Node) {
  let fun = findParentType(node, Nodes.FunctionNode) || findParentType(node, Nodes.DocumentNode);
  let num = fun[secSymbol] || 0;
  num++;
  fun[secSymbol] = num;
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

  restartFunctionSeqId(fn);

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

function emitLoop(node: Nodes.LoopNode, document: Nodes.DocumentNode) {
  const loopId = getFunctionSeqId(node);

  node.annotate(new annotations.LabelId(loopId));

  const continueLabel = t.identifier('Loop' + loopId);
  const breakLabel = t.identifier('Break' + loopId);

  return t.blockInstruction(breakLabel, [t.loopInstruction(continueLabel, void 0, emitList(node.body, document))]);
}

function emitMatchingNode(match: Nodes.PatternMatcherNode, document: Nodes.DocumentNode) {
  const matchers = match.matchingSet.slice(0);
  const ixDefaultBranch = matchers.findIndex($ => $ instanceof Nodes.MatchDefaultNode);

  const local = match.getAnnotation(annotations.LocalIdentifier).local;

  const lhs = t.instruction('local.set', [t.identifier(local.name), emit(match.lhs, document)]);

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

        const local = match.getAnnotation(annotations.LocalIdentifier).local;

        const condition = t.callInstruction(t.identifier(ofType.name.internalIdentifier), [
          t.instruction('local.get', [t.identifier(local.name)]),
          emit(node.literal, document)
        ]);

        const body = emit(node.rhs, document);
        return {
          condition,
          body
        };
      } else if (node instanceof Nodes.MatchCaseIsNode) {
        const ofType = node.resolvedFunctionType;
        const local = match.getAnnotation(annotations.LocalIdentifier).local;

        const condition = t.callInstruction(t.identifier(ofType.name.internalIdentifier), [
          t.instruction('local.get', [t.identifier(local.name)])
        ]);

        const body = emit(node.rhs, document);
        return {
          condition,
          body
        };
      }
    })
    .filter($ => !!$);
  const exitBlock = 'B' + getFunctionSeqId(match);
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
    const ofType = node.ofType as FunctionType | Type;

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

function emitImplicitCall(node: Nodes.Node, document: Nodes.DocumentNode) {
  const implicitCallData = node.getAnnotation(annotations.ImplicitCall);

  const ofType = implicitCallData.implicitCall.resolvedFunctionType;

  assert(ofType instanceof FunctionType, 'implicit call is not a function');

  return t.callInstruction(
    t.identifier(ofType.name.internalIdentifier),
    implicitCallData.implicitCall.argumentsNode.map($ => emit($, document))
  );
}

function emit(node: Nodes.Node, document: Nodes.DocumentNode): any {
  function _emit() {
    if (node.hasAnnotation(annotations.ImplicitCall)) {
      return emitImplicitCall(node, document);
    } else if (node instanceof Nodes.AbstractFunctionCallNode) {
      const funType = node.resolvedFunctionType;

      if (!funType && node.hasAnnotation(annotations.ByPassFunction)) {
        return emit(node.argumentsNode[0], document);
      }

      if (!funType) {
        assert(!funType, `funType is falsy`);
        return t.instruction('unreachable', []);
      }

      assert(funType.name.internalIdentifier, `${funType}.internalIdentifier is falsy`);

      return t.callInstruction(
        t.identifier(funType.name.internalIdentifier),
        node.argumentsNode.map($ => emit($, document))
      );
    } else if (node instanceof Nodes.WasmExpressionNode) {
      return flatten(node.atoms.map($ => emitWast($, document)));
    } else if (node instanceof Nodes.ContinueNode) {
      const loopLabel = node.getAnnotation(annotations.CurrentLoop).loop.getAnnotation(annotations.LabelId);
      return t.instruction('br', [t.identifier('Loop' + loopLabel.label)]);
    } else if (node instanceof Nodes.BreakNode) {
      const loopLabel = node.getAnnotation(annotations.CurrentLoop).loop.getAnnotation(annotations.LabelId);
      return t.instruction('br', [t.identifier('Break' + loopLabel.label)]);
    } else if (node instanceof Nodes.IntegerLiteral) {
      const type = node.ofType.binaryenType;
      return t.objectInstruction('const', type, [t.numberLiteralFromRaw(node.value)]);
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
    } else if (node instanceof Nodes.LoopNode) {
      return emitLoop(node, document);
    } else if (node instanceof Nodes.VarDeclarationNode) {
      const local = node.getAnnotation(annotations.LocalIdentifier).local;
      return t.instruction('local.set', [t.identifier(local.name), emit(node.value, document)]);
    } else if (node instanceof Nodes.AssignmentNode) {
      if (node.lhs instanceof Nodes.ReferenceNode) {
        const isLocal = node.lhs.isLocal;
        const isValueNode = node.hasAnnotation(annotations.IsValueNode);

        if (isLocal) {
          const instr = isValueNode ? 'local.tee' : 'local.set';
          const local = node.lhs.getAnnotation(annotations.LocalIdentifier).local;
          return t.instruction(instr, [t.identifier(local.name), emit(node.rhs, document)]);
        } else {
          if (isValueNode) {
            const local = node.lhs.getAnnotation(annotations.LocalIdentifier).local;
            return t.blockInstruction(
              t.identifier('tee_global_' + getFunctionSeqId(node)),
              [
                t.instruction('global.set', [t.identifier(local.name), emit(node.rhs, document)]),
                t.instruction('global.get', [t.identifier(local.name)])
              ],
              node.rhs.ofType.binaryenType
            );
          } else {
            const local = node.lhs.getAnnotation(annotations.LocalIdentifier).local;
            return t.instruction('global.set', [t.identifier(local.name), emit(node.rhs, document)]);
          }
        }
      } else {
        throw new Error('Error emiting AssignmentNode');
      }
    } else if (node instanceof Nodes.BlockNode) {
      // if (!node.label) throw new Error('Block node without label');
      const label = t.identifier(node.label || 'B' + getFunctionSeqId(node));
      const type = node.ofType.binaryenType;
      let instr = [];

      node.statements.forEach($ => {
        // TODO: Drop here things
        let emited = emit($, document);

        if ($.ofType && $.ofType.binaryenType !== undefined && !$.hasAnnotation(annotations.IsValueNode)) {
          if (emited instanceof Array) {
            // console.log(`\n\n\nshould drop: ${JSON.stringify(emited, null, 2)}`);
            throw new AstNodeError(`\n\n\nshould drop: ${JSON.stringify(emited, null, 2)}`, $);
          } else {
            emited = t.instruction('drop', [emited]);
          }
        }

        instr = instr.concat(emited);
      });

      if (instr.length == 0) {
        instr.push(t.instruction('nop'));
      }

      return t.blockInstruction(label, instr, type);
    } else if (node instanceof Nodes.IfNode) {
      return t.ifInstruction(
        t.identifier('IF' + getFunctionSeqId(node)),
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
      // } else if (node instanceof Nodes.AsExpressionNode) {
      //   const ofType = node.resolvedFunctionType;

      //   return t.callInstruction(t.identifier(ofType.name.internalIdentifier), [emit(node.lhs, document)]);
      // } else if (node instanceof Nodes.IsExpressionNode) {
      //   const ofType = node.resolvedFunctionType;

      //   return t.callInstruction(t.identifier(ofType.name.internalIdentifier), [emit(node.lhs, document)]);
      // } else if (node instanceof Nodes.UnaryExpressionNode) {
      //   const ofType = node.resolvedFunctionType;

      //   return t.callInstruction(t.identifier(ofType.name.internalIdentifier), [emit(node.rhs, document)]);
    } else if (node instanceof Nodes.ReferenceNode) {
      const instr = node.isLocal ? 'local.get' : 'global.get';
      const local = node.getAnnotation(annotations.LocalIdentifier).local;
      return t.instruction(instr, [t.identifier(local.name)]);
    } else if (node instanceof Nodes.MemberNode) {
      if (node.operator == '.^') {
        const schemaType = node.lhs.ofType;
        const type = schemaType.schema()[node.memberName.name];
        try {
          const value = schemaType.getSchemaValue(node.memberName.name);
          if (value === null || isNaN(value)) {
            throw new AstNodeError(`Value was undefined`, node.memberName);
          }
          return t.objectInstruction('const', type.binaryenType, [t.numberLiteralFromRaw(value)]);
        } catch (e) {
          if (e instanceof AstNodeError) throw e;
          throw new AstNodeError(e.message, node.memberName);
        }
      }
      console.trace();
    }

    throw new AstNodeError(`This node cannot be emited ${node.nodeName}\n${printAST(node)}`, node);
  }

  const generatedNode = _emit();

  if (!generatedNode) throw new AstNodeError(`Could not emit any code for node ${node.nodeName}`, node);

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
    try {
      this.execute();
    } catch (e) {
      if (e instanceof AstNodeError) {
        this.parsingContext.messageCollector.error(e);
      } else {
        this.parsingContext.messageCollector.error(e, this.document);
      }
    }
  }

  async validate(
    optimize: boolean = true,
    debug = false
  ): Promise<{
    callGraph?: string;
  }> {
    let text = print(this.programAST);

    const wabtModule = wabt.parseWat(
      this.compilationPhaseResult.typePhaseResult.scopePhaseResult.semanticPhaseResult.canonicalPhaseResult
        .parsingPhaseResult.fileName || 'main.lys',
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

    const binary = wabtModule.toBinary({ log: false, write_debug_names: debug });
    wabtModule.destroy();

    try {
      const module = binaryen.readBinary(binary.buffer);

      module.runPasses(['duplicate-function-elimination']);
      module.runPasses(['remove-unused-module-elements']);

      if (module.validate() == 0) {
        this.parsingContext.messageCollector.error(new AstNodeError('binaryen validation failed', this.document));
      }

      let callGraph: string = void 0;

      if (debug) {
        //   const old = (binaryen as any).print;
        //   (binaryen as any).print = (x: string) => {
        //     callGraph += x + '\n';
        //   };
        //   module.runPasses(['print-call-graph']);
        //   (binaryen as any).print = old;
      }

      if (optimize) {
        module.optimize();
      }

      this.buffer = module.emitBinary();

      module.dispose();

      return { callGraph };
    } catch (e) {
      if (e instanceof Error) throw e;
      throw new Error(e);
    }
  }

  emitText() {
    if (this.buffer) {
      const module = binaryen.readBinary(this.buffer);
      const ret = module.emitText();
      module.dispose();
      return ret;
    } else if (this.programAST) {
      return print(this.programAST);
    }
    throw new Error('Impossible to emitText');
  }

  optimize() {}

  /** This method only exists for test porpuses */
  async toInstance(extra: Record<string, Record<string, any>> = {}) {
    if (!this.buffer) throw new Error("You didn't generate a binary yet");
    // Create the imports for the module, including the
    // standard dynamic library imports
    const imports = extra || {
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

  generatePhase(compilationPhase: CompilationPhaseResult, startMemory: number): CompilationModuleResult {
    const globals = findNodesByType(compilationPhase.document, Nodes.VarDirectiveNode);
    const functions = findNodesByType(compilationPhase.document, Nodes.OverloadedFunctionNode);
    const bytesLiterals = findNodesByType(compilationPhase.document, Nodes.StringLiteral);

    const starters = [];
    const imports = [];
    const exportedElements = [];
    const createdFunctions = [];
    const dataSection = [];

    const endMemory = bytesLiterals.reduce<number>((offset, literal) => {
      if (literal.parent instanceof Nodes.DecoratorNode) {
        return offset;
      } else {
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
      }
    }, startMemory);

    const createdGlobals = globals.map($ => {
      // TODO: If the value is a literal, do not defer initialization to starters

      const mut = 'var'; // $ instanceof Nodes.ValDeclarationNode ? 'const' : 'var';
      const binaryenType = $.decl.variableName.ofType.binaryenType;
      const local = $.decl.getAnnotation(annotations.LocalIdentifier).local;
      const identifier = t.identifier(local.name);

      starters.push(t.instruction('global.set', [identifier, ...emitList($.decl.value, compilationPhase.document)]));

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
      $.functions.forEach(fun => {
        const functionName = fun.functionNode.functionName;

        if (functionName.hasAnnotation(annotations.Extern)) {
          const extern = functionName.getAnnotation(annotations.Extern);
          const fnType = getTypeForFunction(fun.functionNode);

          imports.push(
            t.moduleImport(
              extern.module,
              extern.fn,
              t.funcImportDescr(t.identifier(functionName.internalIdentifier), fnType)
            )
          );
        } else {
          createdFunctions.push(emitFunction(fun.functionNode, compilationPhase.document));
        }

        const exportedAnnotation = functionName.getAnnotation(annotations.Export);
        // TODO: verify we are not exporting two things with the same name
        if (exportedAnnotation) {
          exportedElements.push(
            t.moduleExport(
              exportedAnnotation.exportedName,
              t.moduleExportDescr('Func', t.identifier(functionName.internalIdentifier))
            )
          );
        }
      });
    });

    return {
      compilationPhase,
      moduleParts: [...dataSection, ...createdGlobals, ...(exports ? exportedElements : []), ...createdFunctions],
      starters,
      endMemory,
      imports
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

    const moduleParts = [];

    const generatedModules = exportList.map($ => {
      const ret = this.generatePhase($, currentMemory);
      currentMemory = ret.endMemory;
      moduleParts.push(...ret.imports);
      return ret;
    });

    const starters = [];

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
