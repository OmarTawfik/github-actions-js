/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { DiagnosticBag } from "../util/diagnostics";
import {
  DocumentSyntax,
  VersionSyntax,
  BlockSyntax,
  SyntaxKind,
  BaseValueSyntax,
  StringValueSyntax,
  StringArrayValueSyntax,
  ObjectValueSyntax,
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
} from "./bound-nodes";
import { TokenKind } from "../scanning/tokens";

export const MAXIMUM_SUPPORTED_VERSION = 0;

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
      bag.multipleVersions(version.syntax.version.range, syntax.version.range);
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
            on = new BoundOn(bindString(property.value), property);
          }
          break;
        }
        case TokenKind.ResolvesKeyword: {
          if (resolves) {
            bag.propertyAlreadyDefined(property.key);
          } else {
            resolves = new BoundResolves(bindStringOrArray(property.value), property);
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
            uses = new BoundUses(bindString(property.value), property);
          }
          break;
        }
        case TokenKind.NeedsKeyword: {
          if (needs) {
            bag.propertyAlreadyDefined(property.key);
          } else {
            needs = new BoundNeeds(bindStringOrArray(property.value), property);
          }
          break;
        }
        case TokenKind.RunsKeyword: {
          if (runs) {
            bag.propertyAlreadyDefined(property.key);
          } else {
            runs = new BoundRuns(bindStringOrArray(property.value), property);
          }
          break;
        }
        case TokenKind.ArgsKeyword: {
          if (args) {
            bag.propertyAlreadyDefined(property.key);
          } else {
            args = new BoundArgs(bindStringOrArray(property.value), property);
          }
          break;
        }
        case TokenKind.EnvKeyword: {
          if (env) {
            bag.propertyAlreadyDefined(property.key);
          } else {
            env = new BoundEnv(bindObject(property.value), property);
          }
          break;
        }
        case TokenKind.SecretsKeyword: {
          if (secrets) {
            bag.propertyAlreadyDefined(property.key);
          } else {
            secrets = new BoundSecrets(bindStringOrArray(property.value), property);
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

  function bindString(syntax: BaseValueSyntax | undefined): string {
    if (!syntax) {
      return "";
    }

    switch (syntax.kind) {
      case SyntaxKind.StringValue: {
        return removeDoubleQuotes((syntax as StringValueSyntax).value.text);
      }
      case SyntaxKind.StringArrayValue: {
        bag.valueIsNotString((syntax as StringArrayValueSyntax).openBracket.range);
        return "";
      }
      case SyntaxKind.ObjectValue: {
        bag.valueIsNotString((syntax as ObjectValueSyntax).openBracket.range);
        return "";
      }
      default: {
        throw new Error(`Unexpected Syntax kind '${syntax.kind}'`);
      }
    }
  }

  function bindStringOrArray(syntax: BaseValueSyntax | undefined): ReadonlyArray<string> {
    if (!syntax) {
      return [];
    }

    switch (syntax.kind) {
      case SyntaxKind.StringValue: {
        return [removeDoubleQuotes((syntax as StringValueSyntax).value.text)];
      }
      case SyntaxKind.StringArrayValue: {
        return (syntax as StringArrayValueSyntax).values.map(v => removeDoubleQuotes(v.value.text));
      }
      case SyntaxKind.ObjectValue: {
        bag.valueIsNotStringOrArray((syntax as ObjectValueSyntax).openBracket.range);
        return [];
      }
      default: {
        throw new Error(`Unexpected Syntax kind '${syntax.kind}'`);
      }
    }
  }

  function bindObject(syntax: BaseValueSyntax | undefined): ReadonlyMap<string, string> {
    const map = new Map<string, string>();
    if (syntax) {
      switch (syntax.kind) {
        case SyntaxKind.StringValue: {
          bag.valueIsNotAnObject((syntax as StringValueSyntax).value.range);
          break;
        }
        case SyntaxKind.StringArrayValue: {
          bag.valueIsNotAnObject((syntax as StringArrayValueSyntax).openBracket.range);
          break;
        }
        case SyntaxKind.ObjectValue: {
          (syntax as ObjectValueSyntax).members.forEach(variable => {
            const key = removeDoubleQuotes(variable.name.text);
            if (map.has(key)) {
              bag.duplicateKey(key, variable.name.range);
            } else {
              const value = removeDoubleQuotes(variable.value.text);
              map.set(key, value);
            }
          });
          break;
        }
        default: {
          throw new Error(`Unexpected Syntax kind '${syntax.kind}'`);
        }
      }
    }

    return map;
  }

  function removeDoubleQuotes(value: string): string {
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
