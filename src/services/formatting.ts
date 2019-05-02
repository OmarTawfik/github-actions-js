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

      const { result } = new Formatter(compilation, indentationValue);
      const fullRange = Range.create(0, 0, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
      return [TextEdit.replace(fullRange, result)];
    });
  }
}

export class Formatter {
  private readonly lines = Array<string>();

  private indentationLevel = 0;
  private lastTokenAdded: Token | undefined;
  private currentLine = "";

  public readonly result: string;

  public constructor(compilation: Compilation, private readonly indentationValue: string) {
    compilation.syntax.commentsAfter.forEach(comment => {
      this.add(comment);
    });

    compilation.syntax.versions.forEach(version => {
      this.add(version.version);
      this.add(version.equal);
      this.add(version.integer);
    });

    compilation.syntax.blocks.forEach(block => {
      this.addBlockLikeSyntax({
        firstToken: block.type,
        secondToken: block.name,
        openBracket: block.openBracket,
        addBody: () => this.addProperties(block),
        closeBracket: block.closeBracket,
      });
    });

    this.addLineBreak(true);
    this.addLineBreak(true);
    this.result = this.lines.join("\n");
  }

  private addProperties(block: BlockSyntax): void {
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
      this.add(property.key);

      if (!property.key.commentAfter && !property.equal.commentsBefore) {
        this.currentLine += " ".repeat(longestKeyLength - property.key.text.length);
      }

      this.add(property.equal);
      this.add(property.value);
      this.addLineBreak();
    });

    arrays.forEach(property => {
      this.addBlockLikeSyntax({
        longestKeyLength,
        firstToken: property.key,
        secondToken: property.equal,
        openBracket: property.openBracket,
        addBody: () =>
          property.items.forEach(item => {
            this.add(item.value);
            this.add(item.comma, false);
            this.addLineBreak();
          }),
        closeBracket: property.closeBracket,
      });
    });

    objects.forEach(property => {
      this.addBlockLikeSyntax({
        longestKeyLength,
        firstToken: property.key,
        secondToken: property.equal,
        openBracket: property.openBracket,
        addBody: () => {
          const longestNameLength = Math.max(...property.members.map(member => member.name.text.length));
          property.members.forEach(member => {
            this.add(member.name);

            if (!member.name.commentAfter && !member.equal.commentsBefore) {
              this.currentLine += " ".repeat(longestNameLength - member.name.text.length);
            }

            this.add(member.equal);
            this.add(member.value);
            this.add(member.comma, false);
            this.addLineBreak();
          });
        },
        closeBracket: property.closeBracket,
      });
    });
  }

  private addBlockLikeSyntax(opts: {
    readonly longestKeyLength?: number;
    readonly firstToken: TokenWithTrivia;
    readonly secondToken: TokenWithTrivia;
    readonly openBracket: TokenWithTrivia;
    readonly addBody: Function;
    readonly closeBracket: TokenWithTrivia;
  }): void {
    this.addLineBreak(true);

    this.add(opts.firstToken);

    if (opts.longestKeyLength && !opts.firstToken.commentAfter && !opts.secondToken.commentsBefore) {
      this.currentLine += " ".repeat(opts.longestKeyLength - opts.firstToken.text.length);
    }

    this.indentationLevel += 1;

    this.add(opts.secondToken);
    this.add(opts.openBracket);
    this.addLineBreak();

    opts.addBody();
    this.addLineBreak();

    this.indentationLevel -= 1;
    this.add(opts.closeBracket);
    this.addLineBreak();
  }

  private addLineBreak(addEmpty: boolean = false): void {
    if (this.currentLine.length === 0) {
      if (!addEmpty || this.lines.length === 0 || this.lines[this.lines.length - 1].length === 0) {
        return;
      }

      if (this.lastTokenAdded) {
        switch (this.lastTokenAdded.kind) {
          case TokenKind.Comment:
          case TokenKind.LeftCurlyBracket:
          case TokenKind.LeftSquareBracket:
            return;
          default:
            break;
        }
      }
    }

    this.lines.push(this.currentLine);
    this.currentLine = "";
  }

  private add(token: TokenWithTrivia | undefined, addSpace: boolean = true): void {
    if (!token) {
      return;
    }

    if (token.kind === TokenKind.Missing) {
      throw new Error(PARSE_ERRORS_MESSAGE);
    }

    if (token.commentsBefore) {
      token.commentsBefore.forEach(comment => {
        this.add(comment);
        this.addLineBreak();
      });
    }

    if (this.currentLine.length === 0) {
      this.currentLine = this.indentationValue.repeat(this.indentationLevel);
    } else if (addSpace) {
      this.currentLine += " ";
    }

    this.currentLine += token.text;
    this.lastTokenAdded = token;

    if (token.commentAfter) {
      this.add(token.commentAfter);
      this.addLineBreak();
    }
  }
}
