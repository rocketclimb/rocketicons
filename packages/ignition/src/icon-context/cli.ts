import { existsSync, readFileSync } from "node:fs";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import sharp from "sharp";
import type { IconTree } from "rocketicons";

import {
  ICON_CONTEXT_SOURCE_ROOT,
  buildContextArtifacts,
  iconSourceHash,
  jsonBytes,
  loadContextSource,
  sha256,
  splitContextSource,
  validateContextSource
} from "./core";
import {
  ICON_CONTEXT_MAX_JSON_BYTES,
  ICON_CONTEXT_PROMPT_VERSION,
  ICON_CONTEXT_SCHEMA_VERSION
} from "./types";
import type { ContextSourceIcon, IconContextFamily, IconContextSource } from "./types";

const CACHE_ROOT = resolve("./.cache/icon-context");
const BATCH_SIZE = 50;
type ManifestIcon = { id: string; name: string; compName: string; variant: string };
type BatchFamily = {
  familyId: string;
  icons: Array<{
    id: string;
    name: string;
    component: string;
    variant: string;
    sourceHash: string;
  }>;
};
type BatchResponse = {
  schemaVersion: 1;
  collectionId: string;
  batchId: number;
  families: Array<Omit<IconContextFamily, "icons">>;
};

const collectionArg = () => {
  const id = process.argv[3]?.trim();
  if (!id || !/^[a-z0-9]+$/.test(id)) throw new Error("A collection id such as 'wi' is required");
  return id;
};

const loadIcons = (collectionId: string): ContextSourceIcon[] => {
  const manifestFile = resolve(`../icons/${collectionId}/manifest.js`);
  const svgRoot = resolve(`../generator/svgs/${collectionId}`);
  if (!existsSync(manifestFile) || !existsSync(svgRoot))
    throw new Error(`Unknown or unbuilt collection: ${collectionId}`);
  const manifest = require(manifestFile).manifest as { icons: Record<string, ManifestIcon> };
  return Object.values(manifest.icons)
    .map((icon) => ({
      id: icon.id,
      name: icon.name,
      component: icon.compName,
      variant: icon.variant,
      iconTree: JSON.parse(readFileSync(join(svgRoot, `${icon.id}.json`), "utf8")).iconTree
    }))
    .sort(({ id: a }, { id: b }) => a.localeCompare(b));
};

const familyIdFor = (icon: ContextSourceIcon) =>
  icon.name
    .toLowerCase()
    .replace(/\b(fill|filled|outline|outlined|solid|alt)\b/g, " ")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

const groupFamilies = (icons: ContextSourceIcon[]): BatchFamily[] => {
  const groups = new Map<string, BatchFamily>();
  for (const icon of icons) {
    const familyId = familyIdFor(icon) || icon.id;
    const family = groups.get(familyId) ?? { familyId, icons: [] };
    family.icons.push({
      id: icon.id,
      name: icon.name,
      component: icon.component,
      variant: icon.variant,
      sourceHash: iconSourceHash(icon)
    });
    groups.set(familyId, family);
  }
  return [...groups.values()].sort(({ familyId: a }, { familyId: b }) => a.localeCompare(b));
};

const xml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const attrName = (name: string) =>
  ({
    className: "class",
    strokeWidth: "stroke-width",
    fillRule: "fill-rule",
    clipRule: "clip-rule"
  })[name] ?? name;
const treeXml = (node: IconTree): string => {
  const attrs = Object.entries(node.attr ?? {})
    .filter(([, v]) => v != null)
    .map(([k, v]) => `${attrName(k)}="${xml(String(v))}"`)
    .join(" ");
  return `<${node.tag}${attrs ? ` ${attrs}` : ""}>${(node.child ?? []).map(treeXml).join("")}</${node.tag}>`;
};

