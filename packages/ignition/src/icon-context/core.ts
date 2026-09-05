import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { withSiteBasePath } from "@/config/site-origin";

import {
  ICON_CONTEXT_MAX_JSON_BYTES,
  ICON_CONTEXT_PROMPT_VERSION,
  ICON_CONTEXT_SCHEMA_VERSION
} from "./types";
import type {
  ContextDataEnvelope,
  ContextIndexEnvelope,
  ContextSourceIcon,
  IconContextFamily,
  IconContextSource,
  IconContextSourceIndex,
  PublicIconContext
} from "./types";

export const ICON_CONTEXT_SOURCE_ROOT = resolve("./icon-context");

const compare = (left: string, right: string) => (left < right ? -1 : left > right ? 1 : 0);
const json = (value: unknown) => `${JSON.stringify(value)}\n`;
export const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");
export const jsonBytes = (value: unknown) => Buffer.byteLength(json(value));

export const iconSourceHash = (icon: ContextSourceIcon) =>
  sha256(
    JSON.stringify({
      id: icon.id,
      name: icon.name,
      component: icon.component,
      variant: icon.variant,
      iconTree: icon.iconTree,
      schemaVersion: ICON_CONTEXT_SCHEMA_VERSION,
      promptVersion: ICON_CONTEXT_PROMPT_VERSION
    })
  );

const ensureStrings = (value: unknown, label: string, max: number) => {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || !item.trim()))
    throw new Error(`${label} must contain non-empty strings`);
  if (value.length > max) throw new Error(`${label} must contain at most ${max} values`);
  if (new Set(value.map((item) => item.toLocaleLowerCase())).size !== value.length)
    throw new Error(`${label} contains duplicates`);
};

export const validateContextSource = (source: IconContextSource, requireCurrentPrompt = true) => {
  if (source.schemaVersion !== ICON_CONTEXT_SCHEMA_VERSION)
    throw new Error(`Unsupported icon context schema: ${source.schemaVersion}`);
  if (requireCurrentPrompt && source.promptVersion !== ICON_CONTEXT_PROMPT_VERSION)
    throw new Error(`Unsupported icon context prompt: ${source.promptVersion}`);
  if (!Number.isInteger(source.promptVersion) || source.promptVersion < 1)
    throw new Error(`Invalid icon context prompt: ${source.promptVersion}`);
  if (!source.collectionId || source.generator !== "codex-agent" || !source.generatedAt)
    throw new Error("Icon context source provenance is incomplete");

  const families = new Set<string>();
  const icons = new Set<string>();
  for (const family of source.families) {
    if (!family.familyId || families.has(family.familyId))
      throw new Error(`Duplicate or empty family id: ${family.familyId}`);
    families.add(family.familyId);
    if (!family.description.en || family.description.en.length > 160)
      throw new Error(`${family.familyId} English description must be 1-160 characters`);
    if (!family.description["pt-BR"] || family.description["pt-BR"].length > 160)
      throw new Error(`${family.familyId} PT-BR description must be 1-160 characters`);
    ensureStrings(family.aliases.en, `${family.familyId}.aliases.en`, 12);
    ensureStrings(family.aliases["pt-BR"], `${family.familyId}.aliases.pt-BR`, 12);
    ensureStrings(family.searchTerms.en, `${family.familyId}.searchTerms.en`, 24);
    ensureStrings(family.searchTerms["pt-BR"], `${family.familyId}.searchTerms.pt-BR`, 24);
    ensureStrings(family.negativeTerms.en, `${family.familyId}.negativeTerms.en`, 8);
    ensureStrings(family.negativeTerms["pt-BR"], `${family.familyId}.negativeTerms.pt-BR`, 8);
    ensureStrings(family.categories, `${family.familyId}.categories`, 6);
    ensureStrings(family.uiContexts, `${family.familyId}.uiContexts`, 12);
    ensureStrings(family.roles, `${family.familyId}.roles`, 4);
    if (!family.categories.includes(family.primaryCategory))
      throw new Error(`${family.familyId} primaryCategory must occur in categories`);
    for (const icon of family.icons) {
      if (!icon.id || !/^[a-f0-9]{64}$/.test(icon.sourceHash) || icons.has(icon.id))
        throw new Error(`Invalid or duplicate icon binding: ${icon.id}`);
      icons.add(icon.id);
    }
  }
};

