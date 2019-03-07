/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import * as gulp from "gulp";
import { BuildTasks } from "./scripts/gulp-build";
import { PackageTasks } from "./scripts/gulp-linter";
import { VSCodeTasks } from "./scripts/gulp-vscode";

gulp.task(
  "ci",
  gulp.series([
    BuildTasks.clean,
    gulp.parallel([BuildTasks.compile, BuildTasks.prettier, BuildTasks.tslint, BuildTasks.jestCI]),
    gulp.parallel([PackageTasks.copyFiles, PackageTasks.generatePackageJson]),
    gulp.parallel([VSCodeTasks.copyFiles, VSCodeTasks.generatePackageJson]),
  ]),
);

gulp.task("default", gulp.series(BuildTasks.jest));
