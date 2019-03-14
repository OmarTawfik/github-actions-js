/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import {
  createConnection,
  TextDocuments,
  IPCMessageReader,
  IPCMessageWriter,
  IConnection,
  ServerCapabilities,
} from "vscode-languageserver";
import { DiagnosticsService } from "./services/diagnostics";
import { FoldingService } from "./services/folding";
import { RenamingService } from "./services/renaming";
import { FindReferencesService } from "./services/find-references";
import { GoToDefinitionService } from "./services/go-to-definition";
import { FormattingService } from "./services/formatting";

export interface LanguageService {
  activate(connection: IConnection, documents: TextDocuments): void;
  fillCapabilities?(capabilities: ServerCapabilities): void;
  dispose?(): void;
}

const connection = createConnection(new IPCMessageReader(process), new IPCMessageWriter(process));
const documents: TextDocuments = new TextDocuments();

const services: ReadonlyArray<LanguageService> = [
  new DiagnosticsService(),
  new FindReferencesService(),
  new FoldingService(),
  new FormattingService(),
  new GoToDefinitionService(),
  new RenamingService(),
];

services.forEach(service => {
  service.activate(connection, documents);
});

connection.onInitialize(() => {
  const capabilities: ServerCapabilities = {
    textDocumentSync: documents.syncKind,
  };

  services.forEach(service => {
    if (service.fillCapabilities) {
      service.fillCapabilities(capabilities);
    }
  });

  return { capabilities };
});

connection.onShutdown(() => {
  services.forEach(service => {
    if (service.dispose) {
      service.dispose();
    }
  });
});

documents.listen(connection);
connection.listen();
