import { walkPreOrder, walk } from '../walker';
import { Nodes } from '../nodes';
import { ParsingContext } from '../ParsingContext';
import {
  Type,
  TypeHelpers,
  InjectableTypes,
  TypeType,
  TypeAlias,
  FunctionType,
  UnionType,
  IntersectionType,
  areEqualTypes,
  RefType,
  NeverType,
  NativeTypes,
  UNRESOLVED_TYPE,
  TraitType,
  StackType,
  StructType,
  FunctionSignatureType
} from '../types';
import { isValidType } from './typeHelpers';
import { annotations, Annotation, IAnnotationConstructor } from '../annotations';
import {
  UnexpectedType,
  NotAValidType,
  LysTypeError,
  CannotInferReturnType,
  UnreachableCode,
  TypeMismatch,
  NotAFunction,
  InvalidOverload,
  InvalidCall,
  DEBUG_TYPES
} from '../NodeError';
import { last, flatten } from '../helpers';
import { MessageCollector } from '../MessageCollector';
import { printAST } from '../../utils/astPrinter';
import { getDocument } from '../phases/helpers';
import { Scope } from '../Scope';

// At some point, we'll cut off the analysis passes and assume
// we're making no forward progress. This should happen only
// on the case of bugs in the analyzer.
export const MaxAnalysisPassCount = 100;

function createTypeAlias(name: Nodes.NameIdentifierNode, value: Type, parsingContext: ParsingContext) {
  const document = getDocument(name);
  if (!document) throw new LysTypeError('Cannot find document', name);
  const discriminant = parsingContext.getTypeDiscriminant(document.moduleName, name.name);
  const alias = new TypeAlias(name, value);
  alias.discriminant = discriminant;
  return alias;
}

export type LysPropertyDescription = {
  type: Type;
  setter: boolean;
  getter: boolean;
  method: boolean;
};

export abstract class TypeResolver {
  public didAnalysisChange = false;
  public nodeAnnotations = new Map<Nodes.Node, Set<Annotation>>();

  private nonResolvedNodes = new Set<Nodes.Node>();

  private readonly walk = walkPreOrder(this.onEnterNode.bind(this), this.onLeaveNode.bind(this));

  constructor(
    public documentNode: Nodes.DocumentNode,
    public parsingContext: ParsingContext,
    public messageCollector: MessageCollector = new MessageCollector()
  ) {}

  analyze() {
    this.didAnalysisChange = false;

    this.messageCollector.errors.length = 0;
    this.nonResolvedNodes.clear();
    this.nodeAnnotations.clear();

    this.walk(this.documentNode, this.parsingContext);

    this.documentNode.analysis.version++;

    // If we've already analyzed the file the max number of times,
    // just give up and admit defeat. This should happen only in
    // the case of analyzer bugs.
    if (this.documentNode.analysis.version >= MaxAnalysisPassCount) {
      this.messageCollector.error(
        `Hit max analysis pass count for ${this.documentNode.moduleName}`,
        this.documentNode.astNode
      );
      return false;
    }

    return this.didAnalysisChange;
  }

  requiresTypeAnalysis(): boolean {
    if (this.documentNode.analysis.version >= MaxAnalysisPassCount) {
      return false;
    }

    if (this.didAnalysisChange) {
      return true;
    }

    let allTypesResolved = true;

    walk(this.documentNode, this.parsingContext, node => {
      if (node instanceof Nodes.ExpressionNode) {
        if (!node.isTypeResolved) {
          allTypesResolved = false;
          this.nonResolvedNodes.add(node);
          return false;
        }
      }

      if (node instanceof Nodes.FunctionNode) {
        if (!isValidType(this.getType(node.functionName))) {
          allTypesResolved = false;
          this.nonResolvedNodes.add(node);
          return false;
        }
      }

      if (node instanceof Nodes.TypeNode) {
        if (!isValidType(this.getType(node))) {
          allTypesResolved = false;
          this.nonResolvedNodes.add(node);
          return false;
        }
      }

      if (node instanceof Nodes.TypeDirectiveNode) {
        if (!isValidType(this.getType(node.variableName))) {
          allTypesResolved = false;
          this.nonResolvedNodes.add(node);
          return false;
        }
      }

      if (node instanceof Nodes.OverloadedFunctionNode) {
        if (!isValidType(this.getType(node.functionName))) {
          allTypesResolved = false;
          this.nonResolvedNodes.add(node);
          return false;
        }
      }
    });

    if (DEBUG_TYPES) {
      this.nonResolvedNodes.forEach($ => console.log(printAST($)));
    }

    this.documentNode.analysis.areTypesResolved = allTypesResolved;

    return !allTypesResolved;
  }

  protected abstract onLeaveNode(
    node: Nodes.Node,
    parsingContext: ParsingContext,
    parent: Nodes.Node | null
  ): void | boolean;

  protected abstract onEnterNode(_node: Nodes.Node, parsingContext: ParsingContext, parent: Nodes.Node | null): void;

  protected setType(node: Nodes.Node, type: Type | null) {
    const currentType = TypeHelpers.getNodeType(node);

    const areEqual = (currentType && type && areEqualTypes(type, currentType)) || false;

    TypeHelpers.setNodeType(node, type);

    if (type === UNRESOLVED_TYPE) {
      node.isTypeResolved = false;
    }

    if (!areEqual && type) {
      this.setAnalysisChanged();
    }
  }

  protected removeStashedNodeAnnotation(node: Nodes.Node, annotation: Annotation): boolean {
    const annotations = this.nodeAnnotations.get(node);
    if (!annotations) return false;

    return annotations.delete(annotation);
  }

  protected getStashedNodeAnnotation<T extends Annotation>(
    node: Nodes.Node,
    klass: IAnnotationConstructor<T>
  ): T | null {
    const annotations = this.nodeAnnotations.get(node);
    if (!annotations) return null;

    for (let annotation of annotations) {
      if (annotation instanceof klass) return annotation;
    }

    return null;
  }

  protected stashNodeAnnotation(node: Nodes.Node, annotation: Annotation) {
    const annotations = this.nodeAnnotations.get(node) || new Set();

    if (!this.nodeAnnotations.has(node)) {
      this.nodeAnnotations.set(node, annotations);
    }

    annotations.add(annotation);
  }

  protected getType(node: Nodes.Node): Type | null {
    const type = TypeHelpers.getNodeType(node);

    return type;
  }

  protected setAnalysisChanged() {
    this.didAnalysisChange = true;
  }
}

