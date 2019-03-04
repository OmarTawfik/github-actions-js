/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import * as path from "path";
import * as gulp from "gulp";
import * as merge from "gulp-merge-json";
import { outPath, rootPath } from "./gulp-utils";

const packagePath = path.join(outPath, "package");

export module PackageTasks {
  export const copyFiles = "package:copy-files";
  export const copyReadMe = "package:copy-readme";
  export const generateCliPackage = "package:generate-cli-package";
}

gulp.task(PackageTasks.copyFiles, () => {
  return gulp.src(path.join(outPath, "src", "**")).pipe(gulp.dest(packagePath));
});

gulp.task(PackageTasks.copyReadMe, () => {
  return gulp.src(path.join(rootPath, "README.md")).pipe(gulp.dest(packagePath));
});

gulp.task(PackageTasks.generateCliPackage, () => {
  return gulp
    .src([path.join(rootPath, "package.json"), path.join(rootPath, "package-npm.json")])
    .pipe(
      merge({
        fileName: "package.json",
      }),
    )
    .pipe(gulp.dest(packagePath));
});
