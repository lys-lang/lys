import { TypeNode, TypeGraph, TypeResolver, Edge, LiteralTypeResolver } from './TypeGraph';
import { Reference, ParsingContext } from '../closure';
import { Nodes } from '../nodes';
import { getTypeResolver, EdgeLabels, PassThroughTypeResolver } from './typeResolvers';
import { bool, Type, InjectableTypes, VoidType, TypeReference } from '../types';

export function fromTypeNode(node: Nodes.TypeNode): Type {
  if (node instanceof Nodes.TypeReferenceNode) {
    return new TypeReference(node.name.name, node.closure);
  }

  return null;
}

export class TypeGraphBuilder {
  _nodes: TypeNode[] = [];
  _referenceNode: { reference: Reference; result: TypeNode }[] = [];

  constructor(
    public parsingContext: ParsingContext,
    public parentGraph: TypeGraph = null,
    public expectedOutput: Type = null
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
      throw new Error(`The node ${node.nodeName} already exist in _nodes`);
    }
    if (!resolver) {
      throw new Error(`The node ${node.nodeName} has no resolver`);
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
    new Edge(bodyNode, result, void 0, this.expectedOutput);
    return this.createTypeGraph();
  }

  private createTypeGraph(): TypeGraph {
    this._referenceNode.forEach(({ result, reference }) => {
      const referencedType: TypeNode = this.resolveReferenceNode(reference);
      if (referencedType) {
        new Edge(referencedType, result);
      } else {
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
    //If no parent is a local reference else is a reference to another module.
    if (referenceNode.isLocalReference) {
      return this.findNode(referenceNode.referencedNode);
    }
    return null;
    // else {
    //   const parent: Nodes.NameIdentifierNode = referenceNode.moduleSource
    //   const module: PhaseResult[TypeCheckingResult[ModuleNode]] = parsingContext.getTypeCheckingForModule(parent.get)
    //   module.getResult().typeGraph.findNode(referenceNode.referencedNode)
    // }
  }

  private resolveVariable(node: Nodes.NameIdentifierNode, result: TypeNode): void {
    const reference = node.closure.get(node.name);
    if (reference) {
      this._referenceNode.push({ reference, result });
    } else {
      this.parsingContext.error(`Invalid reference ${node.name}` /* InvalidReferenceMessage */, node);
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
          const expectedType = fromTypeNode(arg.parameterType);
          const argumentNode: TypeNode = this.createNode(arg.parameterName, new LiteralTypeResolver(expectedType));
          new Edge(argumentNode, target, arg.parameterName.name);
          if (defaultValue) {
            new Edge(this.traverse(defaultValue), argumentNode, void 0, expectedType);
          }
        } else {
          this.parsingContext.error(`Parameter ${arg.parameterName.name} has no defined type`, node);
        }
      });
    } else if (node instanceof Nodes.OverloadedFunctionNode) {
      node.functions.forEach(fun => new Edge(this.traverse(fun), target));
      new Edge(target, this.traverse(node.functionName));
    } else if (node instanceof Nodes.VariableReferenceNode) {
      this.resolveVariable(node.variable, target);
    } else if (node instanceof Nodes.AssignmentNode) {
      // this.resolveVariable(node.variable.variable, target);
      new Edge(this.traverse(node.variable), target, EdgeLabels.LHS);
      new Edge(this.traverse(node.value), target, EdgeLabels.RHS);
    } else if (node instanceof Nodes.TypeReferenceNode) {
      this.resolveVariable(node.name, target);
    } else if (node instanceof Nodes.IfNode) {
      new Edge(this.traverse(node.truePart), target, EdgeLabels.TRUE_PART);
      new Edge(this.traverse(node.condition), target, EdgeLabels.CONDITION, new bool());

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
    } else if (node instanceof Nodes.MatchDefaultNode) {
      new Edge(this.traverse(node.rhs), target, EdgeLabels.RHS);
    } else this.traverseChildren(node, target);

    return target;
  }

  processVarDecl(decl: Nodes.VarDeclarationNode): Edge {
    const requiredType = (decl.variableType && fromTypeNode(decl.variableType)) || null;

    const variableNode: TypeNode = requiredType
      ? this.traverseNode(decl.variableName, this.createNode(decl.variableName, new LiteralTypeResolver(requiredType)))
      : this.traverse(decl.variableName);

    const valueNode = this.traverse(decl.value);

    return new Edge(valueNode, variableNode, void 0, requiredType);
  }

  processTypeDirective(directive: Nodes.TypeDirectiveNode) {
    if (directive.valueType) {
      if (directive.variableName.name in InjectableTypes) {
        this.parsingContext.error('You cannot redefine a built-in type', directive.valueType);
      }
      new Edge(this.createReferenceNode(directive.valueType), this.traverse(directive.variableName));
    } else {
      if (directive.variableName.name in InjectableTypes) {
        const type = new InjectableTypes[directive.variableName.name]();
        directive.variableName.ofType = type;
        this.createNode(directive.variableName, new LiteralTypeResolver(type));
      } else {
        this.parsingContext.error(`Cannot find built in type "${directive.variableName.name}"`, directive.variableName);

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
