/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import * as gulp from "gulp";
import { BuildTasks } from "./scripts/gulp-build";
import { PackageTasks } from "./scripts/gulp-package";
import { ExtensionTasks } from "./scripts/gulp-extension";

gulp.task(
  "ci",
  gulp.series([BuildTasks.clean, BuildTasks.compile, BuildTasks.prettier, BuildTasks.tslint, BuildTasks.jest]),
);

gulp.task(
  "create-linter-package",
  gulp.series([BuildTasks.clean, BuildTasks.compile, PackageTasks.copyFiles, PackageTasks.generatePackageJson]),
);

gulp.task(
  "create-extension-package",
  gulp.series([BuildTasks.clean, BuildTasks.compile, ExtensionTasks.copyFiles, ExtensionTasks.generatePackageJson]),
);

gulp.task("default", gulp.parallel([BuildTasks.compile, BuildTasks.jest]));
