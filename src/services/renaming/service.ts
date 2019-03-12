/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { IConnection, TextDocuments, TextEdit, ServerCapabilities } from "vscode-languageserver";
import { Compilation } from "../../util/compilation";
import { LanguageService } from "../../server";
import { CanRenameVisitor } from "./can-rename-visitor";
import { GetRenamesVisitor } from "./get-renames-visitor";

export class RenamingService implements LanguageService {
  public fillCapabilities(capabilities: ServerCapabilities): void {
    capabilities.renameProvider = true;
  }

  public activate(connection: IConnection, documents: TextDocuments): void {
    connection.onPrepareRename(params => {
      const document = documents.get(params.textDocument.uri);
      if (!document) {
        return null;
      }

      const compilation = new Compilation(document.getText());
      const canRename = new CanRenameVisitor(compilation.document, {
        line: params.position.line,
        column: params.position.character,
      });

      if (!canRename.result) {
        return null;
      }

      const { start, end } = canRename.result.range;
      return {
        placeholder: canRename.result.value,
        range: {
          start: {
            line: start.line,
            character: start.column,
          },
          end: {
            line: end.line,
            character: end.column,
          },
        },
      };
    });

    connection.onRenameRequest(params => {
      const document = documents.get(params.textDocument.uri);
      if (!document) {
        return;
      }

      const compilation = new Compilation(document.getText());
      const canRename = new CanRenameVisitor(compilation.document, {
        line: params.position.line,
        column: params.position.character,
      });

      if (!canRename.result) {
        return;
      }

      const getRenames = new GetRenamesVisitor(compilation.document, canRename.result.value);
      return {
        changes: {
          [document.uri]: getRenames.result.map(range =>
            TextEdit.replace(
              {
                start: {
                  line: range.start.line,
                  character: range.start.column + 1,
                },
                end: {
                  line: range.end.line,
                  character: range.end.column - 1,
                },
              },
              params.newName,
            ),
          ),
        },
      };
    });
  }
}
