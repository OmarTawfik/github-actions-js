/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { Diagnostic, DiagnosticBag } from "./diagnostics";
import { scanText } from "../scanning/scanner";
import { Token } from "../scanning/tokens";
import { DocumentSyntax } from "../parsing/syntax-nodes";
import { parseTokens } from "../parsing/parser";

export class Compilation {
  private readonly bag: DiagnosticBag;
  private readonly tokens: ReadonlyArray<Token>;
  private readonly syntax: DocumentSyntax;

  public constructor(public readonly text: string) {
    this.bag = new DiagnosticBag();
    this.tokens = scanText(text, this.bag);
    this.syntax = parseTokens(this.tokens, this.bag);

    if (this.syntax) {
      // TODO: binding
    }
  }

  public get diagnostics(): ReadonlyArray<Diagnostic> {
    return this.bag.diagnostics;
  }
}
