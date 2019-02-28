import { Parser, Grammars, IRule } from 'ebnf';

export const grammar = `
{ws=explicit}

Document          ::= Directives WS* EOF? {ws=implicit}
Directives        ::= Directive Directives? {pin=1,ws=implicit,recoverUntil=DIRECTIVE_RECOVERY,fragment=true}

Directive         ::= ( FunctionDirective
                      | ValDirective
                      | VarDirective
                      | StructDirective
                      | TypeDirective
                      | EnumDirective
                      | ImportDirective
                      | EffectDirective
                      | ImplDirective
                      ) {fragment=true}

ImportDirective   ::= IMPORT_KEYWORD ('*' WS+ 'from' WS+ QName | QName (WS+ 'as' WS+ NameIdentifier)?)
FunctionDirective ::= PrivateModifier? InlineModifier? FunDeclaration {pin=3}
ValDirective      ::= PrivateModifier? ValDeclaration {pin=2}
VarDirective      ::= PrivateModifier? VarDeclaration {pin=2}
TypeDirective     ::= PrivateModifier? TYPE_KEYWORD NameIdentifier WS* (&('=') ValueType)? {pin=2}
EnumDirective     ::= PrivateModifier? ENUM_KEYWORD NameIdentifier WS* '{' TypeDeclElements? WS* '}' {pin=2}
EffectDirective   ::= PrivateModifier? EFFECT_KEYWORD EffectDeclaration {pin=2,recoverUntil=DIRECTIVE_RECOVERY}
StructDirective   ::= PrivateModifier? STRUCT_KEYWORD StructDeclaration {pin=2,recoverUntil=DIRECTIVE_RECOVERY}
ImplDirective     ::= PrivateModifier? IMPL_KEYWORD ImplDeclaration {pin=2,recoverUntil=DIRECTIVE_RECOVERY}

PrivateModifier   ::= PRIVATE_KEYWORD
InlineModifier    ::= INLINE_KEYWORD

TypeKind          ::= TYPE_KEYWORD

UnknownExpression ::= '???'
ValueType         ::= '=' WS* (Type | StructLiteral | StackLiteral | InjectedLiteral) {fragment=true}

TypeVariableList  ::= TypeVariable NthTypeVariable? WS*
NthTypeVariable   ::= ',' WS* TypeVariable WS* {fragment=true}
TypeVariable      ::= [A-Z]([A-Za-z0-9_])*
TypeParameters    ::= '<' WS* TypeVariableList? '>' WS* {pin=1}

Assign            ::= '=' WS* (Expression | UnknownExpression) {pin=1,fragment=true}
FunAssignExpression ::= '=' WS* (Expression | UnknownExpression | WasmExpression) {pin=1,fragment=true}
OfType            ::= COLON WS* (FunctionEffect WS*)? Type WS* {pin=1,fragment=true,recoverUntil=NEXT_ARG_RECOVERY}

FunctionParamsList::= OPEN_PAREN WS* ParameterList? WS* CLOSE_PAREN {pin=1,recoverUntil=PAREN_RECOVERY}
ParameterList     ::= Parameter NthParameter* {fragment=true}
NthParameter      ::= ',' WS* Parameter WS* {pin=1,fragment=true,recoverUntil=NEXT_ARG_RECOVERY}
Parameter         ::= NameIdentifier WS* OfType? {pin=1,recoverUntil=NEXT_ARG_RECOVERY}

StructDeclaration ::= NameIdentifier WS* (&'(' FunctionParamsList)? (WS* &'{' NamespaceElementList)? {pin=1}
EffectMemberDeclaration ::= NameIdentifier WS* FunctionParamsList OfType {pin=1}
TypeDeclElements  ::= (WS* StructDeclaration)*
EffectElements    ::= (WS* EffectMemberDeclaration)* {fragment=true}


ValDeclaration    ::= VAL_KEYWORD NameIdentifier OfType? WS* Assign {pin=1,recoverUntil=BLOCK_RECOVERY}
VarDeclaration    ::= VAR_KEYWORD NameIdentifier OfType? WS* Assign {pin=1,recoverUntil=BLOCK_RECOVERY}
FunDeclaration    ::= FUN_KEYWORD FunctionName WS* TypeParameters? FunctionParamsList OfType? WS* FunAssignExpression {pin=1,recoverUntil=BLOCK_RECOVERY}
FunctionName      ::= NameIdentifier | FunOperator

FunOperator       ::= ( BitNotPreOperator
                      | MinusPreOperator
                      | AsKeyword
                      | IsKeyword
                      | MulOperator
                      | AddOperator
                      | ShiftOperator
                      | RelOperator
                      | EqOperator
                      | BitAndOperator
                      | BitXorOperator
                      | BitOrOperator
                      | AndKeyword
                      | OrKeyword
                      | NotPreOperator
                      )

ImplDeclaration ::= Reference WS* NamespaceElementList {pin=1}
NamespaceElementList ::= '{' (WS* Directive)* WS* '}' {pin=1,recoverUntil=BLOCK_RECOVERY}

EffectDeclaration ::= NameIdentifier WS* TypeParameters? EffectElementList {pin=1}
EffectElementList ::= '{' EffectElements? WS* '}' {pin=1,recoverUntil=BLOCK_RECOVERY}

FunctionEffect    ::= '<' WS* (Type WS*)? '>' {pin=1}
Type              ::= UnionType
UnionType         ::= IntersectionType (WS* '|' WS* IntersectionType)* {simplifyWhenOneChildren=true}
IntersectionType  ::= AtomType (WS* '&' WS* AtomType)* {simplifyWhenOneChildren=true}
AtomType          ::= TypeParen | FunctionTypeLiteral | Reference {fragment=true}
TypeParen         ::= '(' WS* Type WS* ')' {pin=1}

FunctionTypeLiteral   ::= 'fun' WS* TypeParameters? FunctionTypeParameters WS* '->' WS* Type {pin=1}
FunctionTypeParameters::= '(' WS* (FunctionTypeParameter (WS* ',' WS* FunctionTypeParameter)* WS*)? ')' {pin=1,recoverUntil=PAREN_RECOVERY}
FunctionTypeParameter ::= (NameIdentifier WS* ':')? WS* Type

Expression        ::= &('if') IfExpression
                    | &('m') MatchExpression
                    | &('l') LoopExpression
                    | &('b') BreakStatement
                    | &('c') ContinueStatement
                    | AssignExpression {fragment=true}

Statement         ::= ValDeclaration
                    | VarDeclaration
                    | FunDeclaration
                    | Expression {fragment=true}

MatchExpression   ::= MatchKeyword WS* AssignExpression WS* MatchBody {pin=1}

LoopExpression    ::= LOOP_KEYWORD WS* Expression {pin=1}
ContinueStatement ::= CONTINUE_KEYWORD {pin=1}
BreakStatement    ::= BREAK_KEYWORD {pin=1}

BinMemberOperator ::= '.' | '#'

BinaryExpression  ::= BinMemberOperator NameIdentifier (WS* &'('CallArguments)? {pin=1,fragment=true}

AssignExpression  ::= OrExpression (WS* AssignmentKeyword WS* OrExpression)* {simplifyWhenOneChildren=true}
OrExpression      ::= AndExpression (WS* OrKeyword WS* AndExpression)* {simplifyWhenOneChildren=true}
AndExpression     ::= BitOrExpression (WS* AndKeyword WS* BitOrExpression)* {simplifyWhenOneChildren=true}
BitOrExpression   ::= BitXorExpression (WS* BitOrOperator WS* BitXorExpression)* {simplifyWhenOneChildren=true}
BitXorExpression  ::= BitAndExpression (WS* BitXorOperator WS* BitAndExpression)* {simplifyWhenOneChildren=true}
BitAndExpression  ::= EqExpression (WS* BitAndOperator WS* EqExpression)* {simplifyWhenOneChildren=true}
EqExpression      ::= RelExpression (WS* EqOperator WS* RelExpression)* {simplifyWhenOneChildren=true}
RelExpression     ::= ShiftExpression (WS* RelOperator WS* ShiftExpression)* {simplifyWhenOneChildren=true}
ShiftExpression   ::= AddExpression (WS* ShiftOperator WS* AddExpression)* {simplifyWhenOneChildren=true}
AddExpression     ::= MulExpression (WS* AddOperator WS* MulExpression)* {simplifyWhenOneChildren=true}
MulExpression     ::= IsExpression (WS* MulOperator WS* IsExpression)* {simplifyWhenOneChildren=true}
IsExpression      ::= AsExpression (WS* IsKeyword WS* Type)* {simplifyWhenOneChildren=true}
AsExpression      ::= UnaryExpression (WS* AsKeyword WS* Type)* {simplifyWhenOneChildren=true}
UnaryExpression   ::= NegExpression | BinNegExpression | UnaryMinus | AtomicExpression {simplifyWhenOneChildren=true}
AtomicExpression  ::= FunctionCallExpression (WS* BinaryExpression)* {simplifyWhenOneChildren=true}
FunctionCallExpression
                  ::= Value (WS* &'(' CallArguments)? {simplifyWhenOneChildren=true}

NegExpression     ::= '!' AtomicExpression {pin=1}
BinNegExpression  ::= '~' AtomicExpression {pin=1}
UnaryMinus        ::= !NumberLiteral '-' AtomicExpression {pin=2}


Value             ::= ( Literal
                      | Reference
                      | &'(' ParenExpression
                      | &'{' CodeBlock
                      ) {fragment=true}

ParenExpression   ::= '(' WS* Expression WS* ')' {pin=1,recoverUntil=CLOSE_PAREN}

IfExpression      ::= IF_KEYWORD WS* IfBody WS* Expression (WS* ElseExpression)? {pin=1}
IfBody            ::= '(' WS* Expression WS* ')' {pin=3,recoverUntil=CLOSE_PAREN,fragment=true}
ElseExpression    ::= ELSE_KEYWORD WS* Expression {pin=1,fragment=true}

CodeBlock         ::= '{' WS* (Statement (NEW_LINE WS* Statement)* WS*)? '}' {pin=1,recoverUntil=BLOCK_RECOVERY}

/* Pattern matching */
MatchBody         ::= '{' WS* MatchElements* '}' {pin=1,recoverUntil=MATCH_RECOVERY}

MatchElements     ::= (CaseCondition | CaseIs | CaseLiteral | CaseElse) WS*  {fragment=true}

CaseCondition     ::= CASE_KEYWORD WS+ NameIdentifier WS+ IF_KEYWORD WS* Expression WS* '->' WS* Expression {pin=5}
CaseLiteral       ::= CASE_KEYWORD WS+ Literal WS* '->' WS* Expression {pin=3}
CaseIs            ::= CASE_KEYWORD WS+ (NameIdentifier WS+)? 'is' WS+ Reference WS* DeconstructStruct? '->' WS* Expression {pin=4}
CaseElse          ::= ELSE_KEYWORD WS* (NameIdentifier WS+)? '->' WS* Expression {pin=4}

DeconstructStruct ::= '(' WS* (NameIdentifier WS* NthNameIdentifier*)? ')' WS* {pin=1}
NthNameIdentifier ::= ',' WS* NameIdentifier WS* {fragment=true}

/* Function call */
CallArguments     ::= OPEN_PAREN Arguments? CLOSE_PAREN {pin=1,recoverUntil=PAREN_RECOVERY}
Arguments         ::= WS* Expression WS* NthArgument* {fragment=true}
NthArgument       ::= ',' WS* Expression WS* {pin=1,fragment=true,recoverUntil=NEXT_ARG_RECOVERY}

Reference         ::= QName

BooleanLiteral    ::= TRUE_KEYWORD | FALSE_KEYWORD
NumberLiteral     ::= "-"? !('0x') ("0" | [1-9] [0-9]*) ("." [0-9]+)? (("e" | "E") ( "-" | "+" )? ("0" | [1-9] [0-9]*))? {pin=3}
HexLiteral        ::= "0x" [0-9A-Fa-f]+ {pin=1}
StringLiteral     ::= '"' (!'"' [#x20-#xFFFF])* '"' | "'" (!"'" [#x20-#xFFFF])* "'"
Literal           ::= ( StringLiteral
                      | HexLiteral
                      | NumberLiteral
                      | BooleanLiteral
                      ) {fragment=true}

NameIdentifier    ::= !KEYWORD '$'? [A-Za-z_]([A-Za-z0-9_$])*
QName             ::= NameIdentifier ('::' NameIdentifier)*

WasmExpression    ::= WASM_KEYWORD WS* '{' WS* SAtom* WS* '}' WS* EOF?  {pin=2}
StructLiteral     ::= STRUCT_LITERAL_KEYWORD WS* '{' (NameIdentifier WS* NthNameIdentifier*)? '}' WS* {pin=2}
StackLiteral      ::= STACK_LITERAL_KEYWORD WS* '{' WS* (NameLiteralPair WS*)* '}' WS* {pin=2}
InjectedLiteral   ::= INJECTED_LITERAL_KEYWORD {pin=1}

NameLiteralPair   ::= NameIdentifier WS* '=' WS* Literal {pin=1}

SExpression       ::= '(' WS* SSymbol SAtom* WS* ')' {pin=1}
SAtom             ::= WS* (QName |  StringLiteral | HexLiteral | NumberLiteral | SExpression) {fragment=true}
SSymbol           ::= [a-zA-Z][a-zA-Z0-9_./]*

/* Keywords */

KEYWORD           ::= TRUE_KEYWORD
                    | FALSE_KEYWORD
                    | IF_KEYWORD
                    | ELSE_KEYWORD
                    | CASE_KEYWORD
                    | VAR_KEYWORD
                    | VAL_KEYWORD
                    | TYPE_KEYWORD
                    | ENUM_KEYWORD
                    | EFFECT_KEYWORD
                    | IMPL_KEYWORD
                    | IMPORT_KEYWORD
                    | FUN_KEYWORD
                    | STRUCT_KEYWORD
                    | PRIVATE_KEYWORD
                    | MatchKeyword
                    | AndKeyword
                    | OrKeyword
                    | LOOP_KEYWORD
                    | CONTINUE_KEYWORD
                    | BREAK_KEYWORD
                    | RESERVED_WORDS
                    | INLINE_KEYWORD

/* Tokens */

WASM_KEYWORD            ::= '%wasm' {pin=1}
STRUCT_LITERAL_KEYWORD  ::= '%struct' {pin=1}
STACK_LITERAL_KEYWORD   ::= '%stack' {pin=1}
INJECTED_LITERAL_KEYWORD::= '%injected' {pin=1}

FUN_KEYWORD       ::= 'fun'       WS+
VAL_KEYWORD       ::= 'val'       WS+
VAR_KEYWORD       ::= 'var'       WS+
EFFECT_KEYWORD    ::= 'effect'    WS+
IMPL_KEYWORD      ::= 'impl'      WS+
IMPORT_KEYWORD    ::= 'import'    WS+
STRUCT_KEYWORD    ::= 'struct'    WS+
PRIVATE_KEYWORD   ::= 'private'   WS+
INLINE_KEYWORD    ::= 'inline'    WS+
TYPE_KEYWORD      ::= 'type'      WS+
ENUM_KEYWORD      ::= 'enum'      WS+

LOOP_KEYWORD      ::= 'loop'      ![A-Za-z0-9_$]
CONTINUE_KEYWORD  ::= 'continue'  ![a-zA-Z0-9_$]
BREAK_KEYWORD     ::= 'break'     ![A-Za-z0-9_$]
TRUE_KEYWORD      ::= 'true'      ![A-Za-z0-9_$]
FALSE_KEYWORD     ::= 'false'     ![A-Za-z0-9_$]
IF_KEYWORD        ::= 'if'        ![A-Za-z0-9_$]
ELSE_KEYWORD      ::= 'else'      ![A-Za-z0-9_$]
CASE_KEYWORD      ::= 'case'      ![A-Za-z0-9_$]
MatchKeyword      ::= 'match'     ![A-Za-z0-9_$]



RESERVED_WORDS    ::= ( 'abstract'
                      | 'async'
                      | 'await'
                      | 'class'
                      | 'const'
                      | 'declare'
                      | 'defer'
                      | 'delete'
                      | 'do'
                      | 'enum'
                      | 'export'
                      | 'extends'
                      | 'finally'
                      | 'for'
                      | 'import'
                      | 'is'
                      | 'let'
                      | 'native'
                      | 'new'
                      | 'package'
                      | 'protected'
                      | 'public'
                      | 'try'
                      | 'type'
                      | 'using'
                      | 'while'
                      | 'yield'
                      ) ![A-Za-z0-9_$]

/* OPERATORS, ORDERED BY PRECEDENCE https://introcs.cs.princeton.edu/java/11precedence/ */

AssignmentKeyword ::= '='       !'='
NotPreOperator    ::= '!'       !'='
BitNotPreOperator ::= '~'       !'='
MinusPreOperator  ::= '-'       !'-'
AsKeyword         ::= 'as'      ![A-Za-z0-9_]
IsKeyword         ::= 'is'      ![A-Za-z0-9_]
MulOperator       ::= '**'  | '*'   | '/'  | '%'
AddOperator       ::= '+'   | '-'
ShiftOperator     ::= '>>>' | '>>'  | '<<'
RelOperator       ::= '>='  | '<='  | '>'  | '<'
EqOperator        ::= '===' | '!==' | '~=' | '==' | '!='
BitAndOperator    ::= '&'       !'&'
BitXorOperator    ::= '^'
BitOrOperator     ::= '|'       !'|'
AndKeyword        ::= '&&'      ![A-Za-z0-9_]
OrKeyword         ::= '||'      ![A-Za-z0-9_]


DIRECTIVE_RECOVERY::= &(FUN_KEYWORD | VAL_KEYWORD | VAR_KEYWORD | STRUCT_KEYWORD | PRIVATE_KEYWORD | EFFECT_KEYWORD | IMPL_KEYWORD | ENUM_KEYWORD | RESERVED_WORDS)
NEXT_ARG_RECOVERY ::= &(',' | ')')
PAREN_RECOVERY    ::= &(')')
MATCH_RECOVERY    ::= &('}' | 'case' | 'else')
BLOCK_RECOVERY    ::= &('}' | NEW_LINE)
OPEN_PAREN        ::= '('
CLOSE_PAREN       ::= ')'
COLON             ::= ':'
OPEN_DOC_COMMENT  ::= '/*'
CLOSE_DOC_COMMENT ::= '*/'
DOC_COMMENT       ::= !CLOSE_DOC_COMMENT [#x00-#xFFFF]

COMMENT           ::= '//' (![#x0A#x0D] [#x00-#xFFFF])* EOL
MULTI_COMMENT     ::= OPEN_DOC_COMMENT DOC_COMMENT* CLOSE_DOC_COMMENT {pin=1}
WS                ::= COMMENT | MULTI_COMMENT | [#x20#x09#x0A#x0D]+ {fragment=true}
EOL               ::= [#x0A#x0D]+

NEW_LINE          ::= [#x20#x09]* (EOL | COMMENT)

`;

export const RULES: IRule[] = Grammars.Custom.getRules(grammar);

export const parser = new Parser(RULES, {});
