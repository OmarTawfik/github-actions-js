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
import { MAXIMUM_SUPPORTED_VERSION } from "../util/constants";

export function bindDocument(root: DocumentSyntax, bag: DiagnosticBag): BoundDocument {
  let version: BoundVersion | undefined;
  const workflows = Array<BoundWorkflow>();
  const actions = Array<BoundAction>();

  root.versions.forEach(syntax => {
    bindVersion(syntax);
  });

  let reportedErrorOnMisplacedVersion = false;
  root.blocks.forEach(syntax => {
    if (
      !reportedErrorOnMisplacedVersion &&
      version &&
      syntax.type.range.start.line < version.syntax.version.range.start.line
    ) {
      bag.versionAfterBlock(version.syntax.version.range);
      reportedErrorOnMisplacedVersion = true;
    }

    switch (syntax.type.kind) {
      case TokenKind.WorkflowKeyword: {
        bindWorkflow(syntax);
        break;
      }
      case TokenKind.ActionKeyword: {
        bindAction(syntax);
        break;
      }
      default: {
        throw new Error(`Unexpected block kind '${syntax.type.kind}' here.`);
      }
    }
  });

  return new BoundDocument(version, workflows, actions, root);

  function bindVersion(syntax: VersionSyntax): void {
    if (version) {
      bag.multipleVersions(syntax.version.range);
    } else {
      let value = 0;
      if (syntax.integer.kind !== TokenKind.Missing) {
        value = parseInt(syntax.integer.text, 10);
        if (isNaN(value) || value < 0 || value > MAXIMUM_SUPPORTED_VERSION) {
          bag.unrecognizedVersion(syntax.integer.text, syntax.integer.range);
        }
      }
      version = new BoundVersion(value, syntax);
    }
  }

  function bindWorkflow(syntax: BlockSyntax): void {
    let on: BoundOn | undefined;
    let resolves: BoundResolves | undefined;

    syntax.properties.forEach(property => {
      switch (property.key.kind) {
        case TokenKind.OnKeyword: {
          if (on) {
            bag.propertyAlreadyDefined(property.key);
          } else {
            on = new BoundOn(bindString(property), property);
          }
          break;
        }
        case TokenKind.ResolvesKeyword: {
          if (resolves) {
            bag.propertyAlreadyDefined(property.key);
          } else {
            resolves = new BoundResolves(bindStringOrArray(property), property);
          }
          break;
        }
        default: {
          bag.invalidProperty(property.key, syntax.type.kind);
        }
      }
    });

    if (!on) {
      bag.propertyMustBeDefined(TokenKind.OnKeyword, syntax.type);
    }

    workflows.push(new BoundWorkflow(removeDoubleQuotes(syntax.name.text), on, resolves, syntax));
  }

  function bindAction(syntax: BlockSyntax): void {
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
            bag.propertyAlreadyDefined(property.key);
          } else {
            uses = new BoundUses(bindString(property), property);
          }
          break;
        }
        case TokenKind.NeedsKeyword: {
          if (needs) {
            bag.propertyAlreadyDefined(property.key);
          } else {
            needs = new BoundNeeds(bindStringOrArray(property), property);
          }
          break;
        }
        case TokenKind.RunsKeyword: {
          if (runs) {
            bag.propertyAlreadyDefined(property.key);
          } else {
            runs = new BoundRuns(bindStringOrArray(property), property);
          }
          break;
        }
        case TokenKind.ArgsKeyword: {
          if (args) {
            bag.propertyAlreadyDefined(property.key);
          } else {
            args = new BoundArgs(bindStringOrArray(property), property);
          }
          break;
        }
        case TokenKind.EnvKeyword: {
          if (env) {
            bag.propertyAlreadyDefined(property.key);
          } else {
            env = new BoundEnv(bindObject(property), property);
            for (const variable of env.variables) {
              if (variable.name.startsWith("GITHUB_")) {
                bag.reservedEnvironmentVariable(variable.syntax.name.range);
              }
            }
          }
          break;
        }
        case TokenKind.SecretsKeyword: {
          if (secrets) {
            bag.propertyAlreadyDefined(property.key);
          } else {
            secrets = new BoundSecrets(bindStringOrArray(property), property);
          }
          break;
        }
        default: {
          bag.invalidProperty(property.key, syntax.type.kind);
        }
      }
    });

    if (!uses) {
      bag.propertyMustBeDefined(TokenKind.UsesKeyword, syntax.type);
    }

    actions.push(new BoundAction(removeDoubleQuotes(syntax.name.text), uses, needs, runs, args, env, secrets, syntax));
  }

  function bindString(syntax: BasePropertySyntax | undefined): BoundStringValue | undefined {
    if (!syntax) {
      return undefined;
    }

    switch (syntax.kind) {
      case SyntaxKind.StringProperty: {
        const property = syntax as StringPropertySyntax;
        if (property.value) {
          const value = removeDoubleQuotes(property.value.text);
          return new BoundStringValue(value, property.value);
        }
        return undefined;
      }
      case SyntaxKind.ArrayProperty: {
        bag.valueIsNotString(syntax.key.range);
        return undefined;
      }
      case SyntaxKind.ObjectProperty: {
        bag.valueIsNotString(syntax.key.range);
        return undefined;
      }
      default: {
        throw new Error(`Unexpected Syntax kind '${syntax.kind}'`);
      }
    }
  }

  function bindStringOrArray(syntax: BasePropertySyntax | undefined): ReadonlyArray<BoundStringValue> {
    if (!syntax) {
      return [];
    }

    switch (syntax.kind) {
      case SyntaxKind.StringProperty: {
        const property = syntax as StringPropertySyntax;
        if (property.value) {
          const value = removeDoubleQuotes(property.value.text);
          return [new BoundStringValue(value, property.value)];
        }
        return [];
      }
      case SyntaxKind.ArrayProperty: {
        return (syntax as ArrayPropertySyntax).items.map(
          item => new BoundStringValue(removeDoubleQuotes(item.value.text), item.value),
        );
      }
      case SyntaxKind.ObjectProperty: {
        bag.valueIsNotStringOrArray(syntax.key.range);
        return [];
      }
      default: {
        throw new Error(`Unexpected Syntax kind '${syntax.kind}'`);
      }
    }
  }

  function bindObject(syntax: BasePropertySyntax | undefined): ReadonlyArray<BoundObjectMember> {
    if (!syntax) {
      return [];
    }

    switch (syntax.kind) {
      case SyntaxKind.StringProperty: {
        bag.valueIsNotAnObject(syntax.key.range);
        return [];
      }
      case SyntaxKind.ArrayProperty: {
        bag.valueIsNotAnObject(syntax.key.range);
        return [];
      }
      case SyntaxKind.ObjectProperty: {
        return (syntax as ObjectPropertySyntax).members.map(
          member => new BoundObjectMember(member.name.text, removeDoubleQuotes(member.value.text), member),
        );
      }
      default: {
        throw new Error(`Unexpected Syntax kind '${syntax.kind}'`);
      }
    }
  }

  function removeDoubleQuotes(value: string): string {
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
