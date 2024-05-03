import { Metadata } from "next";
import { CollectionID } from "rocketicons/data";
import { IconsManifest } from "@/data-helpers/icons/manifest";

import { withLocale } from "@/locales";
import { PropsWithLangParams } from "@/types";

import IconInfo from "@/app/components/icons/icons-collection/icon-info";

import { serverEnv } from "@/env/server";
import { siteConfig } from "@/config/site";

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
  const { name } = siteConfig;

  const { component } = withLocale(lang);
  const { title, description } = component("icons-collection");

  const pageTitle = `${title} | ${info?.name} ${icon || ""} | rocketicons`;

  const openGraphImageUrl =
    `${serverEnv.NEXT_PUBLIC_APP_URL}/${lang}/opengraph/${id}` + (icon ? `/${icon}` : "");

  const ogImagesArray = [
    {
      url: openGraphImageUrl,
      type: "image/png",
      width: 1200,
      height: 630,
      alt: pageTitle
    }
  ];

  return {
    title: pageTitle,
    description,
    openGraph: {
      title: pageTitle,
      description,
      url: `${serverEnv.NEXT_PUBLIC_APP_URL}`,
      siteName: name,
      images: ogImagesArray
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      site: name,
      description,
      creator: "@rocketclimb",
      images: ogImagesArray
    }
  };
};

const Page = ({ params: { lang, collectionid, iconid: iconId } }: PageProps) => (
  <IconInfo lang={lang} collectionId={collectionid} iconId={iconId} />
);

export default Page;
