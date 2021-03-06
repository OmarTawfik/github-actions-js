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

export function parseTokens(allTokens: ReadonlyArray<Token>, bag: DiagnosticBag): DocumentSyntax {
  const tokens = allTokens.filter(token => token.kind !== TokenKind.Unrecognized);
  const commentsAfter = extractCommentsAtEndOfFile();

  const reportedErrors = Array<boolean>();

  let index = 0;
  const versions = Array<VersionSyntax>();
  const blocks = Array<BlockSyntax>();

  while (index < tokens.length) {
    parseTopLevelNode({
      supported: [],
    });
  }

  return new DocumentSyntax(versions, blocks, commentsAfter);

  function extractCommentsAtEndOfFile(): ReadonlyArray<TokenWithTrivia> {
    let end = tokens.length - 1;
    while (end >= 0 && tokens[end].kind === TokenKind.Comment) {
      end -= 1;
    }

    const result = tokens.slice(end + 1);
    tokens.splice(end + 1);
    return result;
  }

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

  function parseVersion(version: TokenWithTrivia, context: ParseContext): void {
    const equal = eat(context, TokenKind.Equal);
    const integer = eat(context, TokenKind.IntegerLiteral);

    versions.push(new VersionSyntax(version, equal, integer));
  }

  function parseBlock(type: TokenWithTrivia, context: ParseContext): void {
    const name = eat(context, TokenKind.StringLiteral);
    const openBracket = eat(context, TokenKind.LeftCurlyBracket);

    const properties = parseProperties({
      parent: context,
      supported: [TokenKind.RightCurlyBracket],
    });

    const closeBracket = eat(context, TokenKind.RightCurlyBracket);
    blocks.push(new BlockSyntax(type, name, openBracket, properties, closeBracket));
  }

  function parseProperties(context: ParseContext): ReadonlyArray<BasePropertySyntax> {
    const properties: BasePropertySyntax[] = [];

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
        // Stop looking for properties
        break;
      }

      properties.push(
        parseProperty(key, {
          parent: context,
          supported: keyKinds,
        }),
      );
    }

    return properties;
  }

  function parseProperty(key: TokenWithTrivia, context: ParseContext): BasePropertySyntax {
    const equal = eat(context, TokenKind.Equal);
    const valueStart = eat(context, TokenKind.StringLiteral, TokenKind.LeftCurlyBracket, TokenKind.LeftSquareBracket);

    let property: BasePropertySyntax;
    switch (valueStart.kind) {
      case TokenKind.StringLiteral: {
        property = new StringPropertySyntax(key, equal, valueStart);
        break;
      }
      case TokenKind.LeftSquareBracket: {
        const items = parseArrayItems(context);
        const closeBracket = eat(context, TokenKind.RightSquareBracket);
        property = new ArrayPropertySyntax(key, equal, valueStart, items, closeBracket);
        break;
      }
      case TokenKind.LeftCurlyBracket: {
        const members = parseObjectMembers(context);
        const closeBracket = eat(context, TokenKind.RightCurlyBracket);
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

  function parseArrayItems(context: ParseContext): ReadonlyArray<ArrayItemSyntax> {
    const items = Array<ArrayItemSyntax>();

    while (!isNext(TokenKind.RightSquareBracket)) {
      const value = eat(context, TokenKind.StringLiteral);

      if (value.kind === TokenKind.Missing) {
        break;
      }

      let comma: TokenWithTrivia | undefined;
      if (isNext(TokenKind.Comma)) {
        comma = eat(context, TokenKind.Comma);
      }

      items.push(new ArrayItemSyntax(value, comma));
    }

    return items;
  }

  function parseObjectMembers(context: ParseContext): ReadonlyArray<ObjectMemberSyntax> {
    const members = Array<ObjectMemberSyntax>();

    while (!isNext(TokenKind.RightCurlyBracket)) {
      const name = eat(context, TokenKind.Identifier);

      if (name.kind === TokenKind.Missing) {
        break;
      }

      const equal = eat(context, TokenKind.Equal);
      const value = eat(context, TokenKind.StringLiteral);
      let comma: TokenWithTrivia | undefined;
      if (isNext(TokenKind.Comma)) {
        comma = eat(context, TokenKind.Comma);
      }

      members.push(new ObjectMemberSyntax(name, equal, value, comma));
    }

    return members;
  }

  function isNext(kind: TokenKind): boolean {
    return index < tokens.length && tokens[index].kind === kind;
  }

  function eat(context: ParseContext, ...expected: TokenKind[]): TokenWithTrivia {
    const commentsBefore = eatComments();

    while (true) {
      if (index >= tokens.length) {
        return {
          commentsBefore,
          ...missingToken(expected),
        };
      }

      const current = tokens[index];
      if (expected.includes(current.kind)) {
        index += 1;

        if (index < tokens.length) {
          const commentAfter = tokens[index];
          if (commentAfter.kind === TokenKind.Comment && commentAfter.range.start.line === current.range.end.line) {
            index += 1;
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
          ...missingToken(expected),
        };
      }

      if (!reportedErrors[index]) {
        bag.unexpectedToken(current);
        reportedErrors[index] = true;
      }

      index += 1;
    }
  }

  function eatComments(): ReadonlyArray<TokenWithTrivia> | undefined {
    let result: TokenWithTrivia[] | undefined;

    while (index < tokens.length && tokens[index].kind === TokenKind.Comment) {
      if (!result) {
        result = [];
      }

      result.push(tokens[index]);
      index += 1;
    }

    return result;
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
      text: "",
    };
  }
}
