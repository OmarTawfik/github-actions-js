/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { IConnection, TextDocuments, Diagnostic } from "vscode-languageserver";
import { LanguageService } from "../server";
import { accessCache } from "../util/cache";

export class DiagnosticsService implements LanguageService {
  public activate(connection: IConnection, documents: TextDocuments): void {
    connection.onDidOpenTextDocument(params => {
      const { uri, version } = params.textDocument;
      connection.sendDiagnostics({
        uri,
        diagnostics: provideDiagnostics(documents, uri, version),
      });
    });

    documents.onDidChangeContent(params => {
      const { uri, version } = params.document;
      connection.sendDiagnostics({
        uri: params.document.uri,
        diagnostics: provideDiagnostics(documents, uri, version),
      });
    });

    connection.onDidCloseTextDocument(params => {
      connection.sendDiagnostics({
        uri: params.textDocument.uri,
        diagnostics: [],
      });
    });

    function provideDiagnostics(documents: TextDocuments, uri: string, version: number): Diagnostic[] {
      const compilation = accessCache(documents, uri, version);
      return compilation.diagnostics.map(diagnostic => {
        return Diagnostic.create(diagnostic.range, diagnostic.message);
      });
    }
  }
}
