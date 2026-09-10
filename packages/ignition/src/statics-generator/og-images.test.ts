import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "@jest/globals";

import ogManifest from "@/data-helpers/og/manifest.json";
import { AvailableLanguages } from "@/types";
import {
  FALLBACK_OG_IMAGE,
  lookupOgImage,
  ogCollectionKey,
  ogCollectionPath,
  ogDocKey,
  ogDocPath,
  ogPageKey,
  ogPagePath,
  type OgManifest
} from "./og-manifest";

const manifest = ogManifest as OgManifest;

const entries = [
  ...Object.values(manifest.pages),
  ...Object.values(manifest.docs),
  ...Object.values(manifest.collections)
];

describe("open graph image manifest", () => {
  test("every generated entry exists on disk", () => {
    expect(entries.length).toBeGreaterThan(0);
    for (const path of entries) {
      expect(existsSync(resolve("./public", path))).toBe(true);
    }
  });

  test("covers the home page in every supported language", () => {
    for (const lang of AvailableLanguages) {
      expect(lookupOgImage(manifest, "pages", ogPageKey(lang, ""))).toBe(
        `/${ogPagePath(lang, "")}`
      );
    }
  });

  test("gives every collection its own image in every language", () => {
    const images = Object.keys(manifest.collections).map((key) =>
      lookupOgImage(manifest, "collections", key)
    );

    // Guards the failure where collectionId is not threaded through and every
    // collection silently shares one card.
    expect(new Set(images).size).toBe(images.length);

    for (const key of Object.keys(manifest.collections)) {
      const [lang, collectionId] = key.split("/");
      expect(
        lookupOgImage(manifest, "collections", ogCollectionKey(lang as never, collectionId))
      ).toBe(`/${ogCollectionPath(lang as never, collectionId)}`);
    }
  });

  test("resolves localized doc slugs per language", () => {
    for (const lang of AvailableLanguages) {
      const key = Object.keys(manifest.docs).find((entry) => entry.startsWith(`${lang}/`));
      expect(key).toBeDefined();

      const slug = key!.slice(lang.length + 1);
      expect(lookupOgImage(manifest, "docs", ogDocKey(lang, slug))).toBe(
        `/${ogDocPath(lang, slug)}`
      );
    }
  });

  test("falls back to the static hero for anything ungenerated", () => {
    // Sampled builds (RI_GENERATE_ALL_ICONS unset) legitimately omit most collections.
    expect(
      lookupOgImage(manifest, "collections", ogCollectionKey("en", "not-a-collection"))
    ).toBe(FALLBACK_OG_IMAGE);
    expect(lookupOgImage(manifest, "pages", ogPageKey("en", "not-a-page"))).toBe(
      FALLBACK_OG_IMAGE
    );
  });
});
