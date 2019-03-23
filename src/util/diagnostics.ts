/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { TokenKind, getTokenDescription, Token } from "../scanning/tokens";
import {
  MAXIMUM_SUPPORTED_VERSION,
  MAXIMUM_SUPPORTED_SECRETS,
  MAXIMUM_SUPPORTED_ACTIONS,
  LANGUAGE_NAME,
} from "./constants";
import { Range, Diagnostic, DiagnosticSeverity } from "vscode-languageserver-types";

export enum DiagnosticCode {
  // Scanning
  UnrecognizedCharacter,
  UnterminatedStringLiteral,
  UnsupportedEscapeSequence,

  // Parsing
  MissingToken,
  UnexpectedToken,

  // Divider
  PARSING_ERRORS_MARK,

  // Binding
  MultipleVersion,
  UnrecognizedVersion,
  VersionAfterBlock,
  ValueIsNotString,
  ValueIsNotStringOrArray,
  ValueIsNotAnObject,
  PropertyAlreadyDefined,
  PropertyMustBeDefined,
  InvalidProperty,
  DuplicateKey,

  // Block Analysis
  TooManyActions,
  DuplicateBlock,
  CircularDependency,

  // Property Analysis
  ActionDoesNotExist,
  TooManySecrets,
  DuplicateSecrets,
  DuplicateActions,
  ReservedEnvironmentVariable,
  UnrecognizedEvent,
  InvalidUses,
}

export function severityToString(severity: DiagnosticSeverity | undefined): "ERROR" | "WARN" {
  switch (severity) {
    case undefined:
    case DiagnosticSeverity.Error:
      return "ERROR";
    case DiagnosticSeverity.Warning:
      return "WARN";
    default:
      throw new Error(`Unexpected severity: '${severity}'.`);
  }
}

export class DiagnosticBag {
  private readonly items: Diagnostic[];

  public constructor() {
    this.items = [];
  }

  public get diagnostics(): ReadonlyArray<Diagnostic> {
    return this.items;
  }

  public unrecognizedCharacter(character: string, range: Range): void {
    this.items.push({
      range,
      source: LANGUAGE_NAME,
      severity: DiagnosticSeverity.Error,
      code: DiagnosticCode.UnrecognizedCharacter,
      message: `The character '${character}' is unrecognizable.`,
    });
  }

  public unterminatedStringLiteral(range: Range): void {
    this.items.push({
      range,
      source: LANGUAGE_NAME,
      severity: DiagnosticSeverity.Error,
      code: DiagnosticCode.UnterminatedStringLiteral,
      message: `This string literal must end with double quotes.`,
    });
  }

  public unsupportedEscapeSequence(character: string, range: Range): void {
    this.items.push({
      range,
      source: LANGUAGE_NAME,
      severity: DiagnosticSeverity.Error,
      code: DiagnosticCode.UnsupportedEscapeSequence,
      message: `The character '${character}' is not a supported escape sequence.`,
    });
  }

  public missingToken(kinds: TokenKind[], range: Range, endOfFile: boolean): void {
    this.items.push({
      range,
      code: DiagnosticCode.MissingToken,
      source: LANGUAGE_NAME,
      severity: DiagnosticSeverity.Error,
      message: `A token of kind ${kinds.map(k => `'${getTokenDescription(k)}'`).join(" or ")} was expected ${
        endOfFile ? "after this" : "here"
      }.`,
    });
  }

  public unexpectedToken(token: Token): void {
    this.items.push({
      range: token.range,
      code: DiagnosticCode.UnexpectedToken,
      source: LANGUAGE_NAME,
      severity: DiagnosticSeverity.Error,
      message: `A token of kind '${getTokenDescription(token.kind)}' was not expected here.`,
    });
  }

  public multipleVersions(range: Range): void {
    this.items.push({
      range,
      code: DiagnosticCode.MultipleVersion,
      source: LANGUAGE_NAME,
      severity: DiagnosticSeverity.Error,
      message: `A version is already specified for this document'. You can only specify one.`,
    });
  }

  public unrecognizedVersion(version: string, range: Range): void {
    this.items.push({
      range,
      code: DiagnosticCode.UnrecognizedVersion,
      source: LANGUAGE_NAME,
      severity: DiagnosticSeverity.Error,
      message: `The version '${version}' is not valid. Only versions up to '${MAXIMUM_SUPPORTED_VERSION}' are supported.`,
    });
  }

  public versionAfterBlock(range: Range): void {
    this.items.push({
      range,
      code: DiagnosticCode.VersionAfterBlock,
      source: LANGUAGE_NAME,
      severity: DiagnosticSeverity.Error,
      message: `Version must be specified before all actions or workflows are defined.`,
    });
  }

  public valueIsNotString(range: Range): void {
    this.items.push({
      range,
      code: DiagnosticCode.ValueIsNotString,
      source: LANGUAGE_NAME,
      severity: DiagnosticSeverity.Error,
      message: `Value must be a single string.`,
    });
  }

  public valueIsNotStringOrArray(range: Range): void {
    this.items.push({
      range,
      code: DiagnosticCode.ValueIsNotStringOrArray,
      source: LANGUAGE_NAME,
      severity: DiagnosticSeverity.Error,
      message: `Value must be a single string or an array of strings.`,
    });
  }

