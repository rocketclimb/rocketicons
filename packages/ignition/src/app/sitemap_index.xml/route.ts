import { serverEnv } from "@/env/server";
import { AvailableLanguages, Languages } from "@/types";
import { IconsManifest } from "@/data-helpers/icons/manifest";
import { SitemapIndexRow } from "@/types/sitemap";
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

// This is a temporary solution as proposed here: https://www.reddit.com/r/nextjs/comments/161cbms/creating_a_sitemap_with_translated_alternate/
// Official documentation for this: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
// The official implementation of alternates is coming in Next 14.3.0:
// https://github.com/vercel/next.js/discussions/53540
// https://github.com/vercel/next.js/pull/53765
// https://github.com/vercel/next.js/commit/e4cd547a505c8380cbf010a78f1e2e3ade0f2307
// When it comes, we can use a simple sitemap.ts file under /app folder to generate sitemap.xml
