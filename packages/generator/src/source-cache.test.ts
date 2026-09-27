import { expect, test } from "@jest/globals";
import { sourceCacheKey } from "./source-cache";
import type { IconDefinition } from "./types";

const definition: IconDefinition = {
  id: "test",
  name: "Test",
  contents: [],
  projectUrl: "https://example.com",
  license: "MIT",
  licenseUrl: "https://example.com/LICENSE",
  source: {
    type: "git",
    localName: "test",
    remoteDir: "icons/",
    url: "https://example.com/icons.git",
    branch: "main",
    hash: "old-revision"
  }
};

test("cache keys are repeatable and reject the legacy done marker", () => {
  expect(sourceCacheKey([definition])).toBe(sourceCacheKey([definition]));
  expect(sourceCacheKey([definition])).not.toBe("done");
});

test.each(["hash", "remoteDir", "url", "branch", "localName"] as const)(
  "changing %s invalidates restored sources",
  (field) => {
    const changed = { ...definition, source: { ...definition.source!, [field]: "changed" } };
    expect(sourceCacheKey([changed])).not.toBe(sourceCacheKey([definition]));
  }
);

test("adding or removing a Git pack invalidates the cache", () => {
  expect(sourceCacheKey([])).not.toBe(sourceCacheKey([definition]));
});

test("changing one directory in a multi-directory sparse source invalidates the cache", () => {
  const paired = {
    ...definition,
    source: { ...definition.source!, remoteDir: ["icons/", "icons-solid/"] }
  };
  const missingStyle = {
    ...definition,
    source: { ...definition.source!, remoteDir: ["icons/"] }
  };
  expect(sourceCacheKey([paired])).not.toBe(sourceCacheKey([missingStyle]));
});
