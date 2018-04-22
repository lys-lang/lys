import * as Nodes from '../parser/nodes';
import binaryen = require('binaryen');

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
    fn.functionName.name,
    fnType.type,
    [],
    module.return(emit(fn.value, module, document))
  );
  return moduleFun;
}

function emit(node: Nodes.Node, module: binaryen.Module, document: Nodes.DocumentNode): any {
  try {
    if (node instanceof Nodes.IntegerLiteral) {
      return module.i32.const(node.value);
    } else if (node instanceof Nodes.FloatLiteral) {
      return module.f64.const(node.value);
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
    if ($.functions.length > 1) {
      $.functions.forEach($ => $.errors.push(new Error('You can only export non-overloaded functions')));
    } else {
      const fun = $.functions[0];
      createdFunctions.push(emitFunction(fun.functionNode, module, document));
      if (fun.isExported) {
        module.addFunctionExport(fun.functionNode.functionName.name, fun.functionNode.functionName.name);
      }
    }
  });

  module.setFunctionTable(createdFunctions);

  return module;
}

// export function emit(node: nodes.Node, module: binaryen.Module) {
//   if (!(node instanceof nodes.DocumentNode) && !module) {
//     throw new Error('A module is required');
//   }

//   if (node instanceof nodes.DocumentNode) {
//     if (!module) module = new binaryen.Module();

//     let fiF = module.addFunctionType('fiF', binaryen.f64, [binaryen.f64]);
//     let fiFF = module.addFunctionType('fiFF', binaryen.i64, [binaryen.f64, binaryen.f64]);

//     module.addImport('exp', 'imports', 'exp', fiF);
//     module.addImport('log', 'imports', 'log', fiF);
//     module.addImport('pow', 'imports', 'pow', fiFF);

//     let functions = node.children.filter($ => $ instanceof nodes.FunctionNode).map(x => emit(x, module));

//     let testSignature = module.addFunctionType(`test$$signature`, binaryen.f64 /*ret*/, [
//       /*params*/
//     ]);
//     let testFunction = module.addFunction(
//       'test',
//       testSignature,
//       [
//         /*params*/
//       ],
//       module.return(
//         module.f64.add(
//           module.f64.load(0 /*offset */, 8, module.i32.const(0)),
//           module.f64.load(0 /*offset */, 8, module.i32.const(8))
//         )
//       )
//     );
//     module.addExport('test', 'test');

//     functions.push(testFunction);

//     // console.log(node.inspect());
//     module.setFunctionTable(functions);

//     return module;
//   } else if (node instanceof nodes.BinaryExpressionNode) {
//     // const isAssignment = ['=', '+=', '-=', '*=', '/='].indexOf(node.operator) != -1;

//     const isComparison = node.operator in comparisonMap;
//     const isPow = node.operator == '**';
//     const isMath = node.operator in mathOperatorsMap;

//     if (isPow) {
//       if (node.rhs instanceof nodes.FloatLiteral && node.rhs.value == 2) {
//         return module.f64.mul(emit(node.lhs, module), emit(node.lhs, module));
//       }
//       return module.callImport('pow', [emit(node.lhs, module), emit(node.rhs, module)], binaryen.f64);
//     } else if (isComparison) {
//       return module.f64[comparisonMap[node.operator]](emit(node.lhs, module), emit(node.rhs, module));
//     } else if (isMath) {
//       return module.f64[mathOperatorsMap[node.operator]](emit(node.lhs, module), emit(node.rhs, module));
//     } else {
//       console.error(`<<<<< UNKNOWN OPERATOR: ${node.operator}`);
//       return module.nop();
//     }
//   } else if (node instanceof nodes.VariableReferenceNode) {
//     return module.f64.load(0 /*offset */, 8 /* byte alignment */, module.i32.const(node..position * 8));
//   } else if (node instanceof nodes.FloatLiteral) {
//     return module.f64.const(node.value);
//   // } else if (node instanceof nodes.TernaryExpressionNode) {
//   //   return module.if(emit(node.condition, module), emit(node.truePart, module), emit(node.falsePart, module));
//   } else if (node instanceof nodes.UnaryExpressionNode) {
//     switch (node.operator) {
//       case '-':
//         return module.f64.neg(emit(node.rhs, module));
//       case 'exp':
//         return module.callImport('exp', [emit(node.rhs, module)], binaryen.f64);
//       case 'rand':
//         return module.callImport('rand', [emit(node.rhs, module)], binaryen.f64);
//       case 'ln':
//         return module.callImport('log', [emit(node.rhs, module)], binaryen.f64);
//       case 'abs':
//         return module.f64.abs(emit(node.rhs, module));
//       case 'sqrt':
//         return module.f64.sqrt(emit(node.rhs, module));
//     }
//     console.error(`<<<<< UNKNOWN OPERATOR: ${node.operator}`);
//     return module.nop();
//   } else if (node instanceof nodes.BlockNode) {
//     return module.block(node.name || ``, node.children.map(x => emit(x, module)));
//   } else if (node instanceof nodes.FunctionNode) {
//     let functionSignature = module.addFunctionType(`${node.name}$$signature`, binaryen.none /*ret*/, [
//       /*params*/
//     ]);

//     // Create the function
//     let theFunction = module.addFunction(
//       node.name,
//       functionSignature,
//       [
//         /*params*/
//       ],
//       emit(node.body, module)
//     );
//     module.addExport(node.name, node.name);

//     return theFunction;
//   }
//   throw new Error('Cannot emit node ' + (node.constructor as any).name);
// }
