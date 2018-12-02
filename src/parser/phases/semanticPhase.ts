import { Nodes } from '../nodes';
import { walkPreOrder } from '../walker';
import { Closure, ParsingContext } from '../closure';
import { failIfErrors } from './findAllErrors';
import { PhaseResult } from './PhaseResult';
import { CanonicalPhaseResult } from './canonicalPhase';
import { AstNodeError } from '../NodeError';
import { assert } from 'console';
import { printAST } from '../../utils/astPrinter';
import { annotations } from '../annotations';

const overloadFunctions = function(
  document: Nodes.DocumentNode | Nodes.NamespaceDirectiveNode,
  phase: SemanticPhaseResult
) {
  const overloadedFunctions: Map<string, Nodes.OverloadedFunctionNode> = new Map();

  document.directives.forEach((node: Nodes.Node) => {
    if (node instanceof Nodes.FunDirectiveNode) {
      const functionName = node.functionNode.functionName.name;
      const x = overloadedFunctions.get(functionName);
      if (x && x instanceof Nodes.OverloadedFunctionNode) {
        x.functions.push(node);
      } else {
        const overloaded = new Nodes.OverloadedFunctionNode(node.astNode);
        overloaded.annotate(new annotations.Injected());
        overloaded.functionName = Nodes.NameIdentifierNode.fromString(functionName);
        overloaded.functions = [node];
        overloadedFunctions.set(functionName, overloaded);
      }
    } else if (node instanceof Nodes.NamespaceDirectiveNode) {
      overloadFunctions(node, phase);
    }
  });

  document.directives = document.directives.filter($ => !($ instanceof Nodes.FunDirectiveNode));

  overloadedFunctions.forEach($ => {
    document.directives.push($);
  });

  return document;
};

const validateSignatures = walkPreOrder((node: Nodes.Node, _: SemanticPhaseResult, _1: Nodes.Node) => {
  if (node instanceof Nodes.FunctionNode) {
    let used = [];
    node.parameters.forEach(param => {
      if (used.indexOf(param.parameterName.name) == -1) {
        used.push(param.parameterName.name);
      } else {
        param.errors.push(new AstNodeError(`Duplicated parameter "${param.parameterName.name}"`, param));
      }
    });

    if (!node.functionReturnType) {
      node.errors.push(new AstNodeError('Missing return type in function declaration', node));
    }
  }

  if (node instanceof Nodes.PatternMatcherNode) {
    if (node.matchingSet.length == 0) {
      throw new AstNodeError(`Invalid match expression, there are no matchers`, node);
    }
    if (node.matchingSet.length == 1 && node.matchingSet[0] instanceof Nodes.MatchDefaultNode) {
      throw new AstNodeError(`This match is useless`, node);
    }
  }
});

const validateInjectedWasm = walkPreOrder((node: Nodes.Node, _: SemanticPhaseResult, _1: Nodes.Node) => {
  if (node instanceof Nodes.WasmAtomNode) {
    if (node.symbol == 'call' || node.symbol == 'get_global' || node.symbol == 'set_global') {
      if (!node.arguments[0]) {
        throw new AstNodeError(`Missing name`, node);
      }
      if (node.arguments[0] instanceof Nodes.ReferenceNode == false) {
        throw new AstNodeError(`Here you need a fully qualified name starting with $`, node.arguments[0]);
      }
    }
  }
});

