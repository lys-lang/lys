import * as Nodes from '../parser/nodes';
import binaryen = require('../../lib/binaryen');
import { FunctionType } from '../parser/types';
import { findBuiltInTypedBinaryOperation } from './languageOperations';

function getTypeForFunction(fn: Nodes.FunctionNode, module: binaryen.Module) {
  const retType = fn.functionReturnType.ofType;
  const inputTypes = fn.parameters.map($ => $.parameterType.ofType);

  const name = 'f_' + retType.nativeType + '_' + inputTypes.map($ => $.nativeType).join('_');

  let type = module.getFunctionTypeBySignature(retType.binaryenType, inputTypes.map($ => $.binaryenType));

  if (!type) {
    type = module.addFunctionType(name, retType.binaryenType, inputTypes.map($ => $.binaryenType));
  }

  return {
    type,
    retType,
    inputTypes
  };
}

function emitFunction(fn: Nodes.FunctionNode, module: binaryen.Module, document: Nodes.DocumentNode) {
  const fnType = getTypeForFunction(fn, module);

  const localsMap = fn.closure.localsMap;

  fn.parameters.forEach($ => {
    localsMap.set($, localsMap.size);
  });

  const moduleFun = module.addFunction(
    fn.internalIdentifier,
    fnType.type,
    fn.locals.map($ => $.binaryenType),
    module.return(emit(fn.value, module, document))
  );

  return moduleFun;
}

function emitMatchingNode(match: Nodes.MatchNode, module: binaryen.Module, document: Nodes.DocumentNode) {
  const matchers = match.matchingSet.slice(0);
  const ixDefaultBranch = matchers.findIndex($ => $ instanceof Nodes.MatchDefaultNode);
  const lhs = module.set_local(match.localIndex, emit(match.lhs, module, document));
  const getLocalCode = module.get_local(match.localIndex, match.lhs.ofType.binaryenType);

  if (ixDefaultBranch !== -1) {
    // the default branch must be the last element
    const defaultMatcher = matchers[ixDefaultBranch];
    matchers.splice(ixDefaultBranch, 1);
    matchers.push(defaultMatcher);
  }

  const blocks = matchers
    .map(function emitNode(node: Nodes.MatcherNode): { condition; body; type } {
      if (node instanceof Nodes.MatchDefaultNode) {
        const body = emit(node.rhs, module, document);
        return { condition: null, body, type: node.rhs.ofType.binaryenType };
      } else if (node instanceof Nodes.MatchLiteralNode) {
        const condition = findBuiltInTypedBinaryOperation('==', node.literal.ofType, match.lhs.ofType);
        const body = emit(node.rhs, module, document);
        return {
          condition: condition.generateCode(emit(node.literal, module, document), getLocalCode, module),
          body,
          type: node.rhs.ofType.binaryenType
        };
      }
    })
    .filter($ => !!$);

  // if has shape condition/else then replace by if else
  if (ixDefaultBranch !== -1 && blocks.length === 2) {
    const ifNode = blocks.find($ => $.condition);
    const elseNode = blocks.find($ => !$.condition);
    return module.if(ifNode.condition, ifNode.body, elseNode.body);
  }

  const breaks = blocks.filter($ => !!$.condition).map(($, $$) => module.br_if(`B${$$}`, $.condition));

  const ret = blocks.reduceRight((prev, curr, ix) => {
    return [module.block(`B${ix}`, prev), curr.body, module.break('B')];
  }, breaks);

  return module.block('B', [lhs].concat(ret), match.ofType.binaryenType);
}

function emit(node: Nodes.Node, module: binaryen.Module, document: Nodes.DocumentNode): any {
  try {
    if (node instanceof Nodes.FunctionCallNode) {
      const ofType = node.functionNode.ofType as FunctionType;

      return module.call(
        ofType.internalName,
        node.argumentsNode.map($ => emit($, module, document)),
        ofType.returnType.binaryenType
      );
    } else if (node instanceof Nodes.IntegerLiteral) {
      return module.i32.const(node.value);
    } else if (node instanceof Nodes.BooleanLiteral) {
      return module.i32.const(node.value ? 0xffffffff : 0);
    } else if (node instanceof Nodes.FloatLiteral) {
      return module.f32.const(node.value);
    } else if (node instanceof Nodes.MatchNode) {
      return emitMatchingNode(node, module, document);
    } else if (node instanceof Nodes.BinaryExpressionNode) {
      return node.binaryOperation.generateCode(
        emit(node.lhs, module, document),
        emit(node.rhs, module, document),
        module
      );
    } else if (node instanceof Nodes.VariableReferenceNode) {
      const decl = node.closure.getVariable(node.variable.name).node;
      if (node.closure.localsMap.has(decl)) {
        return module.getLocal(node.closure.localsMap.get(decl), decl.ofType.binaryenType);
      } else {
        return module.i32.const(0);
      }
    }

    throw new Error(`This node cannot be emited ${node.nodeName}`);
  } catch (e) {
    node.errors.push(e);
  }
}

export function compile(document: Nodes.DocumentNode) {
  const module = new binaryen.Module();

  const functions = Nodes.findNodesByType(document, Nodes.OverloadedFunctionNode);

  const createdFunctions = [];

  functions.forEach($ => {
    const canBeExported = $.functions.length === 1;

    $.functions.forEach(fun => {
      createdFunctions.push(emitFunction(fun.functionNode, module, document));
      if (fun.isExported) {
        if (canBeExported) {
          module.addFunctionExport(fun.functionNode.internalIdentifier, fun.functionNode.functionName.name);
        } else {
          throw new Error('You cannot export overloaded functions');
        }
      }
    });
  });

  module.setFunctionTable(createdFunctions);

  return module;
}
