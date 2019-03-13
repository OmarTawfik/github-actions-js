/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { BoundDocument, BoundStringValue } from "../binding/bound-nodes";
import { DiagnosticBag } from "../util/diagnostics";
import { Range } from "vscode-languageserver-types";

export function analyzeCircularDependencies(document: BoundDocument, bag: DiagnosticBag): void {
  const dependencies = new Map<string, ReadonlyArray<BoundStringValue>>();

  document.actions.forEach(action => {
    if (action.needs) {
      dependencies.set(action.name, action.needs.actions);
    } else {
      dependencies.set(action.name, []);
    }

    check(action.name, action.syntax.name.range, new Set<string>());
  });

  function check(action: string, range: Range, visited: Set<string>): boolean {
    if (visited.has(action)) {
      bag.circularDependency(action, range);
      return true;
    }

    visited.add(action);

    const entry = dependencies.get(action);
    if (entry) {
      for (const dependency of entry) {
        if (check(dependency.value, dependency.syntax.range, visited)) {
          return true;
        }
      }
    }

    visited.delete(action);
    return false;
  }
}
