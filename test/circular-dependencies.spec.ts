/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { expectDiagnostics } from "./utils";

describe(__filename, () => {
  it("reports error on cycling dependencies in actions", () => {
    expectDiagnostics(`
action "a" { uses = "./ci" }
action "b" { uses = "./ci" needs = ["a"] }
action "c" { uses = "./ci" needs = ["a", "b", "e"] }
action "d" { uses = "./ci" needs = ["c"] }
action "e" { uses = "./ci" needs = ["c"] }
`).toMatchInlineSnapshot(`
"
ERROR: The action 'e' has a circular dependency on itself.
  2 | action \\"a\\" { uses = \\"./ci\\" }
  3 | action \\"b\\" { uses = \\"./ci\\" needs = [\\"a\\"] }
  4 | action \\"c\\" { uses = \\"./ci\\" needs = [\\"a\\", \\"b\\", \\"e\\"] }
    |                                               ^^^
  5 | action \\"d\\" { uses = \\"./ci\\" needs = [\\"c\\"] }
  6 | action \\"e\\" { uses = \\"./ci\\" needs = [\\"c\\"] }
"
`);
  });
});
