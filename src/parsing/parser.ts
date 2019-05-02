/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { DiagnosticBag } from "../util/diagnostics";
import { Token, TokenKind, getTokenDescription, TokenWithTrivia } from "../scanning/tokens";
import {
  DocumentSyntax,
  VersionSyntax,
  BlockSyntax,
  BasePropertySyntax,
  ArrayPropertySyntax,
  ArrayItemSyntax,
  ObjectMemberSyntax,
  StringPropertySyntax,
  ObjectPropertySyntax,
} from "./syntax-nodes";

interface ParseContext {
  readonly parent?: ParseContext;
  readonly supported: ReadonlyArray<TokenKind>;
}

export class Parser {
  private readonly tokens: ReadonlyArray<Token>;
  private readonly reportedErrors = Array<boolean>();

  private readonly versions = Array<VersionSyntax>();
  private readonly blocks = Array<BlockSyntax>();

  private index = 0;

  public readonly result: DocumentSyntax;

  public constructor(scanned: ReadonlyArray<Token>, private readonly bag: DiagnosticBag) {
    const recognized = scanned.filter(token => token.kind !== TokenKind.Unrecognized);

    let end = recognized.length - 1;
    while (end >= 0 && recognized[end].kind === TokenKind.Comment) {
      end -= 1;
    }

    const commentsAfter = recognized.slice(end + 1);
    recognized.splice(end + 1);

    this.tokens = recognized;

    while (this.index < recognized.length) {
      this.parseTopLevelNode({
        supported: [],
      });
    }

    this.result = new DocumentSyntax(this.versions, this.blocks, commentsAfter);
  }

