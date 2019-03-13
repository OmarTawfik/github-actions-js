/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { BoundDocument } from "../binding/bound-nodes";
import { DiagnosticBag } from "../util/diagnostics";
import { MAXIMUM_SUPPORTED_SECRETS } from "../util/constants";

export function analyzeSecrets(document: BoundDocument, bag: DiagnosticBag): void {
  const allSecrets = new Set<string>();

  document.actions.forEach(action => {
    if (!action.secrets) {
      return;
    }

    const localSecrets = new Set<string>();
    action.secrets.secrets.forEach(secret => {
      if (localSecrets.has(secret.value)) {
        bag.duplicateSecrets(secret.value, secret.syntax.range);
      } else {
        localSecrets.add(secret.value);
      }

      if (!allSecrets.has(secret.value)) {
        if (allSecrets.size === MAXIMUM_SUPPORTED_SECRETS) {
          bag.tooManySecrets(secret.syntax.range);
        }
        allSecrets.add(secret.value);
      }
    });
  });
}