export class TypeAnalyzer extends TypeResolver {
  protected onLeaveNode(node: Nodes.Node, _parsingContext: ParsingContext, parent: Nodes.Node) {
    if (!node.scope) {
      this.messageCollector.errorIfBranchDoesntHaveAny(`Node ${node.nodeName} has no scope`, node);
      return;
    }
    const nodeScope = node.scope;

    if (node instanceof Nodes.MatcherNode) {
      console.assert(parent instanceof Nodes.PatternMatcherNode);
      this.processMatcherNode(node, parent as Nodes.PatternMatcherNode);
    } else if (node instanceof Nodes.LiteralNode) {
      if (node.resolvedReference) {
        const type = this.getType(node.resolvedReference.referencedNode);
        this.setType(node, this.getTypeTypeType(node, type, this.messageCollector));
      }
    } else if (node instanceof Nodes.ReferenceNode) {
      if (node.resolvedReference) {
        const type = this.getType(node.resolvedReference.referencedNode);

        if (isValidType(type)) {
          if (type instanceof TypeType && node.hasAnnotation(annotations.IsValueNode)) {
            if (type.of instanceof TypeAlias) {
              const fnType = this.resolveTypeMember(node, type.of, 'apply', this.messageCollector, nodeScope);
              // TODO: a better error would be X is not callable
              if (fnType) {
                const fun = this.findFunctionOverload(
                  fnType,
                  [],
                  node,
                  null,
                  false,
                  this.messageCollector,
                  true,
                  nodeScope
                );

                if (isValidType(fun) && fun instanceof FunctionType) {
                  this.annotateImplicitCall(node, fun, [], this.messageCollector, nodeScope);

                  if (fun.signature.returnType) {
                    this.setType(node, fun.signature.returnType);
                    return;
                  }
                }
                this.messageCollector.errorIfBranchDoesntHaveAny(type.inspect(100), node);
              }
            }
            this.messageCollector.error(new UnexpectedType(type, node));
          } else if (type instanceof FunctionSignatureType && node.hasAnnotation(annotations.IsValueNode)) {
            const currentAnnotation = this.getStashedNodeAnnotation(node, annotations.IsFunctionReference);
            if (currentAnnotation) {
              currentAnnotation.fun = type;
            } else {
              this.stashNodeAnnotation(node, new annotations.IsFunctionReference(type));
            }
          }
          this.setType(node, type);
        } else {
          this.messageCollector.errorIfBranchDoesntHaveAny(
            `Unable to resolve name "${node.resolvedReference.toString()}"${(type &&
              ' ' + (type as any).inspect(100)) ||
              printAST(node.resolvedReference.referencedNode)}`,
            node
          );
          if (node.resolvedReference.moduleName) {
            if (!this.documentNode.importedModules.has(node.resolvedReference.moduleName)) {
              this.messageCollector.errorIfBranchDoesntHaveAny(
                `Document is not importing "${node.resolvedReference.moduleName}"`,
                node
              );
            }
          }
          this.setType(node, UNRESOLVED_TYPE);
        }
      } else {
        this.messageCollector.errorIfBranchDoesntHaveAny('Unable to resolve name', node);
      }
    } else if (node instanceof Nodes.IsExpressionNode) {
      const booleanType = node.booleanReference
        ? this.getTypeTypeType(node, this.getType(node.booleanReference.referencedNode), this.messageCollector)
        : null;

      const lhsType = this.getType(node.lhs);
      const rhsType = this.getTypeTypeType(node.rhs, this.getType(node.rhs), this.messageCollector);

      if (isValidType(lhsType)) {
        if (!this.canBeAssigned(lhsType, RefType.instance, nodeScope)) {
          this.messageCollector.error(
            `"is" expression can only be used with reference types, used with: "${lhsType}"`,
            node.astNode
          );
          this.setType(node, booleanType);
          return;
        }

        if (isValidType(rhsType)) {
          const valueType = this.resolveTypeMember(node.rhs, rhsType, 'is', this.messageCollector, nodeScope);

          if (valueType) {
            const fun = this.findFunctionOverload(
              valueType,
              [rhsType],
              node,
              null,
              false,
              this.messageCollector,
              false,
              nodeScope
            );

            if (fun instanceof FunctionType) {
              node.resolvedFunctionType = fun;
              this.setType(node, fun.signature.returnType!);
              return;
            } else {
              this.messageCollector.error(
                `This statement is always false, type "${lhsType}" can never be "${rhsType}". "${rhsType}" has no overload for \`fun is(arg: ${lhsType}): boolean\`.`,
                node.astNode
              );

              this.setType(node, booleanType);
            }
          } else {
            this.messageCollector.error(
              `This statement is always false, type "${lhsType}" can never be "${rhsType}". "${rhsType}" has no "is" function implementation.`,
              node.astNode
            );

            this.setType(node, booleanType);
          }
        } else {
          this.messageCollector.errorIfBranchDoesntHaveAny(`Error with "is"`, node.rhs);
          this.setType(node, booleanType);
        }
      } else {
        this.messageCollector.errorIfBranchDoesntHaveAny(`Error with "is"`, node.lhs);
        this.setType(node, booleanType);
      }
    } else if (node instanceof Nodes.AsExpressionNode) {
      const lhsType = this.getType(node.lhs);

      if (isValidType(lhsType)) {
        const rhsType = this.getTypeTypeType(node.rhs, this.getType(node.rhs), this.messageCollector);
        if (isValidType(rhsType)) {
          if (lhsType.equals(rhsType) && rhsType.equals(lhsType)) {
            this.messageCollector.warning(`This cast is useless "${lhsType}" as "${rhsType}"`, node);
            if (!node.hasAnnotation(annotations.ByPassFunction)) {
              this.stashNodeAnnotation(node, new annotations.ByPassFunction());
            }
            this.setType(node, rhsType);
            return;
          }

          const memberType = this.resolveTypeMember(node.lhs, lhsType, 'as', this.messageCollector, nodeScope);

          if (memberType) {
            const fun = this.findFunctionOverload(
              memberType,
              [lhsType],
              node,
              rhsType,
              false,
              new MessageCollector(),
              false,
              nodeScope
            );

            if (fun instanceof FunctionType && isValidType(fun.signature.returnType)) {
              this.annotateImplicitCall(node, fun, [node.lhs], this.messageCollector, nodeScope);

              this.setType(node, fun.signature.returnType);
            } else {
              this.messageCollector.errorIfBranchDoesntHaveAny(
                new LysTypeError(`Cannot convert type "${lhsType}" into "${rhsType}"`, node.lhs)
              );
              this.setType(node, UNRESOLVED_TYPE);
            }
          }
        } else {
          this.messageCollector.errorIfBranchDoesntHaveAny('Cannot resolve type 1', node.rhs);
        }
      } else {
        this.messageCollector.errorIfBranchDoesntHaveAny('Cannot resolve type 2', node.lhs);
      }
    } else if (node instanceof Nodes.BinaryExpressionNode) {
      const lhsType = this.getType(node.lhs);
      const rhsType = this.getType(node.rhs);

      if (isValidType(lhsType)) {
        const memberName = node.operator.name;
        const memberType = this.resolveTypeMember(node, lhsType, memberName, this.messageCollector, nodeScope);

        if (memberType) {
          if (isValidType(rhsType)) {
            const argumentTypes = [lhsType, rhsType];

            const fun = this.findFunctionOverload(
              memberType,
              argumentTypes,
              node,
              null,
              false,
              this.messageCollector,
              true,
              nodeScope
            );

            if (isValidType(fun) && fun instanceof FunctionType) {
              this.annotateImplicitCall(node, fun, [node.lhs, node.rhs], this.messageCollector, nodeScope);

              this.setType(node, fun.signature.returnType!);
            } else {
              this.setType(node, UNRESOLVED_TYPE);
            }
          } else {
            this.messageCollector.errorIfBranchDoesntHaveAny('Cannot resolve type 3', node.rhs);
          }
        } else {
          this.setType(node, UNRESOLVED_TYPE);
        }
      } else {
        this.messageCollector.errorIfBranchDoesntHaveAny('Cannot resolve type 4 ' + printAST(node.lhs), node.lhs);
        this.setType(node, UNRESOLVED_TYPE);
      }
    } else if (node instanceof Nodes.UnaryExpressionNode) {
      const rhsType = this.getType(node.rhs);

      if (isValidType(rhsType)) {
        const memberName = node.operator.name;
        const memberType = this.resolveTypeMember(node, rhsType, memberName, this.messageCollector, nodeScope);

        if (memberType) {
          const argumentTypes = [rhsType];

          const fun = this.findFunctionOverload(
            memberType,
            argumentTypes,
            node,
            null,
            false,
            new MessageCollector(),
            true,
            nodeScope
          );

          if (isValidType(fun) && fun instanceof FunctionType) {
            this.annotateImplicitCall(node, fun, node.argumentsNode, this.messageCollector, nodeScope);

            this.setType(node, fun.signature.returnType!);
          } else {
            this.messageCollector.errorIfBranchDoesntHaveAny(
              `Cannot apply operator "${memberName}" in type "${rhsType}"`,
              node
            );
            this.setType(node, rhsType);
          }
        }
      }
    } else if (node instanceof Nodes.IfNode) {
      const condition = this.getType(node.condition);

      const booleanType = node.booleanReference
        ? this.getTypeTypeType(
            node.condition,
            this.getType(node.booleanReference.referencedNode),
            this.messageCollector
          )
        : null;

      const truePart = this.getType(node.truePart);

      if (condition) {
        if (booleanType) {
          this.ensureCanBeAssignedWithImplicitConversion(
            condition,
            booleanType,
            node.condition,
            this.messageCollector,
            nodeScope
          );
        } else {
          this.messageCollector.error('Cannot resolve "boolean"', node.condition.astNode);
        }
      }

      if (node.hasAnnotation(annotations.IsValueNode)) {
        if (!node.falsePart) {
          this.messageCollector.error('A ternary operation requires an else branch', node.astNode);
        }

        if (isValidType(truePart)) {
          const falsePart = node.falsePart ? this.getType(node.falsePart) : null;

          if (isValidType(falsePart)) {
            this.setType(node, new UnionType([truePart, falsePart]).simplify(nodeScope));
          } else {
            this.messageCollector.error('Else not resolved', node.astNode);
            this.setType(node, new UnionType([truePart, UNRESOLVED_TYPE]).simplify(nodeScope));
          }

          return;
        }
      } else {
        this.setType(node, InjectableTypes.void);
      }
    } else if (node instanceof Nodes.AssignmentNode) {
      const lhsType = this.getType(node.lhs);
      const rhsType = this.getType(node.rhs);

      if (!isValidType(lhsType)) {
        this.messageCollector.error('Cannot resolve type', node.lhs.astNode);
        return;
      }

      if (!isValidType(rhsType)) {
        this.messageCollector.error('Cannot resolve type', node.rhs.astNode);
        return;
      }

      // TODO: unhack my heart
      if (node.lhs instanceof Nodes.MemberNode) {
        const call = this.getStashedNodeAnnotation(node.lhs, annotations.ImplicitCall);

        if (call) {
          this.messageCollector.error('!!!1 This node already has an ' + call.toString(), node.lhs.astNode);
          return;
        }

        const prop = this.describeProperty(lhsType);

        if (prop) {
          if (prop.setter) {
            const memberLhsType = this.getType(node.lhs.lhs)!;

            const fun = this.findFunctionOverload(
              lhsType,
              [memberLhsType, rhsType],
              node.lhs,
              null,
              false,
              this.messageCollector,
              true,
              nodeScope
            );

            if (isValidType(fun) && fun instanceof FunctionType) {
              if (!fun.name.hasAnnotation(annotations.Setter)) {
                this.messageCollector.error(
                  new LysTypeError(
                    `Cannot assign to "${node.lhs.memberName.name}" because it is a read-only property.`,
                    node.lhs.memberName
                  )
                );
                this.setType(node, UNRESOLVED_TYPE);
              } else {
                this.annotateImplicitCall(node, fun, [node.lhs.lhs, node.rhs], this.messageCollector, nodeScope);

                this.setType(node, fun.signature.returnType!);
              }
            } else {
              this.messageCollector.error('Overload not found', node.rhs.astNode);
              this.setType(node, UNRESOLVED_TYPE);
              return;
            }
          } else {
            this.messageCollector.error(
              new LysTypeError(
                `Cannot assign to "${node.lhs.memberName.name}" because it is a read-only property.`,
                node.lhs.memberName
              )
            );
            this.setType(node, UNRESOLVED_TYPE);
          }
        } else {
          if (!this.messageCollector.hasErrorForBranch(node.lhs.astNode)) {
            this.messageCollector.error('Invalid property !', node.lhs.astNode);
          }
          this.setType(node, UNRESOLVED_TYPE);
          return;
        }
      } else if (node.lhs instanceof Nodes.BinaryExpressionNode) {
        const call = this.getStashedNodeAnnotation(node.lhs, annotations.ImplicitCall);

        if (call) {
          this.removeStashedNodeAnnotation(node.lhs, call);
        }

        const memberLhsType = this.getType(node.lhs.lhs);
        const memberRhsType = this.getType(node.lhs.rhs);

        if (!isValidType(memberLhsType)) {
          this.messageCollector.error('Cannot resolve type', node.lhs.lhs.astNode);
          return;
        }

        if (!isValidType(memberRhsType)) {
          this.messageCollector.error('Cannot resolve type', node.lhs.rhs.astNode);
          return;
        }

        const memberName = node.lhs.operator.name;
        const memberType = this.resolveTypeMember(node, memberLhsType, memberName, this.messageCollector, nodeScope);

        if (memberType) {
          const fun = this.findFunctionOverload(
            memberType,
            [memberLhsType, memberRhsType, rhsType],
            node.lhs,
            null,
            false,
            this.messageCollector,
            true,
            node.lhs.scope!
          );

          if (isValidType(fun) && fun instanceof FunctionType) {
            this.annotateImplicitCall(
              node,
              fun,
              [node.lhs.lhs, node.lhs.rhs, node.rhs],
              this.messageCollector,
              nodeScope
            );

            this.setType(node, fun.signature.returnType!);
          } else {
            this.messageCollector.error('Overload not found', node.rhs.astNode);
          }
        } else {
          this.setType(node, UNRESOLVED_TYPE);
        }
      } else {
        const result = this.ensureCanBeAssignedWithImplicitConversion(
          rhsType,
          lhsType,
          node.rhs,
          this.messageCollector,
          nodeScope
        );

        if (!NeverType.isNeverType(rhsType) && rhsType.nativeType === NativeTypes.void) {
          this.messageCollector.error(
            'The expression returns a void value, which cannot be assigned to any value',
            node.rhs.astNode
          );
        }

        if (node.hasAnnotation(annotations.IsValueNode)) {
          this.setType(node, result.type);
        } else {
          this.setType(node, InjectableTypes.void);
        }
      }
    } else if (node instanceof Nodes.FunctionCallNode) {
      const functionType = this.getType(node.functionNode);

      if (isValidType(functionType)) {
        const argumentTypes = node.argumentsNode.map($ => this.getType($)!);

        const validArguments = argumentTypes.every($ => isValidType($));

        if (validArguments && isValidType(functionType)) {
          if (
            node.functionNode instanceof Nodes.MemberNode &&
            this.getStashedNodeAnnotation(node.functionNode, annotations.MethodCall)
          ) {
            // Detect if we are calling a <instance>.method(...)
            // to inject the "self" argument

            const fun = this.findFunctionOverload(
              functionType,
              [this.getType(node.functionNode.lhs)!, ...argumentTypes],
              node,
              null,
              false,
              this.messageCollector,
              true,
              nodeScope
            );

            if (isValidType(fun) && fun instanceof FunctionType) {
              this.annotateImplicitCall(
                node,
                fun,
                [node.functionNode.lhs, ...node.argumentsNode],
                this.messageCollector,
                nodeScope
              );

              this.setType(node, fun.signature.returnType!);
            } else {
              this.setType(node, UNRESOLVED_TYPE);
            }
          } else {
            const fun = this.findFunctionOverload(
              functionType,
              argumentTypes,
              node,
              null,
              false,
              this.messageCollector,
              true,
              nodeScope
            );

            if (isValidType(fun) && fun instanceof FunctionType) {
              this.annotateImplicitCall(node, fun, node.argumentsNode, this.messageCollector, nodeScope);

              this.setType(node, fun.signature.returnType!);
            } else if (isValidType(fun) && fun instanceof FunctionSignatureType) {
              const currentAnnotation = this.getStashedNodeAnnotation(node, annotations.IsFunctionReference);
              if (currentAnnotation) {
                currentAnnotation.fun = fun;
              } else {
                this.stashNodeAnnotation(node, new annotations.IsFunctionReference(fun));
              }
              this.setType(node, fun.returnType!);
            } else {
              this.setType(node, UNRESOLVED_TYPE);
            }
          }
        }
      } else {
        this.messageCollector.errorIfBranchDoesntHaveAny('Not a function', node.functionNode);
      }
    } else if (node instanceof Nodes.FunctionNode) {
      const functionType = new FunctionType(node.functionName);

      node.parameters.forEach(($, ix) => {
        const parameterType = this.getType($.parameterName);
        functionType.signature.parameterNames[ix] = $.parameterName.name;
        functionType.signature.parameterTypes[ix] = parameterType!;
      });

      const retType = node.functionReturnType
        ? this.getTypeFromTypeNode(node.functionReturnType, this.messageCollector)
        : null;

      if (isValidType(retType)) {
        functionType.signature.returnType = retType;
      } else {
        this.messageCollector.errorIfBranchDoesntHaveAny('Cannot resolve return type', node.functionReturnType || node);
      }

      if (node.body) {
        const inferedReturnType = this.getType(node.body);

        if (inferedReturnType) {
          if (inferedReturnType instanceof TypeType) {
            this.messageCollector.error(new UnexpectedType(inferedReturnType, node.body));
          } else {
            this.ensureCanBeAssignedWithImplicitConversion(
              inferedReturnType,
              functionType.signature.returnType!,
              node.body,
              this.messageCollector,
              nodeScope
            );
          }
        } else {
          this.messageCollector.errorIfBranchDoesntHaveAny(new CannotInferReturnType(node.body || node));
        }
      }

      this.setType(node.functionName, functionType);
    } else if (node instanceof Nodes.ParameterNode) {
      // TODO: const valueType = TypeHelpers.getNodeType(node.defaultValue);
      // TODO: verify assignability

      const typeType = node.parameterType ? this.getTypeFromTypeNode(node.parameterType, this.messageCollector) : null;

      if (isValidType(typeType)) {
        this.setType(node.parameterName, typeType);
      } else {
        this.messageCollector.errorIfBranchDoesntHaveAny('Cannot infer type 6' + typeType, node);
      }
    } else if (node instanceof Nodes.VarDeclarationNode) {
      const valueType = TypeHelpers.getNodeType(node.value);
      const typeType = node.variableType ? this.getTypeFromTypeNode(node.variableType, this.messageCollector) : null;

      if (node.variableType) {
        if (isValidType(valueType) && isValidType(typeType)) {
          const ret = this.ensureCanBeAssignedWithImplicitConversion(
            valueType,
            typeType,
            node.value,
            this.messageCollector,
            nodeScope
          );
          node.value = ret.node;
          this.setType(node.variableName, ret.type);
        } else if (isValidType(typeType)) {
          this.setType(node.variableName, typeType);
        } else if (isValidType(valueType)) {
          this.setType(node.variableName, valueType);
        } else {
          this.setType(node.variableName, UNRESOLVED_TYPE);
        }
      } else if (valueType) {
        this.setType(node.variableName, valueType);
      } else {
        this.setType(node.variableName, UNRESOLVED_TYPE);
      }
    } else if (node instanceof Nodes.BlockNode) {
      if (node.hasAnnotation(annotations.IsValueNode)) {
        if (node.statements.length === 0) {
          this.setType(node, InjectableTypes.void);
        } else {
          const lastStatement = last(node.statements);
          const type = this.getType(lastStatement);

          if (isValidType(type)) {
            this.setType(node, type);
          } else {
            this.messageCollector.errorIfBranchDoesntHaveAny('Cannot resolve type 6', lastStatement);
          }
        }
      } else {
        this.setType(node, InjectableTypes.void);
      }
    } else if (node instanceof Nodes.MemberNode) {
      const lhsType = this.getType(node.lhs);

      if (!isValidType(lhsType)) {
        this.messageCollector.errorIfBranchDoesntHaveAny('Cannot resolve type 5', node.lhs);
        this.setType(node, UNRESOLVED_TYPE);
        return;
      }

      if (node.operator === '.^') {
        if (lhsType instanceof TypeType) {
          const allowedTypeSchemas = lhsType.schema();

          if (node.memberName.name in allowedTypeSchemas) {
            this.setType(node, allowedTypeSchemas[node.memberName.name]);
            return;
          } else {
            const keys = Object.keys(allowedTypeSchemas);

            if (keys.length) {
              this.messageCollector.error(
                new LysTypeError(`Invalid schema property. Available options: ${keys.join(', ')}`, node.memberName)
              );
            } else {
              this.messageCollector.error(new LysTypeError(`The type "${lhsType}" has no schema`, node.lhs));
            }
          }
        } else {
          this.messageCollector.errorIfBranchDoesntHaveAny(new NotAValidType(node.lhs, lhsType));
        }

        this.setType(node, UNRESOLVED_TYPE);
      } else {
        if (lhsType instanceof TypeType) {
          const memberName = node.memberName.name;
          const memberType = this.resolveTypeMember(
            node.memberName,
            lhsType.of,
            memberName,
            this.messageCollector,
            nodeScope
          );

          if (memberType) {
            if (node.hasAnnotation(annotations.IsValueNode)) {
              /**
               * This branch covers Type.'variable
               *
               * impl Test {
               *   var CONST = 1
               * }
               *
               * Test.CONST
               * ^^^^^^^^^^
               */

              // a if (memberType.referencedNode) {
              // a   node.resolvedReference = new Reference(
              // a     memberType.referencedNode,
              // a     nodeScope,
              // a     'VALUE',
              // a     memberType.referencedNode.astNode.moduleName
              // a   );
              // a } else {
              // a   this.messageCollector.errorIfBranchDoesntHaveAny(new NotAValidType(node.lhs));
              // a }

              if (!node.resolvedReference) {
                this.messageCollector.errorIfBranchDoesntHaveAny('Reference not resolved', node.lhs);
              }
            }
            this.setType(node, memberType);
          } else {
            this.setType(node, UNRESOLVED_TYPE);
          }
        } else if (lhsType instanceof TypeAlias) {
          // we are inside if (node is MemberNode)
          // lhsType is typeOf(node.lhs)
          // lhsType is TypeAlias means we are receiving a value as LHS
          // i.e: "asd".length

          const memberName = node.memberName.name;
          const memberType = this.resolveTypeMember(
            node.memberName,
            lhsType,
            memberName,
            this.messageCollector,
            nodeScope
          );

          if (memberType) {
            const isValueNode = !node.hasAnnotation(annotations.IsAssignationLHS);

            if (isValueNode) {
              const prop = this.describeProperty(memberType);

              if (prop) {
                if (prop.getter) {
                  const fun = this.findFunctionOverload(
                    memberType,
                    [lhsType],
                    node,
                    null,
                    false,
                    this.messageCollector,
                    false,
                    nodeScope
                  );

                  if (isValidType(fun) && fun instanceof FunctionType) {
                    this.annotateImplicitCall(node, fun, [node.lhs], this.messageCollector, nodeScope);

                    this.setType(node, fun.signature.returnType!);
                  } else {
                    this.messageCollector.error(
                      new LysTypeError(
                        `${lhsType}.${memberName} is not a valid property getter ${fun} ${memberType.inspect(100)}`,
                        node.memberName
                      )
                    );
                    this.setType(node, UNRESOLVED_TYPE);
                  }
                } else if (prop.method) {
                  this.stashNodeAnnotation(node, new annotations.MethodCall());
                  this.setType(node, memberType);
                } else {
                  this.messageCollector.error(
                    new LysTypeError(`${lhsType}.${memberName} is not a getter or method`, node.memberName)
                  );
                  this.setType(node, UNRESOLVED_TYPE);
                }
              } else {
                this.messageCollector.error(
                  new LysTypeError(`${lhsType}.${memberName} is not a getter or method`, node.memberName)
                );
                this.setType(node, UNRESOLVED_TYPE);
              }
            } else {
              this.setType(node, memberType);
            }
          } else {
            this.setType(node, UNRESOLVED_TYPE);
          }
        } else {
          this.messageCollector.errorIfBranchDoesntHaveAny(
            `Don't know how to find a member in "${lhsType}"`,
            node.memberName
          );
        }
      }
    } else if (node instanceof Nodes.ImplDirective) {
      if (node.baseImpl && node.baseImpl.resolvedReference) {
        const trait = this.getType(node.baseImpl.resolvedReference.referencedNode);

        if (node.targetImpl.resolvedReference) {
          const targetType = this.getType(node.targetImpl.resolvedReference.referencedNode);

          if (node.selfTypeName && targetType) {
            this.setType(node.selfTypeName, targetType);
          }
        }

        if (trait) {
          if (trait instanceof TraitType) {
            if (!isValidType(trait)) {
              this.messageCollector.errorIfBranchDoesntHaveAny('Trait not ready', node.baseImpl);
            } else {
              const requiredImplementations = new Set(trait.traitNode.namespaceNames.keys());
              const givenImplementations: string[] = [];

              // verify every implementation function against the trait's signatures
              for (let [name, nameNode] of node.namespaceNames) {
                givenImplementations.push(name);

                const type = this.getType(nameNode);

                const signature = trait.getSignatureOf(name);

                if (signature && type && !type.canBeAssignedTo(signature, nodeScope)) {
                  this.messageCollector.errorIfBranchDoesntHaveAny(new TypeMismatch(type, signature, nameNode));
                }

                if (requiredImplementations.has(name)) {
                  requiredImplementations.delete(name);
                } else {
                  // TODO: check extra names and suggest private implementations
                }
              }

              if (requiredImplementations.size) {
                this.messageCollector.errorIfBranchDoesntHaveAny(
                  `Not all functions are implemented, missing: ${Array.from(requiredImplementations).join(', ')}`,
                  node.baseImpl
                );
              }
            }
          } else {
            // TODO: test this
            this.messageCollector.errorIfBranchDoesntHaveAny(`${trait.inspect(100)} is not a trait`, node.baseImpl);
          }
        }
      }
      if (node.targetImpl.resolvedReference) {
        // this will fail if the resolved reference is not a type
        this.getTypeTypeType(
          node.targetImpl,
          this.getType(node.targetImpl.resolvedReference.referencedNode),
          this.messageCollector
        );
      }
    } else if (node instanceof Nodes.TypeDirectiveNode) {
      if (node.valueType) {
        let valueType = this.getTypeFromTypeNode(node.valueType, this.messageCollector);

        if (isValidType(valueType)) {
          const type = createTypeAlias(node.variableName, valueType, this.parsingContext);

          type.name.impls.forEach(impl => {
            if (impl.baseImpl && impl.baseImpl.resolvedReference) {
              const trait = this.getType(impl.baseImpl.resolvedReference.referencedNode);
              if (trait instanceof TraitType) {
                type.traits.set(impl, trait);
              }
            }
          });

          this.setType(node.variableName, TypeType.of(type));
        } else {
          this.messageCollector.errorIfBranchDoesntHaveAny('Invalid type', node.valueType || node);
        }
      } else {
        this.messageCollector.errorIfBranchDoesntHaveAny('Missing value type', node);
      }
    } else if (node instanceof Nodes.FunctionTypeNode) {
      const signatureType = new FunctionSignatureType();

      node.parameters.forEach(($, ix) => {
        const parameterType = this.getTypeFromTypeNode($.parameterType, this.messageCollector);
        signatureType.parameterTypes[ix] = parameterType!;
      });

      const retType = node.returnType ? this.getTypeFromTypeNode(node.returnType, this.messageCollector) : null;

      if (isValidType(retType)) {
        signatureType.returnType = retType;
      } else {
        this.messageCollector.errorIfBranchDoesntHaveAny('Cannot resolve return type', node.returnType || node);
      }

      this.setType(node, signatureType);
    } else if (node instanceof Nodes.IntersectionTypeNode) {
      const of = node.of.map($ => this.getTypeTypeType($, this.getType($), this.messageCollector)) as Type[];
      this.setType(node, new IntersectionType(of));
    } else if (node instanceof Nodes.UnionTypeNode) {
      const of = node.of.map($ => this.getTypeTypeType($, this.getType($), this.messageCollector)) as Type[];
      this.setType(node, new UnionType(of));
    } else if (node instanceof Nodes.OverloadedFunctionNode) {
      const incomingTypes = node.functions.map(fun => {
        if (!fun.functionNode.hasAnnotation(annotations.IsOverloaded)) {
          this.stashNodeAnnotation(fun.functionNode, new annotations.IsOverloaded());
        }
        return this.getType(fun.functionNode.functionName);
      });

      const incomingFunctionTypes: FunctionType[] = [];

      for (let incomingType of incomingTypes) {
        if (incomingType instanceof FunctionType) {
          incomingFunctionTypes.push(incomingType);
        } else {
          this.messageCollector.error(
            `All members of an overloaded function should be functions, but found ${incomingType}`,
            node.astNode
          );
        }
      }

      const newType = new IntersectionType(incomingFunctionTypes);

      this.setType(node.functionName, newType);
    } else if (node instanceof Nodes.WasmExpressionNode) {
      this.setType(node, InjectableTypes.never);
    } else if (node instanceof Nodes.UnknownExpressionNode) {
      this.setType(node, InjectableTypes.never);
    } else if (node instanceof Nodes.LoopNode) {
      this.setType(node, InjectableTypes.void);
    } else if (node instanceof Nodes.PatternMatcherNode) {
      if (node.hasAnnotation(annotations.IsValueNode)) {
        const restType = node.carryType;

        if (isValidType(restType) && !NeverType.isNeverType(restType)) {
          this.messageCollector.error(`Match is not exhaustive, not covered types: "${restType}"`, node.astNode);
        }

        const retType = UnionType.of(node.matchingSet.map($ => this.getType($)!)).simplify(nodeScope);

        this.setType(node, retType);
      } else {
        this.setType(node, InjectableTypes.void);
      }
      // TODO: warn if empty matcher
    } else if (node instanceof Nodes.VarDeclarationNode) {
      if (node.hasAnnotation(annotations.IsValueNode)) {
        this.messageCollector.error('This should be an expression. A declaration was found.', node.astNode);
      }
      this.setType(node, InjectableTypes.void);
    } else if (node instanceof Nodes.ExpressionNode) {
      const type = this.getType(node);
      if (!isValidType(type)) {
        this.messageCollector.errorIfBranchDoesntHaveAny(`Cannot resolve type of node ${node.nodeName}`, node);
      }
    }
  }

