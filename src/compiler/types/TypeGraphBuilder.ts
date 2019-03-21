import { TypeNode, TypeGraph, TypeResolver, Edge, LiteralTypeResolver } from './TypeGraph';
import { Nodes } from '../nodes';
import {
  getTypeResolver,
  EdgeLabels,
  TypeFromTypeResolver,
  VarDeclarationTypeResolver,
  TypeDirectiveResolver,
  ParameterTypeResolver
} from './typeResolvers';
import { Type, TypeAlias, InjectableTypes } from '../types';
import { AstNodeError } from '../NodeError';
import { Reference } from '../Reference';
import { ParsingContext } from '../ParsingContext';
import { MessageCollector } from '../MessageCollector';
import { annotations } from '../annotations';

export class TypeGraphBuilder {
  _nodeMap = new Map<Nodes.Node, TypeNode>();
  _referenceNode: { reference: Reference; result: TypeNode; edgeName?: string }[] = [];

  constructor(
    public parsingContext: ParsingContext,
    public parentGraph: TypeGraph,
    public messageCollector: MessageCollector = parsingContext.messageCollector
  ) {
    //
  }

  createReferenceNode(node: Nodes.Node): TypeNode {
    const resolver: TypeResolver = getTypeResolver(node);
    const result: TypeNode = this.createNode(node, resolver);
    return result;
  }

  createNode(node: Nodes.Node, resolver: TypeResolver): TypeNode {
    if (this._nodeMap.has(node)) {
      throw new AstNodeError(`The node ${node.nodeName} (${node}) already exist in _nodeMap`, node);
    }
    if (!resolver) {
      throw new AstNodeError(`The node ${node.nodeName} (${node}) has no resolver`, node);
    }
    const result = new TypeNode(node, resolver);
    this._nodeMap.set(node, result);
    return result;
  }

  build(node: Nodes.DocumentNode): TypeGraph {
    node.directives.forEach(directive => this.processDirective(directive));

    return this.createTypeGraph();
  }

  private processDirective(node: Nodes.DirectiveNode): TypeNode {
    if (node instanceof Nodes.VarDirectiveNode) {
      return this.processVarDecl(node.decl);
    } else if (node instanceof Nodes.OverloadedFunctionNode) {
      return this.traverse(node);
    } else if (node instanceof Nodes.TypeDirectiveNode) {
      return this.processTypeDirective(node);
    } else if (node instanceof Nodes.ImplDirective) {
      node.directives.forEach($ => this.processDirective($));
      return;
    } else if (node instanceof Nodes.ImportDirectiveNode) {
      return; // noop
    }

    throw new Error('Unknown directive ' + node.nodeName);
  }

  buildFunctionNode(functionNode: Nodes.FunctionNode, args: Type[]): TypeGraph {
    const paramList = functionNode.parameters;

    if (args.length != paramList.length) {
      throw new Error('args.length != paramList.length');
    }

    this.traverse(functionNode.body);

    return this.createTypeGraph();
  }

  private createTypeGraph(): TypeGraph {
    this._referenceNode.forEach(({ result, reference, edgeName: name }) => {
      const referencedType: TypeNode = this.resolveReferenceNode(reference);
      if (referencedType) {
        Edge.addEdge(this.parsingContext, referencedType, result, name || EdgeLabels.NAME);
      } else {
        // This should never happen or it means that the scope face didn't work correctly. That is why we should fail
        throw new Error(
          'Unable to resolve reference to ' +
            reference.referencedNode.name +
            ' from ' +
            (reference.moduleName || 'local module') +
            '\n' +
            result.astNode.closure.inspect()
        );
      }
    });
    const nodes: Array<TypeNode> = [];
    for (let node of this._nodeMap.values()) {
      nodes.push(node);
    }
    return new TypeGraph(nodes, this.parentGraph);
  }

  resolveReferenceNode(referenceNode: Reference): TypeNode | null {
    // If no parent is a local reference else is a reference to another module.
    if (referenceNode.isLocalReference) {
      return this.findNode(referenceNode.referencedNode);
    } else {
      const typePhase = this.parsingContext.getTypePhase(referenceNode.moduleName);
      const typeNode = typePhase.typeGraph.findNode(referenceNode.referencedNode);
      return typeNode;
    }
  }

  private resolveReference(reference: Reference, result: TypeNode, edgeName?: string): void {
    if (!this._referenceNode.some($ => $.reference === reference && $.result == result)) {
      this._referenceNode.push({ reference, result, edgeName });
    }
  }

