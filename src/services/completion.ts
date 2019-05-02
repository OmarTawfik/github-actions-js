/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import {
  IConnection,
  TextDocuments,
  ServerCapabilities,
  CompletionItem,
  Position,
  CompletionItemKind,
} from "vscode-languageserver";
import { LanguageService } from "../server";
import { accessCache } from "../util/cache";
import { Compilation } from "../util/compilation";
import { rangeContains } from "../util/ranges";
import { TokenKind, getTokenDescription } from "../scanning/tokens";
import * as webhooks from "@octokit/webhooks-definitions";
import {
  SyntaxKind,
  ArrayPropertySyntax,
  StringPropertySyntax,
  BasePropertySyntax,
  BlockSyntax,
} from "../parsing/syntax-nodes";

export class CompletionService implements LanguageService {
  public fillCapabilities(capabilities: ServerCapabilities): void {
    capabilities.completionProvider = {
      triggerCharacters: ['"'],
    };
  }

  public activate(connection: IConnection, documents: TextDocuments): void {
    connection.onCompletion(params => {
      const { uri } = params.textDocument;
      const compilation = accessCache(documents, uri);
      return provideCompletion(compilation, params.position);
    });
  }
}

export function provideCompletion(compilation: Compilation, position: Position): CompletionItem[] {
  for (const block of compilation.syntax.blocks) {
    if (rangeContains(block.range, position)) {
      for (const property of block.properties) {
        if (rangeContains(property.range, position)) {
          switch (property.key.kind) {
            case TokenKind.ResolvesKeyword:
            case TokenKind.NeedsKeyword: {
              return provideActions(compilation, property, position);
            }
            case TokenKind.OnKeyword: {
              return provideEvents(property, position);
            }
            default: {
              return [];
            }
          }
        }
      }

      return provideProperties(block);
    }
  }

  return [];
}

function provideEvents(property: BasePropertySyntax, position: Position): CompletionItem[] {
  if (!isInsideString(property, position)) {
    return [];
  }

  return webhooks.map(webhook => {
    return {
      label: webhook.name,
      kind: CompletionItemKind.Event,
      detail: `Insert the event '${webhook.name}'.`,
    };
  });
}

function provideActions(compilation: Compilation, property: BasePropertySyntax, position: Position): CompletionItem[] {
  if (!isInsideString(property, position)) {
    return [];
  }

  return Array(...compilation.actions.keys()).map(action => {
    return {
      label: action,
      kind: CompletionItemKind.Class,
      detail: `Insert the action '${action}'.`,
    };
  });
}

function provideProperties(block: BlockSyntax): CompletionItem[] {
  let kinds: TokenKind[];
  switch (block.type.kind) {
    case TokenKind.WorkflowKeyword: {
      kinds = [TokenKind.OnKeyword, TokenKind.ResolvesKeyword];
      break;
    }
    case TokenKind.ActionKeyword: {
      kinds = [
        TokenKind.UsesKeyword,
        TokenKind.NeedsKeyword,
        TokenKind.RunsKeyword,
        TokenKind.ArgsKeyword,
        TokenKind.EnvKeyword,
        TokenKind.SecretsKeyword,
      ];
      break;
    }
    default: {
      throw new Error(`Unexpected token kind '${block.type.kind}'`);
    }
  }

  return kinds.map(kind => {
    const text = getTokenDescription(kind);
    return {
      label: text,
      kind: CompletionItemKind.Property,
      detail: `Insert a new '${text}' property.`,
    };
  });
}

function isInsideString(property: BasePropertySyntax, position: Position): boolean {
  switch (property.kind) {
    case SyntaxKind.ArrayProperty: {
      return (property as ArrayPropertySyntax).items.some(item => rangeContains(item.value.range, position));
    }
    case SyntaxKind.StringProperty: {
      const value = (property as StringPropertySyntax).value;
      return value ? rangeContains(value.range, position) : false;
    }
    case SyntaxKind.ObjectMember: {
      return false;
    }
    default: {
      throw new Error(`Unexpected syntax kind '${property.kind}'`);
    }
  }
}
