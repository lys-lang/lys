import { Nodes } from '../nodes';
import { walkPreOrder } from '../walker';
import { Closure } from '../Closure';
import { failIfErrors } from '../findAllErrors';
import { PhaseResult } from './PhaseResult';
import { CanonicalPhaseResult } from './canonicalPhase';
import { AstNodeError } from '../NodeError';
import { annotations } from '../annotations';
import { ParsingContext } from '../ParsingContext';
import { printNode } from '../../utils/nodePrinter';

function externDecorator(decorator: Nodes.DecoratorNode, phase: SemanticPhaseResult, target: Nodes.FunDirectiveNode) {
  if (decorator.arguments.length != 2) {
    phase.parsingContext.messageCollector.error(
      '"extern" requires two arguments, module and function name',
      decorator.decoratorName
    );
  }

  let moduleName: string = null;
  let functionName: string = null;

  if (decorator.arguments[0]) {
    if (decorator.arguments[0] instanceof Nodes.StringLiteral && decorator.arguments[0].value.length) {
      moduleName = decorator.arguments[0].value;
    } else {
      phase.parsingContext.messageCollector.error('module must be a string', decorator.arguments[0]);
    }
  }

  if (decorator.arguments[1]) {
    if (decorator.arguments[1] instanceof Nodes.StringLiteral && decorator.arguments[1].value.length) {
      functionName = decorator.arguments[1].value;
    } else {
      phase.parsingContext.messageCollector.error('functionName must be a string', decorator.arguments[1]);
    }
  }

  if (moduleName && functionName) {
    target.functionNode.functionName.annotate(new annotations.Extern(moduleName, functionName));
  }
}
function exportDecorator(decorator: Nodes.DecoratorNode, phase: SemanticPhaseResult, target: Nodes.FunDirectiveNode) {
  if (decorator.arguments.length > 1) {
    phase.parsingContext.messageCollector.error(
      '"export" accepts one argument, the name of the exported element',
      decorator.decoratorName
    );
  }

  let exportedName: string = null;

  if (decorator.arguments[0]) {
    if (decorator.arguments[0] instanceof Nodes.StringLiteral && decorator.arguments[0].value.length) {
      exportedName = decorator.arguments[0].value;
    } else {
      phase.parsingContext.messageCollector.error('exportedName must be a string', decorator.arguments[0]);
    }
  } else {
    exportedName = target.functionNode.functionName.name;
  }

  if (exportedName) {
    target.functionNode.functionName.annotate(new annotations.Export(exportedName));
  }
}

function inlineDecorator(decorator: Nodes.DecoratorNode, phase: SemanticPhaseResult, target: Nodes.FunDirectiveNode) {
  if (decorator.arguments.length != 0) {
    phase.parsingContext.messageCollector.error('"inline" takes no arguments', decorator.decoratorName);
  }

  target.functionNode.functionName.annotate(new annotations.Inline());
}

function explicitDecorator(decorator: Nodes.DecoratorNode, phase: SemanticPhaseResult, target: Nodes.FunDirectiveNode) {
  if (decorator.arguments.length != 0) {
    phase.parsingContext.messageCollector.error('"explicit" takes no arguments', decorator.decoratorName);
  }

  target.functionNode.functionName.annotate(new annotations.Explicit());
}

function processDecorations(node: Nodes.FunDirectiveNode, phase: SemanticPhaseResult) {
  if (node.decorators && node.decorators.length) {
    node.decorators.forEach($ => {
      switch ($.decoratorName.name) {
        case 'extern':
          return externDecorator($, phase, node);
        case 'inline':
          return inlineDecorator($, phase, node);
        case 'explicit':
          return explicitDecorator($, phase, node);
        case 'export':
          return exportDecorator($, phase, node);
        default:
          phase.parsingContext.messageCollector.error(`Unknown decorator "${$.decoratorName.name}"`, $.decoratorName);
      }
    });
  }
}

