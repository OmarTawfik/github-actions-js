/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { expectDiagnostics } from "./utils";

describe(__filename, () => {
  it("reports errors on unrecognized characters", () => {
    expectDiagnostics(`
workflow "x" {
  on = "fork"
  %
}
`).toMatchInlineSnapshot(`
"
ERROR: The character '%' is unrecognizable.
  2 | workflow \\"x\\" {
  3 |   on = \\"fork\\"
  4 |   %
    |   ^
  5 | }
  6 | 
"
`);
  });

  it("reports errors on a single forward slash", () => {
    expectDiagnostics(`
/
`).toMatchInlineSnapshot(`
"
ERROR: The character '/' is unrecognizable.
  1 | 
  2 | /
    | ^
  3 | 
"
`);
  });

  it("reports errors on unterminated strings (middle of file)", () => {
    expectDiagnostics(`
workflow "something \\" else {
{
  on = "fork"
}
`).toMatchInlineSnapshot(`
"
ERROR: This string literal must end with double quotes.
  1 | 
  2 | workflow \\"something \\\\\\" else {
    |          ^^^^^^^^^^^^^^^^^^^^
  3 | {
  4 |   on = \\"fork\\"
"
`);
  });

  it("reports errors on unterminated strings (end of file)", () => {
    expectDiagnostics(`
workflow "something
{
  on = "fork"
}
`).toMatchInlineSnapshot(`
"
ERROR: This string literal must end with double quotes.
  1 | 
  2 | workflow \\"something
    |          ^^^^^^^^^^
  3 | {
  4 |   on = \\"fork\\"
"
`);
  });

  it("reports errors on unrecognized escape sequences", () => {
    expectDiagnostics(`
workflow "test\\m" {
  on = "fork"
}
`).toMatchInlineSnapshot(`
"
ERROR: The character 'm' is not a supported escape sequence.
  1 | 
  2 | workflow \\"test\\\\m\\" {
    |                 ^
  3 |   on = \\"fork\\"
  4 | }
"
`);
  });

  it("reports errors on unsupported characters in a string", () => {
    expectDiagnostics(`
workflow "test \u0000 \u0002" {
  on = "fork"
}
`).toMatchInlineSnapshot(`
"
ERROR: The character ' ' is unrecognizable.
  1 | 
  2 | workflow \\"test   \\" {
    |                 ^
  3 |   on = \\"fork\\"
  4 | }
ERROR: The character '' is unrecognizable.
  1 | 
  2 | workflow \\"test   \\" {
    |                   ^
  3 |   on = \\"fork\\"
  4 | }
"
`);
  });
});
