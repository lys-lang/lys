declare var describe: any, it: any, console: any;

import { folderBasedTest, PhasesResult } from './TestHelpers';
import { printErrors } from '../dist/utils/errorPrinter';
import { expect } from 'chai';
import { annotations } from '../dist/compiler/annotations';
import { Nodes, PhaseFlags } from '../dist/compiler/nodes';
import { ParsingContext } from '../dist/compiler/ParsingContext';
import {
  UnionType,
  StructType,
  RefType,
  TypeAlias,
  Type,
  StackType,
  NativeTypes,
  TypeHelpers
} from '../dist/compiler/types';
import { printNode } from '../dist/utils/nodePrinter';
import { printAST } from '../dist/utils/astPrinter';
import { AstNodeError, LysScopeError } from '../dist/compiler/NodeError';
import { nodeSystem } from '../dist/support/NodeSystem';
import { failWithErrors } from '../dist/compiler/findAllErrors';
import { Scope } from '../dist/compiler/Scope';

const REF_TYPE = RefType.instance;

const parsingContext = new ParsingContext(nodeSystem);
parsingContext.paths.push(nodeSystem.resolvePath(__dirname, '../stdlib'));

const phases = function(txt: string, fileName: string): PhasesResult {
  parsingContext.reset();

  const moduleName = parsingContext.getModuleFQNForFile(fileName);
  parsingContext.invalidateModule(moduleName);
  const document = parsingContext.getParsingPhaseForContent(fileName, moduleName, txt);

  if (txt.includes(`#![no-std]`)) {
    document.annotate(new annotations.NoStd());
  }

  return { document: parsingContext.getPhase(moduleName, PhaseFlags.TypeCheck), parsingContext };
};

let n = 0;

function normalizeResult(input: string) {
  return input
    .split('\n')
    .map($ => $.trim())
    .filter($ => $.length)
    .join('\n');
}

function test(program: string, expectedType: string, expectedError: string, skip: boolean) {
  const number = n++;
  let label = '';

  program.replace(/\/\/\/(.+)$/gm, (_, group: any) => {
    label = label + group;
    return '';
  });

  label = label.trim();

  if (!label) label = `type inference test #${number}`;

  (skip ? it.skip : it)(label, async function(this: any) {
    this.timeout(10000);

    let document: Nodes.DocumentNode | void = void 0;

    try {
      const phaseResult = phases(program, `types_${number}.lys`);

      document = phaseResult.document;

      const expectedResult = normalizeResult(expectedType);

      const givenResult = normalizeResult(
        document.directives
          .map($ => {
            if ($ instanceof Nodes.TraitDirectiveNode) {
              const type = TypeHelpers.getNodeType($.traitName);
              return $.traitName.name + ' := ' + (type ? type.inspect(100) : '<ofType is NULL>');
            } else if (
              $ instanceof Nodes.OverloadedFunctionNode &&
              !$.functions.some($ => $.hasAnnotation(annotations.Injected))
            ) {
              return TypeHelpers.getNodeType($.functionName) + '';
            } else if ($ instanceof Nodes.VarDirectiveNode) {
              return `${$.decl.variableName.name} := ${
                TypeHelpers.getNodeType($.decl.variableName)
                  ? TypeHelpers.getNodeType($.decl.variableName)!.inspect(1)
                  : '<ofType is NULL>'
              }`;
            }
          })
          .filter($ => !!$)
          .join('\n')
      );

      expect(givenResult).to.eq(expectedResult);

      if (expectedError) {
        try {
          failWithErrors('type phase', phaseResult.parsingContext);
          throw new Error('x');
        } catch (e) {
          if ((e.message + '').includes('Hit max analysis pass count')) {
            throw e;
          }
          if (e.message === 'x') {
            throw new Error("Didn't fail (expecting " + expectedError + ')');
          } else {
            const expected = expectedError
              .trim()
              .split(/\n/g)
              .map($ => $.trim())
              .filter($ => !!$);
            expected.forEach($ => expect(e.message.replace(/([\s\r\n]+)/gm, ' ')).to.contain($));
          }
        }
      } else {
        failWithErrors('type phase', phaseResult.parsingContext);
      }
    } catch (e) {
      console.log(printErrors(parsingContext));

      if (document) {
        console.log(printNode(document));
        // console.log(printAST(document));
        // console.log(document.scope!.inspect(false, true));
      }

      if (parsingContext.messageCollector.errors.some($ => $ instanceof LysScopeError)) {
        parsingContext.modulesInContext.forEach(document => {
          if (document.scope) {
            console.log(document.scope.inspect());
          } else {
            console.log(document.moduleName + ' has no scope!');
          }
        });
      }

      // console.log(printTypeGraph(document.typeGraph));
      throw e;
    }
  });
}

function checkMainType(literals: any, ...placeholders: any) {
  let result = '';
  // interleave the literals with the placeholders
  for (let i = 0; i < placeholders.length; i++) {
    result += literals[i];
    result += placeholders[i];
  }

  // add the last literal
  result += literals[literals.length - 1];

  const parts = result.split('---');

  test(parts[0], parts[1], parts[2], false);
}

namespace checkMainType {
  export function skip(literals: any, ...placeholders: any) {
    let result = '';
    // interleave the literals with the placeholders
    for (let i = 0; i < placeholders.length; i++) {
      result += literals[i];
      result += placeholders[i];
    }

    // add the last literal
    result += literals[literals.length - 1];

    const parts = result.split('---');

    test(parts[0], parts[1], parts[2], true);
  }
}

