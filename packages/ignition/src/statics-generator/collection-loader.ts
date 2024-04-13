import fs from "node:fs";
import { IconsManifest } from "rocketicons/data";
import { templateBuilder } from "./utils";

const OUTPUT_FILE = "./src/app/components/icons/icons-loader.tsx";

const CollectionLoaderTemplate = `
// THIS FILE IS AUTO GENERATED
import dynamic from 'next/dynamic'
import { IconType } from "rocketicons";
import { CollectionDataInfo } from "rocketicons";
import { CollectionID, License } from "rocketicons/data";

export type HandlerPros = {
  manifest: CollectionDataInfo<CollectionID, License>
  collection: Record<string, IconType>;
}

type IconsLoaderProps<T extends HandlerPros> = {
  collectionId: CollectionID;
  Handler: (props: T) => JSX.Element;
  Loading?: () => JSX.Element;
} & Omit<T, keyof HandlerPros>;

const IconsLoader = <T extends HandlerPros>({
  collectionId,
  Handler,
  Loading,
  ...props
}: IconsLoaderProps<T>) => {
  Loading = Loading || (() => <p>Loading...</p>);
{0}
}

export default IconsLoader;
`;

const ItemTemplate = `
  const Icons{0} = dynamic(
    async () => {
      const {
        manifest,
        default: _d,
        ...Icons
      } = await import("rocketicons/{1}");
      return () => (
        // @ts-ignore
        <Handler manifest={manifest} collection={Icons} {...props} />
      );
    },
    {
      loading: () => <Loading />,
    }
  );
`;

const ConditionalTemplate = `
  if ( collectionId === "{1}" ) {
    return <Icons{0} />;
  }
`;

const generator = async () => {
  const items: string[] = [];
  const conditionals: string[] = [];

  IconsManifest.forEach(({ id }) => {
    items.push(templateBuilder(ItemTemplate, id.toUpperCase(), id));
    conditionals.push(
      templateBuilder(ConditionalTemplate, id.toUpperCase(), id)
    );
  });

  await fs.writeFileSync(
    OUTPUT_FILE,
    templateBuilder(
      CollectionLoaderTemplate,
      items.join("") + conditionals.join("")
    )
  );
};

generator();
