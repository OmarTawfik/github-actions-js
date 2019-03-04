/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import * as path from "path";
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from "vscode-languageclient";

const LANGUAGE_NAME = "github-actions";

let client: LanguageClient | undefined;

export function activate(): void {
  const runOptions = {
    module: path.join(__dirname, "server.js"),
    transport: TransportKind.ipc,
  };

  const debugOptions = {
    ...runOptions,
    options: { execArgv: ["--nolazy", "--inspect=6009"] },
  };

  const serverOptions: ServerOptions = {
    run: runOptions,
    debug: debugOptions,
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: "file", language: LANGUAGE_NAME }],
  };

  client = new LanguageClient(LANGUAGE_NAME, `${LANGUAGE_NAME} client`, serverOptions, clientOptions);
  client.start();
}

export async function deactivate(): Promise<void> {
  if (client) {
    await client.stop();
  }
}
