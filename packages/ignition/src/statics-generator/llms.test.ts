import { afterEach, beforeEach, describe, expect, test } from "@jest/globals";
import catalog from "../../public/ai/v1/catalog.json";
import { CANONICAL_PRODUCT_MESSAGE } from "@/config/product-content";
import type { StaticCatalog } from "@/catalog/types";
import { renderLlms, renderLlmsFull } from "./llms";

const staticCatalog = catalog as StaticCatalog;

describe("LLM discovery files", () => {
  const previousOrigin = process.env.SITE_ORIGIN;

  beforeEach(() => {
    process.env.SITE_ORIGIN = "https://rocket.example";
  });

  afterEach(() => {
    if (previousOrigin === undefined) delete process.env.SITE_ORIGIN;
    else process.env.SITE_ORIGIN = previousOrigin;
  });

  test.each([renderLlms, renderLlmsFull])("publishes accurate catalog guidance", (render) => {
    const content = render(staticCatalog);

    expect(content).toContain(CANONICAL_PRODUCT_MESSAGE);
    expect(content).toContain(`Catalog/package version: ${staticCatalog.packageVersion}`);
    expect(content).toContain("/ai/v1/catalog.json");
    expect(content).toContain("/ai/v1/capabilities.json");
    expect(content).toContain("contextIndexUrl");
    expect(content).toContain("negativeTerms");
    expect(content).toMatch(/license|licensing/i);
    expect(content).not.toMatch(/https?:\/\/rocketicons\.io/);
    expect(content).not.toContain("rocketicons add @lu/rocket @lu/search");
    expect(content).toContain("@rocketicons/mcp");
    expect(content).toContain("plan_project_upgrade");
    expect(content).toContain("apply_project_upgrade");
    expect(content).toContain("upgrade --plan-id <planId>");
    expect(content).toContain("rocketicons@0.4.0");
    expect(content).toContain("@rocketicons/mcp@0.2.0");
    expect(content).toContain("Check that the required version is published");
    expect(content).toContain("npx --no-install rocketicons mcp");
    expect(content).toContain("recommend_icons");
    expect(content).toContain("plan_icons");
    expect(content).toContain("apply_icons");
    expect(content).not.toMatch(/await.*(?:publication|npm release)|Until then/);
  });

  test("concise file documents the current workflow", () => {
    const content = renderLlms(staticCatalog);

    expect(content).toContain("batch adds");
    expect(content).toContain("MCP");
  });

  test("includes the configured deployment base path", () => {
    process.env.SITE_ORIGIN = "https://rocketclimb.github.io/rocketicons";
    const content = renderLlms(staticCatalog);

    expect(content).toContain(
      "[Static catalog](https://rocketclimb.github.io/rocketicons/ai/v1/catalog.json)"
    );
    expect(content).toContain(
      "[Expanded machine-readable guide](https://rocketclimb.github.io/rocketicons/llms-full.txt)"
    );
  });

  test.each([renderLlms, renderLlmsFull])(
    "publishes parseable absolute resource links",
    (render) => {
      const content = render(staticCatalog);
      expect(content).toMatch(/^# Rocketicons\n/);
      const links = [...content.matchAll(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g)];
      expect(links.length).toBeGreaterThanOrEqual(8);
      for (const [, label, href] of links) {
        expect(label.trim()).not.toBe("");
        expect(new URL(href).origin).toBe("https://rocket.example");
      }
      expect(content).toContain(
        "[Agent workflow](https://rocket.example/en/docs/agent-workflows/)"
      );
    }
  );

  test("full guide uses exact catalog icon IDs", () => {
    const content = renderLlmsFull(staticCatalog);

    expect(content).toContain("npx rocketicons add @lu/lu-rocket @lu/lu-search");
    expect(content).not.toContain("npx @rocketicons/cli");
    expect(content).not.toContain("npx rocketicons add @lu/rocket");
    expect(content).not.toContain("npx rocketicons add @lu/search");
  });
});
