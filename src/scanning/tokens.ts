/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

export enum TokenKind {
  // Top-level keywords
  VersionKeyword,
  WorkflowKeyword,
  ActionKeyword,

  // Bottom-level keywords
  OnKeyword,
  ResolvesKeyword,
  UsesKeyword,
  NeedsKeyword,
  RunsKeyword,
  ArgsKeyword,
  EnvKeyword,
  SecretsKeyword,

  // Punctuation
  Equal,
  Comma,

  // Brackets
  LeftCurlyBracket,
  RightCurlyBracket,
  LeftSquareBracket,
  RightSquareBracket,

  // Misc
  Identifier,
  Comment,

  // Literals
  IntegerLiteral,
  StringLiteral,

  // Generated
  Missing,
  Unrecognized,
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

export function beforeOrEqual(first: TextPosition, second: TextPosition): boolean {
  if (first.line < second.line) {
    return true;
  }
  if (first.line > second.line) {
    return false;
  }
  return first.column <= second.column;
}

export function rangeContains(range: TextRange, position: TextPosition): boolean {
  return beforeOrEqual(range.start, position) && beforeOrEqual(position, range.end);
}
