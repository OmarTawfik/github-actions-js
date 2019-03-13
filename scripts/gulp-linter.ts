/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import * as path from "path";
import * as gulp from "gulp";
import { outPath, gulp_mergePackageJson, gulp_extractReadMe } from "./utils";

const linterPath = path.join(outPath, "linter");

export module LinterTasks {
  export const copyFiles = "linter:copy-files";
  export const generateReadMe = "linter:generate-read-me";
  export const generatePackageJson = "linter:generate-package-json";
}

gulp.task(LinterTasks.copyFiles, () => {
  return gulp.src([path.join(outPath, "src", "**")]).pipe(gulp.dest(linterPath));
});

gulp_extractReadMe(LinterTasks.generateReadMe, "linter", linterPath);

gulp_mergePackageJson(LinterTasks.generatePackageJson, "package-linter.json", linterPath);
