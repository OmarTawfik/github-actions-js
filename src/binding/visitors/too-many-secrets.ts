/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { BoundNodeVisitor } from "../bound-node-visitor";
import { DiagnosticBag } from "../../util/diagnostics";
import { BoundSecrets, BoundDocument } from "../bound-nodes";
import { MAXIMUM_SUPPORTED_SECRETS } from "../../util/constants";

export class TooManySecretsVisitor extends BoundNodeVisitor {
  private definedAlready = new Set<string>();
  private alreadyReported = false;

  public constructor(document: BoundDocument, private readonly bag: DiagnosticBag) {
    super();
    this.visit(document);
  }

  protected visitSecrets(node: BoundSecrets): void {
    if (!this.alreadyReported) {
      for (const arg of node.args) {
        this.definedAlready.add(arg);
        if (this.definedAlready.size > MAXIMUM_SUPPORTED_SECRETS) {
          this.bag.tooManySecrets(node.syntax.key.range);
          this.alreadyReported = true;
          break;
        }
      }
    }

    super.visitSecrets(node);
  }
}
