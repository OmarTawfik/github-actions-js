/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { BoundNodeVisitor } from "../binding/bound-node-visitor";
import { DiagnosticBag } from "../util/diagnostics";
import {
  BoundDocument,
  BoundResolves,
  BoundSecrets,
  BoundOn,
  BoundEnv,
  BoundNeeds,
  BoundUses,
} from "../binding/bound-nodes";
import { MAXIMUM_SUPPORTED_SECRETS } from "../util/constants";
import * as webhooks from "@octokit/webhooks-definitions";

export function analyzeProperties(document: BoundDocument, actions: ReadonlySet<string>, bag: DiagnosticBag): void {
  new PropertiesAnalyzer(document, actions, bag);
}

module USES_REGEX {
  const ALPHA_NUM = `[a-zA-Z0-9]`;
  const ALPHA_NUM_DASH = `[a-zA-Z0-9-]`;

  const DOCKER_HOST_COMPONENT = `(${ALPHA_NUM}|(${ALPHA_NUM}${ALPHA_NUM_DASH}*${ALPHA_NUM}))`;
  const DOCKER_REGISTRY = `(${DOCKER_HOST_COMPONENT}(\\.${DOCKER_HOST_COMPONENT})*(:[0-9]+)?\\/)`;
  const DOCKER_PATH_COMPONENT = `(${ALPHA_NUM}+([._-]${ALPHA_NUM}+)*)`;
  const DOCKER_TAG = `(:[a-zA-Z0-9_]+)`;
  const DOCKER_DIGEST_ALGORITHM = `[A-Za-z]${ALPHA_NUM}*`;
  const DOCKER_DIGEST = `(@${DOCKER_DIGEST_ALGORITHM}([+.-_]${DOCKER_DIGEST_ALGORITHM})*:[a-fA-F0-9]+)`;
  const DOCKER_USES = `docker:\\/\\/${DOCKER_REGISTRY}?${DOCKER_PATH_COMPONENT}(\\/${DOCKER_PATH_COMPONENT})*(${DOCKER_TAG}|${DOCKER_DIGEST})?`;

  const LOCAL_USES = `\\.\\/.*`;

  const REMOTE_OWNER = `${ALPHA_NUM}+(${ALPHA_NUM_DASH}${ALPHA_NUM}+)*`;
  const REMOTE_REPO = `[a-zA-Z0-9-_.]+`;
  const REMOTE_USES = `${REMOTE_OWNER}\\/${REMOTE_REPO}\\/.*@.+`;

  const COMBINED = new RegExp(`^(${DOCKER_USES})|(${LOCAL_USES})|(${REMOTE_USES})$`);

  export function test(value: string): boolean {
    return COMBINED.test(value);
  }
}

class PropertiesAnalyzer extends BoundNodeVisitor {
  private readonly secrets = new Set<string>();
  private exceededMaximum = false;

  public constructor(
    document: BoundDocument,
    private readonly actions: ReadonlySet<string>,
    private readonly bag: DiagnosticBag,
  ) {
    super();
    this.visit(document);
  }

  protected visitResolves(node: BoundResolves): void {
    const localActions = new Set<string>();
    for (const action of node.actions) {
      if (!this.actions.has(action.value)) {
        this.bag.actionDoesNotExist(action.value, action.syntax.range);
      }

      if (localActions.has(action.value)) {
        this.bag.duplicateActions(action.value, action.syntax.range);
      } else {
        localActions.add(action.value);
      }
    }
  }

  protected visitNeeds(node: BoundNeeds): void {
    const localActions = new Set<string>();
    for (const action of node.actions) {
      if (!this.actions.has(action.value)) {
        this.bag.actionDoesNotExist(action.value, action.syntax.range);
      }

      if (localActions.has(action.value)) {
        this.bag.duplicateActions(action.value, action.syntax.range);
      } else {
        localActions.add(action.value);
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
        this.secrets.add(secret.value);
        if (this.secrets.size > MAXIMUM_SUPPORTED_SECRETS) {
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

  protected visitUses(node: BoundUses): void {
    if (node.value) {
      if (!USES_REGEX.test(node.value.value)) {
        this.bag.invalidUses(node.value.syntax.range);
      }
    }
  }
}
