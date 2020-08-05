import { Parser, Grammars, IRule } from 'ebnf';

export const grammar = `
{ws=explicit}

Document          ::= WS* Directives WS* EOF?
Directives        ::= Directive WS* Directives? WS* {pin=1,recoverUntil=DIRECTIVE_RECOVERY,fragment=true}

Directive         ::= FunctionDirective
                    | ValDirective
                    | VarDirective
                    | StructDirective
                    | TypeDirective
                    | EnumDirective
                    | TraitDirective
                    | ImportDirective
                    | EffectDirective
                    | ImplDirective {fragment=true}

ImplInnerDirective::= FunctionDirective
                    | ValDirective
                    | VarDirective {fragment=true}

ImportDirective   ::= IMPORT_KEYWORD QName (WS+ 'as' WS+ NameIdentifier)? {pin=1}
FunctionDirective ::= (&'#[' Decorators)? PrivateModifier? FunDeclaration {pin=3}
ValDirective      ::= PrivateModifier? ValDeclaration {pin=2}
VarDirective      ::= PrivateModifier? VarDeclaration {pin=2}
TypeDirective     ::= PrivateModifier? TYPE_KEYWORD NameIdentifier WS* (&('=') ValueType)? {pin=2}
EnumDirective     ::= PrivateModifier? ENUM_KEYWORD NameIdentifier WS* OPEN_BRACKET TypeDeclElements? WS* CLOSE_BRACKET {pin=2}
TraitDirective    ::= PrivateModifier? TRAIT_KEYWORD NameIdentifier WS* OPEN_BRACKET TraitDeclElements? WS* CLOSE_BRACKET {pin=2}
EffectDirective   ::= PrivateModifier? EFFECT_KEYWORD EffectDeclaration {pin=2,recoverUntil=DIRECTIVE_RECOVERY}
StructDirective   ::= PrivateModifier? STRUCT_KEYWORD StructDeclaration {pin=2,recoverUntil=DIRECTIVE_RECOVERY}
ImplDirective     ::= PrivateModifier? IMPL_KEYWORD Reference WS* (FOR_KEYWORD WS* Reference WS*)? NamespaceElementList {pin=2,recoverUntil=DIRECTIVE_RECOVERY}

Decorators        ::= Decorator+ {pin=1}
Decorator         ::= OPEN_DECORATION WS* NameIdentifier (WS+ Literal)* WS* CLOSE_ARRAY WS* {pin=1}

PrivateModifier   ::= PRIVATE_KEYWORD
LoopExpression    ::= LOOP_KEYWORD WS* Expression {pin=1}
ContinueStatement ::= CONTINUE_KEYWORD {pin=1}
BreakStatement    ::= BREAK_KEYWORD {pin=1}
ValDeclaration    ::= VAL_KEYWORD NameIdentifier OfType? WS* Assign {pin=1,recoverUntil=BLOCK_RECOVERY}
VarDeclaration    ::= VAR_KEYWORD NameIdentifier OfType? WS* Assign {pin=1,recoverUntil=BLOCK_RECOVERY}
FunDeclaration    ::= FUN_KEYWORD FunctionName WS* TypeParameters? FunctionParamsList WS* (&':' OfType WS*)? (&'=' FunAssignExpression)? {pin=1,recoverUntil=BLOCK_RECOVERY}
MatchExpression   ::= MATCH_KEYWORD WS* AssignExpression WS* MatchBody {pin=1}
CaseCondition     ::= CASE_KEYWORD NameIdentifier WS+ IF_KEYWORD WS* Expression WS* THIN_ARROW WS* Expression {pin=5}
CaseLiteral       ::= CASE_KEYWORD Literal WS* THIN_ARROW WS* Expression {pin=3}
CaseIs            ::= CASE_KEYWORD (NameIdentifier WS+)? 'is' WS+ Reference WS* DeconstructStruct? THIN_ARROW WS* Expression {pin=4}
CaseElse          ::= ELSE_KEYWORD WS* (NameIdentifier WS+)? THIN_ARROW WS* Expression {pin=1}
IfExpression      ::= IF_KEYWORD WS* IfBody WS* Expression (WS* ElseExpression)? {pin=1}
ElseExpression    ::= ELSE_KEYWORD WS* Expression {pin=1,fragment=true}
WasmExpression    ::= WASM_KEYWORD WS* OPEN_BRACKET WS* SAtom* WS* CLOSE_BRACKET WS* EOF?  {pin=1}
StructLiteral     ::= STRUCT_LITERAL_KEYWORD WS* StructParamsList {pin=2}
StackLiteral      ::= STACK_LITERAL_KEYWORD WS* OPEN_BRACKET WS* (NameLiteralPair WS*)* CLOSE_BRACKET WS* {pin=2}
InjectedLiteral   ::= INJECTED_LITERAL_KEYWORD {pin=1}

IfBody            ::= OPEN_PAREN WS* Expression WS* CLOSE_PAREN {pin=3,recoverUntil=CLOSE_PAREN,fragment=true}
MatchElements     ::= (CaseCondition | CaseIs | CaseLiteral | CaseElse) WS*  {fragment=true}

UnknownExpression ::= '???'
ValueType         ::= '=' WS* (Type | StructLiteral | StackLiteral | InjectedLiteral) {fragment=true}

TypeVariableList  ::= TypeVariable NthTypeVariable? WS*
NthTypeVariable   ::= ',' WS* TypeVariable WS* {fragment=true}
TypeVariable      ::= [A-Z]([A-Za-z0-9_])*
TypeParameters    ::= '<' WS* TypeVariableList? '>' WS* {pin=1}

Assign            ::= '=' WS* (Expression | UnknownExpression) {pin=1,fragment=true}
FunAssignExpression ::= '=' WS* (Expression | WasmExpression | UnknownExpression) {pin=1}
OfType            ::= COLON WS* (FunctionEffect WS*)? Type WS* {pin=1,fragment=true,recoverUntil=NEXT_ARG_RECOVERY}

StructParamsList  ::= OPEN_BRACKET WS* (!'}' ParameterList)? WS* CLOSE_BRACKET {pin=1,recoverUntil=BRACKET_RECOVERY}
FunctionParamsList::= OPEN_PAREN WS* ParameterList? WS* CLOSE_PAREN {pin=1,recoverUntil=PAREN_RECOVERY}
ParameterList     ::= Parameter (&',' NthParameter)* {fragment=true}
NthParameter      ::= ',' WS* Parameter WS* {pin=1,fragment=true,recoverUntil=NEXT_ARG_RECOVERY}
Parameter         ::= NameIdentifier WS* (&':' OfType)? WS* {pin=1,recoverUntil=NEXT_ARG_RECOVERY}

StructDeclaration ::= NameIdentifier WS* (&'(' FunctionParamsList)? {pin=1}
EffectMemberDeclaration ::= NameIdentifier WS* FunctionParamsList OfType {pin=1}
TraitDeclElements ::= (WS* FunctionDirective)*
TypeDeclElements  ::= (WS* StructDeclaration)*
EffectElements    ::= (WS* EffectMemberDeclaration)* {fragment=true}

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
                      | '[]'
                      )

NamespaceElementList ::= OPEN_BRACKET (WS* ImplInnerDirective)* WS* CLOSE_BRACKET {pin=1,recoverUntil=BLOCK_RECOVERY}

EffectDeclaration ::= NameIdentifier WS* TypeParameters? EffectElementList {pin=1}
EffectElementList ::= OPEN_BRACKET EffectElements? WS* CLOSE_BRACKET {pin=1,recoverUntil=BLOCK_RECOVERY}

FunctionEffect    ::= '<' WS* (Type WS*)? '>' {pin=1}
Type              ::= UnionType
UnionType         ::= IntersectionType (WS* '|' WS* IntersectionType)* {simplifyWhenOneChildren=true}
IntersectionType  ::= AtomType (WS* '&' WS* AtomType)* {simplifyWhenOneChildren=true}
AtomType          ::= TypeParen | FunctionTypeLiteral | Reference {fragment=true}
TypeParen         ::= OPEN_PAREN WS* Type WS* CLOSE_PAREN {pin=1}

FunctionTypeLiteral   ::= 'fun' WS* TypeParameters? FunctionTypeParameters WS* THIN_ARROW WS* Type {pin=1}
FunctionTypeParameters::= OPEN_PAREN WS* (FunctionTypeParameter (WS* ',' WS* FunctionTypeParameter)* WS*)? CLOSE_PAREN {pin=1,recoverUntil=PAREN_RECOVERY}
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
AtomicExpression  ::= Value (WS* (&'.' MemberExpression | &'(' CallArguments | &'[' IndexExpression))* {simplifyWhenOneChildren=true,pin=1}

BinMemberOperator ::= '.^' | '.'
MemberExpression  ::= BinMemberOperator NameIdentifier {pin=1}
IndexExpression   ::= OPEN_ARRAY WS* Expression WS* CLOSE_ARRAY {pin=1}

NegExpression     ::= '!' AtomicExpression {pin=1}
BinNegExpression  ::= '~' AtomicExpression {pin=1}
UnaryMinus        ::= '-' AtomicExpression {pin=2}

Value             ::= ( Literal
                      | Reference
                      | &'(' ParenExpression
                      | &'{' CodeBlock
                      ) {fragment=true,pin=1}

ParenExpression   ::= OPEN_PAREN WS* Expression WS* CLOSE_PAREN {pin=1,recoverUntil=CLOSE_PAREN}

CodeBlock         ::= OPEN_BRACKET WS* (Statement (NEW_LINE WS* Statement)* WS*)? CLOSE_BRACKET {pin=1,recoverUntil=BLOCK_RECOVERY}

/* Pattern matching */
MatchBody         ::= OPEN_BRACKET WS* MatchElements* CLOSE_BRACKET {pin=1,recoverUntil=MATCH_RECOVERY}

DeconstructStruct ::= OPEN_PAREN WS* (NameIdentifier WS* NthNameIdentifier*)? CLOSE_PAREN WS* {pin=1}
NthNameIdentifier ::= ',' WS* NameIdentifier WS* {fragment=true}

/* Function call */
CallArguments     ::= OPEN_PAREN Arguments? CLOSE_PAREN {pin=1,recoverUntil=PAREN_RECOVERY}
Arguments         ::= WS* Expression WS* NthArgument* {fragment=true}
NthArgument       ::= ',' WS* Expression WS* {pin=1,fragment=true,recoverUntil=NEXT_ARG_RECOVERY}

Reference         ::= QName

BooleanLiteral    ::= TRUE_KEYWORD | FALSE_KEYWORD
PostfixNumber     ::= (HexLiteral | NumberLiteral) Reference? {pin=1,simplifyWhenOneChildren=true}
NumberLiteral     ::= !('0x') ("0" | [1-9] [0-9]*) ("." [0-9]+)? (("e" | "E") ( "-" | "+" )? ("0" | [1-9] [0-9]*))? {pin=2}
NegNumberLiteral  ::= '-'? NumberLiteral {pin=2}
HexLiteral        ::= "0x" [0-9A-Fa-f]+ {pin=1}
StringLiteral     ::= STRING_DELIMITER ((![\\\\"] [#x20-#xFFFF])* | ('\\' (STRING_DELIMITER | '\\' | '/' | 'b' | 'f' | 'n' | 'r' | 't' | 'u' HEXDIG HEXDIG HEXDIG HEXDIG)?))* STRING_DELIMITER {pin=1}
Literal           ::= StringLiteral
                    | PostfixNumber
                    | BooleanLiteral {fragment=true}

NameIdentifier    ::= !KEYWORD '$'? [A-Za-z_]([A-Za-z0-9_$])* {pin=3}
QName             ::= NameIdentifier ('::' NameIdentifier)* {pin=1}

NameLiteralPair   ::= NameIdentifier WS* '=' WS* Literal {pin=1}

SExpression       ::= OPEN_PAREN WS* SSymbol WS* SAtom* WS* CLOSE_PAREN WS* {pin=1}

SAtom             ::= ( QName
                      | SExpression
                      | NegNumberLiteral
                      | HexLiteral) WS* {fragment=true}

SSymbol           ::= [a-zA-Z][a-zA-Z0-9_./]* {pin=1}

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
                    | TRAIT_KEYWORD
                    | EFFECT_KEYWORD
                    | IMPL_KEYWORD
                    | FOR_KEYWORD
                    | IMPORT_KEYWORD
                    | FUN_KEYWORD
                    | STRUCT_KEYWORD
                    | PRIVATE_KEYWORD
                    | MATCH_KEYWORD
                    | LOOP_KEYWORD
                    | CONTINUE_KEYWORD
                    | BREAK_KEYWORD
                    | RESERVED_WORDS

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
FOR_KEYWORD       ::= 'for'       WS+
IMPORT_KEYWORD    ::= 'import'    WS+
STRUCT_KEYWORD    ::= 'struct'    WS+
PRIVATE_KEYWORD   ::= 'private'   WS+
TYPE_KEYWORD      ::= 'type'      WS+
ENUM_KEYWORD      ::= 'enum'      WS+
TRAIT_KEYWORD     ::= 'trait'     WS+
CASE_KEYWORD      ::= 'case'      WS+

LOOP_KEYWORD      ::= 'loop'      ![A-Za-z0-9_$]
CONTINUE_KEYWORD  ::= 'continue'  ![a-zA-Z0-9_$]
BREAK_KEYWORD     ::= 'break'     ![A-Za-z0-9_$]
TRUE_KEYWORD      ::= 'true'      ![A-Za-z0-9_$]
FALSE_KEYWORD     ::= 'false'     ![A-Za-z0-9_$]
IF_KEYWORD        ::= 'if'        ![A-Za-z0-9_$]
ELSE_KEYWORD      ::= 'else'      ![A-Za-z0-9_$]
MATCH_KEYWORD     ::= 'match'     ![A-Za-z0-9_$]



RESERVED_WORDS    ::= ( 'abstract'
                      | 'async'
                      | 'await'
                      | 'class'
                      | 'const'
                      | 'declare'
                      | 'defer'
                      | 'delete'
                      | 'do'
                      | 'extends'
                      | 'finally'
                      | 'for'
                      | 'import'
                      | 'is'
                      | 'in'
                      | 'let'
                      | 'new'
                      | 'package'
                      | 'protected'
                      | 'public'
                      | 'try'
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
AddOperator       ::= '++' | '+'   | '-'
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
BRACKET_RECOVERY  ::= &('}')
MATCH_RECOVERY    ::= &('}' | 'case' | 'else')
BLOCK_RECOVERY    ::= &('}' | NEW_LINE)
OPEN_PAREN        ::= '('
CLOSE_PAREN       ::= ')'
OPEN_ARRAY        ::= '['
OPEN_DECORATION   ::= '#[' {pin=1}
CLOSE_ARRAY       ::= ']' {pin=1}
STRING_DELIMITER  ::= '"' {pin=1}
OPEN_BRACKET      ::= '{'
CLOSE_BRACKET     ::= '}'
THIN_ARROW        ::= '->'
COLON             ::= ':'
OPEN_DOC_COMMENT  ::= '/*'
CLOSE_DOC_COMMENT ::= '*/'
DOC_COMMENT       ::= !CLOSE_DOC_COMMENT [#x00-#xFFFF]

COMMENT           ::= '//' (![#x0A#x0D] [#x00-#xFFFF])* EOL
MULTI_COMMENT     ::= OPEN_DOC_COMMENT DOC_COMMENT* CLOSE_DOC_COMMENT {pin=1}
WS                ::= COMMENT | MULTI_COMMENT | [#x20#x09#x0A#x0D]+ {fragment=true}
EOL               ::= [#x0A#x0D]+
HEXDIG            ::= [a-fA-F0-9]
NEW_LINE          ::= [#x20#x09]* (EOL | COMMENT)

`;

export const RULES: IRule[] = Grammars.Custom.getRules(grammar);

export const parser = new Parser(RULES, {});
