import { CollectionID } from "rocketicons/data";

import { IconsManifest } from "@/data-helpers/icons/manifest";
import collections from "@/data-helpers/params/collections.json";

import CollectionTitleBox from "@/components/icons/icons-collection/collection-title-box";
import IconsCollection from "@/components/icons/icons-collection";

import { PropsWithChildrenAndLangParams } from "@/types";

type LayoutProps = PropsWithChildrenAndLangParams & {
  params: {
    collectionid: CollectionID;
  };
};

export const generateStaticParams = () => collections;

const Layout = ({ children, params: { lang, collectionid } }: LayoutProps) => {
  const info = IconsManifest.find(({ id: search }) => search === collectionid);
  return (
    <div className="collection-page">
      {info && <CollectionTitleBox lang={lang} info={info} />}
      {children}
      <IconsCollection lang={lang} id={collectionid} />
    </div>
  );
};

export default Layout;
