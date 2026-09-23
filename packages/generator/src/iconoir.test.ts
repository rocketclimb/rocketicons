import { expect, test } from "@jest/globals";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { listIconoirSources, validateIconoirSources } from "./iconoir";
import { convertIconData } from "./logics";

const regular =
  '<svg viewBox="0 0 24 24" fill="none"><path d="M1 1L2 2" stroke="currentColor"/></svg>';
const solid =
  '<svg viewBox="0 0 24 24" fill="none"><path d="M1 1L2 2" fill="currentColor"/></svg>';

test("Iconoir source listing is sorted and stable across regeneration", async () => {
  const root = mkdtempSync(join(tmpdir(), "iconoir-test-"));
  mkdirSync(join(root, "regular"));
  mkdirSync(join(root, "solid"));
  writeFileSync(join(root, "regular", "zebra.svg"), regular);
  writeFileSync(join(root, "regular", "home.svg"), regular);
  writeFileSync(join(root, "solid", "home.svg"), solid);
  try {
    const first = await listIconoirSources(root);
    expect(first.regular.map((file) => file.slice(root.length + 9))).toEqual([
      "home.svg",
      "zebra.svg"
    ]);
    expect(await listIconoirSources(root)).toEqual(first);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("Iconoir rejects missing styles and cross-style normalized collisions", async () => {
  await expect(validateIconoirSources({ regular: [], solid: ["home.svg"] })).rejects.toThrow(
    "nonempty"
  );
  const root = mkdtempSync(join(tmpdir(), "iconoir-collision-"));
  const regularFile = join(root, "solid-home.svg");
  const solidFile = join(root, "home.svg");
  writeFileSync(regularFile, regular);
  writeFileSync(solidFile, solid);
  try {
    await expect(
      validateIconoirSources({ regular: [regularFile], solid: [solidFile] })
    ).rejects.toThrow("Duplicate Iconoir component or ID");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("Iconoir rejects malformed SVG and retains path-level currentColor", async () => {
  const root = mkdtempSync(join(tmpdir(), "iconoir-malformed-"));
  const regularFile = join(root, "home.svg");
  const solidFile = join(root, "star.svg");
  writeFileSync(regularFile, "<svg><path></svg>");
  writeFileSync(solidFile, solid);
  try {
    await expect(
      validateIconoirSources({ regular: [regularFile], solid: [solidFile] })
    ).rejects.toThrow("Malformed Iconoir SVG");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }

  const outlined = await convertIconData(regular, undefined, true, true);
  const filled = await convertIconData(solid, undefined, true, true);
  expect(outlined.iconData.child[0].attr.stroke).toBe("currentColor");
  expect(outlined.iconData.child[0].attr.fill).toBe("none");
  expect(filled.iconData.child[0].attr.fill).toBe("currentColor");
  expect(filled.variant).toBe("filled");

  const mixed = await convertIconData(
    '<svg fill="none"><path d="M1 1L2 2" stroke="currentColor"/><path d="M2 2L3 3" fill="currentColor"/></svg>',
    undefined,
    true,
    true
  );
  expect(mixed.iconData.child[0].attr.fill).toBe("none");
  expect(mixed.iconData.child[1].attr.fill).toBe("currentColor");
});

test("Iconoir rejects SVGs with only empty groups", async () => {
  const root = mkdtempSync(join(tmpdir(), "iconoir-empty-"));
  const regularFile = join(root, "empty.svg");
  const solidFile = join(root, "star.svg");
  writeFileSync(regularFile, "<svg><g/></svg>");
  writeFileSync(solidFile, solid);
  try {
    await expect(
      validateIconoirSources({ regular: [regularFile], solid: [solidFile] })
    ).rejects.toThrow("Empty Iconoir SVG");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
