/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { TextRange } from "../scanning/tokens";

export const enum DiagnosticCode {
  // Scanning
  UnrecognizedCharacter = 1,
  UnterminatedStringLiteral = 2,
  UnsupportedEscapeSequence = 3,
}

export interface Diagnostic {
  readonly code: DiagnosticCode;
  readonly message: string;
  readonly range: TextRange;
}

export class DiagnosticBag {
  private readonly items: Diagnostic[];

  public constructor() {
    this.items = [];
  }

  public get diagnostics(): ReadonlyArray<Diagnostic> {
    return this.items;
  }

  public unrecognizedCharacter(character: string, range: TextRange): void {
    this.items.push({
      range,
      code: DiagnosticCode.UnrecognizedCharacter,
      message: `The character '${character}' is unrecognizable.`,
    });
  }

  public unterminatedStringLiteral(range: TextRange): void {
    this.items.push({
      range,
      code: DiagnosticCode.UnterminatedStringLiteral,
      message: `This string literal must end with double quotes.`,
    });
  }

  public unsupportedEscapeSequence(character: string, range: TextRange): void {
    this.items.push({
      range,
      code: DiagnosticCode.UnsupportedEscapeSequence,
      message: `The character '${character}' is not a supported escape sequence.`,
    });
  }
}
