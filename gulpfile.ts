/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import * as gulp from "gulp";
import { BuildTasks } from "./scripts/gulp-build";
import { PackageTasks } from "./scripts/gulp-linter";
import { VSCodeTasks } from "./scripts/gulp-vscode";

const npmPackageTask = "create-linter-package";
gulp.task(npmPackageTask, gulp.parallel([PackageTasks.copyFiles, PackageTasks.generatePackageJson]));

const vscodePackageTask = "create-vscode-package";
gulp.task(vscodePackageTask, gulp.parallel([VSCodeTasks.copyFiles, VSCodeTasks.generatePackageJson]));

gulp.task(
  "ci",
  gulp.series([
    BuildTasks.clean,
    BuildTasks.compile,
    BuildTasks.prettier,
    BuildTasks.tslint,
    BuildTasks.jest,
    npmPackageTask,
    vscodePackageTask,
  ]),
);

gulp.task("default", gulp.parallel([BuildTasks.compile, BuildTasks.jest]));
