import { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionID } from "rocketicons/data";

import IconInfoPanel from "@/components/icons/icons-collection/icon-info/panel";
import IconInfoLoader from "@/components/icons/icons-collection/icon-info/loader";

import { withLocale } from "@/locales";
import { PropsWithLangParams } from "@/types";
import { customMetadata } from "@/app/components/metadata-custom";
import { collectionAsJson, svgAsJson } from "@/utils/svg-as-json";

type PageProps = PropsWithLangParams & {
  params: {
    collectionid: CollectionID;
    iconid: string;
  };
};

export const generateStaticParams = () => [{ iconid: "collection-index.ri" }];

const getIconFromParam = (iconParam: string): string | false =>
  iconParam !== "collection-index.ri" && iconParam;

export const generateMetadata = async ({
  params: { lang, collectionid: id, iconid }
}: PageProps): Promise<Metadata> => {
  const info = await collectionAsJson(id);
  const icon = getIconFromParam(iconid);

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

const Page = async ({ params: { lang, collectionid, iconid } }: PageProps) => {
  const info = await collectionAsJson(collectionid);
  const iconId = getIconFromParam(iconid);

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
