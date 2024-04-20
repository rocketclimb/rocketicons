import { siteConfig } from "@/config/site";
import { useLocale } from "@/locales";
import { Languages } from "@/types";
import type { Metadata } from "next";

const CustomMetadata = (
  lang: Languages,
  title?: string,
  description?: string
): Metadata => {
  const { name, url, defaultLocale } = siteConfig;
  const brand = useLocale(lang).config("brand");

  const pageTitle =
    `${title ?? name}` + (title?.endsWith(siteConfig.name) ? "" : ` | ${name}`);
  const pageDescription = description ?? brand.description;
  return {
    title: {
      default: pageTitle,
      template: `%s - ${pageTitle}`,
    },
    description: pageDescription,
    keywords: [
      "React",
      "React Native",
      "Vercel",
      "Tailwind",
      "rocketclimb",
      "rocketicons",
      "icons",
    ],
    authors: [
      {
        name: "RocketClimb",
        url: "https://rocketclimb.com",
      },
    ],
    creator: "RocketClimb",
    openGraph: {
      type: "website",
      locale: lang || defaultLocale,
      url: url,
      title: pageTitle,
      description: pageDescription,
      siteName: name,
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      creator: "@therocketclimb",
    },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon-16x16.png",
    },
    metadataBase: new URL(url),
  };
};

export default CustomMetadata;
