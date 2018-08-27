import { TypeNode, TypeGraph, TypeResolver, Edge, LiteralTypeResolver } from './TypeGraph';
import { Reference, ParsingContext, MessageCollector } from '../closure';
import { Nodes } from '../nodes';
import {
  getTypeResolver,
  EdgeLabels,
  PassThroughTypeResolver,
  StructDeconstructorTypeResolver,
  VarDeclarationTypeResolver
} from './typeResolvers';
import { Type, InjectableTypes, VoidType, PolimorphicType } from '../types';
import { AstNodeError } from '../NodeError';

export class TypeGraphBuilder {
  _nodes: TypeNode[] = [];
  _referenceNode: { reference: Reference; result: TypeNode }[] = [];

  constructor(
    public parsingContext: ParsingContext,
    public parentGraph: TypeGraph = null,
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
    if (this._nodes.some($ => $.astNode == node)) {
      throw new AstNodeError(`The node ${node.nodeName} already exist in _nodes`, node);
    }
    if (!resolver) {
      throw new AstNodeError(`The node ${node.nodeName} has no resolver`, node);
    }
    const result = new TypeNode(node, resolver);
    this._nodes.push(result);
    return result;
  }

  build(node: Nodes.DocumentNode): TypeGraph {
    node.directives.forEach(node => {
      if (node instanceof Nodes.VarDirectiveNode) {
        this.processVarDecl(node.decl);
      } else if (node instanceof Nodes.OverloadedFunctionNode) {
        this.traverse(node);
      } else if (node instanceof Nodes.FunDirectiveNode) {
        throw new Error('Unreachable');
      } else if (node instanceof Nodes.TypeDirectiveNode) {
        this.processTypeDirective(node);
      }
    });

    return this.createTypeGraph();
  }

  buildFunctionNode(functionNode: Nodes.FunctionNode, args: Type[]): TypeGraph {
    const paramList = functionNode.parameters;
    if (args.length != paramList.length) {
      paramList.forEach((param, index) => {
        if (index >= args.length) {
          if (param.defaultValue) {
            const paramNode: TypeNode = this.traverse(param.parameterName);
            new Edge(this.traverse(param.defaultValue), paramNode);
          } else {
            this.createReferenceNode(param.parameterName);
          }
        } else {
          this.createNode(param.parameterName, new LiteralTypeResolver(args[index]));
        }
      });
    } else {
      paramList.forEach((param, index) => {
        this.createNode(param.parameterName, new LiteralTypeResolver(args[index]));
      });
    }

    const bodyNode: TypeNode = this.traverse(functionNode.body);
    const result = this.createNode(functionNode, new PassThroughTypeResolver());

    if (functionNode.functionReturnType) {
      this.traverse(functionNode.functionReturnType);
    }

    new Edge(bodyNode, result);
    return this.createTypeGraph();
  }

  private createTypeGraph(): TypeGraph {
    this._referenceNode.forEach(({ result, reference }) => {
      const referencedType: TypeNode = this.resolveReferenceNode(reference);
      if (referencedType) {
        new Edge(referencedType, result);
      } else {
        // This should never happen or it means that the scope face didn't work correctly. That is why we should fail
        throw new Error(
          'Unable to resolve reference to ' +
            reference.referencedNode.name +
            ' from ' +
            (reference.moduleSource || 'local module')
        );
      }
    });
    return new TypeGraph(this._nodes, this.parentGraph);
  }

  resolveReferenceNode(referenceNode: Reference): TypeNode | null {
    // If no parent is a local reference else is a reference to another module.
    if (referenceNode.isLocalReference) {
      return this.findNode(referenceNode.referencedNode);
    } else {
      const typePhase = this.parsingContext.getTypePhase(referenceNode.moduleSource);
      const typeNode = typePhase.typeGraph.findNode(referenceNode.referencedNode);
      return typeNode;
    }
  }

  private resolveVariableByName(node: Nodes.Node, name: string, result: TypeNode): void {
    const reference = node.closure.get(name);

    if (reference) {
      if (!this._referenceNode.some($ => $.reference === reference && $.result == result)) {
        this._referenceNode.push({ reference, result });
      }
    } else {
      this.messageCollector.error(`Invalid reference ${name}` /* InvalidReferenceMessage */, node);
    }
  }

  private resolveVariable(node: Nodes.QNameNode, result: TypeNode): void {
    const reference = node.closure.getQName(node);

    if (reference) {
      if (!this._referenceNode.some($ => $.reference === reference && $.result == result)) {
        this._referenceNode.push({ reference, result });
      }
    } else {
      this.messageCollector.error(`Invalid reference ${node.text}` /* InvalidReferenceMessage */, node);
    }
  }

  private traverse(node: Nodes.Node): TypeNode {
    return this.traverseNode(node, this.createReferenceNode(node));
  }

