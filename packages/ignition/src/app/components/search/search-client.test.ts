import { describe, expect, jest, test } from "@jest/globals";

import { createMinimumLengthSearchClient } from "./search-client";
import { isSearchQueryReady, searchResultsMatchInput } from "./search-query";

describe("minimum-length Algolia search", () => {
  test("does not call Algolia for queries below the minimum length", async () => {
    const search = jest.fn(async () => ({ results: [] }));
    const searchClient = createMinimumLengthSearchClient({ search });

    const response = await searchClient.search([
      { indexName: "rocketicons", params: { query: "" } },
      { indexName: "rocketicons", params: { query: "ro" } },
      { indexName: "rocketicons", params: { query: "  r  " } }
    ]);

    expect(search).not.toHaveBeenCalled();
    expect(response.results).toEqual([
      expect.objectContaining({ hits: [], nbHits: 0, query: "" }),
      expect.objectContaining({ hits: [], nbHits: 0, query: "ro" }),
      expect.objectContaining({ hits: [], nbHits: 0, query: "r" })
    ]);
  });

  test("only sends ready queries and preserves response order", async () => {
    const search = jest.fn(async () => ({
      results: [{ hits: [{ objectID: "rocket" }], nbHits: 1, query: "rocket" }]
    }));
    const searchClient = createMinimumLengthSearchClient({ search });

    const response = await searchClient.search([
      { indexName: "rocketicons", params: { query: "ro" } },
      { indexName: "rocketicons", params: { query: " rocket " } }
    ]);

    expect(search).toHaveBeenCalledWith([
      { indexName: "rocketicons", params: { query: " rocket " } }
    ]);
    expect(response.results).toEqual([
      expect.objectContaining({ hits: [], nbHits: 0, query: "ro" }),
      expect.objectContaining({ nbHits: 1, query: "rocket" })
    ]);
  });

  test("only displays results for the current ready input", () => {
    expect(isSearchQueryReady("ro")).toBe(false);
    expect(isSearchQueryReady("  rocket  ")).toBe(true);
    expect(searchResultsMatchInput("ro", "rocket")).toBe(false);
    expect(searchResultsMatchInput("rockets", "rocket")).toBe(false);
    expect(searchResultsMatchInput("  rocket  ", "rocket")).toBe(true);
  });
});
