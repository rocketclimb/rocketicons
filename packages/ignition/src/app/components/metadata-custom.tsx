import { siteConfig } from "@/config/site";
import { serverEnv } from "@/env/server";
import { withLocale } from "@/locales";
import { AvailableLanguages, Languages } from "@/types";
import type { Metadata } from "next";

export type MetadataType = "page" | "doc" | "collection" | "icon";

export const customMetadata = (
  lang: Languages,
  type: MetadataType,
  path: string,
  title?: string,
  description?: string,
  collectionId?: string,
  iconId?: string
): Metadata => {
  const { name, url, defaultLocale } = siteConfig;
  const brand = withLocale(lang).config("brand");

  const pageTitle =
    `${title ?? name}` +
    (title?.endsWith(siteConfig.name) ? "" : ` | ${name} | ${brand["title-suffix"]}`);
  const pageDescription = description ?? brand.description;

  const finalOpenGraphImageUrl = getOpenGraphImage(lang, type, path, collectionId, iconId);

  const ogImagesArray = [
    {
      url: finalOpenGraphImageUrl.toString(),
      type: "image/png",
      width: 1200,
      height: 630,
      alt: pageTitle
    }
  ];

  let canonicalUrl;

  let languagesObj;

  if (type === "doc") {
    const basePath = "docs";
    canonicalUrl = new URL(`${lang}/${basePath}/${path}`, url);

    languagesObj = AvailableLanguages.reduce((reduced, language) => {
      const doc = withLocale(language).doc(path);

      return {
        ...reduced,
        [language]: new URL(`${url}/${language}/${basePath}/${doc.slug}`).toString()
      };
    }, {});
  } else if (type === "collection" || type === "icon") {
    const basePath = "icons";

    canonicalUrl = new URL(`${lang}/${basePath}/${collectionId}`, url);

    if (iconId) {
      canonicalUrl = new URL(`${lang}/${collectionId}/${iconId}`, url);
    }

    languagesObj = AvailableLanguages.reduce((reduced, language) => {
      let localeUrl = new URL(`${url}/${language}/${basePath}/${collectionId}`);

      if (iconId) {
        localeUrl = new URL(`${collectionId}/${iconId}`, localeUrl);
      }

      return {
        ...reduced,
        [language]: localeUrl.toString()
      };
    }, {});
  } else {
    canonicalUrl = new URL(`${lang}/${path}`, url);

    languagesObj = AvailableLanguages.reduce((reduced, language) => {
      return {
        ...reduced,
        [language]: new URL(`${url}/${language}/${path}`).toString()
      };
    }, {});
  }

  const metadataObj: Metadata = {
    title: pageTitle,
    description: pageDescription,
    keywords: [
      "React",
      "React Native",
      "Vercel",
      "Tailwind",
      siteConfig.companyName,
      "rocketicons",
      "icons"
    ],
    authors: [
      {
        name: name,
        url: url
      }
    ],
    creator: siteConfig.companyName,
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
    alternates: {
      canonical: canonicalUrl.toString(),
      languages: languagesObj
    },
    metadataBase: new URL(url)
  };

  return metadataObj;
};

export const getOpenGraphImage = (
  lang: string,
  type: string,
  path: string,
  collectionId?: string | undefined,
  iconId?: string | undefined
) => {
  let openGraphImagePath = `${lang}/opengraph/${type}`;

  if (collectionId) {
    openGraphImagePath = openGraphImagePath.concat(`/${collectionId}`);

    if (iconId) {
      openGraphImagePath = openGraphImagePath.concat(`/${iconId}`);
    }
  }

  const finalOpenGraphImageUrl = new URL(openGraphImagePath, `${serverEnv.NEXT_PUBLIC_APP_URL}`);

  if (path) {
    finalOpenGraphImageUrl.searchParams.append("slug", path);
  }
  return finalOpenGraphImageUrl;
};
