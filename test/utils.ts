/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { Compilation } from "../src/util/compilation";
import { highlight } from "../src/util/highlight-range";

export function expectDiagnostics(text: string): jest.Matchers<string> {
  const compilation = new Compilation(text);

  if (!compilation.diagnostics.length) {
    return expect("");
  }

  const actual = Array(...compilation.diagnostics);
  actual.sort((a, b) => {
    const from = a.range.start;
    const to = b.range.start;
    if (from.line === to.line) {
      return from.column - to.column;
    }
    return from.line - to.line;
  });

  return expect(
    ["", ...actual.map(diagnostic => `ERROR: ${diagnostic.message}\n${highlight(diagnostic.range, text)}`), ""].join(
      "\n",
    ),
  );
}
