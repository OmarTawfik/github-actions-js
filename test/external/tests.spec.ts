/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import * as path from "path";
import * as fs from "fs";
import { Compilation } from "../../src/util/compilation";
import { severityToString } from "../../src/util/diagnostics";
import { rootPath } from "../../scripts/utils";
import { extractAssertion } from "./types";
import { assertMessage } from "./strings";

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

describe(__filename, () => {
  const testsDirectory = path.resolve(rootPath, "workflow-parser", "tests");
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

        expect(assertion.errors).toBeDefined();
        expect(sortedDiagnostics.length).toBe(assertion.errors!.length);

        for (let i = 0; i < sortedDiagnostics.length; i += 1) {
          const expected = assertion.errors![i];
          const actual = sortedDiagnostics[i];

          expect(expected.line).toBe(actual.range.start.line + 1);
          expect(expected.severity).toBe(severityToString(actual.severity));

          expect(typeof actual.code).toBe("number");
          assertMessage(expected.message, actual.code as number);
        }
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
