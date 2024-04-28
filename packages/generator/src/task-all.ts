import path from "path";
import { promises as fs } from "fs";
import camelcase from "camelcase";
import { optimize as svgoOptimize } from "svgo";
import { IconsInfoManifest } from "@rocketicons/core";
import { icons } from "./definitions";
import { iconRowTemplate } from "./templates";
import { getIconFiles, convertIconData, rmDirRecursive } from "./logics";
import { svgoConfig } from "./svgo-config";
import { IconDefinition, TaskContext } from "./types";

import kebabCase from "./kebab-case";

export const dirInit = async ({ DIST, LIB, PLUGIN, DATA }: TaskContext) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ignore = (err: any) => {
    if (err?.code === "EEXIST") return;
    throw err;
  };

  await rmDirRecursive(DIST, ["package.json", "CHANGELOG.md"]);
  await fs.mkdir(DIST, { recursive: true }).catch(ignore);
  await fs.mkdir(LIB).catch(ignore);
  await fs.mkdir(PLUGIN).catch(ignore);
  await fs.mkdir(DATA).catch(ignore);

  const write = (filePath: string[], str: string) =>
    fs.writeFile(path.resolve(DIST, ...filePath), str, "utf8").catch(ignore);

  const initFiles = ["index.d.ts", "index.mjs", "index.js"];

  for (const icon of icons) {
    await fs.mkdir(path.resolve(DIST, icon.id)).catch(ignore);

    await write(
      [icon.id, "index.js"],
      '// THIS FILE IS AUTO GENERATED\n"use strict";\nObject.defineProperty(exports, "__esModule", { value: true });\nconst core_1 = require("../core");\nconst manifest_1 = require("./manifest.js");\n'
    );
    await write(
      [icon.id, "index.mjs"],
      "// THIS FILE IS AUTO GENERATED\nimport { IconGenerator } from '../core/index.mjs';\n"
    );
    await write(
      [icon.id, "index.d.ts"],
      `// THIS FILE IS AUTO GENERATED\nimport type { IconType, CollectionDataInfo } from '../core/types'\nexport declare const manifest: CollectionDataInfo<"${icon.id}", "${icon.license}">;\n`
    );
    await write(
      [icon.id, "package.json"],
      JSON.stringify(
        {
          sideEffects: false,
          module: "./index.mjs"
        },
        null,
        2
      ) + "\n"
    );
  }

  for (const file of initFiles) {
    await write([file], "// THIS FILE IS AUTO GENERATED\n");
  }
};

export const writeIconModule = async (
  icon: IconDefinition,
  { DIST }: TaskContext,
  iconInfoManifest: IconsInfoManifest<string, string>
) => {
  const exists = new Set(); // for remove duplicate
  for (const content of icon.contents) {
    const files = await getIconFiles(content);

    iconInfoManifest[icon.id] = iconInfoManifest[icon.id] || {
      id: icon.id,
      name: icon.name,
      license: icon.license,
      projectUrl: icon.projectUrl,
      licenseUrl: icon.licenseUrl,
      icons: {}
    };

    for (const file of files) {
      const svgStrRaw = await fs.readFile(file, "utf8");
      const svgStr = content.processWithSVGO
        ? svgoOptimize(svgStrRaw, svgoConfig).data
        : svgStrRaw;
      const { iconData, variant } = await convertIconData(svgStr, content.multiColor);

      const rawName = path.basename(file, path.extname(file));
      const pascalName = camelcase(rawName, { pascalCase: true });
      const name = content?.formatter(pascalName, file) || pascalName;
      if (exists.has(name)) continue;
      exists.add(name);

      // write like: module/fa/index.mjs
      const modRes = iconRowTemplate(icon, name, iconData, variant, "module");
      await fs.appendFile(path.resolve(DIST, icon.id, "index.mjs"), modRes, "utf8");
      const comRes = iconRowTemplate(icon, name, iconData, variant, "common");

      await fs.appendFile(path.resolve(DIST, icon.id, "index.js"), comRes, "utf8");
      const dtsRes = iconRowTemplate(icon, name, iconData, variant, "dts");
      await fs.appendFile(path.resolve(DIST, icon.id, "index.d.ts"), dtsRes, "utf8");

      const nameToManifest = (): string => {
        const compPrefix = icon?.compPrefix ?? icon.id;
        const manifest = kebabCase(name.substring(compPrefix.length));
        return manifest || name.toLowerCase().replace(icon.id, "");
      };

      const manifestName = nameToManifest();

      iconInfoManifest[icon.id].icons[name] = {
        id: `${icon.id}-${manifestName}`,
        name: manifestName.replace(/-/g, " "),
        compName: name,
        variant,
        ...(icon?.compPrefix && { comPrefix: icon?.compPrefix })
      };
      exists.add(file);
    }
  }
};
