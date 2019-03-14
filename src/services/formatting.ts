/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { IConnection, TextDocuments, ServerCapabilities, TextEdit, Range } from "vscode-languageserver";
import { LanguageService } from "../server";
import { accessCache } from "../util/cache";
import { Compilation } from "../util/compilation";
import { Token, TokenKind } from "../scanning/tokens";

export class FormattingService implements LanguageService {
  public fillCapabilities(capabilities: ServerCapabilities): void {
    capabilities.documentFormattingProvider = true;
  }

  public activate(connection: IConnection, documents: TextDocuments): void {
    connection.onDocumentFormatting(params => {
      const { uri } = params.textDocument;
      const compilation = accessCache(documents, uri);

      const { insertSpaces, tabSize } = params.options;
      const indentation = insertSpaces ? " ".repeat(tabSize) : "\t";

      const result = FormattingService.format(compilation, indentation);
      const fullRange = Range.create(0, 0, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
      return [TextEdit.replace(fullRange, result)];
    });
  }

  public static format(compilation: Compilation, indentationValue: string): string {
    const lines = Array<FormattingLine>();
    let indentationLevel = 0;

    for (const token of compilation.tokens) {
      const lineIndex = token.range.start.line;
      while (lines.length < lineIndex) {
        lines.push(new FormattingLine(indentationLevel));
      }

      switch (token.kind) {
        case TokenKind.RightCurlyBracket:
        case TokenKind.RightSquareBracket: {
          indentationLevel -= 1;
          break;
        }
      }

      if (lines.length === lineIndex) {
        lines.push(new FormattingLine(indentationLevel));
      }

      lines[lineIndex].add(token);

      switch (token.kind) {
        case TokenKind.LeftCurlyBracket:
        case TokenKind.LeftSquareBracket: {
          indentationLevel += 1;
          break;
        }
      }
    }

    lines.push(new FormattingLine(0));
    return lines.map(line => line.format(indentationValue)).join(compilation.text.includes("\r\n") ? "\r\n" : "\n");
  }
}

class FormattingLine {
  private readonly tokens = Array<Token>();

  public constructor(private readonly indentationLevel: number) {}

  public add(token: Token): void {
    this.tokens.push(token);
  }

  public format(indentationValue: string): string {
    let result = indentationValue.repeat(this.indentationLevel);

    function append(value: string): void {
      if (value.trim() || result.trim()) {
        result += value;
      }
    }

    for (const token of this.tokens) {
      switch (token.kind) {
        case TokenKind.VersionKeyword:
        case TokenKind.WorkflowKeyword:
        case TokenKind.ActionKeyword:
        case TokenKind.OnKeyword:
        case TokenKind.ResolvesKeyword:
        case TokenKind.UsesKeyword:
        case TokenKind.NeedsKeyword:
        case TokenKind.RunsKeyword:
        case TokenKind.ArgsKeyword:
        case TokenKind.EnvKeyword:
        case TokenKind.SecretsKeyword:
        case TokenKind.Equal:
        case TokenKind.Identifier:
        case TokenKind.IntegerLiteral:
        case TokenKind.StringLiteral:
        case TokenKind.Unrecognized:
        case TokenKind.Comment:
        case TokenKind.LeftCurlyBracket:
        case TokenKind.LeftSquareBracket:
        case TokenKind.RightCurlyBracket:
        case TokenKind.RightSquareBracket: {
          append(" ");
          append(token.text);
          break;
        }
        case TokenKind.Comma: {
          append(token.text);
          break;
        }
        default: {
          throw new Error(`Unexpected token kind '${token.kind}'`);
        }
      }
    }

    return result.trimRight();
  }
}
