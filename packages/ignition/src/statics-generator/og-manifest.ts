import type { Languages } from "@/types";

/** Public URL prefix, and the location under public/ that the generator writes to. */
export const OG_IMAGE_DIR = "img/og";

/** Used whenever a page has no generated image — notably in sampled builds. */
export const FALLBACK_OG_IMAGE = "/img/og-hero-light.jpg";

export type OgManifest = {
  pages: Record<string, string>;
  docs: Record<string, string>;
  collections: Record<string, string>;
};

export type OgManifestSection = keyof OgManifest;

/**
 * Key builders shared by the generator and by `getOpenGraphImage`. Both sides reach a key from
 * different data (frontmatter vs route params), so deriving it in one place is what keeps them
 * from drifting — a mismatch would silently fall back to the static hero on every page.
 */
export const ogPageKey = (lang: Languages, path: string) => `${lang}/${path}`;
export const ogDocKey = (lang: Languages, slug: string) => `${lang}/${slug}`;
export const ogCollectionKey = (lang: Languages, collectionId: string) =>
  `${lang}/${collectionId}`;

export const ogPagePath = (lang: Languages, path: string) =>
  `${OG_IMAGE_DIR}/${lang}/${path || "home"}.png`;
export const ogDocPath = (lang: Languages, slug: string) =>
  `${OG_IMAGE_DIR}/${lang}/docs/${slug}.png`;
export const ogCollectionPath = (lang: Languages, collectionId: string) =>
  `${OG_IMAGE_DIR}/${lang}/collections/${collectionId}.png`;

export const lookupOgImage = (
  manifest: OgManifest,
  section: OgManifestSection,
  key: string
): string => {
  const path = manifest[section][key];
  return path ? `/${path}` : FALLBACK_OG_IMAGE;
};
