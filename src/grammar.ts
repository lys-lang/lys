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
                      | ImportDirective
                      | EffectDirective
                      ) {fragment=true}

ImportDirective   ::= IMPORT_KEYWORD ('*' WS+ 'from' WS+ QName | QName (WS+ 'as' WS+ NameIdentifier)?)
FunctionDirective ::= PrivateModifier? InlineModifier? FunDeclaration {pin=3}
ValDirective      ::= PrivateModifier? ValDeclaration {pin=2}
VarDirective      ::= PrivateModifier? VarDeclaration {pin=2}
TypeDirective     ::= PrivateModifier? TypeKind NameIdentifier WS* (&('{') TypeDeclaration | &('=') TypeAlias)? {pin=2}
EffectDirective   ::= PrivateModifier? EFFECT_KEYWORD EffectDeclaration {pin=2,recoverUntil=DIRECTIVE_RECOVERY}
StructDirective   ::= PrivateModifier? STRUCT_KEYWORD StructDeclaration {pin=2,recoverUntil=DIRECTIVE_RECOVERY}

PrivateModifier   ::= PRIVATE_KEYWORD
InlineModifier    ::= INLINE_KEYWORD

TypeKind          ::= TYPE_KEYWORD

UnknownExpression ::= '???'




TypeVariableList  ::= TypeVariable NthTypeVariable? WS*
NthTypeVariable   ::= ',' WS* TypeVariable WS* {fragment=true}
TypeVariable      ::= [A-Z]([A-Za-z0-9_])*
TypeParameters     ::= '<' WS* TypeVariableList? '>' WS* {pin=1}

AssignExpression  ::= '=' WS* (Expression | UnknownExpression) {pin=1,fragment=true}
FunAssignExpression ::= '=' WS* (Expression | UnknownExpression | WasmExpression) {pin=1,fragment=true}
AssignStatement   ::= VariableReference WS* '=' !('=') WS* Expression {pin=3}
OfType            ::= COLON WS* (FunctionEffect WS*)? Type WS* {pin=1,fragment=true,recoverUntil=NEXT_ARG_RECOVERY}

FunctionParamsList::= OPEN_PAREN WS* ParameterList? WS* CLOSE_PAREN {pin=1,recoverUntil=PAREN_RECOVERY}
ParameterList     ::= Parameter NthParameter* {fragment=true}
NthParameter      ::= ',' WS* Parameter WS* {pin=1,fragment=true,recoverUntil=NEXT_ARG_RECOVERY}
Parameter         ::= NameIdentifier WS* OfType? {pin=1,recoverUntil=NEXT_ARG_RECOVERY}

StructDeclaration ::= NameIdentifier WS* (&'(' FunctionParamsList)? {pin=1}
EffectMemberDeclaration ::= NameIdentifier WS* FunctionParamsList OfType {pin=1}
TypeDeclElements  ::= (WS* StructDeclaration)*
EffectElements    ::= (WS* EffectMemberDeclaration)* {fragment=true}


ValDeclaration    ::= VAL_KEYWORD NameIdentifier OfType? WS* AssignExpression {pin=1,recoverUntil=BLOCK_RECOVERY}
VarDeclaration    ::= VAR_KEYWORD NameIdentifier OfType? WS* AssignExpression {pin=1,recoverUntil=BLOCK_RECOVERY}
FunDeclaration    ::= FUN_KEYWORD NameIdentifier WS* TypeParameters? FunctionParamsList OfType? WS* FunAssignExpression {pin=1,recoverUntil=BLOCK_RECOVERY}

EffectDeclaration ::= NameIdentifier WS* TypeParameters? EffectElementList {pin=1}
EffectElementList ::= '{' EffectElements? WS* '}' {pin=1,recoverUntil=BLOCK_RECOVERY}
TypeDeclaration   ::= '{' TypeDeclElements WS* '}' {pin=1,recoverUntil=BLOCK_RECOVERY}

TypeAlias         ::= '=' WS* Type {pin=1}

