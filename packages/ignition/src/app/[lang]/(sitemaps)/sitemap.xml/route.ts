import { IconsManifest } from "@/data-helpers/icons/manifest";
import { Languages } from "@/types";
import { NextRequest } from "next/server";
import { SitemapRow } from "@/types/sitemap";
import { generateSitemapEntry, sitemapToXml } from "@/app/utils/sitemap-utils";

type Sitemap = Array<SitemapRow>;

const pagesForSitemap = (lang: Languages): Sitemap => {
  const urls = [];

  urls.push(generateSitemapEntry(lang));
  urls.push(generateSitemapEntry(lang, "/roadmap"));

  urls.push(generateSitemapEntry(lang, "/docs"));
  urls.push(generateSitemapEntry(lang, "/docs/getting-started"));
  urls.push(generateSitemapEntry(lang, "/docs/usage"));
  urls.push(generateSitemapEntry(lang, "/docs/adding-icons"));
  urls.push(generateSitemapEntry(lang, "/docs/colors"));
  urls.push(generateSitemapEntry(lang, "/docs/dark-mode"));
  urls.push(generateSitemapEntry(lang, "/docs/responsive-design"));
  urls.push(generateSitemapEntry(lang, "/docs/sizing-icons"));
  urls.push(generateSitemapEntry(lang, "/docs/state-management"));
  urls.push(generateSitemapEntry(lang, "/docs/styling"));

  urls.push(generateSitemapEntry(lang, "/icons"));

  IconsManifest.forEach((collection) => {
    const url = generateSitemapEntry(lang, `/icons/${collection.id}`);

    urls.push(url);
  });

  return urls;
};

export const GET = async (request: NextRequest) => {
  const [, langFromPath] = request.nextUrl.pathname.split("/");
  const lang = langFromPath as Languages;

  const sitemap = pagesForSitemap(lang);

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
