/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import * as joi from "joi";
import { EOL_REGEX } from "../../src/util/highlight-range";

export interface AssertionError {
  // TODO: is this really optional?
  readonly line?: number;
  readonly severity: "ERROR" | "FATAL" | "WARN";
  readonly message: string;
}

export interface AssertionObject {
  readonly result: "success" | "failure";
  readonly numActions: number;
  readonly numWorkflows: number;
  readonly errors?: ReadonlyArray<AssertionError>;
}

const assertionErrorSchema = joi.object().keys({
  line: joi.number(),
  severity: joi
    .string()
    .valid("ERROR", "FATAL", "WARN")
    .required(),
  message: joi.string().required(),
});

const assertionObjectSchema = joi.object().keys({
  result: joi
    .string()
    .valid("success", "failure")
    .required(),
  numActions: joi.number().required(),
  numWorkflows: joi.number().required(),
  errors: joi.array().items(assertionErrorSchema),
});

export function extractAssertion(contents: string): AssertionObject {
  const assertionStart = "# ASSERT {";
  const assertionStartIndex = contents.indexOf(assertionStart);
  expect(assertionStartIndex).toBeGreaterThanOrEqual(0);

  const rawLines = contents.substring(assertionStartIndex).split(EOL_REGEX);
  expect(rawLines[0]).toBe(assertionStart);
  expect(rawLines[rawLines.length - 2]).toBe("# }");
  expect(rawLines[rawLines.length - 1]).toBe("");

  const jsonObject = JSON.parse(
    [
      "{",
      ...rawLines.slice(1, rawLines.length - 2).map(line => {
        const commentPrefix = "# ";
        expect(line.startsWith(commentPrefix)).toBeTruthy();
        return line.substring(commentPrefix.length);
      }),
      "}",
    ].join(""),
  );

  const result = joi.validate<AssertionObject>(jsonObject, assertionObjectSchema, {
    noDefaults: true,
  });

  expect(result.error).toBeNull();
  return result.value;
}
