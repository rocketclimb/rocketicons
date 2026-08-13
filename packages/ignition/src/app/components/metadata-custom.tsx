import { getSiteOrigin } from "@/config/site-origin";
import { siteConfig } from "@/config/site";
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
  const { name, defaultLocale } = siteConfig;
  const origin = getSiteOrigin();
  const brand = withLocale(lang).config("brand");
  const pageTitle =
    `${title ?? name}` +
    (title?.endsWith(siteConfig.name) ? "" : ` | ${name} | ${brand["title-suffix"]}`);
  const pageDescription = description ?? brand.description;
  const imageUrl = getOpenGraphImage();
  const images = [
    {
      url: imageUrl.toString(),
      type: "image/jpeg",
      width: 1200,
      height: 630,
      alt: pageTitle
    }
  ];

  const localizedUrl = (language: Languages) => {
    if (type === "doc") {
      const doc = withLocale(language).doc(path);
      return new URL(`/${language}/docs/${doc.slug}/`, origin);
    }
    if (type === "collection" || type === "icon") {
      const url = new URL(`/${language}/icons/${collectionId}/`, origin);
      if (iconId) url.searchParams.set("icon", iconId);
      return url;
    }
    return new URL(`/${language}/${path ? `${path}/` : ""}`, origin);
  };

  const canonicalUrl = localizedUrl(lang);
  const languages = AvailableLanguages.reduce<Record<string, string>>(
    (items, language) => ({ ...items, [language]: localizedUrl(language).toString() }),
    {}
  );

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: ["React", "React Native", "Tailwind", "rocketicons", "icons"],
    authors: [{ name, url: origin }],
    creator: siteConfig.companyName,
    openGraph: {
      type: "website",
      locale: lang || defaultLocale,
      url: canonicalUrl.toString(),
      title: pageTitle,
      description: pageDescription,
      siteName: name,
      images
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      site: name,
      description: pageDescription,
      creator: "@therocketclimb",
      images
    },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon-16x16.png"
    },
    alternates: {
      canonical: canonicalUrl.toString(),
      languages
    },
    metadataBase: new URL(origin)
  };
};

export const getOpenGraphImage = () =>
  new URL("/img/og-hero-light.jpg", getSiteOrigin());
