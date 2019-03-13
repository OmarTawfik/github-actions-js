/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { IConnection, TextDocuments, ServerCapabilities, Location } from "vscode-languageserver";
import { LanguageService } from "../server";
import { accessCache } from "../util/cache";

export class FindReferencesService implements LanguageService {
  public fillCapabilities(capabilities: ServerCapabilities): void {
    capabilities.referencesProvider = true;
  }

  public activate(connection: IConnection, documents: TextDocuments): void {
    connection.onReferences(params => {
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

      return action.references.map(range => Location.create(uri, range));
    });
  }
}
