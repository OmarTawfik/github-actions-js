/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { IConnection, TextDocuments, TextEdit, Range, ServerCapabilities } from "vscode-languageserver";
import { LanguageService } from "../../server";
import { CanRenameVisitor } from "./can-rename-visitor";
import { GetRenamesVisitor } from "./get-renames-visitor";
import { accessCache } from "../cache";

export class RenamingService implements LanguageService {
  public fillCapabilities(capabilities: ServerCapabilities): void {
    capabilities.renameProvider = true;
  }

  public activate(connection: IConnection, documents: TextDocuments): void {
    connection.onPrepareRename(params => {
      const { uri } = params.textDocument;
      const compilation = accessCache(documents, uri);

      const canRename = new CanRenameVisitor(compilation.document, params.position);
      return canRename.result;
    });

    connection.onRenameRequest(params => {
      const { uri } = params.textDocument;
      const compilation = accessCache(documents, uri);

      const canRename = new CanRenameVisitor(compilation.document, params.position);
      if (!canRename.result) {
        return;
      }

      const getRenames = new GetRenamesVisitor(compilation.document, canRename.result.placeholder);
      return {
        changes: {
          [uri]: getRenames.result.map(range => {
            const { start, end } = range;
            return TextEdit.replace(
              Range.create(start.line, start.character + 1, end.line, end.character - 1),
              params.newName,
            );
          }),
        },
      };
    });
  }
}
