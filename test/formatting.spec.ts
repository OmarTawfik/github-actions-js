/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { Compilation } from "../src/util/compilation";
import { FormattingService } from "../src/services/formatting";

describe(__filename, () => {
  it("formats a one line empty action", () => {
    expectFormatting(`
action"x"{}
`).toMatchInlineSnapshot(`
"action \\"x\\" {
}
"
`);
  });

  it("formats a one line action with properties", () => {
    expectFormatting(`
action "x" { uses="./ci" }
`).toMatchInlineSnapshot(`
"action \\"x\\" {
  uses = \\"./ci\\"
}
"
`);
  });

  it("formats an action with embedded comments", () => {
    expectFormatting(`
# on start of line
          # should be aligned to start
action "x" {
    # should be indented
                uses="./ci" // should be at end
      }
`).toMatchInlineSnapshot(`
"# on start of line
# should be aligned to start
action \\"x\\" {
  # should be indented
  uses = \\"./ci\\" // should be at end
}
"
`);
  });

  it("indents properties according to the longest key", () => {
    expectFormatting(`
action "Go Modules" {
  uses = "actions-contrib/go@master"
  secrets = []
  env = {
    X = "1",
    YYYYYY = "2",
    ZZZ = "3"
  }
}
`).toMatchInlineSnapshot(`
"action \\"Go Modules\\" {
  uses    = \\"actions-contrib/go@master\\"

  secrets = [
  ]

  env     = {
    X      = \\"1\\",
    YYYYYY = \\"2\\",
    ZZZ    = \\"3\\"
  }
}
"
`);
  });
});

function expectFormatting(text: string): jest.Matchers<string> {
  const compilation = new Compilation(text);
  const result = FormattingService.format(compilation, "  ");

  const secondCompilation = new Compilation(result);
  const secondResult = FormattingService.format(secondCompilation, "  ");
  expect(result).toBe(secondResult);

  return expect(result);
}
