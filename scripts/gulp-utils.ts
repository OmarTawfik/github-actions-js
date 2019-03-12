/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import * as path from "path";
import * as gulp from "gulp";
import * as shell from "gulp-shell";
import * as merge from "gulp-merge-json";

export const rootPath = path.resolve(__dirname, "..");
export const outPath = path.join(rootPath, "out");

export function gulp_shell(taskName: string, factory: () => string[]): void {
  gulp.task(taskName, shell.task(factory().join(" ")));
}

export function gulp_mergePackageJson(taskName: string, specificPackage: string, outputFolder: string): void {
  gulp.task(taskName, () => {
    return gulp
      .src([path.join(rootPath, "package.json"), path.join(rootPath, "scripts", specificPackage)])
      .pipe(
        merge({
          fileName: "package.json",
          edit: contents => {
            contents.scripts = {}; // remove vscode postinstall step, as it is only needed during dev mode
            contents.devDependencies = {}; // Remove devDependencies to improve publish step speed
            return contents;
          },
        }),
      )
      .pipe(gulp.dest(outputFolder));
  });
}
