/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { Token, TokenKind, getTokenDescription } from "../scanning/tokens";

export const enum SyntaxKind {
  // Top level
  Document = 1,
  Version = 2,
  Block = 3,

  // Key Value Pairs
  KeyValuePair = 4,

  // Strings
  StringValue = 5,

  // String Arrays
  StringArrayValue = 6,
  StringArrayMember = 7,

  // Env Variables
  EnvVariablesValue = 8,
  EnvVariableMember = 9,
}

function assertTokenKind(token?: Token, ...acceptedKinds: TokenKind[]): void {
  if (token && token.kind !== TokenKind.Missing && !acceptedKinds.includes(token.kind)) {
    throw new Error(`Token was initialized with an invalid '${getTokenDescription(token.kind)}' kind.`);
  }
}

export abstract class BaseSyntax {
  protected constructor(public readonly kind: SyntaxKind) {}
}

export class DocumentSyntax extends BaseSyntax {
  public constructor(public readonly versions: ReadonlyArray<VersionSyntax>) {
    super(SyntaxKind.Document);
  }
}

export class VersionSyntax extends BaseSyntax {
  public constructor(public readonly version: Token, public readonly equal: Token, public readonly integer: Token) {
    super(SyntaxKind.Version);
    assertTokenKind(version, TokenKind.VersionKeyword);
    assertTokenKind(equal, TokenKind.Equal);
    assertTokenKind(integer, TokenKind.IntegerLiteral);
  }
}

export class BlockSyntax extends BaseSyntax {
  public constructor(
    public readonly type: Token,
    public readonly name: Token,
    public readonly openBracket: Token,
    public readonly members: ReadonlyArray<KeyValuePairSyntax>,
    public readonly closeBracket: Token,
  ) {
    super(SyntaxKind.Block);
    assertTokenKind(type, TokenKind.ActionKeyword, TokenKind.WorkflowKeyword);
    assertTokenKind(name, TokenKind.StringLiteral);
    assertTokenKind(openBracket, TokenKind.LeftCurlyBracket);
    assertTokenKind(closeBracket, TokenKind.RightCurlyBracket);
  }
}

export class KeyValuePairSyntax extends BaseSyntax {
  public constructor(
    public readonly key: Token,
    public readonly equal: Token,
    public readonly value?: StringValueSyntax | StringArrayValueSyntax | EnvVariablesValueSyntax,
  ) {
    super(SyntaxKind.KeyValuePair);
    assertTokenKind(
      key,
      TokenKind.OnKeyword,
      TokenKind.ResolvesKeyword,
      TokenKind.UsesKeyword,
      TokenKind.NeedsKeyword,
      TokenKind.RunsKeyword,
      TokenKind.ArgsKeyword,
      TokenKind.EnvKeyword,
      TokenKind.SecretsKeyword,
    );
    assertTokenKind(equal, TokenKind.Equal);
  }
}

export class StringValueSyntax extends BaseSyntax {
  public constructor(public readonly value: Token) {
    super(SyntaxKind.StringValue);
    assertTokenKind(value, TokenKind.StringLiteral);
  }
}

export class StringArrayValueSyntax extends BaseSyntax {
  public constructor(
    public readonly openBracket: Token,
    public readonly values: ReadonlyArray<StringArrayMemberSyntax>,
    public readonly closeBracket: Token,
  ) {
    super(SyntaxKind.StringArrayValue);
    assertTokenKind(openBracket, TokenKind.LeftSquareBracket);
    assertTokenKind(closeBracket, TokenKind.RightSquareBracket);
  }
}

export class StringArrayMemberSyntax extends BaseSyntax {
  public constructor(public readonly value: Token, public readonly comma?: Token) {
    super(SyntaxKind.StringArrayMember);
    assertTokenKind(value, TokenKind.StringLiteral);
    assertTokenKind(comma, TokenKind.Comma);
  }
}

export class EnvVariablesValueSyntax extends BaseSyntax {
  public constructor(
    public readonly openBracket: Token,
    public readonly variables: ReadonlyArray<EnvVariableMemberSyntax>,
    public readonly closeBracket: Token,
  ) {
    super(SyntaxKind.EnvVariablesValue);
    assertTokenKind(openBracket, TokenKind.LeftCurlyBracket);
    assertTokenKind(closeBracket, TokenKind.RightCurlyBracket);
  }
}

export class EnvVariableMemberSyntax extends BaseSyntax {
  public constructor(public readonly name: Token, public readonly equal: Token, public readonly value: Token) {
    super(SyntaxKind.EnvVariableMember);
    assertTokenKind(name, TokenKind.Identifier);
    assertTokenKind(equal, TokenKind.Equal);
    assertTokenKind(value, TokenKind.StringLiteral);
  }
}
