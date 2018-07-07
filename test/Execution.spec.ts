declare var describe;

import { test } from './ExecutionHelper';
import { expect } from 'chai';

describe('return types', () => {
  test(
    'void return',
    `
      type void
      fun main(): void = {
        // stub
      }
    `,
    async x => {
      expect(x.exports.main()).to.eq(undefined);
    }
  );
});

describe('mutability', () => {
  test(
    'void return',
    `
      type i32
      fun main(x: i32): i32 = {
        var a: i32 = 1

        if (x == 1) {
          a = 3
        } else {}

        a
      }
    `,
    async x => {
      expect(x.exports.main(1)).to.eq(3);
      expect(x.exports.main(3)).to.eq(1);
    }
  );

  test(
    'void return, if w/o else',
    `
      type i32
      fun main(x: i32): i32 = {
        var a: i32 = 1

        if (x == 1) {
          a = 3
        }

        a
      }
    `,
    async x => {
      expect(x.exports.main(1)).to.eq(3);
      expect(x.exports.main(3)).to.eq(1);
    }
  );
});

describe('math', () => {
  test(
    'sum',
    `
      type i32
      type f32

      fun add(a: i32, b: i32): i32 = a + b

      fun add2(a: f32, b: f32): f32 = {
        a + b
      }
    `,
    async x => {
      expect(x.exports.add(1, 2)).to.eq(3);
      expect(x.exports.add(-1, 2)).to.eq(1);
      expect(x.exports.add2(1, 2)).to.eq(3);
      expect(x.exports.add2(0.2, 0.3)).to.eq(0.5);
      expect(x.exports.add2(-1, 2)).to.eq(1);
    }
  );

  test(
    'fibo',
    `
      type i32

      private fun fibo(n: i32, x1: i32, x2: i32): i32 = {
        if (n > 0) {
          fibo(n - 1, x2, x1 + x2)
        } else {
          x1
        }
      }

      fun fib(n: i32): i32 = {
        fibo(n, 0, 1)
      }

      fun test(): i32 = {
        fib(46) // must be 1836311903
      }
    `,
    async x => {
      expect(x.exports.fib(46)).to.eq(1836311903);
      expect(x.exports.test()).to.eq(1836311903);
    }
  );

  test(
    'fibo 2',
    `
      type i32

      private fun fibo(n: i32, x1: i32, x2: i32): i32 =
        if (n > 0)
          fibo(n - 1, x2, x1 + x2)
        else
          x1

      fun fib(n: i32): i32 = fibo(n, 0, 1)

      fun test(): i32 = fib(46) // must be 1836311903
    `,
    async x => {
      expect(x.exports.fib(46)).to.eq(1836311903);
      expect(x.exports.test()).to.eq(1836311903);
    }
  );

  test(
    'fibo 3',
    `
      type i32

      private fun fibo(n: i32, a: i32, b: i32): i32 =
        n match {
          case 0 -> a
          case 1 -> b
          else   -> fibo(n - 1, b, a + b)
        }

      fun fib(n: i32): i32 = fibo(n, 0, 1)

      fun test(): i32 = fib(46) // must be 1836311903
    `,
    async x => {
      expect(x.exports.fib(46)).to.eq(1836311903);
      expect(x.exports.test()).to.eq(1836311903);
    }
  );

  test(
    'overload infix',
    `
      type i32
      type f32

      private fun sum(a: f32, b: f32): f32 = a + b
      private fun sum(a: i32, b: i32): i32 = a + b

      fun testInt(a: i32, b: i32): i32 = a sum b
      fun testFloat(a: f32, b: f32): f32 = a sum b
    `,
    async x => {
      expect(x.exports.testInt(46, 3)).to.eq(49);
      expect(x.exports.testFloat(0.2, 0.3)).to.eq(0.5);
    }
  );

  test(
    'pattern matching 1',
    `
      type i32
      type boolean

      fun test1(a: i32): boolean =
        a match {
          case 1 -> true
          else -> false
        }

      fun test2(a: i32): i32 =
        a match {
          case 10 -> 1
          case 20 -> 2
          case 30 -> 3
          case 40 -> 4
          case 50 -> 5
          case 60 -> 6
          case 70 -> 7
          case 80 -> 8
          case 90 -> 9
          else -> 0
        }

      fun test3(a: i32): boolean =
        (a + 1) match {
          case 1 -> true
          else -> false
        }
    `,
    async x => {
      expect(x.exports.test1(1)).to.eq(-1);
      expect(x.exports.test1(0)).to.eq(0);
      expect(x.exports.test2(10)).to.eq(1);
      expect(x.exports.test2(20)).to.eq(2);
      expect(x.exports.test2(30)).to.eq(3);
      expect(x.exports.test2(40)).to.eq(4);
      expect(x.exports.test2(50)).to.eq(5);
      expect(x.exports.test2(60)).to.eq(6);
      expect(x.exports.test2(70)).to.eq(7);
      expect(x.exports.test2(80)).to.eq(8);
      expect(x.exports.test2(90)).to.eq(9);
      expect(x.exports.test2(700)).to.eq(0);
      expect(x.exports.test2(71)).to.eq(0);
      expect(x.exports.test2(-170)).to.eq(0);
      expect(x.exports.test2(0)).to.eq(0);
      expect(x.exports.test3(0)).to.eq(-1);
      expect(x.exports.test3(-1)).to.eq(0);
    }
  );
});