describe('Types', function() {
  describe('unit no-std', () => {
    checkMainType`// #![no-std]
      /// empty blocks must resolve to void

      type void = %injected

      fun abc(): void = {/* empty block */}
      ---
      fun() -> void
    `;

    checkMainType`// #![no-std]
      /// function type, used for call_indirect

      type void = %injected

      fun t(): void = {/* empty block */}

      var x: fun() -> void = t
      ---
      fun() -> void
      x := (fun () (alias void))
    `;

    checkMainType`// #![no-std]
      /// function type assignment, used for call_indirect

      type void = %injected
      type ref = %injected

      fun t(): ref = ???

      var x: fun() -> void = t
      ---
      fun() -> ref
      x := (fun () (alias void))
      ---
      Type mismatch
    `;

    checkMainType.skip`// #![no-std]
      /// self declaration must fail

      var x = x
      ---
      x := (never)
      ---
      Error
    `;

    checkMainType`// #![no-std]
      /// use apply after declaration/definition

      type Test = %struct{}

      impl Test {
        fun apply(): Test = ???
      }

      var a = Test()
      ---
      a := (alias Test (struct))
    `;

    checkMainType`// #![no-std]
      /// use apply before declaration/definition

      type Test = %struct{}

      var a = Test()

      impl Test {
        fun apply(): Test = ???
      }

      ---
      a := (alias Test (struct))
    `;

    checkMainType`// #![no-std]
      /// functions without body must resolve but throwing an error

      type i32 = %stack { lowLevelType="i32" byteSize=4 }

      fun a(): i32
      ---
      fun() -> i32
      ---
      Missing function body
    `;

    checkMainType`// #![no-std]
      /// use a variable as type must fail.
      /// the final type must be infered from the value of the declaration

      type i32 = %stack { lowLevelType="i32" byteSize=4 }

      var b = 1
      var a: b = 1
      ---
      b := (alias i32 (native i32))
      a := (alias i32 (native i32))
      ---
      "i32" is not a type
    `;

    checkMainType`// #![no-std]
      /// the 'is' operation must resolve to boolean.

      type boolean = %stack { lowLevelType="i32" byteSize=1 }

      type Test = %struct{}

      impl Test {
        fun apply(): Test = ???
        fun is(a: Test): boolean = ???
      }

      var a = Test()
      var b = a is Test
      ---
      a := (alias Test (struct))
      b := (alias boolean (native boolean))
    `;

    checkMainType`// #![no-std]
      /// the 'as' operation must resolve to the target type

      type Out = %struct{}
      type Test = %struct{}

      impl Test {
        fun apply(): Test = ???
        fun as(a: Test): Out = ???
      }

      var a = Test()
      var b = a as Out
      ---
      a := (alias Test (struct))
      b := (alias Out (struct))
    `;

    checkMainType`// #![no-std]
      /// infix operations must resolve to the return type of the overload

      type Int = %struct{}
      type Real = %struct{}

      impl Int {
        fun apply(): Int = ???
        fun +(a: Int, b: Int): Real = ???
      }

      var a = Int()
      var b = Int()
      var x = a + b
      ---
      a := (alias Int (struct))
      b := (alias Int (struct))
      x := (alias Real (struct))
    `;

    checkMainType`// #![no-std]
      /// prefix operations must resolve to the return type of the overload

      type Int = %struct{}
      type Real = %struct{}

      impl Int {
        fun apply(): Int = ???
        fun ~(a: Int): Real = ???
      }

      var a = Int()
      var x = ~a
      ---
      a := (alias Int (struct))
      x := (alias Real (struct))
    `;

    checkMainType`// #![no-std]
      /// overload resolution (prefix & infix)

      type Int = %struct{}
      type Real = %struct{}

      impl Int {
        fun apply(): Int = ???
        fun -(a: Int): Real = ???
        fun -(a: Int, b: Int): Int = ???
      }

      var a = Int()
      var b = Int()
      var x = -a
      var y = a - b
      ---
      a := (alias Int (struct))
      b := (alias Int (struct))
      x := (alias Real (struct))
      y := (alias Int (struct))
    `;

    checkMainType`// #![no-std]
      /// sugar syntax of index selector (getter)
      type string = %struct{}
      type char = %struct{}
      type i32 = %stack { lowLevelType="i32" byteSize=4 }

      impl string {
        fun [](self: string, a: i32): char = ???
      }

      val a = "a string"
      val b = 1

      val x = a[b]
      val y = "asd"[123]
      ---
      a := (alias string (struct))
      b := (alias i32 (native i32))
      x := (alias char (struct))
      y := (alias char (struct))
    `;

    checkMainType`// #![no-std]
      /// property getter
      type char = %struct{}
      type i32 = %stack { lowLevelType="i32" byteSize=4 }

      impl char {
        #[getter]
        fun byteLength(self: char): i32 = ???
      }

      val a: char = ???
      val x = a.byteLength
      ---
      a := (alias char (struct))
      x := (alias i32 (native i32))
    `;

    checkMainType`// #![no-std]
      /// unannotated getter
      type char = %struct{}
      type i32 = %stack { lowLevelType="i32" byteSize=4 }

      impl char {
        fun byteLength(self: char): i32 = ???
      }

      val a: char = ???
      val x = a.byteLength
      ---
      a := (alias char (struct))
      x := (never)
      ---
      is not a getter or method
    `;

    checkMainType`// #![no-std]
      /// property setter
      type char = %struct{}
      type void = %injected
      type i32 = %stack { lowLevelType="i32" byteSize=4 }

      impl char {
        #[getter] fun byteLength(self: char): i32 = ???
        #[setter] fun byteLength(self: char, a: i32): void = ???
      }

      val a: char = ???
      val x = a.byteLength

      fun y(): void = {
        a.byteLength = 10
      }
      ---
      a := (alias char (struct))
      x := (alias i32 (native i32))
      fun() -> void
    `;

    checkMainType`// #![no-std]
      /// method, no arguments
      type char = %struct{}
      type void = %injected
      type i32 = %stack { lowLevelType="i32" byteSize=4 }

      impl char {
        #[method] fun getByteLength(self: char): i32 = ???
      }

      fun y(a: char): i32 = {
        a.getByteLength()
      }
      ---
      fun(a: char) -> i32
    `;

    checkMainType`// #![no-std]
      /// method, multiple arguments
      type char = %struct{}
      type void = %injected
      type i32 = %stack { lowLevelType="i32" byteSize=4 }

      impl char {
        #[method] fun getByteLength(self: char, a: i32, b: i32): i32 = ???
      }

      fun y(a: char): i32 = {
        a.getByteLength(1, 2)
      }
      ---
      fun(a: char) -> i32
    `;

    checkMainType`// #![no-std]
      /// method, overloads
      type char = %struct{}
      type void = %injected
      type i32 = %stack { lowLevelType="i32" byteSize=4 }

      impl char {
        #[method] fun getByteLength(self: char, a: i32): i32 = ???
        #[method] fun getByteLength(self: char): char = ???
      }

      fun x(a: char): i32 = {
        a.getByteLength(1)
      }
      fun y(a: char): char = {
        a.getByteLength()
      }
      ---
      fun(a: char) -> i32
      fun(a: char) -> char
    `;

    checkMainType`// #![no-std]
      /// property setter, unannotated setter
      type char = %struct{}
      type void = %injected
      type i32 = %stack { lowLevelType="i32" byteSize=4 }

      impl char {
        #[getter] fun byteLength(self: char): i32 = ???
        fun byteLength(self: char, a: i32): void = ???
      }

      val a: char = ???
      val x = a.byteLength

      fun y(): void = {
        a.byteLength = 10
      }
      ---
      a := (alias char (struct))
      x := (alias i32 (native i32))
      fun() -> void
      ---
      Cannot assign to "byteLength" because it is a read-only property.
    `;

    checkMainType`// #![no-std]
      /// sugar syntax of index selector (getter & setter)
      type string = %struct{}
      type char = %struct{}
      type void = %injected
      type i32 = %stack { lowLevelType="i32" byteSize=4 }

      impl string {
        fun [](self: string, a: i32): char = ???
        fun [](self: string, a: i32, value: i32): void = ???
      }

      val a = "a string"
      val b = 1

      fun main(): void = {
        a[b] = b
        "asd"[123] = b
      }

      val x = a[b]
      val y = "asd"[123]
      ---
      a := (alias string (struct))
      b := (alias i32 (native i32))
      fun() -> void
      x := (alias char (struct))
      y := (alias char (struct))
    `;

    checkMainType`// #![no-std]
      /// constructor overload
      type Test = %struct{}
      type i32 = %stack { lowLevelType="i32" byteSize=4 }

      impl Test {
        fun apply(a: i32): Test = ???
        fun apply(): Test = ???
      }

      var a = Test(1)
      var b = Test()
      ---
      a := (alias Test (struct))
      b := (alias Test (struct))
    `;

    checkMainType`// #![no-std]
      /// implicit casting
      type i32 = %stack { lowLevelType="i32" byteSize=4 }
      type i64 = %stack { lowLevelType="i64" byteSize=8 }

      impl i32 {
        fun as(x: i32): i64 = ???
      }

      fun print(x: i64): i64 = ???
      fun main(): i64 = print(1)
      ---
      fun(x: i64) -> i64
      fun() -> i64
    `;

    checkMainType`// #![no-std]
      /// implicit casting in pattern matching comparison
      type boolean = %stack { lowLevelType="i32" byteSize=4 }
      type i32 = %stack { lowLevelType="i32" byteSize=4 }
      type i64 = %stack { lowLevelType="i64" byteSize=8 }

      impl i32 {
        fun as(x: i32): i64 = ???
      }

      impl i64 {
        fun ==(a: i64, b: i64): boolean = ???
      }

      fun print(x: i64): i64 = match x {
        case 1 -> 0
        else -> 0
      }
      ---
      fun(x: i64) -> i64
    `;

    checkMainType`// #![no-std]
      /// explicit casting
      type i32 = %stack { lowLevelType="i32" byteSize=4 }
      type i64 = %stack { lowLevelType="i64" byteSize=8 }

      impl i32 {
        #[explicit]
        fun as(x: i32): i64 = ???
      }

      fun print(x: i64): i64 = ???
      fun main(): i64 = print(1)
      ---
      fun(x: i64) -> i64
      fun() -> i64
      ---
      1) Invalid signature. Expecting arguments type: (i64) but got: (i32)
    `;

    checkMainType`// #![no-std]
      /// useless cast warning, no failure
      type i32 = %stack { lowLevelType="i32" byteSize=4 }

      var a = 1 as i32
      ---
      a := (alias i32 (native i32))
    `;

    checkMainType`// #![no-std]
      /// combination of operations
      type i32 = %stack { lowLevelType="i32" byteSize=4 }
      type f32 = %stack { lowLevelType="f32" byteSize=4 }
      type boolean = %stack { lowLevelType="i32" byteSize=4 }

      impl boolean {
        fun +(x: boolean, y: i32): f32 = 1.0
      }

      fun main(): f32 = true + 3
      ---
      fun() -> f32
    `;

    checkMainType`// #![no-std]
      /// combination of operations 2
      type i32 = %stack { lowLevelType="i32" byteSize=4 }
      type f32 = %stack { lowLevelType="f32" byteSize=4 }
      type boolean = %stack { lowLevelType="i32" byteSize=4 }

      impl boolean {
        fun +(x: boolean, y: i32): i32 = 1123
      }
      impl i32 {
        fun +(x: i32, y: f32): f32 = 1.0
      }

      fun main(): f32 = true + 3 + 1.0
      ---
      fun() -> f32
    `;

    checkMainType`// #![no-std]
      /// combination of operations + implicit casting

      type i32 = %stack { lowLevelType="i32" byteSize=4 }
      type f32 = %stack { lowLevelType="f32" byteSize=4 }
      type boolean = %stack { lowLevelType="i32" byteSize=4 }

      impl boolean {
        fun +(x: boolean, y: i32): i32 = 1
      }
      impl i32 {
        fun as(x: i32): f32 = ???
      }

      fun main(): f32 = true + 3
      ---
      fun() -> f32
    `;

    checkMainType`// #![no-std]
      /// validate assignability of function return types

      type i32 = %stack { lowLevelType="i32" byteSize=4 }
      type boolean = %stack { lowLevelType="i32" byteSize=4 }

      type CC = %struct {}
      impl CC {
        fun gta(): i32 = 1
      }

      fun test(a: i32): boolean = CC.gta()
      ---
      fun(a: i32) -> boolean
      ---
      Type "i32" is not assignable to "boolean"
    `;

    checkMainType`// #![no-std]
      /// "is" should throw an error on impossible cases

      type A = %struct {}
      type B = %struct {}
      type boolean = %stack { lowLevelType="i32" byteSize=4 }

      var a: A = ???
      var b = a is B
      ---
      a := (alias A (struct))
      b := (alias boolean (native boolean))
      ---
      This statement is always false, type "A" can never be "B"
    `;

    checkMainType`// #![no-std]
      /// property assignability should fail if there are no overloads

      type char = %struct{}
      type void = %injected
      type i32 = %stack { lowLevelType="i32" byteSize=4 }
      type boolean = %stack { lowLevelType="i32" byteSize=4 }

      impl char {
        #[setter]
        fun byteLength(self: char, a: i32): void = ???
      }

      fun y(): void = {
        val a: char = ???
        a.byteLength = false
      }
      ---
      fun() -> void
      ---
      Overload not found
    `;

    checkMainType`// #![no-std]
      /// type discriminant present in type alias as u32

      type u32 = %stack { lowLevelType="i32" byteSize=4 }
      type char = %struct{}

      var x: u32 = char.^discriminant
      ---
      x := (alias u32 (native u32))
    `;

    checkMainType`// #![no-std]
      /// schema property in non-types must raise an error and be unresolved type

      type u32 = %stack { lowLevelType="i32" byteSize=4 }
      type char = %struct{}

      var x: u32 = char.^discriminant
      var y = x.^discriminant
      ---
      x := (alias u32 (native u32))
      y := (never)
      ---
      1) "u32" is not a type
    `;

    checkMainType`// #![no-std]
      /// invalid schema property must throw an error and yield unresolved type

      type char = %struct{}

      var x = char.^asd
      ---
      x := (never)
      ---
      Invalid schema property
    `;

    checkMainType`// #![no-std]
      /// invalid cast must throw and resolve yield RHS type

      type char = %struct{}
      type stub = %struct{}
      type string = %struct{}

      impl char {
        fun as(self: char): stub = ???
      }

      var a: char = ???
      var x = a as string
      ---
      a := (alias char (struct))
      x := (never)
      ---
      Cannot convert type "char" into "string"
    `;

    checkMainType`// #![no-std]
      /// check schema type assignability

      type char = %struct{}
      type boolean = %stack { lowLevelType="i32" byteSize=4 }

      var x: boolean = char.^discriminant
      ---
      x := (alias boolean (native boolean))
      ---
      Type "u32" is not assignable to "boolean"
    `;

    checkMainType`// #![no-std]
      /// invalid comparison must converge

      type char = %struct{}
      type boolean = %stack { lowLevelType="i32" byteSize=4 }

      impl boolean {
        fun ==(a: boolean, b: boolean): boolean = false
      }

      var a: boolean = ???
      var b: char = ???

      var x: boolean = a == b
      ---
      a := (alias boolean (native boolean))
      b := (alias char (struct))
      x := (alias boolean (native boolean))
      ---
      Invalid signature
    `;

    checkMainType`// #![no-std]
      /// invalid overload must converge
      type i32 = %stack { lowLevelType="i32" byteSize=4 }

      fun test(a: i32): i32 = ???

      val x = test(1,2,3,4,5,6,7,8,9)
      ---
      fun(a: i32) -> i32
      x := (never)
      ---
      Invalid signature.
    `;

    checkMainType`// #![no-std]
      /// invalid property must converge
      type i32 = %stack { lowLevelType="i32" byteSize=4 }

      impl i32 {
        #[getter]
        fun a(self: i32): i32 = ???
      }
      val a = (123).a
      val x = (123).unexistent
      ---
      a := (alias i32 (native i32))
      x := (never)
      ---
      Property "unexistent" doesn't exist on type "i32".
    `;

    checkMainType`// #![no-std]
      /// invoking unexistent setter
      type i32 = %stack { lowLevelType="i32" byteSize=4 }
      type void = %injected
      impl i32 {
        #[getter]
        fun a(self: i32): i32 = ???
      }
      fun a(): void = {
        (123).a = 1
      }
      ---
      fun() -> void
      ---
      Cannot assign to "a" because it is a read-only property.
    `;

    checkMainType`// #![no-std]
      /// invoking unexistent name
      type i32 = %stack { lowLevelType="i32" byteSize=4 }
      type void = %injected
      impl i32 {
        #[getter]
        fun x(self: i32): i32 = ???
      }
      fun a(): void = {
        (123).asd = 1
      }
      ---
      fun() -> void
      ---
      Property "asd" doesn't exist on type "i32".
    `;

    checkMainType`// #![no-std]
      /// non-assignable types must fail in MatchLiteral. Must mark unreachable.
      type i32 = %stack { lowLevelType="i32" byteSize=4 }
      type boolean = %stack { lowLevelType="i32" byteSize=1 }

      fun matcher(x: i32): i32 =
        match x {
          case false -> 1
          else -> 2
        }
      ---
      fun(x: i32) -> i32
      ---
      Type "i32" is not assignable to "boolean"
      Unreachable
    `;

    checkMainType`// #![no-std]
      /// assignable files must be comparable in MatchLiteral
      type i32 = %stack { lowLevelType="i32" byteSize=4 }
      type boolean = %stack { lowLevelType="i32" byteSize=1 }

      impl i32 {
        fun ==(a:i32, b: boolean): boolean = ???
      }

      fun matcher(x: i32): i32 =
        match x {
          case false -> 1
          else -> 2
        }
      ---
      fun(x: i32) -> i32
    `;

    checkMainType`// #![no-std]
      /// recursive structs declarations

      type A = %struct { field: B }
      type B = %struct { field: A }

      var a: A = ???
      var b: B = ???
      ---
      a := (alias A (struct))
      b := (alias B (struct))
    `;

    checkMainType`// #![no-std]
      /// ref must work in pattern matching with "is"

      type i32 = %stack { lowLevelType="i32" byteSize=4 }
      type boolean = %stack { lowLevelType="i32" byteSize=1 }
      type A = %struct { }
      type ref = %injected

      impl A {
        fun is(a: A | ref): boolean = ???
      }

      fun x(value: ref): i32 =
        match value {
          case is A -> 1
          else -> 2
        }
      ---
      fun(value: ref) -> i32
    `;

    checkMainType`// #![no-std]
      /// ref must work with "is" and a struct type

      type i32 = %stack { lowLevelType="i32" byteSize=4 }
      type boolean = %stack { lowLevelType="i32" byteSize=1 }
      type A = %struct { }
      type ref = %injected

      impl A {
        fun is(a: A | ref): boolean = ???
      }

      var a: ref = ???
      var x = a is A
      ---
      a := (alias ref (ref ?))
      x := (alias boolean (native boolean))
    `;

    checkMainType`// #![no-std]
      /// (never) name resolution must converge

      type boolean = %stack { lowLevelType="i32" byteSize=1 }
      type A = %struct { }

      var a: A = ???
      var x = a.test
      ---
      a := (alias A (struct))
      x := (never)
      ---
      Property "test" doesn't exist on type "A".
    `;

    checkMainType`// #![no-std]
      /// (never) name resolution must converge in "is"

      type boolean = %stack { lowLevelType="i32" byteSize=1 }
      type A = %struct { }

      var a: A = ???
      var value = a.test
      var x = value is A
      ---
      a := (alias A (struct))
      value := (never)
      x := (alias boolean (native boolean))
      ---
      Property "test" doesn't exist on type "A".
      Property "is" doesn't exist on type "A".
    `;

    describe('type alias', () => {
      checkMainType.skip`
        type int = i32
        type Integer = int
        type Long = i64
        fun add(a: i32, b: int): int = a + b
        fun add2(a: i32, b: int): Integer = a + b
        fun add3(a: Integer, b: int): Integer = a + b
        fun add4(a: Integer, b: i32): i32 = a + b
        fun add5(a: Long, b: i32): i64 = (a + b as i64)
        ---
        fun(a: i32, b: int) -> int
        fun(a: i32, b: int) -> Integer
        fun(a: Integer, b: int) -> Integer
        fun(a: Integer, b: i32) -> i32
        fun(a: Long, b: i32) -> i64
      `;
    });

    checkMainType`// #![no-std]
      /// type alias resolves to usable type (reference)

      type A = %stack { lowLevelType="i32" byteSize=1 }
      type X = A

      var x: X = ???
      ---
      x := (alias X (alias A))
    `;

    // checkMainType`
    //   /// type alias resolves to usable type (union)

    //   type A = %stack { lowLevelType="i32" byteSize=1 }
    //   type B = %stack { lowLevelType="i32" byteSize=1 }
    //   type X = A | B

    //   var x: X = ???
    //   ---
    //   x := (alias X (union (alias A) (alias B)))
    // `;

    checkMainType`// #![no-std]
      /// (never) name resolution must converge in "==" (BinOp)

      type boolean = %stack { lowLevelType="i32" byteSize=1 }
      type A = %struct { }

      var a: A = ???
      var value = a.test
      var x = value == a
      ---
      a := (alias A (struct))
      value := (never)
      x := (never)
      ---
      Property "test" doesn't exist on type "A".
    `;

    checkMainType`// #![no-std]
      /// bubble type aliases to find properties

      type boolean = %stack { lowLevelType="i32" byteSize=1 }
      type i32 = %stack { lowLevelType="i32" byteSize=4 }

      type A = %struct { }
      type NewA = A

      impl A {
        #[getter]
        fun prop(self: A): boolean = ???
      }

      var a: A = ???
      var newA: NewA = ???

      var x = a.prop
      var y = newA.prop
      ---
      a := (alias A (struct))
      newA := (alias NewA (alias A))
      x := (alias boolean (native boolean))
      y := (alias boolean (native boolean))
    `;

    checkMainType`// #![no-std]
      /// bubble type aliases to find properties must stop at overloads

      type boolean = %stack { lowLevelType="i32" byteSize=1 }
      type i32 = %stack { lowLevelType="i32" byteSize=4 }

      type A = %struct { }
      type NewA = A

      impl A {
        #[getter]
        fun prop(self: A): boolean = ???
      }

      impl NewA {
        #[getter]
        fun prop(self: A): i32 = ???
      }

      var a: A = ???
      var newA: NewA = ???

      var x = a.prop
      var y = newA.prop
      ---
      a := (alias A (struct))
      newA := (alias NewA (alias A))
      x := (alias boolean (native boolean))
      y := (alias i32 (native i32))
    `;

    checkMainType`
      /// unions

      struct A(value: B)
      struct B(value: A)

      type X = (A | B)

      var a: A = ???
      var b: B = ???
      var x: X = a
      ---
      a := (alias A (struct))
      b := (alias B (struct))
      x := (alias X (union (alias A) (alias B)))
    `;

    checkMainType`
      /// recursive types

      enum Maybe {
        None
        Some(tree: Maybe)
      }

      var x: Maybe = ???
      ---
      x := (alias Maybe (union (alias None) (alias Some)))
    `;

    checkMainType`
      /// deconstruct (same name variables)

      enum Color {
        Red
        Custom(r: i32, g: i32, b: i32)
      }

      fun isRed(color: Color): boolean = {
        match color {
          case is Red -> true
          case is Custom(r, g, b) ->
            r == 255 && g == 0 && b == 0
        }
      }
      ---
      fun(color: Color) -> boolean
    `;

    checkMainType`
      /// mutual recursive types

      enum Maybe {
        None
        Some(tree: Maybe | Number)
      }

      enum Number {
        NaN
        MaybeNumber(x: Maybe)
      }

      var x: Maybe = ???
      var y: MaybeNumber = ???
      ---
      x := (alias Maybe (union (alias None) (alias Some)))
      y := (alias MaybeNumber (struct))
    `;

    checkMainType`// #![no-std]
      /// val declarations must fail in reassign

      type i32 = %stack { lowLevelType="i32" byteSize=4 }

      val variable = 1

      fun x(): i32 = {
        variable = 0
      }

      ---
      variable := (alias i32 (native i32))
      fun() -> i32
      ---
      variable is immutable
    `;

    checkMainType`// #![no-std]
      /// parameters cannot be reassigned

      type i32 = %stack { lowLevelType="i32" byteSize=4 }

      fun x(variable: i32): i32 = {
        variable = 0
      }

      ---
      fun(variable: i32) -> i32
      ---
      variable is immutable
    `;

    checkMainType`// #![no-std]
      /// var declarations must not fail in reassign

      type i32 = %stack { lowLevelType="i32" byteSize=4 }

      var variable = 1

      fun x(): i32 = {
        variable = 0
      }

      ---
      variable := (alias i32 (native i32))
      fun() -> i32
    `;

    checkMainType`// #![no-std]
      /// private function in implementation must not be accessible from outside

      type i32 = %stack { lowLevelType="i32" byteSize=4 }

      impl i32 {
        private fun test(): i32 = 1
      }

      fun x(): i32 = {
        i32.test()
      }
      ---
      fun() -> i32
      ---
      "test" is private in i32
    `;

    checkMainType`// #![no-std]
      /// private function in implementation must be accessible from the inside of the implementation

      type i32 = %stack { lowLevelType="i32" byteSize=4 }

      impl i32 {
        private fun test(): i32 = 1
        fun testPub(): i32 = test()
      }

      fun x(): i32 = {
        i32.testPub()
      }
      ---
      fun() -> i32
    `;

    checkMainType`
      /// private function in other modules must not be accessible from outside

      // currentMemory is a private function
      fun x(): u32 = system::core::memory::currentMemory()
      ---
      fun() -> u32
      ---
      "currentMemory" is private in module "system::core::memory"
    `;

    checkMainType`
      /// importing private function in other modules must not be accessible from outside
      import system::core::memory

      // system::core::memory::currentMemory is a private function
      fun x(): u32 = currentMemory()
      ---
      fun() -> u32
      ---
      Cannot find name 'currentMemory'
    `;

    checkMainType`// #![no-std]
      /// public function in implementation must be accessible from outside

      type i32 = %stack { lowLevelType="i32" byteSize=4 }

      impl i32 {
        fun test(): i32 = 1
      }

      fun x(): i32 = {
        i32.test()
      }
      ---
      fun() -> i32
    `;

    checkMainType`
      /// private constructor
      type ProcessSignal = %stack { lowLevelType="i32" byteSize=1 }

      impl ProcessSignal {
        private fun apply(value: i32): ProcessSignal = ???

        val HUP = ProcessSignal(1)
        fun x(): ProcessSignal = ProcessSignal(2)
      }

      var x = ProcessSignal.x()
      ---
      x := (alias ProcessSignal (native ProcessSignal))
    `;

    checkMainType`
      /// private constructor in other scope is not accessible
      type ProcessSignal = %stack { lowLevelType="i32" byteSize=1 }

      impl ProcessSignal {
        private fun apply(value: i32): ProcessSignal = ???
      }

      impl ProcessSignal {
        val HUP = ProcessSignal(1)
      }
      ---
      ---
      Name "apply" is private in ProcessSignal
    `;

    checkMainType`
      /// functions in other scopes are addressable by fully qualified name
      type ProcessSignal = %struct {}

      impl ProcessSignal {
        fun a(): ProcessSignal = ???
        fun c(): ProcessSignal = ProcessSignal.test()
      }

      impl ProcessSignal {
        fun test(): ProcessSignal = ProcessSignal.a()
      }

      var x = ProcessSignal.c()
      ---
      x := (alias ProcessSignal (struct))
    `;

    checkMainType`
      /// private constructor must fail from outside
      type ProcessSignal = %stack { lowLevelType="i32" byteSize=1 }

      /** Signal condition. */
      impl ProcessSignal {
        private fun apply(value: i32): ProcessSignal = %wasm { (get_local $value) }
      }

      val INT = ProcessSignal(2)
      ---
      INT := (never)
      ---
      Name "apply" is private in ProcessSignal
    `;

    checkMainType`// #![no-std]
      /// must resolve functions in multiple impl

      type boolean = %stack { lowLevelType="i32" byteSize=1 }
      type i32 = %stack { lowLevelType="i32" byteSize=4 }
      type i64 = %stack { lowLevelType="i64" byteSize=8 }

      type A = %struct { }

      impl A {
        fun test(int: i32): boolean = ???
      }

      impl A {
        fun test(int: boolean): i64 = ???
      }

      var x = A.test(1)
      var y = A.test(false)
      ---
      x := (alias boolean (native boolean))
      y := (alias i64 (native i64))
    `;

    checkMainType.skip`// #![no-std]
      /// resolve variable declarations in namespaces

      type boolean = %stack { lowLevelType="i32" byteSize=1 }
      type A = %struct { }

      impl A {
        val x: boolean = ???
      }

      var y = A.x
      ---
      y := (alias boolean (native boolean))
    `;

    /// IfNodes must return the union of two types
    /// match nodes must return the union of all the matchers
    /// match result must be coerced automatically to the declaration's type
  });

  describe('traits', () => {
    checkMainType`
      /// struct implementing empty trait
      trait Sumable {}

      struct A()

      impl Sumable for A {}

      var y = A
      ---
      Sumable := (trait Sumable)
      y := (alias A (struct))
    `;

    checkMainType`
      /// traits with implementations are not enabled yet
      trait Sumable {
        fun a(): boolean = true
      }

      struct A()

      impl Sumable for A {
        fun a(): boolean = true
      }
      ---
      Sumable := (trait Sumable [a: (intersection (fun "a" () (alias boolean)))])
      ---
      Unexpected function body. Traits only accept signatures.
    `;

    checkMainType`
      /// decorators are not allowed in trait functions
      trait Sumable {
        #[inline]
        fun a(): boolean
      }

      struct A()

      impl Sumable for A {
        fun a(): boolean = true
      }
      ---
      Sumable := (trait Sumable [a: (intersection (fun "a" () (alias boolean)))])
      ---
      Unexpected decorator. Traits only accept signatures.
    `;

    checkMainType`
      /// struct implementing trait with one function
      trait Sumable {
        fun test(): boolean
      }

      struct A()

      impl Sumable for A {
        fun test(): boolean = true
      }

      var x = A.test()
      ---
      Sumable := (trait Sumable [test: (intersection (fun "test" () (alias boolean)))])
      x := (alias boolean (native boolean))
    `;

    checkMainType`
      /// struct implementing trait with two functions with different names

      trait Sumable {
        fun test(): boolean
        fun a(): i32
      }

      struct A()

      impl Sumable for A {
        fun test(): boolean = true
        fun a(): i32 = 1
      }

      var x = A.test()
      var y = A.a()
      ---
      Sumable := (trait Sumable [test: (intersection (fun "test" () (alias boolean)))] [a: (intersection (fun "a" () (alias i32)))])
      x := (alias boolean (native boolean))
      y := (alias i32 (native i32))
    `;

    checkMainType`
      /// struct implementing trait with overloaded functions

      trait Sumable {
        fun test(): boolean
        fun test(a: boolean): i32
      }

      struct A()

      impl Sumable for A {
        fun test(): boolean = true
        fun test(a: boolean): i32 = 1
      }

      var x = A.test()
      var y = A.test(false)
      ---
      Sumable := (trait Sumable [test: (intersection (fun "test" () (alias boolean)) (fun "test" ((alias boolean)) (alias i32)))])
      x := (alias boolean (native boolean))
      y := (alias i32 (native i32))
    `;

    checkMainType`
      /// struct implementing trait with one function of two must fail

      trait Sumable {
        fun test(): boolean
        fun a(): i32
      }

      struct A()

      impl Sumable for A {
        fun test(): boolean = true
      }

      var x = A.test()
      ---
      Sumable := (trait Sumable [test: (intersection (fun "test" () (alias boolean)))] [a: (intersection (fun "a" () (alias i32)))])
      x := (alias boolean (native boolean))
      ---
      Not all functions are implemented, missing: a
    `;

    checkMainType`
      /// struct implementing trait with missing functions must throw an error
      trait Sumable {
        fun test(): boolean
      }

      struct A()

      impl Sumable for A {}

      var x = A.test()
      ---
      Sumable := (trait Sumable [test: (intersection (fun "test" () (alias boolean)))])
      x := (never)
      ---
      Not all functions are implemented, missing: test
    `;

    checkMainType`
      /// struct implementing trait with wrong signatures must throw an error
      trait Sumable {
        fun test(): boolean
      }

      struct A()

      impl Sumable for A {
        fun test(): i32 = 1
      }

      var x = A.test()
      ---
      Sumable := (trait Sumable [test: (intersection (fun "test" () (alias boolean)))])
      x := (alias i32 (native i32))
      ---
      Type mismatch: Type "fun() -> i32" is not assignable to "fun() -> boolean"
    `;

    checkMainType`
      /// concrete type must be assignable to Self in trait
      trait Sumable {
        fun +(lhs: Self, rhs: Self): Self
      }

      struct A(num: f32)

      impl Sumable for A {
        fun +(lhs: A, rhs: A): A = A(lhs.num + rhs.num)
      }

      var x = A(1) + A(2)
      ---
      Sumable := (trait Sumable [+: (intersection (fun "+" ((self (trait Sumable)) (self (trait Sumable))) (self (trait Sumable))))])
      x := (alias A (struct))
    `;

    checkMainType`
      /// self must not be compatible with other implementations

      trait Sumable {
        fun +(lhs: Self, rhs: Self): Self
      }

      struct A(num: f32)
      struct B(num: f32)

      impl Sumable for A {
        fun +(lhs: Self, rhs: Self): Self = A(lhs.num + rhs.num)
      }

      impl Sumable for B {
        fun +(lhs: Self, rhs: Self): Self = A(lhs.num + rhs.num)
      }

      var x = A(1) + A(2)
      ---
      Sumable := (trait Sumable [+: (intersection (fun "+" ((self (trait Sumable)) (self (trait Sumable))) (self (trait Sumable))))])
      x := (alias A (struct))
      ---
      Type mismatch
    `;

    checkMainType`
      /// double implementation must fail
      trait Sumable {
        fun +(lhs: Self, rhs: Self): Self
      }

      struct A(num: f32)

      impl Sumable for A {
        fun +(lhs: A, rhs: A): A = A(lhs.num + rhs.num)
      }

      impl Sumable for A {
        fun +(lhs: A, rhs: A): A = A(lhs.num + rhs.num)
      }

      var x = A(1) + A(2)
      ---
      Sumable := (trait Sumable [+: (intersection (fun "+" ((self (trait Sumable)) (self (trait Sumable))) (self (trait Sumable))))])
      x := (alias A (struct))
      ---
      This trait is already implemented for the target type
    `;

    checkMainType`
      /// concrete type must be assignable to Self in impl
      trait Sumable {
        fun +(lhs: Self, rhs: Self): Self
      }

      struct A(num: f32)

      impl Sumable for A {
        fun +(lhs: Self, rhs: Self): Self = A(lhs.num + rhs.num)
      }

      var x = A(1) + A(2)
      ---
      Sumable := (trait Sumable [+: (intersection (fun "+" ((self (trait Sumable)) (self (trait Sumable))) (self (trait Sumable))))])
      x := (alias A (struct))
    `;

    checkMainType`
      /// must fail trying to implement a trait for a trait
      trait Sumable {}

      impl Sumable for Sumable {}
      ---
      Sumable := (trait Sumable)
      ---
      "Sumable" is not a type
    `;
  });

  describe('unit', () => {
    checkMainType`
      /// unary minus in "u32" must produce a readable error
      var a: u32 = 0xffffffff
      var x = -a
      ---
      a := (alias u32 (native u32))
      x := (alias u32 (native u32))
      ---
      Cannot apply operator "-" in type "u32"
    `;

    checkMainType`
      /// unary minus in "false" must produce an error
      var a = false
      var x = -a
      ---
      a := (alias boolean (native boolean))
      x := (alias boolean (native boolean))
      ---
      Property "-" doesn't exist on type "boolean".
    `;

    checkMainType`
      fun abc(): void = {/* empty block */}
      ---
      fun() -> void
    `;

    checkMainType`
      var int: i32 = 1
      var float: f32 = 1.0
      var bool: boolean = true
      ---
      int := (alias i32 (native i32))
      float := (alias f32 (native f32))
      bool := (alias boolean (native boolean))
    `;

    describe('scope', () => {
      checkMainType`
        import test::test

        var TestingContext: i32 = 1
        fun main(): i32 = TestingContext
        ---
        TestingContext := (alias i32 (native i32))
        fun() -> i32
      `;
    });

    describe('inference', () => {
      checkMainType`
        import test::test

        var TestingContext = 1
        fun main(): i32 = TestingContext
        ---
        TestingContext := (alias i32 (native i32))
        fun() -> i32
      `;

      checkMainType`
        var int = 1
        var float = 1.0
        var bool = true
        ---
        int := (alias i32 (native i32))
        float := (alias f32 (native f32))
        bool := (alias boolean (native boolean))
      `;
    });

    // checkMainType`
    //   var i32 = 1
    //   ---
    //   i32 := <ofType is NULL>
    // `;

    // checkMainType`
    //   // this will be fixed once let constructs are implemented in the scope side
    //   var a = a
    //   ---
    //   a := <ofType is NULL>
    // `;

    // checkMainType`
    //   var a = "hello"
    //   var bytes = a.length
    //   ---
    //   a := <ofType is NULL>
    //   bytes := <ofType is NULL>
    // `;

    describe('index selector', () => {
      checkMainType`
        val x = "a"[0 as u32]
        ---
        x := (alias u16 (native u16))
      `;

      checkMainType`
        fun x(x: bytes, y: u8): void = {
          x[0 as u32] = y
        }
        ---
        fun(x: bytes, y: u8) -> void
      `;
    });

    checkMainType`
      var b = 1
      var a: b = 1
      ---
      b := (alias i32 (native i32))
      a := (alias i32 (native i32))
      ---
      "i32" is not a type
    `;

    describe('numbers', () => {
      checkMainType`
        fun test1(x: u8): u8 = x as u8
        fun test1(x: u8): i16 = x as i16
        fun test1(x: u8): u16 = x as u16
        fun test1(x: u8): i32 = x as i32
        fun test1(x: u8): u32 = x as u32
        fun test1(x: u8): i64 = x as i64
        fun test1(x: u8): u64 = x as u64
        fun test1(x: u8): f32 = x as f32
        fun test1(x: u8): f64 = x as f64

        fun test2(x: i16): u8 = x as u8
        fun test2(x: i16): i16 = x as i16
        fun test2(x: i16): u16 = x as u16
        fun test2(x: i16): i32 = x as i32
        fun test2(x: i16): u32 = x as u32
        fun test2(x: i16): i64 = x as i64
        fun test2(x: i16): u64 = x as u64
        fun test2(x: i16): f32 = x as f32
        fun test2(x: i16): f64 = x as f64

        fun test3(x: u16): u8 = x as u8
        fun test3(x: u16): i16 = x as i16
        fun test3(x: u16): u16 = x as u16
        fun test3(x: u16): i32 = x as i32
        fun test3(x: u16): u32 = x as u32
        fun test3(x: u16): i64 = x as i64
        fun test3(x: u16): u64 = x as u64
        fun test3(x: u16): f32 = x as f32
        fun test3(x: u16): f64 = x as f64

        fun test4(x: i32): u8 = x as u8
        fun test4(x: i32): i16 = x as i16
        fun test4(x: i32): u16 = x as u16
        fun test4(x: i32): i32 = x as i32
        fun test4(x: i32): u32 = x as u32
        fun test4(x: i32): i64 = x as i64
        fun test4(x: i32): u64 = x as u64
        fun test4(x: i32): f32 = x as f32
        fun test4(x: i32): f64 = x as f64

        fun test5(x: u32): u8 = x as u8
        fun test5(x: u32): i16 = x as i16
        fun test5(x: u32): u16 = x as u16
        fun test5(x: u32): i32 = x as i32
        fun test5(x: u32): u32 = x as u32
        fun test5(x: u32): i64 = x as i64
        fun test5(x: u32): u64 = x as u64
        fun test5(x: u32): f32 = x as f32
        fun test5(x: u32): f64 = x as f64

        fun test6(x: i64): u8 = x as u8
        fun test6(x: i64): i16 = x as i16
        fun test6(x: i64): u16 = x as u16
        fun test6(x: i64): i32 = x as i32
        fun test6(x: i64): u32 = x as u32
        fun test6(x: i64): i64 = x as i64
        fun test6(x: i64): u64 = x as u64
        fun test6(x: i64): f32 = x as f32
        fun test6(x: i64): f64 = x as f64

        fun test7(x: u64): u8 = x as u8
        fun test7(x: u64): i16 = x as i16
        fun test7(x: u64): u16 = x as u16
        fun test7(x: u64): i32 = x as i32
        fun test7(x: u64): u32 = x as u32
        fun test7(x: u64): i64 = x as i64
        fun test7(x: u64): u64 = x as u64
        fun test7(x: u64): f32 = x as f32
        fun test7(x: u64): f64 = x as f64

        fun test8(x: f32): u8 = x as u8
        fun test8(x: f32): i16 = x as i16
        fun test8(x: f32): u16 = x as u16
        fun test8(x: f32): i32 = x as i32
        fun test8(x: f32): u32 = x as u32
        fun test8(x: f32): i64 = x as i64
        fun test8(x: f32): u64 = x as u64
        fun test8(x: f32): f32 = x as f32
        fun test8(x: f32): f64 = x as f64

        fun test9(x: f64): u8 = x as u8
        fun test9(x: f64): i16 = x as i16
        fun test9(x: f64): u16 = x as u16
        fun test9(x: f64): i32 = x as i32
        fun test9(x: f64): u32 = x as u32
        fun test9(x: f64): i64 = x as i64
        fun test9(x: f64): u64 = x as u64
        fun test9(x: f64): f32 = x as f32
        fun test9(x: f64): f64 = x as f64
        ---
        fun(x: u8) -> u8 & fun(x: u8) -> i16 & fun(x: u8) -> u16 & fun(x: u8) -> i32 & fun(x: u8) -> u32 & fun(x: u8) -> i64 & fun(x: u8) -> u64 & fun(x: u8) -> f32 & fun(x: u8) -> f64
        fun(x: i16) -> u8 & fun(x: i16) -> i16 & fun(x: i16) -> u16 & fun(x: i16) -> i32 & fun(x: i16) -> u32 & fun(x: i16) -> i64 & fun(x: i16) -> u64 & fun(x: i16) -> f32 & fun(x: i16) -> f64
        fun(x: u16) -> u8 & fun(x: u16) -> i16 & fun(x: u16) -> u16 & fun(x: u16) -> i32 & fun(x: u16) -> u32 & fun(x: u16) -> i64 & fun(x: u16) -> u64 & fun(x: u16) -> f32 & fun(x: u16) -> f64
        fun(x: i32) -> u8 & fun(x: i32) -> i16 & fun(x: i32) -> u16 & fun(x: i32) -> i32 & fun(x: i32) -> u32 & fun(x: i32) -> i64 & fun(x: i32) -> u64 & fun(x: i32) -> f32 & fun(x: i32) -> f64
        fun(x: u32) -> u8 & fun(x: u32) -> i16 & fun(x: u32) -> u16 & fun(x: u32) -> i32 & fun(x: u32) -> u32 & fun(x: u32) -> i64 & fun(x: u32) -> u64 & fun(x: u32) -> f32 & fun(x: u32) -> f64
        fun(x: i64) -> u8 & fun(x: i64) -> i16 & fun(x: i64) -> u16 & fun(x: i64) -> i32 & fun(x: i64) -> u32 & fun(x: i64) -> i64 & fun(x: i64) -> u64 & fun(x: i64) -> f32 & fun(x: i64) -> f64
        fun(x: u64) -> u8 & fun(x: u64) -> i16 & fun(x: u64) -> u16 & fun(x: u64) -> i32 & fun(x: u64) -> u32 & fun(x: u64) -> i64 & fun(x: u64) -> u64 & fun(x: u64) -> f32 & fun(x: u64) -> f64
        fun(x: f32) -> u8 & fun(x: f32) -> i16 & fun(x: f32) -> u16 & fun(x: f32) -> i32 & fun(x: f32) -> u32 & fun(x: f32) -> i64 & fun(x: f32) -> u64 & fun(x: f32) -> f32 & fun(x: f32) -> f64
        fun(x: f64) -> u8 & fun(x: f64) -> i16 & fun(x: f64) -> u16 & fun(x: f64) -> i32 & fun(x: f64) -> u32 & fun(x: f64) -> i64 & fun(x: f64) -> u64 & fun(x: f64) -> f32 & fun(x: f64) -> f64
        ---
        Cannot convert type "i16" into "u16"
        Cannot convert type "i16" into "u64"
        Cannot convert type "u16" into "i16"
        Cannot convert type "u32" into "u16"
        Cannot convert type "i64" into "u8"
        Cannot convert type "i64" into "i16"
        Cannot convert type "i64" into "u16"
        Cannot convert type "u64" into "i16"
        Cannot convert type "f32" into "u8"
        Cannot convert type "f32" into "i16"
        Cannot convert type "f32" into "u16"
        Cannot convert type "f64" into "u8"
        Cannot convert type "f64" into "i16"
        Cannot convert type "f64" into "u16"
        This cast is useless
      `;
    });

    describe('bytes', () => {
      checkMainType`
        var a = "hello"
        var len = a.length
        ---
        a := (alias string (native string))
        len := (alias u32 (native u32))
      `;
    });

    describe('namespace types', () => {
      describe('%struct', () => {
        checkMainType`
          type Test = %struct { x: i32 }

          impl Test {
            fun apply(): Test = ???
          }

          var a = Test.apply()
          ---
          a := (alias Test (struct))
        `;
        checkMainType`
          struct Test(x: i32)

          var a = Test(1)
          ---
          a := (alias Test (struct))
        `;
      });

      describe('apply', () => {
        checkMainType`
          type Test = %struct{}

          impl Test {
            fun apply(): Test = ???
          }

          var a = Test.apply()
          ---
          a := (alias Test (struct))
        `;

        checkMainType`
          type Test = %struct{}

          impl Test {
            fun apply(): Test = ???
          }

          var a = Test()
          ---
          a := (alias Test (struct))
        `;

        checkMainType`
          type Test = %struct{}

          impl Test {
            fun apply(a: i32): Test = ???
            fun apply(): Test = ???
          }

          var a = Test(1)
          var b = Test()
          ---
          a := (alias Test (struct))
          b := (alias Test (struct))
        `;

        checkMainType`
          type Test = %struct{}

          impl Test {
            fun apply(a: i32): Test = ???
          }

          var a = Test(1)
          ---
          a := (alias Test (struct))
        `;
      });

      describe('resolve static functions', () => {
        checkMainType`
          type Test = %struct {}
          impl Test {
            fun WWW(): boolean = ???
          }

          var a = Test.WWW()
          ---
          a := (alias boolean (native boolean))
        `;

        checkMainType`
          type BB = %struct {}
          type CC = %struct {}
          impl CC {
            fun gta(): i32 = 1
          }

          fun test(a: i32): boolean = BB.gta()
          ---
          fun(a: i32) -> boolean
          ---
          Property "gta" doesn't exist on type "BB"
        `;
      });

      describe('sugar', () => {
        checkMainType`
          struct Test()
          impl Test {
            fun ZZZ(): boolean = ???
          }

          var z = Test.ZZZ()
          ---
          z := (alias boolean (native boolean))
        `;

        checkMainType`
          enum Test { Case1 }
          impl Test {
            fun WWW(x: ref): boolean = x is Test
          }

          var a = Test.WWW(Case1)
          ---
          a := (alias boolean (native boolean))
        `;

        checkMainType`
          enum Test { Case1 }

          impl Test {
            fun WWW(x: ref): boolean = x is Test
          }

          fun x(): boolean = Test.WWW(Case1)
          ---
          fun() -> boolean
        `;

        checkMainType`
          enum Temperature {
            Kelvin(x: f32)
          }

          impl Kelvin {
            fun xxx(): f32 = ???
          }

          var c = Kelvin.xxx()
          ---
          c := (alias f32 (native f32))
        `;

        checkMainType`
          enum Temperature {
            Celcius(x: f32)
            Kelvin(x: f32)
          }
          impl Temperature {
            fun xxx(): boolean = ???
          }
          impl Celcius {
            fun xxx(): i32 = ???
          }
          impl Kelvin {
            fun xxx(): f32 = ???
          }

          var a = Temperature.xxx()
          var b = Celcius.xxx()
          var c = Kelvin.xxx()
          ---
          a := (alias boolean (native boolean))
          b := (alias i32 (native i32))
          c := (alias f32 (native f32))
        `;
      });

      describe('resolve "is" and "as" functions', () => {
        describe('sugar', () => {
          checkMainType`
            enum Test {
              A
              B
            }

            var a = A is Test
            var b = A is A
            ---
            a := (alias boolean (native boolean))
            b := (alias boolean (native boolean))
          `;

          checkMainType`
            enum Test {
              A
              B
            }

            var a = A as Test
            var b = A
            ---
            a := (alias Test (union (alias A) (alias B)))
            b := (alias A (struct))
          `;

          checkMainType`
            enum Test {
              A
              B
            }

            var a = A
            var b = B
            var c = a as Test
            var d = b as Test
            ---
            a := (alias A (struct))
            b := (alias B (struct))
            c := (alias Test (union (alias A) (alias B)))
            d := (alias Test (union (alias A) (alias B)))
          `;
        });

        describe('union types', function() {
          checkMainType`
            struct A()
            struct B()
            struct C()
            type ABC = A | B | C

            var a: A = ???
            var b: B = ???
            var c: C = ???
            var d: ABC = a
            ---
            a := (alias A (struct))
            b := (alias B (struct))
            c := (alias C (struct))
            d := (alias ABC (union (alias A) (alias B) (alias C)))
          `;

          checkMainType`
            type A = %struct{}
            type B = %struct{}
            type C = %struct{}
            type ABC = A | B | C

            impl A {
              fun is(x: A): boolean = ???
            }

            impl B {
              fun is(x: B): boolean = ???
            }

            impl C {
              fun is(x: C): boolean = ???
            }

            var a: A = ???
            var b: B = ???
            var c: C = ???
            var d: ABC = a

            var isA = a is A
            var isB = b is B
            var isC = c is C
            var isAABC = a is ABC
            var isBABC = b is ABC
            var isCABC = c is ABC
            ---
            a := (alias A (struct))
            b := (alias B (struct))
            c := (alias C (struct))
            d := (alias ABC (union (alias A) (alias B) (alias C)))
            isA := (alias boolean (native boolean))
            isB := (alias boolean (native boolean))
            isC := (alias boolean (native boolean))
            isAABC := (alias boolean (native boolean))
            isBABC := (alias boolean (native boolean))
            isCABC := (alias boolean (native boolean))
          `;
        });

        checkMainType`
          fun test1(x: u8): u8 = x as u8
          fun test1(x: u8): i16 = x as i16
          fun test1(x: u8): u16 = x as u16
          fun test1(x: u8): i32 = x as i32
          fun test1(x: u8): u32 = x as u32
          fun test1(x: u8): i64 = x as i64
          fun test1(x: u8): u64 = x as u64
          fun test1(x: u8): f32 = x as f32
          fun test1(x: u8): f64 = x as f64

          fun test2(x: i16): u8 = x as u8
          fun test2(x: i16): i16 = x as i16
          fun test2(x: i16): u16 = x as u16
          fun test2(x: i16): i32 = x as i32
          fun test2(x: i16): u32 = x as u32
          fun test2(x: i16): i64 = x as i64
          fun test2(x: i16): u64 = x as u64
          fun test2(x: i16): f32 = x as f32
          fun test2(x: i16): f64 = x as f64

          fun test3(x: u16): u8 = x as u8
          fun test3(x: u16): i16 = x as i16
          fun test3(x: u16): u16 = x as u16
          fun test3(x: u16): i32 = x as i32
          fun test3(x: u16): u32 = x as u32
          fun test3(x: u16): i64 = x as i64
          fun test3(x: u16): u64 = x as u64
          fun test3(x: u16): f32 = x as f32
          fun test3(x: u16): f64 = x as f64

          fun test4(x: i32): u8 = x as u8
          fun test4(x: i32): i16 = x as i16
          fun test4(x: i32): u16 = x as u16
          fun test4(x: i32): i32 = x as i32
          fun test4(x: i32): u32 = x as u32
          fun test4(x: i32): i64 = x as i64
          fun test4(x: i32): u64 = x as u64
          fun test4(x: i32): f32 = x as f32
          fun test4(x: i32): f64 = x as f64

          fun test5(x: u32): u8 = x as u8
          fun test5(x: u32): i16 = x as i16
          fun test5(x: u32): u16 = x as u16
          fun test5(x: u32): i32 = x as i32
          fun test5(x: u32): u32 = x as u32
          fun test5(x: u32): i64 = x as i64
          fun test5(x: u32): u64 = x as u64
          fun test5(x: u32): f32 = x as f32
          fun test5(x: u32): f64 = x as f64

          fun test6(x: i64): u8 = x as u8
          fun test6(x: i64): i16 = x as i16
          fun test6(x: i64): u16 = x as u16
          fun test6(x: i64): i32 = x as i32
          fun test6(x: i64): u32 = x as u32
          fun test6(x: i64): i64 = x as i64
          fun test6(x: i64): u64 = x as u64
          fun test6(x: i64): f32 = x as f32
          fun test6(x: i64): f64 = x as f64

          fun test7(x: u64): u8 = x as u8
          fun test7(x: u64): i16 = x as i16
          fun test7(x: u64): u16 = x as u16
          fun test7(x: u64): i32 = x as i32
          fun test7(x: u64): u32 = x as u32
          fun test7(x: u64): i64 = x as i64
          fun test7(x: u64): u64 = x as u64
          fun test7(x: u64): f32 = x as f32
          fun test7(x: u64): f64 = x as f64

          fun test8(x: f32): u8 = x as u8
          fun test8(x: f32): i16 = x as i16
          fun test8(x: f32): u16 = x as u16
          fun test8(x: f32): i32 = x as i32
          fun test8(x: f32): u32 = x as u32
          fun test8(x: f32): i64 = x as i64
          fun test8(x: f32): u64 = x as u64
          fun test8(x: f32): f32 = x as f32
          fun test8(x: f32): f64 = x as f64

          fun test9(x: f64): u8 = x as u8
          fun test9(x: f64): i16 = x as i16
          fun test9(x: f64): u16 = x as u16
          fun test9(x: f64): i32 = x as i32
          fun test9(x: f64): u32 = x as u32
          fun test9(x: f64): i64 = x as i64
          fun test9(x: f64): u64 = x as u64
          fun test9(x: f64): f32 = x as f32
          fun test9(x: f64): f64 = x as f64
          ---
          fun(x: u8) -> u8 & fun(x: u8) -> i16 & fun(x: u8) -> u16 & fun(x: u8) -> i32 & fun(x: u8) -> u32 & fun(x: u8) -> i64 & fun(x: u8) -> u64 & fun(x: u8) -> f32 & fun(x: u8) -> f64
          fun(x: i16) -> u8 & fun(x: i16) -> i16 & fun(x: i16) -> u16 & fun(x: i16) -> i32 & fun(x: i16) -> u32 & fun(x: i16) -> i64 & fun(x: i16) -> u64 & fun(x: i16) -> f32 & fun(x: i16) -> f64
          fun(x: u16) -> u8 & fun(x: u16) -> i16 & fun(x: u16) -> u16 & fun(x: u16) -> i32 & fun(x: u16) -> u32 & fun(x: u16) -> i64 & fun(x: u16) -> u64 & fun(x: u16) -> f32 & fun(x: u16) -> f64
          fun(x: i32) -> u8 & fun(x: i32) -> i16 & fun(x: i32) -> u16 & fun(x: i32) -> i32 & fun(x: i32) -> u32 & fun(x: i32) -> i64 & fun(x: i32) -> u64 & fun(x: i32) -> f32 & fun(x: i32) -> f64
          fun(x: u32) -> u8 & fun(x: u32) -> i16 & fun(x: u32) -> u16 & fun(x: u32) -> i32 & fun(x: u32) -> u32 & fun(x: u32) -> i64 & fun(x: u32) -> u64 & fun(x: u32) -> f32 & fun(x: u32) -> f64
          fun(x: i64) -> u8 & fun(x: i64) -> i16 & fun(x: i64) -> u16 & fun(x: i64) -> i32 & fun(x: i64) -> u32 & fun(x: i64) -> i64 & fun(x: i64) -> u64 & fun(x: i64) -> f32 & fun(x: i64) -> f64
          fun(x: u64) -> u8 & fun(x: u64) -> i16 & fun(x: u64) -> u16 & fun(x: u64) -> i32 & fun(x: u64) -> u32 & fun(x: u64) -> i64 & fun(x: u64) -> u64 & fun(x: u64) -> f32 & fun(x: u64) -> f64
          fun(x: f32) -> u8 & fun(x: f32) -> i16 & fun(x: f32) -> u16 & fun(x: f32) -> i32 & fun(x: f32) -> u32 & fun(x: f32) -> i64 & fun(x: f32) -> u64 & fun(x: f32) -> f32 & fun(x: f32) -> f64
          fun(x: f64) -> u8 & fun(x: f64) -> i16 & fun(x: f64) -> u16 & fun(x: f64) -> i32 & fun(x: f64) -> u32 & fun(x: f64) -> i64 & fun(x: f64) -> u64 & fun(x: f64) -> f32 & fun(x: f64) -> f64          ---
          This cast is useless
          Cannot convert type "i16" into "u16"
          Cannot convert type "i16" into "u64"
          Cannot convert type "u16" into "i16"
          This cast is useless
          This cast is useless
          Cannot convert type "u32" into "u16"
          This cast is useless
          Cannot convert type "i64" into "u8"
          Cannot convert type "i64" into "i16"
          Cannot convert type "i64" into "u16"
          This cast is useless
          Cannot convert type "u64" into "i16"
          This cast is useless
          Cannot convert type "f32" into "u8"
          Cannot convert type "f32" into "i16"
          Cannot convert type "f32" into "u16"
          This cast is useless
          Cannot convert type "f64" into "u8"
          Cannot convert type "f64" into "i16"
          Cannot convert type "f64" into "u16"
          This cast is useless
        `;
      });
    });

    describe('recursive types', () => {
      checkMainType`
        enum Test {
          Null
          Some(x: ref)
        }

        var b = Some(Null)
        ---
        b := (alias Some (struct))
      `;

      checkMainType`
        enum Test {
          Null
          Some(x: Test)
        }

        var b = Some(Null)
        ---
        b := (alias Some (struct))
      `;

      checkMainType`
        enum Test {
          Null
          Some(x: ref)
        }

        var a: Test = Some(Null)
        var b = Some(Null)
        ---
        a := (alias Test (union (alias Null) (alias Some)))
        b := (alias Some (struct))
      `;

      checkMainType`
        enum Test {
          Null
          Some(x: Test)
        }

        var a: Test = Some(Null)
        var b = Some(Null)
        ---
        a := (alias Test (union (alias Null) (alias Some)))
        b := (alias Some (struct))
      `;

      checkMainType`
        enum Test {
          Null
          Some(x: Test)
        }

        fun a(): Null = Null
        fun b(): Some = Some(Some(Null))
        fun c(): Test = Null
        fun d(): Test = Some(Some(Null))
        ---
        fun() -> Null
        fun() -> Some
        fun() -> Test
        fun() -> Test
      `;

      describe('forest', () => {
        checkMainType`
          enum Tree {
            Empty
            Node(a: Tree | Forest)
          }

          enum Forest {
            Nil
            Cons(tree: Tree | Forest)
          }

          var a = Nil
          var b = Cons(Empty)
          var c = Cons(Nil)
          var d = Cons(Node(Empty))
          var e = Cons(Node(Nil))
          ---
          a := (alias Nil (struct))
          b := (alias Cons (struct))
          c := (alias Cons (struct))
          d := (alias Cons (struct))
          e := (alias Cons (struct))
        `;
      });
    });
    describe('recursive calls', () => {
      checkMainType`
        fun factorial(n: i32): i32 =
          if (n >= 1)
            n * factorial(n - 1)
          else
            1

        fun x(): i32 = factorial(10)
        ---
        fun(n: i32) -> i32
        fun() -> i32
      `;

      checkMainType`
        fun factorial(n: i32): i32 =
          if (n >= 1)
            factorial(n - 1)
          else
            1

        fun x(): i32 = factorial(10)
        ---
        fun(n: i32) -> i32
        fun() -> i32
      `;

      checkMainType`
        private fun a(i: i32): i32 = i
        private fun a(i: boolean): boolean = i

        private fun a(): i32 | boolean =
          if(1 > 0)
            a(1)
          else
            a(false)
        ---
        fun(i: i32) -> i32 & fun(i: boolean) -> boolean & fun() -> i32 | boolean
      `;

      checkMainType`
        fun gcd(x: i32, y: i32): i32 =
          if (x > y)
            gcd(x - y, y)
          else if (x < y)
            gcd(x, y - x)
          else
            x
        ---
        fun(x: i32, y: i32) -> i32
      `;

      checkMainType`
        fun factorial(n: i32): i32 =
          if (n >= 1)
            n * factorial(n - 1)
          else
            1

        fun gcd(x: i32, y: i32): i32 =
          if (x > y)
            gcd(x - y, y)
          else if (x < y)
            gcd(x, y - x)
          else
            factorial(x)
        ---
        fun(n: i32) -> i32
        fun(x: i32, y: i32) -> i32
      `;
    });
    describe('assign', () => {
      describe('enums', () => {
        describe('assign unions', function() {
          checkMainType`
            enum BOOLEAN {
              TRUE
              FALSE
              NONE
            }

            // 1
            fun test1(a: BOOLEAN): void = ???
            fun test2(a: FALSE): void = {
              test1(a)
            }
            ---
            fun(a: BOOLEAN) -> void
            fun(a: FALSE) -> void
          `;

          checkMainType`
            enum BOOLEAN {
              TRUE
              FALSE
              NONE
            }

            // 2
            fun test1(a: BOOLEAN): void = {
              test5(a)
            }

            fun test5(a: NONE | FALSE | TRUE): void = {
              test1(a)
            }
            ---
            fun(a: BOOLEAN) -> void
            fun(a: NONE | FALSE | TRUE) -> void
          `;

          checkMainType`
            enum BOOLEAN {
              TRUE
              FALSE
              NONE
            }
            // 3
            fun test1(a: TRUE): void = {
              test2(a)
            }
            fun test2(a: FALSE): void = ???
            ---
            fun(a: TRUE) -> void
            fun(a: FALSE) -> void
            ---
            1) Invalid signature. Expecting arguments type: (FALSE) but got: (TRUE)
          `;

          checkMainType`
            enum BOOLEAN {
              TRUE
              FALSE
              NONE
            }
            // 4
            fun test1(a: BOOLEAN): void = ???
            fun test2(a: FALSE): void = ???
            fun test3(a: TRUE | FALSE): void = ???
            fun test4(a: NONE | FALSE): void = ???
            fun test5(a: NONE | FALSE | TRUE): void = ???

            fun main(): void = {
              test1(TRUE())
              test1(FALSE())
              test1(NONE())
              test2(FALSE())
              test3(TRUE())
              test3(FALSE())
              test4(NONE())
              test4(FALSE())
              test5(TRUE())
              test5(FALSE())
              test5(NONE())
            }
            ---
            fun(a: BOOLEAN) -> void
            fun(a: FALSE) -> void
            fun(a: TRUE | FALSE) -> void
            fun(a: NONE | FALSE) -> void
            fun(a: NONE | FALSE | TRUE) -> void
            fun() -> void
          `;

          checkMainType`
            enum BOOLEAN {
              TRUE
              FALSE
              NONE
            }

            // 4
            fun test1(): TRUE = TRUE()
            fun test2(): FALSE = FALSE()
            fun test3(): BOOLEAN = FALSE()
            fun test4(a: boolean): TRUE | FALSE = if(a) TRUE() else FALSE()

            ---
            fun() -> TRUE
            fun() -> FALSE
            fun() -> BOOLEAN
            fun(a: boolean) -> TRUE | FALSE
          `;

          checkMainType`
            // Ok, this one is fun. it is actually quite complicated to infer that a UnionType
            // TRUE | FALSE | NONE satisfies all the subtypes of BOOLEAN.
            // so, BOOLEAN is not assignable to TRUE | FALSE | NONE. So far.

            enum BOOLEAN {
              TRUE
              FALSE
              NONE
            }

            fun test1(a: BOOLEAN): void = {
              test5(a)
            }

            fun test2(a: FALSE): void = {
              test1(a)
              test3(a)
              test4(a)
              test5(a)
            }
            fun test3(a: TRUE | FALSE): void = {
              test1(a)
              test5(a)
            }
            fun test4(a: NONE | FALSE): void = {
              test1(a)
              test5(a)
            }
            fun test5(a: NONE | FALSE | TRUE): void = {
              test5(a)
            }

            fun main(): void = {
              test1(TRUE())
              test1(FALSE())
              test1(NONE())
              test2(FALSE())
              test3(TRUE())
              test3(FALSE())
              test4(NONE())
              test4(FALSE())
              test5(TRUE())
              test5(FALSE())
              test5(NONE())
            }
            ---
            fun(a: BOOLEAN) -> void
            fun(a: FALSE) -> void
            fun(a: TRUE | FALSE) -> void
            fun(a: NONE | FALSE) -> void
            fun(a: NONE | FALSE | TRUE) -> void
            fun() -> void
          `;

          checkMainType`
            enum BOOLEAN {
              TRUE
              FALSE
            }

            fun test1(a: BOOLEAN): void = { test2(a) }
            fun test2(a: FALSE): void = ???
            ---
            fun(a: BOOLEAN) -> void
            fun(a: FALSE) -> void
            ---
            1) Invalid signature. Expecting arguments type: (FALSE) but got: (BOOLEAN)
          `;

          checkMainType`
            struct FALSE()

            fun test1(a: ref): void = { test2(a) }
            fun test2(a: FALSE): void = ???
            ---
            fun(a: ref) -> void
            fun(a: FALSE) -> void
            ---
            1) Invalid signature. Expecting arguments type: (FALSE) but got: (ref)
          `;

          checkMainType`
            enum BOOLEAN {
              TRUE
              FALSE
              NONE
            }

            fun test1(a: TRUE | FALSE): void = { test2(a) }
            fun test2(a: FALSE): void = ???
            ---
            fun(a: TRUE | FALSE) -> void
            fun(a: FALSE) -> void
            ---
            1) Invalid signature. Expecting arguments type: (FALSE) but got: (TRUE | FALSE)
          `;
        });
        describe('unify complete types', () => {
          checkMainType`
            enum Boolean {
              True
              False
            }

            var x = if (true) True else False
            ---
            x := (union (alias True) (alias False))
          `;

          checkMainType`
            enum Boolean {
              True(a: i32)
              False(a: i32)
            }

            var x = if (true) True(1) else False(1)
            ---
            x := (union (alias True) (alias False))
          `;

          checkMainType`
            enum Boolean {
              True
              False
            }

            var x = if (true) True else True
            ---
            x := (alias True (struct))
          `;

          checkMainType`
            enum Boolean {
              True
              False
              None
            }

            var x = if (true) True else False
            ---
            x := (union (alias True) (alias False))
          `;

          checkMainType`
            enum Maybe {
              Some(a: i32)
              None
            }

            var x = if (true) Some(1) else None
            ---
            x := (union (alias Some) (alias None))
          `;

          checkMainType`
            enum Maybe {
              Some(a: i32)
              None
            }

            var x = if (true) Some(1) else Some(2)
            ---
            x := (alias Some (struct))
          `;

          checkMainType`
            enum Maybe {
              Some(a: i32)
              None
            }

            var x: Maybe = if (true) Some(1) else Some(2)
            ---
            x := (alias Maybe (union (alias Some) (alias None)))
          `;

          checkMainType`
            enum P {
              A
              B
            }
            var y = if(true) A else B
            fun test1(): P = A
            ---
            y := (union (alias A) (alias B))
            fun() -> P
          `;

          describe('funny case that doesnt work.', () => {
            checkMainType`
              enum P {
                B(x: i32)
                A(x: i32)
              }
              var y = if (true) A(0) else B(0)
              var z: P = if (true) A(0) else B(0)
              fun test1(): P = A(1)
              ---
              y := (union (alias A) (alias B))
              z := (alias P (union (alias B) (alias A)))
              fun() -> P
            `;
          });
        });
      });

      checkMainType`
        fun main(): f32 = 1.0
        ---
        fun() -> f32
      `;

      checkMainType`
        enum x {
          Nila
          Custom(r: i32)
        }

        fun d(i: i32): void = x(Custom(i))
        fun d(t: Nila): void = x(t)
        fun d(): void = x(Nila)
        ---
        fun(i: i32) -> void & fun(t: Nila) -> void & fun() -> void
        ---
        Property "apply" doesn't exist on type "x"
      `;

      checkMainType`

        fun rec(x: i32): i32 =
          if (x > 0)
            rec(x - 1)
          else
            0
        ---
        fun(x: i32) -> i32
      `;
      describe('assign to ref', () => {
        checkMainType`
          type void = %injected
          enum x {
            Nila
            Custom(r: i32)
          }

          fun testSuperType(x: x): void = ???

          fun test(): void = {
            testSuperType(Custom(1))
            testSuperType(Nila)
          }
          ---
          fun(x: x) -> void
          fun() -> void
        `;

        checkMainType`
          type void = %injected

          enum x {
            Nila
            Custom(r: i32)
          }

          fun testRefType(x: ref): void = ???

          fun testX(y: x): void = {
            testRefType(y)
          }

          fun test(): void = {
            testX(Custom(1))
            testX(Nila)
            testRefType(Custom(1))
            testRefType(Nila)
          }
          ---
          fun(x: ref) -> void
          fun(y: x) -> void
          fun() -> void
        `;

        checkMainType`
          type void = %injected

          enum x {
            Nila
          }

          fun qq(x: ref): void = ???
          fun qq(x: x): f32 = ???

          fun e(t: Nila): f32 = qq(t)
          fun f(): f32 = qq(Nila)
          ---
          fun(x: ref) -> void & fun(x: x) -> f32
          fun(t: Nila) -> f32
          fun() -> f32
        `;

        checkMainType`
          enum x {
            Nila
            Custom(r: i32)
          }

          fun canAnyStructBeAssignedToRef(x: ref): boolean = ???

          fun a(): boolean = canAnyStructBeAssignedToRef(Custom(1))
          fun b(): boolean = canAnyStructBeAssignedToRef(Nila)
          fun c(t: x): boolean = canAnyStructBeAssignedToRef(t)
          ---
          fun(x: ref) -> boolean
          fun() -> boolean
          fun() -> boolean
          fun(t: x) -> boolean
        `;

        checkMainType`
          type void = %injected

          enum x {
            Nila
            Custom(r: i32)
          }

          fun qq(x: ref): void = ???
          fun qq(x: x): boolean = ???

          fun a(): boolean = qq(Custom(1))
          fun b(t: Custom): boolean = qq(t)
          fun c(t: x): boolean = qq(t)
          fun d(i: i32): boolean = qq(Custom(i))
          fun e(t: Nila): boolean = qq(t)
          fun f(): boolean = qq(Nila)
          ---
          fun(x: ref) -> void & fun(x: x) -> boolean
          fun() -> boolean
          fun(t: Custom) -> boolean
          fun(t: x) -> boolean
          fun(i: i32) -> boolean
          fun(t: Nila) -> boolean
          fun() -> boolean
        `;

        checkMainType`
          type void = %injected

          enum x {
            Nila
            Custom(r: i32)
          }

          fun qq(x: ref): void = ???
          fun qq(x: Nila): f32 = ???
          fun qq(x: Custom): i32 = ???

          fun a(): i32 = qq(Custom(1))
          fun b(t: Custom): i32 = qq(t)
          fun c(t: x): void = qq(t)
          fun d(i: i32): i32 = qq(Custom(i))
          fun e(t: Nila): f32 = qq(t)
          fun f(): f32 = qq(Nila)
          ---
          fun(x: ref) -> void & fun(x: Nila) -> f32 & fun(x: Custom) -> i32
          fun() -> i32
          fun(t: Custom) -> i32
          fun(t: x) -> void
          fun(i: i32) -> i32
          fun(t: Nila) -> f32
          fun() -> f32
        `;

        checkMainType`
          enum x {
            Nila
            Custom(r: i32)
          }

          fun qq(x: Custom): i32 = ???
          fun qq(x: ref): void = ???
          fun qq(x: Nila): f32 = ???

          fun a(): i32 = qq(Custom(1))
          fun b(t: Custom): i32 = qq(t)
          fun c(t: x): void = qq(t)
          fun d(i: i32): i32 = qq(Custom(i))
          fun e(t: Nila): f32 = qq(t)
          fun f(): f32 = qq(Nila)
          ---
          fun(x: Custom) -> i32 & fun(x: ref) -> void & fun(x: Nila) -> f32
          fun() -> i32
          fun(t: Custom) -> i32
          fun(t: x) -> void
          fun(i: i32) -> i32
          fun(t: Nila) -> f32
          fun() -> f32
        `;
      });
      checkMainType`
        enum x {
          Custom(r: i32)
        }

        fun QQ(x: ref): void = ???

        fun a(): void = QQ(Custom(1))
        fun b(t: Custom): void = QQ(t)
        fun c(t: x): void = QQ(t)
        fun d(i: i32): void = QQ(Custom(i))
        ---
        fun(x: ref) -> void
        fun() -> void
        fun(t: Custom) -> void
        fun(t: x) -> void
        fun(i: i32) -> void
      `;

      checkMainType`
        enum x {
          TEST
          XXX(a: i32)
        }

        fun main1(): TEST = TEST
        fun main2(): x = TEST
        fun main3(): x = XXX(1)
        fun main4(): XXX = XXX(1)
        ---
        fun() -> TEST
        fun() -> x
        fun() -> x
        fun() -> XXX
      `;

      checkMainType`
        enum x {
          TEST
        }

        fun main(): TEST = TEST()
        fun main2(): x = TEST()
        ---
        fun() -> TEST
        fun() -> x
      `;

      checkMainType`
        private fun test(a: f32): f32 = a
        private fun main(): f32 = test(f32)
        ---
        fun(a: f32) -> f32
        fun() -> f32
        ---
        Property "apply" doesn't exist on type "f32".
      `;

      checkMainType`
        fun main(): f32 = f32
        ---
        fun() -> f32
        ---
        Property "apply" doesn't exist on type "f32".
      `;
    });

    describe('duplicated signature', () => {
      checkMainType.skip`
        fun a(x: f32): void = ???
        fun a(x: f32): void = ???
        ---
        fun(x: f32) -> void
        ---
        Error
      `;

      checkMainType.skip`
        type XX = f32
        fun a(x: f32): void = ???
        fun a(x: XX): void = ???
        ---
        fun(x: f32) -> void & fun(x: XX) -> void
        ---
        Error
      `;

      checkMainType.skip`
        fun as(x: f32): boolean = ???
        fun as(x: f32): boolean = ???
        ---
        fun(x: f32) -> boolean
        ---
        Error
      `;
    });

    describe('named types', () => {
      checkMainType`
        enum Color {
          Red
          Green
          Blue
        }

        fun isRed(color: Color): boolean = ???

        fun test(): void = {
          var x = if(1>0) Red else Green
          isRed(x)
          isRed(Red)
          isRed(Green)
          isRed(Blue)
        }
        ---
        fun(color: Color) -> boolean
        fun() -> void
      `;

      checkMainType`
        enum Color {
          Red
          Green
          Blue
        }

        fun isRed(color: Color): void = ???
        ---
        fun(color: Color) -> void
      `;
    });

    describe('struct "is"', () => {
      checkMainType`
        enum Enum {
          A
          B
          C
        }

        var value1: Enum = A
        var value2: A | B = A
        var value3: A = A

        var x1 = value1 is A
        var y1 = value1 is Enum
        var z1 = value1 is B

        var x2 = value2 is A
        var y2 = value2 is Enum
        var z2 = value2 is B

        var x3 = value3 is A
        var y3 = value3 is Enum
        var z3 = value3 is B
        ---
        value1 := (alias Enum (union (alias A) (alias B) (alias C)))
        value2 := (union (alias A) (alias B))
        value3 := (alias A (struct))
        x1 := (alias boolean (native boolean))
        y1 := (alias boolean (native boolean))
        z1 := (alias boolean (native boolean))
        x2 := (alias boolean (native boolean))
        y2 := (alias boolean (native boolean))
        z2 := (alias boolean (native boolean))
        x3 := (alias boolean (native boolean))
        y3 := (alias boolean (native boolean))
        z3 := (alias boolean (native boolean))
      `;

      checkMainType`
        enum Enum {
          A
        }

        fun x(x: u64): boolean = x is A
        fun x(x: f32): boolean = x is A
        ---
        fun(x: u64) -> boolean & fun(x: f32) -> boolean
        ---
        "is" expression can only be used with reference types,
        "is" expression can only be used with reference types,
      `;
    });

    describe('getters and setters', () => {
      checkMainType`
        struct X(value: i32)

        fun main(a: X): i32 = a.value
        ---
        fun(a: X) -> i32
      `;

      checkMainType`
        struct X(value: i32)

        fun main(): i32 = {
          val x = X(10)
          x.value = 99
          x.value
        }
        ---
        fun() -> i32
      `;

      checkMainType`
        struct X(value: i32)

        fun main(): i32 = {
          val x = X(10)
          x.value = false
          x.value
        }
        ---
        fun() -> i32
        ---
        Could not find a valid overload
      `;
    });
    describe('type schema', () => {
      checkMainType`
        struct X(value: i32)
        var x = X(1)
        var a = x.^byteSize
        ---
        x := (alias X (struct))
        a := (never)
        ---
        "X" is not a type
      `;

      checkMainType`
        struct X(value: i32)
        var a: u32 = X.^byteSize
        var b: u32 = X.^discriminant
        ---
        a := (alias u32 (native u32))
        b := (alias u32 (native u32))
      `;

      checkMainType`
        struct X(value: i32)
        var a: boolean = X.^asd
        ---
        a := (alias boolean (native boolean))
        ---
        Invalid schema property
      `;

      checkMainType`
        struct X(value: i32)
        var a: boolean = X.^byteSize
        ---
        a := (alias boolean (native boolean))
        ---
        Type "u32" is not assignable to "boolean"
      `;
    });
    describe('match is not exhaustive', () => {
      checkMainType`
        fun assert(x: boolean): void =
          if (x == false)
            panic()

        fun test(x: i32): void = {
          match x {
            case 1 -> assert(true)
            else -> panic()
          }
        }
        ---
        fun(x: boolean) -> void
        fun(x: i32) -> void
      `;
      checkMainType`
        enum Enum {
          A
          B
        }

        fun x(x: Enum): i32 =
          match x {
            case is A -> 1
            case is Enum -> 1
          }
        ---
        fun(x: Enum) -> i32
      `;

      checkMainType`
        enum Enum {
          A
          B
        }

        fun x(x: Enum): i32 =
          match x {
            case is A -> 1
            case is B -> 1
          }
        ---
        fun(x: Enum) -> i32
      `;

      checkMainType`
        enum Enum {
          A
          B
        }

        fun x(x: Enum): i32 =
          match x {
            case is Enum -> 1
          }
        ---
        fun(x: Enum) -> i32
      `;

      checkMainType`
        enum Enum {
          A
          B
        }

        fun x(x: Enum): i32 =
          match x {
            case is Enum -> 1
            else -> 3
          }
        ---
        fun(x: Enum) -> i32
        ---
        Unreachable
      `;

      checkMainType`
        enum Enum {
          A
          B
        }

        fun x(x: Enum): i32 =
          match x {
            case is ref -> 1
            else -> 3
          }
        ---
        fun(x: Enum) -> i32
        ---
        Unreachable
      `;

      checkMainType`
        fun x(x: ref): i32 =
          match x {
            case is ref -> 1
            else -> 3
          }
        ---
        fun(x: ref) -> i32
        ---
        Unreachable
      `;

      checkMainType`
        enum Enum {
          A
          B
        }

        fun x(x: ref): i32 =
          match x {
            case is Enum -> 1
            else -> 3
          }
        ---
        fun(x: ref) -> i32
      `;

      checkMainType`
        enum Enum {
          A
          B
        }

        fun x(x: ref): i32 =
          match x {
            case is A -> 1
            case is B -> 1
            else -> 3
          }
        ---
        fun(x: ref) -> i32
      `;

      checkMainType`
        enum Enum {
          A
          B
        }

        fun x(x: ref): i32 =
          match x {
            case is A -> 1
            case is B -> 1
          }
        ---
        fun(x: ref) -> i32
        ---
        Match is not exhaustive
      `;

      checkMainType`
        enum Enum {
          A
          B
        }

        fun x(x: Enum): i32 =
          match x {
            case is A -> 1
            case is B -> 1
            case is Enum -> 1
          }
        ---
        fun(x: Enum) -> i32
        ---
        Unreachable
      `;

      checkMainType`
        enum Enum {
          A
          B
        }

        fun x(x: Enum): i32 =
          match x {
            case is A -> 1
          }
        ---
        fun(x: Enum) -> i32
        ---
        Match is not exhaustive
      `;

      checkMainType`
        enum Enum {
          A
          B
        }

        fun x(x: A | B): i32 =
          match x {
            case is A -> 1
          }
        ---
        fun(x: A | B) -> i32
        ---
        Match is not exhaustive
      `;

      checkMainType`
        enum Enum {
          A
          B
        }

        fun x(x: A | B): i32 =
          match x {
            case is A -> 1
            else -> 1
          }
        ---
        fun(x: A | B) -> i32
      `;

      checkMainType`
        enum Enum {
          A
          B
        }

        enum Enum2 {
          C
          D
        }

        fun x(x: Enum | Enum2): i32 =
          match x {
            case is A -> 1
            case is B -> 1
            case is C -> 1
          }
        ---
        fun(x: Enum | Enum2) -> i32
        ---
        Match is not exhaustive
      `;

      checkMainType`
        enum Enum {
          A
          B
        }

        enum Enum2 {
          C
          D
        }

        fun x(x: Enum | Enum2): i32 =
          match x {
            case is A -> 1
            case is B -> 1
            case is C -> 1
            case is D -> 1
          }
        ---
        fun(x: Enum | Enum2) -> i32
      `;

      checkMainType`
        enum Enum {
          A
          B
        }

        enum Enum2 {
          C
          D
        }

        fun x(x: A | B | C): i32 =
          match x {
            case is A -> 1
            case is B -> 1
            case is C -> 1
          }
        ---
        fun(x: A | B | C) -> i32
      `;

      checkMainType`
        enum Enum {
          A
          B
        }

        enum Enum2 {
          C
          D
        }

        fun x(x: A | B | C): i32 =
          match x {
            case is A -> 1
            case is B -> 1
            case is C -> 1
          }
        ---
        fun(x: A | B | C) -> i32
      `;

      checkMainType`
        enum Enum {
          A
          B
        }

        enum Enum2 {
          C
          D
        }

        fun x(x: A | B | C | D): i32 =
          match x {
            case is A -> 1
            case is B -> 1
            case is C -> 1
          }
        ---
        fun(x: A | B | C | D) -> i32
        ---
        Match is not exhaustive
      `;
    });

    describe('never type', () => {
      checkMainType`
        fun a(x: i32): i32 =
          if(x ==0)
            x
          else
            panic()

        fun b(x: i32): i32 =
          match x {
            case 0 -> x
            else -> panic()
          }
        ---
        fun(x: i32) -> i32
        fun(x: i32) -> i32
      `;
    });

    describe('UnionType', () => {
      parsingContext.getParsingPhaseForContent('unit-x', 'unit-x', `type void = %injected`);
      const scope = new Scope(parsingContext, 'unit-x');
      const aliasOf = (name: string, type: Type) =>
        new TypeAlias(Nodes.NameIdentifierNode.fromString(name, null as any), type);
      const struct = (_name: string) => new StructType([]);
      const union = (...of: Type[]) => new UnionType(of);
      const namedUnion = (name: string, ...of: Type[]) => aliasOf(name, union(...of));
      const structAlias = (name: string) => aliasOf(name, struct(name));

      describe('expansion', () => {
        it('should expand types recursively', () => {
          const A = structAlias('A');
          const B = structAlias('B');
          const C = structAlias('C');
          const D = structAlias('D');
          const AB = union(A, B);
          const ABC = union(AB, C);

          const simplified = union(
            AB,
            ABC,
            D,
            union(union(union(struct('F'), struct('G')), struct('H')), struct('I'))
          ).expand(scope);

          expect(simplified.inspect(100)).to.eq(
            `(union (alias A (struct)) (alias B (struct)) (alias C (struct)) (alias D (struct)) (struct) (struct) (struct) (struct))`.trim()
          );
        });
      });

      describe('assignation', () => {
        it('ref is not assignable to A, B and (A | B)', () => {
          const A = structAlias('A');
          const B = structAlias('B');
          const AB = union(A, B);

          const refAlias = aliasOf('ref', REF_TYPE);

          expect(REF_TYPE.canBeAssignedTo(REF_TYPE, scope)).to.eq(true, 'ref -> ref == true');
          expect(REF_TYPE.canBeAssignedTo(AB, scope)).to.eq(false, 'ref -> AB == false');
          expect(REF_TYPE.canBeAssignedTo(A, scope)).to.eq(false, 'ref -> A == false');
          expect(REF_TYPE.canBeAssignedTo(B, scope)).to.eq(false, 'ref -> B == false');

          expect(REF_TYPE.canBeAssignedTo(refAlias, scope)).to.eq(true, 'ref -> ref == true');
          expect(refAlias.canBeAssignedTo(refAlias, scope)).to.eq(true, 'ref -> ref == true');
          expect(refAlias.canBeAssignedTo(REF_TYPE, scope)).to.eq(true, 'ref -> ref == true');
          expect(refAlias.canBeAssignedTo(AB, scope)).to.eq(false, 'ref -> AB == false');
          expect(refAlias.canBeAssignedTo(A, scope)).to.eq(false, 'ref -> A == false');
          expect(refAlias.canBeAssignedTo(B, scope)).to.eq(false, 'ref -> B == false');

          expect(REF_TYPE.equals(REF_TYPE)).to.eq(true, 'ref == ref == true');
          expect(REF_TYPE.equals(AB)).to.eq(false, 'ref == AB == false');
          expect(REF_TYPE.equals(A)).to.eq(false, 'ref == A == false');
          expect(REF_TYPE.equals(B)).to.eq(false, 'ref == B == false');

          expect(REF_TYPE.equals(refAlias)).to.eq(true, "ref == ref' == true");
          expect(refAlias.equals(refAlias)).to.eq(true, "ref' == ref' == true");
          expect(refAlias.equals(REF_TYPE)).to.eq(false, "ref' == ref == false");
          expect(refAlias.equals(AB)).to.eq(false, 'ref == AB == false');
          expect(refAlias.equals(A)).to.eq(false, 'ref == A == false');
          expect(refAlias.equals(B)).to.eq(false, 'ref == B == false');
        });

        it('A is assignable to (A | B)', () => {
          const A = structAlias('A');
          const B = structAlias('B');
          const AB = union(A, B);

          const refAlias = aliasOf('ref', REF_TYPE);

          expect(A.canBeAssignedTo(AB, scope)).to.eq(true, 'A -> AB == true');
          expect(A.canBeAssignedTo(REF_TYPE, scope)).to.eq(true, 'A -> ref == true');
          expect(B.canBeAssignedTo(REF_TYPE, scope)).to.eq(true, 'B -> ref == true');
          expect(AB.canBeAssignedTo(REF_TYPE, scope)).to.eq(true, 'AB -> ref == true');

          expect(A.canBeAssignedTo(refAlias, scope)).to.eq(true, 'A -> ref == true');
          expect(B.canBeAssignedTo(refAlias, scope)).to.eq(true, 'B -> ref == true');
          expect(AB.canBeAssignedTo(refAlias, scope)).to.eq(true, 'AB -> ref == true');

          expect(A.equals(AB)).to.eq(false, 'A == AB == false');
          expect(A.equals(REF_TYPE)).to.eq(false, 'A == ref == false');
          expect(B.equals(REF_TYPE)).to.eq(false, 'B == ref == false');
          expect(AB.equals(REF_TYPE)).to.eq(false, 'AB == ref == false');

          expect(A.equals(refAlias)).to.eq(false, 'A == ref == false');
          expect(B.equals(refAlias)).to.eq(false, 'B == ref == false');
          expect(AB.equals(refAlias)).to.eq(false, 'AB == ref == false');
          expect(AB.equals(AB)).to.eq(true, 'AB == AB == true');
        });

        it('(A | B) is NOT assignable to A', () => {
          const A = structAlias('A');
          const B = structAlias('B');
          const AB = union(A, B);

          const refAlias = aliasOf('ref', REF_TYPE);

          expect(AB.canBeAssignedTo(A, scope)).to.eq(false, 'AB -> A == false');
          expect(AB.canBeAssignedTo(B, scope)).to.eq(false, 'AB -> B == false');
          expect(AB.canBeAssignedTo(REF_TYPE, scope)).to.eq(true, 'AB -> ref == true');
          expect(AB.canBeAssignedTo(refAlias, scope)).to.eq(true, 'AB -> ref == true');
        });
      });

      describe('subtract', () => {
        it('should subtract elements from non-expanded union', () => {
          const A = structAlias('A');
          const B = structAlias('B');
          const C = structAlias('C');
          const D = structAlias('D');
          const AB = union(A, B);
          const ABC = union(AB, C);

          const newType = union(
            AB,
            ABC,
            D,
            union(union(union(struct('F'), struct('G')), struct('H')), struct('I'))
          ).subtract(D, scope);

          expect(newType.inspect(100)).to.eq(
            `(union (alias A (struct)) (alias B (struct)) (alias C (struct)) (struct) (struct) (struct) (struct))`.trim()
          );
        });

        it('should yield (never) when subtracting (ref)', () => {
          const A = structAlias('A');
          const B = structAlias('B');
          const C = structAlias('C');
          const D = structAlias('D');
          const AB = union(A, B);
          const ABC = union(AB, C);

          const newType = union(
            AB,
            ABC,
            D,
            union(union(union(struct('F'), struct('G')), struct('H')), struct('I'))
          ).subtract(REF_TYPE, scope);

          expect(newType.inspect(100)).to.eq(`(never)`.trim());
        });

        it('should yield (never) when subtracting (ref) and (ref) is present in the union', () => {
          const A = structAlias('A');
          const B = structAlias('B');
          const C = structAlias('C');
          const D = structAlias('D');
          const AB = union(A, B, REF_TYPE);
          const ABC = union(AB, C);

          const newType = union(
            AB,
            ABC,
            D,
            union(union(union(struct('F'), struct('G')), struct('H')), struct('I'))
          ).subtract(REF_TYPE, scope);

          expect(newType.inspect(100)).to.eq(`(never)`.trim());
        });

        it('should yield (never) when subtracting (alias (ref))', () => {
          const A = structAlias('A');
          const B = structAlias('B');
          const C = structAlias('C');
          const D = structAlias('D');
          const AB = union(A, B);
          const ABC = union(AB, C);

          const newType = union(
            AB,
            ABC,
            D,
            union(union(union(struct('F'), struct('G')), struct('H')), struct('I'))
          ).subtract(aliasOf('ref', REF_TYPE), scope);

          expect(newType.inspect(100)).to.eq(`(never)`.trim());
        });

        it('should subtract entire unioimpl from non-expanded union', () => {
          const A = structAlias('A');
          const B = structAlias('B');
          const C = structAlias('C');
          const D = structAlias('D');
          const AB = union(A, B);
          const ABC = union(AB, C);

          const newType = union(
            AB,
            ABC,
            D,
            union(union(union(struct('F'), struct('G')), struct('H')), struct('I'))
          ).subtract(ABC, scope);

          expect(newType.inspect(100)).to.eq(`(union (alias D (struct)) (struct) (struct) (struct) (struct))`.trim());
        });

        it('should subtract entire unioimpl from non-expanded union', () => {
          const A = structAlias('A');
          const B = structAlias('B');
          const C = structAlias('C');
          const D = structAlias('D');
          const AB = union(A, B);
          const ABC = union(AB, C);

          const simplified = UnionType.of(
            union(AB, ABC, D, union(union(union(struct('F'), struct('G')), struct('H')), struct('I'))).expand(scope)
          );

          expect(simplified.inspect(100)).to.eq(
            `(union (alias A (struct)) (alias B (struct)) (alias C (struct)) (alias D (struct)) (struct) (struct) (struct) (struct))`.trim()
          );

          const newType = simplified.subtract(ABC, scope);

          expect(newType.inspect(100)).to.eq(`(union (alias D (struct)) (struct) (struct) (struct) (struct))`.trim());
        });

        it('subtract A from AB should yield B', () => {
          const A = structAlias('A');
          const B = structAlias('B');
          const AB = union(A, B);

          expect(AB.subtract(A, scope).inspect(100)).to.eq(`(alias B (struct))`.trim());
          expect(AB.subtract(A, scope).inspect(100)).to.eq(`(alias B (struct))`.trim());
        });

        it('subtract A and B from AB should yield NeverType', () => {
          const A = structAlias('A');
          const B = structAlias('B');
          const AB = union(A, B);

          expect(AB.subtract(AB, scope).inspect(100)).to.eq(`(never)`.trim());
        });

        it('should subtract elements from expanded union', () => {
          const A = structAlias('A');
          const B = structAlias('B');
          const C = structAlias('C');
          const D = structAlias('D');
          const AB = union(A, B);
          const ABC = union(AB, C);

          const simplified = UnionType.of(
            union(AB, ABC, D, union(union(union(struct('F'), struct('G')), struct('H')), struct('I'))).expand(scope)
          );

          expect(simplified.inspect(100)).to.eq(
            `(union (alias A (struct)) (alias B (struct)) (alias C (struct)) (alias D (struct)) (struct) (struct) (struct) (struct))`.trim()
          );

          const newType = simplified.subtract(D, scope);

          expect(newType.inspect(100)).to.eq(
            `(union (alias A (struct)) (alias B (struct)) (alias C (struct)) (struct) (struct) (struct) (struct))`.trim()
          );
        });
      });

      describe('simplification', () => {
        it('should simplify duplicated types', () => {
          const A = struct('A');
          const B = struct('B');
          const C = struct('C');
          const D = struct('D');

          const union = new UnionType([A, A, A, A, B, C, D, D]);
          const simplified = union.simplify(scope);

          expect(simplified.inspect(100)).to.eq(
            `
              (union (struct) (struct) (struct) (struct))
            `.trim()
          );
        });

        it('should simplify two equal types into one of them', () => {
          const A = struct('A');

          const union = new UnionType([A, A]);
          const simplified = union.simplify(scope);

          expect(simplified.inspect(100)).to.eq(`(struct)`.trim());
        });

        it('should simplify deeply nested unions', () => {
          const A = struct('A');
          const B = struct('B');
          const C = struct('C');
          const D = struct('D');
          const AB = namedUnion('AB', A, B);
          const CD = namedUnion('CD', C, D);

          const simplified = union(A, B, C, D, AB, CD, D, D).simplify(scope);

          expect(simplified.inspect(100)).to.eq(
            `(union (alias AB (union (struct) (struct))) (alias CD (union (struct) (struct))))`.trim()
          );
        });

        it('should simplify deeply nested unioimpl avoiding conflicts', () => {
          const A = struct('A');
          const B = struct('B');
          const C = struct('C');
          const D = struct('D');
          const AB = union(A, B);
          const BC = union(B, C);

          const simplified = union(A, B, C, D, AB, BC, D, D).simplify(scope);

          expect(simplified.inspect(100)).to.eq(
            `
              (union (struct) (struct) (struct) (struct))
            `.trim()
          );
        });

        it('should simplify deeply nested unioimpl avoiding conflicts with aliases', () => {
          const A = structAlias('A');
          const B = structAlias('B');
          const C = structAlias('C');
          const D = structAlias('D');
          const AB = union(A, B);
          const BC = union(B, C);

          const simplified = union(A, B, C, D, AB, BC, D, D).simplify(scope);

          expect(simplified.inspect(100)).to.eq(
            `
            (union (alias A (struct)) (alias B (struct)) (alias C (struct)) (alias D (struct)))
            `.trim()
          );
        });

        it('should simplify deeply nested unioimpl avoiding conflicts with aliases and extra type in unions', () => {
          const A = structAlias('A');
          const B = structAlias('B');
          const C = structAlias('C');
          const D = structAlias('D');
          const F = structAlias('F');
          const AB = union(A, B, structAlias('AB1'));
          const BC = union(B, C, structAlias('BC1'));

          const simplified = union(A, B, C, D, AB, BC, D, D, F).simplify(scope);

          expect(simplified.inspect(100)).to.eq(
            `(union (alias A (struct)) (alias B (struct)) (alias C (struct)) (alias D (struct)) (alias F (struct)) (alias AB1 (struct)) (alias BC1 (struct)))`.trim()
          );
        });

        it('should not remove ref types', () => {
          const A = struct('A');
          const B = struct('B');
          const C = struct('C');
          const D = struct('D');

          const union = new UnionType([A, A, A, A, B, C, D, D, REF_TYPE]);
          const simplified = union.simplify(scope);

          expect(simplified.inspect(100)).to.eq(
            `
              (union (struct) (struct) (struct) (struct) (ref ?))
            `.trim()
          );
        });

        it('should not simplify aliases to the same type (i32)', () => {
          const i32 = StackType.of('i32', NativeTypes.i32, 4);

          const A = aliasOf('A', i32);
          const B = aliasOf('B', i32);

          const union = new UnionType([A, B, B]);
          const simplified = union.simplify(scope);

          expect(simplified.inspect(100)).to.eq(
            `
              (union (alias A (native i32)) (alias B (native i32)))
            `.trim()
          );

          expect(A.canBeAssignedTo(B, scope)).to.eq(true, 'A can be assigned to B');
          expect(B.canBeAssignedTo(A, scope)).to.eq(true, 'B can be assigned to A');
          expect(B.canBeAssignedTo(B, scope)).to.eq(true, 'B can be assigned to B');
          expect(A.canBeAssignedTo(A, scope)).to.eq(true, 'A can be assigned to A');
        });

        it('should not simplify aliases to the same type (ref)', () => {
          const A = aliasOf('A', REF_TYPE);
          const B = aliasOf('B', REF_TYPE);

          const union = new UnionType([A, B, B]);
          const simplified = union.simplify(scope);

          expect(simplified.inspect(100)).to.eq(
            `
              (union (alias A (ref ?)) (alias B (ref ?)))
            `.trim()
          );

          expect(A.canBeAssignedTo(B, scope)).to.eq(true, 'A can be assigned to B');
          expect(B.canBeAssignedTo(A, scope)).to.eq(true, 'B can be assigned to A');
          expect(B.canBeAssignedTo(B, scope)).to.eq(true, 'B can be assigned to B');
          expect(A.canBeAssignedTo(A, scope)).to.eq(true, 'A can be assigned to A');
        });

        it('should structs are assignable to refs', () => {
          const A = aliasOf('A', struct('A'));
          const B = aliasOf('B', struct('B'));

          const union = new UnionType([A, B, B]);
          const simplified = union.simplify(scope);

          expect(simplified.inspect(100)).to.eq(
            `
              (union (alias A (struct)) (alias B (struct)))
            `.trim()
          );

          expect(A.canBeAssignedTo(B, scope)).to.eq(false, 'A cannot be assigned to B');
          expect(B.canBeAssignedTo(A, scope)).to.eq(false, 'B cannot be assigned to A');
          expect(B.canBeAssignedTo(B, scope)).to.eq(true, 'B can be assigned to B');
          expect(A.canBeAssignedTo(A, scope)).to.eq(true, 'A can be assigned to A');
          expect(B.canBeAssignedTo(B.of, scope)).to.eq(true, 'B can be assigned to B');
          expect(B.of.canBeAssignedTo(B, scope)).to.eq(true, 'B can be assigned to B');
          expect(A.canBeAssignedTo(A.of, scope)).to.eq(true, 'A can be assigned to A');
          expect(A.of.canBeAssignedTo(A, scope)).to.eq(true, 'A can be assigned to A');
          expect(B.of.canBeAssignedTo(B.of, scope)).to.eq(true, 'B can be assigned to B');
          expect(A.of.canBeAssignedTo(A.of, scope)).to.eq(true, 'A can be assigned to A');
        });

        it('should not remove alias to ref types', () => {
          const A = struct('A');
          const B = struct('B');
          const C = struct('C');
          const D = struct('D');

          const ref = aliasOf('Ref', REF_TYPE);

          const union = new UnionType([A, A, A, A, B, C, D, D, ref]);
          const simplified = union.simplify(scope);

          expect(simplified.inspect(100)).to.eq(
            `
              (union (struct) (struct) (struct) (struct) (alias Ref (ref ?)))
            `.trim()
          );
        });

        it('should remove types present inside the unions', () => {
          const A = struct('A');
          const B = struct('B');
          const C = struct('C');
          const D = struct('D');

          const unionCD = new UnionType([C, D]);

          const union = new UnionType([A, A, A, A, B, C, unionCD, D, D]);

          const simplified = union.simplify(scope);

          expect(simplified.inspect(100)).to.eq(
            `
              (union (struct) (struct) (union (struct) (struct)))
            `.trim()
          );
        });

        it('should remove types present inside the unioimpl with aliases', () => {
          const A = struct('A');
          const B = struct('B');
          const C = struct('C');
          const D = struct('D');

          const unionCD = aliasOf('CDUnion', new UnionType([C, D]));

          const union = new UnionType([A, A, A, A, B, C, unionCD, D, D]);

          const simplified = union.simplify(scope);

          expect(simplified.inspect(0)).to.eq(
            `
              (union (struct) (struct) (alias CDUnion))
            `.trim()
          );
        });
      });
    });

    describe('struct pattern matching', () => {
      checkMainType`
        enum Enum {
          A
        }

        enum Color {
          Red
        }

        var x: ref = ???

        var y = match x {
          case x is Enum -> x
          else -> Red
        }
        ---
        x := (alias ref (ref ?))
        y := (union (alias Enum) (alias Red))
      `;

      checkMainType`
        enum Enum {
          A
          B
          C
        }

        enum Color {
          Red
        }

        fun y(x: ref): Enum | Red = match x {
          case x is Enum -> x
          else -> Red
        }
        ---
        fun(x: ref) -> Enum | Red
      `;

      checkMainType`
        /// same "is" matcher twice should yield unreachable code

        enum Enum {
          A
          B
        }

        enum Enum2 {
          C
          D
        }

        fun x(x: Enum | Enum2 | A | B | C | D): i32 =
          match x {
            case is A -> 1
            case is B -> 1
            case is B -> 1
            else -> 1
          }
        ---
        fun(x: Enum | Enum2 | A | B | C | D) -> i32
        ---
        Type mismatch: Type "C | D" is not assignable to "B"
        Unreachable code
      `;

      checkMainType`
        enum Enum {
          A
          B
          C
        }

        var value: Enum = A

        var x = match value {
          case b is B -> b
          else -> B
        }

        var y = match value {
          case a is A -> a
          case b is B -> b
          else -> B
        }

        var z = match value {
          case a is A -> a
          case b is B -> b
          else -> value
        }
        ---
        value := (alias Enum (union (alias A) (alias B) (alias C)))
        x := (alias B (struct))
        y := (union (alias A) (alias B))
        z := (alias Enum (union (alias A) (alias B) (alias C)))
      `;

      checkMainType`
        enum Enum {
          A
          B
        }

        enum Enum2 {
          C
          D
        }

        fun x(x: Enum): i32 =
          match x {
            case is A -> 1
            case is B -> 1
            case is C -> 1
          }
        ---
        fun(x: Enum) -> i32
        ---
        Unreachable
      `;

      checkMainType`
        enum Enum {
          A
        }

        fun x(x: u64): i32 =
          match x {
            case is A -> 1
            else -> 1
          }
        ---
        fun(x: u64) -> i32
        ---
        "is" expression can only be used with reference types, used with: "u64"
      `;

      checkMainType`
        enum Enum {
          A
          B
        }

        fun x(x: B): i32 =
          match x {
            case is A -> 1
            else -> 1
          }
        ---
        fun(x: B) -> i32
        ---
        Type mismatch: Type "B" is not assignable to "A"
        Unreachable code
      `;

      checkMainType`
        enum Enum {
          A
          B
        }

        fun test(value: Enum): B = {
          match value {
            case b is B -> {
              var x: B = b
              x
            }
            else -> B
          }
        }
        ---
        fun(value: Enum) -> B
      `;

      describe('deconstruct', () => {
        checkMainType`
          enum Color {
            Red
            Custom(r: i32, g: i32, b: i32)
          }

          fun isRed(color: Color): boolean = {
            match color {
              case is Red -> true
              case is Custom(r,g,b) -> r == 255 && g == 0 && b == 0
            }
          }
          ---
          fun(color: Color) -> boolean
        `;

        checkMainType`
          /// deconstruct variables cannot be reassigned
          enum Color {
            Red
            Custom(r: i32, g: i32, b: i32)
          }

          fun isRed(color: Color): boolean = {
            match color {
              case is Red -> true
              case is Custom(r,g,b) -> {
                r = 255
                r == 255 && g == 0 && b == 0
              }
            }
          }
          ---
          fun(color: Color) -> boolean
          ---
          r is immutable
        `;

        checkMainType`
          /// case alias is immutable
          enum Color {
            Red
          }

          fun isRed(color: Color): boolean = {
            match color {
              case alias is Red -> {
                alias = Red
                false
              }
            }
          }
          ---
          fun(color: Color) -> boolean
          ---
          alias is immutable
        `;

        checkMainType`
          enum Color {
            Red
            Custom(a: i32)
          }

          fun isRed(color: Color): i32 = {
            match color {
              case is Red -> 1
              case is Custom(a) -> a
            }
          }
          ---
          fun(color: Color) -> i32
        `;

        checkMainType`
          enum Color {
            Red
            Custom(a: i32)
          }

          fun isRed(color: Color): i32 = {
            match color {
              case is Red -> 1
              case is Custom(a, unexistentProperty) -> a
            }
          }
          ---
          fun(color: Color) -> i32
          ---
          Property "unexistentProperty"
        `;

        checkMainType`
          enum Color {
            Red
            Blue
            // TODO: check duplicated params in structs
            Custom(
              a: i32,
              b: i32,
              c: i32,
              d: Red,
              e: i32
            )
          }

          fun isRed(color: Color): Red | Blue = {
            match color {
              case is Custom(_,_,_,d) -> d
              else -> Blue
            }
          }
          ---
          fun(color: Color) -> Red | Blue
        `;

        checkMainType`
          enum Color {
            Red
            Green
            Blue
            Custom(r: i32, g: i32, b: i32)
          }

          fun isRed(color: Color): boolean = {
            match color {
              case is Red -> true
              case is Custom(r,g,b) -> r == 255 && g == 0 && b == 0
              else -> false
            }
          }

          fun testColors(): void = {
            support::test::assert(isRed(Red) == true)
            support::test::assert(isRed(Green) == false)
            support::test::assert(isRed(Blue) == false)
            support::test::assert(isRed(Custom(5,5,5)) == false)
          }
          ---
          fun(color: Color) -> boolean
          fun() -> void
        `;
      });
    });

    describe('structs', () => {
      checkMainType`
        enum BOOLEAN {
          TRUE
          FALSE
          NONE
        }

        fun test1(): TRUE = TRUE()
        fun test2(): FALSE = FALSE()
        fun test3(): BOOLEAN = FALSE()
        fun test4(a: boolean): TRUE | FALSE = if(a) TRUE() else FALSE()

        ---
        fun() -> TRUE
        fun() -> FALSE
        fun() -> BOOLEAN
        fun(a: boolean) -> TRUE | FALSE
      `;

      checkMainType`
        struct Custom(r: i32)

        var x = Custom(1)
        ---
        x := (alias Custom (struct))
      `;

      checkMainType`
        struct Custom(r: i32)

        fun a(): Custom = Custom(1)
        fun b(i: i32): Custom = Custom(i)
        ---
        fun() -> Custom
        fun(i: i32) -> Custom
      `;

      checkMainType`
        struct TEST()

        fun main(): TEST = TEST
        ---
        fun() -> TEST
      `;

      checkMainType`
        struct TEST()

        fun main(): TEST = TEST()
        ---
        fun() -> TEST
      `;

      checkMainType`
        struct A()
        fun test(x: ref): boolean = x == A()
        ---
        fun(x: ref) -> boolean
      `;

      checkMainType`
        struct A()

        fun test1(x: ref): boolean = x == A()
        fun test2(x: A): boolean = test1(x)

        ---
        fun(x: ref) -> boolean
        fun(x: A) -> boolean
      `;

      checkMainType`
        struct X()

        enum Y {
          X1
        }

        fun test1(x1: X1): boolean = x1 == X1()
        fun test2(x: X1): boolean = test1(x)

        ---
        fun(x1: X1) -> boolean
        fun(x: X1) -> boolean
      `;

      checkMainType`
        struct X()

        enum Y {
          Z
        }

        fun test1(x: Z): boolean = x == Z()
        fun test2(x: X): boolean = test1(x)
        ---
        fun(x: Z) -> boolean
        fun(x: X) -> boolean
        ---
        1) Invalid signature. Expecting arguments type: (Z) but got: (X)
      `;
    });

    describe('implicit cast', () => {
      checkMainType`
        fun test1(x: i32): i32 = x

        fun main(x: u8): void = {
          test1(x)
        }
        ---
        fun(x: i32) -> i32
        fun(x: u8) -> void
      `;

      checkMainType`
      fun test1(x: u8): i32 = x
      ---
      fun(x: u8) -> i32
      `;

      checkMainType`
        import support::test

        fun testMatchWithDifferentTypes(input: i32): boolean = {
          match input {
            case 1 -> true
            else -> false
          }
        }

        #[export]
        fun main(): void = {
          var aByte = 10 as u8
          var a: u16 = aByte
          mustEqual(a, 10, "eq(10_u16, 10_i32)")
          // verify(x == 10, "10_u16 == 10_i32")
          var x = 0 as i16
          verify(testMatchWithDifferentTypes(x) == false, "match 0")
          var y = 1 as u8
          verify(testMatchWithDifferentTypes(y) == true, "match 1")
          verify(0.0 == 0, "0.0 == 0")
        }
        ---
        fun(input: i32) -> boolean
        fun() -> void
      `;
    });
    describe('operators', () => {
      checkMainType`
        fun AL_BITS(): i32 = 3
        fun AL_SIZE(): i32 = 1 << AL_BITS()
        fun AL_MASK(): i32 = AL_SIZE() - 1
        fun MAX_SIZE_32(): i32 = 1 << 30 // 1G
        fun HEAP_BASE(): i32 = 0
        fun startOffset(): i32 = (HEAP_BASE() + AL_MASK()) & ~(AL_MASK())
        fun offset(): i32 = startOffset()
        fun max(a: i32, b: i32): i32 = if (a>b) a else b
        fun currentMemory(): i32 = %wasm {(current_memory)}
        fun main(): i32 = {
          val ptr = offset()
          val newPtr = (ptr + 1 + AL_MASK()) & ~(AL_MASK())
          val pagesNeeded = ((newPtr - ptr + 0xffff as i32) & ~(0xffff as i32)) >>> 16
          val pagesBefore = currentMemory()
          max(pagesBefore, pagesNeeded)
        }
        ---
        fun() -> i32
        fun() -> i32
        fun() -> i32
        fun() -> i32
        fun() -> i32
        fun() -> i32
        fun() -> i32
        fun(a: i32, b: i32) -> i32
        fun() -> i32
        fun() -> i32
      `;

      checkMainType`
        fun max(a: i32, b: i32): i32 = if (a>b) a else b
        fun currentMemory(): i32 = %wasm {(current_memory)}
        fun main(): i32 = {
          val pagesNeeded = 1
          val pagesBefore = currentMemory()
          max(pagesBefore, pagesNeeded)
        }
        ---
        fun(a: i32, b: i32) -> i32
        fun() -> i32
        fun() -> i32
      `;

      checkMainType`
        fun main(): i32 = ~1
        ---
        fun() -> i32
      `;

      checkMainType`
        fun max(a: i32, b: i32): i32 = if (a>b) a else b
        fun main(): i32 = max(c(), -1)
        fun c(): i32 = 123123
        ---
        fun(a: i32, b: i32) -> i32
        fun() -> i32
        fun() -> i32
      `;

      describe('imports', () => {
        checkMainType`
          import system::random

          fun main(): f32 = nextInt()
          ---
          fun() -> f32
        `;

        checkMainType`
          private var lastPtr: i32 = 0

          fun malloc(size: i32): i32 = {
            val ptr = lastPtr
            lastPtr = lastPtr + size
            ptr
          }
          ---
          lastPtr := (alias i32 (native i32))
          fun(size: i32) -> i32
        `;

        checkMainType`
          fun testBool(i: i32): boolean = match i {
            case 0 -> true
            case 1 -> true
            case 2 -> true
            case 3 -> true
            case 4 -> true
            case 5 -> true
            case 6 -> true
            case 7 -> true
            case 8 -> true
            case 9 -> true
            case 10 -> true
            case 11 -> true
            case 12 -> true
            else ->    true
          }
          ---
          fun(i: i32) -> boolean
        `;

        checkMainType`
          fun main(): f32 = system::random::nextInt()
          ---
          fun() -> f32
        `;
      });
      checkMainType`

        private fun innerFunctionArgs(a: i32): i32 = a
        private fun innerFunction(): i32 = innerFunctionArgs(3)

        private fun over(): i32 = 1
        private fun over(a: i32): i32 = a

        fun outerFunction(): i32 = innerFunction() + over()
        ---
        fun(a: i32) -> i32
        fun() -> i32
        fun() -> i32 & fun(a: i32) -> i32
        fun() -> i32
      `;

      checkMainType`

        fun matcher(x: i32): i32 =
          match x {
            case 1 -> 1
            else -> 2
          }
        ---
        fun(x: i32) -> i32
      `;

      checkMainType`
        fun matcher(x: i32): f32 =
          match x {
            case 1.5 -> 1
            else -> 2
          }
        ---
        fun(x: i32) -> f32
        ---
        Type mismatch: Type "i32" is not assignable to "f32"
      `;

      checkMainType`
        fun matcher(x: i32): f32 =
          match x {
            case 1.5 -> false
            else -> false
          }
        ---
        fun(x: i32) -> f32
        ---
        Type "boolean" is not assignable to "f32"
      `;

      checkMainType`
        type void = %injected

        fun matcher(): void = {}
        ---
        fun() -> void
      `;

      checkMainType`

        enum Boolean {
          True()
          False()
        }

        fun gt0(x: i32): Boolean =
          if (x > 0)
            True()
          else
            False()
        ---
        fun(x: i32) -> Boolean
      `;

      checkMainType`
        fun malloc(size: i32): i32 = %wasm {
          (local.get $size)
        }

        fun main(): i32 = malloc(1)
        ---
        fun(size: i32) -> i32
        fun() -> i32
      `;

      checkMainType`

        enum Boolean {
          True()
          False()
        }

        enum Boolean2 {
          True2()
        }

        fun gt0(x: i32): True | True2 =
          if (x > 0)
            True()
          else
            True2()
        ---
        fun(x: i32) -> True | True2
      `;

      checkMainType`

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
        ---
        fun(n: i32, x1: i32, x2: i32) -> i32
        fun(n: i32) -> i32
        fun() -> i32
      `;

      checkMainType`

        enum Boolean {
          True()
          False()
        }

        enum Boolean2 {
          True2()
        }

        fun gt0(x: i32): True | Boolean2 =
          if (x > 0)
            True()
          else
            True2()
        ---
        fun(x: i32) -> True | Boolean2
      `;

      checkMainType`

        enum Boolean {
          True()
          False()
        }

        fun gt0(x: i32): Boolean =
          if (x > 0)
            True()
          else
            False()
        ---
        fun(x: i32) -> Boolean
      `;

      checkMainType`

        fun x1(): f32 = {
          fun Y(): f32 = 1.0
          Y()
        }

        fun x2(): i32 = {
          var n = 1
          fun Y(): i32 = n
          Y()
        }

        fun x3(): f32 = {
          x2()
          x1() + x1()
        }
        ---
        fun() -> f32
        fun() -> i32
        fun() -> f32
      `;

      checkMainType`

        fun matcher(x: i32): i32 | f32 =
          match x {
            case 1 -> 1
            else -> 2.1
          }
        ---
        fun(x: i32) -> i32 | f32
      `;

      checkMainType`
        fun gte(x: i32, y: i32): boolean = {
          val test = x >= y
          test
        }
        ---
        fun(x: i32, y: i32) -> boolean
      `;

      checkMainType`
        fun gte(x: i32, y: i32): i32 = {
          val test = x >= y
          test
        }
        ---
        fun(x: i32, y: i32) -> i32
        ---
        Type "boolean" is not assignable to "i32"
      `;

      checkMainType`

        fun x(): f32 =
          if (1.2)
            1.0
          else
            0.0
        ---
        fun() -> f32
        ---
        Type "f32" is not assignable to "boolean"
      `;

      checkMainType`

        fun x(): boolean = 1 > 2
        ---
        fun() -> boolean
      `;

      checkMainType`

        fun x(): boolean = { 1 > 2 }
        ---
        fun() -> boolean
      `;

      checkMainType`

        fun x(): i32 = {
          1 > 2
          1
        }
        ---
        fun() -> i32
      `;

      checkMainType`

        fun gte(x: i32): i32 = {
          var test = 0
          test = 1 + x
          test
        }
        ---
        fun(x: i32) -> i32
      `;

      checkMainType`

        private fun fibo(n: i32, x1: i32, x2: i32): i32 =
          if (n > 0)
            fibo(n - 1, x2, x1 + x2)
          else
            x1

        fun fib(n: i32): i32 = fibo(n, 0, 1)

        fun test(): i32 = fib(46) // must be 1836311903
        ---
        fun(n: i32, x1: i32, x2: i32) -> i32
        fun(n: i32) -> i32
        fun() -> i32
      `;

      checkMainType`

        fun gte(x: i32): i32 = {
          var test = 0
          test = test + x
          test
        }
        ---
        fun(x: i32) -> i32
      `;

      checkMainType`

        fun gte(x: i32): i32 = {
          var test = 0
          test = test + x
          test
        }
        ---
        fun(x: i32) -> i32
      `;

      checkMainType`
        var x = 1
        fun getX(): i32 = x
        ---
        x := (alias i32 (native i32))
        fun() -> i32
      `;

      checkMainType`
        type void = %injected
        fun getX(x: i32): void = {}
        ---
        fun(x: i32) -> void
      `;

      checkMainType`
        fun getX(x: i32): i32 = x
        ---
        fun(x: i32) -> i32
      `;

      checkMainType`
        fun getX(x: i32): i32 = {
          x
          x
          x
          x
          x
        }
        ---
        fun(x: i32) -> i32
      `;

      checkMainType`
        fun getX(): i32 = {
          1.0
          1.0
          1
        }
        ---
        fun() -> i32
      `;

      checkMainType`
        fun gte(x: i32, y: i32): boolean = x >= y
        ---
        fun(x: i32, y: i32) -> boolean
      `;

      checkMainType`
        type void = %injected

        fun getX(x: i32): void =
          if (x > 0) {
            x
          }
        ---
        fun(x: i32) -> void
      `;

      checkMainType`
        type void = %injected

        fun getX(): void = {
          if (1 > 0) {
            1
          }
        }
        ---
        fun() -> void
      `;

      checkMainType`
        type void = %injected

        fun getX(): void =
          if (1 > 0) {
            1
          }
        ---
        fun() -> void
      `;

      checkMainType`
        type void = %injected

        var x = 1

        fun getX(): void =
          if (x > 0) {
            x
          }
        ---
        x := (alias i32 (native i32))
        fun() -> void
      `;

      checkMainType`
        type void = %injected

        var x = 1

        fun addOne(): i32 = {
          var y = x
          y = y + 1
          x = y
        }

        fun addOneNoReturn(): void = {
          x = x + 1
        }
        ---
        x := (alias i32 (native i32))
        fun() -> i32
        fun() -> void
      `;
    });
  });

  describe('file based tests', () => {
    describe('Resolution-ast', () => {
      folderBasedTest(
        '**/types/*.lys',
        phases,
        async (result, e) => {
          if (e) {
            if (result) {
              result.parsingContext.messageCollector.error(e as any);
              console.log(printErrors(result.parsingContext));
            }
            throw e;
          }
          if (!result) throw new Error('No result');
          try {
            return printAST(result.document);
          } catch (e) {
            if (e instanceof AstNodeError) {
              result.parsingContext.messageCollector.error(e);
            }
            console.log(printErrors(result.parsingContext));
            throw e;
          }
        },
        '.ast'
      );
    });

    describe('Compiler errors', () => {
      folderBasedTest(
        '**/type-error/*.lys',
        phases,
        async (result, e) => {
          if (e) throw e;
          if (result) {
            try {
              failWithErrors('should have errors', result.parsingContext);
            } catch (e) {
              if (!result.parsingContext.messageCollector.errors.length) {
                throw e;
              }
            }

            return printErrors(result.parsingContext, true);
          }
          throw new Error('No result');
        },
        '.txt',
        true
      );
    });
  });
});
