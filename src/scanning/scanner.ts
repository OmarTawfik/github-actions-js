/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { DiagnosticBag } from "../util/diagnostics";
import { Token, TokenKind } from "./tokens";
import { Range } from "vscode-languageserver-types";

export class Scanner {
  private readonly tokens = Array<Token>();

  private index = 0;
  private line = 0;
  private character = 0;

  public readonly result: ReadonlyArray<Token>;

  public constructor(private readonly text: string, private readonly bag: DiagnosticBag) {
    while (this.index < text.length) {
      this.scanNextToken();
    }

    this.result = this.tokens;
  }

  private scanNextToken(): void {
    const current = this.text[this.index];

    switch (current) {
      case "\r": {
        if (this.index + 1 < this.text.length && this.text[this.index + 1] === "\n") {
          this.index += 2;
        } else {
          this.index += 1;
        }

        this.line += 1;
        this.character = 0;
        break;
      }
      case "\n": {
        this.index += 1;
        this.line += 1;
        this.character = 0;
        break;
      }
      case " ":
      case "\t": {
        this.index += 1;
        this.character += 1;
        break;
      }
      case "=": {
        this.addToken(TokenKind.Equal, current);
        break;
      }
      case ",": {
        this.addToken(TokenKind.Comma, current);
        break;
      }
      case "{": {
        this.addToken(TokenKind.LeftCurlyBracket, current);
        break;
      }
      case "}": {
        this.addToken(TokenKind.RightCurlyBracket, current);
        break;
      }
      case "[": {
        this.addToken(TokenKind.LeftSquareBracket, current);
        break;
      }
      case "]": {
        this.addToken(TokenKind.RightSquareBracket, current);
        break;
      }
      case "#": {
        this.scanComment();
        break;
      }
      case "/": {
        if (this.index + 1 < this.text.length && this.text[this.index + 1] === "/") {
          this.scanComment();
        } else {
          const token = this.addToken(TokenKind.Unrecognized, current);
          this.bag.unrecognizedCharacter(current, token.range);
        }
        break;
      }
      case '"': {
        this.scanStringLiteral();
        break;
      }
      default: {
        if ("0" <= current && current <= "9") {
          this.scanNumberLiteral();
        } else if (current === "_" || ("a" <= current && current <= "z") || ("A" <= current && current <= "Z")) {
          this.scanKeywordOrIdentifier();
        } else {
          const token = this.addToken(TokenKind.Unrecognized, current);
          this.bag.unrecognizedCharacter(current, token.range);
        }
        break;
      }
    }
  }

  private scanComment(): void {
    let lookAhead = this.index + 1;
    while (lookAhead < this.text.length) {
      const current = this.text[lookAhead];
      if (current === "\r" || current === "\n") {
        break;
      }

      lookAhead += 1;
    }

    this.addToken(TokenKind.Comment, this.text.substring(this.index, lookAhead));
  }

  private scanStringLiteral(): void {
    let lookAhead = this.index + 1;
    while (lookAhead < this.text.length) {
      const current = this.text[lookAhead];
      switch (current) {
        case '"': {
          this.addToken(TokenKind.StringLiteral, this.text.substring(this.index, lookAhead + 1));
          return;
        }
        case "\r":
        case "\n": {
          const token = this.addToken(TokenKind.StringLiteral, this.text.substring(this.index, lookAhead));
          this.bag.unterminatedStringLiteral(token.range);
          return;
        }
        case "\\": {
          if (lookAhead + 1 < this.text.length) {
            const escaped = this.text[lookAhead + 1];
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
                this.bag.unsupportedEscapeSequence(escaped, this.getRange(lookAhead + 1, 1));
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
            this.bag.unrecognizedCharacter(current, this.getRange(lookAhead, 1));
          }

          lookAhead += 1;
          break;
        }
      }
    }

    const token = this.addToken(TokenKind.StringLiteral, this.text.substring(this.index, lookAhead));
    this.bag.unterminatedStringLiteral(token.range);
  }

  private scanNumberLiteral(): void {
    let lookAhead = this.index + 1;
    while (lookAhead < this.text.length) {
      const current = this.text[lookAhead];
      if ("0" <= current && current <= "9") {
        lookAhead += 1;
      } else {
        break;
      }
    }

    this.addToken(TokenKind.IntegerLiteral, this.text.substring(this.index, lookAhead));
  }

  private scanKeywordOrIdentifier(): void {
    let lookAhead = this.index + 1;
    while (lookAhead < this.text.length) {
      const current = this.text[lookAhead];
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

    const length = lookAhead - this.index;
    const value = this.text.substr(this.index, length);

    switch (value) {
      case "version": {
        this.addToken(TokenKind.VersionKeyword, value);
        break;
      }
      case "workflow": {
        this.addToken(TokenKind.WorkflowKeyword, value);
        break;
      }
      case "action": {
        this.addToken(TokenKind.ActionKeyword, value);
        break;
      }
      case "on": {
        this.addToken(TokenKind.OnKeyword, value);
        break;
      }
      case "resolves": {
        this.addToken(TokenKind.ResolvesKeyword, value);
        break;
      }
      case "uses": {
        this.addToken(TokenKind.UsesKeyword, value);
        break;
      }
      case "needs": {
        this.addToken(TokenKind.NeedsKeyword, value);
        break;
      }
      case "runs": {
        this.addToken(TokenKind.RunsKeyword, value);
        break;
      }
      case "args": {
        this.addToken(TokenKind.ArgsKeyword, value);
        break;
      }
      case "env": {
        this.addToken(TokenKind.EnvKeyword, value);
        break;
      }
      case "secrets": {
        this.addToken(TokenKind.SecretsKeyword, value);
        break;
      }
      default: {
        this.addToken(TokenKind.Identifier, value);
        break;
      }
    }
  }

  private addToken(kind: TokenKind, contents: string): Token {
    const token = {
      kind,
      text: contents,
      range: this.getRange(this.character, contents.length),
    };

    this.index += contents.length;
    this.character += contents.length;

    this.tokens.push(token);
    return token;
  }

  private getRange(character: number, length: number): Range {
    return Range.create(this.line, character, this.line, character + length);
  }
}
