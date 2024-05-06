import { siteConfig } from "@/config/site";
import { serverEnv } from "@/env/server";
import { withLocale } from "@/locales";
import { Languages } from "@/types";
import type { Metadata } from "next";

export type OpenGraphImageType = "page" | "doc" | "collection" | "icon";

const customMetadata = (
  lang: Languages,
  type: OpenGraphImageType,
  title?: string,
  description?: string,
  subheading?: string,
  collectionId?: string,
  iconId?: string
): Metadata => {
  const { name, url, defaultLocale } = siteConfig;
  const brand = withLocale(lang).config("brand");

  const pageTitle =
    `${title ?? name}` +
    (title?.endsWith(siteConfig.name) ? "" : ` | ${name} | ${brand["title-suffix"]}`);
  const pageDescription = description ?? brand.description;

  let openGraphImageUrl = `${serverEnv.NEXT_PUBLIC_APP_URL}/${lang}/opengraph/${type}`;

  if (collectionId) {
    openGraphImageUrl = openGraphImageUrl.concat(`/${collectionId}`);
  }

  if (iconId) {
    openGraphImageUrl = openGraphImageUrl.concat(`/${iconId}`);
  }

  openGraphImageUrl = openGraphImageUrl.concat(`?x=1`);

  if (subheading) {
    openGraphImageUrl = openGraphImageUrl.concat(`&subheading=${subheading}`);
  }

  if (title) {
    openGraphImageUrl = openGraphImageUrl.concat(`&title=${title}`);
  }

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
    description: pageDescription,
    keywords: [
      "React",
      "React Native",
      "Vercel",
      "Tailwind",
      "rocketclimb",
      "rocketicons",
      "icons"
    ],
    authors: [
      {
        name: "RocketClimb",
        url: "https://rocketclimb.io"
      }
    ],
    creator: "RocketClimb",
    openGraph: {
      type: "website",
      locale: lang || defaultLocale,
      url: `${serverEnv.NEXT_PUBLIC_APP_URL}`,
      title: pageTitle,
      description: pageDescription,
      siteName: name,
      images: ogImagesArray
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      site: name,
      description,
      creator: "@therocketclimb",
      images: ogImagesArray
    },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon-16x16.png"
    },
    metadataBase: new URL(url)
  };
};

export default customMetadata;
