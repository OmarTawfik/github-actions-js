/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { IConnection, TextDocuments, Range, Diagnostic } from "vscode-languageserver";
import { Compilation } from "../../util/compilation";
import { LanguageService } from "../../server";

export class DiagnosticsService implements LanguageService {
  public activate(connection: IConnection, documents: TextDocuments): void {
    connection.onDidOpenTextDocument(params => {
      connection.sendDiagnostics({
        uri: params.textDocument.uri,
        diagnostics: this.provideDiagnostics(params.textDocument.text),
      });
    });

    documents.onDidChangeContent(params => {
      connection.sendDiagnostics({
        uri: params.document.uri,
        diagnostics: this.provideDiagnostics(params.document.getText()),
      });
    });

    connection.onDidCloseTextDocument(params => {
      connection.sendDiagnostics({
        uri: params.textDocument.uri,
        diagnostics: [],
      });
    });
  }

  private provideDiagnostics(text: string): Diagnostic[] {
    const compilation = new Compilation(text);
    return compilation.diagnostics.map(diagnostic => {
      const { start, end } = diagnostic.range;
      const range = Range.create(start.line, start.column, end.line, end.column);
      return Diagnostic.create(range, diagnostic.message);
    });
  }
}
