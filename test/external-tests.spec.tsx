/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import * as path from "path";
import * as fs from "fs";
import { EOL_REGEX } from "../src/util/highlight-range";
import * as joi from "joi";
import { Compilation } from "../src/util/compilation";
import { severityToString } from "../src/util/diagnostics";

// TODO: these tests have invalid number of actions, so override it here for now.
// blocked by https://github.com/actions/workflow-parser/issues/42
type CorrectionPair = { js: number; go: number };
const correctedNumActions: ReadonlyMap<string, CorrectionPair> = new Map<string, CorrectionPair>([
  ["bad-hcl-2.workflow", { js: 1, go: 0 }],
  ["bad-hcl-3.workflow", { js: 1, go: 0 }],
  ["bad-hcl-4.workflow", { js: 1, go: 0 }],
  ["bad-hcl-5.workflow", { js: 1, go: 0 }],
  ["hcl-subset.workflow", { js: 4, go: 2 }],
]);

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

      const numActionsOverride = correctedNumActions.get(path.basename(testFile));
      if (numActionsOverride) {
        expect(assertion.numActions).toBe(numActionsOverride.go);
        expect(compilation.document.actions.length).toBe(numActionsOverride.js);
      } else {
        expect(compilation.document.actions.length).toBe(assertion.numActions);
      }

      expect(compilation.document.workflows.length).toBe(assertion.numWorkflows);

      if (compilation.diagnostics.length) {
        const sortedDiagnostics = Array(...compilation.diagnostics);
        sortedDiagnostics.sort((a, b) => a.range.start.line - b.range.start.line);

        const mappedDiagnostics: ReadonlyArray<AssertionError> = sortedDiagnostics.map(diagnostic => {
          return {
            line: diagnostic.range.start.line + 1,
            severity: severityToString(diagnostic.severity),
            message: diagnostic.message,
          };
        });

        expect(mappedDiagnostics).toEqual(assertion.errors);
      } else {
        expect(assertion.errors).toBeUndefined();
      }
    });
  });
});

function collectTests(directory: string): ReadonlyArray<string> {
  const tests = fs
    .readdirSync(directory)
    .filter(
      file =>
        file.endsWith(".workflow") &&
        // TODO: blocked by https://github.com/OmarTawfik/github-actions-js/issues/82
        !file.includes("actions-and-attributes.workflow"),
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
