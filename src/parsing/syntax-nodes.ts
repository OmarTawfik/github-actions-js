/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { Token, TokenKind, getTokenDescription } from "../scanning/tokens";

export const enum SyntaxKind {
  // Top level
  Document = 1,
  Version = 2,
  Block = 3,

  // Properties
  Property = 4,

  // Strings
  StringValue = 5,

  // String Arrays
  StringArrayValue = 6,
  StringArrayItem = 7,

  // Env Variables
  ObjectValue = 8,
  ObjectMember = 9,
}

function assertTokenKind(token?: Token, ...acceptedKinds: TokenKind[]): void {
  if (token && token.kind !== TokenKind.Missing && !acceptedKinds.includes(token.kind)) {
    throw new Error(`Token was initialized with an invalid '${getTokenDescription(token.kind)}' kind.`);
  }
}

export abstract class BaseSyntaxNode {
  protected constructor(public readonly kind: SyntaxKind) {}
}

export class DocumentSyntax extends BaseSyntaxNode {
  public constructor(
    public readonly versions: ReadonlyArray<VersionSyntax>,
    public readonly blocks: ReadonlyArray<BlockSyntax>,
  ) {
    super(SyntaxKind.Document);
  }
}

export class VersionSyntax extends BaseSyntaxNode {
  public constructor(public readonly version: Token, public readonly equal: Token, public readonly integer: Token) {
    super(SyntaxKind.Version);
    assertTokenKind(version, TokenKind.VersionKeyword);
    assertTokenKind(equal, TokenKind.Equal);
    assertTokenKind(integer, TokenKind.IntegerLiteral);
  }
}

export class BlockSyntax extends BaseSyntaxNode {
  public constructor(
    public readonly type: Token,
    public readonly name: Token,
    public readonly openBracket: Token,
    public readonly properties: ReadonlyArray<PropertySyntax>,
    public readonly closeBracket: Token,
  ) {
    super(SyntaxKind.Block);
    assertTokenKind(type, TokenKind.ActionKeyword, TokenKind.WorkflowKeyword);
    assertTokenKind(name, TokenKind.StringLiteral);
    assertTokenKind(openBracket, TokenKind.LeftCurlyBracket);
    assertTokenKind(closeBracket, TokenKind.RightCurlyBracket);
  }
}

export class PropertySyntax extends BaseSyntaxNode {
  public constructor(
    public readonly key: Token,
    public readonly equal: Token,
    public readonly value: BaseValueSyntax | undefined,
  ) {
    super(SyntaxKind.Property);
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

export abstract class BaseValueSyntax extends BaseSyntaxNode {}

export class StringValueSyntax extends BaseValueSyntax {
  public constructor(public readonly value: Token) {
    super(SyntaxKind.StringValue);
    assertTokenKind(value, TokenKind.StringLiteral);
  }
}

export class StringArrayValueSyntax extends BaseValueSyntax {
  public constructor(
    public readonly openBracket: Token,
    public readonly values: ReadonlyArray<StringArrayItemSyntax>,
    public readonly closeBracket: Token,
  ) {
    super(SyntaxKind.StringArrayValue);
    assertTokenKind(openBracket, TokenKind.LeftSquareBracket);
    assertTokenKind(closeBracket, TokenKind.RightSquareBracket);
  }
}

export class StringArrayItemSyntax extends BaseSyntaxNode {
  public constructor(public readonly value: Token, public readonly comma: Token | undefined) {
    super(SyntaxKind.StringArrayItem);
    assertTokenKind(value, TokenKind.StringLiteral);
    assertTokenKind(comma, TokenKind.Comma);
  }
}

export class ObjectValueSyntax extends BaseValueSyntax {
  public constructor(
    public readonly openBracket: Token,
    public readonly members: ReadonlyArray<ObjectMemberSyntax>,
    public readonly closeBracket: Token,
  ) {
    super(SyntaxKind.ObjectValue);
    assertTokenKind(openBracket, TokenKind.LeftCurlyBracket);
    assertTokenKind(closeBracket, TokenKind.RightCurlyBracket);
  }
}

export class ObjectMemberSyntax extends BaseSyntaxNode {
  public constructor(public readonly name: Token, public readonly equal: Token, public readonly value: Token) {
    super(SyntaxKind.ObjectMember);
    assertTokenKind(name, TokenKind.Identifier);
    assertTokenKind(equal, TokenKind.Equal);
    assertTokenKind(value, TokenKind.StringLiteral);
  }
}
