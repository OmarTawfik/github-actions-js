/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { DiagnosticBag } from "../util/diagnostics";
import { Token, TokenKind } from "./tokens";
import { Range } from "vscode-languageserver-types";

export function scanText(text: string, bag: DiagnosticBag): ReadonlyArray<Token> {
  let index: number = 0;
  let line: number = 0;
  let character: number = 0;

  const tokens: Token[] = [];

  while (index < text.length) {
    scanNextToken();
  }

  return tokens;

  function scanNextToken(): void {
    const current = text[index];

    switch (current) {
      case "\r": {
        if (index + 1 < text.length && text[index + 1] === "\n") {
          index += 2;
        } else {
          index += 1;
        }

        line += 1;
        character = 0;
        break;
      }
      case "\n": {
        index += 1;
        line += 1;
        character = 0;
        break;
      }
      case " ":
      case "\t": {
        index += 1;
        character += 1;
        break;
      }
      case "=": {
        addToken(TokenKind.Equal, current);
        break;
      }
      case ",": {
        addToken(TokenKind.Comma, current);
        break;
      }
      case "{": {
        addToken(TokenKind.LeftCurlyBracket, current);
        break;
      }
      case "}": {
        addToken(TokenKind.RightCurlyBracket, current);
        break;
      }
      case "[": {
        addToken(TokenKind.LeftSquareBracket, current);
        break;
      }
      case "]": {
        addToken(TokenKind.RightSquareBracket, current);
        break;
      }
      case "#": {
        scanComment();
        break;
      }
      case "/": {
        if (index + 1 < text.length && text[index + 1] === "/") {
          scanComment();
        } else {
          const token = addToken(TokenKind.Unrecognized, current);
          bag.unrecognizedCharacter(current, token.range);
        }
        break;
      }
      case '"': {
        scanStringLiteral();
        break;
      }
      default: {
        if ("0" <= current && current <= "9") {
          scanNumberLiteral();
        } else if (current === "_" || ("a" <= current && current <= "z") || ("A" <= current && current <= "Z")) {
          scanKeywordOrIdentifier();
        } else {
          const token = addToken(TokenKind.Unrecognized, current);
          bag.unrecognizedCharacter(current, token.range);
        }
        break;
      }
    }
  }

  function scanComment(): void {
    let lookAhead = index + 1;
    while (lookAhead < text.length) {
      const current = text[lookAhead];
      if (current === "\r" || current === "\n") {
        break;
      }

      lookAhead += 1;
    }

    addToken(TokenKind.Comment, text.substring(index, lookAhead));
  }

  function scanStringLiteral(): void {
    let lookAhead = index + 1;
    while (lookAhead < text.length) {
      const current = text[lookAhead];
      switch (current) {
        case '"': {
          addToken(TokenKind.StringLiteral, text.substring(index, lookAhead + 1));
          return;
        }
        case "\r":
        case "\n": {
          const token = addToken(TokenKind.StringLiteral, text.substring(index, lookAhead));
          bag.unterminatedStringLiteral(token.range);
          return;
        }
        case "\\": {
          if (lookAhead + 1 < text.length) {
            const escaped = text[lookAhead + 1];
            switch (escaped) {
              case "\\":
              case "/":
              case '"':
              case "b":
              case "f":
              case "n":
              case "r":
              case "t": {
                break;
              }
              default: {
                bag.unsupportedEscapeSequence(escaped, getRange(lookAhead + 1, 1));
                break;
              }
            }
            lookAhead += 2;
          } else {
            lookAhead += 1;
          }
          break;
        }
        default: {
          if (current === "\u007F" || ("\u0000" <= current && current <= "\u001F")) {
            bag.unrecognizedCharacter(current, getRange(lookAhead, 1));
          }

          lookAhead += 1;
          break;
        }
      }
    }

    const token = addToken(TokenKind.StringLiteral, text.substring(index, lookAhead));
    bag.unterminatedStringLiteral(token.range);
  }

  function scanNumberLiteral(): void {
    let lookAhead = index + 1;
    while (lookAhead < text.length) {
      const current = text[lookAhead];
      if ("0" <= current && current <= "9") {
        lookAhead += 1;
      } else {
        break;
      }
    }

    addToken(TokenKind.IntegerLiteral, text.substring(index, lookAhead));
  }

  function scanKeywordOrIdentifier(): void {
    let lookAhead = index + 1;
    while (lookAhead < text.length) {
      const current = text[lookAhead];
      if (
        current === "_" ||
        ("a" <= current && current <= "z") ||
        ("A" <= current && current <= "Z") ||
        ("0" <= current && current <= "9")
      ) {
        lookAhead += 1;
      } else {
        break;
      }
    }

    const length = lookAhead - index;
    const value = text.substr(index, length);

    switch (value) {
      case "version": {
        addToken(TokenKind.VersionKeyword, value);
        break;
      }
      case "workflow": {
        addToken(TokenKind.WorkflowKeyword, value);
        break;
      }
      case "action": {
        addToken(TokenKind.ActionKeyword, value);
        break;
      }
      case "on": {
        addToken(TokenKind.OnKeyword, value);
        break;
      }
      case "resolves": {
        addToken(TokenKind.ResolvesKeyword, value);
        break;
      }
      case "uses": {
        addToken(TokenKind.UsesKeyword, value);
        break;
      }
      case "needs": {
        addToken(TokenKind.NeedsKeyword, value);
        break;
      }
      case "runs": {
        addToken(TokenKind.RunsKeyword, value);
        break;
      }
      case "args": {
        addToken(TokenKind.ArgsKeyword, value);
        break;
      }
      case "env": {
        addToken(TokenKind.EnvKeyword, value);
        break;
      }
      case "secrets": {
        addToken(TokenKind.SecretsKeyword, value);
        break;
      }
      default: {
        addToken(TokenKind.Identifier, value);
        break;
      }
    }
  }

  function addToken(kind: TokenKind, contents: string): Token {
    const token = {
      kind,
      text: contents,
      range: getRange(character, contents.length),
    };

    index += contents.length;
    character += contents.length;

    tokens.push(token);
    return token;
  }

  function getRange(character: number, length: number): Range {
    return Range.create(line, character, line, character + length);
  }
}
