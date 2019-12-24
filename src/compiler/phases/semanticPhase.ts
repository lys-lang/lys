import { Nodes, PhaseFlags } from '../nodes';
import { walkPreOrder } from '../walker';
import { LysSemanticError } from '../NodeError';
import { annotations } from '../annotations';
import { ParsingContext } from '../ParsingContext';
import { printNode } from '../../utils/nodePrinter';
import { getAST } from './canonicalPhase';
import assert = require('assert');

function externDecorator(
  decorator: Nodes.DecoratorNode,
  parsingContext: ParsingContext,
  target: Nodes.FunDirectiveNode
) {
  if (decorator.args.length !== 2) {
    parsingContext.messageCollector.error(
      '"extern" requires two arguments, module and function name',
      decorator.decoratorName.astNode
    );
  }

  let moduleName: string | null = null;
  let functionName: string | null = null;

  if (decorator.args[0]) {
    if (decorator.args[0] instanceof Nodes.StringLiteral && decorator.args[0].value.length) {
      moduleName = decorator.args[0].value;
    } else {
      parsingContext.messageCollector.error('module must be a string', decorator.args[0].astNode);
    }
  }

  if (decorator.args[1]) {
    if (decorator.args[1] instanceof Nodes.StringLiteral && decorator.args[1].value.length) {
      functionName = decorator.args[1].value;
    } else {
      parsingContext.messageCollector.error('functionName must be a string', decorator.args[1].astNode);
    }
  }

  if (moduleName && functionName && target.functionNode.functionName) {
    target.functionNode.functionName.annotate(new annotations.Extern(moduleName, functionName));
  }
}

function exportDecorator(
  decorator: Nodes.DecoratorNode,
  parsingContext: ParsingContext,
  target: Nodes.FunDirectiveNode
) {
  if (decorator.args.length > 1) {
    parsingContext.messageCollector.error(
      '"export" accepts one argument, the name of the exported element',
      decorator.decoratorName.astNode
    );
  }

  let exportedName: string | null = null;

  if (decorator.args[0]) {
    if (decorator.args[0] instanceof Nodes.StringLiteral && decorator.args[0].value.length) {
      exportedName = decorator.args[0].value;
    } else {
      parsingContext.messageCollector.error('exportedName must be a string', decorator.args[0].astNode);
    }
  } else {
    exportedName = target.functionNode.functionName.name;
  }

  if (exportedName) {
    target.functionNode.functionName.annotate(new annotations.Export(exportedName));
  }
}

function inlineDecorator(
  decorator: Nodes.DecoratorNode,
  parsingContext: ParsingContext,
  target: Nodes.FunDirectiveNode
) {
  if (decorator.args.length !== 0) {
    parsingContext.messageCollector.error('"inline" takes no arguments', decorator.decoratorName.astNode);
  }

  target.functionNode.functionName.annotate(new annotations.Inline());
}

function getterSetterMethodDecorator(
  decorator: Nodes.DecoratorNode,
  parsingContext: ParsingContext,
  target: Nodes.FunDirectiveNode
) {
  if (decorator.args.length !== 0) {
    parsingContext.messageCollector.error(
      `"${decorator.decoratorName.name}" takes no arguments`,
      decorator.decoratorName.astNode
    );
  }

  switch (decorator.decoratorName.name) {
    case 'getter':
      target.functionNode.functionName.annotate(new annotations.Getter());
      return;
    case 'setter':
      target.functionNode.functionName.annotate(new annotations.Setter());
      return;
    case 'method':
      target.functionNode.functionName.annotate(new annotations.Method());
      return;
  }

  target.functionNode.functionName.annotate(new annotations.Inline());
}

function explicitDecorator(
  decorator: Nodes.DecoratorNode,
  parsingContext: ParsingContext,
  target: Nodes.FunDirectiveNode
) {
  if (decorator.args.length !== 0) {
    parsingContext.messageCollector.error(
      `"${decorator.decoratorName.name}" takes no arguments`,
      decorator.decoratorName.astNode
    );
  }

  target.functionNode.functionName.annotate(new annotations.Explicit());
}