  public valueIsNotAnObject(range: Range): void {
    this.items.push({
      range,
      code: DiagnosticCode.ValueIsNotAnObject,
      source: LANGUAGE_NAME,
      severity: DiagnosticSeverity.Error,
      message: `Value must be an object.`,
    });
  }

  public propertyAlreadyDefined(keyword: Token): void {
    this.items.push({
      range: keyword.range,
      code: DiagnosticCode.PropertyAlreadyDefined,
      source: LANGUAGE_NAME,
      severity: DiagnosticSeverity.Error,
      message: `A property '${getTokenDescription(keyword.kind)}' is already defined in this block.`,
    });
  }

  public propertyMustBeDefined(property: TokenKind, block: Token): void {
    this.items.push({
      range: block.range,
      code: DiagnosticCode.PropertyMustBeDefined,
      source: LANGUAGE_NAME,
      severity: DiagnosticSeverity.Error,
      message: `This '${getTokenDescription(block.kind)}' must define a '${getTokenDescription(property)}' property.`,
    });
  }

  public invalidProperty(property: Token, block: TokenKind): void {
    this.items.push({
      range: property.range,
      code: DiagnosticCode.InvalidProperty,
      source: LANGUAGE_NAME,
      severity: DiagnosticSeverity.Error,
      message: `A property of kind '${getTokenDescription(
        property.kind,
      )}' cannot be defined for a '${getTokenDescription(block)}' block.`,
    });
  }

  public duplicateKey(key: string, range: Range): void {
    this.items.push({
      range,
      code: DiagnosticCode.DuplicateKey,
      source: LANGUAGE_NAME,
      severity: DiagnosticSeverity.Error,
      message: `A key with the name '${key}' is already defined.`,
    });
  }

  public tooManyActions(range: Range): void {
    this.items.push({
      range,
      code: DiagnosticCode.TooManyActions,
      source: LANGUAGE_NAME,
      severity: DiagnosticSeverity.Error,
      message: `Too many actions defined. The maximum currently supported is '${MAXIMUM_SUPPORTED_ACTIONS}'.`,
    });
  }

  public duplicateBlock(duplicate: string, range: Range): void {
    this.items.push({
      range,
      code: DiagnosticCode.DuplicateBlock,
      source: LANGUAGE_NAME,
      severity: DiagnosticSeverity.Error,
      message: `This file already defines another workflow or action with the name '${duplicate}'.`,
    });
  }

  public circularDependency(action: string, range: Range): void {
    this.items.push({
      range,
      code: DiagnosticCode.CircularDependency,
      source: LANGUAGE_NAME,
      severity: DiagnosticSeverity.Error,
      message: `The action '${action}' has a circular dependency on itself.`,
    });
  }

  public actionDoesNotExist(action: string, range: Range): void {
    this.items.push({
      range,
      code: DiagnosticCode.ActionDoesNotExist,
      source: LANGUAGE_NAME,
      severity: DiagnosticSeverity.Error,
      message: `The action '${action}' does not exist in the same workflow file.`,
    });
  }

  public tooManySecrets(range: Range): void {
    this.items.push({
      range,
      code: DiagnosticCode.TooManySecrets,
      source: LANGUAGE_NAME,
      severity: DiagnosticSeverity.Error,
      message: `Too many secrets defined. The maximum currently supported is '${MAXIMUM_SUPPORTED_SECRETS}'.`,
    });
  }

  public duplicateSecrets(duplicate: string, range: Range): void {
    this.items.push({
      range,
      code: DiagnosticCode.DuplicateSecrets,
      source: LANGUAGE_NAME,
      severity: DiagnosticSeverity.Error,
      message: `This property has duplicate '${duplicate}' secrets.`,
    });
  }

  public duplicateActions(duplicate: string, range: Range): void {
    this.items.push({
      range,
      code: DiagnosticCode.DuplicateActions,
      source: LANGUAGE_NAME,
      severity: DiagnosticSeverity.Error,
      message: `This property has duplicate '${duplicate}' actions.`,
    });
  }

  public reservedEnvironmentVariable(range: Range): void {
    this.items.push({
      range,
      code: DiagnosticCode.ReservedEnvironmentVariable,
      source: LANGUAGE_NAME,
      severity: DiagnosticSeverity.Error,
      message: `Environment variables starting with 'GITHUB_' are reserved.`,
    });
  }

  public unrecognizedEvent(event: string, range: Range): void {
    this.items.push({
      range,
      code: DiagnosticCode.UnrecognizedEvent,
      source: LANGUAGE_NAME,
      severity: DiagnosticSeverity.Error,
      message: `The event '${event}' is not a known event type or a schedule.`,
    });
  }

  public invalidUses(range: Range): void {
    this.items.push({
      range,
      code: DiagnosticCode.InvalidUses,
      source: LANGUAGE_NAME,
      severity: DiagnosticSeverity.Error,
      message: `The 'uses' property must be a path, a Docker image, or an owner/repo@ref remote.`,
    });
  }
}
