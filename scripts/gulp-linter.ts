/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import * as path from "path";
import * as gulp from "gulp";
import * as merge from "gulp-merge-json";
import { outPath, rootPath } from "./gulp-utils";

const linterPath = path.join(outPath, "linter");

export module PackageTasks {
  export const copyFiles = "linter:copy-files";
  export const generatePackageJson = "linter:generate-package-json";
}

gulp.task(PackageTasks.copyFiles, () => {
  return gulp.src([path.join(outPath, "src", "**"), path.join(rootPath, "README.md")]).pipe(gulp.dest(linterPath));
});

gulp.task(PackageTasks.generatePackageJson, () => {
  return gulp
    .src([path.join(rootPath, "package.json"), path.join(rootPath, "scripts", "package-linter.json")])
    .pipe(
      merge({
        fileName: "package.json",
        edit: contents => {
          if (contents.scripts) {
            // vscode postinstall step will break NPM users
            delete contents.scripts.postinstall;
          }
          return contents;
        },
      }),
    )
    .pipe(gulp.dest(linterPath));
});
