import * as changeCase from "change-case";

import { siteConfig } from "@/config/site";
import { serverEnv } from "@/env/server";
import { Languages } from "@/types";
import { NextRequest } from "next/server";
import { IconsManifest } from "@/data-helpers/icons/manifest";
import { ChangeFrequency, SitemapRow } from "@/types/sitemap";
import { sitemapToXml } from "@/app/utils/sitemap-utils";

type Sitemap = Array<SitemapRow>;

const generateSitemapEntry = (
  lang: Languages,
  path?: string,
  lastModified?: Date,
  changefreq?: ChangeFrequency
): SitemapRow => {
  const { locales } = siteConfig;
  const urlWithPath = `${serverEnv.NEXT_PUBLIC_APP_URL}/${lang}${path ?? ""}`;

  const alternates = locales.reduce(
    (acc, locale) => {
      acc[locale] = `${serverEnv.NEXT_PUBLIC_APP_URL}/${locale}${path ?? ""}`;
      return acc;
    },
    {} as { [key: string]: string }
  );

  return {
    url: urlWithPath,
    lastModified: lastModified ?? new Date(),
    alternateRefs: Object.entries(alternates).map(([hreflang, href]) => ({
      hreflang,
      href
    })),
    changeFrequency: changefreq ?? "daily"
  };
};

const pagesForSitemap = (lang: Languages, collectionId: string): Sitemap => {
  const urls: Sitemap = [];

  const collection = IconsManifest.find((collection: any) => collection.id === collectionId);

  if (collection) {
    collection.icons.forEach((icon: string) => {
      const iconFilename = changeCase.kebabCase(icon);
      const iconUrl = generateSitemapEntry(lang, `/icons/${collection.id}/${iconFilename}`);
      urls.push(iconUrl);
    });
  }
  return urls;
};

export const GET = async (request: NextRequest) => {
  const [, langFromPath, , param1] = request.nextUrl.pathname.split("/");
  const lang = langFromPath as Languages;

  const sitemap = pagesForSitemap(lang, param1);

  const sitemapXml = sitemapToXml(sitemap);

  return new Response(sitemapXml, {
    status: 200,
    headers: { "Content-Type": "application/xml; charset=utf-8" }
  });
};

// This is a temporary solution as proposed here: https://www.reddit.com/r/nextjs/comments/161cbms/creating_a_sitemap_with_translated_alternate/
// Official documentation for this: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
// The official implementation of alternates is coming in Next 14.3.0:
// https://github.com/vercel/next.js/discussions/53540
// https://github.com/vercel/next.js/pull/53765
// https://github.com/vercel/next.js/commit/e4cd547a505c8380cbf010a78f1e2e3ade0f2307
// When it comes, we can use a simple sitemap.ts file under /app folder to generate sitemap.xml