const contactSheet = async (
  filename: string,
  families: BatchFamily[],
  icons: Map<string, ContextSourceIcon>
) => {
  const width = 1200;
  const cells = families
    .map((family, index) => {
      const icon = icons.get(family.icons[0].id)!;
      const tree = icon.iconTree as IconTree;
      const x = (index % 5) * 240;
      const y = Math.floor(index / 5) * 150;
      const body = (tree.child ?? []).map(treeXml).join("");
      return `<g transform="translate(${x} ${y})"><rect width="240" height="150" fill="white" stroke="#d1d5db"/><svg x="80" y="10" width="80" height="80" viewBox="${xml(String(tree.attr?.viewBox ?? "0 0 24 24"))}" fill="#111827">${body}</svg><text x="120" y="112" text-anchor="middle" font-family="sans-serif" font-size="14">${xml(family.familyId.slice(0, 30))}</text><text x="120" y="132" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#6b7280">${xml(icon.id.slice(0, 34))}</text></g>`;
    })
    .join("");
  const height = Math.ceil(families.length / 5) * 150;
  await sharp(
    Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${cells}</svg>`
    )
  )
    .png()
    .toFile(filename);
};

const reportStatus = (collectionId: string) => {
  const icons = loadIcons(collectionId);
  const source = loadContextSource(collectionId);
  const current = new Map(icons.map((icon) => [icon.id, iconSourceHash(icon)]));
  const saved = new Map(
    (source?.families ?? []).flatMap((family) =>
      family.icons.map((icon) => [icon.id, icon.sourceHash] as const)
    )
  );
  console.log(
    JSON.stringify(
      {
        collectionId,
        total: icons.length,
        families: groupFamilies(icons).length,
        enriched: [...current].filter(([id, hash]) => saved.get(id) === hash).length,
        missing: [...current.keys()].filter((id) => !saved.has(id)).length,
        stale: [...current].filter(([id, hash]) => saved.has(id) && saved.get(id) !== hash)
          .length,
        orphaned: [...saved.keys()].filter((id) => !current.has(id)).length,
        promptVersion: source?.promptVersion ?? null
      },
      null,
      2
    )
  );
};

const prepare = async (collectionId: string) => {
  const force = process.argv.includes("--force");
  const confirmed = process.argv.includes(`--confirm-force=${collectionId}`);
  if (force && !confirmed)
    throw new Error(`Forced regeneration requires --confirm-force=${collectionId}`);
  const icons = loadIcons(collectionId);
  const source = loadContextSource(collectionId);
  const saved = new Map(
    (source?.families ?? []).flatMap((family) =>
      family.icons.map((icon) => [icon.id, icon.sourceHash] as const)
    )
  );
  const pending = force
    ? icons
    : icons.filter((icon) => saved.get(icon.id) !== iconSourceHash(icon));
  const families = groupFamilies(pending);
  if (families.length > 500 && !process.argv.includes(`--confirm-large=${collectionId}`))
    throw new Error(
      `This run has ${families.length} families; confirm with --confirm-large=${collectionId}`
    );
  const batches = Array.from({ length: Math.ceil(families.length / BATCH_SIZE) }, (_, i) =>
    families.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE)
  );
  const runRoot = join(CACHE_ROOT, collectionId);
  const runHash = sha256(JSON.stringify({ force, families }));
  const previousRun = existsSync(join(runRoot, "run.json"))
    ? (JSON.parse(await readFile(join(runRoot, "run.json"), "utf8")) as { runHash?: string })
    : undefined;
  if (previousRun?.runHash !== runHash) await rm(runRoot, { recursive: true, force: true });
  await mkdir(join(runRoot, "responses"), { recursive: true });
  const iconMap = new Map(icons.map((icon) => [icon.id, icon]));
  for (let i = 0; i < batches.length; i += 1) {
    const input = join(runRoot, `batch-${i}.json`);
    const image = join(runRoot, `batch-${i}.png`);
    if (!existsSync(input))
      await writeFile(
        input,
        `${JSON.stringify({ schemaVersion: 1, collectionId, batchId: i, families: batches[i] }, null, 2)}\n`
      );
    if (!existsSync(image)) await contactSheet(image, batches[i], iconMap);
  }
  await writeFile(
    join(runRoot, "run.json"),
    `${JSON.stringify({ schemaVersion: 1, collectionId, force, icons: pending.length, families: families.length, batches: batches.length, batchSize: BATCH_SIZE, runHash }, null, 2)}\n`
  );
  console.log(
    JSON.stringify(
      {
        collectionId,
        runRoot,
        icons: pending.length,
        families: families.length,
        batches: batches.length
      },
      null,
      2
    )
  );
};

const responseFamilies = async (collectionId: string) => {
  const runRoot = join(CACHE_ROOT, collectionId);
  const run = JSON.parse(await readFile(join(runRoot, "run.json"), "utf8")) as {
    batches: number;
  };
  const families: IconContextFamily[] = [];
  for (let i = 0; i < run.batches; i += 1) {
    const input = JSON.parse(await readFile(join(runRoot, `batch-${i}.json`), "utf8")) as {
      families: BatchFamily[];
    };
    const output = JSON.parse(
      await readFile(join(runRoot, "responses", `batch-${i}.json`), "utf8")
    ) as BatchResponse;
    if (
      output.schemaVersion !== 1 ||
      output.collectionId !== collectionId ||
      output.batchId !== i
    )
      throw new Error(`Response identity mismatch for batch ${i}`);
    const responseIds = output.families.map(({ familyId }) => familyId);
    if (new Set(responseIds).size !== responseIds.length)
      throw new Error(`Duplicate response family in batch ${i}`);
    const metadata = new Map(output.families.map((family) => [family.familyId, family]));
    const inputIds = new Set(input.families.map(({ familyId }) => familyId));
    const extra = responseIds.filter((familyId) => !inputIds.has(familyId));
    if (extra.length)
      throw new Error(`Unexpected response family in batch ${i}: ${extra.join(", ")}`);
    for (const family of input.families) {
      const result = metadata.get(family.familyId);
      if (!result) throw new Error(`Missing response family: ${family.familyId}`);
      families.push({
        ...result,
        icons: family.icons.map(({ id, sourceHash }) => ({ id, sourceHash }))
      });
    }
  }
  return families;
};

const candidate = async (collectionId: string): Promise<IconContextSource> => {
  const generated: IconContextSource = {
    schemaVersion: ICON_CONTEXT_SCHEMA_VERSION,
    collectionId,
    promptVersion: ICON_CONTEXT_PROMPT_VERSION,
    generatedAt: new Date().toISOString().slice(0, 10),
    generator: "codex-agent",
    families: await responseFamilies(collectionId)
  };
  const existing = loadContextSource(collectionId);
  const replaced = new Set(
    generated.families.flatMap((family) => family.icons.map(({ id }) => id))
  );
  const retained = (existing?.families ?? [])
    .map((family) => ({ ...family, icons: family.icons.filter(({ id }) => !replaced.has(id)) }))
    .filter((family) => family.icons.length);
  const merged = new Map(generated.families.map((family) => [family.familyId, family]));
  for (const family of retained) {
    const replacement = merged.get(family.familyId);
    if (replacement) replacement.icons.push(...family.icons);
    else merged.set(family.familyId, family);
  }
  const value: IconContextSource = {
    ...generated,
    families: [...merged.values()].sort(({ familyId: a }, { familyId: b }) => a.localeCompare(b))
  };
  validateContextSource(value);
  const coverage = buildContextArtifacts(
    collectionId,
    "local-validation",
    loadIcons(collectionId),
    value
  ).index.coverage;
  if (!coverage.complete)
    throw new Error(
      `Context coverage is incomplete: ${coverage.missing} missing, ${coverage.stale} stale, ${coverage.orphaned} orphaned`
    );
  return value;
};

const validate = async (collectionId: string) => {
  const value = await candidate(collectionId);
  const chunks = splitContextSource(value);
  console.log(
    JSON.stringify(
      {
        collectionId,
        families: value.families.length,
        chunks: chunks.length,
        largestChunkBytes: Math.max(...chunks.map(jsonBytes), 0),
        maxBytes: ICON_CONTEXT_MAX_JSON_BYTES
      },
      null,
      2
    )
  );
  return value;
};

const apply = async (collectionId: string) => {
  if (!process.argv.includes("--reviewed"))
    throw new Error("Applying context requires explicit --reviewed confirmation");
  const value = await validate(collectionId);
  const chunks = splitContextSource(value);
  const target = join(ICON_CONTEXT_SOURCE_ROOT, collectionId);
  const staging = `${target}.next`;
  const backup = `${target}.previous`;
  await rm(staging, { recursive: true, force: true });
  await mkdir(staging, { recursive: true });
  for (let index = 0; index < chunks.length; index += 1)
    await writeFile(join(staging, `${index}.json`), `${JSON.stringify(chunks[index])}\n`);
  await writeFile(
    join(staging, "index.json"),
    `${JSON.stringify({ schemaVersion: ICON_CONTEXT_SCHEMA_VERSION, collectionId, promptVersion: ICON_CONTEXT_PROMPT_VERSION, chunks: chunks.map((_, index) => `${index}.json`) })}\n`
  );
  await rm(backup, { recursive: true, force: true });
  if (existsSync(target)) await rename(target, backup);
  await rename(staging, target);
  await rm(backup, { recursive: true, force: true });
  console.log(
    JSON.stringify(
      { collectionId, target, families: value.families.length, chunks: chunks.length },
      null,
      2
    )
  );
};

const main = async () => {
  const command = process.argv[2];
  const collectionId = collectionArg();
  if (command === "status") reportStatus(collectionId);
  else if (command === "prepare") await prepare(collectionId);
  else if (command === "validate") await validate(collectionId);
  else if (command === "apply") await apply(collectionId);
  else throw new Error("Use status, prepare, validate, or apply");
};
main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
