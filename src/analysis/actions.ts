/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { DiagnosticBag } from "../util/diagnostics";
import { BoundDocument } from "../binding/bound-nodes";

export function analyzeActions(document: BoundDocument, bag: DiagnosticBag): void {
  const actions = new Set<string>(document.actions.map(action => action.name));

  document.workflows.forEach(parent => {
    if (parent.resolves) {
      const localActions = new Set<string>();
      parent.resolves.actions.forEach(action => {
        if (!actions.has(action.value)) {
          bag.actionDoesNotExist(action.value, action.syntax.range);
        }
        if (localActions.has(action.value)) {
          bag.duplicateActions(action.value, action.syntax.range);
        } else {
          localActions.add(action.value);
        }
      });
    }
  });

  document.actions.forEach(parent => {
    if (parent.needs) {
      const localActions = new Set<string>();
      parent.needs.actions.forEach(action => {
        if (!actions.has(action.value)) {
          bag.actionDoesNotExist(action.value, action.syntax.range);
        }

        if (localActions.has(action.value)) {
          bag.duplicateActions(action.value, action.syntax.range);
        } else {
          localActions.add(action.value);
        }
      });
    }
  });
}
