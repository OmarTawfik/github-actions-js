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
ERROR: A token of kind 'identifier' was not expected here.
  1 | 
  2 | x 
    | ^
  3 | version = 0
  4 | 
"
`);
  });

  it("reports errors on incomplete version block", () => {
    expectDiagnostics(`
version
`).toMatchInlineSnapshot(`
"
ERROR: A token of kind '=' was expected after this.
  1 | 
  2 | version
    | ^^^^^^^
  3 | 
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
ERROR: A token of kind '=' was expected here.
  1 | 
  2 | version # no equal
  3 | action \\"x\\" {
    | ^^^^^^
  4 |   uses = \\"./ci\\"
  5 | }
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
ERROR: A token of kind '=' was expected here.
  5 | action \\"y\\" {
  6 |   uses
  7 | }
    | ^
  8 | workflow \\"z\\" {
  9 |   on =
ERROR: A token of kind 'string' or '{' or '[' was expected here.
  8 | workflow \\"z\\" {
  9 |   on =
 10 | }
    | ^
 11 | 
"
`);
  });

  it("reports errors on extra commas in a string array", () => {
    expectDiagnostics(`
action "a" {
  uses = "./ci"
}
action "b" {
  uses = "./ci"
}
workflow "x" {
  on = "fork"
  resolves = [
    , "a", , "b", 
  ]
}
`).toMatchInlineSnapshot(`
"
ERROR: A token of kind ',' was not expected here.
  9 |   on = \\"fork\\"
 10 |   resolves = [
 11 |     , \\"a\\", , \\"b\\", 
    |     ^
 12 |   ]
 13 | }
ERROR: A token of kind ',' was not expected here.
  9 |   on = \\"fork\\"
 10 |   resolves = [
 11 |     , \\"a\\", , \\"b\\", 
    |            ^
 12 |   ]
 13 | }
"
`);
  });
});
