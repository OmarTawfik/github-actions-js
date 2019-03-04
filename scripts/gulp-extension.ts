/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import * as path from "path";
import * as gulp from "gulp";
import * as merge from "gulp-merge-json";
import { outPath, rootPath } from "./gulp-utils";

const extensionPath = path.join(outPath, "extension");

export module ExtensionTasks {
  export const copyFiles = "extension:copy-files";
  export const generatePackageJson = "extension:generate-package-json";
}

gulp.task(ExtensionTasks.copyFiles, () => {
  return gulp
    .src([
      path.join(outPath, "src", "**"),
      path.join(rootPath, "src", "resources*", "**"),
      path.join(rootPath, "README.md"),
    ])
    .pipe(gulp.dest(extensionPath));
});

gulp.task(ExtensionTasks.generatePackageJson, () => {
  return gulp
    .src([path.join(rootPath, "package.json"), path.join(rootPath, "scripts", "package-extension.json")])
    .pipe(
      merge({
        fileName: "package.json",
      }),
    )
    .pipe(gulp.dest(extensionPath));
});
