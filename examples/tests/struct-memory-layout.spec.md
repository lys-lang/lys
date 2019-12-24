# Test

Smoke tests of memory layout

#### main.lys

```lys
import support::test
import system::charset::utf8

enum TokenType {
  EndOfFile
  Identifier
  Unknown
  NewLine
  Whitespace
  StringLiteral
  NumberLiteral
  ParenthesesOpen
  ParenthesesClose
  MacroDecoration
  VectorOpen
  VectorClose
  Operator
  LineComment
  MultiLineComment
  CurlyBracesOpen
  CurlyBracesClose
  Comma
}

struct Token(tokenType: TokenType, start: u32, end: u32)


enum ParserRule {
  Terminal(tokenType: TokenType)
  StrictTerminal(tokenType: TokenType, value: string)
  NonTerminal(name: string)
  Or(lhs: ParserRule, rhs: ParserRule)
  OneOrMore(rule: ParserRule)
  ZeroOrMore(rule: ParserRule)
  Cons(head: ParserRule, tail: ParserRule)
  Cut(head: ParserRule, tail: ParserRule)
  Optional(rule: ParserRule)
  Fail(message: string)
  LookAhead(rule: ParserRule)
  NegativeLookAhead(rule: ParserRule)
  Discard(rule: ParserRule)
  Push(name: string, rule: ParserRule)
  PushIfManyChildren(name: string, rule: ParserRule)
}

enum AstNode {
  Rule0
  Leaf(token: Token, value: string)
  Node(name: string, child: AstNode)
  Numbers(a: u8, b: u16, c: u32, d: u64)
  SyntaxError(token: Token, message: string)
  UnexpectedToken(token: Token, value: string)
  AstCons(head: AstNode, tail: AstNode)
}


#[export]
fun test(): void = {
  START("test basics")


  var t = 0x0


  t = Numbers.^property$0_offset
  mustEqual(t, 0x0, "Numbers.property0 must start at 0")
  t = Numbers.^property$1_offset
  mustEqual(t, 0x1, "Numbers.property1 must start at 1")
  t = Numbers.^property$2_offset
  mustEqual(t, 0x3, "Numbers.property2 must start at 3")
  t = Numbers.^property$3_offset
  mustEqual(t, 0x7, "Numbers.property3 must start at 7")
  t = Numbers.^allocationSize
  mustEqual(t, 0xF, "Numbers.allocationSize must be 15")

  t = Node.^property$0_offset
  mustEqual(t, 0x0, "Node.property0 must start at 0")
  t = Node.^property$1_offset
  mustEqual(t, 0x8, "Node.property1 must start at 8")
  t = Node.^allocationSize
  mustEqual(t, 0x10, "Node.allocationSize must be 16")

  t = Leaf.^property$0_offset
  mustEqual(t, 0x0, "Leaf.property0 must start at 0")
  t = Leaf.^property$1_offset
  mustEqual(t, 0x8, "Leaf.property1 must start at 8")
  t = Leaf.^allocationSize
  mustEqual(t, 0x10, "Leaf.allocationSize must be 16")

  t = SyntaxError.^property$0_offset
  mustEqual(t, 0x0, "SyntaxError.property0 must start at 0")
  t = SyntaxError.^property$1_offset
  mustEqual(t, 0x8, "SyntaxError.property1 must start at 8")
  t = SyntaxError.^allocationSize
  mustEqual(t, 0x10, "SyntaxError.allocationSize must be 16")

  t = AstCons.^property$0_offset
  mustEqual(t, 0x0, "AstCons.property0 must start at 0")
  t = AstCons.^property$1_offset
  mustEqual(t, 0x8, "AstCons.property1 must start at 8")
  t = AstCons.^allocationSize
  mustEqual(t, 0x10, "AstCons.allocationSize must be 16")

  t = Token.^property$0_offset
  mustEqual(t, 0x0, "Token.property0 must start at 0")
  t = Token.^property$1_offset
  mustEqual(t, 0x8, "Token.property1 must start at 8")
  t = Token.^property$2_offset
  mustEqual(t, 12 as u32, "Token.property2 must start at 12")
  t = Token.^allocationSize
  mustEqual(t, 0x10, "Token.allocationSize must be 16")

  END()
}
```
