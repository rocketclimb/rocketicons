import { afterEach, beforeEach, describe, expect, test } from "@jest/globals";
import type { IconTree } from "rocketicons";

import { STATIC_CATALOG_CHUNK_SIZE } from "../catalog/types";
import { buildCollectionArtifacts, type GeneratedManifest } from "./collections-catalog";

const iconTree: IconTree = {
  tag: "svg",
  attr: { viewBox: "0 0 24 24" },
  child: []
};

const makeManifest = (ids: string[]): GeneratedManifest => ({
  id: "ai",
  name: "Test Icons",
  license: "MIT",
  projectUrl: "https://example.com/icons",
  licenseUrl: "https://example.com/license",
  icons: Object.fromEntries(
    ids.map((id) => [
      id,
      { id, name: `Name ${id}`, compName: `Icon${id}`, variant: "full" as const }
    ])
  )
});

const source = (ids: string[]) => ids.map((id) => ({ id, iconTree, variant: "full" as const }));

describe("static catalog generation", () => {
  const previousOrigin = process.env.SITE_ORIGIN;

  beforeEach(() => {
    process.env.SITE_ORIGIN = "https://rocket.example";
  });

  afterEach(() => {
    if (previousOrigin === undefined) delete process.env.SITE_ORIGIN;
    else process.env.SITE_ORIGIN = previousOrigin;
  });

  test("sorts deterministically and shards at 500 icons", () => {
    const ids = Array.from(
      { length: STATIC_CATALOG_CHUNK_SIZE + 1 },
      (_, index) => `icon-${String(STATIC_CATALOG_CHUNK_SIZE - index).padStart(3, "0")}`
    );
    const result = buildCollectionArtifacts("1.2.3", makeManifest(ids), source(ids));

    expect(result.shards).toHaveLength(2);
    expect(result.shards[0].icons).toHaveLength(STATIC_CATALOG_CHUNK_SIZE);
    expect(result.shards[1].icons).toHaveLength(1);
    expect(result.index.icons.map(({ id }) => id)).toEqual([...ids].sort());
    expect(result.index.icons.at(-1)?.chunk).toBe(1);
    expect(result.collection.totalIcons).toBe(ids.length);
    expect(result.collection.indexUrl).toBe("/ai/v1/collections/ai/index.json");
  });

  test("prefixes catalog URLs for a path-based deployment", () => {
    process.env.SITE_ORIGIN = "https://rocketclimb.github.io/rocketicons";
    const result = buildCollectionArtifacts("1.2.3", makeManifest(["one"]), source(["one"]));

    expect(result.collection.indexUrl).toBe("/rocketicons/ai/v1/collections/ai/index.json");
  });

  test("rejects duplicate source IDs", () => {
    expect(() =>
      buildCollectionArtifacts("1.2.3", makeManifest(["one"]), source(["one", "one"]))
    ).toThrow("Duplicate icon id");
  });

  test("rejects missing manifest metadata", () => {
    expect(() =>
      buildCollectionArtifacts("1.2.3", makeManifest(["one"]), source(["two"]))
    ).toThrow("Missing manifest metadata");
  });

  test("rejects missing source data", () => {
    expect(() =>
      buildCollectionArtifacts("1.2.3", makeManifest(["one", "two"]), source(["one"]))
    ).toThrow("Missing source data");
  });
});
