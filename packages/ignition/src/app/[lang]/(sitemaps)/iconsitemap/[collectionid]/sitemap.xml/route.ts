import * as changeCase from "change-case";

import { Languages } from "@/types";
import { NextRequest } from "next/server";
import { IconsManifest } from "@/data-helpers/icons/manifest";
import { SitemapRow } from "@/types/sitemap-types";
import { generateSitemapEntry, sitemapToXml } from "@/app/utils/sitemap-utils";

type Sitemap = Array<SitemapRow>;

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
