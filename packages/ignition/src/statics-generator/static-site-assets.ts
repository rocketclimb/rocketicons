import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { AvailableLanguages, Languages } from "@/types";
import { getSiteOrigin } from "@/config/site-origin";
import type { StaticCatalog } from "@/catalog/types";

const PUBLIC_ROOT = resolve("./public");
const DATA_ROOT = resolve("./src/app/data-helpers");

type DocParam = { lang: Languages; slug: string };

const writePublicFile = async (path: string, contents: string) => {
  const filename = resolve(PUBLIC_ROOT, path);
  await mkdir(resolve(filename, ".."), { recursive: true });
  await writeFile(filename, contents, "utf8");
};

const escapeXml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const urlSet = (urls: string[]) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`).join("\n")}
</urlset>
`;

const sitemapIndex = (urls: string[]) => `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <sitemap><loc>${escapeXml(url)}</loc></sitemap>`).join("\n")}
</sitemapindex>
`;

export const generateStaticSiteAssets = async () => {
  const origin = getSiteOrigin();
  const docs = JSON.parse(
    await readFile(resolve(DATA_ROOT, "params/docs.json"), "utf8")
  ) as DocParam[];
  const catalog = JSON.parse(
    await readFile(resolve(PUBLIC_ROOT, "ai/v1/catalog.json"), "utf8")
  ) as StaticCatalog;

  const sitemapUrls: string[] = [];
  for (const lang of AvailableLanguages) {
    const pages = [
      `${origin}/${lang}/`,
      `${origin}/${lang}/roadmap/`,
      `${origin}/${lang}/docs/`,
      `${origin}/${lang}/icons/`,
      ...docs
        .filter((doc) => doc.lang === lang)
        .map((doc) => `${origin}/${lang}/docs/${doc.slug}/`)
    ];
    const collections = catalog.collections.map(
      ({ id }) => `${origin}/${lang}/icons/${id}/`
    );
    await writePublicFile(`${lang}/sitemap.xml`, urlSet(pages));
    await writePublicFile(`${lang}/collections-sitemap.xml`, urlSet(collections));
    sitemapUrls.push(
      `${origin}/${lang}/sitemap.xml`,
      `${origin}/${lang}/collections-sitemap.xml`
    );
  }

  await writePublicFile("sitemap_index.xml", sitemapIndex(sitemapUrls));
  await writePublicFile(
    "robots.txt",
    `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap_index.xml\n`
  );
};
