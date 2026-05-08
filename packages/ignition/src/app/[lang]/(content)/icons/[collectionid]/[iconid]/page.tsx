import { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionID } from "rocketicons/data";

import IconInfoPanel from "@/components/icons/icons-collection/icon-info/panel";
import IconInfoLoader from "@/components/icons/icons-collection/icon-info/loader";

import { withLocale } from "@/locales";
import { PropsWithLangParams } from "@/types";
import { customMetadata } from "@/app/components/metadata-custom";
import { collectionAsJson, svgAsJson } from "@/utils/svg-as-json";

type PageProps = {
  params: Promise<{
    lang: import("@/types").Languages;
    collectionid: CollectionID;
    iconid: string;
  }>;
};

export const generateMetadata = async (props: PageProps): Promise<Metadata> => {
  const { lang, collectionid: id, iconid } = await props.params;
  const info = await collectionAsJson(id);
  const icon = iconid;

  const { component } = withLocale(lang);
  const { title, description } = component("icons-collection");

  const pageTitle = `${title} | ${info?.name} ${icon || ""}`;

  const openGrapgImageType = icon ? "icon" : "collection";

  return customMetadata(
    lang,
    openGrapgImageType,
    `icons`,
    pageTitle,
    description,
    id,
    icon || undefined
  );
};

const Page = async (props: PageProps) => {
  const params = await props.params;

  const { lang, collectionid, iconid } = params;

  const info = await collectionAsJson(collectionid);
  const iconId = iconid;

  if (!info || (iconId && !(await svgAsJson(collectionid, iconId)))) {
    return notFound();
  }

  return (
    <IconInfoPanel selected={!!iconId}>
      {iconId && <IconInfoLoader lang={lang} collectionId={collectionid} iconId={iconId} />}
    </IconInfoPanel>
  );
};

export default Page;
