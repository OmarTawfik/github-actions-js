/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import * as path from "path";
import * as gulp from "gulp";
import * as merge from "gulp-merge-json";
import { outPath, rootPath } from "./gulp-utils";

const vsCodePath = path.join(outPath, "vscode");

export module VSCodeTasks {
  export const copyFiles = "vscode:copy-files";
  export const generatePackageJson = "vscode:generate-package-json";
}

gulp.task(VSCodeTasks.copyFiles, () => {
  return gulp
    .src([
      path.join(outPath, "src", "**"),
      path.join(rootPath, "src", "resources*", "**"),
      path.join(rootPath, "README.md"),
    ])
    .pipe(gulp.dest(vsCodePath));
});

gulp.task(VSCodeTasks.generatePackageJson, () => {
  return gulp
    .src([path.join(rootPath, "package.json"), path.join(rootPath, "scripts", "package-vscode.json")])
    .pipe(
      merge({
        fileName: "package.json",
        edit: contents => {
          // Remove devDependencies to improve publish step speed
          contents.devDependencies = {};
          return contents;
        },
      }),
    )
    .pipe(gulp.dest(vsCodePath));
});
