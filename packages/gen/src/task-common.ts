/* eslint-disable @typescript-eslint/no-unused-vars */

import path from "path";
import { promises as fs } from "fs";
//@ts-ignore
import findPackage from "find-package";
import { promisify } from "util";
const exec = promisify(require("child_process").exec);
import { icons } from "./definitions";
import { getIconFiles } from "./logics";
import { IconDefinition, TaskContext, IconManifestType } from "./types";

export const writeIconsManifest = async ({ LIB }: TaskContext) => {
  const writeObj: IconManifestType[] = icons.map((icon) => ({
    id: icon.id,
    name: icon.name,
    projectUrl: icon.projectUrl,
    license: icon.license,
    licenseUrl: icon.licenseUrl,
  }));
  const manifest = JSON.stringify(writeObj, null, 2);
  await fs.writeFile(
    path.resolve(LIB, "iconsManifest.mjs"),
    `export var IconsManifest = ${manifest}`,
    "utf8"
  );
  await fs.writeFile(
    path.resolve(LIB, "iconsManifest.js"),
    `module.exports.IconsManifest = ${manifest}`,
    "utf8"
  );
};

export const writeLicense = async ({ DIST, rootDir }: TaskContext) => {
  const iconLicenses =
    icons
      .map((icon) =>
        [
          `${icon.name} - ${icon.projectUrl}`,
          `License: ${icon.license} ${icon.licenseUrl}`,
        ].join("\n")
      )
      .join("\n\n") + "\n";

  await fs.copyFile(
    path.resolve(rootDir, "LICENSE_HEADER"),
    path.resolve(DIST, "LICENSE")
  );
  await fs.appendFile(path.resolve(DIST, "LICENSE"), iconLicenses, "utf8");
};

export const writeEntryPoints = async ({ DIST }: TaskContext) => {
  const generateEntryCjs = () => `module.exports = require('./core/index.js');`;

  const generateEntryMjs = (filename = "index.mjs") =>
    `export * from './core/${filename}';`;

  await fs.appendFile(
    path.resolve(DIST, "index.js"),
    generateEntryCjs(),
    "utf8"
  );
  await fs.appendFile(
    path.resolve(DIST, "index.mjs"),
    generateEntryMjs(),
    "utf8"
  );
  await fs.appendFile(
    path.resolve(DIST, "index.d.ts"),
    generateEntryMjs("index.d.ts"),
    "utf8"
  );
};

interface IconsetVersion {
  icon: IconDefinition;
  version: string;
  count: number;
}

export const writeIconVersions = async ({ rootDir }: TaskContext) => {
  const versions: IconsetVersion[] = [];

  // searching for icon versions from package.json and git describe command
  for (const icon of icons) {
    const files = (
      await Promise.all(icon.contents.map((content) => getIconFiles(content)))
    ).flat();

    if (files.length === 0) {
      throw new Error(`Missing path for: ${icon.name}`);
    }

    const firstDir = path.dirname(files[0]);
    const { version } = findPackage(firstDir, true);

    versions.push({
      icon,
      version,
      count: files.length,
    });
  }

  const emptyVersions = versions.filter((v) => v.count === 0);
  if (emptyVersions.length !== 0) {
    throw Error(
      `empty icon sets: ${emptyVersions.map((v) => v.icon).join(", ")}`
    );
  }

  const versionsStr =
    "| Icon Library | License | Version | Count |\n" +
    "| --- | --- | --- | ---: |\n" +
    versions
      .map(
        (v) =>
          `| ${[
            `[${v.icon.name}](${v.icon.projectUrl})`,
            `[${v.icon.license}](${v.icon.licenseUrl})`,
            v.version,
            v.count,
          ].join(" | ")} |`
      )
      .join("\n") +
    "\n";

  await fs.writeFile(path.resolve(rootDir, "VERSIONS"), versionsStr, "utf8");
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const writePackageJson = async (
  override: any,
  { DIST, rootDir }: TaskContext
) => {
  const packageJsonStr = await fs.readFile(
    path.resolve(rootDir, "package.json"),
    "utf-8"
  );
  let packageJson = JSON.parse(packageJsonStr);
  packageJson.main = "./index.js";

  delete packageJson.private;
  delete packageJson.dependencies;
  delete packageJson.devDependencies;
  delete packageJson.scripts;
  delete packageJson.files;

  packageJson = {
    ...packageJson,
    ...override,
  };

  const editedPackageJsonStr = JSON.stringify(packageJson, null, 2) + "\n";
  await fs.writeFile(path.resolve(DIST, "package.json"), editedPackageJsonStr);
};

export const copyReadme = async ({ DIST, rootDir }: TaskContext) =>
  await fs.copyFile(
    path.resolve(rootDir, "../../README.md"),
    path.resolve(DIST, "README.md")
  );
