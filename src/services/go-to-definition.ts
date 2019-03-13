/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { IConnection, TextDocuments, ServerCapabilities, Position, Location } from "vscode-languageserver";
import { LanguageService } from "../server";
import { accessCache } from "../util/cache";

export class GoToDefinitionService implements LanguageService {
  public fillCapabilities(capabilities: ServerCapabilities): void {
    capabilities.definitionProvider = true;
    capabilities.typeDefinitionProvider = true;
  }

  public activate(connection: IConnection, documents: TextDocuments): void {
    connection.onDefinition(params => {
      return getDefinitionRange(params.textDocument.uri, params.position);
    });

    connection.onTypeDefinition(params => {
      return getDefinitionRange(params.textDocument.uri, params.position);
    });

    function getDefinitionRange(uri: string, position: Position): Location | undefined {
      const compilation = accessCache(documents, uri);

      const target = compilation.getTargetAt(position);
      if (!target) {
        return undefined;
      }

      const action = compilation.actions.get(target.name);
      if (!action) {
        return undefined;
      }

      return Location.create(uri, action.range);
    }
  }
}
