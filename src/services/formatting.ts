/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { IConnection, TextDocuments, ServerCapabilities, TextEdit, Range } from "vscode-languageserver";
import { LanguageService } from "../server";
import { accessCache } from "../util/cache";
import { Compilation } from "../util/compilation";
import { TokenWithTrivia, Token, TokenKind } from "../scanning/tokens";
import {
  BlockSyntax,
  StringPropertySyntax,
  ArrayPropertySyntax,
  ObjectPropertySyntax,
  SyntaxKind,
} from "../parsing/syntax-nodes";
import { DiagnosticCode } from "../util/diagnostics";

const PARSE_ERRORS_MESSAGE = "Cannot format document with parsing errors.";

export class FormattingService implements LanguageService {
  public fillCapabilities(capabilities: ServerCapabilities): void {
    capabilities.documentFormattingProvider = true;
  }

  public activate(connection: IConnection, documents: TextDocuments): void {
    connection.onDocumentFormatting(params => {
      const { uri } = params.textDocument;
      const compilation = accessCache(documents, uri);

      if (compilation.diagnostics.some(d => (d.code as number) < DiagnosticCode.PARSING_ERRORS_MARK)) {
        connection.window.showErrorMessage(PARSE_ERRORS_MESSAGE);
        return [];
      }

      const { insertSpaces, tabSize } = params.options;
      const indentationValue = insertSpaces ? " ".repeat(tabSize) : "\t";

      const result = FormattingService.format(compilation, indentationValue);
      const fullRange = Range.create(0, 0, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
      return [TextEdit.replace(fullRange, result)];
    });
  }

  public static format(compilation: Compilation, indentationValue: string): string {
    const lines = Array<string>();
    let indentationLevel = 0;
    let lastTokenAdded: Token | undefined;
    let currentLine = "";

    compilation.syntax.commentsAfter.forEach(comment => {
      add(comment);
    });

    compilation.syntax.versions.forEach(version => {
      add(version.version);
      add(version.equal);
      add(version.integer);
    });

    compilation.syntax.blocks.forEach(block => {
      addBlockLikeSyntax({
        firstToken: block.type,
        secondToken: block.name,
        openBracket: block.openBracket,
        addBody: () => addProperties(block),
        closeBracket: block.closeBracket,
      });
    });

    addLineBreak(true);
    addLineBreak(true);
    return lines.join("\n");

    function addProperties(block: BlockSyntax): void {
      const strings = Array<StringPropertySyntax>();
      const arrays = Array<ArrayPropertySyntax>();
      const objects = Array<ObjectPropertySyntax>();

      block.properties.forEach(property => {
        switch (property.kind) {
          case SyntaxKind.StringProperty:
            strings.push(property as StringPropertySyntax);
            break;
          case SyntaxKind.ArrayProperty:
            arrays.push(property as ArrayPropertySyntax);
            break;
          case SyntaxKind.ObjectProperty:
            objects.push(property as ObjectPropertySyntax);
            break;
          default:
            throw new Error(`Syntax kind '${property.kind}' is not supported`);
        }
      });

      const longestKeyLength = Math.max(...block.properties.map(s => s.key.text.length));

      strings.forEach(property => {
        add(property.key);

        if (!property.key.commentAfter && !property.equal.commentsBefore) {
          currentLine += " ".repeat(longestKeyLength - property.key.text.length);
        }

        add(property.equal);
        add(property.value);
        addLineBreak();
      });

      arrays.forEach(property => {
        addBlockLikeSyntax({
          longestKeyLength,
          firstToken: property.key,
          secondToken: property.equal,
          openBracket: property.openBracket,
          addBody: () =>
            property.items.forEach(item => {
              add(item.value);
              add(item.comma, false);
              addLineBreak();
            }),
          closeBracket: property.closeBracket,
        });
      });

      objects.forEach(property => {
        addBlockLikeSyntax({
          longestKeyLength,
          firstToken: property.key,
          secondToken: property.equal,
          openBracket: property.openBracket,
          addBody: () => {
            const longestNameLength = Math.max(...property.members.map(member => member.name.text.length));
            property.members.forEach(member => {
              add(member.name);

              if (!member.name.commentAfter && !member.equal.commentsBefore) {
                currentLine += " ".repeat(longestNameLength - member.name.text.length);
              }

              add(member.equal);
              add(member.value);
              add(member.comma, false);
              addLineBreak();
            });
          },
          closeBracket: property.closeBracket,
        });
      });
    }

    function addBlockLikeSyntax(opts: {
      readonly longestKeyLength?: number;
      readonly firstToken: TokenWithTrivia;
      readonly secondToken: TokenWithTrivia;
      readonly openBracket: TokenWithTrivia;
      readonly addBody: Function;
      readonly closeBracket: TokenWithTrivia;
    }): void {
      addLineBreak(true);

      add(opts.firstToken);

      if (opts.longestKeyLength && !opts.firstToken.commentAfter && !opts.secondToken.commentsBefore) {
        currentLine += " ".repeat(opts.longestKeyLength - opts.firstToken.text.length);
      }

      indentationLevel += 1;

      add(opts.secondToken);
      add(opts.openBracket);
      addLineBreak();

      opts.addBody();
      addLineBreak();

      indentationLevel -= 1;
      add(opts.closeBracket);
      addLineBreak();
    }

    function addLineBreak(addEmpty: boolean = false): void {
      if (currentLine.length === 0) {
        if (!addEmpty || lines.length === 0 || lines[lines.length - 1].length === 0) {
          return;
        }

        if (lastTokenAdded) {
          switch (lastTokenAdded.kind) {
            case TokenKind.Comment:
            case TokenKind.LeftCurlyBracket:
            case TokenKind.LeftSquareBracket:
              return;
            default:
              break;
          }
        }
      }

      lines.push(currentLine);
      currentLine = "";
    }

    function add(token: TokenWithTrivia | undefined, addSpace: boolean = true): void {
      if (!token) {
        return;
      }

      if (token.kind === TokenKind.Missing) {
        throw new Error(PARSE_ERRORS_MESSAGE);
      }

      if (token.commentsBefore) {
        token.commentsBefore.forEach(comment => {
          add(comment);
          addLineBreak();
        });
      }

      if (currentLine.length === 0) {
        currentLine = indentationValue.repeat(indentationLevel);
      } else if (addSpace) {
        currentLine += " ";
      }

      currentLine += token.text;
      lastTokenAdded = token;

      if (token.commentAfter) {
        add(token.commentAfter);
        addLineBreak();
      }
    }
  }
}
