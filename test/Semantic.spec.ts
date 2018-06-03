declare var describe, it, require, console;

import { Grammars, Parser, IToken } from 'ebnf';
import {
  testParseToken,
  describeTree,
  printBNF,
  testParseTokenFailsafe,
  folderBasedTest,
  printAST
} from './TestHelpers';
import { parser } from '../dist/grammar';
import * as Nodes from '../dist/parser/nodes';
import * as expect from 'expect';
import { canonicalPhase } from '../dist/parser/phases/canonicalPhase';
import { semanticPhase } from '../dist/parser/phases/semanticPhase';
import { findAllErrors } from '../dist/parser/phases/findAllErrors';
import { scopePhase } from '../dist/parser/phases/scopePhase';

let inspect = require('util').inspect;

describe('Semantic', function() {
  const phases = [canonicalPhase, semanticPhase, scopePhase, findAllErrors];
  describe('Files', () => {
    folderBasedTest('test/fixtures/semantics/*.ro', phases, (result: any) => printAST(result), '.ast');
  });

  function test(literals, ...placeholders) {
    let result = '';

    // interleave the literals with the placeholders
    for (let i = 0; i < placeholders.length; i++) {
      result += literals[i];
      result += placeholders[i];
    }

    // add the last literal
    result += literals[literals.length - 1];
    testParseToken(
      parser,
      result,
      'Document',
      document => {
        expect(document.errors.length).toEqual(0);
      },
      phases
    );
  }

  function testToFail(literals, ...placeholders) {
    let result = '';

    // interleave the literals with the placeholders
    for (let i = 0; i < placeholders.length; i++) {
      result += literals[i];
      result += placeholders[i];
    }

    // add the last literal
    result += literals[literals.length - 1];
    testParseTokenFailsafe(
      parser,
      result,
      'Document',
      document => {
        expect(document.errors.length).toBeGreaterThan(0);
      },
      phases,
      false,
      result + ' must fail'
    );
  }
  describe('Duplicated parameters', () => {
    test`
      type i32 = ???
      fun test(a: i32, b: i32) = 1
    `;
    testToFail`
      type i32 = ???
      fun test(a: i32, a: i32) = 1
    `;
  });

  describe('Pattern matching', () => {
    test`
      type i32 = ???
      fun test(a: i32) = a match {
        case 1 -> true
        else -> false
      }
    `;
    testToFail`
      type i32 = ???
      fun test(a: i32) = a match { }
    `;
    testToFail`
      type i32 = ???
      fun test(a: i32) = a match { else -> 1 }
    `;
  });

  describe('scope resolution', () => {
    testParseToken(
      parser,
      `type i32 = ??? var a = 1 fun x(a: i32) = a`,
      'Document',
      x => {
        const refs = Nodes.findNodesByType(x, Nodes.VariableReferenceNode);
        const resolved = refs[0].closure.get(refs[0].variable.name);
        expect(resolved.node.astNode.type).toBe('Parameter');
      },
      phases
    );
    testParseToken(
      parser,
      `const c = 1 var a = c`,
      'Document',
      x => {
        const refs = Nodes.findNodesByType(x, Nodes.VariableReferenceNode);
        const resolved = refs[0].closure.get(refs[0].variable.name);
        expect(resolved.node.astNode.type).toBe('ConstDirective');
      },
      phases
    );
    testParseToken(
      parser,
      `type i32 = ??? var a = 1 fun x(b: i32) = a`,
      'Document',
      x => {
        const refs = Nodes.findNodesByType(x, Nodes.VariableReferenceNode);
        const resolved = refs[0].closure.get(refs[0].variable.name);
        expect(resolved.node.astNode.type).toBe('VarDirective');
      },
      phases
    );
  });

  describe('Closures', () => {
    test`
      const a = true
      fun test() = a
    `;

    test`
      const a = true
      fun test() = a
    `;

    test`
      fun test() = test
    `;
    test`
      type i32 = ???
      var a = 1
      fun test(a: i32) = a
    `;
    testToFail`var a = a`;

    test`type i32 = ??? var a: i32 = 1`;

    testToFail`var a: i32 = 1`;

    testToFail`var b = 1 var a: b = 1`;
    test`var i32 = 1`;
    testToFail`type i32 = ??? var i32 = 1`;

    test`var a = 1 var b = a`;

    testToFail`
      type i32 = ???
      fun test(a: i32) = b
    `;
  });
});
