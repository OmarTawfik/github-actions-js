# Workflow File Grammar

This grammar is based on the one published by:

> https://github.com/actions/workflow-parser/blob/master/language.md

## Scanner

```g4
VERSION_KEYWORD : 'version' ;
WORKFLOW_KEYWORD : 'workflow' ;
ACTION_KEYWORD : 'action';

ON_KEYWORD : 'on' ;
RESOLVES_KEYWORD : 'resolves' ;
USES_KEYWORD : 'uses' ;
NEEDS_KEYWORD : 'needs';
RUNS_KEYWORD : 'runs' ;
ARGS_KEYWORD : 'args' ;
ENV_KEYWORD : 'env' ;
SECRETS_KEYWORD : 'secrets' ;

EQUAL : '=' ;
COMMA : ',' ;

LEFT_CURLY_BRACKET = '{' ;
RIGHT_CURLY_BRACKET = '}' ;
LEFT_SQUARE_BRACKET = '[' ;
RIGHT_SQUARE_BRACKET = ']' ;

IDENTIFIER : [a-zA-Z_] [a-zA-Z0-9_]*;
LINE_COMMENT : ('#' | '//') ~[\r\n]* ;

INTEGER_LITERAL : [0-9]+ ;
STRING_LITERAL : '"' (('\\' ["\\/bfnrt]) | ~["\\\u0000-\u001F\u007F])* '"' ;

WS : [\n \t\r] -> skip;
```

## Parser

```g4
workflow_file : (version | block)* ;

version : VERSION_KEYWORD EQUAL INTEGER_LITERAL ;

block : block_type STRING_LITERAL LEFT_CURLY_BRACKET
        (property)*
        RIGHT_CURLY_BRACKET ;

block_type : WORKFLOW_KEYWORD | ACTION_KEYWORD ;

property : key EQUAL value ;

key : ON_KEYWORD
    | RESOLVES_KEYWORD
    | USES_KEYWORD
    | NEEDS_KEYWORD
    | RUNS_KEYWORD
    | ARGS_KEYWORD
    | ENV_KEYWORD
    | SECRETS_KEYWORD ;

value : STRING_LITERAL | string_array | env_variables ;

string_array : LEFT_SQUARE_BRACKET
               (STRING_LITERAL COMMA?)*
               RIGHT_SQUARE_BRACKET ;

env_variables : LEFT_CURLY_BRACKET (env_variable)* RIGHT_CURLY_BRACKET ;

env_variable : IDENTIFIER EQUAL STRING_LITERAL COMMA? ;
```
