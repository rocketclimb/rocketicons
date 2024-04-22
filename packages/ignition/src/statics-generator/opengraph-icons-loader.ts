import { IconsManifest } from "rocketicons/data";
import { templateBuilder, write } from "./utils";

const OUTPUT_FILE = "icons/opengraph-icons-loader.ts";

const fileTemplate = `
// THIS FILE IS AUTO GENERATED

{0}
{1}{2}

{3}
`;

const mapOpenTemplate = `const opengraphIconLoader = new Map<string, () => Promise<any>>([`;

const mapCloseTemplate = `]);`;

const exportTemplate = `export default opengraphIconLoader;`;

const mapItemTemplate = `  ["{0}", () => import("rocketicons/{0}")],
`;

const generator = async () => {
  const imports: string[] = [];

  IconsManifest.forEach(({ id }) => {
    imports.push(templateBuilder(mapItemTemplate, id));
  });

  await write(
    OUTPUT_FILE,
    templateBuilder(
      fileTemplate,
      mapOpenTemplate,
      imports.join(""),
      mapCloseTemplate,
      exportTemplate
    )
  );
};

generator();
