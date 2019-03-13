/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { IConnection, TextDocuments, TextEdit, Range, ServerCapabilities } from "vscode-languageserver";
import { LanguageService } from "../server";
import { accessCache } from "../util/cache";

export class RenamingService implements LanguageService {
  public fillCapabilities(capabilities: ServerCapabilities): void {
    capabilities.renameProvider = {
      prepareProvider: true,
    };
  }

  public activate(connection: IConnection, documents: TextDocuments): void {
    connection.onPrepareRename(params => {
      const { uri } = params.textDocument;
      const compilation = accessCache(documents, uri);

      const target = compilation.getTargetAt(params.position);
      if (!target) {
        return undefined;
      }

      return {
        placeholder: target.name,
        range: target.range,
      };
    });

    connection.onRenameRequest(params => {
      const { uri } = params.textDocument;
      const compilation = accessCache(documents, uri);

      const target = compilation.getTargetAt(params.position);
      if (!target) {
        return undefined;
      }

      const action = compilation.actions.get(target.name);
      if (!action) {
        return undefined;
      }

      return {
        changes: {
          [uri]: [action.range, ...action.references].map(range => {
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
