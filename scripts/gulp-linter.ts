/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import * as path from "path";
import * as gulp from "gulp";
import { outPath, rootPath, gulp_mergePackageJson } from "./utils";

const linterPath = path.join(outPath, "linter");

export module LinterTasks {
  export const copyFiles = "linter:copy-files";
  export const generatePackageJson = "linter:generate-package-json";
}

gulp.task(LinterTasks.copyFiles, () => {
  return gulp.src([path.join(outPath, "src", "**"), path.join(rootPath, "README.md")]).pipe(gulp.dest(linterPath));
});

gulp_mergePackageJson(LinterTasks.generatePackageJson, "package-linter.json", linterPath);
