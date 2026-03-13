import * as changeCase from "change-case";

import { Languages } from "@/types";
import { NextRequest } from "next/server";
import { SitemapRow } from "@/types/sitemap-types";
import { generateSitemapEntry, sitemapToXml } from "@/app/utils/sitemap-utils";
import { collectionAsJson, svgsAsJson } from "@/utils/svg-as-json";
import { CollectionID } from "rocketicons/data";

type Sitemap = Array<SitemapRow>;

const pagesForSitemap = async (lang: Languages, collectionId: string): Promise<Sitemap> => {
  const urls: Sitemap = [];

  const collection = await collectionAsJson(collectionId as CollectionID);
  const icons = await svgsAsJson(collection.id, collection.totalIcons);

  if (collection) {
    icons.forEach(({ iconId }) => {
      const iconUrl = generateSitemapEntry(lang, `/icons/${collection.id}/${iconId}`);
      urls.push(iconUrl);
    });
  }
  return urls;
};

export const GET = async (request: NextRequest) => {
  const [, langFromPath, , param1] = request.nextUrl.pathname.split("/");
  const lang = langFromPath as Languages;

  const sitemap = await pagesForSitemap(lang, param1);

  const sitemapXml = sitemapToXml(sitemap);

  return new Response(sitemapXml, {
    status: 200,
    headers: { "Content-Type": "application/xml; charset=utf-8" }
  });
};
