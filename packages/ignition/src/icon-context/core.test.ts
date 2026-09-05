import { describe, expect, test } from "@jest/globals";

import {
  buildContextArtifacts,
  iconSourceHash,
  jsonBytes,
  splitContextSource,
  validateContextSource
} from "./core";
import { ICON_CONTEXT_MAX_JSON_BYTES } from "./types";
import type { ContextSourceIcon, IconContextFamily, IconContextSource } from "./types";

const sourceIcon = (id: string, name = id): ContextSourceIcon => ({
  id,
  name,
  component: `Wi${id}`,
  variant: "full",
  iconTree: { tag: "svg", attr: { viewBox: "0 0 30 30" }, child: [] }
});

const family = (
  familyId: string,
  icons: ContextSourceIcon[],
  sourceHash = (icon: ContextSourceIcon) => iconSourceHash(icon)
): IconContextFamily => ({
  familyId,
  icons: icons.map((icon) => ({ id: icon.id, sourceHash: sourceHash(icon) })),
  description: {
    en: `A ${familyId} symbol for forecasts and weather dashboards.`,
    "pt-BR": `Um símbolo de ${familyId} para previsões e painéis meteorológicos.`
  },
  aliases: { en: [familyId], "pt-BR": [familyId] },
  searchTerms: {
    en: ["weather", "forecast", "dashboard"],
    "pt-BR": ["tempo", "previsão", "painel"]
  },
  negativeTerms: { en: [], "pt-BR": [] },
  primaryCategory: "weather",
  categories: ["weather", "status"],
  uiContexts: ["forecast", "dashboard", "travel"],
  roles: ["status"]
});

const contextSource = (
  collectionId: string,
  families: IconContextFamily[]
): IconContextSource => ({
  schemaVersion: 1,
  collectionId,
  promptVersion: 1,
  generatedAt: "2026-09-03",
  generator: "codex-agent",
  families
});

describe("icon context artifacts", () => {
  test("hashes the icon source and prompt contract deterministically", () => {
    const icon = sourceIcon("day-sunny", "Day Sunny");

    expect(iconSourceHash(icon)).toBe(iconSourceHash({ ...icon }));
    expect(iconSourceHash({ ...icon, name: "Sunny Day" })).not.toBe(iconSourceHash(icon));
  });

  test("publishes current metadata and reports missing, stale, and orphaned bindings", () => {
    const current = sourceIcon("current");
    const stale = sourceIcon("stale");
    const missing = sourceIcon("missing");
    const orphan = sourceIcon("orphan");
    const source = contextSource("wi", [
      family("current", [current]),
      family("stale", [stale], () => "0".repeat(64)),
      family("orphan", [orphan])
    ]);

    const result = buildContextArtifacts("wi", "1.2.3", [current, stale, missing], source);

    expect(result.icons.map(({ id }) => id)).toEqual(["current"]);
    expect(result.index.coverage).toEqual({
      total: 3,
      enriched: 1,
      missing: 1,
      stale: 1,
      orphaned: 1,
      complete: false
    });
  });

  test("uses an explicit single-file envelope for a small collection", () => {
    const icon = sourceIcon("umbrella");
    const result = buildContextArtifacts(
      "wi",
      "1.2.3",
      [icon],
      contextSource("wi", [family("umbrella", [icon])])
    );

    expect(result.chunks).toHaveLength(1);
    expect(result.index.storage).toMatchObject({
      mode: "single",
      url: "/ai/v1/collections/wi/context/data.json"
    });
    expect(result.chunks[0]).toMatchObject({
      kind: "rocketicons.icon-context-data",
      collectionId: "wi",
      chunk: 0
    });
  });

  test("chunks large public context envelopes below the hard byte limit", () => {
    const icons = Array.from({ length: 220 }, (_, index) => sourceIcon(`weather-${index}`));
    const result = buildContextArtifacts(
      "wi",
      "1.2.3",
      icons,
      contextSource("wi", [family("weather", icons)])
    );

    expect(result.chunks.length).toBeGreaterThan(1);
    expect(result.index.storage.mode).toBe("chunked");
    expect(result.chunks.every((chunk) => jsonBytes(chunk) <= ICON_CONTEXT_MAX_JSON_BYTES)).toBe(
      true
    );
  });

  test("validates and chunks source metadata without splitting a family", () => {
    const families = Array.from({ length: 220 }, (_, index) => {
      const icon = sourceIcon(`weather-${index}`);
      return family(`weather-${index}`, [icon]);
    });
    const source = contextSource("wi", families);

    validateContextSource(source);
    const chunks = splitContextSource(source);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.flatMap((chunk) => chunk.families)).toHaveLength(families.length);
    expect(chunks.every((chunk) => jsonBytes(chunk) <= ICON_CONTEXT_MAX_JSON_BYTES)).toBe(true);
  });
});
