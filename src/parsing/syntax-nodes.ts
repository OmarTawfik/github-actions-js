/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { Token, TokenKind, getTokenDescription } from "../scanning/tokens";

export enum SyntaxKind {
  // Top level
  Document,
  Version,
  Block,

  // Strings
  StringProperty,

  // Arrays
  ArrayProperty,
  ArrayItem,

  // Objects
  ObjectProperty,
  ObjectMember,
}

function assertTokenKind(token: Token | undefined, ...acceptedKinds: TokenKind[]): void {
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
    public readonly properties: ReadonlyArray<BasePropertySyntax>,
    public readonly closeBracket: Token,
  ) {
    super(SyntaxKind.Block);
    assertTokenKind(type, TokenKind.ActionKeyword, TokenKind.WorkflowKeyword);
    assertTokenKind(name, TokenKind.StringLiteral);
    assertTokenKind(openBracket, TokenKind.LeftCurlyBracket);
    assertTokenKind(closeBracket, TokenKind.RightCurlyBracket);
  }
}

export abstract class BasePropertySyntax extends BaseSyntaxNode {
  protected constructor(kind: SyntaxKind, public readonly key: Token, public readonly equal: Token) {
    super(kind);
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

export class StringPropertySyntax extends BasePropertySyntax {
  public constructor(key: Token, equal: Token, public readonly value: Token | undefined) {
    super(SyntaxKind.StringProperty, key, equal);
    assertTokenKind(value, TokenKind.StringLiteral);
  }
}

export class ArrayPropertySyntax extends BasePropertySyntax {
  public constructor(
    key: Token,
    equal: Token,
    public readonly openBracket: Token,
    public readonly items: ReadonlyArray<ArrayItemSyntax>,
    public readonly closeBracket: Token,
  ) {
    super(SyntaxKind.ArrayProperty, key, equal);
    assertTokenKind(openBracket, TokenKind.LeftSquareBracket);
    assertTokenKind(closeBracket, TokenKind.RightSquareBracket);
  }
}

export class ArrayItemSyntax extends BaseSyntaxNode {
  public constructor(public readonly value: Token, public readonly comma: Token | undefined) {
    super(SyntaxKind.ArrayItem);
    assertTokenKind(value, TokenKind.StringLiteral);
    assertTokenKind(comma, TokenKind.Comma);
  }
}

export class ObjectPropertySyntax extends BasePropertySyntax {
  public constructor(
    key: Token,
    equal: Token,
    public readonly openBracket: Token,
    public readonly members: ReadonlyArray<ObjectMemberSyntax>,
    public readonly closeBracket: Token,
  ) {
    super(SyntaxKind.ObjectProperty, key, equal);
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
