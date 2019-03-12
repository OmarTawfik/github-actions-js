/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import * as LRU from "lru-cache";
import { Compilation } from "../util/compilation";
import { TextDocuments } from "vscode-languageserver";

interface Entry {
  readonly version: number;
  readonly compilation: Compilation;
}

const cache = new LRU<string, Entry>(10);

export function accessCache(documents: TextDocuments, uri: string, version?: number): Compilation {
  const entry = cache.get(uri);
  if (entry && entry.version === version) {
    return entry.compilation;
  }

  const document = documents.get(uri);
  if (!document) {
    return new Compilation("");
  }

  const compilation = new Compilation(document.getText());
  cache.set(uri, {
    compilation,
    version: document.version,
  });

  return compilation;
}
