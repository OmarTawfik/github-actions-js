/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import * as path from "path";
import * as execa from "execa";
import { pathExists, readJSON, writeJSON } from "fs-extra";

interface ConfigParams {
  readonly pkgRoot?: string;
}

interface Config {
  readonly packagePath: string;
  readonly packageContents: any;
  readonly VSCE_TOKEN: string;
}

interface Engine {
  nextRelease: {
    version: string;
  };
  logger: {
    log: (value: string) => void;
  };
}

async function clean(config: ConfigParams): Promise<Config> {
  if (!config.pkgRoot) {
    throw new Error(`'pkgRoot' option not set`);
  }

  const packagePath = path.resolve(config.pkgRoot, "package.json");
  if (!(await pathExists(packagePath))) {
    throw new Error(`No package.json found at: ${packagePath}`);
  }

  const packageContents = await readJSON(packagePath);

  const VSCE_TOKEN = process.env.VSCE_TOKEN;
  if (!VSCE_TOKEN) {
    throw new Error(`Environment variable VSCE_TOKEN must be set.`);
  }

  return {
    packagePath,
    packageContents,
    VSCE_TOKEN,
  };
}

export async function verifyConditions(config: ConfigParams, engine: Engine): Promise<void> {
  engine.logger.log("Verifying the package.");
  await clean(config);
}

export async function prepare(config: ConfigParams, engine: Engine): Promise<void> {
  engine.logger.log("Preparing the package.");
  const { packagePath, packageContents } = await clean(config);

  packageContents.version = engine.nextRelease.version;
  await writeJSON(packagePath, packageContents);
}

export async function publish(config: ConfigParams, engine: Engine): Promise<void> {
  engine.logger.log("Publishing the package.");
  const { VSCE_TOKEN } = await clean(config);

  const vsce = path.resolve("node_modules", ".bin", "vsce");
  await execa(vsce, ["publish", "--pat", VSCE_TOKEN], {
    stdio: "inherit",
    cwd: config.pkgRoot,
  });
}
