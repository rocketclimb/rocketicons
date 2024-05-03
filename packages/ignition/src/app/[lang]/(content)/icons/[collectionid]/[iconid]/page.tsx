import { Metadata } from "next";
import { CollectionID } from "rocketicons/data";
import { IconsManifest } from "@/data-helpers/icons/manifest";

import { withLocale } from "@/locales";
import { PropsWithLangParams } from "@/types";

import IconInfo from "@/app/components/icons/icons-collection/icon-info";

import { serverEnv } from "@/env/server";
import { siteConfig } from "@/config/site";
import CustomMetadata from "@/app/components/metadata-custom";

type PageProps = PropsWithLangParams & {
  params: {
    collectionid: CollectionID;
    iconid: string;
  };
};

export const generateMetadata = async ({
  params: { lang, collectionid: id, iconid: icon }
}: PageProps): Promise<Metadata> => {
  const info = IconsManifest.find(({ id: search }) => search === id)!;

  const { component } = withLocale(lang);
  const { title, description } = component("icons-collection");

  const pageTitle = `${title} | ${info?.name} ${icon || ""} | rocketicons`;

  return CustomMetadata(lang, pageTitle, description);
};

const Page = ({ params: { lang, collectionid, iconid: iconId } }: PageProps) => (
  <IconInfo lang={lang} collectionId={collectionid} iconId={iconId} />
);

export default Page;
