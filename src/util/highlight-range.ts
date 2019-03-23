/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { Range } from "vscode-languageserver-types";

export const EOL_REGEX = /\r?\n/;

export function highlight(range: Range, text: string): string {
  if (range.start.line !== range.end.line) {
    throw new Error(`Cannot format a multi-line range`);
  }

  const result = Array<string>();

  const lines = text.split(EOL_REGEX);
  const { line, character: start } = range.start;
  const { character: end } = range.end;

  const firstLine = Math.max(0, line - 2);
  const lastLine = Math.min(line + 2, lines.length - 1);

  for (let i = firstLine; i <= lastLine; i += 1) {
    result.push(`${(i + 1).toString().padStart(3)} | ${lines[i]}`);
    if (i === line) {
      result.push(`    | ${"".padStart(start)}${"".padStart(end - start, "^")}`);
    }
  }

  return result.join("\n");
}
