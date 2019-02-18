/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { DiagnosticBag } from "../util/diagnostics";
import { Token, TokenKind, TextRange } from "./tokens";

export function scanText(text: string, bag: DiagnosticBag): ReadonlyArray<Token> {
  let index: number = 0;
  let line: number = 0;
  let column: number = 0;

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
        column = 0;
        break;
      }
      case "\n": {
        index += 1;
        line += 1;
        column = 0;
        break;
      }
      case " ":
      case "\t": {
        index += 1;
        column += 1;
        break;
      }
      case "=": {
        addToken(TokenKind.Equal, 1);
        break;
      }
      case ",": {
        addToken(TokenKind.Comma, 1);
        break;
      }
      case "{": {
        addToken(TokenKind.LeftCurlyBracket, 1);
        break;
      }
      case "}": {
        addToken(TokenKind.RightCurlyBracket, 1);
        break;
      }
      case "[": {
        addToken(TokenKind.LeftSquareBracket, 1);
        break;
      }
      case "]": {
        addToken(TokenKind.RightSquareBracket, 1);
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
          const token = addToken(TokenKind.Unrecognized, 1);
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
          const token = addToken(TokenKind.Unrecognized, 1);
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

    addToken(TokenKind.Comment, lookAhead - index);
  }

  function scanStringLiteral(): void {
    let lookAhead = index + 1;
    while (lookAhead < text.length) {
      const current = text[lookAhead];
      switch (current) {
        case '"': {
          addToken(TokenKind.StringLiteral, lookAhead - index + 1);
          return;
        }
        case "\r":
        case "\n": {
          const token = addToken(TokenKind.StringLiteral, lookAhead - index);
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

    const token = addToken(TokenKind.StringLiteral, lookAhead - index);
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

    addToken(TokenKind.IntegerLiteral, lookAhead - index);
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
        addToken(TokenKind.VersionKeyword, length);
        break;
      }
      case "workflow": {
        addToken(TokenKind.WorkflowKeyword, length);
        break;
      }
      case "action": {
        addToken(TokenKind.ActionKeyword, length);
        break;
      }
      case "on": {
        addToken(TokenKind.OnKeyword, length);
        break;
      }
      case "resolves": {
        addToken(TokenKind.ResolvesKeyword, length);
        break;
      }
      case "uses": {
        addToken(TokenKind.UsesKeyword, length);
        break;
      }
      case "needs": {
        addToken(TokenKind.NeedsKeyword, length);
        break;
      }
      case "runs": {
        addToken(TokenKind.RunsKeyword, length);
        break;
      }
      case "args": {
        addToken(TokenKind.ArgsKeyword, length);
        break;
      }
      case "env": {
        addToken(TokenKind.EnvKeyword, length);
        break;
      }
      case "secrets": {
        addToken(TokenKind.SecretsKeyword, length);
        break;
      }
      default: {
        addToken(TokenKind.Identifier, length);
        break;
      }
    }
  }

  function addToken(kind: TokenKind, length: number): Token {
    const token = {
      kind,
      range: getRange(column, length),
    };

    index += length;
    column += length;

    tokens.push(token);
    return token;
  }

  function getRange(column: number, length: number): TextRange {
    return {
      start: {
        line,
        column,
      },
      end: {
        line,
        column: column + length,
      },
    };
  }
}
