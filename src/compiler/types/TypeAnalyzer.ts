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
  UNRESOLVED_TYPE
} from '../types';
import {
  processFunctionCall,
  findFunctionOverload,
  annotateImplicitCall,
  ensureCanBeAssignedWithImplicitConversion,
  canBeAssigned,
  isValidType,
  getTypeTypeType,
  resolveTypeMember,
  getTypeFromTypeNode
} from './typeHelpers';
import { annotations } from '../annotations';
import {
  UnexpectedType,
  NotAValidType,
  LysTypeError,
  CannotInferReturnType,
  UnreachableCode,
  TypeMismatch
} from '../NodeError';
import { last } from '../helpers';
import { MessageCollector } from '../MessageCollector';
import { printAST } from '../../utils/astPrinter';
import { getDocument } from '../phases/helpers';

export const DEBUG_TYPES = process.env.DEBUG_TYPES === '1' || process.env.DEBUG_TYPES === 'true';

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

export abstract class TypeResolver {
  public didAnalysisChange = false;

  private nonResolvedNodes = new Set<Nodes.Node>();

  private readonly walk = walkPreOrder(this.onEnterNode.bind(this), this.onLeaveNode.bind(this));

  constructor(
    public documentNode: Nodes.DocumentNode,
    public parsingContext: ParsingContext,
    public messageCollector: MessageCollector
  ) {}

