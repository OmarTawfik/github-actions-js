/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { BoundDocument } from "../binding/bound-nodes";
import { DiagnosticBag } from "../util/diagnostics";
import { MAXIMUM_SUPPORTED_ACTIONS } from "../util/constants";

export function analyzeBlocks(document: BoundDocument, bag: DiagnosticBag): void {
  const definedBlocks = new Set<string>();

  document.actions.forEach(action => {
    if (definedBlocks.has(action.name)) {
      bag.duplicateBlock(action.name, action.syntax.name.range);
    } else {
      if (definedBlocks.size === MAXIMUM_SUPPORTED_ACTIONS) {
        bag.tooManyActions(action.syntax.name.range);
      }

      definedBlocks.add(action.name);
    }
  });

  document.workflows.forEach(workflow => {
    if (definedBlocks.has(workflow.name)) {
      bag.duplicateBlock(workflow.name, workflow.syntax.name.range);
    } else {
      definedBlocks.add(workflow.name);
    }
  });
}