  private parseTopLevelNode(context: ParseContext): void {
    const keywordKinds = [TokenKind.VersionKeyword, TokenKind.WorkflowKeyword, TokenKind.ActionKeyword];
    const keyword = this.eat(context, ...keywordKinds);

    const innerContext = {
      parent: context,
      supported: keywordKinds,
    };

    switch (keyword.kind) {
      case TokenKind.VersionKeyword: {
        this.parseVersion(keyword, innerContext);
        break;
      }
      case TokenKind.WorkflowKeyword:
      case TokenKind.ActionKeyword: {
        this.parseBlock(keyword, innerContext);
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

  private parseVersion(version: TokenWithTrivia, context: ParseContext): void {
    const equal = this.eat(context, TokenKind.Equal);
    const integer = this.eat(context, TokenKind.IntegerLiteral);

    this.versions.push(new VersionSyntax(version, equal, integer));
  }

  private parseBlock(type: TokenWithTrivia, context: ParseContext): void {
    const name = this.eat(context, TokenKind.StringLiteral);
    const openBracket = this.eat(context, TokenKind.LeftCurlyBracket);

    const properties = this.parseProperties({
      parent: context,
      supported: [TokenKind.RightCurlyBracket],
    });

    const closeBracket = this.eat(context, TokenKind.RightCurlyBracket);
    this.blocks.push(new BlockSyntax(type, name, openBracket, properties, closeBracket));
  }

  private parseProperties(context: ParseContext): ReadonlyArray<BasePropertySyntax> {
    const properties: BasePropertySyntax[] = [];

    while (!this.isNext(TokenKind.RightCurlyBracket)) {
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

      const key = this.eat(context, ...keyKinds);
      if (key.kind === TokenKind.Missing) {
        // Stop looking for properties
        break;
      }

      properties.push(
        this.parseProperty(key, {
          parent: context,
          supported: keyKinds,
        }),
      );
    }

    return properties;
  }

  private parseProperty(key: TokenWithTrivia, context: ParseContext): BasePropertySyntax {
    const equal = this.eat(context, TokenKind.Equal);
    const valueStart = this.eat(
      context,
      TokenKind.StringLiteral,
      TokenKind.LeftCurlyBracket,
      TokenKind.LeftSquareBracket,
    );

    let property: BasePropertySyntax;
    switch (valueStart.kind) {
      case TokenKind.StringLiteral: {
        property = new StringPropertySyntax(key, equal, valueStart);
        break;
      }
      case TokenKind.LeftSquareBracket: {
        const items = this.parseArrayItems(context);
        const closeBracket = this.eat(context, TokenKind.RightSquareBracket);
        property = new ArrayPropertySyntax(key, equal, valueStart, items, closeBracket);
        break;
      }
      case TokenKind.LeftCurlyBracket: {
        const members = this.parseObjectMembers(context);
        const closeBracket = this.eat(context, TokenKind.RightCurlyBracket);
        property = new ObjectPropertySyntax(key, equal, valueStart, members, closeBracket);
        break;
      }
      case TokenKind.Missing: {
        // Insert missing value as a string property
        property = new StringPropertySyntax(key, equal, valueStart);
        break;
      }
      default: {
        throw new Error(`Unexpected token '${getTokenDescription(valueStart.kind)}' here.`);
      }
    }

    return property;
  }

  private parseArrayItems(context: ParseContext): ReadonlyArray<ArrayItemSyntax> {
    const items = Array<ArrayItemSyntax>();

    while (!this.isNext(TokenKind.RightSquareBracket)) {
      const value = this.eat(context, TokenKind.StringLiteral);

      if (value.kind === TokenKind.Missing) {
        break;
      }

      let comma: TokenWithTrivia | undefined;
      if (this.isNext(TokenKind.Comma)) {
        comma = this.eat(context, TokenKind.Comma);
      }

      items.push(new ArrayItemSyntax(value, comma));
    }

    return items;
  }

  private parseObjectMembers(context: ParseContext): ReadonlyArray<ObjectMemberSyntax> {
    const members = Array<ObjectMemberSyntax>();

    while (!this.isNext(TokenKind.RightCurlyBracket)) {
      const name = this.eat(context, TokenKind.Identifier);

      if (name.kind === TokenKind.Missing) {
        break;
      }

      const equal = this.eat(context, TokenKind.Equal);
      const value = this.eat(context, TokenKind.StringLiteral);
      let comma: TokenWithTrivia | undefined;
      if (this.isNext(TokenKind.Comma)) {
        comma = this.eat(context, TokenKind.Comma);
      }

      members.push(new ObjectMemberSyntax(name, equal, value, comma));
    }

    return members;
  }

  private isNext(kind: TokenKind): boolean {
    return this.index < this.tokens.length && this.tokens[this.index].kind === kind;
  }

  private eat(context: ParseContext, ...expected: TokenKind[]): TokenWithTrivia {
    const commentsBefore = this.eatComments();

    while (true) {
      if (this.index >= this.tokens.length) {
        return {
          commentsBefore,
          ...this.missingToken(expected),
        };
      }

      const current = this.tokens[this.index];
      if (expected.includes(current.kind)) {
        this.index += 1;

        if (this.index < this.tokens.length) {
          const commentAfter = this.tokens[this.index];
          if (commentAfter.kind === TokenKind.Comment && commentAfter.range.start.line === current.range.end.line) {
            this.index += 1;
            return {
              commentsBefore,
              ...current,
              commentAfter,
            };
          }
        }

        return {
          commentsBefore,
          ...current,
        };
      }

      let canBeHandledByParent = false;
      let currentContext: ParseContext | undefined = context;
      while (!canBeHandledByParent && currentContext) {
        canBeHandledByParent = currentContext.supported.includes(current.kind);
        currentContext = currentContext.parent;
      }

      if (canBeHandledByParent) {
        return {
          commentsBefore,
          ...this.missingToken(expected),
        };
      }

      if (!this.reportedErrors[this.index]) {
        this.bag.unexpectedToken(current);
        this.reportedErrors[this.index] = true;
      }

      this.index += 1;
    }
  }

  private eatComments(): ReadonlyArray<TokenWithTrivia> | undefined {
    let result: TokenWithTrivia[] | undefined;

    while (this.index < this.tokens.length && this.tokens[this.index].kind === TokenKind.Comment) {
      if (!result) {
        result = [];
      }

      result.push(this.tokens[this.index]);
      this.index += 1;
    }

    return result;
  }

  private missingToken(expected: TokenKind[]): Token {
    let missingIndex = this.index;
    const endOfFile = this.index >= this.tokens.length;
    if (endOfFile) {
      missingIndex = this.tokens.length - 1;
    }

    const range = this.tokens[missingIndex].range;
    if (!this.reportedErrors[missingIndex]) {
      this.bag.missingToken(expected, range, endOfFile);
      this.reportedErrors[missingIndex] = true;
    }

    return {
      range,
      kind: TokenKind.Missing,
      text: "",
    };
  }
}
