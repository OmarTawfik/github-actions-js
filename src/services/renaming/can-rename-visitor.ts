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
import { rangeContains, TextPosition, TextRange } from "../../scanning/tokens";

interface CanRenameVisitorResult {
  readonly range: TextRange;
  readonly value: string;
}

export class CanRenameVisitor extends BoundNodeVisitor {
  private found: CanRenameVisitorResult | undefined;

  public constructor(document: BoundDocument, private readonly position: TextPosition) {
    super();
    this.visit(document);
  }

  public get result(): CanRenameVisitorResult | undefined {
    return this.found;
  }

  protected visitWorkflow(node: BoundWorkflow): void {
    if (rangeContains(node.syntax.name.range, this.position)) {
      this.found = {
        value: node.name,
        range: node.syntax.name.range,
      };
    }
    super.visitWorkflow(node);
  }

  protected visitAction(node: BoundAction): void {
    if (rangeContains(node.syntax.name.range, this.position)) {
      this.found = {
        value: node.name,
        range: node.syntax.name.range,
      };
    }
    super.visitAction(node);
  }

  protected visitResolves(node: BoundResolves): void {
    node.actions.forEach(action => {
      if (rangeContains(action.syntax.range, this.position)) {
        this.found = {
          value: action.value,
          range: action.syntax.range,
        };
      }
    });
    super.visitResolves(node);
  }

  protected visitNeeds(node: BoundNeeds): void {
    node.actions.forEach(action => {
      if (rangeContains(action.syntax.range, this.position)) {
        this.found = {
          value: action.value,
          range: action.syntax.range,
        };
      }
    });
    super.visitNeeds(node);
  }

  protected visitDefault(node: BaseBoundNode): void {
    if (!this.found) {
      super.visitDefault(node);
    }
  }
}