function processFunctionDecorations(node: Nodes.FunDirectiveNode, parsingContext: ParsingContext) {
  if (node && node.decorators && node.decorators.length) {
    node.decorators.forEach($ => {
      switch ($.decoratorName.name) {
        case 'extern':
          return externDecorator($, parsingContext, node);
        case 'inline':
          return inlineDecorator($, parsingContext, node);
        case 'getter':
        case 'setter':
        case 'method':
          return getterSetterMethodDecorator($, parsingContext, node);
        case 'explicit':
          return explicitDecorator($, parsingContext, node);
        case 'export':
          return exportDecorator($, parsingContext, node);
        default:
          parsingContext.messageCollector.error(
            `Unknown decorator "${$.decoratorName.name}" for Function`,
            $.decoratorName.astNode
          );
      }
    });
  }
}

function rejectDecorator(node: Nodes.DirectiveNode, parsingContext: ParsingContext) {
  if (node && node.decorators && node.decorators.length) {
    node.decorators.forEach($ => {
      parsingContext.messageCollector.error(
        `Unknown decorator "${$.decoratorName.name}" for ${node.nodeName}`,
        $.decoratorName.astNode
      );
    });
  }
}

const overloadFunctions = function(
  document: Nodes.Node & { directives: Nodes.DirectiveNode[] },
  parsingContext: ParsingContext
) {
  const overloadedFunctions: Map<string, Nodes.OverloadedFunctionNode> = new Map();

  document.directives.slice().forEach((node: Nodes.DirectiveNode, ix: number) => {
    if (node instanceof Nodes.FunDirectiveNode) {
      processFunctionDecorations(node, parsingContext);
      const functionName = node.functionNode.functionName.name;
      const x = overloadedFunctions.get(functionName);
      if (x && x instanceof Nodes.OverloadedFunctionNode) {
        x.functions.push(node);
        node.functionNode.parent = x;
      } else {
        const overloaded = new Nodes.OverloadedFunctionNode(
          node.astNode,
          new Nodes.NameIdentifierNode(node.functionNode.functionName.astNode, functionName)
        );
        overloaded.isPublic = node.isPublic;
        overloaded.annotate(new annotations.Injected());
        overloaded.functions = [node];
        node.functionNode.parent = overloaded;
        overloadedFunctions.set(functionName, overloaded);
        document.directives[ix] = overloaded;
      }
    } else {
      if (node) {
        rejectDecorator(node, parsingContext);

        if (node instanceof Nodes.ImplDirective) {
          overloadFunctions(node, parsingContext);
        } else if (node instanceof Nodes.TraitDirectiveNode) {
          node.directives.forEach($ => {
            if ($ instanceof Nodes.FunDirectiveNode) {
              if ($.functionNode.body) {
                parsingContext.messageCollector.error(
                  `Unexpected function body. Traits only accept signatures.`,
                  $.functionNode.body.astNode
                );
              }
              if ($.decorators.length > 0) {
                $.decorators.forEach($ => {
                  parsingContext.messageCollector.error(
                    `Unexpected decorator. Traits only accept signatures.`,
                    $.astNode
                  );
                });
              }
            }
          });
          overloadFunctions(node, parsingContext);
        }
      }
    }
  });

  document.directives = document.directives.filter($ => !($ instanceof Nodes.FunDirectiveNode));

  return document;
};

