# Workflow Grammar

This grammar is based on the published by
[actions/workflow-parser](https://github.com/actions/workflow-parser/blob/master/language.md). Compiling a `.workflow`
file is divided into three phases:

1. **Scanning**: where text is divided into individual tokens, marked by a range and a type.
2. **Parsing**: an initial syntax tree is constructed from the token stream. Parsing is error-tolerant and prefers to
   construct partially valid trees in order to report diagnostics in the next phase.
3. **Binding**: where a complete list of symbols is compiled, and any advanced analysis/error reporting is done.

A compilation holds the results of these operations. The rest of this document describes them in detail.

## Scanning

The scanner produces a list of the tokens below from a document text.

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

## Parsing

The parser will create a high-level list of blocks, without actually making decisions about which properties are legal
under which parents. It tries to leave as much work as possible to the binding phase. Each syntax node holds comment
tokens appearing before it. The main document node holds comment tokens appearing after it.

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
               ((STRING_LITERAL COMMA)* STRING_LITERAL COMMA?)?
               RIGHT_SQUARE_BRACKET ;

env_variables : LEFT_CURLY_BRACKET (env_variable)* RIGHT_CURLY_BRACKET ;

env_variable : IDENTIFIER EQUAL STRING_LITERAL ;
```

## Binding

It takes the high-level parse tree, holding to their original syntax nodes and comments, and produces the following
structure. It also validates that:

1. Version number is supported, and is declared (if any) at the correct location.
2. All properties are correct, and under the right type of block.
3. Complex values like Docker and GitHub URLs are valid.
4. Environment values and secrets are unique, and have correct keys.
5. No circular dependencies in the action graph.

```typescript
type Document {
    version? number;
    workflows: Workflow[];
    actions: Action[];
}

type Workflow {
    name: string;
    on: string;
    resolves: string[];
}

type Action {
    name: string;
    uses: string;
    needs: string[];
    runs: string[];
    args: string[];
    env: {
        [key: string] : string;
    };
    secrets: string[];
}
```
