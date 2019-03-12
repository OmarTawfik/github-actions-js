/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { BoundNodeVisitor } from "../../binding/bound-node-visitor";
import { BoundWorkflow, BoundAction, BoundDocument, BoundResolves, BoundNeeds } from "../../binding/bound-nodes";
import { TextRange } from "../../scanning/tokens";

export class GetRenamesVisitor extends BoundNodeVisitor {
  private readonly ranges = Array<TextRange>();

  public constructor(document: BoundDocument, private readonly value: string) {
    super();
    this.visit(document);
  }

  public get result(): ReadonlyArray<TextRange> {
    return this.ranges;
  }

  protected visitWorkflow(node: BoundWorkflow): void {
    if (this.value === node.name) {
      this.ranges.push(node.syntax.name.range);
    }
    super.visitWorkflow(node);
  }

  protected visitAction(node: BoundAction): void {
    if (this.value === node.name) {
      this.ranges.push(node.syntax.name.range);
    }
    super.visitAction(node);
  }

  protected visitResolves(node: BoundResolves): void {
    node.actions.forEach(action => {
      if (this.value === action.value) {
        this.ranges.push(action.syntax.range);
      }
    });
    super.visitResolves(node);
  }

  protected visitNeeds(node: BoundNeeds): void {
    node.actions.forEach(action => {
      if (this.value === action.value) {
        this.ranges.push(action.syntax.range);
      }
    });
    super.visitNeeds(node);
  }
}
