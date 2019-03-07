/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { Diagnostic, DiagnosticBag } from "./diagnostics";
import { scanText } from "../scanning/scanner";
import { Token } from "../scanning/tokens";
import { DocumentSyntax } from "../parsing/syntax-nodes";
import { parseTokens } from "../parsing/parser";
import { BoundDocument } from "../binding/bound-nodes";
import { bindDocument } from "../binding/binder";
import { SecretsAnalyzer } from "../binding/visitors/secrets-analyzer";
import { ActionsAnalyzer } from "../binding/visitors/actions-analyzer";

export class Compilation {
  private readonly bag: DiagnosticBag;
  private readonly tokens: ReadonlyArray<Token>;
  private readonly syntax: DocumentSyntax;
  private readonly document: BoundDocument;

  public constructor(public readonly text: string) {
    this.bag = new DiagnosticBag();
    this.tokens = scanText(text, this.bag);
    this.syntax = parseTokens(this.tokens, this.bag);
    this.document = bindDocument(this.syntax, this.bag);

    new ActionsAnalyzer(this.document, this.bag);
    new SecretsAnalyzer(this.document, this.bag);
  }

  public get diagnostics(): ReadonlyArray<Diagnostic> {
    return this.bag.diagnostics;
  }
}
