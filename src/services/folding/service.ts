/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { IConnection, TextDocuments, FoldingRangeKind, FoldingRange } from "vscode-languageserver";
import { Compilation } from "../../util/compilation";
import { LanguageService } from "../../server";

export class FoldingService implements LanguageService {
  public activate(connection: IConnection, documents: TextDocuments): void {
    connection.onFoldingRanges(params => {
      const document = documents.get(params.textDocument.uri);
      if (!document) {
        return [];
      }

      const compilation = new Compilation(document.getText());
      return compilation.syntax.blocks.map(block => {
        const start = block.openBracket.range.start;
        const end = block.closeBracket.range.end;
        return FoldingRange.create(start.line, end.line, start.column, end.column, FoldingRangeKind.Region);
      });
    });
  }

  public dispose(): void {}
}
