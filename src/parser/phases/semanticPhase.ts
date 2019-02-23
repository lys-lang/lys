import { Nodes } from '../nodes';
import { walkPreOrder } from '../walker';
import { Closure } from '../aclosure';
import { failIfErrors } from './findAllErrors';
import { PhaseResult } from './PhaseResult';
import { CanonicalPhaseResult } from './canonicalPhase';
import { AstNodeError } from '../NodeError';
import { annotations } from '../annotations';
import { ParsingContext } from '../ParsingContext';
import { printNode } from '../../utils/nodePrinter';

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
    } else if (node instanceof Nodes.ImplDirective) {
      overloadFunctions(node, phase);
    }
  });

  document.directives = document.directives.filter($ => !($ instanceof Nodes.FunDirectiveNode));

  return document;
};

function processStruct(node: Nodes.StructDeclarationNode, phase: SemanticPhaseResult): Nodes.DirectiveNode[] {
  const args = node.parameters.map($ => printNode($)).join(', ');
  const typeName = node.declaredName.name;

  const typeDirective = new Nodes.TypeDirectiveNode();
  typeDirective.variableName = node.declaredName;
  const signature = new Nodes.StructTypeNode();
  typeDirective.valueType = signature;

  typeDirective.annotate(new annotations.Injected());

  phase.parsingContext.registerType(typeDirective);

  if (node.parameters.length) {
    const accessors = node.parameters
      .map(({ parameterName, parameterType }, i) => {
        const offset = i * 8;

        signature.names.push(parameterName.name);

        const parameter = printNode(parameterType);

        if (parameterType instanceof Nodes.UnionTypeNode) {
          return `
            // #[getter]
            fun property_${parameterName.name}(target: ${typeName}): ${parameter} = %wasm {
              (i64.load
                (i32.add
                  (i32.const ${offset})
                  (call $addressFromRef (get_local $target))
                )
              )
            }

            // #[setter]
            fun property_${parameterName.name}(target: ${typeName}, value: ${parameter}): void =
              set$${parameterName.name}(target, value)

            private fun set$${parameterName.name}(target: ${typeName}, value: ${parameter}): void = %wasm {
              (i64.store
                (i32.add
                  (i32.const ${offset})
                  (call $addressFromRef (get_local $target))
                )
                (get_local $value)
              )
            }
          `;
        } else {
          return `
            // #[getter]
            fun property_${parameterName.name}(target: ${typeName}): ${parameter} =
              ${parameter}.load(target, ${offset})

            // #[setter]
            fun property_${parameterName.name}(target: ${typeName}, value: ${parameter}): void =
              set$${parameterName.name}(target, value)

            private fun set$${parameterName.name}(target: ${typeName}, value: ${parameter}): void =
              ${parameter}.store(target, value, ${offset})
          `;
        }
      })
      .join('\n');

    const sizes = node.parameters.map(_ => `/* ${printNode(_.parameterType)}.allocationSize() */ 8`).join(' + ');
    const callRefs = node.parameters
      .map(_ => `set$${printNode(_.parameterName)}($ref, ${printNode(_.parameterName)})`)
      .join('\n');

    const canonical = new CanonicalPhaseResult(
      phase.parsingContext.getParsingPhaseForContent(
        phase.moduleName + '#' + typeName,
        `
            impl ${typeName} {
              fun discriminant(): u64 = %wasm {
                (i64.const 0x${typeDirective.typeDiscriminant.toString(16)}00000000)
              }

              fun sizeOf(): i32 = (${sizes})
              fun allocationSize(): u32 = ref.allocationSize()

              fun apply(${args}): ${typeName} = {
                var $ref = fromPointer(
                  system::memory::calloc(1, sizeOf())
                )

                ${callRefs}

                $ref
              }

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

              fun store(lhs: ref, rhs: ${typeName}, offset: i32): void = %wasm {
                (i64.store
                  (i32.add
                    (get_local $offset)
                    (call $addressFromRef (get_local $lhs))
                  )
                  (get_local $rhs)
                )
              }

              fun load(lhs: ref, offset: i32): ${typeName} = %wasm {
                (i64.load
                  (i32.add
                    (get_local $offset)
                    (call $addressFromRef (get_local $lhs))
                  )
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
          impl ${typeName} {
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

            fun ==(a: ${typeName}, b: ref): boolean = %wasm {
              (i64.eq
                (get_local $a)
                (get_local $b)
              )
            }

            fun !=(a: ${typeName}, b: ref): boolean = %wasm {
              (i64.ne
                (get_local $a)
                (get_local $b)
              )
            }

            fun store(lhs: ref, rhs: ${typeName}, offset: i32): void = %wasm {
              (i64.store
                (i32.add
                  (get_local $offset)
                  (call $addressFromRef (get_local $lhs))
                )
                (get_local $rhs)
              )
            }

            fun load(lhs: ref, offset: i32): ${typeName} = %wasm {
              (i64.load
                (i32.add
                  (get_local $offset)
                  (call $addressFromRef (get_local $lhs))
                )
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

      if (!valueType) {
        phase.parsingContext.messageCollector.error(`Missing type value`, variableName);
        return;
      }

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
              impl ${$.variable.text} {
                fun as(a: ${$.variable.text}): ${node.variableName.name}  = %wasm { (get_local $a) }
              }
            `);
          });

          injectedDirectives.push(`
            impl ${node.variableName.name} {
              fun as(a: ${unionType}): ${node.variableName.name}  = %wasm { (get_local $a) }
              fun as(a: ${node.variableName.name}): ref = %wasm { (get_local $a) }
            }
          `);
        }

        const canonical = new CanonicalPhaseResult(
          phase.parsingContext.getParsingPhaseForContent(
            phase.moduleName + '#' + node.variableName.name,
            `
              // Union type ${variableName.name}
              impl ${variableName.name} {
                fun is(a: ${node.variableName.name}): boolean = {
                  ${referenceTypes.map($ => 'a is ' + printNode($.variable)).join(' || ') || 'false'}
                }

                fun ==(lhs: ref, rhs: ref): boolean = lhs == rhs
                fun !=(lhs: ref, rhs: ref): boolean = lhs != rhs

                fun store(lhs: ref, rhs: ${variableName.name}, offset: i32): void = %wasm {
                  (i64.store
                    (i32.add
                      (get_local $offset)
                      (call $addressFromRef (get_local $lhs))
                    )
                    (get_local $rhs)
                  )
                }

                fun load(lhs: ref, offset: i32): ${variableName.name} = %wasm {
                  (i64.load
                    (i32.add
                      (get_local $offset)
                      (call $addressFromRef (get_local $lhs))
                    )
                  )
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

const processDeconstruct = walkPreOrder((node: Nodes.Node, _: SemanticPhaseResult, _parent: Nodes.Node) => {
  if (node instanceof Nodes.MatchCaseIsNode) {
    if (!node.declaredName) {
      node.declaredName = Nodes.NameIdentifierNode.fromString('$');
    }

    if (node.deconstructorNames && node.deconstructorNames.length) {
      /**
       * struct Node(value: i32)
       * match x {
       *   case x is Node(theValue) -> theValue
       *   ...
       * }
       *
       * roughly desugars to
       *
       * struct Node(value: i32)
       * match x {
       *   case x is Node -> {
       *     val theValue = x.value
       *     theValue
       *   }
       *   ...
       * }
       */
      const newBlock = node.rhs instanceof Nodes.BlockNode ? node.rhs : new Nodes.BlockNode(node.rhs.astNode);

      if (!newBlock.statements) {
        newBlock.statements = [];
      }

      node.deconstructorNames.reverse().forEach($ => {
        if ($.name !== '_') {
          const decl = new Nodes.ValDeclarationNode();
          decl.variableName = $;
          const member = new Nodes.MemberNode($.astNode);
          decl.value = member;
          const ref = (member.lhs = new Nodes.ReferenceNode(node.declaredName.astNode));
          ref.variable = Nodes.QNameNode.fromString(node.declaredName.name);
          member.operator = '.';
          member.memberName = new Nodes.NameIdentifierNode($.astNode);
          member.memberName.name = $.name;

          newBlock.statements.unshift(decl);
        }
      });

      node.deconstructorNames.length = 0;

      if (newBlock !== node.rhs) {
        newBlock.statements.push(node.rhs);
        node.rhs = newBlock;
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
    this.document.closure = new Closure(this.parsingContext, null, this.moduleName, 'document_' + this.moduleName);

    preprocessStructs(this.document, this);
    processUnions(this.document, this);

    processDeconstruct(this.document, this);

    overloadFunctions(this.document, this);
    validateSignatures(this.document, this);
    validateInjectedWasm(this.document, this);

    failIfErrors('Semantic phase', this.document, this);
  }
}
