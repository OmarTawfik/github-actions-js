/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { DiagnosticBag } from "../util/diagnostics";
import {
  DocumentSyntax,
  VersionSyntax,
  BlockSyntax,
  SyntaxKind,
  BasePropertySyntax,
  StringPropertySyntax,
  ArrayPropertySyntax,
  ObjectPropertySyntax,
} from "../parsing/syntax-nodes";
import {
  BoundDocument,
  BoundVersion,
  BoundAction,
  BoundWorkflow,
  BoundOn,
  BoundResolves,
  BoundNeeds,
  BoundRuns,
  BoundArgs,
  BoundEnv,
  BoundSecrets,
  BoundUses,
  BoundStringValue,
  BoundObjectMember,
} from "./bound-nodes";
import { TokenKind } from "../scanning/tokens";
import * as webhooks from "@octokit/webhooks-definitions";
import { MAXIMUM_SUPPORTED_VERSION, USES_REGEX } from "../util/constants";

const ON_SCHEDULE_REGEX = /schedule\(.+\)/;

export class Binder {
  private readonly workflows = Array<BoundWorkflow>();
  private readonly actions = Array<BoundAction>();

  private version: BoundVersion | undefined;

  public readonly result: BoundDocument;

  public constructor(root: DocumentSyntax, private readonly bag: DiagnosticBag) {
    root.versions.forEach(syntax => {
      this.bindVersion(syntax);
    });

    let reportedErrorOnMisplacedVersion = false;
    root.blocks.forEach(syntax => {
      if (
        !reportedErrorOnMisplacedVersion &&
        this.version &&
        syntax.type.range.start.line < this.version.syntax.version.range.start.line
      ) {
        bag.versionAfterBlock(this.version.syntax.version.range);
        reportedErrorOnMisplacedVersion = true;
      }

      switch (syntax.type.kind) {
        case TokenKind.WorkflowKeyword: {
          this.bindWorkflow(syntax);
          break;
        }
        case TokenKind.ActionKeyword: {
          this.bindAction(syntax);
          break;
        }
        default: {
          throw new Error(`Unexpected block kind '${syntax.type.kind}' here.`);
        }
      }
    });

    this.result = new BoundDocument(this.version, this.workflows, this.actions, root);
  }

  private bindVersion(syntax: VersionSyntax): void {
    if (this.version) {
      this.bag.multipleVersions(syntax.version.range);
    } else {
      let value = 0;
      if (syntax.integer.kind !== TokenKind.Missing) {
        value = parseInt(syntax.integer.text, 10);
        if (isNaN(value) || value < 0 || value > MAXIMUM_SUPPORTED_VERSION) {
          this.bag.unrecognizedVersion(syntax.integer.text, syntax.integer.range);
        }
      }
      this.version = new BoundVersion(value, syntax);
    }
  }

  private bindWorkflow(syntax: BlockSyntax): void {
    let on: BoundOn | undefined;
    let resolves: BoundResolves | undefined;

    syntax.properties.forEach(property => {
      switch (property.key.kind) {
        case TokenKind.OnKeyword: {
          if (on) {
            this.bag.propertyAlreadyDefined(property.key);
          } else {
            on = new BoundOn(this.bindString(property), property);
            if (on.event) {
              const { value } = on.event;
              if (!webhooks.some(definition => definition.name === value) && !ON_SCHEDULE_REGEX.test(value)) {
                this.bag.unrecognizedEvent(value, on.event.syntax.range);
              }
            }
          }
          break;
        }
        case TokenKind.ResolvesKeyword: {
          if (resolves) {
            this.bag.propertyAlreadyDefined(property.key);
          } else {
            resolves = new BoundResolves(this.bindStringOrArray(property), property);
          }
          break;
        }
        default: {
          this.bag.invalidProperty(property.key, syntax.type.kind);
        }
      }
    });

    if (!on) {
      this.bag.propertyMustBeDefined(TokenKind.OnKeyword, syntax.type);
    }

    this.workflows.push(new BoundWorkflow(this.removeDoubleQuotes(syntax.name.text), on, resolves, syntax));
  }