  protected onEnterNode(node: Nodes.Node) {
    if (node instanceof Nodes.PatternMatcherNode) {
      // this value must be cleared in every execution
      delete node.carryType;
    }
  }

  private processMatcherNode(node: Nodes.MatcherNode, parent: Nodes.PatternMatcherNode) {
    if (!node.scope) {
      this.messageCollector.errorIfBranchDoesntHaveAny(`Node ${node.nodeName} has no scope`, node);
      return;
    }
    const nodeScope = node.scope;

    const carryType = parent.carryType || this.getType(parent.lhs);

    if (!isValidType(carryType)) {
      return;
    }

    if (!parent.carryType) {
      parent.carryType = carryType;
    }

    const booleanType = node.booleanReference
      ? this.getTypeTypeType(node, this.getType(node.booleanReference.referencedNode), this.messageCollector)
      : null;

    if (!isValidType(booleanType)) {
      return;
    }

    if (NeverType.isNeverType(carryType)) {
      this.messageCollector.error(new UnreachableCode(node.rhs));
      this.messageCollector.error(carryType.inspect(10), node.rhs.astNode);
      this.stashNodeAnnotation(node.rhs, new annotations.IsUnreachable());
      this.setType(node, UNRESOLVED_TYPE);
      return;
    }

    if (node instanceof Nodes.MatchDefaultNode) {
      this.removeTypeFromMatcherFlow(parent, carryType);
    } else if (node instanceof Nodes.MatchLiteralNode) {
      const argumentType = this.getType(node.literal);

      if (!isValidType(argumentType)) {
        return;
      }

      const eqFunction = this.resolveTypeMember(node.literal, carryType, '==', this.messageCollector, nodeScope);

      if (eqFunction) {
        const argTypes = [carryType, argumentType];

        const fun = this.findFunctionOverload(
          eqFunction,
          argTypes,
          node.literal,
          null,
          false,
          new MessageCollector(),
          true,
          nodeScope
        );

        if (isValidType(fun) && fun instanceof FunctionType) {
          node.resolvedFunctionType = fun;

          if (!this.canBeAssigned(fun.signature.returnType!, booleanType, nodeScope)) {
            this.messageCollector.error(new TypeMismatch(fun.signature.returnType!, booleanType, node));
          }
        } else {
          this.messageCollector.error(new TypeMismatch(carryType, argumentType, node.literal));
          this.messageCollector.error(new UnreachableCode(node.rhs));
          this.stashNodeAnnotation(node.rhs, new annotations.IsUnreachable());
        }
      }
    } else if (node instanceof Nodes.MatchCaseIsNode) {
      const argumentType = this.getTypeTypeType(
        node.typeReference,
        this.getType(node.typeReference),
        this.messageCollector
      );

      if (!isValidType(argumentType)) {
        return;
      }

      if (node.declaredName) {
        this.setType(node.declaredName, argumentType);
      }

      if (!this.canBeAssigned(carryType, RefType.instance, nodeScope)) {
        this.messageCollector.error(
          `"is" expression can only be used with reference types, used with: "${carryType}"`,
          node.astNode
        );
      } else if (
        !this.canBeAssigned(carryType, argumentType, nodeScope) &&
        !this.canBeAssigned(argumentType, carryType, nodeScope)
      ) {
        this.messageCollector.error(new TypeMismatch(carryType, argumentType, node.typeReference));
        this.messageCollector.error(new UnreachableCode(node.rhs));
        this.stashNodeAnnotation(node.rhs, new annotations.IsUnreachable());
      } else {
        const eqFunction = this.resolveTypeMember(
          node.typeReference,
          argumentType,
          'is',
          this.messageCollector,
          nodeScope
        );

        if (eqFunction) {
          const fun = this.findFunctionOverload(
            eqFunction,
            [argumentType],
            node,
            null,
            false,
            new MessageCollector(),
            false,
            nodeScope
          );

          if (isValidType(fun) && fun instanceof FunctionType) {
            node.resolvedFunctionType = fun;

            if (!this.canBeAssigned(fun.signature.returnType!, booleanType, nodeScope)) {
              this.messageCollector.error(new TypeMismatch(fun.signature.returnType!, booleanType, node));
            }

            this.removeTypeFromMatcherFlow(parent, argumentType);
          } else {
            this.messageCollector.error(new TypeMismatch(carryType, argumentType, node.typeReference));
            this.messageCollector.error(new UnreachableCode(node.rhs));
            this.stashNodeAnnotation(node.rhs, new annotations.IsUnreachable());
          }
        }
      }
    }

    const result = this.getType(node.rhs);

    if (node.hasAnnotation(annotations.IsValueNode)) {
      this.setType(node, result);
    } else {
      this.setType(node, InjectableTypes.void);
    }
  }

