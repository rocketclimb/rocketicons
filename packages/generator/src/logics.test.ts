import { afterEach, beforeEach, expect, test } from "@jest/globals";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildPackageExports, getIconFiles } from "./logics";
import { icons } from "./definitions";

const formatter = (name: string) => name;
let directory: string;
beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), "icon-source-test-"));
});
afterEach(() => {
  rmSync(directory, { recursive: true, force: true });
});

test("a moved or missing SVG directory fails instead of publishing an empty pack", async () => {
  await expect(
    getIconFiles({ files: join(directory, "missing/*.svg"), formatter })
  ).rejects.toThrow("No SVG files found");
});

test("computed file sources must also contain icons", async () => {
  await expect(getIconFiles({ files: async () => [], formatter })).rejects.toThrow(
    "No SVG files found"
  );
});

test("returns SVG files in deterministic order", async () => {
  writeFileSync(join(directory, "b.svg"), "<svg/>");
  writeFileSync(join(directory, "a.svg"), "<svg/>");
  writeFileSync(join(directory, "README.md"), "not an icon");
  await expect(getIconFiles({ files: join(directory, "*.svg"), formatter })).resolves.toEqual([
    join(directory, "a.svg"),
    join(directory, "b.svg")
  ]);
});

test("core exports choose a platform renderer while collection entries retain both module formats", () => {
  const exports = buildPackageExports(icons) as Record<
    string,
    { browser?: string; "react-native"?: string; require: string; import: string }
  >;
  expect(exports["./core"]).toMatchObject({
    browser: "./core/index.mjs",
    "react-native": "./core/index.native.mjs",
    require: "./core/index.js",
    import: "./core/index.mjs"
  });
  expect(Object.keys(exports["./core"])).toEqual([
    "types",
    "browser",
    "react-native",
    "require",
    "import",
    "default"
  ]);
  for (const { id } of icons) {
    expect(exports[`./${id}`]).toMatchObject({
      require: `./${id}/index.js`,
      import: `./${id}/index.mjs`
    });
    expect(exports[`./${id}`]["react-native"]).toBeUndefined();
  }
});