  analyze() {
    this.didAnalysisChange = false;

    this.messageCollector.errors.length = 0;
    this.nonResolvedNodes.clear();

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

  protected abstract onLeaveNode(node: Nodes.Node): void | boolean;

  protected abstract onEnterNode(_node: Nodes.Node): void;

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

  protected getType(node: Nodes.Node): Type | null {
    const type = TypeHelpers.getNodeType(node);

    return type;
  }

  protected setAnalysisChanged() {
    this.didAnalysisChange = true;
  }
}

export class TypeAnalyzer extends TypeResolver {
  protected onLeaveNode(node: Nodes.Node) {
    if (node instanceof Nodes.MatcherNode) {
      this.processMatcherNode(node);
    } else if (node instanceof Nodes.LiteralNode) {
      if (node.resolvedReference) {
        const type = this.getType(node.resolvedReference.referencedNode);
        this.setType(node, getTypeTypeType(node, type, this.messageCollector));
      }
    } else if (node instanceof Nodes.ReferenceNode) {
      if (node.resolvedReference) {
        const type = this.getType(node.resolvedReference.referencedNode);

        if (isValidType(type)) {
          if (type instanceof TypeType && node.hasAnnotation(annotations.IsValueNode)) {
            if (type.of instanceof TypeAlias) {
              const fnType = resolveTypeMember(node, type.of, 'apply', this.messageCollector);
              // TODO: a better error would be X is not callable
              if (fnType) {
                const fun = findFunctionOverload(fnType, [], node, null, false, this.messageCollector, true);

                if (isValidType(fun) && fun instanceof FunctionType) {
                  annotateImplicitCall(node, fun, [], this.messageCollector);

                  if (fun.returnType) {
                    this.setType(node, fun.returnType);
                    return;
                  }
                }
                this.messageCollector.errorIfBranchDoesntHaveAny(type.inspect(100), node);
              }
            }
            this.messageCollector.error(new UnexpectedType(type, node));
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
        this.messageCollector.errorIfBranchDoesntHaveAny('Unable to resolve name 2', node);
      }
    } else if (node instanceof Nodes.IsExpressionNode) {
      const booleanType = node.booleanReference
        ? getTypeTypeType(node, this.getType(node.booleanReference.referencedNode), this.messageCollector)
        : null;

      const lhsType = this.getType(node.lhs);
      const rhsType = getTypeTypeType(node.rhs, this.getType(node.rhs), this.messageCollector);

      if (isValidType(lhsType)) {
        if (!canBeAssigned(lhsType, RefType.instance)) {
          this.messageCollector.error(
            `"is" expression can only be used with reference types, used with: "${lhsType}"`,
            node.astNode
          );
          this.setType(node, booleanType);
          return;
        }

        if (isValidType(rhsType)) {
          if (!canBeAssigned(rhsType, lhsType) && !canBeAssigned(lhsType, rhsType)) {
            this.messageCollector.error(
              `This statement is always false, type "${lhsType}" can never be "${rhsType}"`,
              node.astNode
            );
            this.setType(node, booleanType);
            return;
          }

          const valueType = resolveTypeMember(node.rhs, rhsType, 'is', this.messageCollector);

          if (valueType) {
            const fun = findFunctionOverload(valueType!, [rhsType], node, null, false, this.messageCollector, false);

            if (fun instanceof FunctionType) {
              node.resolvedFunctionType = fun;
              this.setType(node, fun.returnType!);
              return;
            } else {
              this.setType(node, booleanType);
            }
          } else {
            this.setType(node, booleanType);
          }
        } else {
          this.messageCollector.error(`Error with "is"`, node.rhs.astNode);
          this.setType(node, booleanType);
        }
      } else {
        this.messageCollector.error(`Error with "is"`, node.lhs.astNode);
        this.setType(node, booleanType);
      }
    } else if (node instanceof Nodes.AsExpressionNode) {
      const lhsType = this.getType(node.lhs);

      if (isValidType(lhsType)) {
        const rhsType = getTypeTypeType(node.rhs, this.getType(node.rhs), this.messageCollector);
        if (isValidType(rhsType)) {
          if (lhsType.equals(rhsType) && rhsType.equals(lhsType)) {
            this.messageCollector.warning(`This cast is useless "${lhsType}" as "${rhsType}"`, node);
            if (!node.hasAnnotation(annotations.ByPassFunction)) {
              node.annotate(new annotations.ByPassFunction());
            }
            this.setType(node, rhsType);
            return;
          }

          const memberType = resolveTypeMember(node.lhs, lhsType, 'as', this.messageCollector);

          if (memberType) {
            const fun = findFunctionOverload(
              memberType,
              [lhsType],
              node,
              rhsType,
              false,
              new MessageCollector(),
              false
            );

            if (fun instanceof FunctionType && isValidType(fun.returnType)) {
              node.resolvedFunctionType = fun;

              this.setType(node, fun.returnType!);
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
        const memberType = resolveTypeMember(node, lhsType, memberName, this.messageCollector);

        if (memberType) {
          if (isValidType(rhsType)) {
            const argTypes = [lhsType, rhsType];
            const result = processFunctionCall(node, memberType, argTypes, this.messageCollector);

            if (isValidType(result)) {
              this.setType(node, result);
              return;
            } else {
              this.messageCollector.errorIfBranchDoesntHaveAny('Cannot resolve result type', node);
            }
          } else {
            this.messageCollector.errorIfBranchDoesntHaveAny('Cannot resolve type 3', node.rhs);
          }
        }
        this.setType(node, UNRESOLVED_TYPE);
      } else {
        this.messageCollector.errorIfBranchDoesntHaveAny('Cannot resolve type 4 ' + printAST(node.lhs), node.lhs);
        this.setType(node, UNRESOLVED_TYPE);
      }
    } else if (node instanceof Nodes.UnaryExpressionNode) {
      const rhsType = this.getType(node.rhs);

      if (isValidType(rhsType)) {
        const memberName = node.operator.name;
        const memberType = resolveTypeMember(node, rhsType, memberName, this.messageCollector);

        if (memberType) {
          const argTypes = [rhsType];
          const result = processFunctionCall(node, memberType, argTypes, new MessageCollector());

          if (isValidType(result)) {
            this.setType(node, result);
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
        ? getTypeTypeType(node.condition, this.getType(node.booleanReference.referencedNode), this.messageCollector)
        : null;

      const truePart = this.getType(node.truePart);

      if (condition) {
        if (booleanType) {
          ensureCanBeAssignedWithImplicitConversion(condition, booleanType, node.condition!, this.messageCollector);
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
            this.setType(node, new UnionType([truePart, falsePart]).simplify());
          } else {
            this.messageCollector.error('Else not resolved', node.astNode);
            this.setType(node, new UnionType([truePart, UNRESOLVED_TYPE]).simplify());
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
        if (node.lhs.hasAnnotation(annotations.ImplicitCall)) {
          this.messageCollector.error('!!! This node already has a ImplicitCall', node.lhs.astNode);
          return;
        }

        const memberLhsType = this.getType(node.lhs.lhs)!;

        const fun = findFunctionOverload(
          lhsType,
          [memberLhsType, rhsType],
          node.lhs,
          null,
          false,
          this.messageCollector,
          true
        );

        if (isValidType(fun) && fun instanceof FunctionType) {
          annotateImplicitCall(node, fun, [node.lhs.lhs!, node.rhs!], this.messageCollector);

          this.setType(node, fun.returnType!);
        } else {
          this.messageCollector.error('Overload not found', node.rhs!.astNode);
          this.setType(node, UNRESOLVED_TYPE);
          return;
        }
      } else if (node.lhs instanceof Nodes.BinaryExpressionNode) {
        if (node.lhs.hasAnnotation(annotations.ImplicitCall)) {
          this.messageCollector.error('!!! This node already has a ImplicitCall', node.lhs.astNode);
          return;
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

        const fun = findFunctionOverload(
          lhsType,
          [memberLhsType, memberRhsType, rhsType],
          node.lhs,
          null,
          false,
          this.messageCollector,
          true
        );

        if (isValidType(fun) && fun instanceof FunctionType) {
          annotateImplicitCall(node, fun, [node.lhs.lhs, node.lhs.rhs, node.rhs], this.messageCollector);

          this.setType(node, fun.returnType!);
        } else {
          this.messageCollector.error('Overload not found', node.rhs!.astNode);
        }
      } else {
        const result = ensureCanBeAssignedWithImplicitConversion(rhsType, lhsType, node.rhs!, this.messageCollector);

        if (!NeverType.isNeverType(rhsType) && rhsType.nativeType === NativeTypes.void) {
          this.messageCollector.error(
            'The expression returns a void value, which cannot be assigned to any value',
            node.rhs!.astNode
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
        const argumentTypes = node.argumentsNode.map($ => this.getType($));

        const validArguments = argumentTypes.every($ => isValidType($));

        if (validArguments && isValidType(functionType)) {
          const result = processFunctionCall(node, functionType, argumentTypes as Type[], this.messageCollector);

          if (isValidType(result)) {
            this.setType(node, result);
          } else {
            this.setType(node, UNRESOLVED_TYPE);
          }
        }
      } else {
        this.messageCollector.errorIfBranchDoesntHaveAny('Not a function', node.functionNode);
      }
    } else if (node instanceof Nodes.FunctionNode) {
      const functionType = new FunctionType(node.functionName);

      node.parameters.forEach(($, ix) => {
        const parameterType = this.getType($.parameterName);
        functionType.parameterNames[ix] = $.parameterName.name;
        functionType.parameterTypes[ix] = parameterType!;
      });

      const retType = node.functionReturnType
        ? getTypeFromTypeNode(node.functionReturnType, this.messageCollector)
        : null;

      const inferedReturnType = node.body ? this.getType(node.body) : null;

      if (isValidType(retType)) {
        functionType.returnType = retType;
      } else {
        this.messageCollector.errorIfBranchDoesntHaveAny('Cannot resolve return type', node.functionReturnType || node);
      }

      this.setType(node.functionName, functionType);

      if (inferedReturnType) {
        if (inferedReturnType instanceof TypeType) {
          this.messageCollector.error(new UnexpectedType(inferedReturnType, node.body!));
        } else {
          ensureCanBeAssignedWithImplicitConversion(
            inferedReturnType,
            functionType.returnType!,
            node.body!,
            this.messageCollector
          );
        }
      } else {
        this.messageCollector.errorIfBranchDoesntHaveAny(new CannotInferReturnType(node.body || node));
      }
    } else if (node instanceof Nodes.ParameterNode) {
      // TODO: const valueType = TypeHelpers.getNodeType(node.defaultValue);
      // TODO: verify assignability

      const typeType = node.parameterType ? getTypeFromTypeNode(node.parameterType, this.messageCollector) : null;

      if (isValidType(typeType)) {
        this.setType(node.parameterName, typeType);
      } else {
        this.messageCollector.errorIfBranchDoesntHaveAny('Cannot infer type 6' + typeType, node);
      }
    } else if (node instanceof Nodes.VarDeclarationNode) {
      const valueType = TypeHelpers.getNodeType(node.value);
      const typeType = node.variableType ? getTypeFromTypeNode(node.variableType, this.messageCollector) : null;

      if (node.variableType) {
        if (isValidType(valueType) && isValidType(typeType)) {
          const ret = ensureCanBeAssignedWithImplicitConversion(valueType, typeType, node.value, this.messageCollector);
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

          if (node.memberName!.name! in allowedTypeSchemas) {
            this.setType(node, allowedTypeSchemas[node.memberName!.name!]);
            return;
          } else {
            const keys = Object.keys(allowedTypeSchemas);

            if (keys.length) {
              this.messageCollector.error(
                new LysTypeError(`Invalid schema property. Available options: ${keys.join(', ')}`, node.memberName!)
              );
            } else {
              this.messageCollector.error(new LysTypeError(`The type "${lhsType}" has no schema`, node.lhs!));
            }
          }
        } else {
          this.messageCollector.errorIfBranchDoesntHaveAny(new NotAValidType(node.lhs));
        }

        this.setType(node, UNRESOLVED_TYPE);
      } else {
        if (lhsType instanceof TypeType) {
          const memberName = node.memberName.name;
          const memberType = resolveTypeMember(node.memberName, lhsType.of, memberName, this.messageCollector);

          if (memberType) {
            this.setType(node, memberType);
          } else {
            this.setType(node, UNRESOLVED_TYPE);
          }
        } else if (lhsType instanceof TypeAlias) {
          const memberName = 'property_' + node.memberName.name;
          const memberType = resolveTypeMember(node.memberName, lhsType, memberName, this.messageCollector);

          if (memberType) {
            const isGetter = !node.hasAnnotation(annotations.IsAssignationLHS);
            if (isGetter) {
              const fun = findFunctionOverload(memberType, [lhsType], node, null, false, this.messageCollector, false);

              if (isValidType(fun) && fun instanceof FunctionType) {
                annotateImplicitCall(node, fun, [node.lhs], this.messageCollector);

                this.setType(node, fun.returnType!);
              } else {
                this.messageCollector.error(
                  new LysTypeError(`${lhsType}.${memberName} is not a valid property getter`, node.memberName)
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
            node.memberName!
          );
        }
      }
    } else if (node instanceof Nodes.TypeDirectiveNode) {
      const valueType = node.valueType ? this.getType(node.valueType) : InjectableTypes.never;

      if (isValidType(valueType)) {
        const type = createTypeAlias(node.variableName, valueType, this.parsingContext);

        this.setType(node.variableName, TypeType.of(type));
      } else {
        this.messageCollector.errorIfBranchDoesntHaveAny('Invalid type', node.valueType || node);
      }
    } else if (node instanceof Nodes.IntersectionTypeNode) {
      const of = node.of.map($ => getTypeTypeType($, this.getType($), this.messageCollector)) as Type[];
      this.setType(node, new IntersectionType(of));
    } else if (node instanceof Nodes.UnionTypeNode) {
      const of = node.of.map($ => getTypeTypeType($, this.getType($), this.messageCollector)) as Type[];
      this.setType(node, new UnionType(of));
    } else if (node instanceof Nodes.OverloadedFunctionNode) {
      const incomingTypes = node.functions.map(fun => {
        if (!fun.functionNode!.hasAnnotation(annotations.IsOverloaded)) {
          fun.functionNode!.annotate(new annotations.IsOverloaded());
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

        const retType = UnionType.of(node.matchingSet.map($ => this.getType($)!)).simplify();

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

  private processMatcherNode(node: Nodes.MatcherNode) {
    const carryType = node.parent!.carryType || this.getType(node.parent!.lhs);

    if (!isValidType(carryType)) {
      return;
    }

    if (!node.parent!.carryType) {
      node.parent!.carryType = carryType;
    }

    const booleanType = node.booleanReference
      ? getTypeTypeType(node, this.getType(node.booleanReference.referencedNode), this.messageCollector)
      : null;

    if (!isValidType(booleanType)) {
      return;
    }

    if (NeverType.isNeverType(carryType)) {
      this.messageCollector.error(new UnreachableCode(node.rhs));
      this.messageCollector.error(carryType.inspect(10), node.rhs.astNode);
      node.rhs.annotate(new annotations.IsUnreachable());
      this.setType(node, UNRESOLVED_TYPE);
      return;
    }

    if (node instanceof Nodes.MatchDefaultNode) {
      this.removeTypeFromMatcherFlow(node.parent!, carryType);
    } else if (node instanceof Nodes.MatchLiteralNode) {
      const argumentType = this.getType(node.literal);

      if (!isValidType(argumentType)) {
        return;
      }

      const eqFunction = resolveTypeMember(node.literal, carryType, '==', this.messageCollector);

      if (eqFunction) {
        const argTypes = [carryType, argumentType];

        const fun = findFunctionOverload(eqFunction, argTypes, node.literal, null, false, new MessageCollector(), true);

        if (isValidType(fun) && fun instanceof FunctionType) {
          node.resolvedFunctionType = fun;

          if (!fun.returnType!.canBeAssignedTo(booleanType!)) {
            this.messageCollector.error(new TypeMismatch(fun.returnType!, booleanType, node));
          }
        } else {
          this.messageCollector.error(new TypeMismatch(carryType, argumentType, node.literal));
          this.messageCollector.error(new UnreachableCode(node.rhs));
          node.rhs.annotate(new annotations.IsUnreachable());
        }
      }
    } else if (node instanceof Nodes.MatchCaseIsNode) {
      const argumentType = getTypeTypeType(node.typeReference, this.getType(node.typeReference), this.messageCollector);

      if (!isValidType(argumentType)) {
        return;
      }

      if (node.declaredName) {
        this.setType(node.declaredName, argumentType);
      }

      if (!canBeAssigned(carryType, RefType.instance)) {
        this.messageCollector.error(
          `"is" expression can only be used with reference types, used with: "${carryType}"`,
          node.astNode
        );
      } else if (!canBeAssigned(carryType, argumentType) && !canBeAssigned(argumentType, carryType)) {
        this.messageCollector.error(new TypeMismatch(carryType, argumentType, node.typeReference));
        this.messageCollector.error(new UnreachableCode(node.rhs));
        node.rhs.annotate(new annotations.IsUnreachable());
      } else {
        const eqFunction = resolveTypeMember(node.typeReference, argumentType, 'is', this.messageCollector);

        if (eqFunction) {
          const fun = findFunctionOverload(
            eqFunction,
            [argumentType],
            node,
            null,
            false,
            new MessageCollector(),
            false
          );

          if (isValidType(fun) && fun instanceof FunctionType) {
            node.resolvedFunctionType = fun;

            if (!fun.returnType!.canBeAssignedTo(booleanType!)) {
              this.messageCollector.error(new TypeMismatch(fun.returnType!, booleanType, node));
            }

            this.removeTypeFromMatcherFlow(node.parent!, argumentType);
          } else {
            this.messageCollector.error(new TypeMismatch(carryType, argumentType, node.typeReference));
            this.messageCollector.error(new UnreachableCode(node.rhs));
            node.rhs.annotate(new annotations.IsUnreachable());
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

  private removeTypeFromMatcherFlow(node: Nodes.PatternMatcherNode, typeToRemove: Type) {
    let carryType = node.carryType;

    if (!isValidType(carryType)) {
      return;
    }

    if (!isValidType(typeToRemove)) {
      return;
    }

    if (carryType instanceof UnionType) {
      carryType = carryType.expand();
    } else {
      carryType = UnionType.of(carryType).expand();
    }

    let matchingValueType = carryType instanceof UnionType ? carryType : UnionType.of(carryType);

    const newType = matchingValueType.subtract(typeToRemove);
    matchingValueType = UnionType.of(newType);

    node.carryType = matchingValueType.simplify();
  }
}