const createTypes = walkPreOrder(
  (node: Nodes.Node, phase: SemanticPhaseResult) => {
    if (node instanceof Nodes.StructDeclarationNode) {
      phase.parsingContext.registerType(node);

      assert(node.typeNumber > 0, `typenumber is == 0`);

      const typeName = node.declaredName.name;

      const allocatorName = 'new';

      let injectedDirectives: CanonicalPhaseResult;

      let injectedCode: string = '';

      if (node.parameters.length) {
        const args = node.parameters.map($ => $.parameterName.name + ': ' + $.parameterType.toString()).join(', ');

        const accessors = node.parameters
          .map(({ parameterName, parameterType }) => {
            // console.log(typeName, parameterName, parameterType, parameterType.toString());

            return `
              fun get_${parameterName}(
                target: ${typeName}
              ): ${parameterType.toString()} = %wasm {
                (local $offset i32)
                (set_local $offset (i32.const 0))
                (unreachable)
              }

              fun set_${parameterName}(
                target: ${typeName},
                value: ${parameterType.toString()}
              ): void = %wasm {
                (local $offset i32)
                (set_local $offset (i32.const 0))
                (unreachable)
              }
            `;
          })
          .join('\n');

        injectedCode = `
          namespace ${typeName} {
            fun sizeOf(): i32 = 0

            fun ${allocatorName}(${args}): ${typeName} = fromPointer(
              system::memory::malloc(sizeOf())
            )

            private fun fromPointer(ptr: i32 | u32): ${typeName} = %wasm {
              (i64.or
                (i64.const 0x${node.typeNumber.toString(16)}00000000)
                (i64.extend_u/i32 (get_local $ptr))
              )
            }

            fun is(a: ${typeName}): boolean = %wasm {
              (i64.eq
                (i64.and
                  (i64.const 0xffffffff00000000)
                  (get_local $a)
                )
                (i64.const 0x${node.typeNumber.toString(16)}00000000)
              )
            }

            ${accessors}
          }
        `;
      } else {
        injectedCode = `
          namespace ${typeName} {
            fun ${allocatorName}(): ${typeName} = %wasm {
              (i64.const 0x${node.typeNumber.toString(16)}00000000)
            }

            fun is(a: ${typeName}): boolean = %wasm {
              (i64.eq
                (i64.and
                  (i64.const 0xffffffff00000000)
                  (get_local $a)
                )
                (i64.const 0x${node.typeNumber.toString(16)}00000000)
              )
            }
          }
        `;
      }

      injectedDirectives = CanonicalPhaseResult.fromString(injectedCode);

      const namespace: Nodes.NamespaceDirectiveNode = injectedDirectives.document.directives.find(
        $ => $ instanceof Nodes.NamespaceDirectiveNode && $.reference.toString() === typeName
      ) as any;

      assert(namespace, 'cannot find namespace ' + printAST(injectedDirectives.document));

      const allocator: Nodes.FunDirectiveNode = namespace.directives.find(
        $ => $ instanceof Nodes.FunDirectiveNode && $.functionNode.functionName.name === allocatorName
      ) as any;

      assert(allocator, 'cannot find allocator ' + printAST(injectedDirectives.document));

      allocator.functionNode.internalIdentifier = node.internalIdentifier;

      injectedDirectives.document.directives.forEach($ => {
        $.annotate(new annotations.Injected());
        if ($ instanceof Nodes.NamespaceDirectiveNode) {
          $.directives.forEach($ => $.annotate(new annotations.Injected()));
        }
      });

      phase.document.directives.push(...injectedDirectives.document.directives);
    }
  },
  (node: Nodes.Node, phase: SemanticPhaseResult) => {
    if (node instanceof Nodes.TypeDirectiveNode && node.valueType instanceof Nodes.TypeDeclarationNode) {
      const typeDeclNode = node.valueType as Nodes.TypeDeclarationNode;

      phase.parsingContext.registerTypeDeclaration(node.valueType);

      assert(typeDeclNode.typeNumber > 0, `typenumber is == 0`);

      const injectedFunctions: CanonicalPhaseResult = CanonicalPhaseResult.fromString(
        `
          fun is(a: ${node.variableName.name}): boolean = %wasm {
            (local $mask i64)
            (set_local $mask
              (i64.and
                (i64.const 0xffffffff00000000)
                (get_local $a)
              )
            )

            ${typeDeclNode.declarations.reduceRight((prev, current) => {
              phase.parsingContext.registerType(current);
              const newPart = `
                  (i64.eq
                    (get_local $mask)
                    (i64.const 0x${current.typeNumber.toString(16)}00000000)
                  )
              `;
              if (prev) {
                return `
                (i32.or ${prev} ${newPart})
                `;
              }
              return newPart;
            }, '')}

          }
        `
      );

      injectedFunctions.document.directives.forEach($ => $.annotate(new annotations.Injected()));

      phase.document.directives.push(...injectedFunctions.document.directives);
    }
  }
);

export class SemanticPhaseResult extends PhaseResult {
  get document() {
    return this.canonicalPhaseResult.document;
  }

  get parsingContext(): ParsingContext {
    return this.canonicalPhaseResult.parsingContext;
  }

  constructor(public canonicalPhaseResult: CanonicalPhaseResult, public readonly moduleName: string) {
    super();
    this.execute();
    this.document.moduleName = moduleName;
  }

  protected execute() {
    this.document.closure = new Closure(this.parsingContext, null, this.moduleName, 'document');

    createTypes(this.document, this);

    overloadFunctions(this.document, this);
    validateSignatures(this.document, this);
    validateInjectedWasm(this.document, this);

    failIfErrors('Semantic phase', this.document, this);
  }

  static fromString(code: string, moduleName: string) {
    return new SemanticPhaseResult(CanonicalPhaseResult.fromString(code), moduleName);
  }
}
