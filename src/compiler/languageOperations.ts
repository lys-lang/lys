import { Type, f32, i32, bool } from '../parser/types';
import binaryen = require('binaryen');

export interface BinaryOperation {
  lhsType: Type;
  rhsType: Type;
  operator: string;
  outputType: Type;
  generateCode(lhs: binaryen.Expression, rhs: binaryen.Expression, module: binaryen.Module): binaryen.Expression;
}

const f32Type = new f32();
const booleanType = new bool();
const i32Type = new i32();

export const binaryOperations: BinaryOperation[] = [
  {
    lhsType: booleanType,
    rhsType: booleanType,
    outputType: booleanType,
    operator: 'and',
    generateCode: (lhs, rhs, module) => module.i32.ne(module.i32.and(lhs, rhs), module.i32.const(0))
  },
  {
    lhsType: booleanType,
    rhsType: booleanType,
    outputType: booleanType,
    operator: 'or',
    generateCode: (lhs, rhs, module) => module.i32.ne(module.i32.or(lhs, rhs), module.i32.const(0))
  },

  // INT
  {
    lhsType: i32Type,
    rhsType: i32Type,
    outputType: i32Type,
    operator: '+',
    generateCode: (lhs, rhs, module) => module.i32.add(lhs, rhs)
  },
  {
    lhsType: i32Type,
    rhsType: i32Type,
    outputType: i32Type,
    operator: '-',
    generateCode: (lhs, rhs, module) => module.i32.sub(lhs, rhs)
  },
  {
    lhsType: i32Type,
    rhsType: i32Type,
    outputType: i32Type,
    operator: '*',
    generateCode: (lhs, rhs, module) => module.i32.mul(lhs, rhs)
  },
  {
    lhsType: i32Type,
    rhsType: i32Type,
    outputType: i32Type,
    operator: '/',
    generateCode: (lhs, rhs, module) => module.i32.div_s(lhs, rhs)
  },
  {
    lhsType: i32Type,
    rhsType: i32Type,
    outputType: i32Type,
    operator: '^',
    generateCode: (lhs, rhs, module) => module.i32.xor(lhs, rhs)
  },
  {
    lhsType: i32Type,
    rhsType: i32Type,
    outputType: i32Type,
    operator: '==',
    generateCode: (lhs, rhs, module) => module.i32.eq(lhs, rhs)
  },
  {
    lhsType: i32Type,
    rhsType: i32Type,
    outputType: i32Type,
    operator: '>=',
    generateCode: (lhs, rhs, module) => module.i32.gt_s(lhs, rhs)
  },
  {
    lhsType: i32Type,
    rhsType: i32Type,
    outputType: i32Type,
    operator: '<=',
    generateCode: (lhs, rhs, module) => module.i32.lt_s(lhs, rhs)
  },
  {
    lhsType: i32Type,
    rhsType: i32Type,
    outputType: i32Type,
    operator: '!=',
    generateCode: (lhs, rhs, module) => module.i32.ne(lhs, rhs)
  },

  // FLOAT
  {
    lhsType: f32Type,
    rhsType: f32Type,
    outputType: f32Type,
    operator: '+',
    generateCode: (lhs, rhs, module) => module.f32.add(lhs, rhs)
  },
  {
    lhsType: f32Type,
    rhsType: f32Type,
    outputType: f32Type,
    operator: '-',
    generateCode: (lhs, rhs, module) => module.f32.sub(lhs, rhs)
  },
  {
    lhsType: f32Type,
    rhsType: f32Type,
    outputType: f32Type,
    operator: '*',
    generateCode: (lhs, rhs, module) => module.f32.mul(lhs, rhs)
  },
  {
    lhsType: f32Type,
    rhsType: f32Type,
    outputType: f32Type,
    operator: '/',
    generateCode: (lhs, rhs, module) => module.f32.div(lhs, rhs)
  }
];

export function findBuiltInTypedBinaryOperation(
  operator: string,
  lhsType: Type,
  rhsType: Type
): BinaryOperation | null {
  const subset = binaryOperations.filter($ => $.operator == operator);

  const ret = subset.find($ => lhsType.equals($.lhsType) && rhsType.equals($.rhsType));

  if (!ret) throw new Error(`Cannot resolve type of ${lhsType} (${operator}) ${rhsType}`);

  return ret;
}
