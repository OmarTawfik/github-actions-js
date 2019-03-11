/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

declare module "@octokit/webhooks-definitions" {
  const webhooks: ReadonlyArray<{
    readonly name: string;
  }>;

  export = webhooks;
}