  private annotateImplicitCall(
    nodeToAnnotate: Nodes.Node,
    fun: FunctionType,
    argumentNodes: Nodes.ExpressionNode[],
    messageCollector: MessageCollector,
    scope: Scope
  ) {
    const oldAnnotation = this.getStashedNodeAnnotation(nodeToAnnotate, annotations.ImplicitCall);
    const newAnnotation = new annotations.ImplicitCall(
      this.createImplicitCall(nodeToAnnotate, fun, argumentNodes, messageCollector, scope)
    );
    if (oldAnnotation) {
      if (!fun.equals(oldAnnotation.implicitCall.resolvedFunctionType!)) {
        messageCollector.error(
          new LysTypeError(`This node already has an ${oldAnnotation} trying to add ${newAnnotation}`, nodeToAnnotate)
        );
      }
    } else {
      this.stashNodeAnnotation(nodeToAnnotate, newAnnotation);
    }
  }

  private removeTypeFromMatcherFlow(node: Nodes.PatternMatcherNode, typeToRemove: Type) {
    let carryType = node.carryType;

    if (!isValidType(carryType)) {
      return;
    }

    if (!isValidType(typeToRemove)) {
      return;
    }

    if (carryType instanceof UnionType) {
      carryType = carryType.expand(node.scope!);
    } else {
      carryType = UnionType.of(carryType).expand(node.scope!);
    }

    let matchingValueType = carryType instanceof UnionType ? carryType : UnionType.of(carryType);

    const newType = matchingValueType.subtract(typeToRemove, node.scope!);
    matchingValueType = UnionType.of(newType);

    node.carryType = matchingValueType.simplify(node.scope!);
  }

