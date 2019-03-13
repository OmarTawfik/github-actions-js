/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { Compilation } from "../src/util/compilation";
import { highlight } from "../src/util/highlight-range";
import { Position } from "vscode-languageserver-types";
import { indexToPosition } from "../src/util/ranges";

export const TEST_MARKER = "$$";

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
      return from.character - to.character;
    }
    return from.line - to.line;
  });

  return expect(
    ["", ...actual.map(diagnostic => `ERROR: ${diagnostic.message}\n${highlight(diagnostic.range, text)}`), ""].join(
      "\n",
    ),
  );
}

export function getMarkerPosition(
  text: string,
): {
  newText: string;
  position: Position;
} {
  const index = text.indexOf(TEST_MARKER);
  if (index < 0) {
    throw new Error(`Cannot find marker in text`);
  }

  const newText = text.replace(TEST_MARKER, "");
  if (newText.indexOf(TEST_MARKER) >= 0) {
    throw new Error(`More than one marker exists in text`);
  }

  return {
    newText,
    position: indexToPosition(newText, index),
  };
}
