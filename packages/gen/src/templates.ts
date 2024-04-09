import { IconTree } from "@rocketicons/core";
import { type IconDefinition } from "./types";

export const DataTypeHeaderTemplate = `
/// <reference types="react" />
import type {
  IconType,
  CollectionDataInfo,
  IconsInfoManifest,
  IconsManifestType,
} from "../core/types";
`;

export const DataTypeFooterTemplate = `
export type CollectionInfo = CollectionDataInfo<CollectionID, License>;

export declare const loader: (
  id: CollectionID
) => Promise<
  Record<string, IconType> & { manifest: CollectionDataInfo<CollectionID, License> }
>;

export declare const IconsManifest: IconsManifestType<CollectionID, License>[];

export declare const IconsInfo: IconsInfoManifest<CollectionID, License>;
`;

export const DataIndexJsTemplate = `
// THIS FILE IS AUTO GENERATED
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const manifest_1 = require("./icons-manifest.js");
const loader_1 = require("./loader.js");
const info_1 = require("./icons-info.js");
exports.IconsManifest = void 0;
const IconsManifest = (0, manifest_1.IconsManifest);
exports.IconsManifest = IconsManifest;
exports.loader = void 0;
const loader = (0, loader_1.loader);
exports.loader = loader;
exports.IconsInfo = void 0;
const IconsInfo = (0, info_1);
exports.IconsInfo = IconsInfo;
`;

export const iconRowTemplate = (
  _icon: IconDefinition,
  formattedName: string,
  iconData: IconTree,
  variant: string,
  type = "module"
) => {
  switch (type) {
    case "module":
      return (
        `export function ${formattedName} (props) {\n` +
        `  return IconGenerator(${JSON.stringify(
          iconData
        )}, "${variant}", "${formattedName.toLocaleLowerCase()}")(props);\n` +
        `};\n`
      );
    case "common":
      return (
        `exports.${formattedName} = void 0;\n` +
        `const ${formattedName} = (0, core_1.IconGenerator)(\n` +
        `  ${JSON.stringify(iconData)},\n` +
        `  "${variant}",\n` +
        `  "${formattedName.toLocaleLowerCase()}"\n` +
        `);\n` +
        `exports.${formattedName} = ${formattedName};\n`
      );
    case "dts":
      return `export declare const ${formattedName}: IconType;\n`;
    default:
      throw new Error(`Unknown type: ${type}`);
  }
};

export const dynamicLoaderTemplate = (icons: IconDefinition[]): string =>
  `async (id) => {\n  switch (id) {\n${icons.reduce(
    (reduced, { id }) =>
      `${reduced}    case "${id}": {return await import("../${id}")}\n`,
    ""
  )} default: {return {}}  }\n};\n`;
