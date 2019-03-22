#!/usr/bin/env node
/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import * as fs from "fs";
import { Compilation } from "./util/compilation";
import chalk from "chalk";
import { highlight } from "./util/highlight-range";
import { DiagnosticSeverity } from "vscode-languageserver-types";
import { severityToString } from "./util/diagnostics";

let errorsCount = 0;

function reportError(message: string, severity: DiagnosticSeverity | undefined, file?: string): void {
  errorsCount += 1;

  console.error(`${chalk.red(severityToString(severity))}: ${chalk.grey(file ? `${file}: ` : "")}${message}`);
}

const files = process.argv.slice(2);
if (files.length === 0) {
  reportError("No files passed to lint.", DiagnosticSeverity.Error);
}

files.forEach(file => {
  try {
    const text = fs.readFileSync(file, "utf8");
    const compilation = new Compilation(text);

    if (compilation.diagnostics.length === 0) {
      console.info(`${chalk.green("VALID")}: ${chalk.gray(file)}`);
    } else {
      compilation.diagnostics.forEach(diagnostic => {
        reportError(diagnostic.message, diagnostic.severity, file);
        console.error(highlight(diagnostic.range, text));
      });
    }
  } catch (ex) {
    reportError(ex.toString(), DiagnosticSeverity.Error, file);
  }

  console.log();
});

process.exit(errorsCount);
