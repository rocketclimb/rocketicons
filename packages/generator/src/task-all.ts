import path from "path";
import { promises as fs } from "fs";
import camelcase from "camelcase";
import { optimize as svgoOptimize } from "svgo";
import { IconTree, IconsInfoManifest } from "@rocketicons/core";
import { icons } from "./definitions";
import { iconRowTemplate } from "./templates";
import { getIconFiles, convertIconData, rmDirRecursive, elementToTree } from "./logics";
import { svgoConfig } from "./svgo-config";
import { IconDefinition, IconDefinitionContent, TaskContext } from "./types";

import kebabCase from "./kebab-case";

const getName = (file: string, content: IconDefinitionContent): string => {
  const rawName = path.basename(file, path.extname(file));
  const pascalName = camelcase(rawName, { pascalCase: true });
  return content?.formatter(pascalName, file) || pascalName;
};

const nameToManifest = (icon: IconDefinition, name: string): string => {
  const compPrefix = icon?.compPrefix ?? icon.id;
  const manifest = kebabCase(name.substring(compPrefix.length));
  return manifest || name.toLowerCase().replace(icon.id, "");
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ignore = (err: any) => {
  if (err?.code === "EEXIST") return;
  throw err;
};

export const write = (str: string, ROOT: string, ...filePath: string[]) =>
  fs.writeFile(path.resolve(ROOT, ...filePath), str, "utf8").catch(ignore);

export const mkdir = (ROOT: string, ...filePath: string[]) =>
  fs.mkdir(path.resolve(ROOT, ...filePath)).catch(ignore);

export const dirInit = async ({ DIST, LIB, PLUGIN, DATA, SVGS }: TaskContext) => {
  await rmDirRecursive(DIST, ["package.json", "CHANGELOG.md"]);
  await fs.mkdir(DIST, { recursive: true }).catch(ignore);
  await fs.mkdir(LIB).catch(ignore);
  await fs.mkdir(PLUGIN).catch(ignore);
  await fs.mkdir(DATA).catch(ignore);
  await fs.mkdir(SVGS).catch(ignore);

  const initFiles = ["index.d.ts", "index.mjs", "index.js"];

  for (const icon of icons) {
    await mkdir(DIST, icon.id);

    await write(
      '// THIS FILE IS AUTO GENERATED\n"use strict";\nObject.defineProperty(exports, "__esModule", { value: true });\nconst core_1 = require("../core");\nconst manifest_1 = require("./manifest.js");\n',
      DIST,
      icon.id,
      "index.js"
    );
    await write(
      "// THIS FILE IS AUTO GENERATED\nimport { IconGenerator } from '../core/index.mjs';\n",
      DIST,
      icon.id,
      "index.mjs"
    );
    await write(
      `// THIS FILE IS AUTO GENERATED\nimport type { IconType, CollectionDataInfo } from '../core/types'\nexport declare const manifest: CollectionDataInfo<"${icon.id}", "${icon.license}">;\n`,
      DIST,
      icon.id,
      "index.d.ts"
    );
    await write(
      JSON.stringify(
        {
          sideEffects: false,
          module: "./index.mjs"
        },
        null,
        2
      ) + "\n",
      DIST,
      icon.id,
      "package.json"
    );
  }

  for (const file of initFiles) {
    await write("// THIS FILE IS AUTO GENERATED\n", DIST, file);
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

      const name = getName(file, content);
      if (exists.has(name)) continue;
      exists.add(name);

      // write like: module/fa/index.mjs
      const modRes = iconRowTemplate(icon, name, iconData, variant, "module");
      await fs.appendFile(path.resolve(DIST, icon.id, "index.mjs"), modRes, "utf8");
      const comRes = iconRowTemplate(icon, name, iconData, variant, "common");

      await fs.appendFile(path.resolve(DIST, icon.id, "index.js"), comRes, "utf8");
      const dtsRes = iconRowTemplate(icon, name, iconData, variant, "dts");
      await fs.appendFile(path.resolve(DIST, icon.id, "index.d.ts"), dtsRes, "utf8");

      const manifestName = nameToManifest(icon, name);

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

export const writeSvgs = async (
  icon: IconDefinition,
  { SVGS }: TaskContext,
  iconInfoManifest: IconsInfoManifest<string, string>
) => {
  const exists = new Set(); // for remove duplicate

  const tree2Svg = ({ tag, attr, child }: IconTree): string => {
    const attrToString = (Object.entries(attr) as [string, string][])
      .map(([key, value]) => `${key}="${value}"`)
      .join(" ");

    const childToString = child.map((c) => tree2Svg(c)).join("\n");

    return (
      `<${tag} ${attrToString}` + (childToString ? `>\n  ${childToString}\n</${tag}>` : "/>")
    );
  };

  for (const content of icon.contents) {
    await mkdir(SVGS, icon.id);
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
      const [iconData] = elementToTree(svgStr, content.multiColor);

      const name = getName(file, content);

      await write(tree2Svg(iconData), SVGS, icon.id, `${nameToManifest(icon, name)}.svg`);
      exists.add(file);
    }
  }
};
