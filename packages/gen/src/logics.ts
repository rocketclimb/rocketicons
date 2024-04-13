import { promises as fs } from "fs";
import {
  Cheerio,
  load as cheerioLoad,
  Element as CheerioElement,
} from "cheerio";
import camelcase from "camelcase";
// const camelcase = (text: string, options: any) => text;

import { IconTree, Variants, IconsManifestType } from "@rocketicons/core";

import { type IconDefinitionContent } from "./types";

import { glob } from "./glob";

export const getIconFiles = async (content: IconDefinitionContent) => {
  if (typeof content.files === "string") {
    const pattern = content.files.replace(/\\/g, "/"); // convert windows path
    return glob(pattern);
  }
  return content.files();
};

export const convertIconData = async (
  svg: string,
  multiColor: boolean | undefined
): Promise<{ iconData: IconTree; variant: Variants }> => {
  const $doc = cheerioLoad(svg, { xmlMode: true });
  const $svg = $doc("svg");
  const colorProps: Record<string, boolean> = {
    fill: false,
    stroke: false,
  };

  // filter/convert attributes
  // 1. remove class attr
  // 2. convert to camelcase ex: fill-opacity => fillOpacity
  const attrConverter = (attribs: Record<string, string>, tagName: string) =>
    attribs &&
    Object.keys(attribs)
      .filter(
        (name) =>
          ![
            "class",
            ...(tagName === "svg"
              ? ["xmlns", "xmlns:xlink", "xml:space", "width", "height"]
              : []), // if tagName is svg remove size attributes
          ].includes(name)
      )
      .reduce((obj, name) => {
        const newName = name.startsWith("aria-") ? name : camelcase(name);
        switch (newName) {
          case "fill":
          case "stroke":
            if (
              attribs[name] === "none" ||
              attribs[name] === "currentColor" ||
              multiColor
            ) {
              obj[newName] = attribs[name];
            }
            colorProps[name] =
              attribs[name] !== "none" ? true : colorProps[name];
            break;
          case "pId":
            break;
          case "dataName":
            break;
          case "style":
            break;
          default:
            obj[newName] = attribs[name];
            if (!colorProps["stroke"] && newName.match(/^stroke/)) {
              colorProps["stroke"] = true;
            }
            break;
        }
        return obj;
      }, {} as Record<string, string>);

  // convert to [ { tag: 'path', attr: { d: 'M436 160c6.6 ...', ... }, child: { ... } } ]
  const elementToTree = (element: Cheerio<CheerioElement>): IconTree[] =>
    element
      // ignore style, title tag
      .filter(
        (_, e) => !!(e.tagName && !["style", "title"].includes(e.tagName))
      )
      // convert to AST recursively
      .map((_, e) => ({
        tag: e.tagName,
        attr: attrConverter(e.attribs, e.tagName),
        child:
          e.children && e.children.length
            ? elementToTree($doc(e.children) as Cheerio<CheerioElement>)
            : [],
      }))
      .get();

  const [iconData] = elementToTree($svg);

  const variant =
    colorProps.fill && colorProps.stroke
      ? "full"
      : colorProps.stroke
      ? "outlined"
      : "filled";

  return { iconData, variant }; // like: [ { tag: 'path', attr: { d: 'M436 160c6.6 ...', ... }, child: { ... } } ]
};

export const rmDirRecursive = async (dest: string) => {
  await fs.rm(dest, { recursive: true, force: true });
};

export const buildPackageExports = (
  icons: Omit<IconsManifestType<string, string>, "icons" | "totalIcons">[]
) => {
  const exports: Record<
    string,
    {
      types: string;
      require: string;
      import: string;
      default: string;
    }
  > = {
    ".": {
      types: "./index.d.ts",
      require: "./index.js",
      import: "./index.mjs",
      default: "./index.mjs",
    },
    "./core": {
      types: "./core/index.d.ts",
      require: "./core/index.js",
      import: "./core/index.mjs",
      default: "./core/index.mjs",
    },
    "./data": {
      types: "./data/index.d.ts",
      require: "./data/index.js",
      import: "./data/index.mjs",
      default: "./data/index.mjs",
    },
    "./tailwind": {
      types: "./tailwind/index.d.ts",
      require: "./tailwind/index.js",
      import: "./tailwind/index.mjs",
      default: "./tailwind/index.mjs",
    },
  };

  icons.forEach((icon) => {
    exports[`./${icon.id}`] = {
      types: `./${icon.id}/index.d.ts`,
      require: `./${icon.id}/index.js`,
      import: `./${icon.id}/index.mjs`,
      default: `./${icon.id}/index.mjs`,
    };
  });

  return exports;
};
