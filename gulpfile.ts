/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import * as path from "path";
import * as gulp from "gulp";
import * as typescript from "gulp-typescript";
import * as sourcemaps from "gulp-sourcemaps";
import * as shell from "gulp-shell";

const root = path.resolve(__dirname);

function gulp_shell(name: string, factory: () => string[]): void {
  gulp.task(name, shell.task(factory().join(" ")));
}

gulp.task("compile", () => {
  const project = typescript.createProject(path.join(root, "tsconfig.json"));
  return project
    .src()
    .pipe(sourcemaps.init())
    .pipe(project())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.join(root, "out")));
});

gulp_shell("jest", () => {
  return [path.join(root, "node_modules", ".bin", "jest"), "--verbose", "--ci"];
});

gulp_shell("prettier", () => {
  return [
    path.join(root, "node_modules", ".bin", "prettier-check"),
    path.join(root, "*.*"),
    path.join(root, "**", "*.*"),
  ];
});

gulp_shell("tslint", () => {
  return [path.join(root, "node_modules", ".bin", "tslint"), "--project", path.join(root, "tsconfig.json")];
});

gulp.task("ci", gulp.parallel(["compile", "jest", "prettier", "tslint"]));

gulp.task("default", gulp.parallel(["compile", "jest"]));
