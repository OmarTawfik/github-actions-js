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
version = 0 # correct
version = 0 # duplicate
`).toMatchInlineSnapshot(
      `
"
version = 0 # duplicate
~~~~~~~ A version was already specified at line '1'. You can only specify one. (line 2)
"
`,
    );
  });

  it("reports error on unsupported versions", () => {
    expectDiagnostics(`
version = 1
`).toMatchInlineSnapshot(
      `
"
version = 1
          ~ The version '1' is not valid. Only versions up to '0' are supported. (line 1)
"
`,
    );
  });

  it("reports error on version after workflow", () => {
    expectDiagnostics(`
workflow "x" {
  on = "fork"
}
version = 0
`).toMatchInlineSnapshot(`
"
version = 0
~~~~~~~ Version must be specified before all actions or workflows are defined. (line 4)
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
version = 0
~~~~~~~ Version must be specified before all actions or workflows are defined. (line 4)
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
  on = \\"fork\\"
  ~~ A property 'on' is already defined in this block. (line 3)
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
  resolves = []
  ~~~~~~~~ A property 'resolves' is already defined in this block. (line 4)
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
  needs = \\"ci\\"
  ~~~~~ A property of kind 'needs' cannot be defined for a 'workflow' block. (line 3)
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
  on = []
       ~ Value must be a single string. (line 2)
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
  on = {}
       ~ Value must be a single string. (line 2)
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
  resolves = {}
             ~ Value must be a single string or an array of strings. (line 3)
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
  env = \\"test\\"
        ~~~~~~~~~~ Value must be an object. (line 3)
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
  env = [\\"test\\"]
        ~ Value must be an object. (line 3)
"
`);
  });
});
