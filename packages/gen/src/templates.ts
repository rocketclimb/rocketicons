import { IconTree } from "@rocket-climb/bolt-core";
import type { IconDefinition } from "./types";

export const ManifestTypeTemplate = `
  type IconsManifestType = {
    id: string;
    name: string;
    projectUrl: string;
    license: string;
    licenseUrl: string;
  };
  export declare const IconsManifest: IconsManifestType[];
`;

export function iconRowTemplate(
  _icon: IconDefinition,
  formattedName: string,
  iconData: IconTree,
  variant: string,
  type = "module"
) {
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
}
