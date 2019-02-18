/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { Diagnostic, DiagnosticBag } from "./diagnostics";
import { scanText } from "../scanning/scanner";
import { Token } from "../scanning/tokens";

export class Compilation {
  private readonly bag: DiagnosticBag;

  public constructor(public readonly text: string) {
    this.bag = new DiagnosticBag();
    this.tokens = scanText(text, this.bag);
  }

  public get diagnostics(): ReadonlyArray<Diagnostic> {
    return this.bag.diagnostics;
  }

  public readonly tokens: ReadonlyArray<Token>;
}