  private resolveVariableByName(node: Nodes.Node, name: string, result: TypeNode, edgeName?: string): void {
    const reference = node.closure.get(name, true);

    if (reference) {
      this.resolveReference(reference, result, edgeName);
    } else {
      this.messageCollector.error(`Invalid reference ${name}` /* InvalidReferenceMessage */, node);
    }
  }

  private resolveVariable(node: Nodes.QNameNode, result: TypeNode): void {
    const reference = node.closure.getQName(node, true);

    if (reference) {
      this.resolveReference(reference, result);
    } else {
      this.messageCollector.error(`Invalid reference ${node.text}` /* InvalidReferenceMessage */, node);
    }
  }

  private traverse(node: Nodes.Node): TypeNode {
    if (this._nodeMap.has(node)) {
      return this._nodeMap.get(node);
    }
    return this.traverseNode(node, this.createReferenceNode(node));
  }

  private traverseNode(node: Nodes.Node, target: TypeNode): TypeNode {
    if (node instanceof Nodes.FunctionNode) {
      node.parameters.forEach(arg => {
        const defaultValue: Nodes.Node = arg.defaultValue;
        if (arg.parameterType) {
          const argumentNode: TypeNode = this.createNode(arg.parameterName, new ParameterTypeResolver());

          Edge.addEdge(this.parsingContext, this.traverse(arg.parameterType), argumentNode, EdgeLabels.EXPECTED_TYPE);

          if (defaultValue) {
            Edge.addEdge(this.parsingContext, this.traverse(defaultValue), argumentNode, EdgeLabels.DEFAULT_VALUE); // TODO validate default value type
          }

          Edge.addEdge(this.parsingContext, argumentNode, target, arg.parameterName.name);
        } else {
          this.messageCollector.error(`Parameter ${arg.parameterName.name} has no defined type`, arg.parameterName);
        }
      });

      if (node.functionReturnType) {
        Edge.addEdge(this.parsingContext, this.traverse(node.functionReturnType), target, EdgeLabels.RETURN_TYPE);
      }

      if (!node.hasAnnotation(annotations.IsOverloaded)) {
        Edge.addEdge(this.parsingContext, target, this.traverse(node.functionName));
      }
    } else if (node instanceof Nodes.OverloadedFunctionNode) {
      node.functions.forEach(fun => {
        fun.functionNode.annotate(new annotations.IsOverloaded());
        Edge.addEdge(this.parsingContext, this.traverse(fun.functionNode), target, EdgeLabels.FUNCTION);
      });
      Edge.addEdge(this.parsingContext, target, this.traverse(node.functionName));
    } else if (node instanceof Nodes.ReferenceNode) {
      this.resolveVariable(node.variable, target);
    } else if (node instanceof Nodes.AssignmentNode) {
      Edge.addEdge(this.parsingContext, this.traverse(node.lhs), target, EdgeLabels.LHS);
      Edge.addEdge(this.parsingContext, this.traverse(node.rhs), target, EdgeLabels.RHS);
    } else if (node instanceof Nodes.IfNode) {
      Edge.addEdge(this.parsingContext, this.traverse(node.truePart), target, EdgeLabels.TRUE_PART);
      Edge.addEdge(this.parsingContext, this.traverse(node.condition), target, EdgeLabels.CONDITION);
      this.resolveVariableByName(node, 'boolean', target, EdgeLabels.BOOLEAN);

      if (node.falsePart) {
        Edge.addEdge(this.parsingContext, this.traverse(node.falsePart), target, EdgeLabels.FALSE_PART);
      }
    } else if (node instanceof Nodes.BinaryExpressionNode) {
      Edge.addEdge(this.parsingContext, this.traverse(node.lhs), target, EdgeLabels.LHS);
      Edge.addEdge(this.parsingContext, this.traverse(node.rhs), target, EdgeLabels.RHS);
    } else if (node instanceof Nodes.MemberNode) {
      Edge.addEdge(this.parsingContext, this.traverse(node.lhs), target, EdgeLabels.LHS);
    } else if (node instanceof Nodes.AsExpressionNode) {
      Edge.addEdge(this.parsingContext, this.traverse(node.lhs), target, EdgeLabels.LHS);
      Edge.addEdge(this.parsingContext, this.traverse(node.rhs), target, EdgeLabels.RHS);
    } else if (node instanceof Nodes.IsExpressionNode) {
      this.resolveVariableByName(node, 'boolean', target, EdgeLabels.BOOLEAN);
      Edge.addEdge(this.parsingContext, this.traverse(node.lhs), target, EdgeLabels.LHS);
      Edge.addEdge(this.parsingContext, this.traverse(node.rhs), target, EdgeLabels.RHS);
    } else if (node instanceof Nodes.UnaryExpressionNode) {
      Edge.addEdge(this.parsingContext, this.traverse(node.rhs), target, EdgeLabels.RHS);
    } else if (node instanceof Nodes.BlockNode) {
      node.statements.forEach($ => {
        Edge.addEdge(this.parsingContext, this.traverse($), target, EdgeLabels.STATEMENTS);
      });
    } else if (node instanceof Nodes.FunctionCallNode) {
      Edge.addEdge(this.parsingContext, this.traverse(node.functionNode), target);

      node.argumentsNode.forEach(child => {
        Edge.addEdge(this.parsingContext, this.traverse(child), target, EdgeLabels.PARAMETER);
      });
    } else if (node instanceof Nodes.PatternMatcherNode) {
      const valueToMatch = this.traverse(node.lhs);
      Edge.addEdge(this.parsingContext, valueToMatch, target, EdgeLabels.PATTERN_EXPRESSION);

      type Carry = {
        bearerOfTypes: TypeNode;
        typeToRemoveNext: TypeNode;
      };

      const carry: Carry = node.matchingSet.reduce<Carry>(
        (carry: Carry, matcherNode) => {
          const matchExpression = this.traverse(matcherNode);

          let newResult: Carry = {
            bearerOfTypes: null,
            typeToRemoveNext: null
          };

          Edge.addEdge(this.parsingContext, matchExpression, target, EdgeLabels.MATCH_EXPRESSION);

          /**
           * This reductor will take the carried type and remove the type from the
           * carry.bearerOfTypes
           */
          newResult.bearerOfTypes = this.traverse(new Nodes.TypeReducerNode());

          /**
           * If we have a carry.typeToRemoveNext, add the edge to the typeReductor
           */
          if (carry.typeToRemoveNext) {
            Edge.addEdge(this.parsingContext, carry.typeToRemoveNext, newResult.bearerOfTypes, EdgeLabels.REMOVED_TYPE);
          }

          /**
           * If we know the type to be removed from the flow, create the
           * newResult.typeToRemoveNext
           */
          if (matcherNode instanceof Nodes.MatchCaseIsNode) {
            newResult.typeToRemoveNext = this.traverse(matcherNode.typeReference);
          } else {
            newResult.typeToRemoveNext = null;
          }

          /**
           * The current typeReductor is feed by the previous bearerOfTypes.
           * In the first iteration, it is the valueToMatch directly, subsequent
           * nodes uses the previous typeReductor
           */
          Edge.addEdge(
            this.parsingContext,
            carry.bearerOfTypes,
            newResult.bearerOfTypes,
            EdgeLabels.PATTERN_MATCHING_VALUE
          );

          /**
           * The typeReductor is the input type of the matcher.
           */
          Edge.addEdge(
            this.parsingContext,
            newResult.bearerOfTypes,
            matchExpression,
            EdgeLabels.PATTERN_MATCHING_VALUE
          );

          /**
           * Matchers require to know the boolean type to work
           */
          this.resolveVariableByName(matcherNode, 'boolean', matchExpression, EdgeLabels.BOOLEAN);

          /**
           * The MatchDefaultNode (else) marks the end of the pattern matching
           * and it consumes every possible remaining value to match.
           */
          if (matcherNode instanceof Nodes.MatchDefaultNode) {
            newResult.bearerOfTypes = new TypeNode(
              new Nodes.TypeReducerNode(),
              new LiteralTypeResolver(InjectableTypes.never)
            );
          }

          return newResult;
        },
        {
          bearerOfTypes: valueToMatch,
          typeToRemoveNext: null
        }
      );

      if (carry.typeToRemoveNext && carry.bearerOfTypes) {
        /**
         * This reductor will take the carried type and remove the type from the
         * carry.bearerOfTypes
         */
        const bearerOfTypes = this.traverse(new Nodes.TypeReducerNode(node.astNode));

        /**
         * If we have a carry.typeToRemoveNext, add the edge to the typeReductor
         */
        if (carry.typeToRemoveNext) {
          Edge.addEdge(this.parsingContext, carry.typeToRemoveNext, bearerOfTypes, EdgeLabels.REMOVED_TYPE);
        }

        /**
         * The current typeReductor is feed by the previous bearerOfTypes.
         * In the first iteration, it is the valueToMatch directly, subsequent
         * nodes uses the previous typeReductor
         */
        Edge.addEdge(this.parsingContext, carry.bearerOfTypes, bearerOfTypes, EdgeLabels.PATTERN_MATCHING_VALUE);

        Edge.addEdge(this.parsingContext, bearerOfTypes, target, EdgeLabels.REST_TYPE);
      } else if (carry.bearerOfTypes) {
        Edge.addEdge(this.parsingContext, carry.bearerOfTypes, target, EdgeLabels.REST_TYPE);
      }
    } else if (node instanceof Nodes.VarDeclarationNode) {
      this.processVarDecl(node);
    } else if (node instanceof Nodes.IntegerLiteral) {
      const type = getTypeForIntValue(node.astNode.text);

      this.resolveVariableByName(node, type, target);
    } else if (node instanceof Nodes.FloatLiteral) {
      this.resolveVariableByName(node, 'f32', target);
    } else if (node instanceof Nodes.BooleanLiteral) {
      this.resolveVariableByName(node, 'boolean', target);
    } else if (node instanceof Nodes.StringLiteral) {
      this.resolveVariableByName(node, 'bytes', target);
    } else if (node instanceof Nodes.MatchLiteralNode) {
      Edge.addEdge(this.parsingContext, this.traverse(node.literal), target, EdgeLabels.LHS);
      Edge.addEdge(this.parsingContext, this.traverse(node.rhs), target, EdgeLabels.RHS);
    } else if (node instanceof Nodes.MatchCaseIsNode) {
      const typeRef = this.traverse(node.typeReference);

      Edge.addEdge(this.parsingContext, typeRef, target, EdgeLabels.LHS);

      Edge.addEdge(this.parsingContext, this.traverse(node.rhs), target, EdgeLabels.RHS);

      if (node.declaredName) {
        const nameTarget = this.createNode(node.declaredName, new TypeFromTypeResolver());
        Edge.addEdge(this.parsingContext, typeRef, nameTarget, EdgeLabels.LHS);
      }
    } else if (node instanceof Nodes.WasmExpressionNode) {
      node.atoms.forEach($ => this.traverseNode($, target));
    } else if (node instanceof Nodes.WasmAtomNode) {
      if (node.symbol === 'call' || node.symbol === 'global.get' || node.symbol === 'global.set') {
        if (node.arguments[0] instanceof Nodes.ReferenceNode) {
          this.traverse(node.arguments[0]);
        }
      } else {
        node.arguments.forEach($ => {
          if ($ instanceof Nodes.WasmAtomNode) {
            this.traverseNode($, target);
          }
        });
      }
    } else if (node instanceof Nodes.MatchDefaultNode) {
      Edge.addEdge(this.parsingContext, this.traverse(node.rhs), target, EdgeLabels.RHS);
    } else this.traverseChildren(node, target);

    return target;
  }

