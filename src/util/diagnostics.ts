/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { TokenKind, getTokenDescription, Token } from "../scanning/tokens";
import { MAXIMUM_SUPPORTED_VERSION, MAXIMUM_SUPPORTED_SECRETS, MAXIMUM_SUPPORTED_ACTIONS } from "./constants";
import { Range } from "vscode-languageserver-types";

export enum DiagnosticCode {
  // Scanning
  UnrecognizedCharacter,
  UnterminatedStringLiteral,
  UnsupportedEscapeSequence,

  // Parsing
  MissingToken,
  UnexpectedToken,

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

export interface Diagnostic {
  readonly code: DiagnosticCode;
  readonly message: string;
  readonly range: Range;
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
      code: DiagnosticCode.UnrecognizedCharacter,
      message: `The character '${character}' is unrecognizable.`,
    });
  }

  public unterminatedStringLiteral(range: Range): void {
    this.items.push({
      range,
      code: DiagnosticCode.UnterminatedStringLiteral,
      message: `This string literal must end with double quotes.`,
    });
  }

  public unsupportedEscapeSequence(character: string, range: Range): void {
    this.items.push({
      range,
      code: DiagnosticCode.UnsupportedEscapeSequence,
      message: `The character '${character}' is not a supported escape sequence.`,
    });
  }

  public missingToken(kinds: TokenKind[], range: Range, endOfFile: boolean): void {
    this.items.push({
      range,
      code: DiagnosticCode.MissingToken,
      message: `A token of kind ${kinds.map(k => `'${getTokenDescription(k)}'`).join(" or ")} was expected ${
        endOfFile ? "after this" : "here"
      }.`,
    });
  }

  public unexpectedToken(token: Token): void {
    this.items.push({
      range: token.range,
      code: DiagnosticCode.UnexpectedToken,
      message: `A token of kind '${getTokenDescription(token.kind)}' was not expected here.`,
    });
  }

  public multipleVersions(range: Range): void {
    this.items.push({
      range,
      code: DiagnosticCode.MultipleVersion,
      message: `A version is already specified for this document'. You can only specify one.`,
    });
  }

  public unrecognizedVersion(version: string, range: Range): void {
    this.items.push({
      range,
      code: DiagnosticCode.UnrecognizedVersion,
      message: `The version '${version}' is not valid. Only versions up to '${MAXIMUM_SUPPORTED_VERSION}' are supported.`,
    });
  }

  public versionAfterBlock(range: Range): void {
    this.items.push({
      range,
      code: DiagnosticCode.VersionAfterBlock,
      message: `Version must be specified before all actions or workflows are defined.`,
    });
  }

  public valueIsNotString(range: Range): void {
    this.items.push({
      range,
      code: DiagnosticCode.ValueIsNotString,
      message: `Value must be a single string.`,
    });
  }

  public valueIsNotStringOrArray(range: Range): void {
    this.items.push({
      range,
      code: DiagnosticCode.ValueIsNotStringOrArray,
      message: `Value must be a single string or an array of strings.`,
    });
  }

  public valueIsNotAnObject(range: Range): void {
    this.items.push({
      range,
      code: DiagnosticCode.ValueIsNotAnObject,
      message: `Value must be an object.`,
    });
  }

  public propertyAlreadyDefined(keyword: Token): void {
    this.items.push({
      range: keyword.range,
      code: DiagnosticCode.PropertyAlreadyDefined,
      message: `A property '${getTokenDescription(keyword.kind)}' is already defined in this block.`,
    });
  }

  public propertyMustBeDefined(property: TokenKind, block: Token): void {
    this.items.push({
      range: block.range,
      code: DiagnosticCode.PropertyMustBeDefined,
      message: `This '${getTokenDescription(block.kind)}' must define a '${getTokenDescription(property)}' property.`,
    });
  }

  public invalidProperty(property: Token, block: TokenKind): void {
    this.items.push({
      range: property.range,
      code: DiagnosticCode.InvalidProperty,
      message: `A property of kind '${getTokenDescription(
        property.kind,
      )}' cannot be defined for a '${getTokenDescription(block)}' block.`,
    });
  }

  public duplicateKey(key: string, range: Range): void {
    this.items.push({
      range,
      code: DiagnosticCode.DuplicateKey,
      message: `A key with the name '${key}' is already defined.`,
    });
  }

  public tooManyActions(range: Range): void {
    this.items.push({
      range,
      code: DiagnosticCode.TooManyActions,
      message: `Too many actions defined. The maximum currently supported is '${MAXIMUM_SUPPORTED_ACTIONS}'.`,
    });
  }

  public duplicateBlock(duplicate: string, range: Range): void {
    this.items.push({
      range,
      code: DiagnosticCode.DuplicateBlock,
      message: `This file already defines another workflow or action with the name '${duplicate}'.`,
    });
  }

  public circularDependency(action: string, range: Range): void {
    this.items.push({
      range,
      code: DiagnosticCode.CircularDependency,
      message: `The action '${action}' has a circular dependency on itself.`,
    });
  }

  public actionDoesNotExist(action: string, range: Range): void {
    this.items.push({
      range,
      code: DiagnosticCode.ActionDoesNotExist,
      message: `The action '${action}' does not exist in the same workflow file.`,
    });
  }

  public tooManySecrets(range: Range): void {
    this.items.push({
      range,
      code: DiagnosticCode.TooManySecrets,
      message: `Too many secrets defined. The maximum currently supported is '${MAXIMUM_SUPPORTED_SECRETS}'.`,
    });
  }

  public duplicateSecrets(duplicate: string, range: Range): void {
    this.items.push({
      range,
      code: DiagnosticCode.DuplicateSecrets,
      message: `This property has duplicate '${duplicate}' secrets.`,
    });
  }

  public duplicateActions(duplicate: string, range: Range): void {
    this.items.push({
      range,
      code: DiagnosticCode.DuplicateActions,
      message: `This property has duplicate '${duplicate}' actions.`,
    });
  }

  public reservedEnvironmentVariable(range: Range): void {
    this.items.push({
      range,
      code: DiagnosticCode.ReservedEnvironmentVariable,
      message: `Environment variables starting with 'GITHUB_' are reserved.`,
    });
  }

  public unrecognizedEvent(event: string, range: Range): void {
    this.items.push({
      range,
      code: DiagnosticCode.UnrecognizedEvent,
      message: `The event '${event}' is not a known event type.`,
    });
  }

  public invalidUses(range: Range): void {
    this.items.push({
      range,
      code: DiagnosticCode.InvalidUses,
      message: `The 'uses' property must be a path, a Docker image, or an owner/repo@ref remote.`,
    });
  }
}
