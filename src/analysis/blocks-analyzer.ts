/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { BoundNodeVisitor } from "../binding/bound-node-visitor";
import { DiagnosticBag } from "../util/diagnostics";
import { BoundDocument, BoundAction, BoundWorkflow, BoundStringValue } from "../binding/bound-nodes";
import { MAXIMUM_SUPPORTED_ACTIONS } from "../util/constants";
import { TextRange } from "../scanning/tokens";

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
  private actionsExceededMaximum = false;
  private circularDependenciesFound = false;
  private readonly dependencies = new Map<string, ReadonlyArray<BoundStringValue>>();

  public readonly workflows = new Set<string>();
  public readonly actions = new Set<string>();

  public constructor(document: BoundDocument, private readonly bag: DiagnosticBag) {
    super();
    this.visit(document);
  }

  protected visitAction(node: BoundAction): void {
    if (this.actions.has(node.name) || this.workflows.has(node.name)) {
      this.bag.duplicateBlock(node.name, node.syntax.name.range);
    } else {
      this.actions.add(node.name);
    }

    if (!this.actionsExceededMaximum && this.actions.size > MAXIMUM_SUPPORTED_ACTIONS) {
      this.bag.tooManyActions(node.syntax.name.range);
      this.actionsExceededMaximum = true;
    }

    if (node.needs) {
      this.dependencies.set(node.name, node.needs.actions);
    } else {
      this.dependencies.set(node.name, []);
    }

    this.checkCircularDependencies(node.name, node.syntax.name.range, new Set<string>());
  }

  protected visitWorkflow(node: BoundWorkflow): void {
    if (this.actions.has(node.name) || this.workflows.has(node.name)) {
      this.bag.duplicateBlock(node.name, node.syntax.name.range);
    } else {
      this.workflows.add(node.name);
    }
  }

  private checkCircularDependencies(action: string, range: TextRange, visited: Set<string>): void {
    if (this.circularDependenciesFound) {
      return;
    }

    if (visited.has(action)) {
      this.circularDependenciesFound = true;
      this.bag.circularDependency(action, range);
      return;
    }

    visited.add(action);

    const dependencies = this.dependencies.get(action);
    if (dependencies) {
      for (const dependency of dependencies) {
        this.checkCircularDependencies(dependency.value, dependency.syntax.range, visited);
      }
    }

    visited.delete(action);
  }
}
