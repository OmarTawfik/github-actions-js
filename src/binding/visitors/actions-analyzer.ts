/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { BoundNodeVisitor } from "../bound-node-visitor";
import { DiagnosticBag } from "../../util/diagnostics";
import { BoundDocument, BoundAction } from "../bound-nodes";
import { MAXIMUM_SUPPORTED_ACTIONS } from "../../util/constants";

export class ActionsAnalyzer extends BoundNodeVisitor {
  private exceededMaximum = false;
  private allActions = new Set<string>();

  private constructor(document: BoundDocument, private readonly bag: DiagnosticBag) {
    super();
    this.visit(document);
  }

  public static analyze(document: BoundDocument, bag: DiagnosticBag): void {
    new ActionsAnalyzer(document, bag);
  }

  protected visitAction(node: BoundAction): void {
    if (this.allActions.has(node.name)) {
      this.bag.duplicateActions(node.name, node.syntax.name.range);
    } else {
      this.allActions.add(node.name);
    }

    if (!this.exceededMaximum && this.allActions.size > MAXIMUM_SUPPORTED_ACTIONS) {
      this.bag.tooManyActions(node.syntax.name.range);
      this.exceededMaximum = true;
    }

    super.visitAction(node);
  }
}
