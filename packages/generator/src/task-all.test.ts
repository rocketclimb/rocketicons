import { expect, test } from "@jest/globals";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { dirInit, writeIconModuleAndSvgs } from "./task-all";
import type { IconsInfoManifest } from "@rocketicons/core";
import type { IconDefinition } from "./types";

test("regeneration removes old SVG JSON while preserving package metadata", async () => {
  const root = mkdtempSync(join(tmpdir(), "icon-generation-test-"));
  const DIST = join(root, "icons");
  const SVGS = join(root, "svgs");
  mkdirSync(DIST);
  mkdirSync(join(SVGS, "lu"), { recursive: true });
  writeFileSync(join(DIST, "package.json"), "{}");
  writeFileSync(join(SVGS, "lu", "lu-removed.json"), "{}");
  try {
    await dirInit({
      rootDir: root,
      DIST,
      SVGS,
      LIB: join(DIST, "core"),
      PLUGIN: join(DIST, "tailwind"),
      DATA: join(DIST, "data")
    });
    expect(existsSync(join(SVGS, "lu", "lu-removed.json"))).toBe(false);
    expect(existsSync(join(DIST, "package.json"))).toBe(true);
    expect(existsSync(join(SVGS, ".lock"))).toBe(true);
    const collectionPackage = JSON.parse(readFileSync(join(DIST, "my", "package.json"), "utf8"));
    expect(collectionPackage).toMatchObject({
      module: "./index.mjs"
    });
    expect(collectionPackage["react-native"]).toBeUndefined();
    expect(readFileSync(join(DIST, "my", "index.mjs"), "utf8")).toContain(
      "import { IconGenerator } from 'rocketicons/core';"
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("paired styles retain their source family ID", async () => {
  const root = mkdtempSync(join(tmpdir(), "icon-family-test-"));
  const DIST = join(root, "icons");
  const SVGS = join(root, "svgs");
  const regular = join(root, "refresh-alt.svg");
  const solid = join(root, "solid-refresh-alt.svg");
  mkdirSync(join(DIST, "my"), { recursive: true });
  mkdirSync(SVGS);
  writeFileSync(regular, '<svg viewBox="0 0 24 24"><path d="M1 1L2 2"/></svg>');
  writeFileSync(solid, '<svg viewBox="0 0 24 24"><path d="M1 1L2 2"/></svg>');
  const definition: IconDefinition = {
    id: "my",
    name: "MynaUI Icons",
    contents: [
      { files: regular, formatter: () => "MyRefreshAlt", familyId: () => "refresh-alt" },
      { files: solid, formatter: () => "MySolidRefreshAlt", familyId: () => "refresh-alt" }
    ],
    projectUrl: "https://example.com",
    license: "MIT",
    licenseUrl: "https://example.com/LICENSE"
  };
  const context = {
    rootDir: root,
    DIST,
    SVGS,
    LIB: join(DIST, "core"),
    PLUGIN: join(DIST, "tailwind"),
    DATA: join(DIST, "data")
  };
  const manifest: IconsInfoManifest<string, string> = {};
  try {
    await writeIconModuleAndSvgs(definition, context, manifest);
    expect(manifest.my.icons.MyRefreshAlt.familyId).toBe("refresh-alt");
    expect(manifest.my.icons.MySolidRefreshAlt.familyId).toBe("refresh-alt");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
