/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { getMarkerPosition, TEST_MARKER } from "./utils";
import { Compilation } from "../src/util/compilation";
import { CompletionService } from "../src/services/completion";

describe(__filename, () => {
  it("completes nothing outside of blocks", () => {
    expectCompletionItems(`
version = 0
${TEST_MARKER}
`).toMatchInlineSnapshot(`Array []`);
  });

  it("completes properties inside an action", () => {
    expectCompletionItems(`
action "x" {
  ${TEST_MARKER}
}
`).toMatchInlineSnapshot(`
Array [
  "uses",
  "needs",
  "runs",
  "args",
  "env",
  "secrets",
]
`);
  });

  it("completes properties inside a workflow", () => {
    expectCompletionItems(`
workflow "x" {
  ${TEST_MARKER}
}
`).toMatchInlineSnapshot(`
Array [
  "on",
  "resolves",
]
`);
  });

  it("completes nothing inside a string property that doesn't accept actions", () => {
    expectCompletionItems(`
action "x" {
  uses = "${TEST_MARKER}"
}
`).toMatchInlineSnapshot(`Array []`);
  });

  it("completes nothing inside an array property that doesn't accept actions", () => {
    expectCompletionItems(`
action "x" {
  secrets = [ "${TEST_MARKER}" ]
}
`).toMatchInlineSnapshot(`Array []`);
  });

  it("completes actions inside a string value", () => {
    expectCompletionItems(`
action "to complete" {
}
workflow "x" {
  resolves = "${TEST_MARKER}"
}
`).toMatchInlineSnapshot(`
Array [
  "to complete",
]
`);
  });

  it("completes actions inside an array value", () => {
    expectCompletionItems(`
action "to complete" {
}
workflow "x" {
  resolves = [ "${TEST_MARKER}" ]
}
`).toMatchInlineSnapshot(`
Array [
  "to complete",
]
`);
  });

  it("completes nothing inside an object value", () => {
    expectCompletionItems(`
action "to complete" {
}
action "x" {
  env = { X = "${TEST_MARKER}" }
}
`).toMatchInlineSnapshot(`Array []`);
  });

  it("completes a list of events inside a workflow", () => {
    expectCompletionItems(`
workflow "x" {
  on = "${TEST_MARKER}"
}
`).toMatchInlineSnapshot(`
Array [
  "check_run",
  "check_suite",
  "commit_comment",
  "create",
  "delete",
  "deployment",
  "deployment_status",
  "fork",
  "github_app_authorization",
  "gollum",
  "installation",
  "installation_repositories",
  "issue_comment",
  "issues",
  "label",
  "marketplace_purchase",
  "member",
  "membership",
  "milestone",
  "organization",
  "org_block",
  "page_build",
  "project_card",
  "project_column",
  "project",
  "public",
  "pull_request",
  "pull_request_review",
  "pull_request_review_comment",
  "push",
  "release",
  "repository",
  "repository_import",
  "repository_vulnerability_alert",
  "security_advisory",
  "status",
  "team",
  "team_add",
  "watch",
  "ping",
]
`);
  });
});

function expectCompletionItems(text: string): jest.Matchers<string[]> {
  const { newText, position } = getMarkerPosition(text);
  const compilation = new Compilation(newText);

  const items = CompletionService.provideCompletion(compilation, position);
  return expect(items.map(item => item.label));
}
