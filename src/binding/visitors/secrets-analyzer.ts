/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { BoundNodeVisitor } from "../bound-node-visitor";
import { DiagnosticBag } from "../../util/diagnostics";
import { BoundSecrets, BoundDocument } from "../bound-nodes";
import { MAXIMUM_SUPPORTED_SECRETS } from "../../util/constants";

export class SecretsAnalyzer extends BoundNodeVisitor {
  private allSecrets = new Set<string>();
  private exceededMaximum = false;

  public constructor(document: BoundDocument, private readonly bag: DiagnosticBag) {
    super();
    this.visit(document);
  }

  protected visitSecrets(node: BoundSecrets): void {
    if (!this.exceededMaximum) {
      for (const arg of node.args) {
        this.allSecrets.add(arg);
        if (this.allSecrets.size > MAXIMUM_SUPPORTED_SECRETS) {
          this.bag.tooManySecrets(node.syntax.key.range);
          this.exceededMaximum = true;
          break;
        }
      }
    }

    const localSecrets = new Set<string>();
    for (const arg of node.args) {
      if (localSecrets.has(arg)) {
        this.bag.duplicateSecrets(arg, node.syntax.key.range);
        break;
      } else {
        localSecrets.add(arg);
      }
    }

    super.visitSecrets(node);
  }
}
