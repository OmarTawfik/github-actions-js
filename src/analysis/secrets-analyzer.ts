/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { BoundNodeVisitor } from "../binding/bound-node-visitor";
import { DiagnosticBag } from "../util/diagnostics";
import { BoundSecrets, BoundDocument } from "../binding/bound-nodes";
import { MAXIMUM_SUPPORTED_SECRETS } from "../util/constants";

export function analyzeSecrets(document: BoundDocument, bag: DiagnosticBag): void {
  new SecretsAnalyzer(document, bag);
}

class SecretsAnalyzer extends BoundNodeVisitor {
  private exceededMaximum = false;
  private secrets = new Set<string>();

  public constructor(document: BoundDocument, private readonly bag: DiagnosticBag) {
    super();
    this.visit(document);
  }

  protected visitSecrets(node: BoundSecrets): void {
    const localSecrets = new Set<string>();
    for (const secret of node.secrets) {
      if (localSecrets.has(secret.value)) {
        this.bag.duplicateSecrets(secret.value, secret.syntax.range);
      } else {
        localSecrets.add(secret.value);
      }
    }

    if (!this.exceededMaximum) {
      for (const secret of node.secrets) {
        this.secrets.add(secret.value);
        if (this.secrets.size > MAXIMUM_SUPPORTED_SECRETS) {
          this.bag.tooManySecrets(secret.syntax.range);
          this.exceededMaximum = true;
          break;
        }
      }
    }

    super.visitSecrets(node);
  }
}
