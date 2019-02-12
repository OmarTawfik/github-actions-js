/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

export const enum TokenType {
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

  // Punctuators
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

export interface Token {
  readonly length: number;
  readonly position: number;
  readonly type: TokenType;
}

export namespace TokenUtils {
  export const getContents = (text: string, token: Token): string => text.substr(token.position, token.length);
}
