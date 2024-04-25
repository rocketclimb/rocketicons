/* eslint-disable @typescript-eslint/no-unused-vars */

import path from "path";
import { promises as fs } from "fs";
// @ts-expect-error TS7016: types not found for find-package
import findPackage from "find-package";
import { IconsManifestType, IconsInfoManifest } from "@rocketicons/core";
import { icons } from "./definitions";
import { getIconFiles } from "./logics";
import { IconDefinition, Overrrides, TaskContext } from "./types";
import { DataTypeHeaderTemplate, DataTypeFooterTemplate, DataIndexJsTemplate } from "./templates";

export const writeIconsManifest = async (
  { DATA, DIST }: TaskContext,
  iconInfoManifest: IconsInfoManifest<string, string>
) => {
  const rc = icons.find(({ id }) => id === "rc")!;
  const others = icons
    .filter(({ id }) => id !== "rc")
    .sort(({ id: a }, { id: b }) => a.localeCompare(b));

  const writeObj: IconsManifestType<string, string>[] = [rc, ...others].map((icon) => ({
    id: icon.id,
    ...(icon?.compPrefix && { compPrefix: icon.compPrefix }),
    name: icon.name,
    projectUrl: icon.projectUrl,
    license: icon.license,
    licenseUrl: icon.licenseUrl,
    icons: [],
    totalIcons: 0
  }));

  const mjsDataIcons: string[] = [];
  const jsDataIcons: string[] = [];
  const mjsIconsInfo: string[] = [];
  const jsIconsInfo: string[] = [];
  const typeCollectionsIds: string[] = [];
  const typeLicenses: string[] = [];

  icons.forEach(({ id, license }) => {
    mjsDataIcons.push(`export * as ${id} from "../${id}";`);
    jsDataIcons.push(
      `const ${id} = require("../${id}");\nexports.${id} = void 0;\nexports.${id} = ${id};`
    );
    mjsIconsInfo.push(`export * as ${id} from "../${id}/manifest.mjs";`);
    jsIconsInfo.push(
      `const ${id} = require("../${id}/manifest.js");\nexports.${id} = void 0;\nexports.${id} = ${id};`
    );
    typeCollectionsIds.push(`"${id}"`);
    typeLicenses.push(`"${license}"`);
  });

  await fs.writeFile(path.resolve(DATA, "icons.mjs"), mjsDataIcons.join("\n"), "utf8");

  await fs.writeFile(
    path.resolve(DATA, "icons.js"),
    `"use strict";\nObject.defineProperty(exports, "__esModule", { value: true });\n${jsDataIcons.join(
      "\n"
    )}`,
    "utf8"
  );

  for (const [key, info] of Object.entries(iconInfoManifest)) {
    const dataInfo = JSON.stringify(info, null, 2);

    await fs.writeFile(
      path.resolve(DIST, key, "manifest.js"),
      `module.exports.manifest = ${dataInfo}`,
      "utf8"
    );
    await fs.writeFile(
      path.resolve(DIST, key, "manifest.mjs"),
      `export var manifest = ${dataInfo}`,
      "utf8"
    );

    await fs.appendFile(
      path.resolve(DIST, key, "index.mjs"),
      `export * from "./manifest.mjs"`,
      "utf8"
    );

    await fs.appendFile(
      path.resolve(DIST, key, "index.js"),
      `exports.manifest = void 0;\nconst manifest = (0, manifest_1.manifest);\nexports.manifest = manifest;`,
      "utf8"
    );

    const current = writeObj.find(({ id }) => key === id)!;

    current.icons = Object.keys(info.icons);
    current.totalIcons = current.icons.length;
  }

  const manifest = JSON.stringify(writeObj, null, 2);

  await fs.writeFile(path.resolve(DATA, "icons-info.mjs"), `${mjsIconsInfo.join("\n")}`, "utf8");
  await fs.writeFile(path.resolve(DATA, "icons-info.js"), `${jsIconsInfo.join("\n")}`, "utf8");

  await fs.writeFile(
    path.resolve(DATA, "icons-manifest.mjs"),
    `export var IconsManifest = ${manifest}`,
    "utf8"
  );
  await fs.writeFile(
    path.resolve(DATA, "icons-manifest.js"),
    `module.exports.IconsManifest = ${manifest}`,
    "utf8"
  );

  await fs.writeFile(
    path.resolve(DATA, "index.mjs"),
    `export { IconsManifest } from "./icons-manifest.mjs";\nexport * as IconsInfo from "./icons-info.mjs";`,
    "utf8"
  );

  await fs.writeFile(path.resolve(DATA, "index.js"), DataIndexJsTemplate, "utf8");

  await fs.writeFile(
    path.resolve(DATA, "index.d.ts"),
    `${DataTypeHeaderTemplate}\nexport type CollectionID = ${typeCollectionsIds.join(
      " | "
    )};\nexport type License = ${[...new Set(typeLicenses)].join(
      " | "
    )};\n${DataTypeFooterTemplate}`,
    "utf8"
  );
};

export const writeLicense = async ({ DIST, rootDir }: TaskContext) => {
  const iconLicenses =
    icons
      .map((icon) =>
        [`${icon.name} - ${icon.projectUrl}`, `License: ${icon.license} ${icon.licenseUrl}`].join(
          "\n"
        )
      )
      .join("\n\n") + "\n";

  await fs.copyFile(path.resolve(rootDir, "LICENSE_HEADER"), path.resolve(DIST, "LICENSE"));
  await fs.appendFile(path.resolve(DIST, "LICENSE"), iconLicenses, "utf8");
};

export const writeEntryPoints = async ({ DIST }: TaskContext) => {
  const generateEntryCjs = () => `module.exports = require('./core/index.js');`;

  const generateEntryMjs = (filename = "index.mjs") => `export * from './core/${filename}';`;

  await fs.appendFile(path.resolve(DIST, "index.js"), generateEntryCjs(), "utf8");
  await fs.appendFile(path.resolve(DIST, "index.mjs"), generateEntryMjs(), "utf8");
  await fs.appendFile(path.resolve(DIST, "index.d.ts"), generateEntryMjs("index.d.ts"), "utf8");
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
      count: files.length
    });
  }

  const emptyVersions = versions.filter((v) => v.count === 0);
  if (emptyVersions.length !== 0) {
    throw Error(`empty icon sets: ${emptyVersions.map((v) => v.icon).join(", ")}`);
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
            v.count
          ].join(" | ")} |`
      )
      .join("\n") +
    "\n";

  await fs.writeFile(path.resolve(rootDir, "VERSIONS"), versionsStr, "utf8");
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const writePackageJson = async (override: Overrrides, { DIST }: TaskContext) => {
  const packageJsonStr = await fs.readFile(path.resolve(DIST, "package.json"), "utf-8");
  let packageJson = JSON.parse(packageJsonStr);
  packageJson.main = "./index.js";

  packageJson = {
    ...packageJson,
    ...override
  };

  const editedPackageJsonStr = JSON.stringify(packageJson, null, 2) + "\n";
  await fs.writeFile(path.resolve(DIST, "package.json"), editedPackageJsonStr);
};

export const copyReadme = async ({ DIST, rootDir }: TaskContext) =>
  await fs.copyFile(path.resolve(rootDir, "../../README.md"), path.resolve(DIST, "README.md"));
