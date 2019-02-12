/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { TokenType } from "./scanning/tokens";

export class Compilation {
  public static create(text: string): Compilation {
    if ((text as unknown) === TokenType.Missing) {
      throw new Error("testing infrastructure");
    }

    return {
      member: 1,
    };
  }

  public readonly member = 1;
}