  processVarDecl(decl: Nodes.VarDeclarationNode) {
    const variableNode = this.traverseNode(
      decl.variableName,
      this.createNode(decl.variableName, new VarDeclarationTypeResolver())
    );

    if (decl.variableType) {
      Edge.addEdge(this.parsingContext, this.traverse(decl.variableType), variableNode, EdgeLabels.EXPECTED_TYPE);
    }

    Edge.addEdge(this.parsingContext, this.traverse(decl.value), variableNode, EdgeLabels.DEFAULT_VALUE);

    return variableNode;
  }

  processTypeDirective(directive: Nodes.TypeDirectiveNode) {
    if (directive.variableName.ofType) {
      const typeDirective = this.traverseNode(
        directive.variableName,
        this.createNode(directive.variableName, new TypeDirectiveResolver(directive.variableName.ofType as TypeAlias))
      );

      const shouldNotTraverse =
        !directive.valueType ||
        directive.valueType instanceof Nodes.StackTypeNode ||
        directive.valueType instanceof Nodes.StructTypeNode ||
        directive.valueType instanceof Nodes.InjectedTypeNode;

      if (!shouldNotTraverse) {
        Edge.addEdge(this.parsingContext, this.traverse(directive.valueType), typeDirective);
      }

      return typeDirective;
    } else {
      this.messageCollector.error('Cannot resolve TypeDirective', directive);
    }
  }

  findNode(referenceNoded: Nodes.Node): TypeNode | null {
    const localNode = this.findLocalNode(referenceNoded);
    return localNode || (this.parentGraph && this.parentGraph.findNode(referenceNoded));
  }

  private findLocalNode(referenceNode: Nodes.Node): TypeNode | null {
    return this._nodeMap.get(referenceNode);
  }

  traverseChildren(node: Nodes.Node, result: TypeNode) {
    const children = node.children;
    return children.map(child => Edge.addEdge(this.parsingContext, this.traverse(child), result));
  }
}

function getTypeForIntValue(value: string): string {
  if (value.startsWith('0x')) {
    if (value.length > '0x00000000'.length) return 'i64';
  }

  const intValue = parseInt(value);

  if (intValue >= -2147483648 && intValue <= 4294967295) return 'i32';
  return 'i64';
}
