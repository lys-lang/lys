import { TypeNode, TypeGraph, TypeResolver, Edge, LiteralTypeResolver } from './TypeGraph';
import { Reference, ParsingContext } from '../closure';
import { Nodes } from '../nodes';
import { getTypeResolver, EdgeLabels } from './typeResolvers';
import { bool, Type, InjectableTypes, VoidType, TypeReference } from '../types';

export function fromTypeNode(node: Nodes.TypeNode): Type {
  if (node instanceof Nodes.TypeReferenceNode) {
    return new TypeReference(node.name);
  }

  return null;
}

export class TypeGraphBuilder {
  _nodes: TypeNode[] = [];
  _referenceNode: Map<Reference, TypeNode> = new Map();

  constructor(public parsingContext: ParsingContext, public parentGraph: TypeGraph = null) {
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

  // build(functionNode: FunctionNode, arguments: Seq[WeaveType]): TypeGraph {
  //   const paramList: Seq[FunctionParameter] = functionNode.params.paramList
  //   if (arguments.size != paramList.length) {
  //     if (paramList.head.defaultValue.isDefined) {
  //       const defaultValued: Int = paramList.length - arguments.size
  //       //Map first with default values
  //       paramList.slice(0, defaultValued).foreach((param) => {
  //         if (param.defaultValue.isDefined) {
  //           const paramNode: TypeNode = traverse(param.variable)
  //           Edge(traverse(param.defaultValue.get), paramNode)
  //         } else {
  //           createNode(param.variable)
  //         }
  //       })
  //       paramList.slice(defaultValued, paramList.length).zipWithIndex.foreach((param) => {
  //         createNode(param._1.variable, LiteralTypeResolver(arguments(param._2)))
  //       })
  //     } else {
  //       paramList.zipWithIndex.foreach((param) => {
  //         if (arguments.size <= param._2) {
  //           if (param._1.defaultValue.isDefined) {
  //             const paramNode: TypeNode = traverse(param._1.variable)
  //             Edge(traverse(param._1.defaultValue.get), paramNode)
  //           } else {
  //             createNode(param._1.variable)
  //           }
  //         } else {
  //           createNode(param._1.variable, LiteralTypeResolver(arguments(param._2)))
  //         }
  //       })
  //     }
  //   } else {
  //     paramList.zipWithIndex.foreach((param) => {
  //       createNode(param._1.variable, LiteralTypeResolver(arguments(param._2)))
  //     })
  //   }

  //   const bodyNode: TypeNode = traverse(functionNode.body)
  //   const result = createNode(functionNode, PassThroughTypeResolver)
  //   Edge(bodyNode, result, expected = expectedOutput, supportsCoercion = false)
  //   createTypeGraph()
  // }

  private createTypeGraph(): TypeGraph {
    this._referenceNode.forEach((typeNode, referenceNode) => {
      const referencedType: TypeNode = this.resolveReferenceNode(referenceNode);
      if (referencedType) {
        new Edge(referencedType, typeNode);
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
      this._referenceNode.set(reference, result);
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
            new Edge(this.traverse(defaultValue), argumentNode, 'default value', expectedType);
          }
        } else {
          this.parsingContext.error(`Parameter ${arg.parameterName.name} has no defined type`, node);
        }
      });
      new Edge(this.traverse(node.body), target, EdgeLabels.FUNCTION_BODY);
    } else if (node instanceof Nodes.OverloadedFunctionNode) {
      node.functions.forEach(fun => new Edge(this.traverse(fun), target));
    } else if (node instanceof Nodes.FunDirectiveNode) {
      new Edge(this.traverse(node.functionNode), target);
    } else if (node instanceof Nodes.VariableReferenceNode) {
      this.resolveVariable(node.variable, target);
    } else if (node instanceof Nodes.IfNode) {
      new Edge(this.traverse(node.truePart), target, EdgeLabels.TRUE_PART);
      new Edge(this.traverse(node.condition), target, EdgeLabels.CONDITION, new bool());
      new Edge(this.traverse(node.falsePart), target, EdgeLabels.FALSE_PART);
    } else if (node instanceof Nodes.BinaryExpressionNode) {
      new Edge(this.traverse(node.lhs), target, EdgeLabels.LHS);
      new Edge(this.traverse(node.rhs), target, EdgeLabels.RHS);
    } else if (node instanceof Nodes.FunctionCallNode) {
      new Edge(this.traverse(node.functionNode), target);

      node.argumentsNode.forEach(child => {
        new Edge(this.traverse(child), target, EdgeLabels.PARAMETER);
      });
    } else this.traverseChildren(node, target);

    return target;
  }

  processVarDecl(directive: Nodes.VarDeclarationNode): Edge {
    const requiredType = directive.variableType && directive.variableType.ofType;

    const variableNode: TypeNode = requiredType
      ? this.traverseNode(
          directive.variableName,
          this.createNode(directive.variableName, new LiteralTypeResolver(requiredType))
        )
      : this.traverse(directive.variableName);

    const valueNode = this.traverse(directive.value);

    return new Edge(valueNode, variableNode, void 0, requiredType, false);
  }

  processTypeDirective(directive: Nodes.TypeDirectiveNode) {
    if (directive.valueType) {
      new Edge(this.createReferenceNode(directive.valueType), this.traverse(directive.variableName));
    } else {
      if (directive.variableName.name in InjectableTypes) {
        const type = new InjectableTypes[directive.variableName.name]();

        this.createNode(directive.variableName, new LiteralTypeResolver(type));
      } else {
        this.parsingContext.error(`Cannot resolve type "${directive.variableName.name}"`, directive.variableName);

        this.createNode(directive.variableName, new LiteralTypeResolver(VoidType.instance));
      }
    }
  }

  buildPattern(
    patternExpressionNode: Nodes.MatcherNode,
    matchNode: TypeNode,
    caseNode: Nodes.Node,
    onMatch: Nodes.ExpressionNode,
    requiredPattern: Boolean = true
  ): TypeNode {
    const patternExpression = new TypeNode(patternExpressionNode, getTypeResolver(patternExpressionNode));
    this._nodes.push(patternExpression);
    const matchExpression = this.traverse(onMatch);
    const caseExpression = this.traverse(caseNode);
    if (requiredPattern) {
      new Edge(matchNode, patternExpression, EdgeLabels.PATTERN_EXPRESSION);
    }
    new Edge(matchExpression, patternExpression, EdgeLabels.MATCH_EXPRESSION);
    new Edge(caseExpression, patternExpression, EdgeLabels.CASE_EXPRESSION);
    return patternExpression;
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
