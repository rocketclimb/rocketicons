import { serverEnv } from "@/env/server";
import { AvailableLanguages, Languages } from "@/types";
import { IconsManifest } from "@/data-helpers/icons/manifest";
import { SitemapIndexRow } from "@/types/sitemap-types";
import { sitemapToXmlString } from "@/app/utils/sitemap-utils";

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

const pagesForSitemap = (): Sitemap => {
  const urls: Sitemap = [];
  const collectionsUrls: Sitemap = [];

  AvailableLanguages.forEach((lang) => {
    urls.push(generateSitemapIndexEntry(lang));
  });

  IconsManifest.forEach((collection) => {
    AvailableLanguages.forEach((lang) => {
      const url = generateCollectionSitemapIndexEntry(lang, collection.id);

      collectionsUrls.push(url);
    });
  });

  return urls.concat(collectionsUrls);
};

export const GET = async () => {
  const sitemap = pagesForSitemap();

  const sitemapXml = sitemapToXmlString(sitemap);

  return new Response(sitemapXml, {
    status: 200,
    headers: { "Content-Type": "application/xml; charset=utf-8" }
  });
};
