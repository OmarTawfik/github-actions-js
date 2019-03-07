/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import * as path from "path";
import * as gulp from "gulp";
import * as typescript from "gulp-typescript";
import * as sourcemaps from "gulp-sourcemaps";
import * as del from "del";
import { outPath, rootPath, gulp_shell } from "./gulp-utils";

export module BuildTasks {
  export const clean = "build:clean";
  export const compile = "build:compile";
  export const jest = "build:jest";
  export const jestCI = "build:jest-ci";
  export const prettier = "build:prettier";
  export const tslint = "build:tslint";
}

gulp.task(BuildTasks.clean, () => {
  return del(outPath);
});

gulp.task(BuildTasks.compile, () => {
  const project = typescript.createProject(path.join(rootPath, "tsconfig.json"));
  return project
    .src()
    .pipe(sourcemaps.init())
    .pipe(project())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(outPath));
});

gulp_shell(BuildTasks.jest, () => {
  return [path.join(rootPath, "node_modules", ".bin", "jest"), "--verbose"];
});

gulp_shell(BuildTasks.jestCI, () => {
  return [path.join(rootPath, "node_modules", ".bin", "jest"), "--verbose", "--ci"];
});

gulp_shell(BuildTasks.prettier, () => {
  return [
    path.join(rootPath, "node_modules", ".bin", "prettier-check"),
    path.join(rootPath, "*.*"),
    path.join(rootPath, "**", "*.*"),
  ];
});

gulp_shell(BuildTasks.tslint, () => {
  return [path.join(rootPath, "node_modules", ".bin", "tslint"), "--project", path.join(rootPath, "tsconfig.json")];
});
