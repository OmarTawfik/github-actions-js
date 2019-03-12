/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { expectDiagnostics } from "./utils";

describe(__filename, () => {
  it("reports errors on two actions with the same name", () => {
    expectDiagnostics(`
action "a" {
    uses = "./ci"
}
action "b" {
    uses = "./ci"
}
action "a" {
    uses = "./ci"
}
`).toMatchInlineSnapshot(`
"
ERROR: This file already defines another workflow or action with the name 'a'.
  6 |     uses = \\"./ci\\"
  7 | }
  8 | action \\"a\\" {
    |        ^^^
  9 |     uses = \\"./ci\\"
 10 | }
"
`);
  });

  it("reports errors on two workflows with the same name", () => {
    expectDiagnostics(`
workflow "a" {
    on = "fork"
}
workflow "b" {
    on = "fork"
}
workflow "a" {
    on = "fork"
}
`).toMatchInlineSnapshot(`
"
ERROR: This file already defines another workflow or action with the name 'a'.
  6 |     on = \\"fork\\"
  7 | }
  8 | workflow \\"a\\" {
    |          ^^^
  9 |     on = \\"fork\\"
 10 | }
"
`);
  });

  it("reports errors on a workflow and an action with the same name", () => {
    expectDiagnostics(`
action "a" {
    uses = "./ci"
}
workflow "b" {
    on = "fork"
}
workflow "a" {
    on = "fork"
}
`).toMatchInlineSnapshot(`
"
ERROR: This file already defines another workflow or action with the name 'a'.
  1 | 
  2 | action \\"a\\" {
    |        ^^^
  3 |     uses = \\"./ci\\"
  4 | }
"
`);
  });

  it("reports errors on too many actions", () => {
    expectDiagnostics(`
action "action001" { uses = "./ci" }
action "action002" { uses = "./ci" }
action "action003" { uses = "./ci" }
action "action004" { uses = "./ci" }
action "action005" { uses = "./ci" }
action "action006" { uses = "./ci" }
action "action007" { uses = "./ci" }
action "action008" { uses = "./ci" }
action "action009" { uses = "./ci" }
action "action010" { uses = "./ci" }
action "action011" { uses = "./ci" }
action "action012" { uses = "./ci" }
action "action013" { uses = "./ci" }
action "action014" { uses = "./ci" }
action "action015" { uses = "./ci" }
action "action016" { uses = "./ci" }
action "action017" { uses = "./ci" }
action "action018" { uses = "./ci" }
action "action019" { uses = "./ci" }
action "action020" { uses = "./ci" }
action "action021" { uses = "./ci" }
action "action022" { uses = "./ci" }
action "action023" { uses = "./ci" }
action "action024" { uses = "./ci" }
action "action025" { uses = "./ci" }
action "action026" { uses = "./ci" }
action "action027" { uses = "./ci" }
action "action028" { uses = "./ci" }
action "action029" { uses = "./ci" }
action "action030" { uses = "./ci" }
action "action031" { uses = "./ci" }
action "action032" { uses = "./ci" }
action "action033" { uses = "./ci" }
action "action034" { uses = "./ci" }
action "action035" { uses = "./ci" }
action "action036" { uses = "./ci" }
action "action037" { uses = "./ci" }
action "action038" { uses = "./ci" }
action "action039" { uses = "./ci" }
action "action040" { uses = "./ci" }
action "action041" { uses = "./ci" }
action "action042" { uses = "./ci" }
action "action043" { uses = "./ci" }
action "action044" { uses = "./ci" }
action "action045" { uses = "./ci" }
action "action046" { uses = "./ci" }
action "action047" { uses = "./ci" }
action "action048" { uses = "./ci" }
action "action049" { uses = "./ci" }
action "action050" { uses = "./ci" }
action "action051" { uses = "./ci" }
action "action052" { uses = "./ci" }
action "action053" { uses = "./ci" }
action "action054" { uses = "./ci" }
action "action055" { uses = "./ci" }
action "action056" { uses = "./ci" }
action "action057" { uses = "./ci" }
action "action058" { uses = "./ci" }
action "action059" { uses = "./ci" }
action "action060" { uses = "./ci" }
action "action061" { uses = "./ci" }
action "action062" { uses = "./ci" }
action "action063" { uses = "./ci" }
action "action064" { uses = "./ci" }
action "action065" { uses = "./ci" }
action "action066" { uses = "./ci" }
action "action067" { uses = "./ci" }
action "action068" { uses = "./ci" }
action "action069" { uses = "./ci" }
action "action070" { uses = "./ci" }
action "action071" { uses = "./ci" }
action "action072" { uses = "./ci" }
action "action073" { uses = "./ci" }
action "action074" { uses = "./ci" }
action "action075" { uses = "./ci" }
action "action076" { uses = "./ci" }
action "action077" { uses = "./ci" }
action "action078" { uses = "./ci" }
action "action079" { uses = "./ci" }
action "action080" { uses = "./ci" }
action "action081" { uses = "./ci" }
action "action082" { uses = "./ci" }
action "action083" { uses = "./ci" }
action "action084" { uses = "./ci" }
action "action085" { uses = "./ci" }
action "action086" { uses = "./ci" }
action "action087" { uses = "./ci" }
action "action088" { uses = "./ci" }
action "action089" { uses = "./ci" }
action "action090" { uses = "./ci" }
action "action091" { uses = "./ci" }
action "action092" { uses = "./ci" }
action "action093" { uses = "./ci" }
action "action094" { uses = "./ci" }
action "action095" { uses = "./ci" }
action "action096" { uses = "./ci" }
action "action097" { uses = "./ci" }
action "action098" { uses = "./ci" }
action "action099" { uses = "./ci" }
action "action100" { uses = "./ci" }
action "action101" { uses = "./ci" }
`).toMatchInlineSnapshot(`
"
ERROR: Too many actions defined. The maximum currently supported is '100'.
100 | action \\"action099\\" { uses = \\"./ci\\" }
101 | action \\"action100\\" { uses = \\"./ci\\" }
102 | action \\"action101\\" { uses = \\"./ci\\" }
    |        ^^^^^^^^^^^
103 | 
"
`);
  });

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
