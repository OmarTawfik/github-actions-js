/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { DiagnosticCode } from "../../src/api";

export function assertMessage(message: string, code: DiagnosticCode): void {
  switch (code) {
    case DiagnosticCode.UnrecognizedCharacter:
      throw new Error(`Unrecognized error code '${DiagnosticCode[code]}' for message: ${message}`);
      break;
    case DiagnosticCode.UnterminatedStringLiteral:
      throw new Error(`Unrecognized error code '${DiagnosticCode[code]}' for message: ${message}`);
      break;
    case DiagnosticCode.UnsupportedEscapeSequence:
      throw new Error(`Unrecognized error code '${DiagnosticCode[code]}' for message: ${message}`);
      break;
    case DiagnosticCode.MissingToken:
      throw new Error(`Unrecognized error code '${DiagnosticCode[code]}' for message: ${message}`);
      break;
    case DiagnosticCode.UnexpectedToken:
      throw new Error(`Unrecognized error code '${DiagnosticCode[code]}' for message: ${message}`);
      break;
    case DiagnosticCode.MultipleVersion:
      throw new Error(`Unrecognized error code '${DiagnosticCode[code]}' for message: ${message}`);
      break;
    case DiagnosticCode.UnrecognizedVersion:
      expect(message).toMatch(/^`version = [0-9]+` is not supported$/i);
      break;
    case DiagnosticCode.VersionAfterBlock:
      expect(message).toMatch(/^`[a-z0-9]+` must be the first declaration$/i);
      break;
    case DiagnosticCode.ValueIsNotString:
      throw new Error(`Unrecognized error code '${DiagnosticCode[code]}' for message: ${message}`);
      break;
    case DiagnosticCode.ValueIsNotStringOrArray:
      throw new Error(`Unrecognized error code '${DiagnosticCode[code]}' for message: ${message}`);
      break;
    case DiagnosticCode.ValueIsNotAnObject:
      throw new Error(`Unrecognized error code '${DiagnosticCode[code]}' for message: ${message}`);
      break;
    case DiagnosticCode.PropertyAlreadyDefined:
      expect(message).toMatch(/^`[a-z0-9]+' redefined in workflow `[a-z0-9]+'$/i);
      break;
    case DiagnosticCode.PropertyMustBeDefined:
      throw new Error(`Unrecognized error code '${DiagnosticCode[code]}' for message: ${message}`);
      break;
    case DiagnosticCode.InvalidProperty:
      throw new Error(`Unrecognized error code '${DiagnosticCode[code]}' for message: ${message}`);
      break;
    case DiagnosticCode.DuplicateKey:
      throw new Error(`Unrecognized error code '${DiagnosticCode[code]}' for message: ${message}`);
      break;
    case DiagnosticCode.TooManyActions:
      throw new Error(`Unrecognized error code '${DiagnosticCode[code]}' for message: ${message}`);
      break;
    case DiagnosticCode.DuplicateBlock:
      throw new Error(`Unrecognized error code '${DiagnosticCode[code]}' for message: ${message}`);
      break;
    case DiagnosticCode.CircularDependency:
      throw new Error(`Unrecognized error code '${DiagnosticCode[code]}' for message: ${message}`);
      break;
    case DiagnosticCode.ActionDoesNotExist:
      expect(message).toMatch(/^workflow `[a-z0-9]+' resolves unknown action `[a-z0-9]+'$/i);
      break;
    case DiagnosticCode.TooManySecrets:
      expect(message).toMatch(/^all actions combined must not have more than 100 unique secrets$/i);
      break;
    case DiagnosticCode.DuplicateSecrets:
      throw new Error(`Unrecognized error code '${DiagnosticCode[code]}' for message: ${message}`);
      break;
    case DiagnosticCode.DuplicateActions:
      throw new Error(`Unrecognized error code '${DiagnosticCode[code]}' for message: ${message}`);
      break;
    case DiagnosticCode.ReservedEnvironmentVariable:
      throw new Error(`Unrecognized error code '${DiagnosticCode[code]}' for message: ${message}`);
      break;
    case DiagnosticCode.UnrecognizedEvent:
      throw new Error(`Unrecognized error code '${DiagnosticCode[code]}' for message: ${message}`);
      break;
    case DiagnosticCode.InvalidUses:
      throw new Error(`Unrecognized error code '${DiagnosticCode[code]}' for message: ${message}`);
      break;
    default:
      throw new Error(`Unrecognized error code '${DiagnosticCode[code]}' for message: ${message}`);
  }
}
