import { siteConfig } from "@/config/site";
import { serverEnv } from "@/env/server";
import { IconsManifest } from "rocketicons/data";

type SitemapRow = {
  url: string;
  lastModified?: string | Date;
  changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
  alternateRefs: Array<{ href: string; hreflang: string }>;
};

type Sitemap = Array<SitemapRow>;
const mapAlternate = ({ href, hreflang }: { href: string; hreflang: string }) =>
  `<xhtml:link rel="alternate" hreflang="${hreflang}" href="${href}"/>`;

const mapRowToUrl = (row: SitemapRow) =>
  `<url>
        <loc>${row.url}</loc>
        <lastmod>${row.lastModified || ""}</lastmod>
        ${row.alternateRefs.map(mapAlternate).join("\n        ")}
        <changefreq>${row.changeFrequency ?? ""}</changefreq>
        <priority>${row.priority?.toFixed(1)}</priority>
    </url>`;

const sitemapToXml = (sitemap: SitemapRow[]) => `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset 
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
    ${sitemap.map(mapRowToUrl).join("\n     ")}
</urlset>
`;

const generateSitemapEntry = (path?: string, lastModified?: Date): SitemapRow => {
  const { locales } = siteConfig;
  const urlWithPath = `${serverEnv.NEXT_PUBLIC_APP_URL}${path ?? ""}`;

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
    }))
  };
};

const pagesForSitemap = (): Sitemap => {
  const urls = [];

  urls.push(generateSitemapEntry());
  urls.push(generateSitemapEntry("/roadmap"));

  urls.push(generateSitemapEntry("/docs"));
  urls.push(generateSitemapEntry("/docs/getting-started"));
  urls.push(generateSitemapEntry("/docs/usage"));
  urls.push(generateSitemapEntry("/docs/adding-icons"));
  urls.push(generateSitemapEntry("/docs/colors"));
  urls.push(generateSitemapEntry("/docs/dark-mode"));
  urls.push(generateSitemapEntry("/docs/responsive-design"));
  urls.push(generateSitemapEntry("/docs/sizing-icons"));
  urls.push(generateSitemapEntry("/docs/state-management"));
  urls.push(generateSitemapEntry("/docs/styling"));

  urls.push(generateSitemapEntry("/icons"));

  IconsManifest.forEach((collection) => {
    const url = generateSitemapEntry(`/icons/${collection.id}`);

    urls.push(url);
  });

  return urls;
};

export const GET = async () => {
  const sitemap = pagesForSitemap();

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
