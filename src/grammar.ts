import { Parser, Grammars, IRule } from 'ebnf';

export const grammar = `
{ws=explicit}

Document          ::= Directives EOF? {ws=implicit}
Directives        ::= Directive Directives? {pin=1,ws=implicit,recoverUntil=DIRECTIVE_RECOVERY,fragment=true}
Directive         ::= FunctionDirective | ValDirective | VarDirective | StructDirective | TypeDirective {fragment=true}

FunctionDirective ::= ExportModifier? FUN_KEYWORD NameIdentifier FunctionParamsList OfType? WS* ('=' WS* UnknownExpression | AssignExpression) {pin=2}
ValDirective      ::= ExportModifier? VAL_KEYWORD NameIdentifier OfType? WS* AssignExpression {pin=2}
VarDirective      ::= ExportModifier? VAR_KEYWORD NameIdentifier OfType? WS* AssignExpression {pin=2}
TypeDirective     ::= ExportModifier? TYPE_KEYWORD NameIdentifier WS* '=' WS* (UnknownExpression | Type) {pin=2}
StructDirective   ::= ExportModifier? STRUCT_KEYWORD NameIdentifier {pin=2}

ExportModifier    ::= EXPORT_KEYWORD

UnknownExpression ::= '???'

AssignExpression  ::= '=' WS* Expression {pin=1,fragment=true}
OfType            ::= COLON WS* Type WS* {pin=1,fragment=true,recoverUntil=NEXT_ARG_RECOVERY}

FunctionParamsList::= OPEN_PAREN WS* ParameterList? WS* CLOSE_PAREN {pin=1,recoverUntil=CLOSE_PAREN}
ParameterList     ::= Parameter NthParameter* {fragment=true}
NthParameter      ::= ',' WS* Parameter WS* {pin=1,fragment=true,recoverUntil=NEXT_ARG_RECOVERY}
Parameter         ::= NameIdentifier WS* OfType {pin=1,recoverUntil=NEXT_ARG_RECOVERY}

Type              ::= NameIdentifier IsPointer* IsArray?
IsPointer         ::= '*'
IsArray           ::= '[]'

Expression        ::= OrExpression (WS* (MatchExpression | BinaryExpression))* {simplifyWhenOneChildren=true}

MatchExpression   ::= MatchKeyword WS* MatchBody WS* {pin=1,fragment=true}
BinaryExpression  ::= NameIdentifier WS* OrExpression WS* {pin=1,fragment=true}

OrExpression      ::= AndExpression (WS+ OrKeyword WS+ AndExpression)* {simplifyWhenOneChildren=true}
AndExpression     ::= EqExpression (WS+ AndKeyword WS+ EqExpression)* {simplifyWhenOneChildren=true}
EqExpression      ::= RelExpression (WS* EqOperator WS* RelExpression)* {simplifyWhenOneChildren=true}
RelExpression     ::= ShiftExpression (WS* RelOperator WS* ShiftExpression)* {simplifyWhenOneChildren=true}
ShiftExpression   ::= AddExpression (WS* ShiftOperator WS* AddExpression)* {simplifyWhenOneChildren=true}
AddExpression     ::= MulExpression (WS* AddOperator WS* MulExpression)* {simplifyWhenOneChildren=true}
MulExpression     ::= UnaryExpression (WS* MulOperator WS* UnaryExpression)* {simplifyWhenOneChildren=true}
UnaryExpression   ::= NegExpression | UnaryMinus | IfExpression | FunctionCallExpression  {simplifyWhenOneChildren=true}

NegExpression     ::= '!' OrExpression {pin=1}
UnaryMinus        ::= !NumberLiteral '-' OrExpression {pin=2}

RefPointerOperator::= '*' | '&'
RefExpression     ::= RefPointerOperator VariableReference

FunctionCallExpression
                  ::= Value (WS* &'(' CallArguments)? {simplifyWhenOneChildren=true}

Value             ::= Literal | RefExpression | VariableReference | ParenExpression {fragment=true}
ParenExpression   ::= '(' WS* Expression WS* ')' {pin=3,recoverUntil=CLOSE_PAREN}

IfExpression      ::= '%%if%%'

/* Pattern matching */
MatchBody         ::= '{' WS* MatchElements* '}' {pin=1,recoverUntil=MATCH_RECOVERY}

MatchElements     ::= (CaseCondition | CaseLiteral | CaseElse) WS*  {fragment=true}

CaseCondition     ::= CASE_KEYWORD WS+ NameIdentifier WS+ IF_KEYWORD WS* Expression WS* '->' WS* Expression {pin=5}
CaseLiteral       ::= CASE_KEYWORD WS+ Literal WS* '->' WS* Expression {pin=3}
CaseElse          ::= ELSE_KEYWORD WS* '->' WS* Expression {pin=3}

/* Function call */
CallArguments     ::= OPEN_PAREN Arguments? CLOSE_PAREN {pin=1,recoverUntil=PAREN_RECOVERY}
Arguments         ::= WS* Expression WS* NthArgument* {fragment=true}
NthArgument       ::= ',' WS* Expression WS* {pin=1,fragment=true,recoverUntil=NEXT_ARG_RECOVERY}


VariableReference ::= NameIdentifier

MulOperator       ::= '*' | '/' | '%'
AddOperator       ::= '+' | '-'
ShiftOperator     ::= '>>>' | '>>' | '<<'
RelOperator       ::= '>=' | '<=' | '>' | '<'
EqOperator        ::= '==' | '!='

BooleanLiteral    ::= TRUE_KEYWORD | FALSE_KEYWORD
NullLiteral       ::= NULL_KEYWORD
NumberLiteral     ::= "-"? ("0" | [1-9] [0-9]*) ("." [0-9]+)? (("e" | "E") ( "-" | "+" )? ("0" | [1-9] [0-9]*))? {pin=2}
StringLiteral     ::= '"' (!'"' [#x20-#xFFFF])* '"' | "'" (!"'" [#x20-#xFFFF])* "'"
Literal           ::= ( StringLiteral
                      | NumberLiteral
                      | BooleanLiteral
                      | NullLiteral
                      ) {fragment=true}

NameIdentifier    ::= !KEYWORD [A-Za-z_]([A-Za-z0-9_])*

/* Keywords */

KEYWORD           ::= TRUE_KEYWORD | FALSE_KEYWORD | NULL_KEYWORD | IF_KEYWORD | ELSE_KEYWORD | CASE_KEYWORD | VAR_KEYWORD | VAL_KEYWORD | TYPE_KEYWORD | FUN_KEYWORD | STRUCT_KEYWORD | EXPORT_KEYWORD | MatchKeyword | AndKeyword | OrKeyword | RESERVED_WORDS

FUN_KEYWORD       ::= 'fun'    WS+
VAL_KEYWORD       ::= 'val'    WS+
VAR_KEYWORD       ::= 'var'    WS+
TYPE_KEYWORD      ::= 'type'   WS+
STRUCT_KEYWORD    ::= 'struct' WS+
EXPORT_KEYWORD    ::= 'export' WS+

RESERVED_WORDS    ::= ( 'async' | 'await' | 'defer'
                      | 'package' | 'declare'
                      | 'using'
                      | 'delete'
                      | 'break' | 'continue'
                      | 'let' | 'const' | 'void'
                      | 'class' | 'private' | 'public' | 'protected' | 'extends'
                      | 'import' | 'from' | 'abstract'
                      | 'finally' | 'new' | 'native' | 'enum' | 'type'
                      | 'yield' | 'for' | 'do' | 'while' | 'try'
                      ) WS+

TRUE_KEYWORD      ::= 'true'   ![A-Za-z0-9_]
FALSE_KEYWORD     ::= 'false'  ![A-Za-z0-9_]
NULL_KEYWORD      ::= 'null'   ![A-Za-z0-9_]
IF_KEYWORD        ::= 'if'     ![A-Za-z0-9_]
ELSE_KEYWORD      ::= 'else'   ![A-Za-z0-9_]
CASE_KEYWORD      ::= 'case'   ![A-Za-z0-9_]
MatchKeyword     ::= 'match'  ![A-Za-z0-9_]
AndKeyword       ::= 'and'    ![A-Za-z0-9_]
OrKeyword        ::= 'or'     ![A-Za-z0-9_]

/* Tokens */

DIRECTIVE_RECOVERY::= &(FUN_KEYWORD | VAL_KEYWORD | VAR_KEYWORD | STRUCT_KEYWORD | EXPORT_KEYWORD | RESERVED_WORDS)
NEXT_ARG_RECOVERY ::= &(',' | ')')
PAREN_RECOVERY    ::= &(')')
MATCH_RECOVERY    ::= &('}' | 'case' | 'else')
OPEN_PAREN        ::= '('
CLOSE_PAREN       ::= ')'
COLON             ::= ':'
OPEN_DOC_COMMENT  ::= '/*'
CLOSE_DOC_COMMENT ::= '*/'
DOC_COMMENT       ::= !CLOSE_DOC_COMMENT [#x00-#xFFFF]

Comment           ::= '//' (![#x0A#x0D] [#x00-#xFFFF])* EOL
MultiLineComment  ::= OPEN_DOC_COMMENT DOC_COMMENT* CLOSE_DOC_COMMENT {pin=1}
WS                ::= Comment | MultiLineComment | [#x20#x09#x0A#x0D]+ {fragment=true}
EOL               ::= [#x0A#x0D]+|EOF

`;

export const RULES: IRule[] = Grammars.Custom.getRules(grammar);

export const parser = new Parser(RULES, {});
