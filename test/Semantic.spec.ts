declare var describe: any, console: any;

import * as expect from 'expect';
import { findNodesByType, Nodes, PhaseFlags } from '../dist/compiler/nodes';
import { folderBasedTest, testParseToken, testParseTokenFailsafe, PhasesResult } from './TestHelpers';
import { ParsingContext } from '../dist/compiler/ParsingContext';
import { printNode } from '../dist/utils/nodePrinter';
import { printAST } from '../dist/utils/astPrinter';
import { nodeSystem } from '../dist/support/NodeSystem';

const parsingContext = new ParsingContext(nodeSystem);
parsingContext.paths.push(nodeSystem.resolvePath(__dirname, '../stdlib'));

describe('Semantic', function () {
  const semanticPhases = function (txt: string, fileName: string): PhasesResult {
    parsingContext.reset();
    const moduleName = parsingContext.getModuleFQNForFile(fileName);
    parsingContext.invalidateModule(moduleName);
    parsingContext.getParsingPhaseForContent(fileName, moduleName, txt);
    return { parsingContext, document: parsingContext.getPhase(moduleName, PhaseFlags.Semantic) };
  };

  const scopePhases = function (txt: string, fileName: string): PhasesResult {
    parsingContext.reset();
    const moduleName = parsingContext.getModuleFQNForFile(fileName);
    parsingContext.invalidateModule(moduleName);
    parsingContext.getParsingPhaseForContent(fileName, moduleName, txt);
    return { parsingContext, document: parsingContext.getPhase(moduleName, PhaseFlags.Scope) };
  };

  describe('Files', () => {
    folderBasedTest(
      'test/fixtures/semantics/*.lys',
      scopePhases,
      async (result, err) => {
        if (err) throw err;
        if (!result) throw new Error('No result');
        return printAST(result.document);
      },
      '.ast'
    );

    folderBasedTest(
      'test/fixtures/semantics/*.lys',
      semanticPhases,
      async (result, err) => {
        if (err) throw err;
        if (!result) throw new Error('No result');
        return printNode(result.document);
      },
      '.desugar'
    );

    describe('Compilation-execution-tests-desugar', () => {
      folderBasedTest(
        '**/execution/*.lys',
        semanticPhases,
        async (result, err) => {
          if (err) throw err;
          if (!result) throw new Error('No result');
          return printNode(result.document);
        },
        '.desugar'
      );
    });
  });

  let semanticTestCount = 0;

  function getFileName() {
    return `tests/semantic_tests_${semanticTestCount++}.lys`;
  }

  function test(literals: any, ...placeholders: any[]) {
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

      async (_, e) => {
        if (e) throw e;
        expect(parsingContext.messageCollector.hasErrors()).toEqual(false);
      },
      scopePhases
    );
  }

  function testToFail(literals: any, ...placeholders: any) {
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

      async (result, err) => {
        const didFail = !!err || !result || parsingContext.messageCollector.hasErrors();
        if (!didFail && result) {
          console.log(result);
          console.log(printAST(result.document));
          console.log(result.document.scope!.inspect());
        }
        expect(didFail).toEqual(true);
      },
      scopePhases,
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
      enum x {
        Nila
      }

      fun f(x: x): x = ???
    `;

    test`
      enum x {
        Nila
      }

      fun f(x: x): x = ???
    `;

    testToFail`
      enum N {
        x
      }

      fun x(): void = ???
    `;

    testToFail`
      enum x {
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

      async (result, e) => {
        if (e) throw e;
        if (!result) throw new Error('No result');
        const refs = findNodesByType(result.document, Nodes.BlockNode);
        const statements = refs[0].statements;
        expect(statements.length).toBe(2);
      },
      scopePhases
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

      async (result, e) => {
        if (e) throw e;
        if (!result) throw new Error('No result');
        const refs = findNodesByType(result.document, Nodes.BlockNode);
        const statements = refs[0].statements;
        expect(statements.length).toBe(2);
      },
      scopePhases
    );
  });

  describe('namespaces', () => {
    test`

      type BB = %injected
      type AA = BB
      impl BB {
        fun gta(): i32 = 1
      }

      fun test(a: i32): boolean = BB.gta()
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

      fun test(a: i32): i32 = ExistentType.gtax()
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

      async (result, e) => {
        if (e) throw e;
        if (!result) throw new Error('No result');
        const refs = findNodesByType(result.document, Nodes.BlockNode);
        const statements = refs[0].statements;
        expect(statements.length).toBe(1);
      },
      scopePhases
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

      async (result, e) => {
        if (e) throw e;
        if (!result) throw new Error('No result');
        const refs = findNodesByType(result.document, Nodes.BlockNode);
        const statements = refs[0].statements;
        expect(statements.length).toBe(3);
      },
      scopePhases
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

      async (result, e) => {
        if (e) throw e;
        if (!result) throw new Error('No result');
        const refs = findNodesByType(result.document, Nodes.BlockNode);
        const statements = refs[0].statements;
        expect(statements.length).toBe(2);
      },
      scopePhases
    );
  });

  describe('module resolution', () => {
    testParseToken(
      `
        fun a(): void = {}
      `,
      getFileName(),

      async (result, e) => {
        if (e) throw e;
        if (!result) throw new Error('No result');
        expect(result.document.scope!.importedModules.has('system::core::native')).toEqual(true);
      },
      scopePhases
    );

    testParseToken(
      `
        import system::core
        import system::random

        fun a(): void = {}
      `,
      getFileName(),

      async (result, e) => {
        if (e) throw e;
        if (!result) throw new Error('No result');
        expect(result.document.scope!.importedModules.has('system::core')).toEqual(true);
        expect(result.document.scope!.importedModules.has('system::random')).toEqual(true);
      },
      scopePhases
    );

    testParseToken(
      `
        fun a(): i32 = system::random::nextInt()
      `,
      getFileName(),

      async (result, e) => {
        if (e) throw e;
        if (!result) throw new Error('No result');
        expect(result.document.scope!.importedModules.has('system::core::i32')).toEqual(true);
      },
      scopePhases
    );

    testParseToken(
      `
        fun hash(): i32 = 1
      `,
      getFileName(),

      async (result, e) => {
        if (e) throw e;
        if (!result) throw new Error('No result');
        expect(result.document.scope!.importedModules.has('system::core::i32')).toEqual(true);
      },
      scopePhases
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
      import system::core::string
    `;

    testToFail`
      import system::moduleThatDoesNotExist
    `;

    test`
      type i32 = %stack { lowLevelType="i32" byteSize=4 }
      var a: i32 = 1
    `;

    testToFail`var a: i32a = 1`;

    testToFail`
      type i32 = %stack { lowLevelType="i32" byteSize=4 }
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
