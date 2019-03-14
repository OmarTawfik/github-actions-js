/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { Range, Position, TextDocument } from "vscode-languageserver-types";

function before(first: Position, second: Position): boolean {
  if (first.line < second.line) {
    return true;
  }
  if (first.line > second.line) {
    return false;
  }
  return first.character < second.character;
}

export function comparePositions(first: Position, second: Position): number {
  if (first.line < second.line) {
    return -1;
  }
  if (first.line > second.line) {
    return 1;
  }
  return first.character - second.character;
}

export function rangeContains(range: Range, position: Position): boolean {
  return before(range.start, position) && before(position, range.end);
}

export function indexToPosition(text: string, index: number): Position {
  const document = TextDocument.create("", "", 1, text);
  return document.positionAt(index);
}
