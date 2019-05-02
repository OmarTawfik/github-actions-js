/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { DiagnosticBag } from "./diagnostics";
import { Token } from "../scanning/tokens";
import { DocumentSyntax } from "../parsing/syntax-nodes";
import { BoundDocument } from "../binding/bound-nodes";
import { analyzeCircularDependencies } from "../analysis/circular-dependencies";
import { analyzeSecrets } from "../analysis/secrets";
import { analyzeBlocks } from "../analysis/blocks";
import { analyzeActions } from "../analysis/actions";
import { Range, Position, Diagnostic } from "vscode-languageserver-types";
import { rangeContains } from "./ranges";
import { Scanner } from "../scanning/scanner";
import { Parser } from "../parsing/parser";
import { Binder } from "../binding/binder";

export interface ActionSymbol {
  readonly name: string;
  readonly range: Range;
  readonly references: ReadonlyArray<Range>;
}

export class Compilation {
  private readonly bag: DiagnosticBag;

  private lazyActions: Map<string, ActionSymbol> | undefined;

  public readonly tokens: ReadonlyArray<Token>;
  public readonly syntax: DocumentSyntax;
  public readonly document: BoundDocument;

  public constructor(public readonly text: string) {
    this.bag = new DiagnosticBag();

    this.tokens = new Scanner(text, this.bag).result;
    this.syntax = new Parser(this.tokens, this.bag).result;
    this.document = new Binder(this.syntax, this.bag).result;

    analyzeActions(this.document, this.bag);
    analyzeBlocks(this.document, this.bag);
    analyzeCircularDependencies(this.document, this.bag);
    analyzeSecrets(this.document, this.bag);
  }

  public get diagnostics(): ReadonlyArray<Diagnostic> {
    return this.bag.diagnostics;
  }

  public get actions(): ReadonlyMap<string, ActionSymbol> {
    if (!this.lazyActions) {
      this.lazyActions = new Map<string, ActionSymbol>();

      for (const node of this.document.actions) {
        const references = Array<Range>();

        this.document.actions.forEach(action => {
          if (action.needs) {
            action.needs.actions.forEach(reference => {
              if (reference.value === node.name) {
                references.push(reference.syntax.range);
              }
            });
          }
        });

        this.document.workflows.forEach(workflow => {
          if (workflow.resolves) {
            workflow.resolves.actions.forEach(reference => {
              if (reference.value === node.name) {
                references.push(reference.syntax.range);
              }
            });
          }
        });

        this.lazyActions.set(node.name, {
          references,
          name: node.name,
          range: node.syntax.name.range,
        });
      }
    }

    return this.lazyActions;
  }

  public getTargetAt(
    position: Position,
  ):
    | {
        name: string;
        range: Range;
      }
    | undefined {
    for (const action of this.actions.values()) {
      if (rangeContains(action.range, position)) {
        return {
          name: action.name,
          range: action.range,
        };
      }

      for (const reference of action.references) {
        if (rangeContains(reference, position)) {
          return {
            name: action.name,
            range: reference,
          };
        }
      }
    }

    return undefined;
  }
}
