import { templateBuilder, write } from "./utils";
import { IconsManifest } from "@/app/data-helpers/icons/manifest-from-public";

const OUTPUT_FILE = "icons/icons-loader.tsx";

const CollectionLoaderTemplate = `
// ICONS LOADER - OPTIMIZED FOR PUBLIC JSON ICONS (NO BUNDLING)
import { CollectionID } from "@/app/components/icons/types";
import { PublicJSONIcon } from "@/app/components/icons/public-json-icon";
import { IconsManifest } from "@/app/data-helpers/icons/manifest-from-public";

// Local types to avoid bundling rocketicons
export type HandlerPros = {
  manifest: {
    iconsManifest: Record<string, {
      id: string;
      name: string;
      compName: string;
      variant: string;
    }>;
  };
  collection: Record<string, any>;
};

type AdditionalProps<T extends HandlerPros> = Omit<T, keyof HandlerPros>;

type IconsLoaderProps<T extends HandlerPros> = {
  collectionId: CollectionID;
  Handler: (props: T) => JSX.Element;
  Loading?: () => JSX.Element;
} & AdditionalProps<T>;

// Create collection using real manifest data and PublicJSONIcon
const createCollectionFromManifest = (collectionId: CollectionID) => {
  // Get the real manifest data for this collection
  const collectionInfo = IconsManifest.find(c => c.id === collectionId);
  
  if (!collectionInfo || !collectionInfo.iconsManifest) {
    console.warn(\`No manifest found for collection: \${collectionId}\`);
    return { collection: {}, manifest: { iconsManifest: {} } };
  }

  const collection: Record<string, any> = {};
  
  // Create PublicJSONIcon components for each icon using the real manifest data
  Object.values(collectionInfo.iconsManifest).forEach((iconData) => {
    const { compName, id } = iconData;
    collection[compName] = (props: any) => (
      <PublicJSONIcon collection={collectionId} iconId={id} {...props} />
    );
  });

  const manifest = {
    iconsManifest: collectionInfo.iconsManifest
  };

  return { collection, manifest };
};

// Collection loaders using real manifest data
const createCollectionLoader = (collectionId: CollectionID) => {
  const CollectionLoader = <T extends HandlerPros>(
    Handler: (props: T) => JSX.Element,
    Loading: () => JSX.Element,
    props: AdditionalProps<T>
  ) => {
    const { collection, manifest } = createCollectionFromManifest(collectionId);
    
    // @ts-ignore
    return <Handler manifest={manifest} collection={collection} {...props} />;
  };
  
  CollectionLoader.displayName = \`\${collectionId.toUpperCase()}CollectionLoader\`;
  return CollectionLoader;
};

// Create loaders for all collections
const loadersMap = new Map<CollectionID, any>([{0}]);

const IconsLoader = <T extends HandlerPros>({
  collectionId,
  Handler,
  Loading,
  ...props
}: IconsLoaderProps<T>) => {
  Loading = Loading || (() => <p>Loading...</p>);

  try {
    const loader = loadersMap.get(collectionId) ?? loadersMap.get("rc");
    if (!loader) {
      console.warn(\`No loader found for collection: \${collectionId}\`);
      return <Loading />;
    }

    // @ts-ignore
    const Collection = loader(Handler, Loading, props);
    return Collection;
  } catch (error) {
    console.error(\`Error loading collection \${collectionId}:\`, error);
    return <Loading />;
  }
};

export default IconsLoader;
`;

const ItemTemplate = `
  ["{0}", createCollectionLoader("{0}")],`;

const generator = async () => {
  const items: string[] = [];

  // Use all collections from IconsManifest instead of getManifest() to avoid local limitations
  IconsManifest.forEach(({ id }) => {
    items.push(templateBuilder(ItemTemplate, id));
  });

  await write(OUTPUT_FILE, templateBuilder(CollectionLoaderTemplate, items.join("")));
};

generator();