  private bindAction(syntax: BlockSyntax): void {
    let uses: BoundUses | undefined;
    let needs: BoundNeeds | undefined;
    let runs: BoundRuns | undefined;
    let args: BoundArgs | undefined;
    let env: BoundEnv | undefined;
    let secrets: BoundSecrets | undefined;

    syntax.properties.forEach(property => {
      switch (property.key.kind) {
        case TokenKind.UsesKeyword: {
          if (uses) {
            this.bag.propertyAlreadyDefined(property.key);
          } else {
            uses = new BoundUses(this.bindString(property), property);
            if (uses.value) {
              if (!USES_REGEX.test(uses.value.value)) {
                this.bag.invalidUses(uses.value.syntax.range);
              }
            }
          }
          break;
        }
        case TokenKind.NeedsKeyword: {
          if (needs) {
            this.bag.propertyAlreadyDefined(property.key);
          } else {
            needs = new BoundNeeds(this.bindStringOrArray(property), property);
          }
          break;
        }
        case TokenKind.RunsKeyword: {
          if (runs) {
            this.bag.propertyAlreadyDefined(property.key);
          } else {
            runs = new BoundRuns(this.bindStringOrArray(property), property);
          }
          break;
        }
        case TokenKind.ArgsKeyword: {
          if (args) {
            this.bag.propertyAlreadyDefined(property.key);
          } else {
            args = new BoundArgs(this.bindStringOrArray(property), property);
          }
          break;
        }
        case TokenKind.EnvKeyword: {
          if (env) {
            this.bag.propertyAlreadyDefined(property.key);
          } else {
            env = new BoundEnv(this.bindObject(property), property);
            env.variables.forEach(variable => {
              if (variable.name.startsWith("GITHUB_")) {
                this.bag.reservedEnvironmentVariable(variable.syntax.name.range);
              }
            });
          }
          break;
        }
        case TokenKind.SecretsKeyword: {
          if (secrets) {
            this.bag.propertyAlreadyDefined(property.key);
          } else {
            secrets = new BoundSecrets(this.bindStringOrArray(property), property);
          }
          break;
        }
        default: {
          this.bag.invalidProperty(property.key, syntax.type.kind);
        }
      }
    });

    if (!uses) {
      this.bag.propertyMustBeDefined(TokenKind.UsesKeyword, syntax.type);
    }

    this.actions.push(
      new BoundAction(this.removeDoubleQuotes(syntax.name.text), uses, needs, runs, args, env, secrets, syntax),
    );
  }

  private bindString(syntax: BasePropertySyntax | undefined): BoundStringValue | undefined {
    if (!syntax) {
      return undefined;
    }

    switch (syntax.kind) {
      case SyntaxKind.StringProperty: {
        const property = syntax as StringPropertySyntax;
        if (property.value && property.value.kind !== TokenKind.Missing) {
          const value = this.removeDoubleQuotes(property.value.text);
          return new BoundStringValue(value, property.value);
        }
        return undefined;
      }
      case SyntaxKind.ArrayProperty: {
        this.bag.valueIsNotString(syntax.key.range);
        return undefined;
      }
      case SyntaxKind.ObjectProperty: {
        this.bag.valueIsNotString(syntax.key.range);
        return undefined;
      }
      default: {
        throw new Error(`Unexpected Syntax kind '${syntax.kind}'`);
      }
    }
  }

  private bindStringOrArray(syntax: BasePropertySyntax | undefined): ReadonlyArray<BoundStringValue> {
    if (!syntax) {
      return [];
    }

    switch (syntax.kind) {
      case SyntaxKind.StringProperty: {
        const property = syntax as StringPropertySyntax;
        if (property.value && property.value.kind !== TokenKind.Missing) {
          const value = this.removeDoubleQuotes(property.value.text);
          return [new BoundStringValue(value, property.value)];
        }
        return [];
      }
      case SyntaxKind.ArrayProperty: {
        return (syntax as ArrayPropertySyntax).items
          .filter(item => item.value.kind !== TokenKind.Missing)
          .map(item => new BoundStringValue(this.removeDoubleQuotes(item.value.text), item.value));
      }
      case SyntaxKind.ObjectProperty: {
        this.bag.valueIsNotStringOrArray(syntax.key.range);
        return [];
      }
      default: {
        throw new Error(`Unexpected Syntax kind '${syntax.kind}'`);
      }
    }
  }

  private bindObject(syntax: BasePropertySyntax | undefined): ReadonlyArray<BoundObjectMember> {
    if (!syntax) {
      return [];
    }

    switch (syntax.kind) {
      case SyntaxKind.StringProperty: {
        this.bag.valueIsNotAnObject(syntax.key.range);
        return [];
      }
      case SyntaxKind.ArrayProperty: {
        this.bag.valueIsNotAnObject(syntax.key.range);
        return [];
      }
      case SyntaxKind.ObjectProperty: {
        return (syntax as ObjectPropertySyntax).members
          .filter(member => member.name.kind !== TokenKind.Missing && member.value.kind !== TokenKind.Missing)
          .map(member => new BoundObjectMember(member.name.text, this.removeDoubleQuotes(member.value.text), member));
      }
      default: {
        throw new Error(`Unexpected Syntax kind '${syntax.kind}'`);
      }
    }
  }

  private removeDoubleQuotes(value: string): string {
    if (value.length === 0) {
      return value;
    }

    if (!value.startsWith('"')) {
      throw new Error("value has to start with double quotes");
    }

    if (value.endsWith('"')) {
      return value.substr(1, value.length - 2);
    }

    // in case of an incomplete token
    return value.substr(1);
  }
}
