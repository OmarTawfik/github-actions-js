/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { expectDiagnostics } from "./utils";

describe(__filename, () => {
  it("reports no errors when no version is specified", () => {
    expectDiagnostics(``).toMatchInlineSnapshot(`""`);
  });

  it("reports error on multiple versions", () => {
    expectDiagnostics(`
version = 0
version = 0
`).toMatchInlineSnapshot(`
"
ERROR: A version is already specified for this document'. You can only specify one.
  1 | 
  2 | version = 0
  3 | version = 0
    | ^^^^^^^
  4 | 
"
`);
  });

  it("reports error on unsupported versions", () => {
    expectDiagnostics(`
version = 1
`).toMatchInlineSnapshot(`
"
ERROR: The version '1' is not valid. Only versions up to '0' are supported.
  1 | 
  2 | version = 1
    |           ^
  3 | 
"
`);
  });

  it("reports error on version after workflow", () => {
    expectDiagnostics(`
workflow "x" {
  on = "fork"
}
version = 0
`).toMatchInlineSnapshot(`
"
ERROR: Version must be specified before all actions or workflows are defined.
  3 |   on = \\"fork\\"
  4 | }
  5 | version = 0
    | ^^^^^^^
  6 | 
"
`);
  });

  it("reports error on version after action", () => {
    expectDiagnostics(`
action "x" {
  uses = "./ci"
}
version = 0
`).toMatchInlineSnapshot(`
"
ERROR: Version must be specified before all actions or workflows are defined.
  3 |   uses = \\"./ci\\"
  4 | }
  5 | version = 0
    | ^^^^^^^
  6 | 
"
`);
  });

  it("reports error on multiple on blocks", () => {
    expectDiagnostics(`
workflow "x" {
  on = "fork"
  on = "fork"
}
`).toMatchInlineSnapshot(`
"
ERROR: A property 'on' is already defined in this block.
  2 | workflow \\"x\\" {
  3 |   on = \\"fork\\"
  4 |   on = \\"fork\\"
    |   ^^
  5 | }
  6 | 
"
`);
  });

  it("reports error on multiple resolves blocks", () => {
    expectDiagnostics(`
workflow "x" {
  on = "fork"
  resolves = []
  resolves = []
}
`).toMatchInlineSnapshot(`
"
ERROR: A property 'resolves' is already defined in this block.
  3 |   on = \\"fork\\"
  4 |   resolves = []
  5 |   resolves = []
    |   ^^^^^^^^
  6 | }
  7 | 
"
`);
  });

  it("reports error on invalid workflow property", () => {
    expectDiagnostics(`
workflow "x" {
  on = "fork"
  needs = "ci"
}
`).toMatchInlineSnapshot(`
"
ERROR: A property of kind 'needs' cannot be defined for a 'workflow' block.
  2 | workflow \\"x\\" {
  3 |   on = \\"fork\\"
  4 |   needs = \\"ci\\"
    |   ^^^^^
  5 | }
  6 | 
"
`);
  });

  it("reports error on string array in on property", () => {
    expectDiagnostics(`
workflow "x" {
  on = []
}
`).toMatchInlineSnapshot(`
"
ERROR: Value must be a single string.
  1 | 
  2 | workflow \\"x\\" {
  3 |   on = []
    |   ^^
  4 | }
  5 | 
"
`);
  });

  it("reports error on env variables in on property", () => {
    expectDiagnostics(`
workflow "x" {
  on = {}
}
`).toMatchInlineSnapshot(`
"
ERROR: Value must be a single string.
  1 | 
  2 | workflow \\"x\\" {
  3 |   on = {}
    |   ^^
  4 | }
  5 | 
"
`);
  });

  it("reports error on objects in resolves property", () => {
    expectDiagnostics(`
workflow "x" {
  on = "fork"
  resolves = {}
}
`).toMatchInlineSnapshot(`
"
ERROR: Value must be a single string or an array of strings.
  2 | workflow \\"x\\" {
  3 |   on = \\"fork\\"
  4 |   resolves = {}
    |   ^^^^^^^^
  5 | }
  6 | 
"
`);
  });

  it("reports error on strings in env property", () => {
    expectDiagnostics(`
action "x" {
  uses = "./ci"
  env = "test"
}
`).toMatchInlineSnapshot(`
"
ERROR: Value must be an object.
  2 | action \\"x\\" {
  3 |   uses = \\"./ci\\"
  4 |   env = \\"test\\"
    |   ^^^
  5 | }
  6 | 
"
`);
  });

  it("reports error on string arrays in env property", () => {
    expectDiagnostics(`
action "x" {
  uses = "./ci"
  env = ["test"]
}
`).toMatchInlineSnapshot(`
"
ERROR: Value must be an object.
  2 | action \\"x\\" {
  3 |   uses = \\"./ci\\"
  4 |   env = [\\"test\\"]
    |   ^^^
  5 | }
  6 | 
"
`);
  });

  it("reports errors on reserved environment variables", () => {
    expectDiagnostics(`
action "x" {
  uses = "./ci"
  env = {
    GITHUB_ACTION = "1"
    GITHUBNOUNDERSCORE = "2"
    SOMETHING_ELSE = "3"
  }
}`).toMatchInlineSnapshot(`
"
ERROR: Environment variables starting with 'GITHUB_' are reserved.
  3 |   uses = \\"./ci\\"
  4 |   env = {
  5 |     GITHUB_ACTION = \\"1\\"
    |     ^^^^^^^^^^^^^
  6 |     GITHUBNOUNDERSCORE = \\"2\\"
  7 |     SOMETHING_ELSE = \\"3\\"
"
`);
  });
});
