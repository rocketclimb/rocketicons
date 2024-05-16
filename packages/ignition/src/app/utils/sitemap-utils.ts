import { SitemapIndexRow, SitemapRow } from "@/types/sitemap";

const mapAlternate = ({ href, hreflang }: { href: string; hreflang: string }) =>
  `<xhtml:link rel="alternate" hreflang="${hreflang}" href="${encodeURI(href)}"/>`;

const mapRowToUrl = (row: SitemapRow) =>
  `<url>
        <loc>${encodeURI(row.url)}</loc>
        <lastmod>${row.lastModified?.toISOString() || ""}</lastmod>
        ${row.alternateRefs.map(mapAlternate).join("\n        ")}
        <changefreq>${row.changeFrequency ?? ""}</changefreq>
        <priority>${row.priority?.toFixed(1) ?? 0.5}</priority>
    </url>`;

export const sitemapToXml = (sitemap: SitemapRow[]) => `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset 
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
    ${sitemap.map(mapRowToUrl).join("\n     ")}
</urlset>
`;

const indexRowToXmlString = (row: SitemapIndexRow) =>
  `<sitemap>
        <loc>${encodeURI(row.url)}</loc>
        <lastmod>${row.lastModified?.toISOString() || ""}</lastmod>
    </sitemap>`;

export const sitemapToXmlString = (
  sitemap: SitemapIndexRow[]
) => `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<sitemapindex 
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${sitemap.map(indexRowToXmlString).join("\n     ")}
</sitemapindex>
`;