function processStruct(
  node: Nodes.StructDeclarationNode,
  parsingContext: ParsingContext,
  document: Nodes.DocumentNode,
  isPublic: boolean
): Nodes.DirectiveNode[] {
  const args = node.parameters.map($ => printNode($)).join(', ');
  const typeName = node.declaredName.name;

  const typeDirective = new Nodes.TypeDirectiveNode(node.astNode, node.declaredName);
  typeDirective.isPublic = isPublic;
  const signature = new Nodes.StructTypeNode(node.astNode, []);
  typeDirective.valueType = signature;

  typeDirective.annotate(new annotations.Injected());

  if (node.parameters.length) {
    const accessors = node.parameters
      .map((param, i) => {
        signature.parameters.push(param);

        const parameterName = param.parameterName.name;
        const parameterType = printNode(param.parameterType!);

        if (param.parameterType instanceof Nodes.UnionTypeNode) {
          return `
            #[getter]
            fun ${parameterName}(self: ${typeName}): ${parameterType} =
              property$${i}(self)

            #[setter]
            fun ${parameterName}(self: ${typeName}, value: ${parameterType}): void =
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
            #[getter]
            fun ${parameterName}(self: ${typeName}): ${parameterType} =
              property$${i}(self)

            #[setter]
            fun ${parameterName}(self: ${typeName}, value: ${parameterType}): void =
              property$${i}(self, value)

            /* ${param.parameterType!.nodeName} */
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

    const canonical = getAST(
      document.fileName + '#' + typeName,
      document.moduleName + '#' + typeName,
      `
            impl Reference for ${typeName} {
              #[inline]
              fun is(a: Self | ref): boolean = {
                val discriminant: u32 = Self.^discriminant
                ref.getDiscriminant(a) == discriminant
              }

              #[explicit]
              #[inline]
              fun as(lhs: Self): ref  = %wasm { (local.get $lhs) }
            }

            impl ${typeName} {
              #[inline]
              private fun ${typeName}$discriminant(): u64 = {
                val discriminant: u32 = ${typeName}.^discriminant
                discriminant as u64 << 32
              }

              #[inline]
              fun apply(${args}): ${typeName} = {
                var $ref = fromPointer(
                  system::core::memory::calloc(1 as u32, ${typeName}.^allocationSize)
                )

                ${callRefs}

                $ref
              }

              /**
               * CPointer implicit coercion.
               */
              fun as(self: ${typeName}): UnsafeCPointer = %wasm {
                (call $addressFromRef (get_local $self))
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
            }
          `,
      parsingContext
    );

    return [typeDirective, ...(canonical.directives || [])];
  } else {
    const canonical = getAST(
      document.fileName + '#' + typeName,
      document.moduleName + '#' + typeName,
      `
          impl Reference for ${typeName} {
            #[inline]
            fun is(a: Self | ref): boolean = {
              val discriminant: u32 = Self.^discriminant
              ref.getDiscriminant(a) == discriminant
            }

            #[explicit]
            #[inline]
            fun as(lhs: Self): ref  = %wasm { (local.get $lhs) }
          }

          impl ${typeName} {
            #[inline]
            private fun ${typeName}$discriminant(): i64 = {
              val discriminant: u32 = ${typeName}.^discriminant
              discriminant as i64 << 32
            }

            #[inline]
            fun apply(): ${typeName} = %wasm {
              (call $${typeName}$discriminant)
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
          }
        `,
      parsingContext
    );

    return [typeDirective, ...(canonical.directives || [])];
  }
}

const preprocessStructs = function(
  container: Nodes.Node & { directives: Nodes.DirectiveNode[] },
  parsingContext: ParsingContext,
  document: Nodes.DocumentNode
) {
  container.directives.slice().forEach((node: Nodes.Node) => {
    if (node instanceof Nodes.EnumDirectiveNode) {
      const newTypeNode = new Nodes.TypeDirectiveNode(node.astNode, node.variableName);
      const union = (newTypeNode.valueType = new Nodes.UnionTypeNode(node.astNode));
      union.of = [];
      newTypeNode.isPublic = node.isPublic;

      const newDirectives: Nodes.DirectiveNode[] = [newTypeNode];
      const implDirectives: Nodes.DirectiveNode[] = [];

      node.declarations.forEach($ => {
        const [decl, ...impl] = processStruct($, parsingContext, document, node.isPublic);

        newDirectives.push(decl);
        implDirectives.push(...impl);
        const refNode = new Nodes.ReferenceNode(
          $.declaredName.astNode,
          Nodes.QNameNode.fromString($.declaredName.name, $.declaredName.astNode)
        );
        union.of.push(refNode);
      });

      container.directives.splice(container.directives.indexOf(node), 1, ...newDirectives, ...implDirectives);
    } else if (node instanceof Nodes.StructDeclarationNode) {
      const newDirectives = processStruct(node, parsingContext, document, node.isPublic);
      container.directives.splice(container.directives.indexOf(node as any), 1, ...newDirectives);
    }
  });

  return container;
};

const processUnions = function(
  containerNode: Nodes.Node & { directives: Nodes.DirectiveNode[] },
  parsingContext: ParsingContext,
  document: Nodes.DocumentNode
) {
  containerNode.directives.slice().forEach((node: Nodes.Node) => {
    if (node instanceof Nodes.TypeDirectiveNode) {
      const { valueType, variableName } = node;

      if (!valueType) {
        parsingContext.messageCollector.error(`Missing type value`, (variableName || node).astNode);
        return;
      }

      if (valueType instanceof Nodes.UnionTypeNode) {
        const referenceTypes = valueType.of.filter($ => $ instanceof Nodes.ReferenceNode) as Nodes.ReferenceNode[];

        if (valueType.of.length !== referenceTypes.length) {
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

        const canonical = getAST(
          document.fileName + '#' + variableName.name,
          document.moduleName + '#' + variableName.name,
          `
              impl Reference for ${variableName.name} {
                #[inline]
                fun is(self: ${variableName.name} | ref): boolean = {
                  ${referenceTypes.map($ => 'self is ' + printNode($.variable)).join(' || ') || 'false'}
                }

                #[explicit]
                #[inline]
                fun as(self: ${variableName.name}): ref  = %wasm { (local.get $self) }
              }

              // Union type ${variableName.name}
              impl ${variableName.name} {
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
            `,
          parsingContext
        );

        containerNode.directives.splice(containerNode.directives.indexOf(node) + 1, 0, ...(canonical.directives || []));
      }
    }
  });

  return containerNode;
};

const validateSignatures = walkPreOrder((node: Nodes.Node, parsingContext, _1: Nodes.Node | null) => {
  if (node instanceof Nodes.FunctionNode) {
    let used: string[] = [];
    node.parameters.forEach(param => {
      if (used.indexOf(param.parameterName.name) === -1) {
        used.push(param.parameterName.name);
      } else {
        parsingContext.messageCollector.error(`Duplicated parameter "${param.parameterName.name}"`, param.astNode);
      }
    });

    if (!node.functionReturnType) {
      parsingContext.messageCollector.error('Missing return type in function declaration', node.astNode);
    }

    if (!node.body && !node.hasAnnotation(annotations.SignatureDeclaration)) {
      parsingContext.messageCollector.error('Missing function body', node.astNode);
    }
  } else if (node instanceof Nodes.PatternMatcherNode) {
    if (node.matchingSet.length === 0) {
      throw new LysSemanticError(`Invalid match expression, there are no matchers`, node);
    }
    if (node.matchingSet.length === 1 && node.matchingSet[0] instanceof Nodes.MatchDefaultNode) {
      throw new LysSemanticError(`This match is useless`, node);
    }
  }
});

const validateInjectedWasm = walkPreOrder((node: Nodes.Node, _, _1: Nodes.Node | null) => {
  if (node instanceof Nodes.WasmAtomNode) {
    if (node.symbol === 'call' || node.symbol === 'global.get' || node.symbol === 'global.set') {
      if (!node.args[0]) {
        throw new LysSemanticError(`Missing name`, node);
      }
      if (node.args[0] instanceof Nodes.ReferenceNode === false) {
        throw new LysSemanticError(`Here you need a fully qualified name starting with $`, node.args[0]);
      }
    }
  }
});

const processDeconstruct = walkPreOrder((node: Nodes.Node, _, _parent: Nodes.Node | null) => {
  if (node instanceof Nodes.MatchCaseIsNode) {
    if (!node.declaredName) {
      node.declaredName = Nodes.NameIdentifierNode.fromString('$', node.astNode);
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
      const newBlock = node.rhs instanceof Nodes.BlockNode ? node.rhs : new Nodes.BlockNode(node.rhs.astNode, []);

      node.deconstructorNames.reverse().forEach($ => {
        if ($.name !== '_') {
          const ref = new Nodes.ReferenceNode(
            node.declaredName!.astNode,
            Nodes.QNameNode.fromString(node.declaredName!.name, node.declaredName!.astNode)
          );
          const rhs = new Nodes.NameIdentifierNode($.astNode, $.name);
          const member = new Nodes.MemberNode($.astNode, ref, '.', rhs);
          const decl = new Nodes.VarDeclarationNode($.astNode, $, member);

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

export function executeSemanticPhase(moduleName: string, parsingContext: ParsingContext) {
  const document = parsingContext.getParsingPhaseForModule(moduleName);

  assert(document.analysis.nextPhase === PhaseFlags.Semantic);

  preprocessStructs(document, parsingContext, document);
  processUnions(document, parsingContext, document);

  processDeconstruct(document, parsingContext);

  overloadFunctions(document, parsingContext);

  validateSignatures(document, parsingContext);
  validateInjectedWasm(document, parsingContext);

  document.analysis.nextPhase++;
}
