import { templateBuilder, write } from "./utils";

const OUTPUT_FILE = "icons/opengraph-icons-loader.ts";

const collectionArray = [
  "rc",
  "ai",
  "bi",
  "bs",
  "cg",
  "ci",
  "di",
  "fa",
  "fa6",
  "fc",
  "fi",
  "gi",
  "go",
  "gr",
  "hi",
  "hi2",
  "im",
  "io",
  "io5",
  "lia",
  "lu",
  "md",
  "pi",
  "ri",
  "rx",
  "si",
  "sl",
  "tb",
  "tfi",
  "ti",
  "vsc",
  "wi",
];

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

  collectionArray.forEach((collection) => {
    imports.push(templateBuilder(mapItemTemplate, collection));
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
