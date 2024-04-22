import fs from "node:fs";
import { IconsManifest } from "rocketicons/data";
import { templateBuilder, write } from "./utils";

const OUTPUT_FILE = "icons/tastes-loader.ts";

const TastesLoaderTemplate = `
// THIS FILE IS AUTO GENERATED
import { IconType } from "rocketicons";
import { CollectionID } from "rocketicons/data";
{0}

const tastes: Record<CollectionID, IconType[]> = {{1}
};

const TasteLoader = (id: CollectionID): IconType[] => tastes[id];

export default TasteLoader;
`;

const ImportTemplate = `
import { {0} } from "rocketicons/{1}";
`;

const ConditionalTemplate = `
  "{1}": [{0}],`;

const generator = async () => {
  const imports: string[] = [];
  const conditionals: string[] = [];

  IconsManifest.forEach(({ id, icons }) => {
    const selected = icons.splice(0, 10);
    imports.push(
      templateBuilder(
        ImportTemplate,
        selected.map((icon) => `${icon} as ${icon}_${id}`).join(", "),
        id
      )
    );
    conditionals.push(
      templateBuilder(
        ConditionalTemplate,
        selected.map((icon) => `${icon}_${id}`).join(", "),
        id
      )
    );
  });

  await write(
    OUTPUT_FILE,
    templateBuilder(
      TastesLoaderTemplate,
      imports.join(""),
      conditionals.join("")
    )
  );
};

generator();
