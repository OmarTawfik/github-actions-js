/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import * as gulp from "gulp";
import { BuildTasks } from "./scripts/gulp-build";
import { LinterTasks } from "./scripts/gulp-linter";
import { VSCodeTasks } from "./scripts/gulp-vscode";

gulp.task("update-vscode", gulp.series([BuildTasks.compile, VSCodeTasks.copyFiles, VSCodeTasks.generatePackageJson]));

gulp.task(
  "ci",
  gulp.parallel([
    gulp.series(
      BuildTasks.clean,
      BuildTasks.compile,
      gulp.parallel([
        LinterTasks.copyFiles,
        LinterTasks.generatePackageJson,
        VSCodeTasks.copyFiles,
        VSCodeTasks.generatePackageJson,
      ]),
    ),
    BuildTasks.prettier,
    BuildTasks.tslint,
    BuildTasks.jestCI,
  ]),
);

gulp.task("default", gulp.parallel(BuildTasks.jest));
