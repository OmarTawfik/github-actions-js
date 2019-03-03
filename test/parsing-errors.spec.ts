/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { expectDiagnostics } from "./utils";

describe(__filename, () => {
  it("reports errors on invalid block starts", () => {
    expectDiagnostics(`
x 
version = 0
`).toMatchInlineSnapshot(`
"
x 
~ A token of kind 'identifier' was not expected here. (line 1)
"
`);
  });

  it("reports errors on incomplete version block", () => {
    expectDiagnostics(`
version
`).toMatchInlineSnapshot(`
"
version
~~~~~~~ A token of kind '=' was expected after this. (line 1)
"
`);
  });

  it("recovers on incomplete version blocks", () => {
    expectDiagnostics(`
version # no equal
action "x" {
  uses = "./ci"
}
action "y" {
  uses = "./ci"
}
`).toMatchInlineSnapshot(`
"
action \\"x\\" {
~~~~~~ A token of kind '=' was expected here. (line 2)
"
`);
  });

  it("reports errors on missing values", () => {
    expectDiagnostics(`
workflow "x" {
  on = "fork"
}
action "y" {
  uses
}
workflow "z" {
  on =
}
`).toMatchInlineSnapshot(`
"
}
~ A token of kind '=' was expected here. (line 6)
}
~ A token of kind 'string' or '{' or '[' was expected here. (line 9)
"
`);
  });

  it("reports errors on extra commas in a string array", () => {
    expectDiagnostics(`
workflow "x" {
  on = "fork"
  resolves = [
    "a", "b", , , "c", 
  ]
}
`).toMatchInlineSnapshot(`
"
    \\"a\\", \\"b\\", , , \\"c\\", 
                      ~ A token of kind ',' was not expected here. (line 4)
    \\"a\\", \\"b\\", , , \\"c\\", 
                        ~ A token of kind ',' was not expected here. (line 4)
"
`);
  });
});
