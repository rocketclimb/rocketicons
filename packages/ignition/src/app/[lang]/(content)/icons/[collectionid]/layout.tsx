import { CollectionID } from "rocketicons/data";

import CollectionTitleBox from "@/components/icons/icons-collection/collection-title-box";

import { IconFromData } from "@rocketicons/core";

import { PropsWithChildrenAndLangParams, AvailableLanguages } from "@/types";
import { collectionAsJson, collectionsAsJson, svgsAsJson } from "@/utils/svg-as-json";
import IconSelector from "@/components/icons/icons-collection/icon-selector";

type LayoutProps = PropsWithChildrenAndLangParams & {
  params: {
    collectionid: CollectionID;
  };
};

export const generateStaticParams = async () => {
  const collections = await collectionsAsJson();
  return AvailableLanguages.flatMap((lang) =>
    collections.map(({ id }) => ({ lang, collectionid: id }))
  );
};

const Layout = async ({ children, params: { lang, collectionid } }: LayoutProps) => {
  const info = await collectionAsJson(collectionid);
  const icons = await svgsAsJson(collectionid, info?.totalIcons);
  return (
    <div className="collection-page">
      {info && <CollectionTitleBox lang={lang} info={info} />}
      {children}
      <ul className="transition-all duration-200 ml-0 mt-10 peer-data-[open=true]/info:min-h-[655px] flex justify-between gap-x-2 gap-y-4 flex-wrap">
        {icons.map(({ iconId, name, data: { iconTree, variant } }) => {
          return (
            <li key={iconId}>
              <IconSelector lang={lang} collectionId={collectionid} id={iconId} name={name}>
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
    </div>
  );
};

export default Layout;