  private getTypeTypeType(node: Nodes.Node, type: Type | null, messageCollector: MessageCollector): Type | null {
    if (type instanceof TypeType) {
      return type.of;
    } else {
      if (type) {
        messageCollector.errorIfBranchDoesntHaveAny(new NotAValidType(node, type));
      }
      return null;
    }
  }

  private getTypeFromTypeNode(node: Nodes.Node, messageCollector: MessageCollector): Type | null {
    if (node instanceof Nodes.ReferenceNode) {
      return this.getTypeTypeType(node, TypeHelpers.getNodeType(node), messageCollector);
    } else if (
      node instanceof Nodes.FunctionTypeNode ||
      node instanceof Nodes.IntersectionTypeNode ||
      node instanceof Nodes.UnionTypeNode ||
      node instanceof Nodes.InjectedTypeNode ||
      node instanceof Nodes.StructTypeNode ||
      node instanceof Nodes.StackTypeNode
    ) {
      return TypeHelpers.getNodeType(node);
    } else {
      messageCollector.errorIfBranchDoesntHaveAny(new NotAValidType(node, null));

      return null;
    }
  }

  private resolveTypeMember(
    errorNode: Nodes.Node | null,
    type: Type,
    memberName: string,
    messageCollector: MessageCollector,
    scope: Scope
  ): Type | false {
    if (type && type instanceof TypeAlias) {
      const types = type.getTypeMember(memberName, $ => this.getType($));

      if (types.length) {
        const ret: Type[] = [];

        for (let result of types) {
          const [referencedNode, memberType] = result;

          const parent = referencedNode.parent;

          if (!isValidType(memberType)) {
            return false;
          }

          if (parent && parent instanceof Nodes.DirectiveNode) {
            if (!parent.isPublic) {
              const declScope = referencedNode.scope;

              if (!declScope) {
                if (errorNode) {
                  messageCollector.error(new LysTypeError(`Name's parent has no scope`, type.name));
                }
                return false;
              }

              if (!scope) {
                if (errorNode) {
                  messageCollector.error(new LysTypeError(`Scope is null`, errorNode));
                  console.trace();
                }
                return false;
              }

              if (!scope.isDescendantOf(declScope)) {
                if (errorNode) {
                  messageCollector.error(
                    new LysTypeError(`Name "${memberName}" is private in ${type.name.name}`, errorNode)
                  );
                }
                continue;
              }
            }
          }

          ret.push(memberType);
        }

        if (ret.length > 1) {
          return new IntersectionType(ret).simplify();
        }

        if (ret.length === 1) {
          return ret[0];
        }

        if (errorNode) {
          messageCollector.errorIfBranchDoesntHaveAny(new LysTypeError(`Type is not ready`, errorNode));
        }

        return false;
      } else {
        if (errorNode) {
          messageCollector.error(
            new LysTypeError(`Property "${memberName}" doesn't exist on type "${type}".`, errorNode)
          );
        }
        // Since the members are calculated in the scope phase we return
        // `never` type so the type check execution can continue
        return InjectableTypes.never;
      }
    } else {
      if (errorNode) {
        if (!NeverType.isNeverType(type)) {
          messageCollector.error(
            new LysTypeError(`Type ${type.inspect(10)} has no members. Members are stored in type aliases.`, errorNode)
          );
        }
      }
    }
    return false;
  }