export const loadContextSource = (collectionId: string): IconContextSource | undefined => {
  const legacyFile = resolve(ICON_CONTEXT_SOURCE_ROOT, `${collectionId}.json`);
  const indexFile = resolve(ICON_CONTEXT_SOURCE_ROOT, collectionId, "index.json");
  if (!existsSync(legacyFile) && !existsSync(indexFile)) return undefined;
  if (existsSync(legacyFile)) {
    const source = JSON.parse(readFileSync(legacyFile, "utf8")) as IconContextSource;
    validateContextSource(source, false);
    if (jsonBytes(source) > ICON_CONTEXT_MAX_JSON_BYTES)
      throw new Error(
        `Context source ${legacyFile} exceeds ${ICON_CONTEXT_MAX_JSON_BYTES} bytes`
      );
    return source;
  }
  const index = JSON.parse(readFileSync(indexFile, "utf8")) as IconContextSourceIndex;
  if (
    index.schemaVersion !== ICON_CONTEXT_SCHEMA_VERSION ||
    !Number.isInteger(index.promptVersion) ||
    index.collectionId !== collectionId ||
    !Array.isArray(index.chunks)
  )
    throw new Error(`Invalid context source index: ${indexFile}`);
  if (jsonBytes(index) > ICON_CONTEXT_MAX_JSON_BYTES)
    throw new Error(
      `Context source index ${indexFile} exceeds ${ICON_CONTEXT_MAX_JSON_BYTES} bytes`
    );
  const sources = index.chunks.map((chunk) => {
    const filename = resolve(ICON_CONTEXT_SOURCE_ROOT, collectionId, chunk);
    const value = JSON.parse(readFileSync(filename, "utf8")) as IconContextSource;
    validateContextSource(value, false);
    if (
      value.collectionId !== collectionId ||
      value.promptVersion !== index.promptVersion ||
      jsonBytes(value) > ICON_CONTEXT_MAX_JSON_BYTES
    )
      throw new Error(`Invalid or oversized context source chunk: ${filename}`);
    return value;
  });
  const source: IconContextSource = {
    schemaVersion: ICON_CONTEXT_SCHEMA_VERSION,
    collectionId,
    promptVersion: index.promptVersion,
    generatedAt:
      sources
        .map(({ generatedAt }) => generatedAt)
        .sort()
        .at(-1) ?? "unknown",
    generator: "codex-agent",
    families: sources.flatMap(({ families }) => families)
  };
  validateContextSource(source, false);
  return source;
};

export const splitContextSource = (source: IconContextSource): IconContextSource[] => {
  const chunks: IconContextSource[] = [];
  let families: IconContextFamily[] = [];
  const envelope = (items: IconContextFamily[]): IconContextSource => ({
    ...source,
    families: items
  });
  for (const family of source.families) {
    const candidate = [...families, family];
    if (families.length && jsonBytes(envelope(candidate)) > ICON_CONTEXT_MAX_JSON_BYTES) {
      chunks.push(envelope(families));
      families = [family];
    } else families = candidate;
  }
  if (families.length) chunks.push(envelope(families));
  for (const chunk of chunks)
    if (jsonBytes(chunk) > ICON_CONTEXT_MAX_JSON_BYTES)
      throw new Error(
        `A context source family cannot fit within ${ICON_CONTEXT_MAX_JSON_BYTES} bytes`
      );
  return chunks;
};

const visual = (icon: ContextSourceIcon) => {
  const words = `${icon.id} ${icon.name} ${icon.variant}`.toLocaleLowerCase();
  return {
    filled: /\b(fill|filled|solid)\b/.test(words),
    outlined: /\b(outline|outlined|line)\b/.test(words),
    directional: /\b(up|down|left|right|north|south|east|west|direction|wind)\b/.test(words),
    brand: /\b(brand|logo|social)\b/.test(words),
    multicolor: icon.variant === "color",
    strokeSupport: JSON.stringify(icon.iconTree).includes('"stroke"')
  };
};

