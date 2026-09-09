import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";

import { getCatalog, getCatalogTotals, getCollectionIndex, getIcon } from "@/catalog/server";
import { withLocale } from "@/locales";
import { AvailableLanguages, Languages } from "@/types";
import {
  ogCollectionKey,
  ogCollectionPath,
  ogDocKey,
  ogDocPath,
  ogPageKey,
  ogPagePath,
  type OgManifest
} from "./og-manifest";
import {
  OG_SIZE,
  ogFonts,
  ogTemplate,
  type OgIconArt,
  type OgTemplateProps
} from "./og-template";

const PUBLIC_ROOT = resolve("./public");
const DATA_ROOT = resolve("./src/app/data-helpers");

type DocParam = { lang: Languages; slug: string };

/**
 * Chrome icons for the footer stats, and the subject icon for each non-collection page.
 * Fixed rather than randomised: the build must be reproducible.
 */
const STAT_ICONS = {
  inThisCollection: ["bs", "bs-collection"],
  collections: ["bi", "bi-collection"],
  icons: ["tb", "tb-icons"]
} as const;

const PAGE_ICONS: Record<string, readonly [string, string]> = {
  "": ["rc", "rc-rocket-icon"],
  docs: ["sl", "sl-docs"],
  icons: ["fa", "fa-icons"],
  roadmap: ["fa", "fa-road"]
};

const DOC_ICON = PAGE_ICONS.docs;

/**
 * Sampled builds (RI_GENERATE_ALL_ICONS unset) only emit the first five collections, so any
 * icon outside them is legitimately absent. Degrade to no glyph instead of failing the build.
 */
const loadArt = async (collectionId: string, iconId: string): Promise<OgIconArt | undefined> => {
  try {
    const icon = await getIcon(collectionId, iconId);
    return icon && { variant: icon.variant, iconTree: icon.iconTree };
  } catch {
    return undefined;
  }
};

/**
 * The icon that represents a collection on its card: the first in the index, matching how the
 * original renderer picked one. Memoized because both locales draw the same collection, and
 * because resolving it touches the collection index plus one 500-icon shard.
 */
const collectionArt = (() => {
  const cache = new Map<string, Promise<OgIconArt | undefined>>();
  return (collectionId: string) => {
    const cached = cache.get(collectionId);
    if (cached) return cached;

    const pending = (async () => {
      const { icons } = await getCollectionIndex(collectionId);
      return icons.length ? loadArt(collectionId, icons[0].id) : undefined;
    })();
    cache.set(collectionId, pending);
    return pending;
  };
})();

const writeImage = async (path: string, png: Uint8Array) => {
  const filename = resolve(PUBLIC_ROOT, path);
  await mkdir(resolve(filename, ".."), { recursive: true });
  await writeFile(filename, png);
};

const renderPng = async (props: OgTemplateProps) => {
  // satori resolves `react` types from the workspace root (React 18) while ignition is on
  // React 19, so the two ReactElement shapes are structurally incompatible at the type level
  // only. The runtime value is exactly what satori expects.
  const element = ogTemplate(props) as Parameters<typeof satori>[0];
  const svg = await satori(element, { ...OG_SIZE, fonts: ogFonts() });
  return new Resvg(svg, { fitTo: { mode: "width", value: OG_SIZE.width } }).render().asPng();
};

export const generateOgImages = async () => {
  const [catalog, totals] = await Promise.all([getCatalog(), getCatalogTotals()]);
  const docs = JSON.parse(
    await readFile(resolve(DATA_ROOT, "params/docs.json"), "utf8")
  ) as DocParam[];

  const statIcons = {
    inThisCollection: await loadArt(...STAT_ICONS.inThisCollection),
    collections: await loadArt(...STAT_ICONS.collections),
    icons: await loadArt(...STAT_ICONS.icons)
  };

  const manifest: OgManifest = { pages: {}, docs: {}, collections: {} };

  for (const lang of AvailableLanguages) {
    const { config, doc } = withLocale(lang);
    const nav = config("nav") as Record<string, string>;
    const brand = config("brand");
    const opengraph = config("opengraph");
    const labels = {
      collections: opengraph["collections"],
      icons: opengraph["icons"],
      inThisCollection: opengraph["int-this-collection"]
    };
    const common = { lang, totals, labels, statIcons };

    for (const [slug, [collectionId, iconId]] of Object.entries(PAGE_ICONS)) {
      const path = ogPagePath(lang, slug);
      await writeImage(
        path,
        await renderPng({
          ...common,
          subheading: slug ? nav[slug] : undefined,
          text: brand["motto"],
          icon: await loadArt(collectionId, iconId)
        })
      );
      manifest.pages[ogPageKey(lang, slug)] = path;
    }

    const docIcon = await loadArt(...DOC_ICON);
    for (const { slug } of docs.filter((entry) => entry.lang === lang)) {
      // Resolve through withLocale so the key matches how customMetadata looks it up:
      // pt-br doc slugs are localized and reach the two sides by different routes.
      const resolved = doc(slug);
      if (!resolved) continue;
      const path = ogDocPath(lang, resolved.slug);
      await writeImage(
        path,
        await renderPng({
          ...common,
          subheading: resolved.title,
          text: brand["motto"],
          icon: docIcon
        })
      );
      manifest.docs[ogDocKey(lang, resolved.slug)] = path;
    }

    for (const collection of catalog.collections) {
      const path = ogCollectionPath(lang, collection.id);
      await writeImage(
        path,
        await renderPng({
          ...common,
          collectionId: collection.id,
          collectionName: collection.name,
          collectionCount: collection.totalIcons,
          icon: await collectionArt(collection.id)
        })
      );
      manifest.collections[ogCollectionKey(lang, collection.id)] = path;
    }
  }

  const manifestFile = resolve(DATA_ROOT, "og/manifest.json");
  await mkdir(resolve(manifestFile, ".."), { recursive: true });
  await writeFile(manifestFile, `${JSON.stringify(manifest)}\n`, "utf8");

  const total =
    Object.keys(manifest.pages).length +
    Object.keys(manifest.docs).length +
    Object.keys(manifest.collections).length;
  console.log(`[IGNITION] generated ${total} open graph images`);
};
