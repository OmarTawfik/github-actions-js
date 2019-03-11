/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { BoundNodeVisitor } from "../binding/bound-node-visitor";
import { DiagnosticBag } from "../util/diagnostics";
import { BoundDocument, BoundResolves, BoundSecrets, BoundOn, BoundEnv } from "../binding/bound-nodes";
import { MAXIMUM_SUPPORTED_SECRETS } from "../util/constants";
import * as webhooks from "@octokit/webhooks-definitions";

export function analyzeProperties(document: BoundDocument, actions: ReadonlySet<string>, bag: DiagnosticBag): void {
  new PropertiesAnalyzer(document, actions, bag);
}

class PropertiesAnalyzer extends BoundNodeVisitor {
  private exceededMaximum = false;
  private allSecrets = new Set<string>();

  public constructor(
    document: BoundDocument,
    private readonly actions: ReadonlySet<string>,
    private readonly bag: DiagnosticBag,
  ) {
    super();
    this.visit(document);
  }

  protected visitResolves(node: BoundResolves): void {
    for (const action of node.actions) {
      if (!this.actions.has(action.value)) {
        this.bag.actionDoesNotExist(action.value, action.syntax.range);
      }
    }
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
        this.allSecrets.add(secret.value);
        if (this.allSecrets.size > MAXIMUM_SUPPORTED_SECRETS) {
          this.bag.tooManySecrets(secret.syntax.range);
          this.exceededMaximum = true;
          break;
        }
      }
    }
  }

  protected visitOn(node: BoundOn): void {
    if (node.event && !webhooks.some(definition => definition.name === node.event!.value)) {
      this.bag.unrecognizedEvent(node.event.value, node.event.syntax.range);
    }
  }

  protected visitEnv(node: BoundEnv): void {
    for (const variable of node.variables) {
      if (variable.name.startsWith("GITHUB_")) {
        this.bag.reservedEnvironmentVariable(variable.syntax.name.range);
      }
    }
  }
}
