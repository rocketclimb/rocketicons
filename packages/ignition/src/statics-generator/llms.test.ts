import { afterEach, describe, expect, test } from "@jest/globals";
import catalog from "../../public/ai/v1/catalog.json";
import { CANONICAL_PRODUCT_MESSAGE } from "@/config/product-content";
import type { StaticCatalog } from "@/catalog/types";
import { renderLlms, renderLlmsFull } from "./llms";

const staticCatalog = catalog as StaticCatalog;

describe("LLM discovery files", () => {
  const previousOrigin = process.env.SITE_ORIGIN;

  afterEach(() => {
    if (previousOrigin === undefined) delete process.env.SITE_ORIGIN;
    else process.env.SITE_ORIGIN = previousOrigin;
  });

  test.each([renderLlms, renderLlmsFull])("publishes accurate catalog guidance", (render) => {
    const content = render(staticCatalog);

    expect(content).toContain(CANONICAL_PRODUCT_MESSAGE);
    expect(content).toContain(`Catalog/package version: ${staticCatalog.packageVersion}`);
    expect(content).toContain("/ai/v1/catalog.json");
    expect(content).toMatch(/license|licensing/i);
    expect(content).not.toMatch(/https?:\/\/rocketicons\.io/);
    expect(content).not.toContain("rocketicons add @lu/rocket @lu/search");
    expect(content).not.toMatch(/MCP (server|tools?) (is|are) available/i);
  });

  test("concise file documents current limitations", () => {
    const content = renderLlms(staticCatalog);

    expect(content).toContain("adds one icon per command");
    expect(content).toContain("MCP support is planned and is not currently available");
  });

  test("includes the configured deployment base path", () => {
    process.env.SITE_ORIGIN = "https://rocketclimb.github.io/rocketicons";
    const content = renderLlms(staticCatalog);

    expect(content).toContain("/rocketicons/ai/v1/catalog.json");
    expect(content).toContain("/rocketicons/llms-full.txt");
  });

  test("full guide uses exact catalog icon IDs", () => {
    const content = renderLlmsFull(staticCatalog);

    expect(content).toContain("npx @rocketicons/cli add @lu/lu-rocket");
    expect(content).toContain("npx @rocketicons/cli add @lu/lu-search");
    expect(content).not.toContain("npx @rocketicons/cli add @lu/rocket");
    expect(content).not.toContain("npx @rocketicons/cli add @lu/search");
  });
});
