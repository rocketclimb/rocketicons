import { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionID } from "rocketicons/data";

import { IconsManifest } from "@/data-helpers/icons/manifest";
import collections from "@/data-helpers/params/collections.json";

import CollectionTitleBox from "@/components/icons/icons-collection/collection-title-box";
import IconInfoPanel from "@/components/icons/icons-collection/icon-info-panel";
import IconInfo from "@/components/icons/icons-collection/icon-info";
import IconsCollection from "@/components/icons/icons-collection";

import { withLocale } from "@/locales";
import { PropsWithLangParams } from "@/types";
import { asCompName } from "@/components/icons/get-icons-data";
import customMetadata from "@/app/components/metadata-custom";

type PageProps = PropsWithLangParams & {
  params: {
    collectionid: CollectionID;
  };
  searchParams: Record<string, string>;
};

export const dynamicParams = false;

export const generateStaticParams = () => collections;

export const generateMetadata = async ({
  params: { lang, collectionid: id },
  searchParams: { i: icon }
}: PageProps): Promise<Metadata> => {
  const info = IconsManifest.find(({ id: search }) => search === id)!;

  const { component } = withLocale(lang);
  const { title, description } = component("icons-collection");

  const pageTitle = `${title} | ${info?.name} ${icon || ""}`;

  const openGrapgImageType = icon ? "icon" : "collection";

  return customMetadata(lang, openGrapgImageType, `icons`, pageTitle, description, id, icon);
};

const Page = ({ params: { lang, collectionid }, searchParams: { i: iconId } }: PageProps) => {
  const info = IconsManifest.find(({ id: search }) => search === collectionid)!;

  if (!info || (iconId && !info.icons.includes(asCompName(iconId)))) {
    return notFound();
  }

  return (
    <div className="collection-page">
      <CollectionTitleBox lang={lang} info={info} />
      <IconInfoPanel selected={!!iconId}>
        {iconId && <IconInfo lang={lang} collectionId={collectionid} iconId={iconId} />}
      </IconInfoPanel>
      <IconsCollection lang={lang} id={collectionid} icon={iconId} />
    </div>
  );
};

export default Page;
