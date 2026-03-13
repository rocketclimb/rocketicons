import { writeFileSync } from "fs";
import { IconTree } from "@rocketicons/utils";
import { parsePackageName } from "./manifest";
import { config } from "./config";

const preparaContent = (compName: string, data: IconTree, variant: string, id: string) =>
  `
import { IconGenerator, IconProps } from "${config.pathAlias}/core";

export function ${compName}(props: IconProps) {
  return IconGenerator(
    ${JSON.stringify(data, null, 2)},
    "${variant}",
    "${id}"
  )(props);
}
  
export default ${compName};`.trim();

const add = async (iconName: string) => {
  const { name, icon } = parsePackageName(iconName);
  try {
    const moduleName = `../${name}/manifest`;
    const svgModuleName = `../${name}/svg-data`;

    const {
      default: { manifest }
    } = await import(moduleName);

    const {
      default: { svgData }
    } = await import(svgModuleName);

    const { id, compName, variant } = manifest.icons[icon];
    const data = svgData[icon];

    const iconFile = `${config.riPath}/icons/${id}.tsx`;

    await writeFileSync(iconFile, preparaContent(compName, data, variant, id));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default add;
