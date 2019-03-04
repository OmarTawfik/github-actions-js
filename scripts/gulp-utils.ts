/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import * as path from "path";
import * as gulp from "gulp";
import * as shell from "gulp-shell";

export const rootPath = path.resolve(__dirname, "..");
export const outPath = path.join(rootPath, "out");

export function gulp_shell(name: string, factory: () => string[]): void {
  gulp.task(name, shell.task(factory().join(" ")));
}
