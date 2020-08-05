import * as t from '@webassemblyjs/ast';
import { print } from '@webassemblyjs/wast-printer';

declare var global: any;

global['Binaryen'] = {
  TOTAL_MEMORY: 16777216 * 8
};

import * as binaryen from 'binaryen';
import _wabt = require('wabt');
import { annotations } from '../annotations';
import { flatten } from '../helpers';
import { Nodes, findNodesByType, PhaseFlags } from '../nodes';
import { findParentType } from '../nodeHelpers';
import { FunctionType, TypeHelpers, IntersectionType, FunctionSignatureType, Type } from '../types';
import { LysCompilerError } from '../NodeError';
import { ParsingContext } from '../ParsingContext';
import { printAST } from '../../utils/astPrinter';
import { getModuleSet } from './helpers';
import { failWithErrors } from '../findAllErrors';

type CompilationModuleResult = {
  document: Nodes.DocumentNode;
  moduleParts: any[];
  starters: any[];
  endMemory: number;
  imports: any[];
};

const wabt = _wabt();

const starterName = t.identifier('%%START%%');

declare var WebAssembly: any;

const optimizeLevel = 3;
const shrinkLevel = 0;

const secSymbol = Symbol('secuentialId');

function restartFunctionSeqId(node: Nodes.FunctionNode) {
  (node as any)[secSymbol] = 0;
}

function getFunctionSeqId(node: Nodes.Node) {
  let fun = findParentType(node, Nodes.FunctionNode) || findParentType(node, Nodes.DocumentNode);
  let num = (fun as any)[secSymbol] || 0;
  num++;
  (fun as any)[secSymbol] = num;
  return num;
}

function getStarterFunction(statements: any[]) {
  const fnType = t.signature([], []);

  return t.func(
    starterName, // name
    fnType, // signature
    statements // body
  );
}

function getTypeForFunctionType(fn: Type | null, errorNode: Nodes.Node) {
  if (!fn) {
    throw new LysCompilerError('node has no type', errorNode);
  } else if (fn instanceof FunctionSignatureType) {
    if (fn.returnType) {
      const ret = fn.returnType;

      const retType = ret.binaryenType ? [ret.binaryenType] : [];

      // tslint:disable:ter-indent
      return t.signature(
        fn.parameterTypes.map(($, $$) => ({
          id: fn.parameterNames[$$] || '$param' + $$,
          valtype: $.binaryenType
        })),
        retType
      );
    }
    throw new LysCompilerError(fn + ' has no return type', errorNode);
  } else {
    throw new LysCompilerError(fn + ' is not a function 1', errorNode);
  }
}

function getTypeForFunction(fn: Nodes.FunctionNode) {
  const fnType = TypeHelpers.getNodeType(fn.functionName);

  if (fnType && fnType instanceof FunctionType) {
    return getTypeForFunctionType(fnType.signature, fn);
  } else if (fnType) {
    throw new LysCompilerError(fnType + ' is not a function 2', fn);
  } else {
    throw new LysCompilerError('Function did not resolve any type', fn);
  }
}

function emitFunction(fn: Nodes.FunctionNode, document: Nodes.DocumentNode, parsingContext: ParsingContext) {
  const fnType = getTypeForFunction(fn);

  restartFunctionSeqId(fn);

  const locals = fn.additionalLocals.map($ =>
    t.instruction('local', [t.identifier($.name), t.valtypeLiteral($.type!.binaryenType)])
  );

  if (!fn.body) throw new LysCompilerError('Function has no body', fn);

  const moduleFun = t.func(
    t.identifier(fn.functionName.internalIdentifier), // name
    fnType, // signature
    [...locals, ...emitList(fn.body, document, parsingContext)] // body
  );

  return moduleFun;
}

function emitLoop(node: Nodes.LoopNode, document: Nodes.DocumentNode, parsingContext: ParsingContext) {
  const loopId = getFunctionSeqId(node);

  node.annotate(new annotations.LabelId(loopId));

  const continueLabel = t.identifier('Loop' + loopId);
  const breakLabel = t.identifier('Break' + loopId);

  return t.blockInstruction(breakLabel, [
    t.loopInstruction(continueLabel, void 0, emitList(node.body, document, parsingContext))
  ]);
}

