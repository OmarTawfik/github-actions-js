/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { Compilation, TextRange } from "../src";

function composeSnapshot(textLines: string[], range: TextRange, marker: string): string {
  const { start, end } = range;
  expect(start.line).toBe(end.line);
  const line = textLines[start.line];

  function underline(start: number, end: number, ch: string): string {
    const escapes = (line.substring(start, end).match(/[\\]/g) || []).length * 4;
    const escaped = (line.substring(start, end).match(/["]/g) || []).length * 2;
    return Array(end - start + 1 + escapes + escaped).join(ch);
  }

  return `${line}
${underline(0, start.column, " ")}${underline(start.column, end.column, "~")} ${marker} (line ${start.line})`;
}

export function expectDiagnostics(text: string): jest.Matchers<string> {
  const compilation = new Compilation(text);
  const lines = compilation.text.split(/\r?\n/);

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
    ["", ...actual.map(diagnostic => composeSnapshot(lines, diagnostic.range, diagnostic.message)), ""].join("\n"),
  );
}
