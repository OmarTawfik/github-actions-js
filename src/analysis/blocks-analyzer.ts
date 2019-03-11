/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { BoundNodeVisitor } from "../binding/bound-node-visitor";
import { DiagnosticBag } from "../util/diagnostics";
import { BoundDocument, BoundAction, BoundWorkflow } from "../binding/bound-nodes";
import { MAXIMUM_SUPPORTED_ACTIONS } from "../util/constants";

export function analyzeBlocks(
  document: BoundDocument,
  bag: DiagnosticBag,
): {
  workflows: ReadonlySet<string>;
  actions: ReadonlySet<string>;
} {
  const instance = new BlocksAnalyzer(document, bag);
  return {
    workflows: instance.workflows,
    actions: instance.actions,
  };
}

class BlocksAnalyzer extends BoundNodeVisitor {
  private readonly allWorkflows = new Set<string>();
  private readonly allActions = new Set<string>();
  private actionsExceededMaximum = false;

  public constructor(document: BoundDocument, private readonly bag: DiagnosticBag) {
    super();
    this.visit(document);
  }

  public get workflows(): ReadonlySet<string> {
    return this.allWorkflows;
  }

  public get actions(): ReadonlySet<string> {
    return this.allActions;
  }

  protected visitAction(node: BoundAction): void {
    if (this.allActions.has(node.name) || this.allWorkflows.has(node.name)) {
      this.bag.duplicateBlock(node.name, node.syntax.name.range);
    } else {
      this.allActions.add(node.name);
    }

    if (!this.actionsExceededMaximum && this.allActions.size > MAXIMUM_SUPPORTED_ACTIONS) {
      this.bag.tooManyActions(node.syntax.name.range);
      this.actionsExceededMaximum = true;
    }
  }

  protected visitWorkflow(node: BoundWorkflow): void {
    if (this.allActions.has(node.name) || this.allWorkflows.has(node.name)) {
      this.bag.duplicateBlock(node.name, node.syntax.name.range);
    } else {
      this.allWorkflows.add(node.name);
    }
  }
}