function emitMatchingNode(
  match: Nodes.PatternMatcherNode,
  document: Nodes.DocumentNode,
  parsingContext: ParsingContext
) {
  const matchers = match.matchingSet.slice(0);
  const ixDefaultBranch = matchers.findIndex($ => $ instanceof Nodes.MatchDefaultNode);

  const local = match.getAnnotation(annotations.LocalIdentifier)!.local;

  const lhs = t.instruction('local.set', [t.identifier(local.name), emit(match.lhs, document, parsingContext)]);

  if (ixDefaultBranch !== -1) {
    // the default branch must be the last element
    const defaultMatcher = matchers[ixDefaultBranch];
    matchers.splice(ixDefaultBranch, 1);
    matchers.push(defaultMatcher);
  }

  const blocks = matchers
    .map(function emitNode(node: Nodes.MatcherNode): { condition: any; body: any } {
      if (node instanceof Nodes.MatchDefaultNode) {
        const body = emit(node.rhs, document, parsingContext);
        return { condition: null, body };
      } else if (node instanceof Nodes.MatchLiteralNode) {
        const ofType = node.resolvedFunctionType;

        if (!ofType) throw new LysCompilerError('MatchLiteralNode.resolvedFunctionType is not resolved', node);

        const local = match.getAnnotation(annotations.LocalIdentifier)!.local;

        const condition = t.callInstruction(t.identifier(ofType.name.internalIdentifier), [
          t.instruction('local.get', [t.identifier(local.name)]),
          emit(node.literal, document, parsingContext)
        ]);

        const body = emit(node.rhs, document, parsingContext);
        return {
          condition,
          body
        };
      } else if (node instanceof Nodes.MatchCaseIsNode) {
        const ofType = node.resolvedFunctionType;

        if (!ofType) throw new LysCompilerError('MatchCaseIsNode.resolvedFunctionType is not resolved', node);

        const local = match.getAnnotation(annotations.LocalIdentifier)!.local;

        const condition = t.callInstruction(t.identifier(ofType.name.internalIdentifier), [
          t.instruction('local.get', [t.identifier(local.name)])
        ]);

        const body = emit(node.rhs, document, parsingContext);
        return {
          condition,
          body
        };
      }
      throw new LysCompilerError("I don't know how handle this", node);
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

  const matchType = TypeHelpers.getNodeType(match);

  if (!matchType) throw new LysCompilerError('ofType not defined', match);

  return t.blockInstruction(t.identifier(exitBlock), flatten([lhs, ret]), matchType.binaryenType);
}

function emitList(nodes: Nodes.Node[] | Nodes.Node, document: Nodes.DocumentNode, parsingContext: ParsingContext) {
  if (nodes instanceof Array) {
    return flatten(nodes.map($ => emit($, document, parsingContext)));
  } else {
    return flatten([emit(nodes, document, parsingContext)]);
  }
}

function emitWast(node: Nodes.WasmAtomNode, document: Nodes.DocumentNode, parsingContext: ParsingContext): any {
  if (node instanceof Nodes.ReferenceNode) {
    let ofType = TypeHelpers.getNodeType(node);

    if (ofType instanceof IntersectionType) {
      if (ofType.of.length > 1) {
        throw new LysCompilerError(
          'This reference has multiple overloads. From WASM you can only reference non-overloaded functions',
          node
        );
      }
      ofType = ofType.of[0];
    }

    if (ofType instanceof FunctionType) {
      return t.identifier(ofType.name.internalIdentifier);
    } else {
      return t.identifier(node.resolvedReference!.referencedNode.internalIdentifier!);
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

  return t.instruction(
    node.symbol,
    (node.args || []).map($ => emitWast($ as any, document, parsingContext))
  );
}

function emitImplicitCall(node: Nodes.Node, document: Nodes.DocumentNode, parsingContext: ParsingContext) {
  const implicitCallData = node.getAnnotation(annotations.ImplicitCall)!;

  const ofType = implicitCallData.implicitCall.resolvedFunctionType;

  if (!ofType) throw new LysCompilerError('ofType not defined', node);
  if (false === ofType instanceof FunctionType) throw new LysCompilerError('implicit call is not a function', node);

  return t.callInstruction(
    t.identifier(ofType.name.internalIdentifier),
    implicitCallData.implicitCall.argumentsNode.map($ => emit($, document, parsingContext))
  );
}

function getReferencedSymbol(node: Nodes.Node): { symbol: string; type: 'VALUE' | 'TABLE' } {
  const local = node.getAnnotation(annotations.LocalIdentifier);

  if (local) {
    return {
      symbol: local.local.name,
      type: 'VALUE'
    };
  }

  const fn = node.getAnnotation(annotations.FunctionInTable);

  if (fn) {
    if (!fn.nameIdentifier.internalIdentifier) {
      throw new LysCompilerError('fn.nameIdentifier.internalIdentifier is falsy', node);
    }

    return {
      symbol: fn.nameIdentifier.internalIdentifier,
      type: 'TABLE'
    };
  }

  throw new LysCompilerError('Cannot resolve WASM symbol', node);
}

function getTypeSignature(fn: Type | null, errorNode: Nodes.Node, parsingContext: ParsingContext): any {
  if (!fn) {
    throw new LysCompilerError('node has no type', errorNode);
  } else if (fn instanceof FunctionSignatureType) {
    if (fn.returnType) {
      const ret = fn.returnType;

      const retType = ret.binaryenType ? [ret.binaryenType] : [];

      const name =
        'lys::' + fn.parameterTypes.map($ => $.binaryenType).join('_') + '->' + (retType.join('_') || 'void');

      if (!parsingContext.signatures.has(name)) {
        parsingContext.signatures.set(
          name,
          t.typeInstruction(
            t.identifier(name),
            t.signature(
              fn.parameterTypes.map($ => ({
                valtype: $.binaryenType
              })),
              retType
            )
          )
        );
      }

      return t.identifier(name);
    }
    throw new LysCompilerError(fn + ' has no return type', errorNode);
  } else {
    throw new LysCompilerError(fn + ' is not a function 1', errorNode);
  }
}

function emit(node: Nodes.Node, document: Nodes.DocumentNode, parsingContext: ParsingContext): any {
  function _emit() {
    if (node.hasAnnotation(annotations.ImplicitCall)) {
      return emitImplicitCall(node, document, parsingContext);
    } else if (node instanceof Nodes.AbstractFunctionCallNode) {
      const funType = node.resolvedFunctionType;

      if (!funType && node.hasAnnotation(annotations.ByPassFunction)) {
        return emit(node.argumentsNode[0], document, parsingContext);
      }

      if (!funType && node instanceof Nodes.FunctionCallNode) {
        const annotation = node.getAnnotation(annotations.IsFunctionReference);

        if (annotation) {
          const fnType = TypeHelpers.getNodeType(node.functionNode);
          const signature = getTypeSignature(fnType, node, parsingContext);

          return t.callIndirectInstruction(
            signature,
            node.argumentsNode
              .map($ => emit($, document, parsingContext))
              .concat(emit(node.functionNode, document, parsingContext))
          );
        }
      }

      if (!funType) {
        throw new LysCompilerError(`funType is falsy`, node);
      }

      if (!funType.name.internalIdentifier) throw new LysCompilerError(`${funType}.internalIdentifier is falsy`, node);

      return t.callInstruction(
        t.identifier(funType.name.internalIdentifier),
        node.argumentsNode.map($ => emit($, document, parsingContext))
      );
    } else if (node instanceof Nodes.UnknownExpressionNode) {
      return t.instruction('unreachable', []);
    } else if (node instanceof Nodes.WasmExpressionNode) {
      return flatten(node.atoms.map($ => emitWast($, document, parsingContext)));
    } else if (node instanceof Nodes.ContinueNode) {
      const loopLabel = node.getAnnotation(annotations.CurrentLoop)!.loop.getAnnotation(annotations.LabelId)!;
      return t.instruction('br', [t.identifier('Loop' + loopLabel.label)]);
    } else if (node instanceof Nodes.BreakNode) {
      const loopLabel = node.getAnnotation(annotations.CurrentLoop)!.loop.getAnnotation(annotations.LabelId)!;
      return t.instruction('br', [t.identifier('Break' + loopLabel.label)]);
    } else if (node instanceof Nodes.IntegerLiteral) {
      const type = TypeHelpers.getNodeType(node)!.binaryenType;
      return t.objectInstruction('const', type, [t.numberLiteralFromRaw(node.astNode.text)]);
    } else if (node instanceof Nodes.BooleanLiteral) {
      return t.objectInstruction('const', 'i32', [t.numberLiteralFromRaw(node.value ? 1 : 0)]);
    } else if (node instanceof Nodes.StringLiteral) {
      const discriminant = TypeHelpers.getNodeType(node)!.getSchemaValue('discriminant', node.scope!);
      const discriminantHex = ('00000000' + discriminant.toString(16)).substr(-8);
      const offset = ('00000000' + node.offset!.toString(16)).substr(-8);
      return t.objectInstruction('const', 'i64', [t.numberLiteralFromRaw('0x' + discriminantHex + offset, 'i64')]);
    } else if (node instanceof Nodes.FloatLiteral) {
      return t.objectInstruction('const', 'f32', [t.numberLiteralFromRaw(node.value)]);
    } else if (node instanceof Nodes.PatternMatcherNode) {
      return emitMatchingNode(node, document, parsingContext);
    } else if (node instanceof Nodes.LoopNode) {
      return emitLoop(node, document, parsingContext);
    } else if (node instanceof Nodes.VarDeclarationNode) {
      const local = node.getAnnotation(annotations.LocalIdentifier)!.local;
      return t.instruction('local.set', [t.identifier(local.name), emit(node.value, document, parsingContext)]);
    } else if (node instanceof Nodes.AssignmentNode) {
      if (node.lhs instanceof Nodes.ReferenceNode) {
        const isLocal = node.lhs.isLocal;
        const isValueNode = node.hasAnnotation(annotations.IsValueNode);

        if (isLocal) {
          const instr = isValueNode ? 'local.tee' : 'local.set';
          const local = node.lhs.getAnnotation(annotations.LocalIdentifier)!.local;
          return t.instruction(instr, [t.identifier(local.name), emit(node.rhs, document, parsingContext)]);
        } else {
          if (isValueNode) {
            const local = node.lhs.getAnnotation(annotations.LocalIdentifier)!.local;
            return t.blockInstruction(
              t.identifier('tee_global_' + getFunctionSeqId(node)),
              [
                t.instruction('global.set', [t.identifier(local.name), emit(node.rhs, document, parsingContext)]),
                t.instruction('global.get', [t.identifier(local.name)])
              ],
              TypeHelpers.getNodeType(node.rhs)!.binaryenType
            );
          } else {
            const local = node.lhs.getAnnotation(annotations.LocalIdentifier)!.local;
            return t.instruction('global.set', [t.identifier(local.name), emit(node.rhs, document, parsingContext)]);
          }
        }
      } else {
        throw new Error('Error emiting AssignmentNode');
      }
    } else if (node instanceof Nodes.BlockNode) {
      // a if (!node.label) throw new Error('Block node without label');
      const label = t.identifier(node.label || 'B' + getFunctionSeqId(node));
      const type = TypeHelpers.getNodeType(node)!.binaryenType;
      let instr: any[] = [];

      node.statements.forEach($ => {
        // TODO: Drop here things
        let emited = emit($, document, parsingContext);
        const type = TypeHelpers.getNodeType($);

        if (type && type.binaryenType !== undefined && !$.hasAnnotation(annotations.IsValueNode)) {
          if (emited instanceof Array) {
            throw new LysCompilerError(`\n\n\nshould drop: ${JSON.stringify(emited, null, 2)}`, $);
          } else {
            emited = t.instruction('drop', [emited]);
          }
        }

        instr = instr.concat(emited);
      });

      if (instr.length === 0) {
        instr.push(t.instruction('nop'));
      }

      return t.blockInstruction(label, instr, type);
    } else if (node instanceof Nodes.IfNode) {
      return t.ifInstruction(
        t.identifier('IF' + getFunctionSeqId(node)),
        [emit(node.condition, document, parsingContext)],
        TypeHelpers.getNodeType(node)!.binaryenType,
        emitList(node.truePart, document, parsingContext),
        node.falsePart ? emitList(node.falsePart, document, parsingContext) : []
      );
    } else if (node instanceof Nodes.ReferenceNode) {
      const ref = getReferencedSymbol(node);

      if (ref.type === 'VALUE') {
        const instr = node.isLocal ? 'local.get' : 'global.get';
        return t.instruction(instr, [t.identifier(ref.symbol)]);
      } else if (ref.type === 'TABLE') {
        const index = parsingContext.getFunctionInTableNumber(ref.symbol);
        const numberLiteral = t.numberLiteralFromRaw(index, 'i32');
        return t.objectInstruction('const', 'i32', [numberLiteral]);
      }
    } else if (node instanceof Nodes.MemberNode) {
      if (node.operator === '.^') {
        const schemaType = TypeHelpers.getNodeType(node.lhs);

        if (!schemaType) throw new LysCompilerError('schemaType not defined', node);

        const type = schemaType.schema()[node.memberName.name];
        try {
          const value = schemaType.getSchemaValue(node.memberName.name, node.scope!);
          if (value === null || isNaN(value)) {
            throw new LysCompilerError(`Value was undefined`, node.memberName);
          }
          return t.objectInstruction('const', type.binaryenType, [t.numberLiteralFromRaw(value)]);
        } catch (e) {
          if (e instanceof LysCompilerError) throw e;
          throw new LysCompilerError(e.message, node.memberName);
        }
      } else if (node.resolvedReference) {
        const instr = node.resolvedReference.isLocalReference ? 'local.get' : 'global.get';
        const local = node.getAnnotation(annotations.LocalIdentifier)!.local;
        return t.instruction(instr, [t.identifier(local.name)]);
      }

      console.trace();
    }

    throw new LysCompilerError(`This node cannot be emited ${node.nodeName}\n${printAST(node)}`, node);
  }

  const generatedNode = _emit();

  if (!generatedNode) throw new LysCompilerError(`Could not emit any code for node ${node.nodeName}`, node);

  return generatedNode;
}

export class CodeGenerationPhaseResult {
  programAST: any;
  buffer?: Uint8Array;
  sourceMap: string | null = null;

  constructor(public document: Nodes.DocumentNode, public parsingContext: ParsingContext) {
    failWithErrors(`Compilation`, parsingContext);

    try {
      this.execute();
    } catch (e) {
      this.parsingContext.messageCollector.error(e, this.document.astNode);
    }
  }

  async validate(
    optimize: boolean = true,
    debug = false
  ): Promise<{
    callGraph?: string;
  }> {
    let text = print(this.programAST);

    const theWabt = await wabt;
    let wabtModule: ReturnType<typeof theWabt.parseWat>;

    try {
      wabtModule = theWabt.parseWat(this.document.moduleName, text, {});
    } catch (e) {
      const invalidFile = this.parsingContext.system.resolvePath(this.parsingContext.system.getCurrentDirectory(), 'failed_debug_wat.wat')
      this.parsingContext.system.writeFile(invalidFile, text)
      console.error('Error while parsing generated code. Writing debug WAT to ' + invalidFile)
      console.error(e);
       throw e;
    }

    try {
      wabtModule.resolveNames();
      wabtModule.validate();
    } catch (e) {
      const invalidFile = this.parsingContext.system.resolvePath(this.parsingContext.system.getCurrentDirectory(), 'failed_debug_wat.wat')
      this.parsingContext.system.writeFile(invalidFile, text)

      console.error('Error while resolving names and validate code. Writing debug WAT to ' + invalidFile)
      console.error(e);

      this.parsingContext.messageCollector.error(e, this.document.astNode);
      throw e;
    }

    const binary = wabtModule.toBinary({ log: false, write_debug_names: debug });
    wabtModule.destroy();

    try {
      binaryen.setOptimizeLevel(optimizeLevel);
      binaryen.setShrinkLevel(shrinkLevel);
      binaryen.setDebugInfo(debug || !optimize);

      const module = binaryen.readBinary(binary.buffer);

      if (!debug) {
        module.runPasses(['duplicate-function-elimination']);
      }
      module.runPasses(['remove-unused-module-elements']);

      if (module.validate() === 0) {
        this.parsingContext.messageCollector.error(new LysCompilerError('binaryen validation failed', this.document));
      }

      if (debug) {
        let last = module.emitBinary('sourceMap.map');

        if (optimize) {
          do {
            module.optimize();
            let next = module.emitBinary('sourceMap.map');
            if (next.binary.length >= last.binary.length) {
              // a if (next.length > last.length) {
              // a   this.parsingContext.system.write('Last converge was suboptimial.\n');
              // a }
              break;
            }
            last = next;
          } while (true);
        }

        this.buffer = last.binary;
        this.sourceMap = last.sourceMap;
      } else {
        let last = module.emitBinary();

        if (optimize) {
          do {
            module.optimize();
            let next = module.emitBinary();
            if (next.length >= last.length) {
              // a if (next.length > last.length) {
              // a   this.parsingContext.system.write('Last converge was suboptimial.\n');
              // a }
              break;
            }
            last = next;
          } while (true);
        }

        this.buffer = last;
      }

      module.dispose();

      return {};
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

  optimize() {
    // stub
  }

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

  generatePhase(document: Nodes.DocumentNode, startMemory: number): CompilationModuleResult {
    const globals = findNodesByType(document, Nodes.VarDirectiveNode);
    const functions = findNodesByType(document, Nodes.OverloadedFunctionNode);
    const bytesLiterals = findNodesByType(document, Nodes.StringLiteral);

    const starters: any[] = [];
    const imports: any[] = [];
    const exportedElements: any[] = [];
    const createdFunctions: any[] = [];
    const dataSection: any[] = [];

    const endMemory = bytesLiterals.reduce<number>((offset, literal) => {
      if (literal.parent instanceof Nodes.DecoratorNode) {
        return offset;
      } else {
        const str = literal.value as string;
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

      const mut = 'var'; // TODO: $ instanceof Nodes.ValDeclarationNode ? 'const' : 'var';
      const binaryenType = TypeHelpers.getNodeType($.decl.variableName)!.binaryenType;
      const localDecl = $.decl.getAnnotation(annotations.LocalIdentifier)!;
      const local = localDecl.local;
      const identifier = t.identifier(local.name);

      starters.push(
        t.instruction('global.set', [identifier, ...emitList($.decl.value, document, this.parsingContext)])
      );

      return t.global(
        t.globalType(binaryenType, mut),
        [t.objectInstruction('const', binaryenType, [t.numberLiteralFromRaw(0)])], // emitList($.decl.value, compilationPhase.document),
        identifier
      );
    });

    functions.forEach($ => {
      if ($.parent instanceof Nodes.TraitDirectiveNode) return;
      $.functions.forEach(fun => {
        const functionName = fun.functionNode.functionName;

        if (functionName.hasAnnotation(annotations.Extern)) {
          const extern = functionName.getAnnotation(annotations.Extern)!;
          const fnType = getTypeForFunction(fun.functionNode);

          imports.push(
            t.moduleImport(
              extern.module,
              extern.fn,
              t.funcImportDescr(t.identifier(functionName.internalIdentifier), fnType)
            )
          );
        } else {
          createdFunctions.push(emitFunction(fun.functionNode, document, this.parsingContext));
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
      document,
      moduleParts: [...dataSection, ...createdGlobals, ...(exports ? exportedElements : []), ...createdFunctions],
      starters,
      endMemory,
      imports
    };
  }

  protected execute() {
    const exportList = [this.document];

    const moduleList = getModuleSet(this.document, this.parsingContext);

    moduleList.forEach($ => {
      const compilation = this.parsingContext.getPhase($, PhaseFlags.Compilation);

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

    const starters: any[] = [];

    const tableElems = this.parsingContext.getOrderedTable();

    this.parsingContext.signatures.forEach($ => moduleParts.push($));

    const table = t.table('anyfunc', t.limit(tableElems.length), t.identifier('lys::internal-functions'));
    const elem = t.elem(
      // table
      t.indexLiteral(0),
      // offset
      [t.objectInstruction('const', 'i32', [t.numberLiteralFromRaw(0)])],
      // elems
      tableElems.map(x => t.identifier(x))
    );

    const memory = t.memory(t.limit(1), t.identifier('mem'));

    moduleParts.push(table);

    if (tableElems.length) {
      moduleParts.push(elem);
    }

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

    const module = t.module(null, moduleParts);

    this.programAST = t.program([module]);
  }
}