  private findFunctionOverload(
    incommingType: Type,
    argTypes: Type[],
    errorNode: Nodes.Node | null,
    returnType: Type | null,
    strict: boolean,
    messageCollector: MessageCollector,
    automaticCoercion: boolean,
    scope: Scope
  ): Type | null {
    if (incommingType instanceof TypeType) {
      return this.findFunctionOverload(
        incommingType.of,
        argTypes,
        errorNode,
        returnType,
        strict,
        messageCollector,
        automaticCoercion,
        scope
      );
    }
    if (incommingType instanceof IntersectionType) {
      const matchList: { fun: FunctionType; score: number; casts: (FunctionType | null)[] }[] = [];

      for (let fun of incommingType.of) {
        if (fun instanceof FunctionType) {
          if (strict) {
            if (this.acceptsTypes(fun.signature, argTypes, strict, automaticCoercion, scope)) {
              if (!returnType || fun.signature.returnType!.equals(returnType)) {
                return fun;
              }
            }
          } else {
            const result = this.acceptsTypes(fun.signature, argTypes, strict, automaticCoercion, scope);
            if (result) {
              if (!returnType || this.canBeAssigned(fun.signature.returnType!, returnType, scope)) {
                matchList.push({ fun, score: result.score, casts: result.casts });
              }
            }
          }
        } else {
          if (errorNode) {
            messageCollector.error(new NotAFunction(fun, errorNode));
          }
          return null;
        }
      }

      if (matchList.length === 1) {
        return matchList[0].fun;
      } else if (matchList.length > 1) {
        matchList.sort((a, b) => {
          if (a.score < b.score) {
            return 1;
          } else if (a.score > b.score) {
            return -1;
          } else {
            return 0;
          }
        });

        if (matchList[0].score > matchList[1].score) {
          return matchList[0].fun;
        }

        let selectedOverload = 0;

        if (errorNode) {
          messageCollector.warning(
            `Implicit overload with ambiguity.\nPicking overload ${matchList[
              selectedOverload
            ].fun.toString()} for types (${argTypes
              .map($ => $.toString())
              .join(', ')})\nComplete list of overloads:\n${matchList
              .map($ => '  ' + $.fun.toString() + ' score: ' + $.score)
              .join('\n')}`,
            errorNode
          );
        }

        return matchList[selectedOverload].fun;
      }

      if (errorNode) {
        if (incommingType.of.length > 1) {
          messageCollector.error(new InvalidOverload(incommingType, argTypes, errorNode));
        } else {
          const fun = incommingType.of[0] as FunctionType;
          messageCollector.error(new InvalidCall(fun.signature.parameterTypes, argTypes, errorNode));
        }

        return null;
      }

      return new UnionType((incommingType.of as FunctionType[]).map(($: FunctionType) => $.signature.returnType!));
    } else if (incommingType instanceof FunctionType) {
      const queryResult = this.acceptsTypes(incommingType.signature, argTypes, strict, automaticCoercion, scope);

      if (!queryResult) {
        if (errorNode) {
          messageCollector.error(new InvalidCall(incommingType.signature.parameterTypes, argTypes, errorNode));
        } else {
          return null;
        }
      }

      return incommingType;
    } else if (incommingType instanceof FunctionSignatureType) {
      const queryResult = this.acceptsTypes(incommingType, argTypes, strict, automaticCoercion, scope);

      if (!queryResult) {
        if (errorNode) {
          messageCollector.error(new InvalidCall(incommingType.parameterTypes, argTypes, errorNode));
        } else {
          return null;
        }
      }

      return incommingType;
    } else {
      if (errorNode && !NeverType.isNeverType(incommingType)) {
        messageCollector.error(new NotAFunction(incommingType, errorNode));
      }
      return null;
    }
  }

