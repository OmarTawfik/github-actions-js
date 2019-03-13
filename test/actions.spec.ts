/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { expectDiagnostics } from "./utils";

describe(__filename, () => {
  it("reports error on resolving a non-existing action", () => {
    expectDiagnostics(`
action "a" {
  uses = "./ci"
}
action "b" {
  uses = "./ci"
}
workflow "c" {
  on = "fork"
  resolves = [
    "a",
    "b",
    "not_found"
  ]
}
`).toMatchInlineSnapshot(`
"
ERROR: The action 'not_found' does not exist in the same workflow file.
 11 |     \\"a\\",
 12 |     \\"b\\",
 13 |     \\"not_found\\"
    |     ^^^^^^^^^^^
 14 |   ]
 15 | }
"
`);
  });

  it("reports error on needing a non-existing action", () => {
    expectDiagnostics(`
action "a" {
  uses = "./ci"
}
action "b" {
  uses = "./ci"
}
action "c" {
    uses = "./ci"
    needs = [
      "a",
      "b",
      "not_found"
    ]
}
`).toMatchInlineSnapshot(`
"
ERROR: The action 'not_found' does not exist in the same workflow file.
 11 |       \\"a\\",
 12 |       \\"b\\",
 13 |       \\"not_found\\"
    |       ^^^^^^^^^^^
 14 |     ]
 15 | }
"
`);
  });

  it("reports errors on duplicate resolve actions", () => {
    expectDiagnostics(`
action "b" {
  uses = "./ci"
}
workflow "c" {
  on = "fork"
  resolves = [
    "b",
    "b"
  ]
}`).toMatchInlineSnapshot(`
"
ERROR: This property has duplicate 'b' actions.
  7 |   resolves = [
  8 |     \\"b\\",
  9 |     \\"b\\"
    |     ^^^
 10 |   ]
 11 | }
"
`);
  });

  it("reports errors on duplicate needs actions", () => {
    expectDiagnostics(`
action "b" {
  uses = "./ci"
}
action "c" {
  uses = "./ci"
  needs = [
    "b",
    "b"
  ]
}`).toMatchInlineSnapshot(`
"
ERROR: This property has duplicate 'b' actions.
  7 |   needs = [
  8 |     \\"b\\",
  9 |     \\"b\\"
    |     ^^^
 10 |   ]
 11 | }
"
`);
  });

  it("reports an error on invalid local 'uses' value", () => {
    expectDiagnostics(`
action "a" {
  uses = "./ci"
}
action "b" {
  uses = "ci"
}
`).toMatchInlineSnapshot(`
"
ERROR: The 'uses' property must be a path, a Docker image, or an owner/repo@ref remote.
  4 | }
  5 | action \\"b\\" {
  6 |   uses = \\"ci\\"
    |          ^^^^
  7 | }
  8 | 
"
`);
  });

  it("reports an error on invalid remote 'uses' value", () => {
    expectDiagnostics(`
action "a" {
  uses = "owner/repo/path@ref"
}
action "b" {
  uses = "owner/repo"
}
`).toMatchInlineSnapshot(`
"
ERROR: The 'uses' property must be a path, a Docker image, or an owner/repo@ref remote.
  4 | }
  5 | action \\"b\\" {
  6 |   uses = \\"owner/repo\\"
    |          ^^^^^^^^^^^^
  7 | }
  8 | 
"
`);
  });

  it("reports an error on invalid docker 'uses' value", () => {
    expectDiagnostics(`
action "a" {
  uses = "docker://image"
}
action "b" {
  uses = "docker://?"
}
`).toMatchInlineSnapshot(`
"
ERROR: The 'uses' property must be a path, a Docker image, or an owner/repo@ref remote.
  4 | }
  5 | action \\"b\\" {
  6 |   uses = \\"docker://?\\"
    |          ^^^^^^^^^^^^
  7 | }
  8 | 
"
`);
  });
});
