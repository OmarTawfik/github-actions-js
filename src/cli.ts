#!/usr/bin/env node
/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import * as fs from "fs";
import { Compilation } from "./util/compilation";
import chalk from "chalk";
import { highlight } from "./util/highlight-range";

let errorsFound = 0;

function reportError(message: string, file?: string): void {
  errorsFound += 1;
  console.error(chalk.red("ERROR: ") + chalk.grey(file ? `${file}: ` : "") + message);
}

const files = process.argv.slice(2);
if (files.length === 0) {
  reportError("No files passed to lint.");
}

files.forEach(file => {
  try {
    const text = fs.readFileSync(file, "utf8");
    const compilation = new Compilation(text);
    compilation.diagnostics.forEach(diagnostic => {
      reportError(diagnostic.message, file);
      console.error(highlight(diagnostic.range, text));
    });
  } catch (ex) {
    reportError(ex.toString(), file);
  }
});

process.exit(errorsFound);
