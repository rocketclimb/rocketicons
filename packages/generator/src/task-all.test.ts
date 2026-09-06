import { expect, test } from "@jest/globals";
import { existsSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { dirInit } from "./task-all";

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
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
