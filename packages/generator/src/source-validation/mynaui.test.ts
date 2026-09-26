import { expect, test } from "@jest/globals";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createMynauiSourceLoader, listMynauiSources, validateMynauiSources } from "./mynaui";
import { convertIconData } from "../logics";

const regular =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M1 1L2 2"/></svg>';
const solid = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M1 1L2 2"/></svg>';

test("MynaUI lists paired icons deterministically", async () => {
  const root = mkdtempSync(join(tmpdir(), "mynaui-test-"));
  mkdirSync(join(root, "icons"));
  mkdirSync(join(root, "icons-solid"));
  for (const name of ["zebra", "home"]) {
    writeFileSync(join(root, "icons", `${name}.svg`), regular);
    writeFileSync(join(root, "icons-solid", `${name}.svg`), solid);
  }
  writeFileSync(join(root, "tags.json"), JSON.stringify({ home: ["house"], zebra: ["animal"] }));
  try {
    const first = await listMynauiSources(root);
    expect(first.regular.map((file) => file.split("/").pop())).toEqual(["home.svg", "zebra.svg"]);
    expect(await listMynauiSources(root)).toEqual(first);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("MynaUI validates once when both styles load", async () => {
  const root = mkdtempSync(join(tmpdir(), "mynaui-once-test-"));
  mkdirSync(join(root, "icons"));
  mkdirSync(join(root, "icons-solid"));
  writeFileSync(join(root, "icons", "home.svg"), regular);
  writeFileSync(join(root, "icons-solid", "home.svg"), solid);
  writeFileSync(join(root, "tags.json"), JSON.stringify({ home: ["house"] }));
  try {
    const load = createMynauiSourceLoader(root);
    const regularLoad = load();
    const solidLoad = load();
    expect(solidLoad).toBe(regularLoad);
    const [regularFiles, solidFiles] = await Promise.all([
      regularLoad.then((files) => files.regular),
      solidLoad.then((files) => files.solid)
    ]);
    expect(regularFiles).toEqual([join(root, "icons", "home.svg")]);
    expect(solidFiles).toEqual([join(root, "icons-solid", "home.svg")]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("MynaUI rejects missing styles, unpaired icons, and normalized collisions", async () => {
  await expect(validateMynauiSources({ regular: [], solid: [] }, {})).rejects.toThrow("nonempty");
  const root = mkdtempSync(join(tmpdir(), "mynaui-source-test-"));
  const home = join(root, "home.svg");
  const solidHome = join(root, "solid-home.svg");
  writeFileSync(home, regular);
  writeFileSync(solidHome, regular);
  const solidFile = join(root, "solid.svg");
  writeFileSync(solidFile, solid);
  try {
    await expect(
      validateMynauiSources({ regular: [home], solid: [solidFile] }, { home: [] })
    ).rejects.toThrow("names differ");
    await expect(
      validateMynauiSources({ regular: [home, solidHome], solid: [home] }, { home: [] })
    ).rejects.toThrow("Duplicate MynaUI component or ID");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("MynaUI rejects malformed SVGs and mismatched tag coverage", async () => {
  const root = mkdtempSync(join(tmpdir(), "mynaui-svg-test-"));
  const file = join(root, "home.svg");
  const solidFile = join(root, "solid", "home.svg");
  mkdirSync(join(root, "solid"));
  writeFileSync(solidFile, solid);
  try {
    writeFileSync(file, "<svg><path></svg>");
    await expect(
      validateMynauiSources({ regular: [file], solid: [solidFile] }, { home: [] })
    ).rejects.toThrow("Malformed MynaUI SVG");
    writeFileSync(file, regular);
    await expect(
      validateMynauiSources({ regular: [file], solid: [solidFile] }, { missing: [] })
    ).rejects.toThrow("tags.json");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("MynaUI colors and 24px geometry remain in the generated icon tree", async () => {
  const outlined = await convertIconData(regular, undefined);
  const filled = await convertIconData(solid, undefined);
  expect(outlined.iconData.attr).toMatchObject({
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor"
  });
  expect(outlined.variant).toBe("outlined");
  expect(filled.iconData.attr).toMatchObject({ viewBox: "0 0 24 24", fill: "currentColor" });
  expect(filled.variant).toBe("filled");
});
