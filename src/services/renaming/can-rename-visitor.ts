/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { BoundNodeVisitor } from "../../binding/bound-node-visitor";
import {
  BoundWorkflow,
  BoundAction,
  BaseBoundNode,
  BoundDocument,
  BoundResolves,
  BoundNeeds,
} from "../../binding/bound-nodes";
import { Range, Position } from "vscode-languageserver-types";
import { rangeContains } from "../../util/ranges";

interface CanRenameVisitorResult {
  readonly range: Range;
  readonly placeholder: string;
}

export class CanRenameVisitor extends BoundNodeVisitor {
  private found: CanRenameVisitorResult | undefined;

  public constructor(document: BoundDocument, private readonly position: Position) {
    super();
    this.visit(document);
  }

  public get result(): CanRenameVisitorResult | undefined {
    return this.found;
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

  protected visitDefault(node: BaseBoundNode): void {
    if (!this.found) {
      super.visitDefault(node);
    }
  }

  private check(placeholder: string, range: Range): void {
    if (rangeContains(range, this.position)) {
      this.found = { placeholder, range };
    }
  }
}
