/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { expectDiagnostics } from "./utils";

describe(__filename, () => {
  it("reports errors on invalid block starts", () => {
    expectDiagnostics(`
x 
version = 1`).toMatchInlineSnapshot(`
"
x 
~ A token of kind 'identifier' was not expected here. (line 1)
"
`);
  });

  it("reports errors on incomplete version block", () => {
    expectDiagnostics(`
version`).toMatchInlineSnapshot(`
"
version
~~~~~~~ A token of kind '=' was expected after this. (line 1)
"
`);
  });

  it("recovers on incomplete version blocks", () => {
    expectDiagnostics(`
version = 1
version # no equal
version = 3
version = # no number
version = 5`).toMatchInlineSnapshot(`
"
version = 3
~~~~~~~ A token of kind '=' was expected here. (line 3)
version = 5
~~~~~~~ A token of kind 'integer' was expected here. (line 5)
"
`);
  });

  it("reports errors on missing values", () => {
    expectDiagnostics(`
workflow "x" {
  // empty
}
action "y" {
  uses
}
workflow "z" {
  on =
}`).toMatchInlineSnapshot(`
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
  resolves = [
    "a", "b", , , "c", 
  ]
}`).toMatchInlineSnapshot(`
"
    \\"a\\", \\"b\\", , , \\"c\\", 
                      ~ A token of kind ',' was not expected here. (line 3)
    \\"a\\", \\"b\\", , , \\"c\\", 
                        ~ A token of kind ',' was not expected here. (line 3)
"
`);
  });
});