const materialize = (
  family: IconContextFamily,
  binding: IconContextFamily["icons"][number],
  icon: ContextSourceIcon
): PublicIconContext => ({
  id: binding.id,
  familyId: family.familyId,
  sourceHash: binding.sourceHash,
  description: family.description,
  aliases: family.aliases,
  searchTerms: family.searchTerms,
  negativeTerms: family.negativeTerms,
  primaryCategory: family.primaryCategory,
  categories: family.categories,
  uiContexts: family.uiContexts,
  roles: family.roles,
  variant: icon.variant,
  visual: visual(icon)
});

const topics = (icons: PublicIconContext[]) =>
  [...new Set(icons.flatMap((icon) => [icon.primaryCategory, ...icon.uiContexts]))].sort(compare);

const makeEnvelope = (collectionId: string, chunk: number, icons: PublicIconContext[]) =>
  ({
    schemaVersion: ICON_CONTEXT_SCHEMA_VERSION,
    kind: "rocketicons.icon-context-data",
    collectionId,
    chunk,
    icons
  }) satisfies ContextDataEnvelope;

const splitByBytes = (collectionId: string, icons: PublicIconContext[]) => {
  const groups: PublicIconContext[][] = [];
  let current: PublicIconContext[] = [];
  for (const icon of icons) {
    const candidate = [...current, icon];
    if (
      current.length &&
      jsonBytes(makeEnvelope(collectionId, groups.length, candidate)) >
        ICON_CONTEXT_MAX_JSON_BYTES
    ) {
      groups.push(current);
      current = [icon];
    } else current = candidate;
  }
  if (current.length) groups.push(current);
  return groups.map((group, chunk) => makeEnvelope(collectionId, chunk, group));
};

export const buildContextArtifacts = (
  collectionId: string,
  packageVersion: string,
  icons: ContextSourceIcon[],
  source = loadContextSource(collectionId)
) => {
  const iconById = new Map(icons.map((icon) => [icon.id, icon]));
  const materialized: PublicIconContext[] = [];
  let stale = 0;
  let orphaned = 0;
  const bound = new Set<string>();

  for (const family of source?.families ?? []) {
    for (const binding of family.icons) {
      const icon = iconById.get(binding.id);
      if (!icon) {
        orphaned += 1;
        continue;
      }
      bound.add(binding.id);
      if (binding.sourceHash !== iconSourceHash(icon)) {
        stale += 1;
        continue;
      }
      materialized.push(materialize(family, binding, icon));
    }
  }
  materialized.sort(({ id: left }, { id: right }) => compare(left, right));
  const missing = icons.length - bound.size;
  const coverage = {
    total: icons.length,
    enriched: materialized.length,
    missing,
    stale,
    orphaned,
    complete: materialized.length === icons.length && stale === 0 && orphaned === 0
  };
  const base = `/ai/v1/collections/${collectionId}/context`;
  const chunks = splitByBytes(collectionId, materialized);
  const index: ContextIndexEnvelope = {
    schemaVersion: ICON_CONTEXT_SCHEMA_VERSION,
    kind: "rocketicons.icon-context-index",
    collectionId,
    packageVersion,
    promptVersion: source?.promptVersion ?? null,
    coverage,
    storage:
      chunks.length === 0
        ? { mode: "none" }
        : chunks.length === 1
          ? {
              mode: "single",
              url: withSiteBasePath(`${base}/data.json`),
              bytes: jsonBytes(chunks[0]),
              sha256: sha256(json(chunks[0]))
            }
          : {
              mode: "chunked",
              maxBytes: ICON_CONTEXT_MAX_JSON_BYTES,
              chunks: chunks.map((chunk) => ({
                id: chunk.chunk,
                url: withSiteBasePath(`${base}/${chunk.chunk}.json`),
                count: chunk.icons.length,
                bytes: jsonBytes(chunk),
                sha256: sha256(json(chunk)),
                topics: topics(chunk.icons)
              }))
            }
  };
  if (jsonBytes(index) > ICON_CONTEXT_MAX_JSON_BYTES)
    throw new Error(
      `Context index for ${collectionId} exceeds ${ICON_CONTEXT_MAX_JSON_BYTES} bytes`
    );
  return { index, chunks, icons: materialized };
};
