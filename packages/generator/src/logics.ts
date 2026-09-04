import fs from "node:fs";
import path from "node:path";
import { elementToTree } from "@rocketicons/utils";

import { IconTree, Variants, IconsManifestType } from "@rocketicons/core";

import { type IconDefinitionContent, PackageExports } from "./types";

import { glob } from "./glob";

export const getIconFiles = async (content: IconDefinitionContent) => {
  const files =
    typeof content.files === "string"
      ? await glob(content.files.replace(/\\/g, "/"))
      : await content.files();
  if (files.length === 0) {
    throw new Error(`No SVG files found for icon source: ${content.files}`);
  }
  return files.sort();
};

export const convertIconData = async (
  svg: string,
  multiColor: boolean | undefined
): Promise<{ iconData: IconTree; variant: Variants }> => {
  const colorProps: Record<string, boolean> = {
    fill: false,
    stroke: false
  };

  const [iconData] = elementToTree(svg, multiColor, colorProps);

  const getVariant = (): "full" | "outlined" | "filled" => {
    if (colorProps.fill && colorProps.stroke) {
      return "full";
    }

    return colorProps.stroke ? "outlined" : "filled";
  };

  const variant = getVariant();

  if (["filled", "full"].includes(variant) && !iconData.attr?.fill) {
    iconData.attr.fill = "currentColor";
  }

  if (["outlined", "full"].includes(variant) && !iconData.attr?.stroke) {
    iconData.attr.stroke = "currentColor";
  }

  return { iconData, variant }; // like: [ { tag: 'path', attr: { d: 'M436 160c6.6 ...', ... }, child: { ... } } ]
};

export const rmDirRecursive = async (dest: string, ignore: string[] = []) => {
  fs.readdirSync(dest)
    .filter((file) => !ignore.includes(file))
    .forEach((file) => fs.rmSync(path.join(dest, file), { recursive: true, force: true }));
};

export const buildPackageExports = (
  icons: Omit<IconsManifestType<string, string>, "icons" | "totalIcons">[]
) => {
  const exports: PackageExports = {
    ".": {
      types: "./index.d.ts",
      require: "./index.js",
      import: "./index.mjs",
      default: "./index.mjs"
    },
    "./core": {
      types: "./core/index.d.ts",
      require: "./core/index.js",
      import: "./core/index.mjs",
      default: "./core/index.mjs"
    },
    "./core/utils": {
      types: "./core/utils/index.d.ts",
      require: "./core/utils/index.js",
      import: "./core/utils/index.mjs",
      default: "./core/utils/index.mjs"
    },
    "./data": {
      types: "./data/index.d.ts",
      require: "./data/index.js",
      import: "./data/index.mjs",
      default: "./data/index.mjs"
    },
    "./tailwind": {
      types: "./tailwind/index.d.ts",
      require: "./tailwind/index.js",
      import: "./tailwind/index.mjs",
      default: "./tailwind/index.mjs"
    }
  };

  icons.forEach((icon) => {
    exports[`./${icon.id}`] = {
      types: `./${icon.id}/index.d.ts`,
      require: `./${icon.id}/index.js`,
      import: `./${icon.id}/index.mjs`,
      default: `./${icon.id}/index.mjs`
    };
  });

  return {
    ...exports,
    "./package.json": {
      default: "./package.json"
    }
  } as PackageExports;
};
