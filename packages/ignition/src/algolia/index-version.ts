import { createHash } from "node:crypto";

export const ALGOLIA_INDEX_VERSION_KEY = "rocketiconsIndexVersion";

export type AlgoliaIndexSettings = {
  searchableAttributes: readonly string[];
  attributesForFaceting: readonly string[];
  hitsPerPage: number;
};

export const buildAlgoliaIndexVersion = (
  records: readonly unknown[],
  settings: AlgoliaIndexSettings
) => createHash("sha256").update(JSON.stringify({ records, settings })).digest("hex");

export const currentAlgoliaIndexVersion = (userData: unknown) => {
  if (!userData || typeof userData !== "object" || Array.isArray(userData)) return undefined;

  const version = (userData as Record<string, unknown>)[ALGOLIA_INDEX_VERSION_KEY];
  return typeof version === "string" ? version : undefined;
};

export const algoliaIndexSettingsMatch = (
  currentSettings: Partial<AlgoliaIndexSettings>,
  expectedSettings: AlgoliaIndexSettings
) =>
  JSON.stringify({
    searchableAttributes: currentSettings.searchableAttributes,
    attributesForFaceting: currentSettings.attributesForFaceting,
    hitsPerPage: currentSettings.hitsPerPage
  }) === JSON.stringify(expectedSettings);
