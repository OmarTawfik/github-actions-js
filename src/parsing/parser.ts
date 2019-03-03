/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { DiagnosticBag } from "../util/diagnostics";
import { Token, TokenKind, getTokenDescription } from "../scanning/tokens";
import {
  DocumentSyntax,
  VersionSyntax,
  BlockSyntax,
  KeyValuePairSyntax,
  StringValueSyntax,
  StringArrayValueSyntax,
  EnvVariablesValueSyntax,
  StringArrayMemberSyntax,
  EnvVariableMemberSyntax,
} from "./syntax-nodes";

interface ParseContext {
  readonly parent?: ParseContext;
  readonly supported: ReadonlyArray<TokenKind>;
}

export function parseTokens(allTokens: ReadonlyArray<Token>, bag: DiagnosticBag): DocumentSyntax {
  const tokens = allTokens.filter(token => token.kind !== TokenKind.Comment && token.kind !== TokenKind.Unrecognized);
  const reportedErrors = Array<boolean>();

  let index = 0;
  const versions: VersionSyntax[] = [];
  const blocks: BlockSyntax[] = [];

  while (index < tokens.length) {
    parseTopLevelNode({
      supported: [],
    });
  }

  return new DocumentSyntax(versions);

  function parseTopLevelNode(context: ParseContext): void {
    const keywordKinds = [TokenKind.VersionKeyword, TokenKind.WorkflowKeyword, TokenKind.ActionKeyword];
    const keyword = eat(context, ...keywordKinds);

    const innerContext = {
      parent: context,
      supported: keywordKinds,
    };

    switch (keyword.kind) {
      case TokenKind.VersionKeyword: {
        parseVersion(keyword, innerContext);
        break;
      }
      case TokenKind.WorkflowKeyword:
      case TokenKind.ActionKeyword: {
        parseBlock(keyword, innerContext);
        break;
      }
      case TokenKind.Missing: {
        // move to the next token
        break;
      }
      default: {
        throw new Error(`Unexpected token '${getTokenDescription(keyword.kind)}' here.`);
      }
    }
  }

  function parseVersion(version: Token, context: ParseContext): void {
    const equal = eat(context, TokenKind.Equal);
    const integer = eat(context, TokenKind.IntegerLiteral);

    versions.push(new VersionSyntax(version, equal, integer));
  }

  function parseBlock(type: Token, context: ParseContext): void {
    const name = eat(context, TokenKind.StringLiteral);
    const openBracket = eat(context, TokenKind.LeftCurlyBracket);

    const members = parseKeyValuePairs({
      parent: context,
      supported: [TokenKind.RightCurlyBracket],
    });

    const closeBracket = eat(context, TokenKind.RightCurlyBracket);
    blocks.push(new BlockSyntax(type, name, openBracket, members, closeBracket));
  }

  function parseKeyValuePairs(context: ParseContext): ReadonlyArray<KeyValuePairSyntax> {
    const members: KeyValuePairSyntax[] = [];

    while (!isNext(TokenKind.RightCurlyBracket)) {
      const keyKinds = [
        TokenKind.OnKeyword,
        TokenKind.ResolvesKeyword,
        TokenKind.UsesKeyword,
        TokenKind.NeedsKeyword,
        TokenKind.RunsKeyword,
        TokenKind.ArgsKeyword,
        TokenKind.EnvKeyword,
        TokenKind.SecretsKeyword,
      ];

      const key = eat(context, ...keyKinds);
      if (key.kind === TokenKind.Missing) {
        // Stop looking for key-value pairs
        break;
      }

      members.push(
        parseKeyValuePair(key, {
          parent: context,
          supported: keyKinds,
        }),
      );
    }

    return members;
  }

  function parseKeyValuePair(key: Token, context: ParseContext): KeyValuePairSyntax {
    const equal = eat(context, TokenKind.Equal);
    const valueStart = eat(context, TokenKind.StringLiteral, TokenKind.LeftCurlyBracket, TokenKind.LeftSquareBracket);

    let value: StringValueSyntax | StringArrayValueSyntax | EnvVariablesValueSyntax | undefined;
    switch (valueStart.kind) {
      case TokenKind.StringLiteral: {
        value = new StringValueSyntax(valueStart);
        break;
      }
      case TokenKind.LeftSquareBracket: {
        value = parseStringArray(valueStart, context);
        break;
      }
      case TokenKind.LeftCurlyBracket: {
        value = parseEnvVariables(valueStart, context);
        break;
      }
      case TokenKind.Missing: {
        // leave value undefined
        break;
      }
      default: {
        throw new Error(`Unexpected token '${getTokenDescription(valueStart.kind)}' here.`);
      }
    }

    return new KeyValuePairSyntax(key, equal, value);
  }

  function parseStringArray(openBracket: Token, context: ParseContext): StringArrayValueSyntax {
    const values: StringArrayMemberSyntax[] = [];

    while (!isNext(TokenKind.RightSquareBracket)) {
      const value = eat(context, TokenKind.StringLiteral);

      if (value.kind === TokenKind.Missing) {
        break;
      }

      let comma: Token | undefined;
      if (isNext(TokenKind.Comma)) {
        comma = eat(context, TokenKind.Comma);
      }

      values.push(new StringArrayMemberSyntax(value, comma));
    }

    const closeBracket = eat(context, TokenKind.RightSquareBracket);
    return new StringArrayValueSyntax(openBracket, values, closeBracket);
  }

  function parseEnvVariables(openBracket: Token, context: ParseContext): EnvVariablesValueSyntax {
    const variables: EnvVariableMemberSyntax[] = [];

    while (!isNext(TokenKind.RightCurlyBracket)) {
      const name = eat(context, TokenKind.Identifier);

      if (name.kind === TokenKind.Missing) {
        break;
      }

      const equal = eat(context, TokenKind.Equal);
      const value = eat(context, TokenKind.StringLiteral);

      variables.push(new EnvVariableMemberSyntax(name, equal, value));
    }

    const closeBracket = eat(context, TokenKind.RightCurlyBracket);
    return new EnvVariablesValueSyntax(openBracket, variables, closeBracket);
  }

  function isNext(kind: TokenKind): boolean {
    return index < tokens.length && tokens[index].kind === kind;
  }

  function eat(context: ParseContext, ...expected: TokenKind[]): Token {
    while (true) {
      if (index >= tokens.length) {
        return missingToken(expected);
      }

      const current = tokens[index];
      if (expected.includes(current.kind)) {
        index += 1;
        return current;
      }

      let canBeHandledByParent = false;
      let currentContext: ParseContext | undefined = context;
      while (!canBeHandledByParent && currentContext) {
        canBeHandledByParent = currentContext.supported.includes(current.kind);
        currentContext = currentContext.parent;
      }

      if (canBeHandledByParent) {
        return missingToken(expected);
      }

      if (!reportedErrors[index]) {
        bag.unexpectedToken(current);
        reportedErrors[index] = true;
      }

      index += 1;
    }
  }

  function missingToken(expected: TokenKind[]): Token {
    let missingIndex = index;
    const endOfFile = index >= tokens.length;
    if (endOfFile) {
      missingIndex = tokens.length - 1;
    }

    const range = tokens[missingIndex].range;
    if (!reportedErrors[missingIndex]) {
      bag.missingToken(expected, range, endOfFile);
      reportedErrors[missingIndex] = true;
    }

    return {
      range,
      kind: TokenKind.Missing,
    };
  }
}