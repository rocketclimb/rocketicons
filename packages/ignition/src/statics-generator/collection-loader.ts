import { getManifest, templateBuilder, write } from "./utils";

const OUTPUT_FILE = "icons/icons-loader.tsx";

const CollectionLoaderTemplate = `
// THIS FILE IS AUTO GENERATED
import dynamic from 'next/dynamic'
import { IconType, CollectionDataInfo } from "rocketicons";
import { CollectionID, License } from "rocketicons/data";

export type HandlerPros = {
  manifest: CollectionDataInfo<CollectionID, License>;
  collection: Record<string, IconType>;
};

type AdditionalProps<T extends HandlerPros> = Omit<T, keyof HandlerPros>;

type DynamicLoaderProps<T extends HandlerPros> = {
  Handler: (props: T) => JSX.Element;
  Loading: () => JSX.Element;
} & AdditionalProps<T>;

type IconsLoaderProps<T extends HandlerPros> = {
  collectionId: CollectionID;
  Handler: (props: T) => JSX.Element;
  Loading?: () => JSX.Element;
} & AdditionalProps<T>;

const loadersMap = new Map([{0}]);

const IconsLoader = <T extends HandlerPros>({
  collectionId,
  Handler,
  Loading,
  ...props
}: IconsLoaderProps<T>) => {
  Loading = Loading || (() => <p>Loading...</p>);

  // @ts-ignore
  const Collection = (loadersMap.get(collectionId) ?? loadersMap.get("rc"))(Handler, Loading, props);
  return <Collection />
}

export default IconsLoader;
`;

const ItemTemplate = `
  ["{0}", <T extends HandlerPros>(Handler: (props: T) => JSX.Element, Loading: () => JSX.Element, props: DynamicLoaderProps<T>) => dynamic(
    async () => {
      const {
        manifest,
        default: _d,
        ...Icons
      } = await import("rocketicons/{0}");
      return function {1}Loader () {
        // @ts-ignore
        return <Handler manifest={manifest} collection={Icons} {...props} />
      };
    },
    {
      loading: () => <Loading />,
    }
  )],
`;

const generator = async () => {
  const items: string[] = [];

  getManifest().forEach(({ id }) => {
    items.push(templateBuilder(ItemTemplate, id, id.toUpperCase()));
  });

  await write(
    OUTPUT_FILE,
    templateBuilder(CollectionLoaderTemplate, items.join(""))
  );
};

generator();