  private traverseNode(node: Nodes.Node, target: TypeNode): TypeNode {
    if (node instanceof Nodes.FunctionNode) {
      node.parameters.forEach(arg => {
        const defaultValue: Nodes.Node = arg.defaultValue;
        if (arg.parameterType) {
          const expectedType = this.traverse(arg.parameterType); // TODO validate assign

          const argumentNode: TypeNode = this.createNode(arg.parameterName, new PassThroughTypeResolver());
          new Edge(expectedType, argumentNode);

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
        new Edge(this.traverse(fun), target);
      });
      new Edge(target, this.traverse(node.functionName));
    } else if (node instanceof Nodes.VariableReferenceNode) {
      this.resolveVariable(node.variable, target);
    } else if (node instanceof Nodes.AssignmentNode) {
      new Edge(this.traverse(node.variable), target, EdgeLabels.LHS);
      new Edge(this.traverse(node.value), target, EdgeLabels.RHS);
    } else if (node instanceof Nodes.TypeReferenceNode) {
      this.resolveVariable(node.variable, target);
    } else if (node instanceof Nodes.IntegerLiteral) {
      this.resolveVariableByName(node, 'i32', target);
    } else if (node instanceof Nodes.FloatLiteral) {
      this.resolveVariableByName(node, 'f32', target);
    } else if (node instanceof Nodes.BooleanLiteral) {
      this.resolveVariableByName(node, 'boolean', target);
    } else if (node instanceof Nodes.IfNode) {
      new Edge(this.traverse(node.truePart), target, EdgeLabels.TRUE_PART);
      new Edge(this.traverse(node.condition), target, EdgeLabels.CONDITION);

      if (node.falsePart) {
        new Edge(this.traverse(node.falsePart), target, EdgeLabels.FALSE_PART);
      }
    } else if (node instanceof Nodes.BinaryExpressionNode) {
      new Edge(this.traverse(node.lhs), target, EdgeLabels.LHS);
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
      const matched = this.traverse(node.lhs);
      new Edge(matched, target, EdgeLabels.PATTERN_EXPRESSION);

      node.matchingSet.forEach(child => {
        const source = this.traverse(child);
        new Edge(source, target, EdgeLabels.MATCH_EXPRESSION);
        new Edge(matched, source, EdgeLabels.PATTERN_MATCHING_VALUE);
      });
    } else if (node instanceof Nodes.VarDeclarationNode) {
      this.processVarDecl(node);
    } else if (node instanceof Nodes.MatchLiteralNode) {
      new Edge(this.traverse(node.literal), target, EdgeLabels.LHS);
      new Edge(this.traverse(node.rhs), target, EdgeLabels.RHS);
    } else if (node instanceof Nodes.MatchCaseIsNode) {
      node.deconstructorNames.forEach(($, $$) => {
        if ($.name !== '_') {
          new Edge(target, this.createNode($, new StructDeconstructorTypeResolver($$)));
        }
      });

      if (node.declaredName) {
        // new Edge(, target, EdgeLabels.LHS);
      }
      new Edge(this.traverse(node.rhs), target, EdgeLabels.RHS);
    } else if (node instanceof Nodes.WasmExpressionNode) {
      // noop
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
      new Edge(this.traverse(decl.variableType), variableNode);
    }

    new Edge(this.traverse(decl.value), variableNode, EdgeLabels.DEFAULT_VALUE);
  }

  processStruct(node: Nodes.StructDeclarationNode, parent: TypeNode) {
    const target = this.createReferenceNode(node);

    new Edge(parent, target, EdgeLabels.SUPER_TYPE);

    node.parameters.forEach(arg => {
      const defaultValue: Nodes.Node = arg.defaultValue;
      if (arg.parameterType) {
        const expectedType = this.traverse(arg.parameterType);
        const argumentNode: TypeNode = this.createNode(arg.parameterName, new PassThroughTypeResolver());
        new Edge(expectedType, argumentNode);
        new Edge(argumentNode, target, arg.parameterName.name);
        if (defaultValue) {
          new Edge(this.traverse(defaultValue), argumentNode, EdgeLabels.DEFAULT_VALUE); // TODO validate default value type
        }
      } else {
        this.messageCollector.error(`Parameter ${arg.parameterName.name} has no defined type`, node);
      }
    });

    const name = this.traverse(node.declaredName);

    new Edge(target, name);

    return name;
  }

  processTypeDirective(directive: Nodes.TypeDirectiveNode) {
    if (directive.valueType) {
      if (directive.variableName.name in InjectableTypes) {
        this.messageCollector.error('You cannot redefine a built-in type', directive.valueType);
      }
      if (directive.valueType instanceof Nodes.TypeDeclarationNode) {
        const typeDirective = this.traverseNode(
          directive.variableName,
          this.createNode(
            directive.variableName,
            new LiteralTypeResolver(new PolimorphicType(directive.variableName.name))
          )
        );
        directive.valueType.declarations.forEach($ => this.processStruct($, typeDirective));
      } else {
        new Edge(this.createReferenceNode(directive.valueType), this.traverse(directive.variableName));
      }
    } else {
      if (directive.variableName.name in InjectableTypes) {
        const type = new InjectableTypes[directive.variableName.name]();
        this.createNode(directive.variableName, new LiteralTypeResolver(type));
      } else {
        this.messageCollector.error(
          `Cannot find built in type "${directive.variableName.name}"`,
          directive.variableName
        );

        this.createNode(directive.variableName, new LiteralTypeResolver(VoidType.instance));
      }
    }
  }

  findNode(referenceNode: Nodes.Node): TypeNode | null {
    const localNode = this.findLocalNode(referenceNode);
    return localNode || (this.parentGraph && this.parentGraph.findNode(referenceNode));
  }

  private findLocalNode(referenceNode: Nodes.Node): TypeNode | null {
    return this._nodes.find(node => node.astNode == referenceNode);
  }

  traverseChildren(node: Nodes.Node, result: TypeNode) {
    const children = node.children;
    return children.map(child => new Edge(this.traverse(child), result));
  }
}
