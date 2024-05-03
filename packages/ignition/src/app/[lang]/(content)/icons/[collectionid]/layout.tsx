import { PropsWithChildren } from "react";
import { CollectionID } from "rocketicons/data";

import { IconsManifest } from "@/data-helpers/icons/manifest";
import icons from "@/data-helpers/params/icons.json";

import { PropsWithLangParams } from "@/types";

import CollectionTitleBox from "@/app/components/icons/icons-collection/collection-title-box";
import IconInfoPanel from "@/components/icons/icons-collection/icon-info-panel";

import IconsCollection from "@/components/icons/icons-collection";

type LayoutProps = PropsWithLangParams & {
  params: {
    collectionid: CollectionID;
  };
} & PropsWithChildren;

export const generateStaticParams = () => icons;

const Layout = ({ children, params: { lang, collectionid } }: LayoutProps) => {
  const info = IconsManifest.find(({ id: search }) => search === collectionid)!;

  return (
    <div className="collection-page">
      <CollectionTitleBox lang={lang} info={info} />
      <IconInfoPanel>{children}</IconInfoPanel>
      <IconsCollection lang={lang} id={collectionid} />
    </div>
  );
};

export default Layout;
