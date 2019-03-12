/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import {
  createConnection,
  TextDocuments,
  IPCMessageReader,
  IPCMessageWriter,
  IConnection,
  Disposable,
} from "vscode-languageserver";
import { DiagnosticsService } from "./services/diagnostics/service";
import { FoldingService } from "./services/folding/service";
import { RenamingService } from "./services/renaming/service";

export interface LanguageService extends Disposable {
  activate(connection: IConnection, documents: TextDocuments): void;
}

const connection = createConnection(new IPCMessageReader(process), new IPCMessageWriter(process));
const documents: TextDocuments = new TextDocuments();

const services: ReadonlyArray<LanguageService> = [
  new DiagnosticsService(),
  new FoldingService(),
  new RenamingService(),
];

services.forEach(service => {
  service.activate(connection, documents);
});

connection.onInitialize(() => {
  return {
    capabilities: {
      textDocumentSync: documents.syncKind,
      foldingRangeProvider: true,
      renameProvider: true,
    },
  };
});

connection.onShutdown(() => {
  services.forEach(service => {
    service.dispose();
  });
});

documents.listen(connection);
connection.listen();
