/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { BoundNodeVisitor } from "../bound-node-visitor";
import { DiagnosticBag } from "../../util/diagnostics";
import { BoundDocument, BoundResolves } from "../bound-nodes";

export class ResolvesAnalyzer extends BoundNodeVisitor {
  private constructor(
    document: BoundDocument,
    private readonly actions: ReadonlySet<string>,
    private readonly bag: DiagnosticBag,
  ) {
    super();
    this.visit(document);
  }

  public static analyze(document: BoundDocument, actions: ReadonlySet<string>, bag: DiagnosticBag): void {
    new ResolvesAnalyzer(document, actions, bag);
  }

  protected visitResolves(node: BoundResolves): void {
    for (const action of node.actions) {
      if (!this.actions.has(action.value)) {
        this.bag.actionDoesNotExist(action.value, action.syntax.range);
      }
    }

    super.visitResolves(node);
  }
}
