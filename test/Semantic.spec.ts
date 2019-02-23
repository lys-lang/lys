declare var describe, it, require, console;

import * as expect from 'expect';
import { findNodesByType, Nodes } from '../dist/parser/nodes';
import { walkPreOrder } from '../dist/parser/walker';
import { CanonicalPhaseResult } from '../dist/parser/phases/canonicalPhase';
import { SemanticPhaseResult } from '../dist/parser/phases/semanticPhase';
import { folderBasedTest, printAST, testParseToken, testParseTokenFailsafe } from './TestHelpers';
import { ScopePhaseResult } from '../dist/parser/phases/scopePhase';
import { PhaseResult } from '../dist/parser/phases/PhaseResult';
import { ParsingContext } from '../dist/parser/ParsingContext';
import { printNode } from '../dist/utils/nodePrinter';

const fixParents = walkPreOrder((node: Nodes.Node, _: PhaseResult, parent: Nodes.Node) => {
  node.parent = parent;
  return node;
});

const parsingContext = new ParsingContext();

describe('Semantic', function() {
  const phases = function(txt: string, fileName: string): ScopePhaseResult {
    parsingContext.reset();
    const parsing = parsingContext.getParsingPhaseForContent(fileName, txt);
    const canonical = new CanonicalPhaseResult(parsing);
    const semantic = new SemanticPhaseResult(canonical, fileName);
    const scope = new ScopePhaseResult(semantic);
    return scope;
  };

  const phases1 = function(txt: string, fileName: string): SemanticPhaseResult {
    parsingContext.reset();
    const parsing = parsingContext.getParsingPhaseForContent(fileName, txt);
    const canonical = new CanonicalPhaseResult(parsing);
    const semantic = new SemanticPhaseResult(canonical, fileName);
    return semantic;
  };

  describe('Files', () => {
    folderBasedTest(
      'test/fixtures/semantics/*.lys',
      phases,
      async (result, err) => {
        if (err) {
          // console.log(printErrors(result.document, result.errors));
          throw err;
        }
        return printAST(result.document);
      },
      '.ast'
    );
    folderBasedTest(
      'test/fixtures/semantics/*.lys',
      phases1,
      async (result, err) => {
        if (err) {
          // console.log(printErrors(result.document, result.errors));
          throw err;
        }
        return printNode(result.document);
      },
      '.desugar'
    );
  });

  let semanticTestCount = 0;

  function getFileName() {
    return `semantic_tests_${semanticTestCount++}.lys`;
  }

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
      result,
      getFileName(),
      'Document',
      async (result, e) => {
        if (e) throw e;
        expect(result.isSuccess()).toEqual(true, 'Phase did not succeed');
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
      result,
      'MUST_FAIL_' + getFileName(),
      'Document',
      async (phaseResult, err) => {
        const didFail = !!err || !phaseResult || !phaseResult.isSuccess();
        if (!didFail) {
          console.log(result);
          console.log(printAST(phaseResult.document));
          console.log(phaseResult.document.closure.deepInspect());
        }
        expect(didFail).toEqual(true, 'It must have failed');
      },
      phases,
      false
    );
  }
  describe('Duplicated parameters', () => {
    test`
      fun test(a: i32, b: i32): i32 = 1
    `;
    testToFail`
      fun test(a: i32, a: i32): i32 = 1
    `;
  });

  describe('scope shadowing', () => {
    test`
      type x {
        Nila
      }

      fun f(x: x): x = ???
    `;

    test`
      type x {
        Nila
      }

      fun f(x: x): x = ???
    `;

    testToFail`
      type N {
        x
      }

      fun x(): void = ???
    `;

    testToFail`
      type x {
        N
      }

      fun x(): void = ???
    `;

    testToFail`
      struct x()

      fun x(): void = ???
    `;
  });

  describe('conditionals', () => {
    test`
      fun gcd(x: i32, y: i32): i32 =
        if (x > y)
          gcd(x - y, y)
        else if (x < y)
          gcd(x, y - x)
        else
          x
    `;

    testParseToken(
      `
        var x = 1
        var b = false
        fun a(): void = {
          if (x < 3) a()
          b
        }`,
      getFileName(),
      'Document',
      async (x, e) => {
        if (e) throw e;
        const refs = findNodesByType(x.document, Nodes.BlockNode);
        const statements = refs[0].statements;
        expect(statements.length).toBe(2);
      },
      phases
    );

    testParseToken(
      `
        var x = 1
        var b = false
        fun a(): void = {
          if (x < 3) { a() }
          b
        }`,
      getFileName(),
      'Document',
      async (x, e) => {
        if (e) throw e;
        const refs = findNodesByType(x.document, Nodes.BlockNode);
        const statements = refs[0].statements;
        expect(statements.length).toBe(2);
      },
      phases
    );
  });

  describe('namespaces', () => {
    test`

      type BB = %injected
      type AA = BB
      impl BB {
        fun gta(): i32 = 1
      }

      fun test(a: i32): boolean = BB#gta()
    `;

    testToFail`

      type BB = %injected
      type AA = BB

      impl BB {
        fun gtax(): i32 = 1
      }

      fun test(a: i32): i32 = gtax()
    `;

    test`

      type BB = %injected

      impl BB {
        var x = 1
        fun gtax(): i32 = x
      }

      fun test(a: i32): i32 = BB.gtax()
    `;

    test`
      struct ExistentType()
      impl ExistentType {
        // stub
      }
    `;

    test`
      struct ExistentType()

      impl ExistentType {
        fun gtax(): i32 = 1
      }

      fun test(a: i32): i32 = ExistentType#gtax()
    `;
  });

  describe('Pattern matching', () => {
    test`
      fun test(a: i32): boolean = match a {
        case 1 -> true
        else -> false
      }
    `;
    testToFail`
      fun test(a: i32): void = match a { }
    `;
    testToFail`
      fun test(a: i32): i32 = match a { else -> 1 }
    `;
  });

  describe('block', () => {
    testParseToken(
      `
        fun map(a: i32,b: i32): i32 = a

        fun a(): i32 = {
          map(1,3)
        }`,
      getFileName(),
      'Document',
      async (x, e) => {
        if (e) throw e;
        const refs = findNodesByType(x.document, Nodes.BlockNode);
        const statements = refs[0].statements;
        expect(statements.length).toBe(1);
      },
      phases
    );
    testParseToken(
      `
        fun main(): i32 = {
          var a: i32 = 1
          a = 2
          a
        }
      `,
      getFileName(),
      'Document',
      async (x, e) => {
        if (e) throw e;
        const refs = findNodesByType(x.document, Nodes.BlockNode);
        const statements = refs[0].statements;
        expect(statements.length).toBe(3);
      },
      phases
    );
    testParseToken(
      `
        fun map(a: i32,b: i32): i32 = a
        var b = false
        fun a(): i32 = {
          (1).map(3)
          b
        }`,
      getFileName(),
      'Document',
      async (x, e) => {
        if (e) throw e;
        const refs = findNodesByType(x.document, Nodes.BlockNode);
        const statements = refs[0].statements;
        expect(statements.length).toBe(2);
      },
      phases
    );
  });

  describe('module resolution', () => {
    testParseToken(
      `
        fun a(): void = {}
      `,
      getFileName(),
      'Document',
      async (x, e) => {
        if (e) throw e;
        expect(x.document.closure.importedModules.has('system::core')).toEqual(true);
      },
      phases
    );

    testParseToken(
      `
        import system::core
        import * from system::random

        fun a(): void = {}
      `,
      getFileName(),
      'Document',
      async (x, e) => {
        if (e) throw e;
        expect(x.document.closure.importedModules.has('system::core')).toEqual(true);
        expect(x.document.closure.importedModules.has('system::random')).toEqual(true);
      },
      phases
    );

    testParseToken(
      `
        fun a(): i32 = system::random::nextInt()
      `,
      getFileName(),
      'Document',
      async (x, e) => {
        if (e) throw e;
        expect(x.document.closure.importedModules.has('system::core')).toEqual(true);
      },
      phases
    );

    testParseToken(
      `
        fun hash(): i32 = system::hash::keccak::keccak("test")
      `,
      getFileName(),
      'Document',
      async (x, e) => {
        if (e) throw e;
        expect(x.document.closure.importedModules.has('system::core')).toEqual(true);
      },
      phases
    );
  });

  describe('Scopes', () => {
    test`
      val a = true
      fun test(): boolean = a
    `;

    test`
      val a = true
      fun test(): boolean = a
    `;

    test`
      val a = true
      fun test(): boolean = a
    `;

    test`
      fun test(): void = test
    `;
    test`
      var a = 1
      fun test(a: i32): i32 = a
    `;

    test`
      import system::string
    `;

    testToFail`
      import system::stringThatDoesNotExist
    `;

    test`
      type i32 = %stack { lowLevelType="i32" }
      var a: i32 = 1
    `;

    testToFail`var a: i32a = 1`;

    testToFail`
      type i32 = %stack { lowLevelType="i32" }
      var i32 = 1
    `;

    test`
      var a = 1
      var b = a
    `;

    testToFail`
      fun test(a: i32): i32 = b
    `;
  });
});
