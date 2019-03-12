/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { BoundNodeVisitor } from "../../binding/bound-node-visitor";
import { BoundWorkflow, BoundAction, BoundDocument, BoundResolves, BoundNeeds } from "../../binding/bound-nodes";
import { Range } from "vscode-languageserver-types";

export class GetRenamesVisitor extends BoundNodeVisitor {
  private readonly ranges = Array<Range>();

  public constructor(document: BoundDocument, private readonly value: string) {
    super();
    this.visit(document);
  }

  public get result(): ReadonlyArray<Range> {
    return this.ranges;
  }

  protected visitWorkflow(node: BoundWorkflow): void {
    this.check(node.name, node.syntax.name.range);
    super.visitWorkflow(node);
  }

  protected visitAction(node: BoundAction): void {
    this.check(node.name, node.syntax.name.range);
    super.visitAction(node);
  }

  protected visitResolves(node: BoundResolves): void {
    node.actions.forEach(action => this.check(action.value, action.syntax.range));
    super.visitResolves(node);
  }

  protected visitNeeds(node: BoundNeeds): void {
    node.actions.forEach(action => this.check(action.value, action.syntax.range));
    super.visitNeeds(node);
  }

  private check(value: string, range: Range): void {
    if (value === this.value) {
      this.ranges.push(range);
    }
  }
}