FunctionEffect    ::= '<' WS* (Type WS*)? '>' {pin=1}
Type              ::= UnionType
UnionType         ::= IntersectionType (WS* '|' WS* IntersectionType)* {simplifyWhenOneChildren=true}
IntersectionType  ::= AtomType (WS* '&' WS* AtomType)* {simplifyWhenOneChildren=true}
AtomType          ::= TypeParen | FunctionTypeLiteral | TypeReference {fragment=true}
TypeParen         ::= '(' WS* Type WS* ')' {pin=1}
TypeReference     ::= QName

FunctionTypeLiteral   ::= 'fun' WS* TypeParameters? FunctionTypeParameters WS* '->' WS* Type {pin=1}
FunctionTypeParameters::= '(' WS* (FunctionTypeParameter (WS* ',' WS* FunctionTypeParameter)* WS*)? ')' {pin=1,recoverUntil=PAREN_RECOVERY}
FunctionTypeParameter ::= (NameIdentifier WS* ':')? WS* Type

IsPointer         ::= '*'
IsArray           ::= '[]'

Expression        ::= OrExpression (WS* (MatchExpression | BinaryExpression))* {simplifyWhenOneChildren=true}

Statement         ::= ValDeclaration
                    | VarDeclaration
                    | FunDeclaration
                    | AssignStatement
                    | Expression {fragment=true}

MatchExpression   ::= MatchKeyword WS* MatchBody WS* {pin=1,fragment=true}
BinaryExpression  ::= '.' NameIdentifier CallArguments? {pin=2,fragment=true}

OrExpression      ::= AndExpression (WS+ OrKeyword WS+ AndExpression)* {simplifyWhenOneChildren=true}
AndExpression     ::= EqExpression (WS+ AndKeyword WS+ EqExpression)* {simplifyWhenOneChildren=true}
EqExpression      ::= RelExpression (WS* EqOperator WS* RelExpression)* {simplifyWhenOneChildren=true}
RelExpression     ::= ShiftExpression (WS* RelOperator WS* ShiftExpression)* {simplifyWhenOneChildren=true}
ShiftExpression   ::= AddExpression (WS* ShiftOperator WS* AddExpression)* {simplifyWhenOneChildren=true}
AddExpression     ::= MulExpression (WS* AddOperator WS* MulExpression)* {simplifyWhenOneChildren=true}
MulExpression     ::= UnaryExpression (WS* MulOperator WS* UnaryExpression)* {simplifyWhenOneChildren=true}
UnaryExpression   ::= NegExpression | BinNegExpression | UnaryMinus | IfExpression | FunctionCallExpression  {simplifyWhenOneChildren=true}

NegExpression     ::= '!' OrExpression {pin=1}
BinNegExpression  ::= '~' OrExpression {pin=1}
UnaryMinus        ::= !NumberLiteral '-' OrExpression {pin=2}

FunctionCallExpression
                  ::= Value (WS* &'(' CallArguments)? {simplifyWhenOneChildren=true}

