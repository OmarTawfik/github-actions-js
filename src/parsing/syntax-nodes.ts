/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { Token, TokenKind, getTokenDescription } from "../scanning/tokens";
import { Range } from "vscode-languageserver-types";
import { comparePositions } from "../util/ranges";

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

function combineRange(...items: (Token | BaseSyntaxNode | undefined)[]): Range {
  const validRanges = items.filter(item => !!item).map(item => item!.range);
  if (!validRanges.length) {
    return Range.create(0, 0, 0, 0);
  }

  validRanges.sort((a, b) => comparePositions(a.start, b.start));
  return Range.create(validRanges[0].start, validRanges[validRanges.length - 1].end);
}

export abstract class BaseSyntaxNode {
  private lazyRange: Range | undefined;

  protected constructor(public readonly kind: SyntaxKind) {}

  public get range(): Range {
    if (!this.lazyRange) {
      this.lazyRange = this.calculateRange();
    }
    return this.lazyRange;
  }

  protected abstract calculateRange(): Range;
}

export class DocumentSyntax extends BaseSyntaxNode {
  public constructor(
    public readonly versions: ReadonlyArray<VersionSyntax>,
    public readonly blocks: ReadonlyArray<BlockSyntax>,
  ) {
    super(SyntaxKind.Document);
  }

  public calculateRange(): Range {
    return combineRange(...this.versions, ...this.blocks);
  }
}

export class VersionSyntax extends BaseSyntaxNode {
  public constructor(public readonly version: Token, public readonly equal: Token, public readonly integer: Token) {
    super(SyntaxKind.Version);
    assertTokenKind(version, TokenKind.VersionKeyword);
    assertTokenKind(equal, TokenKind.Equal);
    assertTokenKind(integer, TokenKind.IntegerLiteral);
  }

  public calculateRange(): Range {
    return combineRange(this.version, this.equal, this.integer);
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

  public calculateRange(): Range {
    return combineRange(this.type, this.name, this.openBracket, ...this.properties, this.closeBracket);
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

  public calculateRange(): Range {
    return combineRange(this.key, this.equal, this.value);
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

  public calculateRange(): Range {
    return combineRange(this.openBracket, ...this.items, this.closeBracket);
  }
}

export class ArrayItemSyntax extends BaseSyntaxNode {
  public constructor(public readonly value: Token, public readonly comma: Token | undefined) {
    super(SyntaxKind.ArrayItem);
    assertTokenKind(value, TokenKind.StringLiteral);
    assertTokenKind(comma, TokenKind.Comma);
  }

  public calculateRange(): Range {
    return combineRange(this.value, this.comma);
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

  public calculateRange(): Range {
    return combineRange(this.openBracket, ...this.members, this.closeBracket);
  }
}

export class ObjectMemberSyntax extends BaseSyntaxNode {
  public constructor(public readonly name: Token, public readonly equal: Token, public readonly value: Token) {
    super(SyntaxKind.ObjectMember);
    assertTokenKind(name, TokenKind.Identifier);
    assertTokenKind(equal, TokenKind.Equal);
    assertTokenKind(value, TokenKind.StringLiteral);
  }

  public calculateRange(): Range {
    return combineRange(this.name, this.equal, this.value);
  }
}
