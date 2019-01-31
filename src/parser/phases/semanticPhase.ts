import { Nodes } from '../nodes';
import { walkPreOrder } from '../walker';
import { Closure, ParsingContext } from '../closure';
import { failIfErrors } from './findAllErrors';
import { PhaseResult } from './PhaseResult';
import { CanonicalPhaseResult } from './canonicalPhase';
import { AstNodeError } from '../NodeError';
import { annotations } from '../annotations';

const overloadFunctions = function(
  document: Nodes.Node & { directives: Nodes.DirectiveNode[] },
  phase: SemanticPhaseResult
) {
  const overloadedFunctions: Map<string, Nodes.OverloadedFunctionNode> = new Map();

  document.directives.slice().forEach((node: Nodes.Node, ix: number) => {
    if (node instanceof Nodes.FunDirectiveNode) {
      const functionName = node.functionNode.functionName.name;
      const x = overloadedFunctions.get(functionName);
      if (x && x instanceof Nodes.OverloadedFunctionNode) {
        x.functions.push(node.functionNode);
        node.functionNode.parent = x;
      } else {
        const overloaded = new Nodes.OverloadedFunctionNode(node.astNode);
        overloaded.isExported = node.isExported;
        overloaded.annotate(new annotations.Injected());
        overloaded.functionName = Nodes.NameIdentifierNode.fromString(functionName);
        overloaded.functionName.astNode = node.functionNode.functionName.astNode;
        overloaded.functions = [node.functionNode];
        node.functionNode.parent = overloaded;
        overloadedFunctions.set(functionName, overloaded);
        document.directives[ix] = overloaded;
      }
    } else if (node instanceof Nodes.NameSpaceDirective) {
      overloadFunctions(node, phase);
    }
  });

  document.directives = document.directives.filter($ => !($ instanceof Nodes.FunDirectiveNode));

  return document;
};