Value             ::= ( Literal
                      | VariableReference
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
CaseIs            ::= CASE_KEYWORD WS+ (NameIdentifier WS+)? 'is' WS+ TypeReference WS* DeconstructStruct? '->' WS* Expression {pin=4}
CaseElse          ::= ELSE_KEYWORD WS* '->' WS* Expression {pin=3}

DeconstructStruct ::= '(' (NameIdentifier WS* NthNameIdentifier*)? ')' WS* {pin=1}
NthNameIdentifier ::= ',' WS* NameIdentifier WS* {fragment=true}

/* Function call */
CallArguments     ::= OPEN_PAREN Arguments? CLOSE_PAREN {pin=1,recoverUntil=PAREN_RECOVERY}
Arguments         ::= WS* Expression WS* NthArgument* {fragment=true}
NthArgument       ::= ',' WS* Expression WS* {pin=1,fragment=true,recoverUntil=NEXT_ARG_RECOVERY}

VariableReference ::= QName

MulOperator       ::= '**' | '*' | '/' | '%'
AddOperator       ::= '+' | '-'
ShiftOperator     ::= '>>>' | '>>' | '<<'
RelOperator       ::= '>=' | '<=' | '>' | '<'
EqOperator        ::= '==' | '!='

BooleanLiteral    ::= TRUE_KEYWORD | FALSE_KEYWORD
NullLiteral       ::= NULL_KEYWORD
NumberLiteral     ::= "-"? !('0x') ("0" | [1-9] [0-9]*) ("." [0-9]+)? (("e" | "E") ( "-" | "+" )? ("0" | [1-9] [0-9]*))? {pin=3}
HexLiteral        ::= "0x" [0-9A-Fa-f]+ {pin=1}
StringLiteral     ::= '"' (!'"' [#x20-#xFFFF])* '"' | "'" (!"'" [#x20-#xFFFF])* "'"
Literal           ::= ( StringLiteral
                      | HexLiteral
                      | NumberLiteral
                      | BooleanLiteral
                      | NullLiteral
                      ) {fragment=true}

NameIdentifier    ::= !KEYWORD '$'? [A-Za-z_]([A-Za-z0-9_])*
QName             ::= NameIdentifier ('::' NameIdentifier)*

WasmExpression    ::= WASM_KEYWORD WS* '{' WS* SAtom* WS* '}' WS* EOF?
WASM_KEYWORD      ::= '%wasm'
SExpression       ::= '(' WS* SSymbol SAtom* WS* ')'
SAtom             ::= WS* (QName | StringLiteral | HexLiteral | NumberLiteral | SExpression) {fragment=true}
SSymbol           ::= [a-zA-Z][a-zA-Z0-9_.]*

/* Keywords */

KEYWORD           ::= TRUE_KEYWORD | FALSE_KEYWORD | NULL_KEYWORD | IF_KEYWORD | ELSE_KEYWORD | CASE_KEYWORD | VAR_KEYWORD | VAL_KEYWORD | TYPE_KEYWORD | EFFECT_KEYWORD | IMPORT_KEYWORD | FUN_KEYWORD | STRUCT_KEYWORD | PRIVATE_KEYWORD | MatchKeyword | AndKeyword | OrKeyword | RESERVED_WORDS | INLINE_KEYWORD

/* Tokens */

FUN_KEYWORD       ::= 'fun'    WS+
VAL_KEYWORD       ::= 'val'    WS+
VAR_KEYWORD       ::= 'var'    WS+
EFFECT_KEYWORD    ::= 'effect' WS+
IMPORT_KEYWORD    ::= 'import' WS+

TYPE_KEYWORD      ::= ( 'type'
                      | 'cotype'
                      | 'rectype'
                      ) WS+

STRUCT_KEYWORD    ::= 'struct' WS+
PRIVATE_KEYWORD   ::= 'private' WS+
INLINE_KEYWORD    ::= 'inline' WS+

RESERVED_WORDS    ::= ( 'async'
                      | 'await'
                      | 'defer'
                      | 'package'
                      | 'declare'
                      | 'using'
                      | 'delete'
                      | 'break'
                      | 'continue'
                      | 'let'
                      | 'const'
                      | 'class'
                      | 'export'
                      | 'public'
                      | 'protected'
                      | 'extends'
                      | 'import'
                      | 'from'
                      | 'abstract'
                      | 'finally'
                      | 'new'
                      | 'native'
                      | 'enum'
                      | 'type'
                      | 'yield'
                      | 'for'
                      | 'do'
                      | 'while'
                      | 'try'
                      | 'is'
                      ) WS+

TRUE_KEYWORD      ::= 'true'   ![A-Za-z0-9_]
FALSE_KEYWORD     ::= 'false'  ![A-Za-z0-9_]
NULL_KEYWORD      ::= 'null'   ![A-Za-z0-9_]
IF_KEYWORD        ::= 'if'     ![A-Za-z0-9_]
ELSE_KEYWORD      ::= 'else'   ![A-Za-z0-9_]
CASE_KEYWORD      ::= 'case'   ![A-Za-z0-9_]
MatchKeyword      ::= 'match'  ![A-Za-z0-9_]
AndKeyword        ::= 'and'    ![A-Za-z0-9_]
OrKeyword         ::= 'or'     ![A-Za-z0-9_]

DIRECTIVE_RECOVERY::= &(FUN_KEYWORD | VAL_KEYWORD | VAR_KEYWORD | STRUCT_KEYWORD | PRIVATE_KEYWORD | RESERVED_WORDS)
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
