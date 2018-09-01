import { Type, f32, i32, bool } from '../parser/types';

import * as ast from '@webassemblyjs/ast';

export interface BinaryOperation {
  lhsType: Type;
  rhsType: Type;
  operator: string;
  outputType: Type;
  generateCode(lhs, rhs);
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
    generateCode: (lhs, rhs) =>
      ast.instruction('i32.and', [
        ast.instruction('i32.ne', [lhs, ast.objectInstruction('const', 'i32', [ast.numberLiteralFromRaw(0)])]),
        ast.instruction('i32.ne', [rhs, ast.objectInstruction('const', 'i32', [ast.numberLiteralFromRaw(0)])])
      ])
  },
  {
    lhsType: booleanType,
    rhsType: booleanType,
    outputType: booleanType,
    operator: '==',
    generateCode: (lhs, rhs) =>
      ast.instruction('i32.eq', [ast.instruction('i32.eqz', [lhs]), ast.instruction('i32.eqz', [rhs])])
  },
  {
    lhsType: booleanType,
    rhsType: booleanType,
    outputType: booleanType,
    operator: 'or',
    generateCode: (lhs, rhs) =>
      ast.instruction('i32.or', [
        ast.instruction('i32.ne', [lhs, ast.objectInstruction('const', 'i32', [ast.numberLiteralFromRaw(0)])]),
        ast.instruction('i32.ne', [rhs, ast.objectInstruction('const', 'i32', [ast.numberLiteralFromRaw(0)])])
      ])
  },

  // INT
  {
    lhsType: i32Type,
    rhsType: i32Type,
    outputType: i32Type,
    operator: '+',
    generateCode: (lhs, rhs) => ast.instruction('i32.add', [lhs, rhs])
  },
  {
    lhsType: i32Type,
    rhsType: i32Type,
    outputType: i32Type,
    operator: '-',
    generateCode: (lhs, rhs) => ast.instruction('i32.sub', [lhs, rhs])
  },
  {
    lhsType: i32Type,
    rhsType: i32Type,
    outputType: i32Type,
    operator: '*',
    generateCode: (lhs, rhs) => ast.instruction('i32.mul', [lhs, rhs])
  },
  {
    lhsType: i32Type,
    rhsType: i32Type,
    outputType: i32Type,
    operator: '/',
    generateCode: (lhs, rhs) => ast.instruction('i32.div_s', [lhs, rhs])
  },
  {
    lhsType: i32Type,
    rhsType: i32Type,
    outputType: i32Type,
    operator: '^',
    generateCode: (lhs, rhs) => ast.instruction('i32.xor', [lhs, rhs])
  },
  {
    lhsType: i32Type,
    rhsType: i32Type,
    outputType: booleanType,
    operator: '==',
    generateCode: (lhs, rhs) => ast.instruction('i32.eq', [lhs, rhs])
  },
  {
    lhsType: i32Type,
    rhsType: i32Type,
    outputType: booleanType,
    operator: '>=',
    generateCode: (lhs, rhs) => ast.instruction('i32.ge_s', [lhs, rhs])
  },
  {
    lhsType: i32Type,
    rhsType: i32Type,
    outputType: booleanType,
    operator: '<=',
    generateCode: (lhs, rhs) => ast.instruction('i32.le_s', [lhs, rhs])
  },
  {
    lhsType: i32Type,
    rhsType: i32Type,
    outputType: booleanType,
    operator: '>',
    generateCode: (lhs, rhs) => ast.instruction('i32.gt_s', [lhs, rhs])
  },
  {
    lhsType: i32Type,
    rhsType: i32Type,
    outputType: booleanType,
    operator: '<',
    generateCode: (lhs, rhs) => ast.instruction('i32.lt_s', [lhs, rhs])
  },
  {
    lhsType: i32Type,
    rhsType: i32Type,
    outputType: booleanType,
    operator: '!=',
    generateCode: (lhs, rhs) => ast.instruction('i32.ne', [lhs, rhs])
  },

  // FLOAT
  {
    lhsType: f32Type,
    rhsType: f32Type,
    outputType: f32Type,
    operator: '+',
    generateCode: (lhs, rhs) => ast.instruction('f32.add', [lhs, rhs])
  },
  {
    lhsType: f32Type,
    rhsType: f32Type,
    outputType: f32Type,
    operator: '-',
    generateCode: (lhs, rhs) => ast.instruction('f32.sub', [lhs, rhs])
  },
  {
    lhsType: f32Type,
    rhsType: f32Type,
    outputType: f32Type,
    operator: '*',
    generateCode: (lhs, rhs) => ast.instruction('f32.mul', [lhs, rhs])
  },
  {
    lhsType: f32Type,
    rhsType: f32Type,
    outputType: f32Type,
    operator: '/',
    generateCode: (lhs, rhs) => ast.instruction('f32.div', [lhs, rhs])
  }
];

export function findBuiltInTypedBinaryOperation(
  operator: string,
  lhsType: Type,
  rhsType: Type
): BinaryOperation | null {
  const subset = binaryOperations.filter($ => $.operator == operator);

  const ret = subset.find($ => $.lhsType.equals(lhsType) && $.rhsType.equals(rhsType));

  if (!ret) throw new Error(`Cannot resolve type of ${lhsType} (${operator}) ${rhsType}`);

  return ret;
}
