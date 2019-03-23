/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import * as path from "path";
import * as fs from "fs";
import { EOL_REGEX } from "../src/util/highlight-range";
import * as joi from "joi";
import { Compilation } from "../src/util/compilation";

interface AssertionError {
  readonly line?: number;
  readonly severity: "ERROR" | "FATAL" | "WARN";
  readonly message: string;
}

const assertionErrorSchema = joi.object().keys({
  line: joi.number(),
  severity: joi
    .string()
    .valid("ERROR", "FATAL", "WARN")
    .required(),
  message: joi.string().required(),
});

interface AssertionObject {
  readonly result: "success" | "failure";
  readonly numActions: number;
  readonly numWorkflows: number;
  readonly errors?: ReadonlyArray<AssertionError>;
}

const assertionObjectSchema = joi.object().keys({
  result: joi
    .string()
    .valid("success", "failure")
    .required(),
  numActions: joi.number().required(),
  numWorkflows: joi.number().required(),
  errors: joi.array().items(assertionErrorSchema),
});

describe(__filename, () => {
  const testsDirectory = path.resolve(__dirname, "..", "workflow-parser", "tests");
  const allTests = [
    ...collectTests(path.join(testsDirectory, "valid")),
    ...collectTests(path.join(testsDirectory, "invalid")),
  ];

  allTests.forEach(testFile => {
    it(`matches results from external test ${testFile}`, () => {
      const text = fs.readFileSync(testFile, "utf8");
      const assertion = extractAssertion(text);

      const compilation = new Compilation(text);
      if (compilation.diagnostics.length === 0) {
        expect(assertion.result).toBe("success");
      } else {
        expect(assertion.result).toBe("failure");
      }

      // TODO: complete the rest of the assertions
    });
  });
});

function collectTests(directory: string): ReadonlyArray<string> {
  const tests = fs
    .readdirSync(directory)
    .filter(
      file =>
        file.endsWith(".workflow") &&
        // TODO: remove after this is merged: https://github.com/actions/workflow-parser/pull/40
        !file.includes("actions-and-attributes.workflow") &&
        // TODO: remove after this is merged: https://github.com/actions/workflow-parser/pull/39
        !file.includes("hcl-subset-2.workflow"),
    )
    .map(file => path.join(directory, file));

  expect(tests.length).toBeGreaterThan(0);
  return tests;
}

function extractAssertion(contents: string): AssertionObject {
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
