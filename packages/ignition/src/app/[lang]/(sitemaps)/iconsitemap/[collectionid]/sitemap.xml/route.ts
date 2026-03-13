import * as changeCase from "change-case";

import { Languages, AvailableLanguages } from "@/types";
import { NextRequest } from "next/server";
import { IconsManifest } from "@/data-helpers/icons/manifest-from-public";
import { SitemapRow } from "@/types/sitemap-types";
import { generateSitemapEntry, sitemapToXml } from "@/app/utils/sitemap-utils";

type Sitemap = Array<SitemapRow>;

// OPTIMIZATION: Generate minimal static params for export compatibility
// Only generate collection sitemaps, not individual icon sitemaps
export const generateStaticParams = () => {
  const params = [];

  for (const lang of AvailableLanguages) {
    for (const collection of IconsManifest) {
      params.push({
        lang,
        collectionid: collection.id
      });
    }
  }

  console.log(
    `📦 Sitemap static generation: ${params.length} collection sitemaps (reduced from individual icon sitemaps)`
  );
  return params;
};

const pagesForSitemap = (lang: Languages, collectionId: string): Sitemap => {
  const urls: Sitemap = [];

  const collection = IconsManifest.find((collection: any) => collection.id === collectionId);

  if (collection) {
    // Use iconsManifest to get kebab-case IDs directly
    Object.values(collection.iconsManifest).forEach((iconData: any) => {
      const iconUrl = generateSitemapEntry(lang, `/icons/${collection.id}/${iconData.id}`);
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