function processStruct(node: Nodes.StructDeclarationNode, phase: SemanticPhaseResult): Nodes.DirectiveNode[] {
  const args = node.parameters.map($ => $.parameterName.name + ': ' + $.parameterType.toString()).join(', ');
  const typeName = node.declaredName.name;

  const typeDirective = new Nodes.TypeDirectiveNode();
  typeDirective.variableName = node.declaredName;
  typeDirective.valueType = new Nodes.UnknownExpressionNode();
  typeDirective.annotate(new annotations.Injected());

  phase.parsingContext.registerType(typeDirective);

  if (node.parameters.length) {
    const accessors = node.parameters
      .map(({ parameterName, parameterType }) => {
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

    const canonical = new CanonicalPhaseResult(
      phase.parsingContext.getParsingPhaseForContent(
        phase.moduleName + '#' + typeName,
        `
            ns ${typeName} {
              fun discriminant(): u64 = %wasm {
                (i64.const 0x${typeDirective.typeDiscriminant.toString(16)}00000000)
              }

              fun sizeOf(): i32 = 1

              fun apply(${args}): ${typeName} =
                fromPointer(
                  system::memory::malloc(
                    sizeOf()
                  )
                )

              private fun fromPointer(ptr: i32 | u32): ${typeName} = %wasm {
                (i64.or
                  (i64.const 0x${typeDirective.typeDiscriminant.toString(16)}00000000)
                  (i64.extend_u/i32 (get_local $ptr))
                )
              }

              ${accessors}

              fun is(a: ${typeName}): boolean = %wasm {
                (i64.eq
                  (i64.and
                    (i64.const 0xffffffff00000000)
                    (get_local $a)
                  )
                  (i64.const 0x${typeDirective.typeDiscriminant.toString(16)}00000000)
                )
              }
            }
          `
      )
    );

    return [typeDirective, ...canonical.document.directives];
  } else {
    const canonical = new CanonicalPhaseResult(
      phase.parsingContext.getParsingPhaseForContent(
        phase.moduleName + '#' + typeName,
        `
          ns ${typeName} {
            fun apply(): ${typeName} = %wasm {
              (i64.const 0x${typeDirective.typeDiscriminant.toString(16)}00000000)
            }

            fun is(a: ${typeName}): boolean = %wasm {
              (i64.eq
                (i64.and
                  (i64.const 0xffffffff00000000)
                  (get_local $a)
                )
                (i64.const 0x${typeDirective.typeDiscriminant.toString(16)}00000000)
              )
            }

            fun (==)(a: ${typeName}, b: ref): boolean = %wasm {
              (i64.eq
                (get_local $a)
                (get_local $b)
              )
            }

            fun (!=)(a: ${typeName}, b: ref): boolean = %wasm {
              (i64.ne
                (get_local $a)
                (get_local $b)
              )
            }
          }
        `
      )
    );

    return [typeDirective, ...canonical.document.directives];
  }
}

const preprocessStructs = function(
  document: Nodes.Node & { directives: Nodes.DirectiveNode[] },
  phase: SemanticPhaseResult
) {
  document.directives.slice().forEach((node: Nodes.Node) => {
    if (node instanceof Nodes.TypeDirectiveNode && node.valueType instanceof Nodes.TypeDeclarationNode) {
      const decls = node.valueType;

      const union = (node.valueType = new Nodes.UnionTypeNode());
      union.of = [];
      phase.parsingContext.registerType(node);

      const newDirectives = [];

      decls.declarations.forEach($ => {
        newDirectives.push(...processStruct($, phase));
        const refNode = new Nodes.ReferenceNode();
        refNode.variable = Nodes.QNameNode.fromString($.declaredName.name);
        union.of.push(refNode);
      });

      document.directives.splice(document.directives.indexOf(node) + 1, 0, ...newDirectives);
    } else if (node instanceof Nodes.StructDeclarationNode) {
      const newDirectives = processStruct(node, phase);
      document.directives.splice(document.directives.indexOf(node as any), 1, ...newDirectives);
    }
  });

  return document;
};

const processUnions = function(
  document: Nodes.Node & { directives: Nodes.DirectiveNode[] },
  phase: SemanticPhaseResult
) {
  document.directives.slice().forEach((node: Nodes.Node) => {
    if (node instanceof Nodes.TypeDirectiveNode) {
      const { valueType, variableName } = node;

      phase.parsingContext.registerType(node);

      if (valueType instanceof Nodes.UnionTypeNode) {
        const referenceTypes = valueType.of.filter($ => $ instanceof Nodes.ReferenceNode) as Nodes.ReferenceNode[];

        if (valueType.of.length != referenceTypes.length) {
          // error?
        }

        let injectedDirectives: string[] = [];
        if (referenceTypes.length) {
          const unionType = referenceTypes.map($ => $.variable.text).join(' | ');

          referenceTypes.forEach($ => {
            injectedDirectives.push(`
              ns ${$.variable.text} {
                fun (as)(a: ${$.variable.text}): ${node.variableName.name}  = %wasm { (get_local $a) }
              }
            `);
          });

          injectedDirectives.push(`
            ns ${node.variableName.name} {
              fun (as)(a: ${unionType}): ${node.variableName.name}  = %wasm { (get_local $a) }
              fun (as)(a: ${node.variableName.name}): ref = %wasm { (get_local $a) }
            }
          `);
        }

        const canonical = new CanonicalPhaseResult(
          phase.parsingContext.getParsingPhaseForContent(
            phase.moduleName + '#' + node.variableName.name,
            `
              // Union type ${variableName.name}
              ns ${variableName.name} {
                fun (is)(a: ${node.variableName.name}): boolean = {
                  ${referenceTypes.map($ => 'a is ' + $.variable.text).join(' || ') || 'false'}
                }
              }

              ${injectedDirectives.join('\n')}
            `
          )
        );

        document.directives.splice(document.directives.indexOf(node) + 1, 0, ...canonical.document.directives);
      }
    }
  });

  return document;
};

const validateSignatures = walkPreOrder((node: Nodes.Node, ctx: SemanticPhaseResult, _1: Nodes.Node) => {
  if (node instanceof Nodes.FunctionNode) {
    let used = [];
    node.parameters.forEach(param => {
      if (used.indexOf(param.parameterName.name) == -1) {
        used.push(param.parameterName.name);
      } else {
        ctx.parsingContext.messageCollector.error(`Duplicated parameter "${param.parameterName.name}"`, param);
      }
    });

    if (!node.functionReturnType) {
      ctx.parsingContext.messageCollector.error('Missing return type in function declaration', node);
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

    preprocessStructs(this.document, this);
    processUnions(this.document, this);

    overloadFunctions(this.document, this);
    validateSignatures(this.document, this);
    validateInjectedWasm(this.document, this);

    failIfErrors('Semantic phase', this.document, this);
  }
}