  private findImplicitTypeCasting(
    errorNode: Nodes.Node | null,
    from: Type,
    to: Type,
    messageCollector: MessageCollector,
    scope: Scope
  ): FunctionType | null {
    if (this.canBeAssigned(from, to, scope)) {
      return null;
    }
    if (from instanceof TypeAlias) {
      try {
        const fnType = this.resolveTypeMember(errorNode, from, 'as', messageCollector, scope);

        if (fnType) {
          const fun = this.findFunctionOverload(fnType, [from], null, to, true, messageCollector, true, scope);

          if (fun instanceof FunctionType) {
            if (!fun.name.hasAnnotation(annotations.Explicit)) {
              if (this.canBeAssigned(fun.signature.returnType!, to, scope)) {
                return fun;
              }
            }
          }
        }
      } catch (e) {
        return null;
      }
    }

    return null;
  }

  private sizeInBytes(type: Type, defaultSize: number) {
    if (type instanceof StackType) {
      return type.byteSize;
    }
    if (type instanceof RefType) {
      return type.byteSize;
    }
    switch (type.binaryenType) {
      case NativeTypes.i32:
      case NativeTypes.f32:
        return 4;
      case NativeTypes.i64:
      case NativeTypes.f64:
        return 8;
    }
    return defaultSize;
  }

