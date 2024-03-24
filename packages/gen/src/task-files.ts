import path from "path";
import { promises as fs } from "fs";
import camelcase from "camelcase";
import { optimize as svgoOptimize } from "svgo";
import { icons } from "./definitions";
import { iconRowTemplate } from "./templates";
import { getIconFiles, convertIconData, rmDirRecursive } from "./logics";
import { IconDefinition, TaskContext } from "./types";
import { svgoConfig } from "./svgo-config";

export const dirInit = async ({ DIST, LIB }: TaskContext) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ignore = (err: any) => {
    if (err?.code === "EEXIST") return;
    throw err;
  };

  await rmDirRecursive(DIST).catch((err) => {
    if (err.code === "ENOENT") return;
    throw err;
  });
  await fs.mkdir(DIST, { recursive: true }).catch(ignore);
  await fs.mkdir(LIB).catch(ignore);

  const write = (filePath: string[], str: string) =>
    fs.writeFile(path.resolve(DIST, ...filePath), str, "utf8").catch(ignore);

  const initFiles = ["index.d.ts", "index.mjs", "index.js"];

  for (const icon of icons) {
    await fs.mkdir(path.resolve(DIST, icon.id)).catch(ignore);
  }

  for (const file of initFiles) {
    await write([file], "// THIS FILE IS AUTO GENERATED\n");
  }
};
export const writeIconModuleFiles = async (
  icon: IconDefinition,
  { DIST }: TaskContext
) => {
  const exists = new Set(); // for remove duplicate

  for (const content of icon.contents) {
    const files = await getIconFiles(content);

    for (const file of files) {
      const svgStrRaw = await fs.readFile(file, "utf8");
      const svgStr = content.processWithSVGO
        ? await svgoOptimize(svgStrRaw, svgoConfig).data
        : svgStrRaw;

      const { iconData } = await convertIconData(svgStr, content.multiColor);

      const rawName = path.basename(file, path.extname(file));
      const pascalName = camelcase(rawName, { pascalCase: true });
      const name =
        (content.formatter && content.formatter(pascalName, file)) ||
        pascalName;
      if (exists.has(name)) continue;
      exists.add(name);

      // write like: module/fa/FaBeer.mjs
      const modRes = iconRowTemplate(icon, name, iconData, "module");
      const modHeader =
        "// THIS FILE IS AUTO GENERATED\nimport { GenIcon } from '../core/index.mjs';\n";
      await fs.writeFile(
        path.resolve(DIST, icon.id, `${name}.mjs`),
        modHeader + modRes,
        "utf8"
      );
      const comRes = iconRowTemplate(icon, name, iconData, "common");
      const comHeader =
        '// THIS FILE IS AUTO GENERATED\n"use strict";Object.defineProperty(exports, "__esModule", { value: true });\nconst core_1 = require("../core");\n';
      await fs.writeFile(
        path.resolve(DIST, icon.id, `${name}.js`),
        comHeader + comRes,
        "utf8"
      );
      const dtsRes = iconRowTemplate(icon, name, iconData, "dts");
      const dtsHeader =
        "// THIS FILE IS AUTO GENERATED\nimport { IconTree, IconType } from '../core/index.mjs'\n";
      await fs.writeFile(
        path.resolve(DIST, icon.id, `${name}.d.ts`),
        dtsHeader + dtsRes,
        "utf8"
      );

      exists.add(file);
    }
  }
};
