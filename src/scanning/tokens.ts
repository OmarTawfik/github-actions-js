/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

export const enum TokenKind {
  // Top-level keywords
  VersionKeyword = 1,
  WorkflowKeyword = 2,
  ActionKeyword = 3,

  // Bottom-level keywords
  OnKeyword = 4,
  ResolvesKeyword = 5,
  UsesKeyword = 6,
  NeedsKeyword = 7,
  RunsKeyword = 8,
  ArgsKeyword = 9,
  EnvKeyword = 10,
  SecretsKeyword = 11,

  // Punctuation
  Equal = 12,
  Comma = 13,

  // Brackets
  LeftCurlyBracket = 14,
  RightCurlyBracket = 15,
  LeftSquareBracket = 16,
  RightSquareBracket = 17,

  // Misc
  Identifier = 18,
  Comment = 19,

  // Literals
  IntegerLiteral = 20,
  StringLiteral = 21,

  // Generated
  Missing = 22,
  Unrecognized = 23,
}

export function getTokenDescription(kind: TokenKind): string {
  switch (kind) {
    case TokenKind.VersionKeyword:
      return "version";
    case TokenKind.WorkflowKeyword:
      return "workflow";
    case TokenKind.ActionKeyword:
      return "action";

    case TokenKind.OnKeyword:
      return "on";
    case TokenKind.ResolvesKeyword:
      return "resolves";
    case TokenKind.UsesKeyword:
      return "uses";
    case TokenKind.NeedsKeyword:
      return "needs";
    case TokenKind.RunsKeyword:
      return "runs";
    case TokenKind.ArgsKeyword:
      return "args";
    case TokenKind.EnvKeyword:
      return "env";
    case TokenKind.SecretsKeyword:
      return "secrets";

    case TokenKind.Equal:
      return "=";
    case TokenKind.Comma:
      return ",";

    case TokenKind.LeftCurlyBracket:
      return "{";
    case TokenKind.RightCurlyBracket:
      return "}";
    case TokenKind.LeftSquareBracket:
      return "[";
    case TokenKind.RightSquareBracket:
      return "]";

    case TokenKind.Identifier:
      return "identifier";
    case TokenKind.Comment:
      return "comment";

    case TokenKind.IntegerLiteral:
      return "integer";
    case TokenKind.StringLiteral:
      return "string";

    case TokenKind.Missing:
      return "missing";
    case TokenKind.Unrecognized:
      return "unrecognized";
  }
}

export interface TextPosition {
  readonly line: number;
  readonly column: number;
}

export interface TextRange {
  readonly start: TextPosition;
  readonly end: TextPosition;
}

export interface Token {
  readonly kind: TokenKind;
  readonly range: TextRange;
  readonly text: string;
}