  private acceptsTypes(
    type: FunctionSignatureType,
    types: Type[],
    strict: boolean,
    automaticCoercion: boolean,
    scope: Scope
  ): { score: number; casts: (FunctionType | null)[] } | null {
    if (type.parameterTypes.length !== types.length) {
      return null;
    }

    let score = 1;
    let casts: (FunctionType | null)[] = [];

    if (type.parameterTypes.length === 0) {
      return { score: Infinity, casts: [] };
    }

    for (let index = 0; index < types.length; index++) {
      const argumentType = types[index];
      const parameterType = type.parameterTypes[index];

      const equals = argumentType.equals(parameterType);

      if (equals) {
        score += 1;
        casts.push(null);
      } else if (!strict) {
        const cleanAssignation = this.canBeAssigned(argumentType, parameterType, scope);

        if (cleanAssignation) {
          score += this.getTypeSimilarity(argumentType, parameterType);
        } else if (automaticCoercion) {
          try {
            const implicitCast = this.findImplicitTypeCasting(
              null,
              argumentType,
              parameterType,
              new MessageCollector(),
              scope
            );

            if (implicitCast) {
              casts.push(implicitCast);
              const dataLossInBytes = this.sizeInBytes(parameterType, 0) / this.sizeInBytes(argumentType, 1);
              if (isNaN(dataLossInBytes)) return null;
              score += 0.5 * Math.min(((types.length - index) / types.length) * dataLossInBytes, 1);
            } else {
              return null;
            }
          } catch {
            return null;
          }
        } else {
          return null;
        }
      } else {
        return null;
      }
    }

    return {
      score,
      casts
    };
  }

  private downToRefTypes(type: Type): (RefType | StructType)[] {
    let argType = type;

    while (true) {
      if (argType instanceof StructType) {
        return [argType];
      } else if (argType instanceof RefType) {
        return [argType];
      } else if (argType instanceof TypeAlias) {
        argType = argType.of;
      } else if (argType instanceof UnionType) {
        return flatten(argType.of.map($ => this.downToRefTypes($)));
      } else {
        return [];
      }
    }
  }

  private getTypeSimilarity(lhs: Type, rhs: Type) {
    if (rhs.equals(lhs) && lhs.equals(rhs)) {
      return 1;
    }

    const lhsTypes = this.downToRefTypes(lhs);
    if (lhsTypes.length === 0) return 0;

    const rhsTypes = this.downToRefTypes(rhs);
    if (rhsTypes.length === 0) return 0;

    let results: number[] = [];

    lhsTypes.forEach(lhs => rhsTypes.forEach(rhs => results.push(lhs.typeSimilarity(rhs))));

    return Math.max.apply(Math, results);
  }

  private canBeAssigned(sourceType: Type, targetType: Type, scope: Scope): boolean {
    if (!sourceType || !sourceType.canBeAssignedTo) {
      console.trace();
      console.log(sourceType, sourceType.toString());
      console.log(sourceType.inspect(10));
    }
    return sourceType.canBeAssignedTo(targetType, scope);
  }

  private ensureCanBeAssignedWithImplicitConversion(
    sourceType: Type,
    targetType: Type,
    node: Nodes.ExpressionNode,
    messageCollector: MessageCollector,
    scope: Scope
  ) {
    if (
      sourceType instanceof IntersectionType &&
      targetType instanceof FunctionSignatureType &&
      this.canBeAssigned(sourceType, targetType, scope)
    ) {
      for (let fun of sourceType.of) {
        if (this.canBeAssigned(fun, targetType, scope)) {
          if (fun instanceof FunctionType) {
            const currentAnnotation = this.getStashedNodeAnnotation(node, annotations.FunctionInTable);
            if (currentAnnotation) {
              currentAnnotation.nameIdentifier = fun.name;
            } else {
              this.stashNodeAnnotation(node, new annotations.FunctionInTable(fun.name));
            }
          }
          return { node, type: targetType };
        }
      }
    } else if (this.canBeAssigned(sourceType, targetType, scope)) {
      return { node, type: targetType };
    } else {
      const implicitCast = this.findImplicitTypeCasting(node, sourceType, targetType, new MessageCollector(), scope);

      if (implicitCast) {
        return { node: this.createImplicitCall(node, implicitCast, [node], messageCollector, scope), type: targetType };
      }
    }

    messageCollector.error(new TypeMismatch(sourceType, targetType, node));
    return { node, type: targetType };
  }

  private createImplicitCall(
    node: Nodes.Node,
    fun: FunctionType,
    args: Nodes.ExpressionNode[],
    messageCollector: MessageCollector,
    scope: Scope
  ) {
    const functionCallNode = new Nodes.InjectedFunctionCallNode(node.astNode);
    functionCallNode.scope = node.scope;
    functionCallNode.argumentsNode = args;
    functionCallNode.annotate(new annotations.Injected());
    functionCallNode.resolvedFunctionType = fun;
    this.ensureArgumentCoercion(
      functionCallNode,
      fun.signature,
      args.map($ => this.getType($)!),
      messageCollector,
      scope
    );

    TypeHelpers.setNodeType(functionCallNode, fun.signature.returnType!);
    return functionCallNode;
  }

  private ensureArgumentCoercion(
    node: Nodes.AbstractFunctionCallNode,
    fun: FunctionSignatureType,
    argsTypes: Type[],
    messageCollector: MessageCollector,
    scope: Scope
  ) {
    node.argumentsNode.forEach((argNode, i) => {
      const argType = argsTypes[i];

      if (argType) {
        const ret = this.ensureCanBeAssignedWithImplicitConversion(
          argType,
          fun.parameterTypes[i],
          argNode,
          messageCollector,
          scope
        );
        node.argumentsNode[i] = ret.node;
      } else {
        messageCollector.error(new LysTypeError('type is undefined', node.argumentsNode[i]));
      }
    });
  }

  private describeProperty(type: Type): LysPropertyDescription | void {
    if (type instanceof FunctionType) {
      return {
        type,
        method: type.name.hasAnnotation(annotations.Method),
        getter: type.name.hasAnnotation(annotations.Getter),
        setter: type.name.hasAnnotation(annotations.Setter)
      };
    }
    if (type instanceof IntersectionType) {
      const ret: LysPropertyDescription = {
        type,
        getter: false,
        setter: false,
        method: false
      };

      type.of
        .map($ => this.describeProperty($))
        .forEach($ => {
          if ($) {
            ret.getter = ret.getter || $.getter;
            ret.setter = ret.setter || $.setter;
            ret.method = ret.method || $.method;
          }
        });
      if (ret.getter || ret.setter || ret.method) {
        return ret;
      }
    }
    return void 0;
  }
}
