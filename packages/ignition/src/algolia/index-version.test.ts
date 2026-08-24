import { describe, expect, test } from "@jest/globals";

import {
  ALGOLIA_INDEX_VERSION_KEY,
  algoliaIndexSettingsMatch,
  buildAlgoliaIndexVersion,
  currentAlgoliaIndexVersion
} from "./index-version";

const settings = {
  searchableAttributes: ["unordered(title)"],
  attributesForFaceting: ["filterOnly(recordType)"],
  hitsPerPage: 60
};

describe("Algolia index version", () => {
  test("changes when records or search settings change", () => {
    const initial = buildAlgoliaIndexVersion([{ objectID: "icon:lu:rocket" }], settings);

    expect(buildAlgoliaIndexVersion([{ objectID: "icon:lu:rocket" }], settings)).toBe(initial);
    expect(buildAlgoliaIndexVersion([{ objectID: "icon:lu:moon" }], settings)).not.toBe(initial);
    expect(
      buildAlgoliaIndexVersion([{ objectID: "icon:lu:rocket" }], { ...settings, hitsPerPage: 30 })
    ).not.toBe(initial);
  });

  test("reads only the Rocket Icons marker and detects settings drift", () => {
    expect(currentAlgoliaIndexVersion({ [ALGOLIA_INDEX_VERSION_KEY]: "abc" })).toBe("abc");
    expect(currentAlgoliaIndexVersion({ [ALGOLIA_INDEX_VERSION_KEY]: 123 })).toBeUndefined();
    expect(algoliaIndexSettingsMatch(settings, settings)).toBe(true);
    expect(algoliaIndexSettingsMatch({ ...settings, hitsPerPage: 30 }, settings)).toBe(false);
  });
});
