import { TypeNode, TypeGraph, TypeResolver, Edge, LiteralTypeResolver } from './TypeGraph';
import { Reference, ParsingContext, MessageCollector } from '../closure';
import { Nodes } from '../nodes';
import {
  getTypeResolver,
  EdgeLabels,
  PassThroughTypeResolver,
  StructDeconstructorTypeResolver,
  TypeFromTypeResolver,
  VarDeclarationTypeResolver,
  TypeDirectiveResolver
} from './typeResolvers';
import { Type, TypeAlias, InjectableTypes } from '../types';
import { AstNodeError } from '../NodeError';

export class TypeGraphBuilder {
  _nodeMap = new Map<Nodes.Node, TypeNode>();
  _referenceNode: { reference: Reference; result: TypeNode }[] = [];

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
    } else if (node instanceof Nodes.NameSpaceDirective) {
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
    } else {
      paramList.forEach((param, index) => {
        this.createNode(param.parameterName, new LiteralTypeResolver(args[index]));
      });
    }

    this.traverse(functionNode.body);

    if (functionNode.functionReturnType) {
      this.traverse(functionNode.functionReturnType);
    }

    return this.createTypeGraph();
  }

  private createTypeGraph(): TypeGraph {
    this._referenceNode.forEach(({ result, reference }) => {
      const referencedType: TypeNode = this.resolveReferenceNode(reference);
      if (referencedType) {
        new Edge(referencedType, result, EdgeLabels.NAME);
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

  private resolveReference(reference: Reference, result: TypeNode): void {
    if (!this._referenceNode.some($ => $.reference === reference && $.result == result)) {
      this._referenceNode.push({ reference, result });
    }
  }

  private resolveVariableByName(node: Nodes.Node, name: string, result: TypeNode): void {
    const reference = node.closure.get(name, true);

    if (reference) {
      this.resolveReference(reference, result);
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
          const expectedType = this.traverse(arg.parameterType); // TODO validate assign

          const argumentNode: TypeNode = this.createNode(arg.parameterName, new PassThroughTypeResolver());
          new Edge(expectedType, argumentNode, EdgeLabels.EXPECTED_TYPE);

          if (defaultValue) {
            new Edge(this.traverse(defaultValue), argumentNode, EdgeLabels.DEFAULT_VALUE); // TODO validate default value type
          }

          new Edge(argumentNode, target, arg.parameterName.name);
        } else {
          this.messageCollector.error(`Parameter ${arg.parameterName.name} has no defined type`, node);
        }
      });

      if (node.functionReturnType) {
        new Edge(this.traverse(node.functionReturnType), target, EdgeLabels.RETURN_TYPE);
      }

      if (!(node.parent instanceof Nodes.OverloadedFunctionNode)) {
        new Edge(target, this.traverse(node.functionName));
      }
    } else if (node instanceof Nodes.OverloadedFunctionNode) {
      node.functions.forEach(fun => {
        new Edge(this.traverse(fun), target, EdgeLabels.FUNCTION);
      });
      new Edge(target, this.traverse(node.functionName));
    } else if (node instanceof Nodes.ReferenceNode) {
      this.resolveVariable(node.variable, target);
    } else if (node instanceof Nodes.AssignmentNode) {
      new Edge(this.traverse(node.variable), target, EdgeLabels.LHS);
      new Edge(this.traverse(node.value), target, EdgeLabels.RHS);
    } else if (node instanceof Nodes.IfNode) {
      new Edge(this.traverse(node.truePart), target, EdgeLabels.TRUE_PART);
      new Edge(this.traverse(node.condition), target, EdgeLabels.CONDITION);

      if (node.falsePart) {
        new Edge(this.traverse(node.falsePart), target, EdgeLabels.FALSE_PART);
      }
    } else if (node instanceof Nodes.BinaryExpressionNode) {
      new Edge(this.traverse(node.lhs), target, EdgeLabels.LHS);
      new Edge(this.traverse(node.rhs), target, EdgeLabels.RHS);
    } else if (node instanceof Nodes.MemberNode) {
      new Edge(this.traverse(node.lhs), target, EdgeLabels.LHS);
    } else if (node instanceof Nodes.AsExpressionNode) {
      new Edge(this.traverse(node.lhs), target, EdgeLabels.LHS);
      new Edge(this.traverse(node.rhs), target, EdgeLabels.RHS);
    } else if (node instanceof Nodes.IsExpressionNode) {
      this.resolveVariableByName(node, 'boolean', target);
      new Edge(this.traverse(node.lhs), target, EdgeLabels.LHS);
      new Edge(this.traverse(node.rhs), target, EdgeLabels.RHS);
    } else if (node instanceof Nodes.UnaryExpressionNode) {
      new Edge(this.traverse(node.rhs), target, EdgeLabels.RHS);
    } else if (node instanceof Nodes.BlockNode) {
      node.statements.forEach($ => {
        new Edge(this.traverse($), target, EdgeLabels.STATEMENTS);
      });
    } else if (node instanceof Nodes.FunctionCallNode) {
      new Edge(this.traverse(node.functionNode), target);

      node.argumentsNode.forEach(child => {
        new Edge(this.traverse(child), target, EdgeLabels.PARAMETER);
      });
    } else if (node instanceof Nodes.PatternMatcherNode) {
      const valueToMatch = this.traverse(node.lhs);
      new Edge(valueToMatch, target, EdgeLabels.PATTERN_EXPRESSION);

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

          new Edge(matchExpression, target, EdgeLabels.MATCH_EXPRESSION);

          /**
           * This reductor will take the carried type and remove the type from the
           * carry.bearerOfTypes
           */
          newResult.bearerOfTypes = this.traverse(new Nodes.TypeReducerNode());

          /**
           * If we have a carry.typeToRemoveNext, add the edge to the typeReductor
           */
          if (carry.typeToRemoveNext) {
            new Edge(carry.typeToRemoveNext, newResult.bearerOfTypes, EdgeLabels.REMOVED_TYPE);
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
          new Edge(carry.bearerOfTypes, newResult.bearerOfTypes, EdgeLabels.PATTERN_MATCHING_VALUE);

          /**
           * The typeReductor is the input type of the matcher.
           */
          new Edge(newResult.bearerOfTypes, matchExpression, EdgeLabels.PATTERN_MATCHING_VALUE);

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
          new Edge(carry.typeToRemoveNext, bearerOfTypes, EdgeLabels.REMOVED_TYPE);
        }

        /**
         * The current typeReductor is feed by the previous bearerOfTypes.
         * In the first iteration, it is the valueToMatch directly, subsequent
         * nodes uses the previous typeReductor
         */
        new Edge(carry.bearerOfTypes, bearerOfTypes, EdgeLabels.PATTERN_MATCHING_VALUE);

        new Edge(bearerOfTypes, target, EdgeLabels.REST_TYPE);
      } else if (carry.bearerOfTypes) {
        new Edge(carry.bearerOfTypes, target, EdgeLabels.REST_TYPE);
      }
    } else if (node instanceof Nodes.VarDeclarationNode) {
      this.processVarDecl(node);
    } else if (node instanceof Nodes.IntegerLiteral) {
      this.resolveVariableByName(node, 'i32', target);
    } else if (node instanceof Nodes.FloatLiteral) {
      this.resolveVariableByName(node, 'f32', target);
    } else if (node instanceof Nodes.BooleanLiteral) {
      this.resolveVariableByName(node, 'boolean', target);
    } else if (node instanceof Nodes.MatchLiteralNode) {
      new Edge(this.traverse(node.literal), target, EdgeLabels.LHS);
      new Edge(this.traverse(node.rhs), target, EdgeLabels.RHS);
    } else if (node instanceof Nodes.MatchCaseIsNode) {
      const typeRef = this.traverse(node.typeReference);

      new Edge(typeRef, target, EdgeLabels.LHS);

      new Edge(this.traverse(node.rhs), target, EdgeLabels.RHS);

      if (node.deconstructorNames) {
        node.deconstructorNames.forEach(($, $$) => {
          if ($.name !== '_') {
            new Edge(typeRef, this.createNode($, new StructDeconstructorTypeResolver($$)));
          }
        });
      }

      if (node.declaredName) {
        const nameTarget = this.createNode(node.declaredName, new TypeFromTypeResolver());
        new Edge(typeRef, nameTarget, EdgeLabels.LHS);
      }
    } else if (node instanceof Nodes.WasmExpressionNode) {
      node.atoms.forEach($ => this.traverseNode($, target));
    } else if (node instanceof Nodes.WasmAtomNode) {
      if (node.symbol === 'call' || node.symbol === 'get_global' || node.symbol === 'set_global') {
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
      new Edge(this.traverse(node.rhs), target, EdgeLabels.RHS);
    } else this.traverseChildren(node, target);

    return target;
  }

  processVarDecl(decl: Nodes.VarDeclarationNode) {
    const variableNode = this.traverseNode(
      decl.variableName,
      this.createNode(decl.variableName, new VarDeclarationTypeResolver())
    );

    if (decl.variableType) {
      new Edge(this.traverse(decl.variableType), variableNode, EdgeLabels.EXPECTED_TYPE);
    }

    new Edge(this.traverse(decl.value), variableNode, EdgeLabels.DEFAULT_VALUE);

    return variableNode;
  }

  processTypeDirective(directive: Nodes.TypeDirectiveNode) {
    if (directive.variableName.ofType) {
      const typeDirective = this.traverseNode(
        directive.variableName,
        this.createNode(directive.variableName, new TypeDirectiveResolver(directive.variableName.ofType as TypeAlias))
      );

      if (directive.valueType && !(directive.valueType instanceof Nodes.UnknownExpressionNode)) {
        new Edge(this.traverse(directive.valueType), typeDirective);
      }

      return typeDirective;
    } else {
      this.messageCollector.error('Cannot resolve TypeDirective', directive.valueType);
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
    return children.map(child => new Edge(this.traverse(child), result));
  }
}
