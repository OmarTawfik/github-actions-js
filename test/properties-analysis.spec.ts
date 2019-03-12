/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { expectDiagnostics } from "./utils";

describe(__filename, () => {
  it("reports errors on too many secrets", () => {
    expectDiagnostics(`
action "a" {
    uses = "./ci"
    secrets = [
        "SECRET1", "SECRET2", "SECRET3", "SECRET4", "SECRET5", "SECRET6", "SECRET7", "SECRET8", "SECRET9", "SECRET10",
        "SECRET11", "SECRET12", "SECRET13", "SECRET14", "SECRET15", "SECRET16", "SECRET17", "SECRET18", "SECRET19", "SECRET20",
        "SECRET21", "SECRET22", "SECRET23", "SECRET24", "SECRET25", "SECRET26", "SECRET27", "SECRET28", "SECRET29", "SECRET30",
        "SECRET31", "SECRET32", "SECRET33", "SECRET34", "SECRET35", "SECRET36", "SECRET37", "SECRET38", "SECRET39", "SECRET40",
        "SECRET41", "SECRET42", "SECRET43", "SECRET44", "SECRET45", "SECRET46", "SECRET47", "SECRET48", "SECRET49", "SECRET50",
        "SECRET51", "SECRET52", "SECRET53", "SECRET54", "SECRET55", "SECRET56", "SECRET57", "SECRET58", "SECRET59", "SECRET60",
        "SECRET61", "SECRET62", "SECRET63", "SECRET64", "SECRET65", "SECRET66", "SECRET67", "SECRET68", "SECRET69", "SECRET70",
        "SECRET71", "SECRET72", "SECRET73", "SECRET74", "SECRET75", "SECRET76", "SECRET77", "SECRET78", "SECRET79", "SECRET80",
        "SECRET81", "SECRET82", "SECRET83", "SECRET84", "SECRET85", "SECRET86", "SECRET87", "SECRET88", "SECRET89", "SECRET90",
        "SECRET91", "SECRET92", "SECRET93", "SECRET94", "SECRET95", "SECRET96", "SECRET97", "SECRET98", "SECRET99", "SECRET100"
    ]
}

action "b" {
    uses = "./ci"
    secrets = [
        "SECRET50"          # Not a duplicate
    ]
}

action "c" {
    uses = "./ci"
    secrets = [
        "EXTRA_1"           # should be reported
    ]
}

action "d" {
    uses = "./ci"
    secrets = [
        "EXTRA_2"           # Should not be reported
    ]
}
`).toMatchInlineSnapshot(`
"
ERROR: Too many secrets defined. The maximum currently supported is '100'.
 26 |     uses = \\"./ci\\"
 27 |     secrets = [
 28 |         \\"EXTRA_1\\"           # should be reported
    |         ^^^^^^^^^
 29 |     ]
 30 | }
"
`);
  });

  it("reports errors on duplicate secrets", () => {
    expectDiagnostics(`
action "a" {
    uses = "./ci"
    secrets = [
        "S1",
        "S2",
        "S1",     ## should be reported
        "S3"
    ]
}
`).toMatchInlineSnapshot(`
"
ERROR: This property has duplicate 'S1' secrets.
  5 |         \\"S1\\",
  6 |         \\"S2\\",
  7 |         \\"S1\\",     ## should be reported
    |         ^^^^
  8 |         \\"S3\\"
  9 |     ]
"
`);
  });

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
 11 |       \\"a\\",
 12 |       \\"b\\",
 13 |       \\"not_found\\"
    |       ^^^^^^^^^^^
 14 |     ]
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

  it("reports errors on unknown events", () => {
    expectDiagnostics(`
workflow "x" {
    on = "fork"
}
workflow "y" {
    on = "unknown"
}`).toMatchInlineSnapshot(`
"
ERROR: The event 'unknown' is not a known event type.
  4 | }
  5 | workflow \\"y\\" {
  6 |     on = \\"unknown\\"
    |          ^^^^^^^^^
  7 | }
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
  7 |     resolves = [
  8 |       \\"b\\",
  9 |       \\"b\\"
    |       ^^^
 10 |     ]
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
  7 |     needs = [
  8 |       \\"b\\",
  9 |       \\"b\\"
    |       ^^^
 10 |     ]
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
  6 |     uses = \\"ci\\"
    |            ^^^^
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
  6 |     uses = \\"owner/repo\\"
    |            ^^^^^^^^^^^^
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
  6 |     uses = \\"docker://?\\"
    |            ^^^^^^^^^^^^
  7 | }
  8 | 
"
`);
  });
});
