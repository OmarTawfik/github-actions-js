/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import * as path from "path";
import * as change from "gulp-change";
import * as gulp from "gulp";
import * as shell from "gulp-shell";
import * as merge from "gulp-merge-json";

export const rootPath = path.resolve(__dirname, "..");
export const outPath = path.join(rootPath, "out");

export function gulp_shell(taskName: string, factory: () => string[]): void {
  gulp.task(taskName, shell.task(factory().join(" ")));
}

export function gulp_mergePackageJson(taskName: string, specificPackage: string, outputFolder: string): void {
  gulp.task(taskName, () => {
    return gulp
      .src([path.join(rootPath, "package.json"), path.join(rootPath, "scripts", specificPackage)])
      .pipe(
        merge({
          fileName: "package.json",
          edit: contents => {
            contents.scripts = {}; // remove vscode postinstall step, as it is only needed during dev mode
            contents.devDependencies = {}; // Remove devDependencies to improve publish step speed
            return contents;
          },
        }),
      )
      .pipe(gulp.dest(outputFolder));
  });
}

export function gulp_extractReadMe(taskName: string, section: "linter" | "vscode", outputFolder: string): void {
  gulp.task(taskName, () => {
    return gulp
      .src(path.join(rootPath, "README.md"))
      .pipe(
        change(content => {
          const npmIndex = content.indexOf("###");
          const vscodeIndex = content.indexOf("###", npmIndex + 1);

          if (content.indexOf("###", vscodeIndex + 1) >= 0) {
            throw new Error(`More than two headers found`);
          }

          switch (section) {
            case "linter": {
              return content.substring(0, vscodeIndex);
            }
            case "vscode": {
              return content.substring(0, npmIndex) + content.substring(vscodeIndex);
            }
            default: {
              throw new Error(`Unknown '${section}' section.`);
            }
          }
        }),
      )
      .pipe(gulp.dest(outputFolder));
  });
}
