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
  slug?: string,
  collectionId?: string,
  iconId?: string
): Metadata => {
  const { name, url, defaultLocale } = siteConfig;
  const brand = withLocale(lang).config("brand");

  const pageTitle =
    `${title ?? name}` +
    (title?.endsWith(siteConfig.name) ? "" : ` | ${name} | ${brand["title-suffix"]}`);
  const pageDescription = description ?? brand.description;

  let path = `${lang}/opengraph/${type}`;

  if (collectionId) {
    path = path.concat(`/${collectionId}`);

    if (iconId) {
      path = path.concat(`/${iconId}`);
    }
  }

  const finalUrl = new URL(path, `${serverEnv.NEXT_PUBLIC_APP_URL}`);

  if (slug) {
    finalUrl.searchParams.append("slug", slug);
  }

  const ogImagesArray = [
    {
      url: finalUrl.toString(),
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
        name: name,
        url: url
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
