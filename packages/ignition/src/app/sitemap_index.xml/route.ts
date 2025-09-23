import { serverEnv } from "@/env/server";
import { AvailableLanguages, Languages } from "@/types";
import { SitemapIndexRow } from "@/types/sitemap-types";
import { sitemapToXmlString } from "@/app/utils/sitemap-utils";
import { collectionsAsJson } from "@/utils/svg-as-json";

type Sitemap = Array<SitemapIndexRow>;

const generateSitemapIndexEntry = (
  lang: Languages = "en",
  lastModified?: Date
): SitemapIndexRow => {
  return {
    url: `${serverEnv.NEXT_PUBLIC_APP_URL}/${lang}/sitemap.xml`,
    lastModified: lastModified ?? new Date()
  };
};

const generateCollectionSitemapIndexEntry = (
  lang: Languages = "en",
  collectionId?: string,
  lastModified?: Date
): SitemapIndexRow => {
  return {
    url: `${serverEnv.NEXT_PUBLIC_APP_URL}/${lang}/iconsitemap/${collectionId}/sitemap.xml`,
    lastModified: lastModified ?? new Date()
  };
};

const pagesForSitemap = async (): Promise<Sitemap> => {
  const urls: Sitemap = [];
  const collectionsUrls: Sitemap = [];

  const collections = await collectionsAsJson();

  AvailableLanguages.forEach((lang) => {
    urls.push(generateSitemapIndexEntry(lang));
  });

  collections.forEach(({ id }) => {
    AvailableLanguages.forEach((lang) => {
      const url = generateCollectionSitemapIndexEntry(lang, id);

      collectionsUrls.push(url);
    });
  });

  return urls.concat(collectionsUrls);
};

export const GET = async () => {
  const sitemap = await pagesForSitemap();

  const sitemapXml = sitemapToXmlString(sitemap);

  return new Response(sitemapXml, {
    status: 200,
    headers: { "Content-Type": "application/xml; charset=utf-8" }
  });
};