const overloadFunctions = function(
  document: Nodes.Node & { directives: Nodes.DirectiveNode[] },
  phase: SemanticPhaseResult
) {
  const overloadedFunctions: Map<string, Nodes.OverloadedFunctionNode> = new Map();

  document.directives.slice().forEach((node: Nodes.Node, ix: number) => {
    if (node instanceof Nodes.FunDirectiveNode) {
      processDecorations(node, phase);
      const functionName = node.functionNode.functionName.name;
      const x = overloadedFunctions.get(functionName);
      if (x && x instanceof Nodes.OverloadedFunctionNode) {
        x.functions.push(node);
        node.functionNode.parent = x;
      } else {
        const overloaded = new Nodes.OverloadedFunctionNode(node.astNode);
        overloaded.isPublic = node.isPublic;
        overloaded.annotate(new annotations.Injected());
        overloaded.functionName = Nodes.NameIdentifierNode.fromString(functionName);
        overloaded.functionName.astNode = node.functionNode.functionName.astNode;
        overloaded.functions = [node];
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

const mergeImplementations = function(
  document: Nodes.Node & { directives: Nodes.DirectiveNode[] },
  _phase: SemanticPhaseResult
) {
  const impls: Map<string, Nodes.ImplDirective> = new Map();

  document.directives.forEach((node: Nodes.Node) => {
    if (node instanceof Nodes.ImplDirective) {
      const currentImpl = impls.get(node.reference.variable.text);
      if (currentImpl) {
        currentImpl.directives.push(...node.directives);
        node.directives.length = 0;
      } else {
        impls.set(node.reference.variable.text, node);
      }
    }
  });

  document.directives = document.directives.filter($ => !($ instanceof Nodes.ImplDirective) || $.directives.length > 0);

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

  if (node.parameters.length) {
    const accessors = node.parameters
      .map((param, i) => {
        signature.parameters.push(param);

        const parameterName = param.parameterName.name;
        const parameterType = printNode(param.parameterType);

        if (param.parameterType instanceof Nodes.UnionTypeNode) {
          return `
            // #[getter]
            fun property_${parameterName}(self: ${typeName}): ${parameterType} =
              property$${i}(self)

            // #[setter]
            fun property_${parameterName}(self: ${typeName}, value: ${parameterType}): void =
              property$${i}(self, value)

            #[inline]
            private fun property$${i}(self: ${typeName}): ${parameterType} =
              loadPropertyWithOffset$${i}(
                self,
                ${typeName}.^property$${i}_offset
              )

            #[inline]
            private fun property$${i}(self: ${typeName}, value: ${parameterType}): void =
              storePropertyWithOffset$${i}(
                self,
                value,
                ${typeName}.^property$${i}_offset
              )

            #[inline]
            private fun loadPropertyWithOffset$${i}(self: ${typeName}, offset: u32): ${parameterType} = %wasm {
              (i64.load
                (i32.add
                  (local.get $offset)
                  (call $addressFromRef (local.get $self))
                )
              )
            }

            #[inline]
            private fun storePropertyWithOffset$${i}(self: ${typeName}, value: ${parameterType}, offset: u32): void = %wasm {
              (i64.store
                (i32.add
                  (local.get $offset)
                  (call $addressFromRef (local.get $self))
                )
                (local.get $value)
              )
            }
          `;
        } else {
          return `
            // #[getter]
            fun property_${parameterName}(self: ${typeName}): ${parameterType} =
              property$${i}(self)

            // #[setter]
            fun property_${parameterName}(self: ${typeName}, value: ${parameterType}): void =
              property$${i}(self, value)

            /* ${param.parameterType.nodeName} */
            #[inline]
            private fun property$${i}(self: ${typeName}): ${parameterType} =
              ${parameterType}.load(self, ${typeName}.^property$${i}_offset)

            #[inline]
            private fun property$${i}(self: ${typeName}, value: ${parameterType}): void =
              ${parameterType}.store(self, value, ${typeName}.^property$${i}_offset)
          `;
        }
      })
      .join('\n');

    const callRefs = node.parameters.map((_, i) => `property$${i}($ref, ${printNode(_.parameterName)})`).join('\n');

    const canonical = new CanonicalPhaseResult(
      phase.parsingContext.getParsingPhaseForContent(
        phase.moduleName + '#' + typeName,
        `
            impl ${typeName} {
              #[inline]
              private fun ${typeName}$discriminant(): u64 = {
                val discriminant: u32 = ${typeName}.^discriminant
                discriminant as u64 << 32
              }

              fun apply(${args}): ${typeName} = {
                var $ref = fromPointer(
                  system::memory::calloc(1 as u32, ${typeName}.^allocationSize)
                )

                ${callRefs}

                $ref
              }

              private fun fromPointer(ptr: u32): ${typeName} = %wasm {
                (i64.or
                  (call $${typeName}$discriminant)
                  (i64.extend_u/i32 (local.get $ptr))
                )
              }

              fun ==(a: ${typeName}, b: ${typeName}): boolean = %wasm {
                (i64.eq
                  (local.get $a)
                  (local.get $b)
                )
              }

              fun !=(a: ${typeName}, b: ${typeName}): boolean = %wasm {
                (i64.ne
                  (local.get $a)
                  (local.get $b)
                )
              }


              ${accessors}

              fun is(a: ${typeName} | ref): boolean = %wasm {
                (i64.eq
                  (i64.and
                    (i64.const 0xffffffff00000000)
                    (local.get $a)
                  )
                  (call $${typeName}$discriminant)
                )
              }

              fun store(lhs: ref, rhs: ${typeName}, offset: u32): void = %wasm {
                (i64.store
                  (i32.add
                    (local.get $offset)
                    (call $addressFromRef (local.get $lhs))
                  )
                  (local.get $rhs)
                )
              }

              fun load(lhs: ref, offset: u32): ${typeName} = %wasm {
                (i64.load
                  (i32.add
                    (local.get $offset)
                    (call $addressFromRef (local.get $lhs))
                  )
                )
              }

              #[explicit]
              fun as(lhs: ${typeName}): ref  = %wasm { (local.get $lhs) }
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
            #[inline]
            private fun ${typeName}$discriminant(): i64 = {
              val discriminant: u32 = ${typeName}.^discriminant
              discriminant as i64 << 32
            }

            fun apply(): ${typeName} = %wasm {
              (call $${typeName}$discriminant)
            }

            fun is(a: ${typeName} | ref): boolean = %wasm {
              (i64.eq
                (i64.and
                  (i64.const 0xffffffff00000000)
                  (local.get $a)
                )
                (call $${typeName}$discriminant)
              )
            }

            fun ==(a: ${typeName}, b: ref): boolean = %wasm {
              (i64.eq
                (local.get $a)
                (local.get $b)
              )
            }

            fun !=(a: ${typeName}, b: ref): boolean = %wasm {
              (i64.ne
                (local.get $a)
                (local.get $b)
              )
            }

            fun store(lhs: ref, rhs: ${typeName}, offset: u32): void = %wasm {
              (i64.store
                (i32.add
                  (local.get $offset)
                  (call $addressFromRef (local.get $lhs))
                )
                (local.get $rhs)
              )
            }

            fun load(lhs: ref, offset: u32): ${typeName} = %wasm {
              (i64.load
                (i32.add
                  (local.get $offset)
                  (call $addressFromRef (local.get $lhs))
                )
              )
            }

            #[explicit]
            fun as(lhs: ${typeName}): ref = %wasm { (local.get $lhs) }
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
    if (node instanceof Nodes.EnumDirectiveNode) {
      const newTypeNode = new Nodes.TypeDirectiveNode(node.astNode);
      newTypeNode.variableName = node.variableName;
      const union = (newTypeNode.valueType = new Nodes.UnionTypeNode());
      union.of = [];

      const newDirectives: Nodes.DirectiveNode[] = [newTypeNode];
      const implDirectives: Nodes.DirectiveNode[] = [];

      node.declarations.forEach($ => {
        const [decl, ...impl] = processStruct($, phase);
        newDirectives.push(decl);
        implDirectives.push(...impl);
        const refNode = new Nodes.ReferenceNode();
        refNode.variable = Nodes.QNameNode.fromString($.declaredName.name);
        union.of.push(refNode);
      });

      document.directives.splice(document.directives.indexOf(node), 1, ...newDirectives, ...implDirectives);
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

      if (valueType instanceof Nodes.UnionTypeNode) {
        const referenceTypes = valueType.of.filter($ => $ instanceof Nodes.ReferenceNode) as Nodes.ReferenceNode[];

        if (valueType.of.length != referenceTypes.length) {
          // error?
        }

        let injectedDirectives: string[] = [];
        if (referenceTypes.length) {
          referenceTypes.forEach($ => {
            injectedDirectives.push(`
              impl ${$.variable.text} {
                fun as(lhs: ${$.variable.text}): ${variableName.name}  = %wasm { (local.get $lhs) }
              }
            `);
          });
        }

        const canonical = new CanonicalPhaseResult(
          phase.parsingContext.getParsingPhaseForContent(
            phase.moduleName + '#' + variableName.name,
            `
              // Union type ${variableName.name}
              impl ${variableName.name} {
                fun is(a: ${variableName.name} | ref): boolean = {
                  ${referenceTypes.map($ => 'a is ' + printNode($.variable)).join(' || ') || 'false'}
                }

                #[explicit]
                fun as(a: ${variableName.name}): ref = %wasm { (local.get $a) }

                fun ==(lhs: ref, rhs: ref): boolean = lhs == rhs
                fun !=(lhs: ref, rhs: ref): boolean = lhs != rhs

                fun store(lhs: ref, rhs: ${variableName.name}, offset: u32): void = %wasm {
                  (i64.store
                    (i32.add
                      (local.get $offset)
                      (call $addressFromRef (local.get $lhs))
                    )
                    (local.get $rhs)
                  )
                }

                fun load(lhs: ref, offset: u32): ${variableName.name} = %wasm {
                  (i64.load
                    (i32.add
                      (local.get $offset)
                      (call $addressFromRef (local.get $lhs))
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
    if (node.symbol == 'call' || node.symbol == 'global.get' || node.symbol == 'global.set') {
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

    mergeImplementations(this.document, this);
    overloadFunctions(this.document, this);

    validateSignatures(this.document, this);
    validateInjectedWasm(this.document, this);

    failIfErrors('Semantic phase', this.document, this);
  }
}
