/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { composeSnapshot, getLines } from "../utils";
import { Compilation } from "../../src";
import { getTokenDescription } from "../../src/scanning/tokens";

function expectTokens(text: string): jest.Matchers<string> {
  const compilation = new Compilation(text);
  expect(compilation.diagnostics).toEqual([]);

  const lines = getLines(compilation);
  return expect(
    [
      "",
      ...compilation.tokens.map(token =>
        composeSnapshot(lines, token.range, `TokenKind: '${getTokenDescription(token.kind)}'`),
      ),
      "",
    ].join("\n"),
  );
}

describe(__filename, () => {
  it("recognizes a header (comment and version)", () => {
    expectTokens(`
# this is a comment 1
// this is a comment 2
version = 0
    `).toMatchInlineSnapshot(`
"
# this is a comment 1
~~~~~~~~~~~~~~~~~~~~~ TokenKind: 'comment' (line 1)
// this is a comment 2
~~~~~~~~~~~~~~~~~~~~~~ TokenKind: 'comment' (line 2)
version = 0
~~~~~~~ TokenKind: 'version' (line 3)
version = 0
        ~ TokenKind: '=' (line 3)
version = 0
          ~ TokenKind: 'integer' (line 3)
"
`);
  });

  it("recognizes a workflow", () => {
    expectTokens(`
workflow "this happens when I push" {
  on = "fork"
  resolves = [ "goal1", "goal2" ]
}
    `).toMatchInlineSnapshot(`
"
workflow \\"this happens when I push\\" {
~~~~~~~~ TokenKind: 'workflow' (line 1)
workflow \\"this happens when I push\\" {
         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ TokenKind: 'string' (line 1)
workflow \\"this happens when I push\\" {
                                        ~ TokenKind: '{' (line 1)
  on = \\"fork\\"
  ~~ TokenKind: 'on' (line 2)
  on = \\"fork\\"
     ~ TokenKind: '=' (line 2)
  on = \\"fork\\"
       ~~~~~~~~~~ TokenKind: 'string' (line 2)
  resolves = [ \\"goal1\\", \\"goal2\\" ]
  ~~~~~~~~ TokenKind: 'resolves' (line 3)
  resolves = [ \\"goal1\\", \\"goal2\\" ]
           ~ TokenKind: '=' (line 3)
  resolves = [ \\"goal1\\", \\"goal2\\" ]
             ~ TokenKind: '[' (line 3)
  resolves = [ \\"goal1\\", \\"goal2\\" ]
               ~~~~~~~~~~~ TokenKind: 'string' (line 3)
  resolves = [ \\"goal1\\", \\"goal2\\" ]
                          ~ TokenKind: ',' (line 3)
  resolves = [ \\"goal1\\", \\"goal2\\" ]
                            ~~~~~~~~~~~ TokenKind: 'string' (line 3)
  resolves = [ \\"goal1\\", \\"goal2\\" ]
                                        ~ TokenKind: ']' (line 3)
}
~ TokenKind: '}' (line 4)
"
`);
  });

  it("recognizes an action", () => {
    expectTokens(`
action "goal1" {
  uses = "docker://alpine"
  needs = "ci"
  runs = "echo hello"
  args = [ "world" ]
  env = {
    KEY_1 = "VALUE1"
    KEY_2 = "VALUE2"
  }
  secrets = [ "GITHUB_TOKEN" ]
}
    `).toMatchInlineSnapshot(`
"
action \\"goal1\\" {
~~~~~~ TokenKind: 'action' (line 1)
action \\"goal1\\" {
       ~~~~~~~~~~~ TokenKind: 'string' (line 1)
action \\"goal1\\" {
                   ~ TokenKind: '{' (line 1)
  uses = \\"docker://alpine\\"
  ~~~~ TokenKind: 'uses' (line 2)
  uses = \\"docker://alpine\\"
       ~ TokenKind: '=' (line 2)
  uses = \\"docker://alpine\\"
         ~~~~~~~~~~~~~~~~~~~~~ TokenKind: 'string' (line 2)
  needs = \\"ci\\"
  ~~~~~ TokenKind: 'needs' (line 3)
  needs = \\"ci\\"
        ~ TokenKind: '=' (line 3)
  needs = \\"ci\\"
          ~~~~~~~~ TokenKind: 'string' (line 3)
  runs = \\"echo hello\\"
  ~~~~ TokenKind: 'runs' (line 4)
  runs = \\"echo hello\\"
       ~ TokenKind: '=' (line 4)
  runs = \\"echo hello\\"
         ~~~~~~~~~~~~~~~~ TokenKind: 'string' (line 4)
  args = [ \\"world\\" ]
  ~~~~ TokenKind: 'args' (line 5)
  args = [ \\"world\\" ]
       ~ TokenKind: '=' (line 5)
  args = [ \\"world\\" ]
         ~ TokenKind: '[' (line 5)
  args = [ \\"world\\" ]
           ~~~~~~~~~~~ TokenKind: 'string' (line 5)
  args = [ \\"world\\" ]
                       ~ TokenKind: ']' (line 5)
  env = {
  ~~~ TokenKind: 'env' (line 6)
  env = {
      ~ TokenKind: '=' (line 6)
  env = {
        ~ TokenKind: '{' (line 6)
    KEY_1 = \\"VALUE1\\"
    ~~~~~ TokenKind: 'identifier' (line 7)
    KEY_1 = \\"VALUE1\\"
          ~ TokenKind: '=' (line 7)
    KEY_1 = \\"VALUE1\\"
            ~~~~~~~~~~~~ TokenKind: 'string' (line 7)
    KEY_2 = \\"VALUE2\\"
    ~~~~~ TokenKind: 'identifier' (line 8)
    KEY_2 = \\"VALUE2\\"
          ~ TokenKind: '=' (line 8)
    KEY_2 = \\"VALUE2\\"
            ~~~~~~~~~~~~ TokenKind: 'string' (line 8)
  }
  ~ TokenKind: '}' (line 9)
  secrets = [ \\"GITHUB_TOKEN\\" ]
  ~~~~~~~ TokenKind: 'secrets' (line 10)
  secrets = [ \\"GITHUB_TOKEN\\" ]
          ~ TokenKind: '=' (line 10)
  secrets = [ \\"GITHUB_TOKEN\\" ]
            ~ TokenKind: '[' (line 10)
  secrets = [ \\"GITHUB_TOKEN\\" ]
              ~~~~~~~~~~~~~~~~~~ TokenKind: 'string' (line 10)
  secrets = [ \\"GITHUB_TOKEN\\" ]
                                 ~ TokenKind: ']' (line 10)
}
~ TokenKind: '}' (line 11)
"
`);
  });
});
