/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { TokenKind, TextRange, getTokenDescription, Token } from "../scanning/tokens";
import { MAXIMUM_SUPPORTED_VERSION, MAXIMUM_SUPPORTED_SECRETS } from "./constants";

export const enum DiagnosticCode {
  // Scanning
  UnrecognizedCharacter = 1,
  UnterminatedStringLiteral = 2,
  UnsupportedEscapeSequence = 3,

  // Parsing
  MissingToken = 4,
  UnexpectedToken = 5,

  // Binding
  MultipleVersion = 6,
  UnrecognizedVersion = 7,
  VersionAfterBlock = 8,
  ValueIsNotString = 9,
  ValueIsNotStringOrArray = 10,
  ValueIsNotAnObject = 11,
  PropertyAlreadyDefined = 12,
  PropertyMustBeDefined = 13,
  InvalidProperty = 14,
  DuplicateKey = 15,

  // Analysis:
  TooManySecrets = 16,
  DuplicateSecrets = 17,
}

export interface Diagnostic {
  readonly code: DiagnosticCode;
  readonly message: string;
  readonly range: TextRange;
}

export class DiagnosticBag {
  private readonly items: Diagnostic[];

  public constructor() {
    this.items = [];
  }

  public get diagnostics(): ReadonlyArray<Diagnostic> {
    return this.items;
  }

  public unrecognizedCharacter(character: string, range: TextRange): void {
    this.items.push({
      range,
      code: DiagnosticCode.UnrecognizedCharacter,
      message: `The character '${character}' is unrecognizable.`,
    });
  }

  public unterminatedStringLiteral(range: TextRange): void {
    this.items.push({
      range,
      code: DiagnosticCode.UnterminatedStringLiteral,
      message: `This string literal must end with double quotes.`,
    });
  }

  public unsupportedEscapeSequence(character: string, range: TextRange): void {
    this.items.push({
      range,
      code: DiagnosticCode.UnsupportedEscapeSequence,
      message: `The character '${character}' is not a supported escape sequence.`,
    });
  }

  public missingToken(kinds: TokenKind[], range: TextRange, endOfFile: boolean): void {
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

  public multipleVersions(range: TextRange): void {
    this.items.push({
      range,
      code: DiagnosticCode.MultipleVersion,
      message: `A version is already specified for this document'. You can only specify one.`,
    });
  }

  public unrecognizedVersion(version: string, range: TextRange): void {
    this.items.push({
      range,
      code: DiagnosticCode.UnrecognizedVersion,
      message: `The version '${version}' is not valid. Only versions up to '${MAXIMUM_SUPPORTED_VERSION}' are supported.`,
    });
  }

  public versionAfterBlock(range: TextRange): void {
    this.items.push({
      range,
      code: DiagnosticCode.VersionAfterBlock,
      message: `Version must be specified before all actions or workflows are defined.`,
    });
  }

  public valueIsNotString(range: TextRange): void {
    this.items.push({
      range,
      code: DiagnosticCode.ValueIsNotString,
      message: `Value must be a single string.`,
    });
  }

  public valueIsNotStringOrArray(range: TextRange): void {
    this.items.push({
      range,
      code: DiagnosticCode.ValueIsNotStringOrArray,
      message: `Value must be a single string or an array of strings.`,
    });
  }

  public valueIsNotAnObject(range: TextRange): void {
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

  public duplicateKey(key: string, range: TextRange): void {
    this.items.push({
      range,
      code: DiagnosticCode.DuplicateKey,
      message: `A key with the name '${key}' is already defined.`,
    });
  }

  public tooManySecrets(range: TextRange): void {
    this.items.push({
      range,
      code: DiagnosticCode.TooManySecrets,
      message: `Too many secrets defined. The maximum currently supported is '${MAXIMUM_SUPPORTED_SECRETS}'.`,
    });
  }

  public duplicateSecrets(duplicate: string, range: TextRange): void {
    this.items.push({
      range,
      code: DiagnosticCode.DuplicateSecrets,
      message: `This 'secrets' property has duplicate '${duplicate}' secrets`,
    });
  }
}
