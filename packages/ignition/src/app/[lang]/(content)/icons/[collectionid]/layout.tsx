import { CollectionID } from "rocketicons/data";

import CollectionTitleBox from "@/components/icons/icons-collection/collection-title-box";

import { IconFromData } from "@rocketicons/core";

import { PropsWithChildrenAndLangParams, AvailableLanguages } from "@/types";
import { getCollection, getCollectionIcons, getCollections } from "@/catalog/server";
import IconSelector from "@/components/icons/icons-collection/icon-selector";
import IconInfoProvider from "@/components/icons/icons-collection/icon-info/provider";
import { Suspense } from "react";
import type { Metadata } from "next";
import { customMetadata } from "@/components/metadata-custom";

type LayoutProps = PropsWithChildrenAndLangParams & {
  params: {
    collectionid: CollectionID;
  };
};

export const generateStaticParams = async () => {
  const collections = await getCollections();
  return AvailableLanguages.flatMap((lang) =>
    collections.map(({ id }) => ({ lang, collectionid: id }))
  );
};

export const dynamicParams = false;

export const generateMetadata = async ({
  params: { lang, collectionid }
}: LayoutProps): Promise<Metadata> => {
  const collection = await getCollection(collectionid);
  return customMetadata(
    lang,
    "collection",
    "",
    collection.name,
    `${collection.name}: ${collection.totalIcons} Rocketicons components for React and React Native.`,
    collectionid
  );
};

const Layout = async ({ children, params: { lang, collectionid } }: LayoutProps) => {
  const info = await getCollection(collectionid);
  const icons = await getCollectionIcons(collectionid);
  return (
    <div className="collection-page">
      {info && <CollectionTitleBox lang={lang} info={info} />}
      <IconInfoProvider lang={lang} collectionId={collectionid} />
      {children}
      <Suspense fallback={null}>
        <ul className="transition-all duration-200 ml-0 mt-10 peer-data-[open=true]/info:min-h-[655px] flex justify-between gap-x-2 gap-y-4 flex-wrap">
        {icons.map(({ id, name, iconTree, variant }) => {
            return (
              <li key={id}>
                <IconSelector lang={lang} collectionId={collectionid} id={id} name={name}>
                  <IconFromData
                    className={
                      "transition-all duration-200 transform-gpu icon-secondary-medium-3xl group-hover/button:icon-secondary-medium-4xl dark:icon-secondary-3xl group-hover/button:dark:icon-secondary-4xl xs:icon-secondary-medium-4xl group-hover/button:xs:icon-secondary-medium-5xl dark:xs:icon-secondary-4xl group-hover/button:dark:xs:icon-secondary-5xl"
                    }
                    iconTree={iconTree}
                    variant={variant}
                  />
                </IconSelector>
              </li>
            );
          })}
        </ul>
      </Suspense>
    </div>
  );
};

export default Layout;
